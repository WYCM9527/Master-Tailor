/**
 * 作者契约校验：检查 effects/<slug>/ 三件套是否符合规范。
 * 用法：pnpm validate（prebuild 与 CI 会自动执行），任一错误则退出码非 0。
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { effectMetaSchema } from '../src/contract/schema.ts';
import { FONTS } from '../src/contract/fonts.ts';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const effectsDir = path.join(root, 'effects');

const fontIds = new Set(FONTS.map((f) => f.id));
let errorCount = 0;

function fail(slug: string, message: string) {
  errorCount++;
  console.error(`  ✗ [${slug}] ${message}`);
}

const dirs = existsSync(effectsDir)
  ? readdirSync(effectsDir, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name)
      .sort()
  : [];

if (dirs.length === 0) {
  console.error('effects/ 下没有任何效果目录');
  process.exit(1);
}

console.log(`校验 ${dirs.length} 个效果……`);

for (const slug of dirs) {
  const dir = path.join(effectsDir, slug);
  const metaPath = path.join(dir, 'meta.json');
  const htmlPath = path.join(dir, 'index.html');
  const mdPath = path.join(dir, 'prompt.md');

  // ---- 三件套齐全 ----
  for (const [p, name] of [
    [metaPath, 'meta.json'],
    [htmlPath, 'index.html'],
    [mdPath, 'prompt.md'],
  ] as const) {
    if (!existsSync(p)) fail(slug, `缺少 ${name}`);
  }
  if (!existsSync(metaPath) || !existsSync(htmlPath) || !existsSync(mdPath)) continue;

  // ---- meta.json 合法 ----
  let metaRaw: unknown;
  try {
    metaRaw = JSON.parse(readFileSync(metaPath, 'utf8'));
  } catch (e) {
    fail(slug, `meta.json 不是合法 JSON：${(e as Error).message}`);
    continue;
  }
  const parsed = effectMetaSchema.safeParse(metaRaw);
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      fail(slug, `meta.json ${issue.path.join('.')}: ${issue.message}`);
    }
    continue;
  }
  const meta = parsed.data;
  if (meta.slug !== slug) fail(slug, `meta.slug（${meta.slug}）与目录名不一致`);

  const html = readFileSync(htmlPath, 'utf8');
  const md = readFileSync(mdPath, 'utf8');

  // ---- index.html 硬性规范 ----
  if (!/--mt-bg\s*:/.test(html)) fail(slug, 'index.html 缺少 --mt-bg 声明（预览底色切换依赖它）');
  if (!html.includes('prefers-reduced-motion')) {
    fail(slug, 'index.html 未处理 prefers-reduced-motion（必须提供降级）');
  }
  // 零外部依赖：只放行 SVG/XHTML 命名空间标识符（不产生网络请求）
  if (/https?:\/\/(?!www\.w3\.org\/)/i.test(html)) {
    fail(slug, 'index.html 含外部 URL（效果必须零外部依赖，包括注释里也不要写 URL）');
  }
  if (!/<!doctype html>/i.test(html)) fail(slug, 'index.html 缺少 <!doctype html>');
  if (!/lang="zh-CN"/.test(html)) fail(slug, 'index.html 需要 lang="zh-CN"');

  // ---- 参数注入点存在 & 带中文注释 ----
  const configBlock = html.match(/const CONFIG = \{[\s\S]*?\n\s*\};/)?.[0];
  for (const p of meta.params) {
    if (p.target === 'css') {
      const decl = html.match(new RegExp(`--mt-${p.key}\\s*:[^;]*;[^\\n]*`));
      if (!decl) {
        fail(slug, `css 参数 ${p.key} 在 :root 中没有 --mt-${p.key} 声明`);
      } else if (!decl[0].includes('/*')) {
        fail(slug, `--mt-${p.key} 声明行缺少中文注释（注释会随代码交给 AI 和用户）`);
      }
    } else {
      if (!configBlock) {
        fail(slug, `存在 config 参数（${p.key}）但 index.html 没有 const CONFIG = { ... }; 块`);
      } else {
        const entry = configBlock.match(new RegExp(`\\b${p.key}\\s*:[^\\n]*`));
        if (!entry) fail(slug, `config 参数 ${p.key} 在 CONFIG 块中没有对应条目`);
        else if (!entry[0].includes('//')) fail(slug, `CONFIG.${p.key} 行缺少中文注释`);
      }
    }
    if (p.type === 'font' && !fontIds.has(String(p.default))) {
      fail(slug, `font 参数 ${p.key} 的默认值 ${p.default} 不在字体表中`);
    }
    if (p.type === 'image' && !existsSync(path.join(root, 'public', String(p.default)))) {
      fail(slug, `image 参数 ${p.key} 的默认示例图 ${p.default} 不存在`);
    }
    if (p.type === 'images') {
      for (const item of p.default) {
        if (!existsSync(path.join(root, 'public', item.src))) {
          fail(slug, `images 参数 ${p.key} 的默认示例图 ${item.src} 不存在`);
        }
      }
    }
  }

  // ---- 轮播基线（sub 为 carousel 的效果强制）----
  // 纯 CSS 实现（如 scroll-snap 版）可在注释中说明原生能力以满足关键字检查
  if (meta.sub === 'carousel') {
    for (const keyword of [
      'aria-roledescription',
      'keydown',
      'prefers-reduced-motion',
      'pointerdown',
    ]) {
      if (!html.includes(keyword)) {
        fail(slug, `轮播效果缺少基线能力关键字「${keyword}」（无障碍 / 键盘 / 降级 / 拖拽）`);
      }
    }
  }

  // ---- thumb 演示块 ----
  const thumbStarts = (html.match(/\/\* @mt:thumb-start \*\//g) ?? []).length;
  const thumbEnds = (html.match(/\/\* @mt:thumb-end \*\//g) ?? []).length;
  if (thumbStarts !== thumbEnds) fail(slug, '@mt:thumb-start / @mt:thumb-end 标记不配对');
  if (meta.thumb.mode === 'autoplay' && thumbStarts === 0) {
    fail(slug, 'thumb.mode 为 autoplay 但 index.html 没有 @mt:thumb 演示块');
  }

  // ---- prompt.md ----
  if (!/^##\s+效果描述\s*$/m.test(md)) fail(slug, 'prompt.md 缺少 "## 效果描述" 一节');
  const paramKeys = new Set(meta.params.map((p) => p.key));
  for (const m of md.matchAll(/\{\{(\w+)\}\}/g)) {
    if (!paramKeys.has(m[1])) fail(slug, `prompt.md 引用了不存在的占位符 {{${m[1]}}}`);
  }

  // 效果描述文案规则（.cursor/rules/prompt-copy.mdc）：只写体验，不写数值 / 占位符 / 实现手段
  const desc =
    md.match(/^##\s+效果描述\s*$\n([\s\S]*?)(?=^##\s|\s*$(?![\s\S]))/m)?.[1]?.trim() ?? '';
  if (desc.length > 220)
    fail(slug, `效果描述 ${desc.length} 字，超过 200 字上限（含标点留 20 字余量）`);
  if (/\{\{/.test(desc)) fail(slug, '效果描述里不要用 {{key}} 占位符，数值统一由【参数】段列出');
  if (/实现提示/.test(desc)) fail(slug, '实现提示要放在独立的 "## 实现提示" 小节');
  const IMPL_TERMS =
    /transform|translate|rotate[XYZ]?\(|perspective|clip-path|backdrop-filter|keyframes|requestAnimationFrame|IntersectionObserver|z-index|position:|flex-grow|scroll-snap|mask-image|(linear|radial|conic)-gradient|steps\(|@property|aria-|role=|\bcanvas\b/i;
  const term = desc.match(IMPL_TERMS);
  if (term)
    fail(slug, `效果描述里出现实现术语「${term[0]}」，请改用用户能感知的说法或移到 "## 实现提示"`);

  // ---- 预设值合法 ----
  for (const preset of meta.presets) {
    for (const [key, value] of Object.entries(preset.values)) {
      const p = meta.params.find((x) => x.key === key);
      if (!p) continue; // schema 已报
      const typeOk =
        (p.type === 'range' && typeof value === 'number' && value >= p.min && value <= p.max) ||
        (p.type === 'toggle' && typeof value === 'boolean') ||
        (p.type === 'color' && typeof value === 'string' && /^#[0-9a-fA-F]{6}$/.test(value)) ||
        (p.type === 'select' &&
          typeof value === 'string' &&
          p.options.some((o) => o.value === value)) ||
        (p.type === 'text' && typeof value === 'string') ||
        (p.type === 'font' && typeof value === 'string' && fontIds.has(value)) ||
        (p.type === 'image' && typeof value === 'string' && value.startsWith('/samples/'));
      if (!typeOk) fail(slug, `预设「${preset.name}」的 ${key} = ${JSON.stringify(value)} 不合法`);
    }
  }
}

if (errorCount > 0) {
  console.error(`\n校验失败：${errorCount} 个问题`);
  process.exit(1);
}
console.log(`✓ 全部 ${dirs.length} 个效果通过契约校验`);
