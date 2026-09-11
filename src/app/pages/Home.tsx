import { Link, useViewTransitionState } from 'react-router-dom';
import { IconArrowRight } from '../../components/Icons';
import { CATEGORIES } from '../../contract/categories';
import { EFFECTS } from '../../contract/registry';

const pad2 = (n: number) => String(n).padStart(2, '0');

/**
 * 记住最近一次进入效果页的入口格（模块级，跨路由存活）。
 * 入口 Link 的 pathname 都是 /effects，useViewTransitionState 无法区分点的是哪一格，
 * 转场期间只让这一格的标题持有 heading 名——正向长成效果页大标题，返回时大标题缩回同一格。
 */
let lastEffectsEntry: string | null = null;

/**
 * 首页 = 一屏海报（撑满视口，不再往下滚）：
 *   Hero 行（巨字 8 栏 + 元数据 4 栏）
 *   三步 Cell + 「浏览全部效果」大入口 Cell
 * 分类浏览与效果网格都在 /effects（Gallery）。
 */
export function Home() {
  // 与 /effects 互转（含浏览器后退）期间为 true
  const toEffects = useViewTransitionState('/effects');
  const headingName = (entry: string): React.CSSProperties => ({
    viewTransitionName: toEffects && lastEffectsEntry === entry ? 'heading' : undefined,
  });

  return (
    <section className="g12 first hero" aria-label="站点介绍">
      <div className="cell span-8 hero-title">
        <span className="mono">Master-Tailor — 前端效果图鉴 · 复制 prompt 粘给你的 AI</span>
        <h1>裁缝大师</h1>
        <p className="hero-slogan">
          我们不做设计，我们只是<em>界面的裁缝师</em>。
        </p>
      </div>
      <div className="span-4 sub hero-meta">
        <div className="cell span-4">
          <span className="big">{pad2(EFFECTS.length)}</span>
          <span className="mono">Effects · 效果</span>
        </div>
        <div className="cell span-4">
          <span className="big">{pad2(CATEGORIES.length)}</span>
          <span className="mono">Categories · 分类</span>
        </div>
        <div className="cell span-4">
          <span className="big">2026</span>
          <span className="mono">Edition · 持续更新</span>
        </div>
      </div>
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
        <span className="mono">Index · 全部效果入口</span>
        <b style={headingName('cta')}>
          浏览全部 {EFFECTS.length} 个效果 <IconArrowRight className="arrow" size={18} />
        </b>
      </Link>
    </section>
  );
}
