/**
 * 预览 runtime：注入到预览 iframe 的 <head> 中，导出代码不包含这段。
 *
 * 职责：
 * 1. 定义 window.__MT_ENV（thumb 标记），供效果代码里的 @mt:thumb 演示块判断；
 * 2. 监听父页面的 postMessage：
 *    - mt:css     热更新 :root 上的 CSS 变量（滑块调参不重置动画）
 *    - mt:pointer 父页面把真实鼠标坐标转发进来，thumb 演示块可跟随真实指针
 */
export function buildRuntimeScript(thumb: boolean): string {
  const close = '</scr' + 'ipt>';
  return (
    `<script>
window.__MT_ENV = { thumb: ${thumb ? 'true' : 'false'} };
window.addEventListener('message', function (e) {
  var d = e && e.data;
  if (!d) return;
  if (d.type === 'mt:css' && d.vars) {
    for (var k in d.vars) document.documentElement.style.setProperty(k, d.vars[k]);
  }
  if (d.type === 'mt:pointer' && window.__mtOnPointer) {
    window.__mtOnPointer(d.x, d.y);
  }
});
` + close
  );
}
