## 效果描述

整屏是一张海报。点画面任意位置，新的一幕就从你点的那个点「睁开」——一个圆从无到有迅速扩大，圆内是新画面，一直长到盖满最远的角落，边界是干净的圆弧。底下的旧幕全程不动。返回或按 Esc 时严格反向：圆从满屏收拢回原点，旧幕重新露出来。圆心可以固定在画面中心，也可以跟随每次点击的位置。

## 技术要求补充

- 用同文档 View Transitions（document.startViewTransition）实现；圆心跟随点击时，每次点击都要把坐标写进 CSS 变量再开始转场
- 圆的终态半径必须盖住画面最远角（约 142%），避免四角残留；垫底一幕在整个转场中完全静止
- 浏览器没有该 API 时降级为 CSS 类动画（同一形状的动画加在真实页面上，圆心坐标换算为相对容器），视觉一致；开启「减少动态效果」时一律瞬间切换
- 如果要在多页应用（两个独立 HTML）之间做同款转场：两页同源，各自声明 @view-transition { navigation: auto }（Chrome 126+ / Safari 18.2+，Firefox 暂不支持，需接受直接切换降级）

## 实现提示

- 舞台：一块 `width: min(880px, 94vw)`、`height: min(560px, 92vh)` 的圆角 18px 容器，`overflow: clip`，底色 #101016，投影 `0 24px 80px rgba(0,0,0,0.5)`，页面底色 #0a0a0f。两幕是同文档里互斥显示的两块海报（hidden 切换），各自 `position: absolute; inset: 0`，占位图 `background-size: cover; background-position: center`，上面压一层 `linear-gradient(transparent 45%, rgba(0,0,0,0.62))` 的 ::after 压暗下半部。文案绝对定位在左下（`left: 44px; bottom: 40px`）：标题 `clamp(28px, 5vw, 46px)`、颜色为强调色 {{accent}}、下边距 6px；副标题 14.5px、72% 白。换幕按钮贴底 20px（下一幕在右 22px、上一幕在左 22px）：胶囊形，1px 白 40% 边框，`padding: 9px 20px`，底 `rgba(10,10,15,0.45)`，14px 强调色文字。
- 圆心：每次点击先写四个 CSS 变量再开始转场。快照坐标系是视口，`--vt-ox / --vt-oy` 直接取 clientX / clientY（px）；回退路径的圆心要换算成相对容器的坐标（另存一组变量 `--fx-ox / --fx-oy` = 点击坐标 − 容器 getBoundingClientRect 左上角）。圆心位置选「固定画面中心」（当前 {{centerMode}}）以及按 Esc / Backspace 返回时，四个变量都写 50%。
- 转场：切页前在 html 上写 `data-vt`（forward / back），CSS 据此选 keyframes；转场期间给离场页与进场页都挂 view-transition-name: page。前进时 new 快照播 `clip-path: circle(0px at 圆心) → circle(142% at 圆心)`，old 快照用一条 opacity 恒为 1 的「保持不动」动画覆盖默认交叉淡化；返回时把收拢动画（142% → 0px）放在 old 快照上并用 `z-index: 1` 提到上层，new 快照保持不动。时长 {{duration}}，缓动 `cubic-bezier(0.4, 0, 0.2, 1)`，`animation-fill-mode: both`。
- JS 流程：转场进行中用标志位忽略新的导航；`startViewTransition` 回调里切 hidden 并把 view-transition-name 从离场页移到进场页，`finished` 后清掉 name 与 data-vt，并把焦点移到新幕的标题（h1 带 tabindex=-1，`preventScroll`）。第二幕上点任意处（含「上一幕」按钮）都返回，海报与按钮的监听互相排除以免触发两次。
- 无 API 回退：同一形状的 keyframes 以类名加在真实页面上（圆心用容器坐标那组变量）：前进时进场页 z-index 2 播睁开、离场页 z-index 1 保持不动；返回时离场页 z-index 2 播收拢、进场页 z-index 1 保持不动。两页短暂同框，动画结束事件在容器上冒泡捕获，结束后再隐藏离场页并摘掉类名。开启「减少动态效果」时直接切 hidden，并把 ::view-transition-* 与回退类的 animation 一律置 none。

## 完成后请检查

- 圆睁开的过程边界始终是正圆、无锯齿残角，终态完全盖住四角
- 圆心跟随点击时每次都对准点击处；返回收拢回同一个原点
- 不支持视图过渡的浏览器里圆形揭示依然成立；开启「减少动态效果」后为瞬间切换
