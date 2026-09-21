/**
 * 效果冒烟测试：用无头 Chromium 逐个打开全部效果（按详情页同款烘焙：默认参数、深色底、预览 runtime），
 * 模拟一轮基本交互后判定三件事——
 *   1. 没有未捕获异常 / console.error / 加载失败的资源
 *   2. 没有向站外发请求（契约：零依赖、零外链；字体与示例图来自本站 public/）
 *   3. 画面不是一片空白（渲染出来的像素里至少有一小部分不是底色）
 * SMOKE_DEBUG 下另对 thumb.mode = live（自身一直在动）的效果做一次前后帧对比，静止不动的列出来供人工复核、不算失败。
 *
 * 用法：
 *   pnpm smoke                    全部效果
 *   pnpm smoke ball-pit rain-on-glass   只跑指定 slug
 *   pnpm smoke --shard=2/4         只跑第 2/4 片（按排序后的序号交错切分，CI 用多台 runner 并行）
 *   SMOKE_WORKERS=6 pnpm smoke     并发页数（默认 min(4, CPU 核数)；软件渲染下每页吃满一核，多开只会互相拖慢）
 *   SMOKE_SHOTS=1 pnpm smoke       失败效果的截图存到系统临时目录（SMOKE_SHOTS_DIR 可改目录）
 *   SMOKE_VIEWPORT=960x540 pnpm smoke   视口（默认 1280x720）
 *   SMOKE_DEBUG=1 pnpm smoke       打印各阶段耗时与静止的 live 效果
 * 首次运行前需要安装浏览器：pnpm exec playwright install chromium
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, type Browser, type BrowserContext, type Page } from 'playwright';
import { effectMetaSchema } from '../src/contract/schema.ts';
import type { EffectMeta } from '../src/contract/types.ts';
import { BG_DARK } from '../src/contract/types.ts';
import { FONTS_CSS_HREF } from '../src/contract/fonts.ts';
import { bakeCode } from '../src/engine/bakeCode.ts';
import { defaultValues } from '../src/engine/urlState.ts';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const effectsDir = path.join(root, 'effects');
const publicDir = path.join(root, 'public');

/** 假域名：所有请求经 route 拦截，本站资源从 public/ 读，其余一律记为外链 */
const ORIGIN = 'http://mt-smoke.local';
/** 视口默认取卡片的 1280×720 设计视口；软件渲染的着色器效果耗时与像素数成正比，CI 用 SMOKE_VIEWPORT=800x450 减负 */
const VIEWPORT = parseViewport(process.env.SMOKE_VIEWPORT) ?? { width: 1280, height: 720 };
const WORKERS = Math.max(
  1,
  Number(process.env.SMOKE_WORKERS) || Math.min(4, os.availableParallelism()),
);
const SAVE_SHOTS = !!process.env.SMOKE_SHOTS;
const SHOTS_DIR = process.env.SMOKE_SHOTS_DIR || path.join(os.tmpdir(), 'mt-smoke');
const DEBUG = !!process.env.SMOKE_DEBUG;
/** 单个效果的上限：本机重效果 10s 上下，2 核 CI runner 软件渲染下重着色器一帧要几秒，留足余量；真正卡死的仍会被拦下 */
const PER_EFFECT_TIMEOUT_MS = 120_000;

function parseViewport(s: string | undefined): { width: number; height: number } | undefined {
  const m = s && /^(\d+)x(\d+)$/.exec(s);
  return m ? { width: Number(m[1]), height: Number(m[2]) } : undefined;
}
/** 非底色像素占比低于此值视为空白：0.02% ≈ 1280×720 里一块 14×14 的点；小型加载动画约 0.05%+ */
const BLANK_THRESHOLD = 0.0002;
/** 截图用 JPEG：比 PNG 快好几倍、体积小一个量级；统计时颜色量化到 8 级，压缩噪声不影响判定 */
const SHOT = { type: 'jpeg', quality: 60 } as const;

const MIME: Record<string, string> = {
  '.css': 'text/css; charset=utf-8',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.txt': 'text/plain; charset=utf-8',
};

interface Target {
  meta: EffectMeta;
  html: string;
}

interface Result {
  slug: string;
  name: string;
  errors: string[];
  external: string[];
  blank: boolean;
  nonBg: number;
  frozen: boolean;
  ms: number;
}

