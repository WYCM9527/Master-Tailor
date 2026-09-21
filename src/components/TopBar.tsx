import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import type { CategoryId } from '../contract/types';
import { CATEGORIES, categorySubs } from '../contract/categories';
import { EFFECTS } from '../contract/registry';
import { suggestTags } from '../engine/search';
import { IconSearch } from './Icons';

const CATEGORY_IDS = new Set<string>(CATEGORIES.map((c) => c.id));
/** 输入到写入 URL 的防抖间隔 */
const DEBOUNCE_MS = 150;
/** 补全浮层最多列出的标签数 */
const SUGGEST_LIMIT = 8;

/** 光标前最后一个 token（用于判断是否在输入 #标签） */
function tokenAtCaret(text: string, caret: number): { token: string; start: number } {
  const before = text.slice(0, caret);
  const m = before.match(/(\S+)$/);
  return m ? { token: m[1], start: caret - m[1].length } : { token: '', start: caret };
}

/**
 * Header：品牌 Cell（2 栏，与效果页侧栏对齐）+ 通栏搜索格（10 栏）。详情页与首页不渲染。
 * 搜索词经防抖写入 URL 的 q 参数，由 Gallery 消费；输入 #标签 时弹出标签补全。
 */
export function TopBar() {
  const [searchParams, setSearchParams] = useSearchParams();
  const qParam = searchParams.get('q') ?? '';

  const [value, setValue] = useState(qParam);
  const [caret, setCaret] = useState(0);
  const [popOpen, setPopOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 外部改了 q（空态按钮 / 后退）时同步回输入框；自己防抖写入后此处是 no-op。
  // 用渲染期派生（React 官方 adjusting-state-during-render 模式），避免 effect 级联渲染
  const [lastQ, setLastQ] = useState(qParam);
  if (qParam !== lastQ) {
    setLastQ(qParam);
    setValue(qParam);
  }

  const writeQuery = (next: string) => {
    setSearchParams(
      (prev) => {
        const params = new URLSearchParams(prev);
        if (next.trim()) params.set('q', next);
        else params.delete('q');
        return params;
      },
      { replace: true, preventScrollReset: true },
    );
  };

  const update = (next: string, nextCaret: number) => {
    setValue(next);
    setCaret(nextCaret);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => writeQuery(next), DEBOUNCE_MS);
  };

  // 与 Gallery 同口径的「当前分类选中集合」，补全计数基于它
  const catParam = searchParams.get('cat');
  const cat: CategoryId | null =
    catParam && CATEGORY_IDS.has(catParam) ? (catParam as CategoryId) : null;
  const subParam = searchParams.get('sub');
  const sub: string | null =
    cat && subParam && categorySubs(cat).some((s) => s.id === subParam) ? subParam : null;
  const scopedMetas = useMemo(
    () =>
      EFFECTS.filter((e) => (!cat || e.meta.category === cat) && (!sub || e.meta.sub === sub)).map(
        (e) => e.meta,
      ),
    [cat, sub],
  );

  // 光标所在 token 以 # 开头时进入补全态
  const token = tokenAtCaret(value, caret);
  const tagging = /^[#＃]/.test(token.token);
  const prefix = token.token.replace(/^[#＃]+/, '');
  const suggestions = useMemo(
    () => (tagging ? suggestTags(prefix, scopedMetas, SUGGEST_LIMIT) : []),
    [tagging, prefix, scopedMetas],
  );
  const showPop = popOpen && tagging && suggestions.length > 0;

  // 前缀变化时高亮回到第一项（渲染期派生，同上）
  const [lastPrefix, setLastPrefix] = useState(prefix);
  if (prefix !== lastPrefix) {
    setLastPrefix(prefix);
    setHighlight(0);
  }

  /** 把光标所在的 #token 回填为「#标签␣」，光标停在补全之后 */
  const applyTag = (tag: string) => {
    const inserted = `#${tag} `;
    const next = value.slice(0, token.start) + inserted + value.slice(caret);
    const nextCaret = token.start + inserted.length;
    update(next, nextCaret);
    setPopOpen(false);
    requestAnimationFrame(() => {
      const el = inputRef.current;
      if (el) {
        el.focus();
        el.setSelectionRange(nextCaret, nextCaret);
      }
    });
  };

  const clear = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setValue('');
    setPopOpen(false);
    writeQuery('');
  };

  // 页面任意处按 / 聚焦搜索框（焦点不在可输入控件上时）
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== '/' || e.metaKey || e.ctrlKey || e.altKey) return;
      const el = document.activeElement;
      const typing =
        el instanceof HTMLInputElement ||
        el instanceof HTMLTextAreaElement ||
        el instanceof HTMLSelectElement ||
        (el instanceof HTMLElement && el.isContentEditable);
      if (typing) return;
      e.preventDefault();
      inputRef.current?.focus();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (showPop) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHighlight((h) => (h + 1) % suggestions.length);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHighlight((h) => (h - 1 + suggestions.length) % suggestions.length);
        return;
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        applyTag(suggestions[highlight].tag);
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        setPopOpen(false);
        return;
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      clear();
      inputRef.current?.blur();
    } else if (e.key === 'Enter') {
      e.preventDefault();
    }
  };

  const syncCaret = (el: HTMLInputElement) => setCaret(el.selectionStart ?? el.value.length);

  return (
    <header className="g12 first hdr">
      <Link to="/" viewTransition className="cell span-2 hdr-brand">
        裁缝大师
      </Link>
      <form className="cell span-10 hdr-search" role="search" onSubmit={(e) => e.preventDefault()}>
        <IconSearch size={18} className="search-icon" />
        <input
          ref={inputRef}
          type="search"
          value={value}
          placeholder="搜索效果，或输入 #标签 筛选 · 按 / 聚焦"
          aria-label="搜索效果"
          autoComplete="off"
          spellCheck={false}
          onChange={(e) => {
            update(e.target.value, e.target.selectionStart ?? e.target.value.length);
            setPopOpen(true);
          }}
          onKeyDown={onKeyDown}
          onKeyUp={(e) => syncCaret(e.currentTarget)}
          onClick={(e) => syncCaret(e.currentTarget)}
          onFocus={() => setPopOpen(true)}
          onBlur={() => setPopOpen(false)}
        />
        {value && (
          <button type="button" className="btn search-clear" onClick={clear}>
            清空
          </button>
        )}
        {showPop && (
          <div className="search-pop" role="listbox" aria-label="标签建议">
            {suggestions.map((s, i) => (
              <button
                type="button"
                key={s.tag}
                role="option"
                aria-selected={i === highlight}
                className={`search-item${i === highlight ? ' active' : ''}`}
                // pointerdown 时回填，preventDefault 保住输入框焦点
                onPointerDown={(e) => {
                  e.preventDefault();
                  applyTag(s.tag);
                }}
                onPointerEnter={() => setHighlight(i)}
              >
                <span className="name">#{s.tag}</span>
                <span className="count mono">{s.count}</span>
              </button>
            ))}
          </div>
        )}
      </form>
    </header>
  );
}
