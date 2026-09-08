import { Route, Routes } from 'react-router-dom';
import { AmbientBackground } from '../components/AmbientBackground';
import { TopBar } from '../components/TopBar';
import { Home } from './pages/Home';
import { EffectRoute } from './pages/EffectPage';
import { NotFound } from './pages/NotFound';

export function App() {
  return (
    <>
      <AmbientBackground />
      <div className="narrow-banner">本站为桌面端设计，建议在电脑浏览器中打开，体验完整的调参与预览。</div>
      <TopBar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/e/:slug" element={<EffectRoute />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <footer className="footer">
        <div className="container">
          裁缝大师 Master-Tailor · 个人项目 · 所有效果代码可自由复制使用 · 自托管字体均为 OFL 开源字体
        </div>
      </footer>
    </>
  );
}
