/**
 * 构建后输出给 AI / agent 抓取的静态端点（全部按默认参数、深色底烘焙）：
 *   dist/prompts/<slug>.md    完整 prompt（附参考代码）        curl https://<site>/prompts/aurora-gradient.md
 *   dist/code/<slug>.html     可直接运行的单文件参考实现      curl -o aurora.html https://<site>/code/aurora-gradient.html
 *   dist/meta/<slug>.json     参数表（键名 / 类型 / 范围 / 默认值 / 说明）+ 各端点地址
 *   dist/prompts/index.json   全站目录（编号、slug、名字、摘要、分类、端点）
 *   dist/llms.txt             给 AI 的站点说明与目录（llmstxt.org 惯例）
 *
 * 地址前缀取环境变量 SITE_URL（含子路径、末尾带斜杠，如 https://wycm9527.tripolabs.com/master-tailor/）；
 * 未设置时退化为相对路径——同站内可用，prompt 复制到别处后地址会失效，因此会打印提示。
 * 编号与站内一致：一级分类 → 二级分类 → slug（同 src/contract/registry.ts 的排序）。
 */
import { mkdirSync, readFileSync, readdirSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CATEGORIES, categoryName } from '../src/contract/categories.ts';
import { effectMetaSchema } from '../src/contract/schema.ts';
import type { EffectMeta } from '../src/contract/types.ts';
import { BG_DARK } from '../src/contract/types.ts';
import { bakeCode } from '../src/engine/bakeCode.ts';
import { effectEndpoints, renderPrompt } from '../src/engine/renderPrompt.ts';
import { defaultValues } from '../src/engine/urlState.ts';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const effectsDir = path.join(root, 'effects');
const dist = path.join(root, 'dist');
const dirs = {
  prompts: path.join(dist, 'prompts'),
  code: path.join(dist, 'code'),
  meta: path.join(dist, 'meta'),
};

if (!existsSync(dist)) {
  console.error('dist/ 不存在，请先运行 vite build');
  process.exit(1);
}
for (const d of Object.values(dirs)) mkdirSync(d, { recursive: true });

// ---------- 站点地址 ----------
const rawSite = (process.env.SITE_URL ?? '').trim();
const siteUrl = rawSite ? (rawSite.endsWith('/') ? rawSite : `${rawSite}/`) : '';
if (!siteUrl) {
  console.warn(
    '⚠ 未设置 SITE_URL，prompt 与目录里的端点地址为相对路径（同站可用，复制到别处会失效）。' +
      '生产构建请设置，如 SITE_URL=https://wycm9527.tripolabs.com/master-tailor/',
  );
}
const generatedAt = new Date().toISOString();

// ---------- 读取全部效果并按站内顺序排序 ----------
const categoryOrder = new Map(CATEGORIES.map((c, i) => [c.id, i]));
const subOrder = new Map<string, number>();
for (const c of CATEGORIES) c.subs.forEach((s, i) => subOrder.set(`${c.id}:${s.id}`, i));

interface Loaded {
  meta: EffectMeta;
  html: string;
  promptMd: string;
}
const effects: Loaded[] = readdirSync(effectsDir, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name)
  .sort()
  .map((slug) => ({
    meta: effectMetaSchema.parse(
      JSON.parse(readFileSync(path.join(effectsDir, slug, 'meta.json'), 'utf8')),
    ),
    html: readFileSync(path.join(effectsDir, slug, 'index.html'), 'utf8'),
    promptMd: readFileSync(path.join(effectsDir, slug, 'prompt.md'), 'utf8'),
  }));
effects.sort((a, b) => {
  const ca = categoryOrder.get(a.meta.category) ?? 99;
  const cb = categoryOrder.get(b.meta.category) ?? 99;
  if (ca !== cb) return ca - cb;
  const sa = subOrder.get(`${a.meta.category}:${a.meta.sub}`) ?? 99;
  const sb = subOrder.get(`${b.meta.category}:${b.meta.sub}`) ?? 99;
  if (sa !== sb) return sa - sb;
  return a.meta.slug.localeCompare(b.meta.slug);
});

// ---------- 逐效果输出 ----------
interface IndexEntry {
  no: string;
  slug: string;
  name: string;
  summary: string;
  category: string;
  categoryName: string;
  sub: string;
  tags: string[];
  endpoints: ReturnType<typeof effectEndpoints>;
}
const index: IndexEntry[] = [];

