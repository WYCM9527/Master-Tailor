import { useRef } from 'react';
import { Link, useViewTransitionState } from 'react-router-dom';
import { ChalkLines } from '../../components/ChalkLines';
import { CountUp } from '../../components/CountUp';
import { HeroSwatches } from '../../components/HeroSwatches';
import { IconArrowRight, IconPin } from '../../components/Icons';
import { TapeTicker } from '../../components/TapeTicker';
import { CATEGORIES } from '../../contract/categories';
import { EFFECTS } from '../../contract/registry';

/**
 * 记住最近一次进入效果页的入口格（模块级，跨路由存活）。
 * 入口 Link 的 pathname 都是 /effects，useViewTransitionState 无法区分点的是哪一格，
 * 转场期间只让这一格的标题持有 heading 名——正向长成效果页大标题，返回时大标题缩回同一格。
 */
let lastEffectsEntry: string | null = null;

/**
 * 首页 = 一屏海报（撑满视口，不再往下滚）：
 *   Hero 行（巨字 8 栏 + 元数据 4 栏）——巨字格顶部是珠针 kicker 与一排活体布样卡，鼠标划过有划粉十字线；
 *   软尺通栏（静止刻度 + 全部效果名滑过）
 *   三步 Cell + 「浏览全部效果」大入口 Cell
 * 分类浏览与效果网格都在 /effects（Gallery）。
 * 装饰元素全部黑白灰、1px 线、IconPark 图标；软尺滑动与数字翻滚尊重 prefers-reduced-motion。
 */
export function Home() {
  // 与 /effects 互转（含浏览器后退）期间为 true
  const toEffects = useViewTransitionState('/effects');
  const headingName = (entry: string): React.CSSProperties => ({
    viewTransitionName: toEffects && lastEffectsEntry === entry ? 'heading' : undefined,
  });
  const heroRef = useRef<HTMLDivElement>(null);

  return (
    <section className="g12 first hero" aria-label="站点介绍">
      <div className="cell span-8 hero-title" ref={heroRef}>
        <span className="mono hero-kicker">
          <IconPin size={14} />
          Master-Tailor — 前端效果图鉴 · 复制 prompt 粘给你的 AI
        </span>
        <HeroSwatches />
        <h1>裁缝大师</h1>
        <p className="hero-slogan">
          我们不做设计，我们只是<em>界面的裁缝师</em>。
        </p>
        <ChalkLines target={heroRef} />
      </div>
      <div className="span-4 sub hero-meta">
        <div className="cell span-4">
          <span className="big">
            <CountUp value={EFFECTS.length} pad={2} />
          </span>
          <span className="mono">Effects · 效果</span>
        </div>
        <div className="cell span-4">
          <span className="big">
            <CountUp value={CATEGORIES.length} pad={2} />
          </span>
          <span className="mono">Categories · 分类</span>
        </div>
        <div className="cell span-4">
          <span className="big">
            <CountUp value={2026} />
          </span>
          <span className="mono">Edition · 持续更新 · {__BUILD_DATE__}</span>
        </div>
      </div>
      <TapeTicker />
      <div className="cell span-2 step">
        <span className="idx">01</span>
        <b>挑一个效果</b>
      </div>
      <div className="cell span-2 step">
        <span className="idx">02</span>
        <b>调成你要的样子</b>
      </div>
      <div className="cell span-2 step">
        <span className="idx">03</span>
        <b>复制 prompt 粘给你的 AI</b>
      </div>
      <Link
        to="/effects"
        viewTransition
        className="cell span-6 step step-cta"
        onClick={() => (lastEffectsEntry = 'cta')}
      >
        <b className="cta-copy" style={headingName('cta')}>
          浏览全部 {EFFECTS.length} 个效果
        </b>
        <IconArrowRight className="arrow cta-arrow" size={72} />
      </Link>
    </section>
  );
}
