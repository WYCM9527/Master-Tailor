import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CATEGORIES } from '../contract/categories';
import { EFFECTS } from '../contract/registry';
import { IconClose } from './Icons';

interface Props {
  /** 当前效果 slug，用于高亮 */
  current: string;
  open: boolean;
  /** 收起（带图标形变转场） */
  onClose: () => void;
  /** 点目录项跳转时的收起（不启动自己的转场，避免与路由转场冲突） */
  onNavigate: () => void;
}

/** 详情页的悬浮效果目录：按 分类 → 子类 → 效果 列出全部效果，点任一项直接切换 */
export function EffectNav({ current, open, onClose, onNavigate }: Props) {
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
      {/* 通屏抽屉盖住页头的目录按钮；开关图标共享 nav-toggle 名，随转场从左上角形变到头部右侧 */}
      <aside className="nav-drawer" aria-label="效果目录">
        <div className="blk-head nav-head">
          <span className="blk-title">
            目录
            <span className="hint mono">{EFFECTS.length} 个效果</span>
          </span>
          <div className="blk-actions">
            <button
              type="button"
              className="btn btn-ghost nav-close"
              aria-label="收起效果目录"
              title="收起效果目录"
              onClick={onClose}
            >
              <IconClose width={20} height={20} style={{ viewTransitionName: 'nav-toggle' }} />
            </button>
          </div>
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
                          onClick={onNavigate}
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
