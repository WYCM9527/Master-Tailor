/**
 * 字体表：3 个系统通用族 + 4 个自托管 OFL 开源字体。
 * 自托管字体文件位于 public/fonts/，由 /fonts/fonts.css 统一声明 @font-face；
 * 预览 iframe 会注入该样式表，导出的代码只写 font-family 栈（不内嵌字体文件）。
 */

export interface FontDef {
  id: string;
  /** 面板与 prompt 中显示的中文名 */
  label: string;
  /** 注入 CSS 变量的 font-family 栈 */
  stack: string;
  kind: 'system' | 'hosted';
  /** prompt 中的补充说明 */
  note?: string;
}

export const FONTS: FontDef[] = [
  {
    id: 'system-sans',
    label: '系统黑体（默认）',
    stack: `-apple-system, "PingFang SC", "Microsoft YaHei", "Noto Sans SC", sans-serif`,
    kind: 'system',
  },
  {
    id: 'system-serif',
    label: '系统宋体',
    stack: `"Songti SC", SimSun, "Noto Serif SC", serif`,
    kind: 'system',
  },
  {
    id: 'system-mono',
    label: '系统等宽',
    stack: `ui-monospace, SFMono-Regular, Consolas, "Courier New", monospace`,
    kind: 'system',
  },
  {
    id: 'noto-sans-sc',
    label: '思源黑体 Noto Sans SC',
    stack: `"Noto Sans SC", -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif`,
    kind: 'hosted',
    note: '开源字体（OFL 许可），未安装时自动退回系统黑体',
  },
  {
    id: 'lxgw-wenkai',
    label: '霞鹜文楷',
    stack: `"LXGW WenKai Screen", "LXGW WenKai", "Kaiti SC", STKaiti, KaiTi, serif`,
    kind: 'hosted',
    note: '开源字体（OFL 许可），未安装时自动退回系统楷体',
  },
  {
    id: 'smiley-sans',
    label: '得意黑 Smiley Sans',
    stack: `"Smiley Sans Oblique", "Smiley Sans", -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif`,
    kind: 'hosted',
    note: '开源字体（OFL 许可），未安装时自动退回系统黑体',
  },
  {
    id: 'jetbrains-mono',
    label: 'JetBrains Mono（等宽）',
    stack: `"JetBrains Mono", ui-monospace, SFMono-Regular, Consolas, monospace`,
    kind: 'hosted',
    note: '开源字体（OFL 许可），未安装时自动退回系统等宽字体',
  },
];

export const DEFAULT_FONT_ID = 'system-sans';

export function fontById(id: string): FontDef {
  return FONTS.find((f) => f.id === id) ?? FONTS[0];
}

/** 预览 iframe 注入的字体样式表地址 */
export const FONTS_CSS_HREF = '/fonts/fonts.css';
