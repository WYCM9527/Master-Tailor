import type { BgSetting, EffectMeta, EffectState, ParamValue, Values } from '../contract/types';

/**
 * 详情页状态 <-> URL query 的双向编解码。
 * 只写非默认值，保证默认态 URL 干净；解码时对非法值一律回退默认（URL 是外部输入）。
 */

const BG_KEY = 'bg';
const PLACEMENT_KEY = 'pl';
const NO_CODE_KEY = 'nc';
const HEX_RE = /^#[0-9a-fA-F]{6}$/;

export function defaultValues(meta: EffectMeta): Values {
  const values: Values = {};
  for (const p of meta.params) values[p.key] = p.default;
  return values;
}

export function defaultState(meta: EffectMeta): EffectState {
  return { values: defaultValues(meta), bg: { mode: 'dark' }, placement: '', includeCode: true };
}

/** 应用预设：默认值 + 预设覆盖 */
export function applyPreset(meta: EffectMeta, presetId: string): Values {
  const preset = meta.presets.find((p) => p.id === presetId);
  const values = defaultValues(meta);
  if (preset) Object.assign(values, preset.values);
  return values;
}

function encodeValue(v: ParamValue): string {
  if (typeof v === 'boolean') return v ? '1' : '0';
  return String(v);
}

export function encodeState(meta: EffectMeta, state: EffectState): URLSearchParams {
  const sp = new URLSearchParams();
  for (const p of meta.params) {
    const v = state.values[p.key];
    if (v === undefined || v === p.default) continue;
    // 用户上传的图片（blob: 地址）无法进 URL，跳过；站内示例图路径可以
    if (p.type === 'image' && !String(v).startsWith('/samples/')) continue;
    sp.set(p.key, encodeValue(v));
  }
  if (state.bg.mode === 'light') sp.set(BG_KEY, 'light');
  if (state.bg.mode === 'custom') sp.set(BG_KEY, state.bg.color);
  if (state.placement.trim()) sp.set(PLACEMENT_KEY, state.placement.trim());
  if (!state.includeCode) sp.set(NO_CODE_KEY, '1');
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
    if (key === PLACEMENT_KEY) {
      state.placement = raw.slice(0, 200);
      continue;
    }
    if (key === NO_CODE_KEY) {
      state.includeCode = raw !== '1';
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
