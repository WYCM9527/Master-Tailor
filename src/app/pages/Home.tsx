import { useEffect, useMemo, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import type { CategoryId } from '../../contract/types';
import { CATEGORIES, categoryName, categorySubs, subDef } from '../../contract/categories';
import { EFFECTS } from '../../contract/registry';
import { EffectCard } from '../../components/EffectCard';
import { HowToSection } from '../../components/HowToSection';

const CATEGORY_IDS = new Set<string>(CATEGORIES.map((c) => c.id));
/** 桌面端每行效果数（效果 Cell 占 3 栏，主区 9 栏） */
const PER_ROW = 3;

function countIn(cat: CategoryId, sub?: string): number {
  return EFFECTS.filter((e) => e.meta.category === cat && (!sub || e.meta.sub === sub)).length;
}

const pad2 = (n: number) => String(n).padStart(2, '0');

/**
 * 首页 = 三段整宽网格：
 *   Hero 行（巨字 9 栏 + 元数据 3 栏 + 三步 Cell）
 *   主体行（侧栏 3 栏 sticky + 效果 subgrid 9 栏）
 *   怎么用（内联区块）
 * 当前筛选保存在 URL query（?cat=showcase&sub=carousel&tag=…），从详情页返回时筛选不丢。
 */
export function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();

  // 从其他页面点「怎么用」跳回来时滚到对应区块
  useEffect(() => {
    const target = (location.state as { scrollTo?: string } | null)?.scrollTo;
    if (target) document.getElementById(target)?.scrollIntoView({ block: 'start' });
  }, [location.state]);

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

  const heading = !cat
    ? '全部效果'
    : sub
      ? `${categoryName(cat)} · ${subDef(cat, sub).name}`
      : categoryName(cat);
  const subheading =
    cat && sub
      ? subDef(cat, sub).desc
      : cat
        ? '在左侧继续筛选，或直接挑一个'
        : '左侧按分类浏览，或直接挑一个喜欢的';

  // 补空 Cell，让最后一行也铺满网格线
  const fillers = (PER_ROW - (filtered.length % PER_ROW)) % PER_ROW;

  return (
    <>
      <section className="g12 hero" aria-label="站点介绍">
        <div className="cell span-9 hero-title">
          <span className="mono">Master-Tailor — 前端效果图鉴 · 复制 prompt 粘给你的 AI</span>
          <h1>裁缝大师</h1>
          <p className="hero-slogan">
            我们不做设计，我们只是<em>代码的裁缝师</em>。
          </p>
        </div>
        <div className="span-3 sub hero-meta">
          <div className="cell span-3">
            <span className="big">{pad2(EFFECTS.length)}</span>
            <span className="mono">Effects · 效果</span>
          </div>
          <div className="cell span-3">
            <span className="big">{pad2(CATEGORIES.length)}</span>
            <span className="mono">Categories · 分类</span>
          </div>
          <div className="cell span-3">
            <span className="big">2026</span>
            <span className="mono">Edition · 持续更新</span>
          </div>
        </div>
        <div className="cell span-3 step">
          <span className="idx">01</span>
          <b>挑一个效果</b>
        </div>
        <div className="cell span-3 step">
          <span className="idx">02</span>
          <b>调成你要的样子</b>
        </div>
        <div className="cell span-3 step">
          <span className="idx">03</span>
          <b>复制 prompt 粘给你的 AI</b>
        </div>
        <button type="button" className="cell span-3 step step-cta" onClick={() => select({})}>
          <span className="mono">Index</span>
          <b>
            浏览全部 {EFFECTS.length} 个效果 <span className="arrow">↓</span>
          </b>
        </button>
      </section>

      <div className="g12 body">
        <div className="cell span-3 side-col">
          <aside className="side" aria-label="效果分类">
            <button
              type="button"
              className={`side-row side-all${!cat ? ' active' : ''}`}
              onClick={() => select({})}
            >
              <span className="idx">00</span>
              <span className="name">全部效果</span>
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

        <div className="span-9 sub main">
          <div className="cell span-9 filter">
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
                <div className="cell span-3 filler" key={`filler-${i}`} aria-hidden="true" />
              ))}
            </>
          ) : (
            <div className="cell span-9 empty">这个分类下还没有效果，换一个看看。</div>
          )}
        </div>
      </div>

      <HowToSection />
    </>
  );
}
