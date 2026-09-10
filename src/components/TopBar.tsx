import { Link } from 'react-router-dom';

/** Header：整宽 12 栏网格行——只保留品牌 Cell（2 栏，与效果页侧栏对齐），其余留空。详情页不渲染。 */
export function TopBar() {
  return (
    <header className="g12 first hdr">
      <Link to="/" viewTransition className="cell span-2 hdr-brand">
        裁缝大师
        <span className="mono">Master-Tailor</span>
      </Link>
      <div className="cell span-10 hdr-fill" aria-hidden="true" />
    </header>
  );
}
