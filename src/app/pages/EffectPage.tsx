import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import type { Effect, EffectSource, EffectState } from '../../contract/types';
import { BG_DARK, BG_LIGHT, bgColor } from '../../contract/types';
import { categoryName, subDef } from '../../contract/categories';
import { FONTS_CSS_HREF } from '../../contract/fonts';
import { EFFECT_BY_SLUG } from '../../contract/registry';
import { bakeCode, collectCssVars, configSignature } from '../../engine/bakeCode';
import { renderPrompt } from '../../engine/renderPrompt';
import { decodeState, encodeState } from '../../engine/urlState';
import { ParamPanel } from '../../components/ParamPanel';
import { PreviewFrame } from '../../components/PreviewFrame';
import { PromptPanel } from '../../components/PromptPanel';
import { CodePanel } from '../../components/CodePanel';
import { NotFound } from './NotFound';

export function EffectRoute() {
  const { slug } = useParams();
  const effect = slug ? EFFECT_BY_SLUG.get(slug) : undefined;
  if (!effect) return <NotFound />;
  // key 保证切换效果时整页状态重置
  return <EffectPage key={effect.meta.slug} effect={effect} />;
}

function sourceLine(source: EffectSource) {
  const link =
    source.url && source.name ? (
      <a href={source.url} target="_blank" rel="noreferrer">
        {source.name}
      </a>
    ) : (
      source.name ?? null
    );
  switch (source.kind) {
    case 'original':
      return <>原创效果，代码由本站自写，可自由复制使用。</>;
    case 'reference':
      return (
        <>
          实现思路参考了开源项目 {link}
          {source.license ? `（${source.license} 许可）` : ''}，代码为本站重写，可自由复制使用。
        </>
      );
    case 'visual-inspiration':
      return <>视觉灵感来自 {link}（未使用其代码），本站实现为自写，可自由复制使用。</>;
  }
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
        bg: state.bg,
        placement: state.placement,
        includeCode: state.includeCode,
        exportedCode: state.includeCode ? exportCode : undefined,
      }),
    [meta, effect.promptMd, state, exportCode],
  );

  // 事件处理器闭包随每次渲染更新，点击时拿到的 state 就是最新值
  const getShareUrl = () => {
    const sp = encodeState(meta, state);
    const qs = sp.toString();
    return `${location.origin}${location.pathname}#/e/${meta.slug}${qs ? `?${qs}` : ''}`;
  };

  const stageRef = useRef<HTMLDivElement>(null);
  const enterFullscreen = () => void stageRef.current?.requestFullscreen?.();

  const setBg = (bgSetting: EffectState['bg']) => setState((s) => ({ ...s, bg: bgSetting }));
  const customColor = state.bg.mode === 'custom' ? state.bg.color : '#22335c';

  return (
    <div className="container effect-page">
      <div className="effect-head">
        {/* 返回时带上分类，让侧边栏停在这个效果所在的位置 */}
        <Link to={`/?cat=${meta.category}&sub=${meta.sub}`} className="back-link">
          ← {categoryName(meta.category)} · {subDef(meta.category, meta.sub).name}
        </Link>
        <h1 className="effect-title">{meta.name}</h1>
        <span className="card-cat">{categoryName(meta.category)}</span>
        <span className="card-cat">{subDef(meta.category, meta.sub).name}</span>
        <div className="effect-tags">
          {meta.tags.map((t) => (
            <span className="effect-tag" key={t}>
              {t}
            </span>
          ))}
        </div>
      </div>

      <div className="effect-layout">
        <div className="effect-main">
          <div className="preview-wrap glass">
            <div className="preview-toolbar">
              <div className="preview-toolbar-group">
                <span className="toolbar-label">预览底色</span>
                <button
                  type="button"
                  className={`bg-swatch${state.bg.mode === 'dark' ? ' active' : ''}`}
                  style={{ background: BG_DARK }}
                  title="深色底"
                  onClick={() => setBg({ mode: 'dark' })}
                />
                <button
                  type="button"
                  className={`bg-swatch${state.bg.mode === 'light' ? ' active' : ''}`}
                  style={{ background: BG_LIGHT }}
                  title="浅色底"
                  onClick={() => setBg({ mode: 'light' })}
                />
                <span
                  className={`bg-swatch${state.bg.mode === 'custom' ? ' active' : ''}`}
                  style={{
                    background:
                      state.bg.mode === 'custom'
                        ? customColor
                        : 'conic-gradient(#f9cf00, #3d5afe, #00bcd4, #f9cf00)',
                  }}
                  title="自定义底色"
                >
                  <input
                    type="color"
                    value={customColor}
                    onChange={(e) => setBg({ mode: 'custom', color: e.target.value })}
                    aria-label="自定义预览底色"
                  />
                </span>
                <span className="muted">底色会写进 prompt，让 AI 知道效果用在什么背景上</span>
              </div>
              <div className="preview-toolbar-group">
                <button type="button" className="btn" onClick={enterFullscreen}>
                  全屏预览
                </button>
              </div>
            </div>
            <div className="preview-stage" ref={stageRef}>
              <PreviewFrame srcdoc={srcdoc} cssVars={cssVars} title={`${meta.name} 实时预览`} />
            </div>
          </div>

          <PromptPanel
            promptText={promptText}
            placement={state.placement}
            onPlacementChange={(v) => setState((s) => ({ ...s, placement: v }))}
            includeCode={state.includeCode}
            onIncludeCodeChange={(v) => setState((s) => ({ ...s, includeCode: v }))}
            getShareUrl={getShareUrl}
          />

          <CodePanel code={exportCode} slug={meta.slug} />

          <p className="source-note">{sourceLine(meta.source)}</p>
        </div>

        <ParamPanel
          meta={meta}
          values={state.values}
          onChange={(values) => setState((s) => ({ ...s, values }))}
        />
      </div>
    </div>
  );
}
