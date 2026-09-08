import { useMemo, useState } from 'react';
import type { CategoryId } from '../../contract/types';
import { CATEGORIES } from '../../contract/categories';
import { EFFECTS } from '../../contract/registry';
import { EffectCard } from '../../components/EffectCard';

type CatFilter = 'all' | CategoryId;

export function Home() {
  const [cat, setCat] = useState<CatFilter>('all');
  const [tag, setTag] = useState<string | null>(null);

  const inCategory = useMemo(
    () => EFFECTS.filter((e) => cat === 'all' || e.meta.category === cat),
    [cat],
  );

  const tags = useMemo(() => {
    const set = new Set<string>();
    for (const e of inCategory) for (const t of e.meta.tags) set.add(t);
    return [...set];
  }, [inCategory]);

  const filtered = useMemo(
    () => inCategory.filter((e) => !tag || e.meta.tags.includes(tag)),
    [inCategory, tag],
  );

  const countOf = (c: CatFilter) =>
    c === 'all' ? EFFECTS.length : EFFECTS.filter((e) => e.meta.category === c).length;

  const selectCat = (c: CatFilter) => {
    setCat(c);
    setTag(null);
  };

  return (
    <div className="container">
      <section className="hero">
        <h1>裁缝大师</h1>
        <p className="slogan">
          我们不做设计，我们只是<em>代码的裁缝师</em>。
        </p>
        <div className="steps">
          <div className="step glass">
            <span className="num">1</span>
            <span>
              <b>挑一个效果</b>
            </span>
          </div>
          <span className="step-arrow">→</span>
          <div className="step glass">
            <span className="num">2</span>
            <span>
              <b>调成你要的样子</b>
            </span>
          </div>
          <span className="step-arrow">→</span>
          <div className="step glass">
            <span className="num">3</span>
            <span>
              <b>复制 prompt 粘给你的 AI</b>
            </span>
          </div>
        </div>
      </section>

      <div className="filter-bar">
        <div className="cat-tabs">
          <button
            type="button"
            className={`cat-tab${cat === 'all' ? ' active' : ''}`}
            onClick={() => selectCat('all')}
          >
            全部<span className="count">{countOf('all')}</span>
          </button>
          {CATEGORIES.map((c) => (
            <button
              type="button"
              key={c.id}
              className={`cat-tab${cat === c.id ? ' active' : ''}`}
              onClick={() => selectCat(c.id)}
            >
              {c.name}
              <span className="count">{countOf(c.id)}</span>
            </button>
          ))}
        </div>
        {/* 标签只在选中具体分类后出现：「全部」下几十个标签会淹没页面 */}
        {cat !== 'all' && tags.length > 1 && (
          <div className="tag-row">
            {tags.map((t) => (
              <button
                type="button"
                key={t}
                className={`chip${tag === t ? ' active' : ''}`}
                onClick={() => setTag(tag === t ? null : t)}
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
  );
}
