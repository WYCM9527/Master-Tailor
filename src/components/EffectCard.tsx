import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Effect } from '../contract/types';
import { BG_DARK } from '../contract/types';
import { categoryName } from '../contract/categories';
import { FONTS_CSS_HREF } from '../contract/fonts';
import { bakeCode } from '../engine/bakeCode';
import { defaultValues } from '../engine/urlState';

/**
 * 首页效果卡片：
 * - IntersectionObserver 首次进入视口才挂载 iframe（懒加载）
 * - iframe 常态 pointer-events:none，整卡可点击进详情
 * - 卡片把真实鼠标坐标 postMessage 给 iframe，交互类效果的 thumb 演示块可跟随真实指针
 */
export function EffectCard({ effect }: { effect: Effect }) {
  const { meta } = effect;
  const rootRef = useRef<HTMLAnchorElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setMounted(true);
          io.disconnect();
        }
      },
      { rootMargin: '240px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const srcdoc = useMemo(() => {
    if (!mounted) return '';
    return bakeCode({
      meta,
      html: effect.html,
      values: defaultValues(meta),
      bg: BG_DARK,
      mode: 'preview',
      thumb: true,
      fontsCssHref: FONTS_CSS_HREF,
    });
  }, [mounted, effect, meta]);

  const forwardPointer = (e: React.MouseEvent) => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    const rect = iframe.getBoundingClientRect();
    iframe.contentWindow?.postMessage(
      { type: 'mt:pointer', x: e.clientX - rect.left, y: e.clientY - rect.top },
      '*',
    );
  };

  return (
    <Link
      to={`/e/${meta.slug}`}
      className="card glass"
      ref={rootRef}
      onMouseMove={forwardPointer}
    >
      <div className="card-preview">
        {mounted ? (
          <iframe
            ref={iframeRef}
            srcDoc={srcdoc}
            sandbox="allow-scripts allow-same-origin"
            title={`${meta.name} 预览`}
            loading="lazy"
            tabIndex={-1}
          />
        ) : (
          <div className="card-skeleton" />
        )}
      </div>
      <div className="card-info">
        <div className="card-title-row">
          <span className="card-name">{meta.name}</span>
          <span className="card-cat">{categoryName(meta.category)}</span>
        </div>
        <span className="card-summary">{meta.summary}</span>
      </div>
    </Link>
  );
}
