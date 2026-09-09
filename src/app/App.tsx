import { useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { TopBar } from '../components/TopBar';
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
      {/* 页面底边：最后一段网格的收口线 */}
      <div className="page-end" aria-hidden="true" />
    </>
  );
}