effects.forEach(({ meta, html, promptMd }, i) => {
  const no = String(i + 1).padStart(3, '0');
  const values = defaultValues(meta);
  const endpoints = effectEndpoints(siteUrl, meta.slug);

  // 参考实现：与站内「下载 HTML」同一份（默认参数、深色底、占位图）
  const exportedCode = bakeCode({ meta, html, values, bg: BG_DARK, mode: 'export' });
  writeFileSync(path.join(dirs.code, `${meta.slug}.html`), exportedCode.trimEnd() + '\n');

  // 完整 prompt（附参考代码）
  const prompt = renderPrompt({
    meta,
    promptMd,
    values,
    includeCode: true,
    exportedCode,
    siteUrl: siteUrl || undefined,
    previewUrl: endpoints.preview,
  });
  const header =
    `<!-- ${meta.name}（${meta.slug}）· 默认参数版 prompt · 由裁缝大师 Master-Tailor 生成；在网站上调参可获得定制版` +
    ` · 参考实现 ${endpoints.code} · 参数表 ${endpoints.meta} -->\n\n`;
  writeFileSync(path.join(dirs.prompts, `${meta.slug}.md`), header + prompt + '\n');

  // 参数表：完整 meta（params / presets / source）+ 落点说明 + 端点
  const metaOut = {
    no,
    slug: meta.slug,
    name: meta.name,
    summary: meta.summary,
    category: meta.category,
    categoryName: categoryName(meta.category),
    sub: meta.sub,
    tags: meta.tags,
    paramTargets:
      '样式类参数（target: css）写在参考实现 :root 的 --mt-<key>；配置类（target: config）写在 const CONFIG 的 <key>',
    params: meta.params,
    presets: meta.presets,
    source: meta.source,
    endpoints,
    generatedAt,
  };
  writeFileSync(path.join(dirs.meta, `${meta.slug}.json`), JSON.stringify(metaOut, null, 2) + '\n');

  index.push({
    no,
    slug: meta.slug,
    name: meta.name,
    summary: meta.summary,
    category: meta.category,
    categoryName: categoryName(meta.category),
    sub: meta.sub,
    tags: meta.tags,
    endpoints,
  });
});

// ---------- 全站目录 ----------
writeFileSync(
  path.join(dirs.prompts, 'index.json'),
  JSON.stringify(
    {
      site: siteUrl || null,
      name: '裁缝大师 Master-Tailor',
      description:
        '面向中文 vibe coding 用户的前端效果图鉴：零依赖单文件效果（原生 HTML/CSS/JS），每个都有可调参数、中文 prompt 与可直接运行的参考实现',
      generatedAt,
      count: index.length,
      endpoints: { llms: `${siteUrl}llms.txt`, index: `${siteUrl}prompts/index.json` },
      effects: index,
    },
    null,
    2,
  ) + '\n',
);

// ---------- llms.txt ----------
const llmsLines: string[] = [
  '# 裁缝大师 Master-Tailor',
  '',
  `> 面向中文 vibe coding 用户的前端效果图鉴：${index.length} 个零依赖单文件效果（原生 HTML/CSS/JS），每个都有可调参数、中文 prompt 与可直接运行的参考实现。`,
  '',
  '## 怎么用',
  '',
  `- 参考实现（默认参数，单文件，直接下载即可运行）：\`${siteUrl}code/<slug>.html\``,
  `- 参数表（键名、类型、范围、默认值、说明；样式类参数写在 :root 的 \`--mt-<key>\`，配置类写在 \`const CONFIG\` 的同名键）：\`${siteUrl}meta/<slug>.json\``,
  `- 完整 prompt（附参考代码）：\`${siteUrl}prompts/<slug>.md\`；机器可读目录：\`${siteUrl}prompts/index.json\``,
  '- 用户从站内复制的 prompt 里已带调好的参数值：先取回参考实现，再按 prompt 的【参数】改值，不必从头写',
  '- 效果契约：零依赖、零外链，尊重 prefers-reduced-motion，页面切到后台时暂停动画',
  '',
];
for (const c of CATEGORIES) {
  const inCat = index.filter((e) => e.category === c.id);
  if (inCat.length === 0) continue;
  llmsLines.push(`## ${c.name}（${inCat.length}）`, '');
  for (const e of inCat) {
    llmsLines.push(`- ${e.no} [${e.name}](${e.endpoints.code})：${e.summary}`);
  }
  llmsLines.push('');
}
writeFileSync(path.join(dist, 'llms.txt'), llmsLines.join('\n'));

console.log(
  `✓ 已输出 ${index.length} 个 prompt 到 dist/prompts/，参考实现到 dist/code/，参数表到 dist/meta/，目录 prompts/index.json 与 llms.txt` +
    (siteUrl ? `（站点 ${siteUrl}）` : '（相对路径）'),
);
