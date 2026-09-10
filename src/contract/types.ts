/**
 * 裁缝大师 · 作者契约类型定义
 *
 * 一个效果 = effects/<slug>/ 目录下的三件套：
 * - meta.json   效果元信息与参数 schema（本文件描述其类型）
 * - index.html  原生单文件实现（零依赖、零外链）
 * - prompt.md   中文效果描述模板（含 {{key}} 占位符）
 */

export type CategoryId =
  'background' | 'button' | 'text' | 'card' | 'showcase' | 'transition' | 'loading' | 'canvas';

/**
 * 二级分类（侧边栏第二级）：每个一级分类在 CATEGORIES 中自声明子类表。
 * 原有 6 类的子类是触发方式（idle / hover / click / scroll）；
 * 「多卡/图展示」的子类是 carousel / compare / stack-scroll；
 * 「页面转场」的子类是 shared / push / zoom / keynote / scroll。
 */
export interface SubDef {
  id: string;
  name: string;
  desc: string;
}

/**
 * 参数注入目标：
 * - css    → 注入 :root 中的 --mt-<key> 变量，调参时热更新，动画不重置
 * - config → 注入 JS 顶部 const CONFIG 块，调参时防抖重建 iframe
 */
export type ParamTarget = 'css' | 'config';

export interface BaseParam {
  /** camelCase，对应 CSS 变量 --mt-<key> 或 CONFIG.<key> */
  key: string;
  /** 面板显示的中文名 */
  label: string;
  target: ParamTarget;
  /** 面板中的辅助说明（可选） */
  help?: string;
}

export interface ColorParam extends BaseParam {
  type: 'color';
  default: string;
}

export interface RangeParam extends BaseParam {
  type: 'range';
  min: number;
  max: number;
  step: number;
  default: number;
  /** 注入 CSS 时拼接的单位（px / s / deg / % / 空字符串表示无单位） */
  unit?: string;
  /** 面板与 prompt 中显示的单位（默认取 unit；倍率类可写 "×"） */
  displayUnit?: string;
}

export interface ToggleParam extends BaseParam {
  type: 'toggle';
  default: boolean;
}

export interface SelectParam extends BaseParam {
  type: 'select';
  options: { value: string; label: string }[];
  default: string;
}

export interface TextParam extends BaseParam {
  type: 'text';
  default: string;
  maxLength?: number;
}

/** 字体参数：值为 FONTS 表中的字体 id */
export interface FontParam extends BaseParam {
  type: 'font';
  default: string;
}

/**
 * 图片参数：默认值为站内示例图路径（/samples/xxx.svg）。
 * 用户上传的图片只在本地预览（object URL）；导出代码与 prompt 一律写占位路径 ./your-image.jpg。
 */
export interface ImageParam extends BaseParam {
  type: 'image';
  default: string;
}

/** 图片列表的一项：图 + 标题（captions 为 false 的效果忽略标题） */
export interface SlideItem {
  src: string;
  caption: string;
}

/**
 * 图片列表参数（轮播等多图效果用）：
 * - 面板中每个槽位 = 示例图选择 / 本地上传 + 标题输入，可在 [min, max] 内增减张数
 * - 默认值必须全部来自 /samples/
 * - 导出代码与 prompt 一律写占位路径 ./slide-1.jpg …；分享链接只保存示例图选择与标题
 * - 契约约定 CONFIG 中写成单行数组：`slides: [ ... ], // 注释`
 */
export interface ImagesParam extends BaseParam {
  type: 'images';
  target: 'config';
  min: number;
  max: number;
  /** 是否在面板中提供每张图的标题输入 */
  captions: boolean;
  default: SlideItem[];
}

export type Param =
  | ColorParam
  | RangeParam
  | ToggleParam
  | SelectParam
  | TextParam
  | FontParam
  | ImageParam
  | ImagesParam;

export type ParamValue = string | number | boolean | SlideItem[];
export type Values = Record<string, ParamValue>;

export interface Preset {
  id: string;
  name: string;
  /** 只写与默认值不同的键 */
  values: Values;
}

export interface EffectSource {
  /**
   * original           完全原创
   * reference          参考过某个 MIT/BSD/CC0 开源实现后自写（clean room）
   * visual-inspiration 仅视觉灵感（Commons Clause / 自有许可站点，未阅读其源码）
   */
  kind: 'original' | 'reference' | 'visual-inspiration';
  name?: string;
  url?: string;
  license?: string;
}

export interface EffectMeta {
  slug: string;
  name: string;
  category: CategoryId;
  /** 二级分类 id：必须属于所在分类在 CATEGORIES 中声明的子类表 */
  sub: string;
  tags: string[];
  summary: string;
  params: Param[];
  presets: Preset[];
  /**
   * thumb 模式：
   * - live     效果自身一直在动，缩略图直接实时渲染
   * - autoplay 效果依赖鼠标/点击/滚动，index.html 中需带 @mt:thumb 演示块
   */
  thumb: { mode: 'live' | 'autoplay' };
  source: EffectSource;
  /** 预留：英文 prompt（MVP 不实现） */
  promptEn?: string;
}

export interface Effect {
  meta: EffectMeta;
  html: string;
  promptMd: string;
}

/** 预览底色设置 */
export type BgSetting = { mode: 'dark' } | { mode: 'light' } | { mode: 'custom'; color: string };

/** 详情页完整状态（同步进 URL query） */
export interface EffectState {
  values: Values;
  bg: BgSetting;
  /** prompt 是否附带参考代码 */
  includeCode: boolean;
}

export const BG_DARK = '#0a0a0f';
export const BG_LIGHT = '#f5f6fa';

export function bgColor(bg: BgSetting): string {
  if (bg.mode === 'dark') return BG_DARK;
  if (bg.mode === 'light') return BG_LIGHT;
  return bg.color;
}

/** 导出代码与 prompt 中图片参数的占位路径 */
export const IMAGE_PLACEHOLDER = './your-image.jpg';

/** 图片列表参数的占位路径（第 n 张，从 1 开始） */
export function slidePlaceholder(index: number): string {
  return `./slide-${index + 1}.jpg`;
}
