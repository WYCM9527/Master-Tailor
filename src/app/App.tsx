import { Outlet, ScrollRestoration, useLocation } from 'react-router-dom';
import { TopBar } from '../components/TopBar';

/** 布局：Header（详情页除外）+ 路由出口 + 底边收口线 + 滚动恢复 */
export function Layout() {
  // 详情页不要站点 Header：它自己的第一行（目录 | 返回 | 标题 | 标签）就是页头
  const isDetail = useLocation().pathname.startsWith('/e/');
  return (
    <>
      {!isDetail && <TopBar />}
      <main>
        <Outlet />
      </main>
      {/* 页面底边：最后一段网格的收口线 */}
      <div className="page-end" aria-hidden="true" />
      {/* PUSH 回页顶、浏览器后退/前进按 location.key 恢复滚动位置 */}
      <ScrollRestoration />
    </>
  );
}
