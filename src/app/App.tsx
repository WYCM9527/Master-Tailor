import { useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { TopBar } from '../components/TopBar';
import { CATEGORIES } from '../contract/categories';
import { EFFECTS } from '../contract/registry';
import { Home } from './pages/Home';
import { Gallery } from './pages/Gallery';
import { EffectRoute } from './pages/EffectPage';
import { NotFound } from './pages/NotFound';

/** 路由切换时回到页顶 */
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);
  return null;
}

export function App() {
  // 详情页不要站点 Header：它自己的第一行（返回 | 标题 | 标签）就是页头
  const isDetail = useLocation().pathname.startsWith('/e/');
  return (
    <>
      <ScrollToTop />
      {!isDetail && <TopBar />}
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/effects" element={<Gallery />} />
          <Route path="/e/:slug" element={<EffectRoute />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <footer className="g12 foot">
        <div className="cell span-3 mono">裁缝大师 · MASTER-TAILOR</div>
        <div className="cell span-6 mono">
          {String(EFFECTS.length).padStart(2, '0')} EFFECTS ·{' '}
          {String(CATEGORIES.length).padStart(2, '0')} CATEGORIES · 所有效果代码可自由复制使用
        </div>
        <div className="cell span-3 mono right">字体 OFL · 示例照片 免费可商用</div>
      </footer>
    </>
  );
}
