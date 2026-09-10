import { Link } from 'react-router-dom';

export function NotFound() {
  return (
    <div className="g12">
      <div className="cell span-9 notfound">
        <h1>404</h1>
        <p className="muted">这块布料不存在，可能被裁掉了。</p>
      </div>
      <Link to="/" viewTransition className="cell span-3 step step-cta">
        <span className="mono">BACK</span>
        <b>
          回到效果图鉴 <span className="arrow">→</span>
        </b>
      </Link>
    </div>
  );
}
