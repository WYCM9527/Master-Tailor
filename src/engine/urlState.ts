import type {
  BgSetting,
  EffectMeta,
  EffectState,
  ParamValue,
  SlideItem,
  Values,
} from '../contract/types';
import { sampleByIndex, sampleIndex } from '../contract/samples';

/**
 * 详情页状态 <-> URL query 的双向编解码。
 * 只写非默认值，保证默认态 URL 干净；解码时对非法值一律回退默认（URL 是外部输入）。
 */

const BG_KEY = 'bg';
/** 「附加代码」开关：默认关，开着时写 code=1 */
const CODE_KEY = 'code';
/** 旧链接兼容：曾经默认附加代码，关掉时写 nc=1；继续识别，含义仍是「不附加」 */
const NO_CODE_KEY = 'nc';
const HEX_RE = /^#[0-9a-fA-F]{6}$/;

/** 数组类参数值（图片列表 / 颜色列表）深拷贝，避免面板编辑污染 meta 里的默认值与预设 */
function cloneValue(v: ParamValue): ParamValue {
  if (!Array.isArray(v)) return v;
  return v.map((item) => (typeof item === 'string' ? item : { ...item })) as ParamValue;
}

export function defaultValues(meta: EffectMeta): Values {
  const values: Values = {};
  for (const p of meta.params) values[p.key] = cloneValue(p.default);
  return values;
}

export function defaultState(meta: EffectMeta): EffectState {
  // 默认不附加参考代码：prompt 只有描述 + 参数 + 实现提示，用户按需打开开关再附代码
  return { values: defaultValues(meta), bg: { mode: 'dark' }, includeCode: false };
}

/** 应用预设：默认值 + 预设覆盖 */
export function applyPreset(meta: EffectMeta, presetId: string): Values {
  const preset = meta.presets.find((p) => p.id === presetId);
  const values = defaultValues(meta);
  if (preset) {
    for (const [k, v] of Object.entries(preset.values)) values[k] = cloneValue(v);
  }
  return values;
}

function encodeValue(v: ParamValue): string {
  if (typeof v === 'boolean') return v ? '1' : '0';
  return String(v);
}

/**
 * 图片列表编码为 `示例图索引:标题,示例图索引:标题`（标题 encodeURIComponent）。
 * 上传的 blob 地址无法进 URL，槽位回退第一张示例图。
 */
function encodeSlides(slides: SlideItem[]): string {
  return slides
    .map((s) => {
      const idx = Math.max(0, sampleIndex(s.src));
      return `${idx}:${encodeURIComponent(s.caption)}`;
    })
    .join(',');
}

function decodeSlides(raw: string, min: number, max: number): SlideItem[] | undefined {
  const items = raw.split(',').slice(0, max);
  if (items.length < min) return undefined;
  const slides: SlideItem[] = [];
  for (const item of items) {
    const sep = item.indexOf(':');
    const idxRaw = sep === -1 ? item : item.slice(0, sep);
    const idx = Number(idxRaw);
    if (!Number.isInteger(idx) || idx < 0) return undefined;
    let caption: string;
    try {
      caption = sep === -1 ? '' : decodeURIComponent(item.slice(sep + 1)).slice(0, 30);
    } catch {
      return undefined;
    }
    slides.push({ src: sampleByIndex(idx), caption });
  }
  return slides;
}

/** 颜色列表编码为去掉 # 的 hex 逗号串：`ffffff,7c4dff` */
function encodeColors(colors: string[]): string {
  return colors.map((c) => c.slice(1).toLowerCase()).join(',');
}

function decodeColors(raw: string, min: number, max: number): string[] | undefined {
  const items = raw.split(',').slice(0, max);
  if (items.length < min) return undefined;
  if (!items.every((c) => /^[0-9a-fA-F]{6}$/.test(c))) return undefined;
  return items.map((c) => `#${c.toLowerCase()}`);
}

export function encodeState(meta: EffectMeta, state: EffectState): URLSearchParams {
  const sp = new URLSearchParams();
  for (const p of meta.params) {
    const v = state.values[p.key];
    if (v === undefined || v === p.default) continue;
    if (p.type === 'images') {
      const slides = v as SlideItem[];
      // 与默认值等价（把 blob 槽位按回退规则归一后比较）则不写
      const encoded = encodeSlides(slides);
      if (encoded === encodeSlides(p.default)) continue;
      sp.set(p.key, encoded);
      continue;
    }
    if (p.type === 'colors') {
      const encoded = encodeColors(v as string[]);
      if (encoded === encodeColors(p.default)) continue;
      sp.set(p.key, encoded);
      continue;
    }
    // 用户上传的图片（blob: 地址）无法进 URL，跳过；站内示例图路径可以
    if (p.type === 'image' && !String(v).startsWith('/samples/')) continue;
    sp.set(p.key, encodeValue(v));
  }
  if (state.bg.mode === 'light') sp.set(BG_KEY, 'light');
  if (state.bg.mode === 'custom') sp.set(BG_KEY, state.bg.color);
  if (state.includeCode) sp.set(CODE_KEY, '1');
  return sp;
}

function decodeValue(meta: EffectMeta, key: string, raw: string): ParamValue | undefined {
  const p = meta.params.find((x) => x.key === key);
  if (!p) return undefined;
  switch (p.type) {
    case 'color':
      return HEX_RE.test(raw) ? raw : undefined;
    case 'range': {
      const n = Number(raw);
      if (!Number.isFinite(n)) return undefined;
      return Math.min(p.max, Math.max(p.min, n));
    }
    case 'toggle':
      return raw === '1' ? true : raw === '0' ? false : undefined;
    case 'select':
      return p.options.some((o) => o.value === raw) ? raw : undefined;
    case 'text':
      return raw.slice(0, p.maxLength ?? 120);
    case 'font':
      return raw;
    case 'image':
      return raw.startsWith('/samples/') ? raw : undefined;
    case 'images':
      return decodeSlides(raw, p.min, p.max);
    case 'colors':
      return decodeColors(raw, p.min, p.max);
  }
}

export function decodeState(meta: EffectMeta, sp: URLSearchParams): EffectState {
  const state = defaultState(meta);
  for (const [key, raw] of sp.entries()) {
    if (key === BG_KEY) {
      if (raw === 'light') state.bg = { mode: 'light' };
      else if (HEX_RE.test(raw)) state.bg = { mode: 'custom', color: raw };
      continue;
    }
    if (key === CODE_KEY) {
      state.includeCode = raw === '1';
      continue;
    }
    if (key === NO_CODE_KEY) {
      // 旧链接：nc=1 表示不附加（与现在的默认一致）；不带 nc 的旧链接按新默认处理，不再自动附代码
      if (raw === '1') state.includeCode = false;
      continue;
    }
    const decoded = decodeValue(meta, key, raw);
    if (decoded !== undefined) state.values[key] = decoded;
  }
  return state;
}

export function isDefaultBg(bg: BgSetting): boolean {
  return bg.mode === 'dark';
}
