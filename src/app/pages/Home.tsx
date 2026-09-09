import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import type { CategoryId } from '../../contract/types';
import { CATEGORIES } from '../../contract/categories';
import { EFFECTS } from '../../contract/registry';
import { HowToSection } from '../../components/HowToSection';

const pad2 = (n: number) => String(n).padStart(2, '0');

function countIn(cat: CategoryId, sub?: string): number {
  return EFFECTS.filter((e) => e.meta.category === cat && (!sub || e.meta.sub === sub)).length;
}

/**
 * 首页 = 海报：
 *   Hero 行（巨字 8 栏 + 元数据 4 栏）
 *   三步 Cell + 「浏览全部效果」大入口 Cell
 *   分类索引 Cell（每格进入效果页对应分类）
 *   怎么用
 * 效果网格本身在 /effects（Gallery）。
 */
export function Home() {
  const location = useLocation();

  // 从其他页面点「怎么用」跳回来时滚到对应区块
  useEffect(() => {
    const target = (location.state as { scrollTo?: string } | null)?.scrollTo;
    if (target) document.getElementById(target)?.scrollIntoView({ block: 'start' });
  }, [location.state]);

  return (
    <>
      <section className="g12 hero" aria-label="站点介绍">
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
        <Link to="/effects" className="cell span-6 step step-cta">
          <span className="mono">Index · 全部效果入口</span>
          <b>
            浏览全部 {EFFECTS.length} 个效果 <span className="arrow">→</span>
          </b>
        </Link>
      </section>

      <section className="g12" aria-label="分类索引">
        <div className="cell span-12 howto-head">
          <h2>分类索引</h2>
          <span className="mono">{pad2(CATEGORIES.length)} categories · 点进任意一格</span>
        </div>
        <Link to="/effects" className="cell span-4 cat-cell">
          <div className="cat-top">
            <span className="mono">00</span>
            <span className="mono">{pad2(EFFECTS.length)} effects</span>
          </div>
          <h3>全部效果</h3>
          <p className="cat-subs">不分类，从头到尾全部看一遍。</p>
          <div className="cat-foot">
            <span className="mono">All</span>
            <span className="arrow">→</span>
          </div>
        </Link>
        {CATEGORIES.map((c, i) => {
          const subs = c.subs.filter((s) => countIn(c.id, s.id) > 0);
          return (
            <Link to={`/effects?cat=${c.id}`} className="cell span-4 cat-cell" key={c.id}>
              <div className="cat-top">
                <span className="mono">{pad2(i + 1)}</span>
                <span className="mono">{pad2(countIn(c.id))} effects</span>
              </div>
              <h3>{c.name}</h3>
              <p className="cat-subs">
                {subs.map((s) => `${s.name} ${countIn(c.id, s.id)}`).join(' · ')}
              </p>
              <div className="cat-foot">
                <span className="mono">{c.id}</span>
                <span className="arrow">→</span>
              </div>
            </Link>
          );
        })}
        {/* 8 格之后补一格，让第三行也铺满栏线 */}
        <div className="cell span-4 cat-cell cat-note">
          <span className="mono">More</span>
          <p className="cat-subs">
            效果持续加入。每个效果都可以调参、实时预览、复制 prompt 与参考代码。
          </p>
        </div>
      </section>

      <HowToSection />
    </>
  );
}
