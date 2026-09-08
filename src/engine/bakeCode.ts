import type { EffectMeta, Values } from '../contract/types';
import { toCssValue, toConfigValue } from './cssValue';
import { buildRuntimeScript } from './previewRuntime';

export interface BakeOptions {
  meta: EffectMeta;
  /** effects/<slug>/index.html 原文 */
  html: string;
  values: Values;
  /** 已解析的底色颜色值（写入 --mt-bg） */
  bg: string;
  /**
   * preview：注入 runtime 与字体样式表，保留 thumb 演示块
   * export ：剥离 thumb 块，图片替换为占位路径，文件头加注释
   */
  mode: 'preview' | 'export';
  /** 仅 preview：缩略图模式 */
  thumb?: boolean;
  /** 仅 preview：字体样式表地址（如 /fonts/fonts.css） */
  fontsCssHref?: string;
}

/** 替换 :root 中 --mt-<key> 声明的值（保留行内注释） */
function replaceCssVar(html: string, key: string, value: string): string {
  const re = new RegExp(`(--mt-${key}\\s*:\\s*)[^;]*(;)`);
  return html.replace(re, `$1${value}$2`);
}

/** 在 const CONFIG = { ... }; 块内替换某个 key 的值（保留行内注释） */
function replaceConfigKey(html: string, key: string, literal: string): string {
  const blockRe = /const CONFIG = \{[\s\S]*?\n\s*\};/;
  const block = html.match(blockRe);
  if (!block) return html;
  const entryRe = new RegExp(`(\\b${key}\\s*:\\s*)("(?:[^"\\\\]|\\\\.)*"|'(?:[^'\\\\]|\\\\.)*'|[^,\\n]*)`);
  const newBlock = block[0].replace(entryRe, (_m, head: string) => `${head}${literal}`);
  return html.replace(blockRe, () => newBlock);
}

/** 剥离 @mt:thumb 演示块（含标记本身） */
function stripThumbBlocks(html: string): string {
  return html.replace(/[ \t]*\/\* @mt:thumb-start \*\/[\s\S]*?\/\* @mt:thumb-end \*\/\n?/g, '');
}

function exportHeader(meta: EffectMeta, values: Values): string {
  const lines = [
    `「${meta.name}」 · 由裁缝大师 Master-Tailor 生成`,
    `参数已按你调好的值写入代码，双击本文件即可在浏览器中预览。`,
  ];
  const imageParams = meta.params.filter((p) => p.type === 'image');
  if (imageParams.length > 0) {
    lines.push(`图片使用了占位路径 ./your-image.jpg，请替换为你自己的图片路径。`);
  }
  const fontParams = meta.params.filter((p) => p.type === 'font');
  for (const p of fontParams) {
    const v = String(values[p.key] ?? p.default);
    lines.push(`字体「${p.label}」当前选择 ${v}：代码只声明 font-family，未安装该字体时会自动退回系统字体。`);
  }
  return `<!--\n  ${lines.join('\n  ')}\n-->\n`;
}

/**
 * 把当前参数值烘焙进效果模板。
 * 预览与导出（复制代码 / 下载 HTML / prompt 附带的参考实现）共用这一份逻辑，
 * 保证「看到的、复制的、AI 拿到的」永远一致。
 */
export function bakeCode(o: BakeOptions): string {
  const exportMode = o.mode === 'export';
  let html = o.html;

  // 1. CSS 变量：底色 + 所有 css target 参数
  html = replaceCssVar(html, 'bg', o.bg);
  for (const p of o.meta.params) {
    if (p.target !== 'css') continue;
    const value = o.values[p.key] ?? p.default;
    html = replaceCssVar(html, p.key, toCssValue(p, value, exportMode));
  }

  // 2. CONFIG 块：所有 config target 参数
  for (const p of o.meta.params) {
    if (p.target !== 'config') continue;
    const value = o.values[p.key] ?? p.default;
    html = replaceConfigKey(html, p.key, toConfigValue(p, value, exportMode));
  }

  if (exportMode) {
    html = stripThumbBlocks(html);
    // 文件头注释放在 doctype 之后，避免触发浏览器怪异模式
    html = html.replace(/<!doctype html>\s*/i, (m) => m.trimEnd() + '\n' + exportHeader(o.meta, o.values));
    return html;
  }

  // 3. 预览注入：runtime + 字体样式表（在 </head> 前，效果脚本执行前 __MT_ENV 已就绪）
  const inject: string[] = [buildRuntimeScript(o.thumb ?? false)];
  if (o.fontsCssHref) {
    inject.push(`<link rel="stylesheet" href="${o.fontsCssHref}">`);
  }
  html = html.replace('</head>', `${inject.join('\n')}\n</head>`);
  return html;
}

/** 详情页热更新：由当前值生成要 postMessage 的 CSS 变量表 */
export function collectCssVars(meta: EffectMeta, values: Values, bg: string): Record<string, string> {
  const vars: Record<string, string> = { '--mt-bg': bg };
  for (const p of meta.params) {
    if (p.target !== 'css') continue;
    const value = values[p.key] ?? p.default;
    vars[`--mt-${p.key}`] = toCssValue(p, value, false);
  }
  return vars;
}

/** config target 参数的取值签名：变化时需要重建 iframe */
export function configSignature(meta: EffectMeta, values: Values): string {
  const entries = meta.params
    .filter((p) => p.target === 'config')
    .map((p) => [p.key, values[p.key] ?? p.default]);
  return JSON.stringify(entries);
}
