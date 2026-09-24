import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { flushSync } from 'react-dom';
import { Link, useLocation, useParams, useSearchParams } from 'react-router-dom';
import type { EffectBundle, EffectIndex, EffectState } from '../../contract/types';
import { bgColor } from '../../contract/types';
import { categoryName, subDef } from '../../contract/categories';
import { FONTS_CSS_HREF } from '../../contract/fonts';
import { BASE_URL } from '../../contract/base';
import { EFFECT_BY_SLUG } from '../../contract/registry';
import { bakeCode, collectCssVars, configSignature } from '../../engine/bakeCode';
import { renderPrompt } from '../../engine/renderPrompt';
import { decodeState, encodeState } from '../../engine/urlState';
import { ParamPanel } from '../../components/ParamPanel';
import { PreviewFrame } from '../../components/PreviewFrame';
import { PromptCell } from '../../components/PromptPanel';
import { CodePanel } from '../../components/CodePanel';
import { EffectNav } from '../../components/EffectNav';
import { IconArrowLeft, IconMenu } from '../../components/Icons';
import { useEffectBundle } from '../../components/useEffectBundle';
import { NotFound } from './NotFound';

export function EffectRoute() {
  const { slug } = useParams();
  const effect = slug ? EFFECT_BY_SLUG.get(slug) : undefined;
  if (!effect) return <NotFound />;
  // key 保证切换效果时整页状态重置
  return <EffectPage key={effect.meta.slug} index={effect.meta} />;
}

/**
 * 详情页外壳：持有目录抽屉状态，等效果包（完整 meta + 源码）到达后再渲染正文。
 * 从效果页点卡进来时卡片已拉过效果包、同步命中，正文首帧即在，转场承接不受影响；
 * 直达链接 / 目录内切换时先渲染同布局的骨架（页头 + 深底舞台），到达后原位换成正文。
 */
function EffectPage({ index }: { index: EffectIndex }) {
  const bundle = useEffectBundle(index.slug);
  const location = useLocation();
  // 从效果页跳来时带的筛选（cat/sub/tag/q），返回链接原样恢复
  const fromSearch = (location.state as { fromSearch?: string } | null)?.fromSearch;

  // 悬浮目录（左侧抽屉），切换效果时随页面重建自动关闭
  const [navOpen, setNavOpen] = useState(false);
  // 开关走与路由转场同款的 View Transition：☰（左上角）与 ×（抽屉头部右侧）共享 nav-toggle 名，
  // 图标随开合在两个位置之间形变；不支持的浏览器直接切换
  const toggleNav = (open: boolean) => {
    if (!document.startViewTransition) {
      setNavOpen(open);
      return;
    }
    document.startViewTransition(() => {
      flushSync(() => setNavOpen(open));
    });
  };

  const head = (
    <EffectHead
      index={index}
      fromSearch={fromSearch}
      navOpen={navOpen}
      onOpenNav={() => toggleNav(true)}
    />
  );

  return (
    <>
      <EffectNav
        current={index.slug}
        open={navOpen}
        onClose={() => toggleNav(false)}
        onNavigate={() => setNavOpen(false)}
      />
      {bundle ? (
        <EffectBody bundle={bundle} head={head} />
      ) : (
        <div className="g12 first d-body">
          <div className="span-9 sub d-left">
            {head}
            {/* 转场承接：与效果卡预览共享 stage 名；舞台自身的深底就是骨架 */}
            <div className="cell span-9 d-stage tight" style={{ viewTransitionName: 'stage' }} />
            <div className="blk-row" />
          </div>
          <div className="cell span-3 d-right-col" />
        </div>
      )}
    </>
  );
}

/** 详情页页头：目录开关 | 返回 | 标题 | 标签。骨架与正文共用，保证到达前后布局一致 */
function EffectHead({
  index,
  fromSearch,
  navOpen,
  onOpenNav,
}: {
  index: EffectIndex;
  fromSearch: string | undefined;
  navOpen: boolean;
  onOpenNav: () => void;
}) {
  const subName = subDef(index.category, index.sub).name;
  return (
    <>
      {/* 详情页不渲染站点 Header：左列第一行（目录 | 返回 | 标题 | 标签）就是页头，右列整高都是参数面板 */}
      {/* 页头前三格并为一格：目录开关是 55px 正方钮，返回按文字宽，标题吃掉剩余宽度 */}
      <div className="cell span-6 tight d-lead">
        {/* 展开后抽屉盖住此钮，开关图标沿转场从这里飞到抽屉头部右侧的同尺寸方钮 */}
        <button
          type="button"
          className="d-nav"
          aria-expanded={navOpen}
          aria-label="展开效果目录"
          title="展开效果目录"
          onClick={onOpenNav}
        >
          <IconMenu size={20} style={{ viewTransitionName: navOpen ? undefined : 'nav-toggle' }} />
        </button>
        {/* 返回时恢复来路的筛选（含搜索词）；直达详情页时退回本效果所在分类 */}
        <Link
          to={`/effects${fromSearch ?? `?cat=${index.category}&sub=${index.sub}`}`}
          viewTransition
          className="d-back"
          title={`返回 ${categoryName(index.category)} · ${subName}`}
        >
          <IconArrowLeft className="arrow arrow-back" />
          返回
        </Link>
        <div className="d-title">
          {/* 转场承接：与效果卡标题共享 title 名 */}
          <h1 style={{ viewTransitionName: 'title' }}>{index.name}</h1>
        </div>
      </div>
      <div className="cell span-3 d-meta">
        <div className="tag-row">
          {index.tags.map((t) => (
            <span className="tag" key={t}>
              {t}
            </span>
          ))}
        </div>
      </div>
    </>
  );
}

