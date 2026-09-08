/** 站点底层柔光斑背景：极慢漂移，供玻璃 chrome 透出层次；reduced-motion 时静止 */
export function AmbientBackground() {
  return (
    <div className="ambient" aria-hidden="true">
      <div className="ambient-blob a" />
      <div className="ambient-blob b" />
      <div className="ambient-blob c" />
    </div>
  );
}