/** 解析 --shard=i/n（i 从 1 起）；未指定则跑全部 */
function parseShard(argv: string[]): { index: number; total: number } | undefined {
  const arg = argv.find((a) => a.startsWith('--shard='));
  if (!arg) return undefined;
  const m = /^--shard=(\d+)\/(\d+)$/.exec(arg);
  const index = m ? Number(m[1]) : 0;
  const total = m ? Number(m[2]) : 0;
  if (!m || index < 1 || total < 1 || index > total) {
    console.error(`--shard 格式应为 i/n（1 ≤ i ≤ n），收到：${arg}`);
    process.exit(1);
  }
  return { index, total };
}

function loadTargets(only: string[], shard?: { index: number; total: number }): Target[] {
  const dirs = readdirSync(effectsDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .filter((slug) => only.length === 0 || only.includes(slug))
    .sort()
    // 交错切片：相邻的重效果（同一批 GLSL 往往 slug 相近）分散到不同片
    .filter((_, i) => !shard || i % shard.total === shard.index - 1);
  return dirs.map((slug) => {
    const meta = effectMetaSchema.parse(
      JSON.parse(readFileSync(path.join(effectsDir, slug, 'meta.json'), 'utf8')),
    );
    const raw = readFileSync(path.join(effectsDir, slug, 'index.html'), 'utf8');
    const html = bakeCode({
      meta,
      html: raw,
      values: defaultValues(meta),
      bg: BG_DARK,
      mode: 'preview',
      fontsCssHref: FONTS_CSS_HREF,
    });
    return { meta, html };
  });
}

/**
 * 浏览器侧的截图统计（在独立空白页里执行）：解码 PNG，每 4 个像素取 1 个，
 * 底色取出现最多的颜色（量化到 8 级），返回非底色像素占比与相对上一帧的变化占比。
 * 写成源码字符串再 new Function：tsx 编译会给函数表达式包一层 __name 助手，
 * Playwright 把函数 toString 送进浏览器后会找不到它。
 */
const ANALYZE_SRC = `
  const [b64, prevB64] = input;
  async function load(b) {
    const img = new Image();
    img.src = 'data:image/jpeg;base64,' + b;
    await img.decode();
    const c = document.createElement('canvas');
    c.width = img.width;
    c.height = img.height;
    const ctx = c.getContext('2d');
    ctx.drawImage(img, 0, 0);
    return ctx.getImageData(0, 0, c.width, c.height).data;
  }
  const d = await load(b64);
  const p = prevB64 ? await load(prevB64) : null;
  const STEP = 16;
  // 底色：先按 8 级量化找出现最多的颜色桶，再取桶内像素的平均 RGB 作为精确底色
  const key = (i) => ((d[i] >> 5) << 6) | ((d[i + 1] >> 5) << 3) | (d[i + 2] >> 5);
  const buckets = new Map();
  let n = 0;
  for (let i = 0; i < d.length; i += STEP) {
    const k = key(i);
    buckets.set(k, (buckets.get(k) || 0) + 1);
    n++;
  }
  let bg = 0, bgCount = -1;
  for (const [k, c] of buckets) if (c > bgCount) { bg = k; bgCount = c; }
  let r = 0, g = 0, b = 0;
  for (let i = 0; i < d.length; i += STEP) {
    if (key(i) === bg) { r += d[i]; g += d[i + 1]; b += d[i + 2]; }
  }
  r /= bgCount; g /= bgCount; b /= bgCount;
  // 非底色：任一通道与底色相差超过 12（JPEG 平坦区噪声一般在 ±6 内），暗底上的暗灰细线也算得上
  let nonBg = 0, changed = 0;
  for (let i = 0; i < d.length; i += STEP) {
    const dist = Math.max(Math.abs(d[i] - r), Math.abs(d[i + 1] - g), Math.abs(d[i + 2] - b));
    if (dist > 12) nonBg++;
    if (p) {
      const diff = Math.abs(d[i] - p[i]) + Math.abs(d[i + 1] - p[i + 1]) + Math.abs(d[i + 2] - p[i + 2]);
      if (diff > 24) changed++;
    }
  }
  return { nonBg: nonBg / n, changed: p ? changed / n : 0 };
`;
const analyzeInBrowser = new Function('input', `return (async () => {${ANALYZE_SRC}})();`) as (
  input: [string, string],
) => Promise<{ nonBg: number; changed: number }>;

async function analyze(
  lab: Page,
  shot: Buffer,
  prev?: Buffer,
): Promise<{ nonBg: number; changed: number }> {
  const input: [string, string] = [shot.toString('base64'), prev ? prev.toString('base64') : ''];
  return lab.evaluate(analyzeInBrowser, input);
}

async function runOne(context: BrowserContext, lab: Page, t: Target): Promise<Result> {
  const { meta } = t;
  const started = Date.now();
  const errors: string[] = [];
  const external: string[] = [];
  const page = await context.newPage();
  // 单步动作（截图、鼠标）不单独设 30s 上限：重效果在软件渲染下一帧就要几百毫秒，统一交给整体超时兜底
  page.setDefaultTimeout(PER_EFFECT_TIMEOUT_MS);
  page.on('pageerror', (e) => errors.push(`异常: ${e.message}`));
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(`console.error: ${m.text()}`);
  });
  page.on('requestfailed', (r) => {
    // 站外请求由 route 主动中止并单独记录，这里只记本站资源的失败
    if (r.url().startsWith(ORIGIN))
      errors.push(`资源加载失败: ${r.url()} ${r.failure()?.errorText}`);
  });
  page.on('request', (r) => {
    if (
      !r.url().startsWith(ORIGIN) &&
      !r.url().startsWith('data:') &&
      !r.url().startsWith('blob:')
    ) {
      external.push(r.url());
    }
  });

  let blank = false;
  let nonBg = 1;
  let frozen = false;
  let shotA: Buffer | undefined;
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(
      () => reject(new Error(`超时 ${PER_EFFECT_TIMEOUT_MS / 1000}s`)),
      PER_EFFECT_TIMEOUT_MS,
    ),
  );
  const phases: string[] = [];
  let mark = Date.now();
  const lap = (label: string) => {
    const now = Date.now();
    phases.push(`${label} ${now - mark}ms`);
    mark = now;
  };
  try {
    await Promise.race([
      (async () => {
        await page.goto(`${ORIGIN}/e/${meta.slug}.html`, { waitUntil: 'load' });
        lap('load');
        await page.waitForTimeout(400);
        // 一轮基本交互：鼠标划过画面中部（悬停类），点击类点一下，滚动类滚两屏。
        // 每个输入事件都要等页面跑完一帧才算送达，重着色器在软件渲染下一帧要好几秒，事件数从简：
        // 进入画面 + 移动一次足以触发 mouseenter / mousemove 类逻辑
        const cx = VIEWPORT.width / 2;
        const cy = VIEWPORT.height / 2;
        await page.mouse.move(cx, cy);
        await page.mouse.move(cx + 160, cy + 60);
        if (meta.sub === 'click') {
          await page.mouse.click(cx, cy);
        }
        if (meta.sub === 'scroll' || meta.sub === 'stack-scroll') {
          await page.mouse.wheel(0, 600);
          await page.waitForTimeout(200);
          await page.mouse.wheel(0, 600);
        }
        await page.waitForTimeout(500);
        lap('interact');
        shotA = await page.screenshot(SHOT);
        lap('shotA');
        let a = await analyze(lab, shotA);
        lap('analyzeA');
        if (a.nonBg < BLANK_THRESHOLD) {
          // 逐字浮现、打字机这类循环效果有「全部隐去」的瞬间，隔一秒再采一帧，两帧都空才算空白
          await page.waitForTimeout(1200);
          shotA = await page.screenshot(SHOT);
          a = await analyze(lab, shotA);
          lap('blankRetry');
        }
        nonBg = a.nonBg;
        blank = a.nonBg < BLANK_THRESHOLD;
        // 前后帧对比只作参考、不判失败，且多花一帧；只在调试时做
        if (DEBUG && meta.thumb.mode === 'live') {
          await page.waitForTimeout(300);
          const shotB = await page.screenshot(SHOT);
          const b = await analyze(lab, shotB, shotA);
          frozen = b.changed === 0;
          lap('liveness');
        }
      })(),
      timeout,
    ]);
  } catch (e) {
    errors.push(e instanceof Error ? e.message : String(e));
  }
  if (DEBUG) console.log(`  · ${meta.slug}: ${phases.join(' / ')}`);

  if (SAVE_SHOTS && shotA && (errors.length > 0 || external.length > 0 || blank)) {
    mkdirSync(SHOTS_DIR, { recursive: true });
    writeFileSync(path.join(SHOTS_DIR, `${meta.slug}.jpg`), shotA);
  }
  await page.close().catch(() => {});
  return {
    slug: meta.slug,
    name: meta.name,
    errors,
    external: [...new Set(external)],
    blank,
    nonBg,
    frozen,
    ms: Date.now() - started,
  };
}

