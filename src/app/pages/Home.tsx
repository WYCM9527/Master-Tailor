import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { CategoryId, TriggerId } from '../../contract/types';
import { CATEGORIES, TRIGGERS, categoryName, triggerById } from '../../contract/categories';
import { EFFECTS } from '../../contract/registry';
import { EffectCard } from '../../components/EffectCard';

const CATEGORY_IDS = new Set<string>(CATEGORIES.map((c) => c.id));
const TRIGGER_IDS = new Set<string>(TRIGGERS.map((t) => t.id));

function countIn(cat: CategoryId, trigger?: TriggerId): number {
  return EFFECTS.filter((e) => e.meta.category === cat && (!trigger || e.meta.trigger === trigger))
    .length;
}

/**
 * 首页：左侧两级侧边栏（分类 → 触发方式）+ 右侧效果网格。
 * 当前选择保存在 URL query（?cat=button&trigger=hover&tag=…），从详情页返回时筛选不丢。
 */
export function Home() {
  const [searchParams, setSearchParams] = useSearchParams();

  // URL 是选择状态的唯一事实源；非法值一律当作未选
  const catParam = searchParams.get('cat');
  const cat: CategoryId | null =
    catParam && CATEGORY_IDS.has(catParam) ? (catParam as CategoryId) : null;
  const triggerParam = searchParams.get('trigger');
  const trigger: TriggerId | null =
    cat && triggerParam && TRIGGER_IDS.has(triggerParam) ? (triggerParam as TriggerId) : null;
  const tagParam = searchParams.get('tag');

  // 折叠状态是纯视图状态，留在组件内；默认全部展开
  const [collapsed, setCollapsed] = useState<ReadonlySet<CategoryId>>(new Set());

  const select = (next: { cat?: CategoryId | null; trigger?: TriggerId | null; tag?: string | null }) => {
    const params = new URLSearchParams();
    if (next.cat) params.set('cat', next.cat);
    if (next.cat && next.trigger) params.set('trigger', next.trigger);
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
    () =>
      EFFECTS.filter(
        (e) => (!cat || e.meta.category === cat) && (!trigger || e.meta.trigger === trigger),
      ),
    [cat, trigger],
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
    : trigger
      ? `${categoryName(cat)} · ${triggerById(trigger).name}`
      : categoryName(cat);
  const subheading = trigger
    ? triggerById(trigger).desc
    : cat
      ? '在左侧按触发方式继续筛选，或直接挑一个'
      : '左侧按分类与触发方式浏览，或直接挑一个喜欢的';

  return (
    <div className="container home">
      <aside className="sidebar glass" aria-label="效果分类">
        <button
          type="button"
          className={`side-item side-all${!cat ? ' active' : ''}`}
          onClick={() => select({})}
        >
          <span>全部效果</span>
          <span className="side-count">{EFFECTS.length}</span>
        </button>

        {CATEGORIES.map((c) => {
          const isOpen = !collapsed.has(c.id);
          const subs = TRIGGERS.filter((t) => countIn(c.id, t.id) > 0);
          return (
            <div className="side-group" key={c.id}>
              <div className={`side-cat${cat === c.id && !trigger ? ' active' : ''}`}>
                <button
                  type="button"
                  className="side-label"
                  onClick={() => {
                    select({ cat: c.id });
                    expand(c.id);
                  }}
                >
                  <span>{c.name}</span>
                  <span className="side-count">{countIn(c.id)}</span>
                </button>
                <button
                  type="button"
                  className={`side-chevron${isOpen ? ' open' : ''}`}
                  onClick={() => toggleCollapsed(c.id)}
                  aria-expanded={isOpen}
                  aria-label={`${isOpen ? '收起' : '展开'}${c.name}`}
                >
                  ▸
                </button>
              </div>
              {isOpen && (
                <div className="side-subs">
                  {subs.map((t) => (
                    <button
                      type="button"
                      key={t.id}
                      className={`side-item side-sub${cat === c.id && trigger === t.id ? ' active' : ''}`}
                      onClick={() => select({ cat: c.id, trigger: t.id })}
                    >
                      <span>{t.name}</span>
                      <span className="side-count">{countIn(c.id, t.id)}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </aside>

      <div className="home-main">
        <section className="hero">
          <h1>裁缝大师</h1>
          <p className="slogan">
            我们不做设计，我们只是<em>代码的裁缝师</em>。
          </p>
          <div className="steps">
            <div className="step glass">
              <span className="num">1</span>
              <b>挑一个效果</b>
            </div>
            <span className="step-arrow">→</span>
            <div className="step glass">
              <span className="num">2</span>
              <b>调成你要的样子</b>
            </div>
            <span className="step-arrow">→</span>
            <div className="step glass">
              <span className="num">3</span>
              <b>复制 prompt 粘给你的 AI</b>
            </div>
          </div>
        </section>

        <div className="content-head">
          <h2>
            {heading}
            <span className="count">{filtered.length}</span>
          </h2>
          <p className="muted">{subheading}</p>
          {/* 标签只在选中具体分类后出现：「全部」下几十个标签会淹没页面 */}
          {cat && tags.length > 1 && (
            <div className="tag-row">
              {tags.map((t) => (
                <button
                  type="button"
                  key={t}
                  className={`chip${tag === t ? ' active' : ''}`}
                  onClick={() => select({ cat, trigger, tag: tag === t ? null : t })}
                >
                  {t}
                </button>
              ))}
            </div>
          )}
        </div>

        {filtered.length > 0 ? (
          <div className="cards">
            {filtered.map((e) => (
              <EffectCard key={e.meta.slug} effect={e} />
            ))}
          </div>
        ) : (
          <div className="empty-state">这个分类下还没有效果，换一个看看。</div>
        )}
      </div>
    </div>
  );
}
