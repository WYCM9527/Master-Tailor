## 效果描述

一屏彩色应用图标排成启动台。点开任意一个，对应的应用窗口从屏幕中央轻轻放大浮现，启动台同时略微放大、淡出退到虚处，像镜头往前推了一步。关闭窗口或按 Esc 返回时严格反向：窗口缩小隐去，启动台从近处退回原位、重新清晰。开启进出场模糊后，两端各带一层轻雾，气质接近 visionOS 的空间过渡。

## 实现提示

两个「页面」是同文档里互斥显示的两块区域（hidden 切换）。转场期间给离场页与进场页都挂 view-transition-name: page；前进时 new 快照从新页起始缩放 scale 到 1 并淡入，old 快照 scale 到旧页退场缩放并淡出；模糊开关通过 CSS 变量乘进 filter: blur() 的半径（0 即无模糊）。无 API 回退：同一套 keyframes 以类名加在真实页面元素上。

- 舞台：`min(880px, 94vw) × min(560px, 92vh)` 的卡片，底色 #101016、圆角 18px、`overflow: clip`、投影 `0 24px 80px rgba(0,0,0,0.5)`。启动台 3 列 grid、`gap: 26px 34px`，图标色块 74×74、圆角 18px、高光 `inset 0 1px 0 rgba(255,255,255,0.25)`，背景 `linear-gradient(135deg, hsl(H 62% 52%), hsl(H 66% 30%))`、`H = (i × 47 + 210) % 360`，标签 13px #d5d6e0。窗口页背景 `rgba(10,10,15,0.55)`，窗口 `min(560px, 84%)`、圆角 14px、底色 #1a1b24、投影 `0 30px 90px rgba(0,0,0,0.55)`，标题栏 #22232e 带 14px 红点 #ff5f57 关闭钮；焦点环 2px {{accent}}。
- 四组 keyframes 共用时长 {{duration}}、缓动 `cubic-bezier(0.2, 0.9, 0.3, 1)`、`fill-mode: both`，按 `html[data-vt='forward' | 'back']` 选用：前进 new `scale(起始缩放) + opacity 0 → 1`，old `1 → scale(退场缩放) + opacity 0`；返回 new 从 `scale(退场缩放)` 回 1、old 缩到 `scale(起始缩放)`。起始缩放 {{zoomFrom}}、退场缩放 {{zoomOut}}；blur 半径 `calc(开关 × 10px)`，开关 1 / 0 对应进出场模糊（当前 {{blur}}）。
- JS：转场中用标志位忽略新导航；`startViewTransition` 回调里切 hidden 并把 name 从离场页移到进场页，`finished` 后清掉 name 与 data-vt、焦点移到新页 h1。回退时离场页 fx-out（z-index 1）、进场页 fx-in（z-index 2），进场页 animationend 后再隐藏离场页。红点 / Esc / Backspace 返回。

## 技术要求补充

- 用同文档 View Transitions（document.startViewTransition）实现：切页前在 html 上标记方向（前进/返回），CSS 按方向选动画，返回是前进的严格反向
- 新页的放大淡入与旧页的放大淡出必须同时同曲线进行，两页缩放方向相同（都向外）才有镜头前推感
- 浏览器没有该 API 时降级为 CSS 类动画（两页短暂同框播同一套动画），视觉一致；开启「减少动态效果」时一律瞬间切换
- 如果要在多页应用（两个独立 HTML）之间做同款转场：两页同源，各自声明 @view-transition { navigation: auto }（Chrome 126+ / Safari 18.2+，Firefox 暂不支持，需接受直接切换降级）

## 完成后请检查

- 打开与关闭是同一段动画的正放与倒放，新旧两页的缩放同时进行、没有先后错拍
- 转场进行中连续点击不会错乱（进行中的导航应被忽略）
- 关闭进出场模糊时完全无模糊开销；开启「减少动态效果」后为瞬间切换
