import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useViewTransitionState } from 'react-router-dom';
import type { Effect } from '../contract/types';
import { BG_DARK } from '../contract/types';
import { FONTS_CSS_HREF } from '../contract/fonts';
import { bakeCode } from '../engine/bakeCode';
import { defaultValues } from '../engine/urlState';
import { IconArrowRight } from './Icons';

/**
 * 效果页的效果 Cell（效果区内部 3 列之一）：
 * - 预览铺满 Cell（16:9，与详情页舞台同比例），IntersectionObserver 首次进入视口才挂载 iframe
 * - 底部标题条，悬停整条黑白反转、箭头右移
 * - iframe 常态 pointer-events:none，整 Cell 可点击进详情；
 *   Cell 把真实鼠标坐标 postMessage 给 iframe，交互类效果的 thumb 演示块可跟随真实指针
 * - 转场承接：仅当本卡参与转场时给预览挂 stage、标题挂 title，
 *   与详情页的舞台 / h1 形成共享元素形变（文档内名字唯一）
 */
export function EffectCard({ effect }: { effect: Effect }) {
  const { meta } = effect;
  const rootRef = useRef<HTMLAnchorElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [mounted, setMounted] = useState(false);
  const to = `/e/${meta.slug}`;
  const transitioning = useViewTransitionState(to);

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
    <Link to={to} viewTransition className="cell card" ref={rootRef} onMouseMove={forwardPointer}>
      <div
        className="card-preview"
        style={{ viewTransitionName: transitioning ? 'stage' : undefined }}
      >
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
          <span
            className="name"
            style={{ viewTransitionName: transitioning ? 'title' : undefined }}
          >
            {meta.name}
          </span>
          <span className="summary">{meta.summary}</span>
        </span>
        <IconArrowRight className="arrow card-arrow" />
      </div>
    </Link>
  );
}
