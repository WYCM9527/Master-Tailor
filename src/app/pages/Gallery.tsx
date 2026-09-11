import { useMemo, useState } from 'react';
import { useSearchParams, useViewTransitionState } from 'react-router-dom';
import type { CategoryId } from '../../contract/types';
import { CATEGORIES, categoryName, categorySubs, subDef } from '../../contract/categories';
import { EFFECTS } from '../../contract/registry';
import { isEmptyQuery, matchEffect, parseQuery } from '../../engine/search';
import { EffectCard } from '../../components/EffectCard';
import { IconMinus, IconPlus } from '../../components/Icons';

const CATEGORY_IDS = new Set<string>(CATEGORIES.map((c) => c.id));
/** 桌面 / 平板每行效果数（效果区内部 3 列） */
const PER_ROW = 3;

function countIn(cat: CategoryId, sub?: string): number {
  return EFFECTS.filter((e) => e.meta.category === cat && (!sub || e.meta.sub === sub)).length;
}

const pad2 = (n: number) => String(n).padStart(2, '0');

/**
 * 效果页（/effects）：侧栏 2 栏 sticky + 效果区 10 栏（内部 3 列）。
 * 当前筛选保存在 URL query（?cat=showcase&sub=carousel&tag=…），从详情页返回时筛选不丢。
 */
