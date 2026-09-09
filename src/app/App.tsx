import { useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { TopBar } from '../components/TopBar';
import { CATEGORIES } from '../contract/categories';
import { EFFECTS } from '../contract/registry';
import { Home } from './pages/Home';
import { EffectRoute } from './pages/EffectPage';
import { NotFound } from './pages/NotFound';

/** 路由切换时回到页顶（首页「怎么用」跳转自带 scrollTo，交给首页处理） */
function ScrollToTop() {
  const { pathname, state } = useLocation();
  useEffect(() => {
    if ((state as { scrollTo?: string } | null)?.scrollTo) return;
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname, state]);
  return null;
}

export function App() {
  return (
    <>
      <ScrollToTop />
      <TopBar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
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
