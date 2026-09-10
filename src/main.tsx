import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createHashRouter, RouterProvider } from 'react-router-dom';
import { Layout } from './app/App';
import { Home } from './app/pages/Home';
import { Gallery } from './app/pages/Gallery';
import { EffectRoute } from './app/pages/EffectPage';
import { NotFound } from './app/pages/NotFound';
import './styles/tokens.css';
import './styles/base.css';
import './styles/app.css';
import './styles/transitions.css';

// 数据路由（createHashRouter）是 <Link viewTransition> / useViewTransitionState /
// <ScrollRestoration> 的前置条件；声明式 <HashRouter> 不支持这些能力。
const router = createHashRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'effects', element: <Gallery /> },
      { path: 'e/:slug', element: <EffectRoute /> },
      { path: '*', element: <NotFound /> },
    ],
  },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