async function main() {
  const only = process.argv.slice(2).filter((a) => !a.startsWith('-'));
  const shard = parseShard(process.argv.slice(2));
  const targets = loadTargets(only, shard);
  if (targets.length === 0) {
    console.error('没有匹配的效果');
    process.exit(1);
  }
  const bySlug = new Map(targets.map((t) => [t.meta.slug, t]));

  let browser: Browser;
  try {
    browser = await chromium.launch({
      args: [
        '--use-gl=angle',
        '--use-angle=swiftshader',
        '--enable-unsafe-swiftshader',
        '--ignore-gpu-blocklist',
        '--autoplay-policy=no-user-gesture-required',
      ],
    });
  } catch (e) {
    console.error('无法启动 Chromium，请先执行：pnpm exec playwright install chromium');
    console.error(e instanceof Error ? e.message : e);
    process.exit(1);
  }

  const context = await browser.newContext({ viewport: VIEWPORT, deviceScaleFactor: 1 });
  await context.route('**/*', async (route) => {
    const url = new URL(route.request().url());
    if (url.origin !== ORIGIN) {
      await route.abort('blockedbyclient');
      return;
    }
    const m = /^\/e\/([a-z0-9-]+)\.html$/.exec(url.pathname);
    if (m) {
      const t = bySlug.get(m[1]);
      if (!t) return route.fulfill({ status: 404, body: 'not found' });
      return route.fulfill({
        status: 200,
        contentType: 'text/html; charset=utf-8',
        body: t.html,
      });
    }
    // 其余按 public/ 静态文件服务（字体、示例图）
    const file = path.join(publicDir, decodeURIComponent(url.pathname));
    if (!file.startsWith(publicDir) || !existsSync(file)) {
      return route.fulfill({ status: 404, body: 'not found' });
    }
    return route.fulfill({
      status: 200,
      contentType: MIME[path.extname(file)] ?? 'application/octet-stream',
      body: readFileSync(file),
    });
  });
  const lab = await context.newPage();

  console.log(
    `冒烟测试 ${targets.length} 个效果${shard ? `（第 ${shard.index}/${shard.total} 片）` : ''}，${WORKERS} 路并发（${os.availableParallelism()} 核）……`,
  );
  const queue = [...targets];
  const results: Result[] = [];
  const t0 = Date.now();
  await Promise.all(
    Array.from({ length: Math.min(WORKERS, queue.length) }, async () => {
      for (;;) {
        const t = queue.shift();
        if (!t) return;
        const r = await runOne(context, lab, t);
        results.push(r);
        const failed = r.errors.length > 0 || r.external.length > 0 || r.blank;
        const mark = failed ? '✗' : '✓';
        const notes = [
          ...r.errors,
          ...r.external.map((u) => `外链: ${u}`),
          ...(r.blank ? [`空白画面（非底色像素 ${(r.nonBg * 100).toFixed(2)}%）`] : []),
        ];
        console.log(
          `${mark} ${r.slug}（${r.name}） ${r.ms}ms${notes.length ? '\n    ' + notes.join('\n    ') : ''}`,
        );
      }
    }),
  );
  await browser.close();

  results.sort((a, b) => a.slug.localeCompare(b.slug));
  const failures = results.filter((r) => r.errors.length > 0 || r.external.length > 0 || r.blank);
  const frozen = results.filter((r) => r.frozen && !failures.includes(r));
  console.log(
    `\n${results.length} 个效果，${failures.length} 个失败，用时 ${Math.round((Date.now() - t0) / 1000)}s`,
  );
  // 静止不算失败：轮播、打字机这类 live 效果本来就有几秒的停顿；只在调试时列出来供人工复核
  if (DEBUG && frozen.length > 0) {
    console.log(
      `提示：${frozen.length} 个标记为 live 的效果在 300ms 内画面没有变化：\n  ${frozen
        .map((r) => r.slug)
        .join(', ')}`,
    );
  }
  if (failures.length > 0) {
    console.log('\n失败：');
    for (const r of failures) console.log(`  ${r.slug}（${r.name}）`);
    if (SAVE_SHOTS) console.log(`截图见 ${SHOTS_DIR}`);
    process.exit(1);
  }
}

await main();
