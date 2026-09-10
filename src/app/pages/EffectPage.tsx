import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import type { Effect, EffectState } from '../../contract/types';
import { bgColor } from '../../contract/types';
import { categoryName, subDef } from '../../contract/categories';
import { FONTS_CSS_HREF } from '../../contract/fonts';
import { EFFECT_BY_SLUG } from '../../contract/registry';
import { bakeCode, collectCssVars, configSignature } from '../../engine/bakeCode';
import { renderPrompt } from '../../engine/renderPrompt';
import { decodeState, encodeState } from '../../engine/urlState';
import { ParamPanel } from '../../components/ParamPanel';
import { PreviewFrame } from '../../components/PreviewFrame';
import { PromptCell } from '../../components/PromptPanel';
import { CodePanel } from '../../components/CodePanel';
import { NotFound } from './NotFound';

export function EffectRoute() {
  const { slug } = useParams();
  const effect = slug ? EFFECT_BY_SLUG.get(slug) : undefined;
  if (!effect) return <NotFound />;
  // key 保证切换效果时整页状态重置
  return <EffectPage key={effect.meta.slug} effect={effect} />;
}

function EffectPage({ effect }: { effect: Effect }) {
  const { meta } = effect;
  const [searchParams, setSearchParams] = useSearchParams();
  // URL -> state 只在首次挂载时读取；此后 state 是唯一事实源，反向防抖同步进 URL
  const [state, setState] = useState<EffectState>(() => decodeState(meta, searchParams));

  useEffect(() => {
    const t = window.setTimeout(() => {
      setSearchParams(encodeState(meta, state), { replace: true });
    }, 250);
    return () => window.clearTimeout(t);
  }, [state, meta, setSearchParams]);

  const bg = bgColor(state.bg);
  const cssVars = useMemo(() => collectCssVars(meta, state.values, bg), [meta, state.values, bg]);

  // config 参数（文本 / 数量 / 图片等）变化时防抖重建 iframe；样式参数走 postMessage 热更新。
  // srcdoc 放在 state 里，由防抖 effect 更新——刻意不把 state.values 写进依赖，
  // 因为纯样式参数的变化不应该触发 iframe 重建（它们走热更新通道）。
  const configSig = configSignature(meta, state.values);
  const [srcdoc, setSrcdoc] = useState(() =>
    bakeCode({
      meta,
      html: effect.html,
      values: state.values,
      bg,
      mode: 'preview',
      fontsCssHref: FONTS_CSS_HREF,
    }),
  );
  const isFirstBake = useRef(true);
  useEffect(() => {
    if (isFirstBake.current) {
      isFirstBake.current = false;
      return;
    }
    const t = window.setTimeout(() => {
      setSrcdoc(
        bakeCode({
          meta,
          html: effect.html,
          values: state.values,
          bg: bgColor(state.bg),
          mode: 'preview',
          fontsCssHref: FONTS_CSS_HREF,
        }),
      );
    }, 300);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在 config 签名变化时重建
  }, [configSig, effect, meta]);

  const exportCode = useMemo(
    () => bakeCode({ meta, html: effect.html, values: state.values, bg, mode: 'export' }),
    [meta, effect.html, state.values, bg],
  );

  const promptText = useMemo(
    () =>
      renderPrompt({
        meta,
        promptMd: effect.promptMd,
        values: state.values,
        includeCode: state.includeCode,
        exportedCode: state.includeCode ? exportCode : undefined,
      }),
    [meta, effect.promptMd, state.values, state.includeCode, exportCode],
  );

  const stageRef = useRef<HTMLDivElement>(null);
  const enterFullscreen = () => void stageRef.current?.requestFullscreen?.();
  const exitFullscreen = () => void document.exitFullscreen?.();

  // 全屏态：右上角「退出预览」按钮，无操作 2 秒后隐藏。
  // iframe 盖住整个舞台时父页面收不到鼠标事件，所以活动信号来自预览 runtime 的 mt:activity 消息。
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [idle, setIdle] = useState(false);
  useEffect(() => {
    const onChange = () => {
      const fs = document.fullscreenElement === stageRef.current;
      setIsFullscreen(fs);
      if (!fs) setIdle(false);
    };
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);
  useEffect(() => {
    if (!isFullscreen) return;
    const IDLE_MS = 2000;
    let timer = window.setTimeout(() => setIdle(true), IDLE_MS);
    const wake = () => {
      setIdle(false);
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setIdle(true), IDLE_MS);
    };
    const onMessage = (e: MessageEvent) => {
      if ((e.data as { type?: string } | null)?.type === 'mt:activity') wake();
    };
    const stage = stageRef.current;
    window.addEventListener('message', onMessage);
    stage?.addEventListener('pointermove', wake);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('message', onMessage);
      stage?.removeEventListener('pointermove', wake);
    };
  }, [isFullscreen]);

  const subName = subDef(meta.category, meta.sub).name;

  return (
    <>
      {/* 详情页不渲染站点 Header，这一行就是页头：返回 | 标题 | 标签 */}
      <div className="g12 first d-head">
        {/* 返回时带上分类，让侧边栏停在这个效果所在的位置 */}
        <Link
          to={`/effects?cat=${meta.category}&sub=${meta.sub}`}
          className="cell span-1 d-back"
          title={`返回 ${categoryName(meta.category)} · ${subName}`}
        >
          <span className="arrow">←</span>
          返回
        </Link>
        <div className="cell span-4 d-title">
          <h1>{meta.name}</h1>
        </div>
        <div className="cell span-3 d-summary">
          <span className="mono">简介</span>
          <p>{meta.summary}</p>
        </div>
        <div className="cell span-4 d-meta">
          <span className="mono">Tags</span>
          <div className="tag-row">
            {meta.tags.map((t) => (
              <span className="tag" key={t}>
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="g12 d-body">
        <div className="span-8 sub d-left">
          <div className={`cell span-8 d-stage tight${idle ? ' idle' : ''}`} ref={stageRef}>
            <PreviewFrame srcdoc={srcdoc} cssVars={cssVars} title={`${meta.name} 实时预览`} />
            {isFullscreen && (
              <button type="button" className="btn fs-exit" onClick={exitFullscreen}>
                退出预览
              </button>
            )}
          </div>
          {/* 预览下方：Prompt 与参考代码各占 4 栏，均分左列 */}
          <PromptCell
            promptText={promptText}
            includeCode={state.includeCode}
            onIncludeCodeChange={(v) => setState((s) => ({ ...s, includeCode: v }))}
          />
          <CodePanel code={exportCode} slug={meta.slug} />
        </div>

        <div className="cell span-4 d-right-col">
          <div className="d-right">
            <ParamPanel
              meta={meta}
              values={state.values}
              onChange={(values) => setState((s) => ({ ...s, values }))}
              bg={state.bg}
              onBgChange={(bgSetting) => setState((s) => ({ ...s, bg: bgSetting }))}
              onFullscreen={enterFullscreen}
            />
          </div>
        </div>
      </div>
    </>
  );
}