export function Gallery() {
  const [searchParams, setSearchParams] = useSearchParams();
  // 仅在与首页互转期间给大标题挂 heading 名（与首页入口格形变承接）；
  // 效果页 ↔ 详情页的转场不涉及它，保持干净的整页淡化
  const toHome = useViewTransitionState('/');

  // URL 是选择状态的唯一事实源；非法值一律当作未选
  const catParam = searchParams.get('cat');
  const cat: CategoryId | null =
    catParam && CATEGORY_IDS.has(catParam) ? (catParam as CategoryId) : null;
  const subParam = searchParams.get('sub');
  const sub: string | null =
    cat && subParam && categorySubs(cat).some((s) => s.id === subParam) ? subParam : null;
  const tagParam = searchParams.get('tag');
  // 顶栏搜索词（TopBar 防抖写入）：普通词模糊匹配 + #标签 精确筛选
  const qParam = searchParams.get('q') ?? '';
  const query = useMemo(() => parseQuery(qParam), [qParam]);
  const searching = !isEmptyQuery(query);

  // 折叠状态是纯视图状态，留在组件内；默认全部展开
  const [collapsed, setCollapsed] = useState<ReadonlySet<CategoryId>>(new Set());

  const select = (next: { cat?: CategoryId | null; sub?: string | null; tag?: string | null }) => {
    const params = new URLSearchParams();
    if (next.cat) params.set('cat', next.cat);
    if (next.cat && next.sub) params.set('sub', next.sub);
    if (next.tag) params.set('tag', next.tag);
    if (qParam) params.set('q', qParam); // 分类切换不清搜索词
    // preventScrollReset：筛选只换 query，不要被 ScrollRestoration 拉回页顶
    setSearchParams(params, { replace: true, preventScrollReset: true });
  };

  /** 改写 q（清空 / 移除某个 #标签），其余筛选保持 */
  const writeQuery = (nextQ: string, keepFilters = true) => {
    const params = keepFilters ? new URLSearchParams(searchParams) : new URLSearchParams();
    if (nextQ.trim()) params.set('q', nextQ);
    else params.delete('q');
    setSearchParams(params, { replace: true, preventScrollReset: true });
  };

  const expand = (c: CategoryId) =>
    setCollapsed((prev) => {
      if (!prev.has(c)) return prev;
      const next = new Set(prev);
      next.delete(c);
      return next;
    });

  const toggleCollapsed = (c: CategoryId) =>
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(c)) next.delete(c);
      else next.add(c);
      return next;
    });

  const inSelection = useMemo(
    () => EFFECTS.filter((e) => (!cat || e.meta.category === cat) && (!sub || e.meta.sub === sub)),
    [cat, sub],
  );

  const tags = useMemo(() => {
    const set = new Set<string>();
    for (const e of inSelection) for (const t of e.meta.tags) set.add(t);
    return [...set];
  }, [inSelection]);

  const tag = tagParam && tags.includes(tagParam) ? tagParam : null;

  const filtered = useMemo(
    () =>
      inSelection.filter((e) => (!tag || e.meta.tags.includes(tag)) && matchEffect(e.meta, query)),
    [inSelection, tag, query],
  );

  // 搜索词在无分类限制下的命中数：空态「在全部效果中搜索」用
  const matchesInAll = useMemo(
    () => (searching ? EFFECTS.filter((e) => matchEffect(e.meta, query)).length : 0),
    [searching, query],
  );

  /** 标签按钮：既可能通过 tag 参数选中，也可能通过搜索词里的 #标签 命中 */
  const tagInQuery = (t: string) => query.tags.includes(t.toLowerCase());
  /** 从搜索词里移除某个 #标签 token */
  const removeTagFromQuery = (t: string) => {
    const next = qParam
      .split(/\s+/)
      .filter((tok) => {
        const m = tok.match(/^[#＃]+(.*)$/);
        return !(m && m[1].toLowerCase() === t.toLowerCase());
      })
      .join(' ');
    writeQuery(next);
  };

  // 左上角只放当前层级的名字：选了二级就只显示二级
  const heading = !cat ? '全部效果' : sub ? subDef(cat, sub).name : categoryName(cat);
  const subheading = searching
    ? `匹配「${qParam.trim()}」的效果`
    : cat && sub
      ? subDef(cat, sub).desc
      : cat
        ? '在左侧继续筛选，或直接挑一个'
        : '左侧按分类浏览，或直接挑一个喜欢的';

  // 补空 Cell，让最后一行也铺满网格线
  const fillers = (PER_ROW - (filtered.length % PER_ROW)) % PER_ROW;

  return (
    <div className="g12 body">
      <div className="cell span-2 side-col">
        <aside className="side" aria-label="效果分类">
          <button
            type="button"
            className={`side-row side-all${!cat ? ' active' : ''}`}
            onClick={() => select({})}
          >
            <span className="name">全部</span>
            <span className="count">{EFFECTS.length}</span>
          </button>

          {CATEGORIES.map((c) => {
            const isOpen = !collapsed.has(c.id);
            const subs = c.subs.filter((s) => countIn(c.id, s.id) > 0);
            return (
              <div className={`side-group${cat === c.id ? ' active' : ''}`} key={c.id}>
                <div className="side-cat">
                  <button
                    type="button"
                    className={`side-row${cat === c.id && !sub ? ' active' : ''}`}
                    onClick={() => {
                      select({ cat: c.id });
                      expand(c.id);
                    }}
                  >
                    <span className="name">{c.name}</span>
                    <span className="count">{countIn(c.id)}</span>
                  </button>
                  <button
                    type="button"
                    className="side-fold"
                    onClick={() => toggleCollapsed(c.id)}
                    aria-expanded={isOpen}
                    aria-label={`${isOpen ? '收起' : '展开'}${c.name}`}
                  >
                    {isOpen ? <IconMinus size={12} /> : <IconPlus size={12} />}
                  </button>
                </div>
                {isOpen && (
                  <div className="side-subs">
                    {subs.map((s) => (
                      <button
                        type="button"
                        key={s.id}
                        className={`side-row side-sub${cat === c.id && sub === s.id ? ' active' : ''}`}
                        onClick={() => select({ cat: c.id, sub: s.id })}
                      >
                        <span className="name">{s.name}</span>
                        <span className="count">{countIn(c.id, s.id)}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </aside>
      </div>

      <div className="main">
        <div className="cell filter">
          <div className="filter-head">
            <h2 style={{ viewTransitionName: toHome ? 'heading' : undefined }}>{heading}</h2>
            <span className="mono">{pad2(filtered.length)} items</span>
          </div>
          <p className="desc">{subheading}</p>
          {/* 标签只在选中具体分类后出现：「全部」下几十个标签会淹没页面 */}
          {cat && tags.length > 1 && (
            <div className="tag-row">
              {tags.map((t) => (
                <button
                  type="button"
                  key={t}
                  className={`tag${tag === t || tagInQuery(t) ? ' active' : ''}`}
                  onClick={() =>
                    tagInQuery(t)
                      ? removeTagFromQuery(t)
                      : select({ cat, sub, tag: tag === t ? null : t })
                  }
                >
                  {t}
                </button>
              ))}
            </div>
          )}
        </div>

        {filtered.length > 0 ? (
          <>
            {filtered.map((e) => (
              <EffectCard key={e.meta.slug} effect={e} />
            ))}
            {Array.from({ length: fillers }, (_, i) => (
              <div className="cell filler" key={`filler-${i}`} aria-hidden="true" />
            ))}
          </>
        ) : searching ? (
          <div className="cell empty">
            <p>没有匹配「{qParam.trim()}」的效果。</p>
            <div className="empty-actions">
              <button type="button" className="btn" onClick={() => writeQuery('')}>
                清除搜索
              </button>
              {cat && matchesInAll > 0 && (
                <button type="button" className="btn" onClick={() => writeQuery(qParam, false)}>
                  在全部效果中搜索（{matchesInAll}）
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="cell empty">这个分类下还没有效果，换一个看看。</div>
        )}
      </div>
    </div>
  );
}
