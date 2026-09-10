import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CATEGORIES } from '../contract/categories';
import { EFFECTS } from '../contract/registry';

interface Props {
  /** 当前效果 slug，用于高亮 */
  current: string;
  open: boolean;
  onClose: () => void;
}

/** 详情页的悬浮效果目录：按 分类 → 子类 → 效果 列出全部效果，点任一项直接切换 */
export function EffectNav({ current, open, onClose }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      <div className="nav-scrim" onClick={onClose} aria-hidden="true" />
      {/* 抽屉从页头下方滑出：页头的目录按钮（此时为 ×）保持可见、负责收起 */}
      <aside className="nav-drawer" aria-label="效果目录">
        <div className="blk-head nav-head">
          <span className="blk-title">
            目录
            <span className="hint mono">{EFFECTS.length} 个效果</span>
          </span>
        </div>

        <div className="nav-body">
          {CATEGORIES.map((c) => {
            const inCat = EFFECTS.filter((e) => e.meta.category === c.id);
            if (inCat.length === 0) return null;
            return (
              <section className="nav-cat" key={c.id}>
                <h3 className="nav-cat-name">{c.name}</h3>
                {c.subs.map((s) => {
                  const items = inCat.filter((e) => e.meta.sub === s.id);
                  if (items.length === 0) return null;
                  return (
                    <div className="nav-sub" key={s.id}>
                      <span className="mono nav-sub-name">{s.name}</span>
                      {items.map((e) => (
                        <Link
                          key={e.meta.slug}
                          to={`/e/${e.meta.slug}`}
                          viewTransition
                          className={`nav-item${e.meta.slug === current ? ' active' : ''}`}
                          aria-current={e.meta.slug === current ? 'page' : undefined}
                          onClick={onClose}
                        >
                          {e.meta.name}
                        </Link>
                      ))}
                    </div>
                  );
                })}
              </section>
            );
          })}
        </div>
      </aside>
    </>
  );
}
