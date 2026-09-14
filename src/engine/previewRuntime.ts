/**
 * 预览 runtime：注入到预览 iframe 的 <head> 中，导出代码不包含这段。
 *
 * 职责：
 * 1. 定义 window.__MT_ENV（thumb 标记），供效果代码里的 @mt:thumb 演示块判断；
 * 2. 监听父页面的 postMessage：
 *    - mt:css     热更新 :root 上的 CSS 变量（滑块调参不重置动画）
 *    - mt:pointer 父页面把真实鼠标坐标转发进来，thumb 演示块可跟随真实指针
 *    - mt:visible 父页面告知本预览是否在视口内；离屏时整体暂停（见下）
 * 3. 向父页面上报用户活动（mt:activity，节流 150ms）：全屏预览时 iframe 盖住整个舞台，
 *    父页面收不到鼠标事件，靠这条消息判断「有没有人在动」以显示 / 隐藏退出按钮。
 * 4. 离屏暂停（thumb 模式）：图鉴页一屏之外的卡片不该继续烧 CPU / GPU。效果代码只认
 *    document.hidden，所以 runtime 在收到 mt:visible=false 时：
 *    - 把 document.hidden / visibilityState 改写为「隐藏」并派发 visibilitychange，
 *      效果里现成的「后台标签页暂停」逻辑就会生效；
 *    - 拦住 requestAnimationFrame：暂停期间登记的回调先攒着，恢复时再一次性排回原生 rAF，
 *      渲染循环因此在一帧内停住、恢复后从断点继续；
 *    - 注入一条样式把所有 CSS 动画 animation-play-state 置为 paused。
 * 5. thumb 模式把 devicePixelRatio 封顶为 1：卡片按 1280×720 渲染后再缩到几百像素宽，
 *    没必要再乘 dpr 画一张 2560×1440 的 WebGL 画面。
 */
export function buildRuntimeScript(thumb: boolean): string {
  const close = '</scr' + 'ipt>';
  return (
    `<script>
window.__MT_ENV = { thumb: ${thumb ? 'true' : 'false'}, visible: true };
${thumb ? "try { Object.defineProperty(window, 'devicePixelRatio', { configurable: true, get: function () { return 1; } }); } catch (err) {}" : ''}
(function () {
  var paused = false;
  var held = [];
  var fakeId = -1;
  var nativeRAF = window.requestAnimationFrame.bind(window);
  var nativeCAF = window.cancelAnimationFrame.bind(window);
  var hiddenDesc = Object.getOwnPropertyDescriptor(Document.prototype, 'hidden');
  var stateDesc = Object.getOwnPropertyDescriptor(Document.prototype, 'visibilityState');
  var nativeHidden = function () { return hiddenDesc && hiddenDesc.get ? hiddenDesc.get.call(document) : false; };
  var nativeState = function () { return stateDesc && stateDesc.get ? stateDesc.get.call(document) : 'visible'; };
  try {
    Object.defineProperty(document, 'hidden', { configurable: true, get: function () { return paused || nativeHidden(); } });
    Object.defineProperty(document, 'visibilityState', { configurable: true, get: function () { return paused ? 'hidden' : nativeState(); } });
  } catch (err) {}
  window.requestAnimationFrame = function (cb) {
    if (!paused) return nativeRAF(cb);
    var id = fakeId--;
    held.push({ id: id, cb: cb });
    return id;
  };
  window.cancelAnimationFrame = function (id) {
    if (id < 0) { held = held.filter(function (h) { return h.id !== id; }); return; }
    nativeCAF(id);
  };
  var style = null;
  window.__mtSetVisible = function (visible) {
    var next = !visible;
    if (next === paused) return;
    paused = next;
    window.__MT_ENV.visible = !!visible;
    if (paused) {
      if (!style) { style = document.createElement('style'); style.textContent = '*, *::before, *::after { animation-play-state: paused !important; }'; }
      (document.head || document.documentElement).appendChild(style);
    } else {
      if (style && style.parentNode) style.parentNode.removeChild(style);
      var list = held; held = [];
      list.forEach(function (h) { nativeRAF(h.cb); });
    }
    try { document.dispatchEvent(new Event('visibilitychange')); } catch (err) {}
  };
})();
window.addEventListener('message', function (e) {
  var d = e && e.data;
  if (!d) return;
  if (d.type === 'mt:css' && d.vars) {
    for (var k in d.vars) document.documentElement.style.setProperty(k, d.vars[k]);
  }
  if (d.type === 'mt:pointer' && window.__mtOnPointer) {
    window.__mtOnPointer(d.x, d.y);
  }
  if (d.type === 'mt:visible') {
    window.__mtSetVisible(!!d.visible);
  }
});
if (window.parent !== window) {
  var mtLastActivity = 0;
  var mtActivity = function () {
    var t = Date.now();
    if (t - mtLastActivity < 150) return;
    mtLastActivity = t;
    try { window.parent.postMessage({ type: 'mt:activity' }, '*'); } catch (err) {}
  };
  window.addEventListener('pointermove', mtActivity, { passive: true });
  window.addEventListener('pointerdown', mtActivity, { passive: true });
  window.addEventListener('keydown', mtActivity);
}
` + close
  );
}
