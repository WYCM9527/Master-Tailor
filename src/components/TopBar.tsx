import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { randomSlug } from '../contract/registry';
import { HowToModal } from './HowToModal';

export function TopBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [howToOpen, setHowToOpen] = useState(false);

  const goRandom = () => {
    // TopBar 位于 Routes 之外，从路径里解析当前 slug 以避免随机到同一个
    const current = location.pathname.match(/^\/e\/([^/]+)/)?.[1];
    const next = randomSlug(current);
    if (next) navigate(`/e/${next}`);
  };

  return (
    <>
      <header className="topbar">
        <div className="container topbar-inner">
          <Link to="/" className="brand">
            <span className="brand-name">
              裁缝大师<span className="dot">.</span>
            </span>
            <span className="brand-en">Master-Tailor</span>
          </Link>
          <div className="topbar-actions">
            <button type="button" className="btn btn-ghost" onClick={() => setHowToOpen(true)}>
              怎么用
            </button>
            <button type="button" className="btn" onClick={goRandom}>
              随机来一个
            </button>
          </div>
        </div>
      </header>
      <HowToModal open={howToOpen} onClose={() => setHowToOpen(false)} />
    </>
  );
}
