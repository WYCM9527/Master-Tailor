import { Link } from 'react-router-dom';

export function NotFound() {
  return (
    <div className="container notfound">
      <h1>404</h1>
      <p>这块布料不存在，可能被裁掉了。</p>
      <Link to="/" className="btn btn-accent btn-lg">
        回到效果图鉴
      </Link>
    </div>
  );
}
