## 效果描述

整屏是一张带大标题的海报，像发布会的一幕。点「下一幕」，新海报像一块幕布从选定的一侧擦过画面，边界干净利落，一路盖到另一侧完成换场，底下的旧幕全程纹丝不动。返回时严格反向：上层幕布原路撤走，露出底下的上一幕。擦除方向可选四个边，节奏由转场时长控制，气质是发布会切页的舞台感。

## 技术要求补充

- 用同文档 View Transitions（document.startViewTransition）实现：切页前在 html 上标记方向（前进/返回）与擦除方向，CSS 据此选动画
- 关键层次：前进时新幕在上层擦入、旧幕静止垫底；返回时旧幕提到上层原路擦走、新幕静止垫底——垫底的一幕不能有任何淡出或位移
- 浏览器没有该 API 时降级为 CSS 类动画（两页短暂同框播同一套动画），视觉一致；开启「减少动态效果」时一律瞬间切换
- 如果要在多页应用（两个独立 HTML）之间做同款转场：两页同源，各自声明 @view-transition { navigation: auto }（Chrome 126+ / Safari 18.2+，Firefox 暂不支持，需接受直接切换降级）

## 实现提示

- 舞台：一块 `width: min(880px, 94vw)`、`height: min(560px, 92vh)` 的圆角 18px 容器，`overflow: clip`，底色 #101016，投影 `0 24px 80px rgba(0,0,0,0.5)`。两幕是同文档里互斥显示的两块海报区域（hidden 切换），各自 `position: absolute; inset: 0`，海报占位图 `background-size: cover; background-position: center`，上面压一层 `linear-gradient(transparent 40%, rgba(0,0,0,0.65))` 的 ::after 压暗下半部；文案放左下（grid `place-items: end start`，`padding: 0 44px 48px`），标题 `clamp(30px, 5.4vw, 52px)` / 700 字重 / 字距 0.02em、颜色为强调色，副标题 15px、72% 白。换场按钮贴底 20px（下一幕在右 22px、上一幕在左 22px）：胶囊形，1px 白 40% 边框，`padding: 9px 20px`，底 `rgba(10,10,15,0.45)`，14px 强调色文字。
- 转场：切页前在 html 上写 `data-vt`（forward / back）与 `data-dir`（擦除方向，当前 {{direction}}），CSS 据此选 keyframes。转场期间给离场页与进场页都挂 view-transition-name: page；擦入用 clip-path: inset() 把上层快照的一条边从 100% 推到 0（从右往左 `inset(0 0 0 100%) → inset(0)`，从左往右 `inset(0 100% 0 0)`，自下而上 `inset(100% 0 0 0)`，自上而下 `inset(0 0 100% 0)`），四个方向各一组正反 keyframes，擦走为同路反向；时长 {{duration}}，缓动 `cubic-bezier(0.65, 0, 0.35, 1)`（两头稳中间快），`animation-fill-mode: both`。垫底快照用一条「保持不动」的动画覆盖默认交叉淡化（opacity 恒为 1）。返回时用 z-index 把 old 快照提到上层。
- JS 流程：转场进行中用标志位忽略新的导航；`startViewTransition` 回调里切 hidden 并把 view-transition-name 从离场页移到进场页，`finished` 后清掉 name 与 data-vt，并把焦点移到新幕的标题（h1 带 tabindex=-1）。在第二幕时按 Esc / Backspace 也能返回。
- 无 API 回退：同一套 keyframes 以类名加在真实页面上（前进时进场页 z-index 2 擦入、离场页 z-index 1 保持不动；返回时反过来），两页短暂同框，动画结束事件在容器上冒泡捕获（返回时只有旧幕在动），结束后再隐藏离场页并摘掉类名。开启「减少动态效果」时直接切 hidden，不走转场。

## 完成后请检查

- 擦除边界是一条干脆的直线，垫底的一幕在整个转场中完全静止、没有闪动或淡化
- 前进与返回方向严格互逆，四个擦除方向都正确
- 不支持视图过渡的浏览器里幕布效果依然成立；开启「减少动态效果」后为瞬间切换
