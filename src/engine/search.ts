import type { EffectMeta } from '../contract/types';
import { categoryName, subDef } from '../contract/categories';

/**
 * 效果页搜索：解析搜索词、匹配效果、标签补全。
 * 语法：普通词按「名称 + 摘要 + slug + 标签 + 分类名 + 子类名」子串匹配（AND）；
 * 以 # / ＃ 开头的词是标签筛选，必须精确命中效果的某个标签（AND）。
 */

export interface ParsedQuery {
  /** 普通检索词（已小写、去重） */
  words: string[];
  /** #标签 词（已去井号、小写、去重） */
  tags: string[];
}

/** 解析搜索框原文：按空白切词，# / ＃ 开头进 tags，其余进 words */
export function parseQuery(q: string): ParsedQuery {
  const words = new Set<string>();
  const tags = new Set<string>();
  for (const raw of q.split(/\s+/)) {
    const token = raw.trim().toLowerCase();
    if (!token) continue;
    if (token.startsWith('#') || token.startsWith('＃')) {
      const tag = token.replace(/^[#＃]+/, '');
      if (tag) tags.add(tag);
    } else {
      words.add(token);
    }
  }
  return { words: [...words], tags: [...tags] };
}

export function isEmptyQuery(parsed: ParsedQuery): boolean {
  return parsed.words.length === 0 && parsed.tags.length === 0;
}

/** 效果的可检索文本（小写）：名称 + 摘要 + slug + 标签 + 分类名 + 子类名 */
function haystack(meta: EffectMeta): string {
  return [
    meta.name,
    meta.summary,
    meta.slug,
    ...meta.tags,
    categoryName(meta.category),
    subDef(meta.category, meta.sub).name,
  ]
    .join(' ')
    .toLowerCase();
}

/** 是否命中：tags 全部精确命中效果标签，words 全部是可检索文本的子串 */
export function matchEffect(meta: EffectMeta, parsed: ParsedQuery): boolean {
  if (isEmptyQuery(parsed)) return true;
  if (parsed.tags.length > 0) {
    const own = new Set(meta.tags.map((t) => t.toLowerCase()));
    if (!parsed.tags.every((t) => own.has(t))) return false;
  }
  if (parsed.words.length > 0) {
    const text = haystack(meta);
    if (!parsed.words.every((w) => text.includes(w))) return false;
  }
  return true;
}

export interface TagSuggestion {
  tag: string;
  count: number;
}

/**
 * 标签补全：统计集合内标签出现次数，
 * 排序为 前缀命中 → 包含命中 → 次数降序（同次数按名称稳定）。
 */
export function suggestTags(prefix: string, metas: EffectMeta[], limit = 8): TagSuggestion[] {
  const p = prefix.trim().toLowerCase();
  const counts = new Map<string, number>();
  for (const m of metas) {
    for (const t of m.tags) counts.set(t, (counts.get(t) ?? 0) + 1);
  }
  const rank = (tag: string): number => {
    if (!p) return 1;
    const t = tag.toLowerCase();
    if (t.startsWith(p)) return 0;
    if (t.includes(p)) return 1;
    return 2;
  };
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count, r: rank(tag) }))
    .filter((s) => s.r < 2)
    .sort((a, b) => a.r - b.r || b.count - a.count || a.tag.localeCompare(b.tag, 'zh'))
    .slice(0, limit)
    .map(({ tag, count }) => ({ tag, count }));
}
