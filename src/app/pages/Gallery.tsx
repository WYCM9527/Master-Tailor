import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { CategoryId } from '../../contract/types';
import { CATEGORIES, categoryName, categorySubs, subDef } from '../../contract/categories';
import { EFFECTS } from '../../contract/registry';
import { EffectCard } from '../../components/EffectCard';

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

  // URL 是选择状态的唯一事实源；非法值一律当作未选
  const catParam = searchParams.get('cat');
  const cat: CategoryId | null =
    catParam && CATEGORY_IDS.has(catParam) ? (catParam as CategoryId) : null;
  const subParam = searchParams.get('sub');
  const sub: string | null =
    cat && subParam && categorySubs(cat).some((s) => s.id === subParam) ? subParam : null;
  const tagParam = searchParams.get('tag');

  // 折叠状态是纯视图状态，留在组件内；默认全部展开
  const [collapsed, setCollapsed] = useState<ReadonlySet<CategoryId>>(new Set());

  const select = (next: { cat?: CategoryId | null; sub?: string | null; tag?: string | null }) => {
    const params = new URLSearchParams();
    if (next.cat) params.set('cat', next.cat);
    if (next.cat && next.sub) params.set('sub', next.sub);
    if (next.tag) params.set('tag', next.tag);
    setSearchParams(params, { replace: true });
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
    () => inSelection.filter((e) => !tag || e.meta.tags.includes(tag)),
    [inSelection, tag],
  );

  // 左上角只放当前层级的名字：选了二级就只显示二级
  const heading = !cat ? '全部效果' : sub ? subDef(cat, sub).name : categoryName(cat);
  const subheading =
    cat && sub
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
            <span className="idx">00</span>
            <span className="name">全部</span>
            <span className="count">{EFFECTS.length}</span>
          </button>

          {CATEGORIES.map((c, ci) => {
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
                    <span className="idx">{pad2(ci + 1)}</span>
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
                    {isOpen ? '−' : '+'}
                  </button>
                </div>
                {isOpen && (
                  <div className="side-subs">
                    {subs.map((s, si) => (
                      <button
                        type="button"
                        key={s.id}
                        className={`side-row side-sub${cat === c.id && sub === s.id ? ' active' : ''}`}
                        onClick={() => select({ cat: c.id, sub: s.id })}
                      >
                        <span className="idx">
                          {pad2(ci + 1)}.{si + 1}
                        </span>
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
            <h2>{heading}</h2>
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
                  className={`tag${tag === t ? ' active' : ''}`}
                  onClick={() => select({ cat, sub, tag: tag === t ? null : t })}
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
        ) : (
          <div className="cell empty">这个分类下还没有效果，换一个看看。</div>
        )}
      </div>
    </div>
  );
}
