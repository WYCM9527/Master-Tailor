import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useViewTransitionState } from 'react-router-dom';
import type { Effect } from '../contract/types';
import { BG_DARK } from '../contract/types';
import { FONTS_CSS_HREF } from '../contract/fonts';
import { bakeCode } from '../engine/bakeCode';
import { defaultValues } from '../engine/urlState';
import { IconArrowRight } from './Icons';

/** 卡片预览的设计视口：效果按这个尺寸渲染（与详情页舞台比例一致），再整体等比缩进卡片 */
const DESIGN_W = 1280;
const DESIGN_H = 720;

/** 距视口多近开始挂载 / 恢复运行；离开这个范围就暂停 */
const NEAR_MARGIN = '240px';
/** 离视口多远才真正卸载 iframe（留出滞后区，来回滚动不反复重建） */
const FAR_MARGIN = '150% 0px';

/**
 * 效果页的效果 Cell（效果区内部 3 列之一）：
 * - 预览铺满 Cell（16:9，与详情页舞台同比例），IntersectionObserver 接近视口才挂载 iframe
 * - iframe 固定按 1280×720 设计视口渲染，再 transform: scale 等比缩小到卡片宽度——
 *   避免整屏效果在小视口下文字换行 / 溢出错乱（如 Hero 图文轮播）
 * - 性能：几百张卡不能同时活着。滚出「近区」就给 iframe 发 mt:visible=false，runtime 把它
 *   整体暂停（rAF 挂起、CSS 动画暂停、document.hidden 置真）；滚出「远区」直接卸载 iframe，
 *   滚回来再重建。任一时刻真正在跑的只有视口附近的十来张
 * - 底部标题条，悬停整条黑白反转、箭头右移
 * - iframe 常态 pointer-events:none，整 Cell 可点击进详情；
 *   Cell 把真实鼠标坐标（换算回设计坐标）postMessage 给 iframe，thumb 演示块可跟随真实指针
 * - 转场承接：仅当本卡参与转场时给预览挂 stage、标题挂 title，
 *   与详情页的舞台 / h1 形成共享元素形变（文档内名字唯一）
 */
export function EffectCard({ effect }: { effect: Effect }) {
  const { meta } = effect;
  const rootRef = useRef<HTMLAnchorElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [scale, setScale] = useState(0);
  const to = `/e/${meta.slug}`;
  const transitioning = useViewTransitionState(to);
  // 把效果页当前的筛选（cat/sub/tag/q）随跳转带进详情页，返回时原样恢复
  const { search } = useLocation();

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    // 近区：进入 → 挂载并运行；离开 → 暂停
    const near = new IntersectionObserver(
      (entries) => {
        const on = entries.some((e) => e.isIntersecting);
        setVisible(on);
        if (on) setMounted(true);
      },
      { rootMargin: NEAR_MARGIN },
    );
    // 远区：离开 → 卸载（进入不做事，挂载交给近区）
    const far = new IntersectionObserver(
      (entries) => {
        if (entries.every((e) => !e.isIntersecting)) setMounted(false);
      },
      { rootMargin: FAR_MARGIN },
    );
    near.observe(el);
    far.observe(el);
    return () => {
      near.disconnect();
      far.disconnect();
    };
  }, []);

  // 可见性变化 → 通知 iframe 暂停 / 恢复；iframe 重建完成时也补发一次当前状态
  const postVisible = (v: boolean) => {
    iframeRef.current?.contentWindow?.postMessage({ type: 'mt:visible', visible: v }, '*');
  };
  useEffect(() => {
    postVisible(visible);
  }, [visible]);

  // 卡片宽度 → 缩放比（随窗口尺寸变化持续更新）
  useEffect(() => {
    const el = previewRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setScale(el.clientWidth / DESIGN_W));
    ro.observe(el);
    return () => ro.disconnect();
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
    if (!iframe || scale <= 0) return;
    const rect = iframe.getBoundingClientRect();
    // 视觉坐标换算回 1280×720 设计坐标
    iframe.contentWindow?.postMessage(
      { type: 'mt:pointer', x: (e.clientX - rect.left) / scale, y: (e.clientY - rect.top) / scale },
      '*',
    );
  };

  return (
    <Link
      to={to}
      viewTransition
      state={{ fromSearch: search }}
      className="cell card"
      ref={rootRef}
      onMouseMove={forwardPointer}
    >
      <div
        ref={previewRef}
        className="card-preview"
        style={{ viewTransitionName: transitioning ? 'stage' : undefined }}
      >
        {mounted && scale > 0 ? (
          <iframe
            ref={iframeRef}
            srcDoc={srcdoc}
            onLoad={() => postVisible(visible)}
            sandbox="allow-scripts allow-same-origin"
            title={`${meta.name} 预览`}
            loading="lazy"
            tabIndex={-1}
            width={DESIGN_W}
            height={DESIGN_H}
            style={{ transform: `scale(${scale})` }}
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
