import { describe, expect, it } from 'vitest';
import { isEmptyQuery, matchEffect, parseQuery, suggestTags } from '../src/engine/search';
import type { EffectMeta } from '../src/contract/types';
import { fixtureMeta } from './fixtures';

/** 构造只关心检索字段的效果元数据 */
function meta(over: Partial<EffectMeta>): EffectMeta {
  return { ...fixtureMeta, ...over };
}

describe('parseQuery', () => {
  it('按空白切词：# 与 ＃ 开头进 tags，其余进 words，全部小写去重', () => {
    const p = parseQuery('  轮播  #转场 ＃苹果风 Apple apple #转场 ');
    expect(p.words).toEqual(['轮播', 'apple']);
    expect(p.tags).toEqual(['转场', '苹果风']);
  });

  it('孤立的 # 与空白被忽略；空串为无查询', () => {
    expect(parseQuery('#').tags).toEqual([]);
    expect(isEmptyQuery(parseQuery('   '))).toBe(true);
    expect(isEmptyQuery(parseQuery('#x'))).toBe(false);
  });
});

describe('matchEffect', () => {
  const m = meta({
    name: '卡片展开转场',
    summary: '点击卡片原地长大成详情页大图',
    slug: 'demo-expand',
    category: 'transition',
    sub: 'shared',
    tags: ['转场', '共享元素', 'View Transitions', '苹果风'],
  });

  it('空查询命中一切', () => {
    expect(matchEffect(m, parseQuery(''))).toBe(true);
  });

  it('普通词在名称 / 摘要 / slug / 标签 / 分类名 / 子类名里子串匹配（AND）', () => {
    expect(matchEffect(m, parseQuery('卡片 长大'))).toBe(true); // 名称 + 摘要
    expect(matchEffect(m, parseQuery('expand'))).toBe(true); // slug
    expect(matchEffect(m, parseQuery('页面转场'))).toBe(true); // 分类名
    expect(matchEffect(m, parseQuery('共享元素'))).toBe(true); // 子类名 / 标签
    expect(matchEffect(m, parseQuery('卡片 轮播'))).toBe(false); // AND：有一个词不中即不中
  });

  it('普通词忽略大小写', () => {
    expect(matchEffect(m, parseQuery('VIEW transitions'))).toBe(true);
  });

  it('#标签 精确命中（AND、忽略大小写），子串不算', () => {
    expect(matchEffect(m, parseQuery('#转场'))).toBe(true);
    expect(matchEffect(m, parseQuery('#view\u0020'.trim() + ' '))).toBe(false); // 'view' 只是标签的子串
    expect(matchEffect(m, parseQuery('#苹果风 #共享元素'))).toBe(true);
    expect(matchEffect(m, parseQuery('#苹果风 #轮播'))).toBe(false);
  });

  it('标签与普通词叠加', () => {
    expect(matchEffect(m, parseQuery('#转场 卡片'))).toBe(true);
    expect(matchEffect(m, parseQuery('#转场 轮播'))).toBe(false);
  });
});

describe('suggestTags', () => {
  const metas = [
    meta({ slug: 'a', tags: ['转场', '苹果风'] }),
    meta({ slug: 'b', tags: ['转场', '轮播'] }),
    meta({ slug: 'c', tags: ['轮播', '缩放'] }),
    meta({ slug: 'd', tags: ['转场'] }),
  ];

  it('空前缀按出现次数降序', () => {
    const s = suggestTags('', metas);
    expect(s[0]).toEqual({ tag: '转场', count: 3 });
    expect(s[1]).toEqual({ tag: '轮播', count: 2 });
  });

  it('前缀命中排在包含命中前，二者都排除不相关标签', () => {
    const s = suggestTags('苹', metas);
    expect(s.map((x) => x.tag)).toEqual(['苹果风']);
    const s2 = suggestTags('果', metas);
    expect(s2.map((x) => x.tag)).toEqual(['苹果风']); // 包含命中
  });

  it('limit 生效', () => {
    expect(suggestTags('', metas, 2)).toHaveLength(2);
  });
});
