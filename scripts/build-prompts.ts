/**
 * 构建后输出静态 prompt 端点：dist/prompts/<slug>.md（默认参数、深色底、附参考代码）。
 * agent / 脚本可直接拉取：curl https://<host>/prompts/aurora-gradient.md
 */
import { mkdirSync, readFileSync, readdirSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { effectMetaSchema } from '../src/contract/schema.ts';
import { bakeCode } from '../src/engine/bakeCode.ts';
import { renderPrompt } from '../src/engine/renderPrompt.ts';
import { defaultValues } from '../src/engine/urlState.ts';
import { BG_DARK } from '../src/contract/types.ts';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const effectsDir = path.join(root, 'effects');
const outDir = path.join(root, 'dist', 'prompts');

if (!existsSync(path.join(root, 'dist'))) {
  console.error('dist/ 不存在，请先运行 vite build');
  process.exit(1);
}
mkdirSync(outDir, { recursive: true });

const dirs = readdirSync(effectsDir, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name)
  .sort();

let count = 0;
for (const slug of dirs) {
  const meta = effectMetaSchema.parse(
    JSON.parse(readFileSync(path.join(effectsDir, slug, 'meta.json'), 'utf8')),
  );
  const html = readFileSync(path.join(effectsDir, slug, 'index.html'), 'utf8');
  const promptMd = readFileSync(path.join(effectsDir, slug, 'prompt.md'), 'utf8');
  const values = defaultValues(meta);

  const exportedCode = bakeCode({ meta, html, values, bg: BG_DARK, mode: 'export' });
  const prompt = renderPrompt({
    meta,
    promptMd,
    values,
    bg: { mode: 'dark' },
    includeCode: true,
    exportedCode,
  });

  const header = `<!-- ${meta.name}（${meta.slug}）· 默认参数版 prompt · 由裁缝大师 Master-Tailor 生成；在网站上调参可获得定制版 -->\n\n`;
  writeFileSync(path.join(outDir, `${slug}.md`), header + prompt + '\n');
  count++;
}

console.log(`✓ 已输出 ${count} 个 prompt 到 dist/prompts/`);
