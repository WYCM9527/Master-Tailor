import { Link, useLocation, useNavigate } from 'react-router-dom';
import { randomSlug } from '../contract/registry';

export const HOWTO_ID = 'howto';

/** Header：整宽 12 栏网格行——品牌 2 栏（与效果页侧栏对齐）| slogan 4 栏 | 三个动作 Cell 各 2 栏 */
export function TopBar() {
  const navigate = useNavigate();
  const location = useLocation();

  const goRandom = () => {
    // TopBar 位于 Routes 之外，从路径里解析当前 slug 以避免随机到同一个
    const current = location.pathname.match(/^\/e\/([^/]+)/)?.[1];
    const next = randomSlug(current);
    if (next) navigate(`/e/${next}`);
  };

  const goHowTo = () => {
    if (location.pathname === '/') {
      document.getElementById(HOWTO_ID)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      // 不在首页：先回首页，由首页在挂载后滚到「怎么用」
      navigate('/', { state: { scrollTo: HOWTO_ID } });
    }
  };

  return (
    <header className="g12 first hdr">
      <Link to="/" className="cell span-2 hdr-brand">
        裁缝大师
        <span className="mono">Master-Tailor</span>
      </Link>
      <div className="cell span-4 hdr-slogan">
        前端效果图鉴 · 挑一个，调一调，复制 prompt 粘给你的 AI
      </div>
      <Link
        to="/effects"
        className={`cell span-2 hdr-btn${location.pathname === '/effects' ? ' active' : ''}`}
      >
        全部效果
        <span className="arrow">→</span>
      </Link>
      <button type="button" className="cell span-2 hdr-btn" onClick={goHowTo}>
        怎么用
        <span className="arrow">↓</span>
      </button>
      <button type="button" className="cell span-2 hdr-btn" onClick={goRandom}>
        随机来一个
        <span className="arrow">→</span>
      </button>
    </header>
  );
}