function EffectBody({ bundle, head }: { bundle: EffectBundle; head: ReactNode }) {
  const { meta } = bundle;
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  // URL -> state 只在首次挂载时读取；此后 state 是唯一事实源，反向防抖同步进 URL
  const [state, setState] = useState<EffectState>(() => decodeState(meta, searchParams));

  useEffect(() => {
    const t = window.setTimeout(() => {
      // preventScrollReset：参数同步进 URL 的 replace 不触发 ScrollRestoration 回顶；
      // state 透传保住跳转时带来的 fromSearch（replace 导航默认会丢弃 location.state）
      setSearchParams(encodeState(meta, state), {
        replace: true,
        preventScrollReset: true,
        state: location.state,
      });
    }, 250);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- location.state 只作透传，不触发同步
  }, [state, meta, setSearchParams]);

  const bg = bgColor(state.bg);
  const cssVars = useMemo(
    () => collectCssVars(meta, state.values, bg, BASE_URL),
    [meta, state.values, bg],
  );

  // config 参数（文本 / 数量 / 图片等）变化时防抖重建 iframe；样式参数走 postMessage 热更新。
  // srcdoc 放在 state 里，由防抖 effect 更新——刻意不把 state.values 写进依赖，
  // 因为纯样式参数的变化不应该触发 iframe 重建（它们走热更新通道）。
  const configSig = configSignature(meta, state.values);
  const [srcdoc, setSrcdoc] = useState(() =>
    bakeCode({
      meta,
      html: bundle.html,
      values: state.values,
      bg,
      mode: 'preview',
      fontsCssHref: FONTS_CSS_HREF,
      baseUrl: BASE_URL,
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
          html: bundle.html,
          values: state.values,
          bg: bgColor(state.bg),
          mode: 'preview',
          fontsCssHref: FONTS_CSS_HREF,
          baseUrl: BASE_URL,
        }),
      );
    }, 300);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在 config 签名变化时重建
  }, [configSig, bundle, meta]);

  const exportCode = useMemo(
    () => bakeCode({ meta, html: bundle.html, values: state.values, bg, mode: 'export' }),
    [meta, bundle.html, state.values, bg],
  );

  // 站点地址（含子路径）：prompt 里参考实现 / 参数表的抓取地址前缀；预览地址带当前参数，供人核对
  const siteUrl = `${window.location.origin}${BASE_URL}`;
  const promptText = useMemo(() => {
    const query = encodeState(meta, state).toString();
    return renderPrompt({
      meta,
      promptMd: bundle.promptMd,
      values: state.values,
      includeCode: state.includeCode,
      exportedCode: state.includeCode ? exportCode : undefined,
      siteUrl,
      previewUrl: `${siteUrl}#/e/${meta.slug}${query ? `?${query}` : ''}`,
    });
  }, [meta, bundle.promptMd, state, exportCode, siteUrl]);

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

  return (
    <div className="g12 first d-body">
      <div className="span-9 sub d-left">
        {head}

        {/* 转场承接：与效果卡预览共享 stage 名 */}
        <div
          className={`cell span-9 d-stage tight${idle ? ' idle' : ''}`}
          ref={stageRef}
          style={{ viewTransitionName: 'stage' }}
        >
          <PreviewFrame srcdoc={srcdoc} cssVars={cssVars} title={`${meta.name} 实时预览`} />
          {isFullscreen && (
            <button type="button" className="btn fs-exit" onClick={exitFullscreen}>
              退出预览
            </button>
          )}
        </div>
        {/* 预览下方：Prompt 与参考代码各占一半 */}
        <div className="blk-row">
          <PromptCell
            promptText={promptText}
            includeCode={state.includeCode}
            onIncludeCodeChange={(v) => setState((s) => ({ ...s, includeCode: v }))}
          />
          <CodePanel code={exportCode} slug={meta.slug} />
        </div>
      </div>

      <div className="cell span-3 d-right-col">
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
  );
}
