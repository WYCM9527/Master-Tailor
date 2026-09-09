import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Effect } from '../contract/types';
import { BG_DARK } from '../contract/types';
import { subDef } from '../contract/categories';
import { FONTS_CSS_HREF } from '../contract/fonts';
import { effectNo } from '../contract/registry';
import { bakeCode } from '../engine/bakeCode';
import { defaultValues } from '../engine/urlState';

/**
 * 首页效果 Cell（占 3 栏）：
 * - 顶部 Mono 元数据条（编号 · 子类）
 * - 预览铺满 Cell（4:3），IntersectionObserver 首次进入视口才挂载 iframe
 * - 底部标题条，悬停整条黑白反转、箭头右移
 * - iframe 常态 pointer-events:none，整 Cell 可点击进详情；
 *   Cell 把真实鼠标坐标 postMessage 给 iframe，交互类效果的 thumb 演示块可跟随真实指针
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
      className="cell span-3 card"
      ref={rootRef}
      onMouseMove={forwardPointer}
    >
      <div className="card-meta">
        <span className="mono">No. {effectNo(effect)}</span>
        <span className="mono">{subDef(meta.category, meta.sub).name}</span>
      </div>
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
      <div className="card-caption">
        <span>
          <span className="name">{meta.name}</span>
          <span className="summary">{meta.summary}</span>
        </span>
        <span className="arrow">→</span>
      </div>
    </Link>
  );
}
