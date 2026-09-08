import { describe, expect, it } from 'vitest';
import { decodeState, defaultState, encodeState } from '../src/engine/urlState';
import { fixtureMeta } from './fixtures';

describe('urlState', () => {
  it('默认状态编码为空 query', () => {
    const sp = encodeState(fixtureMeta, defaultState(fixtureMeta));
    expect(sp.toString()).toBe('');
  });

  it('只编码非默认值；blob 图片地址不进 URL', () => {
    const state = defaultState(fixtureMeta);
    state.values.color = '#112233';
    state.values.photo = 'blob:local-only';
    state.bg = { mode: 'light' };
    state.placement = '首页顶部';
    state.includeCode = false;
    const sp = encodeState(fixtureMeta, state);
    expect(sp.get('color')).toBe('#112233');
    expect(sp.get('photo')).toBeNull();
    expect(sp.get('bg')).toBe('light');
    expect(sp.get('pl')).toBe('首页顶部');
    expect(sp.get('nc')).toBe('1');
  });

  it('roundtrip：编码再解码得到等价状态', () => {
    const state = defaultState(fixtureMeta);
    state.values.speed = 2.5;
    state.values.glow = false;
    state.values.text = '中文，带逗号';
    state.bg = { mode: 'custom', color: '#334455' };
    const decoded = decodeState(fixtureMeta, encodeState(fixtureMeta, state));
    expect(decoded.values.speed).toBe(2.5);
    expect(decoded.values.glow).toBe(false);
    expect(decoded.values.text).toBe('中文，带逗号');
    expect(decoded.bg).toEqual({ mode: 'custom', color: '#334455' });
  });

  it('非法值回退：越界 range 被夹取，非法颜色/枚举被忽略', () => {
    const sp = new URLSearchParams({ speed: '999', color: 'red', count: '-5', bg: 'notacolor' });
    const decoded = decodeState(fixtureMeta, sp);
    expect(decoded.values.speed).toBe(3); // clamp 到 max
    expect(decoded.values.color).toBe('#f9cf00'); // 非法 hex 回退默认
    expect(decoded.values.count).toBe(1); // clamp 到 min
    expect(decoded.bg).toEqual({ mode: 'dark' }); // 非法 bg 回退
  });
});
