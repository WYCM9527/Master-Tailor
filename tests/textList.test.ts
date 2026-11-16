import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import type { EffectMeta, TextParam } from '../src/contract/types';
import {
  LIST_SEP,
  cleanField,
  fieldPadding,
  fieldSepOf,
  isListText,
  joinFields,
  splitFields,
} from '../src/engine/textList';

const effectsDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'effects');

function textParam(patch: Partial<TextParam>): TextParam {
  return { key: 'items', label: '条目', type: 'text', target: 'config', default: '', ...patch };
}

describe('textList', () => {
  it('只有默认值含「｜」的文本参数按多项编辑；字段分隔符缺省为「=」', () => {
    expect(isListText(textParam({ default: '首页｜作品' }))).toBe(true);
    expect(isListText(textParam({ default: '一句完整的话，带逗号' }))).toBe(false);
    expect(fieldSepOf(textParam({}))).toBe('=');
    expect(fieldSepOf(textParam({ fieldSep: ',' }))).toBe(',');
  });

  it('splitFields：缺的字段补空串，多出的分隔符并进最后一个字段', () => {
    expect(splitFields('作品', 2, '=')).toEqual(['作品', '']);
    expect(splitFields('', 3, '=')).toEqual(['', '', '']);
    expect(splitFields('S=Strengths=说明里也有=号', 3, '=')).toEqual([
      'S',
      'Strengths',
      '说明里也有=号',
    ]);
    expect(splitFields('01,山谷晨雾,2024-03,JPG', 4, ',')).toEqual([
      '01',
      '山谷晨雾',
      '2024-03',
      'JPG',
    ]);
  });

  it('joinFields：末尾的空字段不留分隔符，中间的空字段保留位置', () => {
    expect(joinFields(['作品', ''], '=')).toBe('作品');
    expect(joinFields(['', '', ''], '=')).toBe('');
    expect(joinFields(['', 'Works'], '=')).toBe('=Works');
    expect(joinFields(['关于', '', '招聘'], ':')).toBe('关于::招聘');
  });

  it('fieldPadding：往空字段写第一个字时，整项多出的长度 = 1 + 要补回的分隔符数', () => {
    expect(fieldPadding(['A', '', ''], 2)).toBe(2);
    expect(fieldPadding(['A', '', 'C'], 1)).toBe(0);
    const cases = [
      ['A', '', ''],
      ['A', 'B', ''],
      ['', '', ''],
      ['A', '', 'C'],
    ];
    for (const values of cases) {
      values.forEach((field, k) => {
        if (field !== '') return;
        const filled = values.map((v, j) => (j === k ? 'x' : v));
        const grown = joinFields(filled, '=').length - joinFields(values, '=').length;
        expect(grown, `[${values.join(',')}] 第 ${k + 1} 格`).toBe(1 + fieldPadding(values, k));
      });
    }
  });

  it('cleanField：换行变空格，去掉字段分隔符与「｜」', () => {
    expect(cleanField('第一行\n第二行', '=')).toBe('第一行 第二行');
    expect(cleanField('a=b｜c', '=')).toBe('abc');
    expect(cleanField('12:30', ':')).toBe('1230');
  });

  it('声明了 fields 的效果：默认值与预设逐项拆开再拼回，与原文一字不差（只打开面板不会改值）', () => {
    let checked = 0;
    for (const slug of readdirSync(effectsDir)) {
      const file = path.join(effectsDir, slug, 'meta.json');
      if (!existsSync(file)) continue;
      const meta = JSON.parse(readFileSync(file, 'utf8')) as EffectMeta;
      for (const p of meta.params) {
        if (p.type !== 'text' || !p.fields) continue;
        const count = p.fields.length;
        const sep = fieldSepOf(p);
        const values = [p.default];
        for (const preset of meta.presets) {
          const v = preset.values[p.key];
          if (typeof v === 'string') values.push(v);
        }
        for (const value of values) {
          const roundTrip = value
            .split(LIST_SEP)
            .map((item) => joinFields(splitFields(item, count, sep), sep))
            .join(LIST_SEP);
          expect(roundTrip, `${slug}.${p.key}`).toBe(value);
        }
        checked++;
      }
    }
    expect(checked).toBeGreaterThan(0);
  });
});
