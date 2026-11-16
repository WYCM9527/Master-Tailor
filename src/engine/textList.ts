import type { TextParam } from '../contract/types';

/**
 * 多项文本参数的拆分与拼接（参数面板逐项 / 逐字段编辑、validate 共用）。
 * 值始终是一整串：多项用全角「｜」分隔，项内字段用 fieldSep（缺省「=」）分隔；面板只改呈现，不改写法。
 */

/** 多项分隔符（全站约定的全角竖线） */
export const LIST_SEP = '｜';

/** 默认值含「｜」的文本参数按多项编辑 */
export function isListText(param: TextParam): boolean {
  return param.default.includes(LIST_SEP);
}

export function fieldSepOf(param: TextParam): string {
  return param.fieldSep ?? '=';
}

/** 按字段数拆开一项：缺的字段补空串，多出来的分隔符并进最后一个字段 */
export function splitFields(item: string, count: number, sep: string): string[] {
  const parts = item.split(sep);
  return Array.from({ length: count }, (_, k) =>
    k < count - 1 ? (parts[k] ?? '') : parts.slice(k).join(sep),
  );
}

/** 拼回时保留的字段数：末尾的空字段省掉，至少留一个 */
function keptCount(values: string[]): number {
  let end = values.length;
  while (end > 1 && values[end - 1] === '') end--;
  return end;
}

/** 拼回一项：末尾的空字段不留分隔符，与手写的「作品=Works」一致 */
export function joinFields(values: string[], sep: string): string {
  return values.slice(0, keptCount(values)).join(sep);
}

/** 往第 k 个字段写字时整项要多出的分隔符数：它排在保留的字段之后，中间省掉的分隔符都得补回来 */
export function fieldPadding(values: string[], k: number): number {
  return Math.max(0, k + 1 - keptCount(values));
}

/** 字段输入清洗：换行变空格，去掉字段分隔符与「｜」——混进去会让效果拆错位 */
export function cleanField(text: string, sep: string): string {
  return text.replace(/\r?\n/g, ' ').replaceAll(sep, '').replaceAll(LIST_SEP, '');
}
