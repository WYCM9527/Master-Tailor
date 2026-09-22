## 效果描述
一行竖版海报。鼠标摸到哪张，哪张就按悬停放大倍数放大浮起，带深投影并浮现底部标题，同时它左右的海报各向外让开一点，避免被盖住——这就是影视网站首页那味儿。行本身可以横向滚动：鼠标按住拖、触屏滑；悬停整行时两端浮现半透明大箭头，点一下翻一「屏」。本效果不自动播放。

## 实现提示
放大用 :hover 的 transform: scale；「邻居让位」用 CSS 选择器——:hover ~ 后面的海报往右让、:has(~ :hover) 前面的往左让；容器上下要预留放大后的空间。
- 结构：外层容器 `position: relative; width: min(780px, 94vw)`，`padding: 46px 0` 给放大后的海报留上下空间，聚焦时 2px 强调色（{{accent}}）outline、偏移 4px。里面一行 `display: flex; gap: {{gap}}; overflow-x: auto; scroll-behavior: smooth`，左右 2px 内边距，隐藏滚动条（`scrollbar-width: none` + 隐藏 `::-webkit-scrollbar`），`touch-action: pan-y`，光标 grab / grabbing；拖动中把 `scroll-behavior` 切回 auto，否则拖起来「追不上」。
- 海报：`flex: none; width: 150px; aspect-ratio: 2 / 3`，圆角 {{rounded}}，`overflow: hidden`，兜底底图 `linear-gradient(135deg, #1a1c2c, #2a2f4a)`，图片 `object-fit: cover`；`transition: transform {{duration}} cubic-bezier(0.22, 1, 0.36, 1), box-shadow {{duration}} ease`。
- 悬停态（限定 `.row:hover .poster:hover`）：`scale({{scale}})`，`z-index: 2`，投影 `0 18px 44px rgba(0,0,0,0.6)`；标题条 `opacity` 0 → 1（同时长 ease）。邻居让位量与放大倍数挂钩：前面的 `translateX(calc(({{scale}} − 1) × −46px))`，后面的取正——放大越多让得越开。
- 标题条贴底：`padding: 26px 10px 8px`，白字 12.5px / 600，背景 `linear-gradient(transparent, rgba(0,0,0,0.7))`，平时 `opacity: 0`。
- 箭头：38 × 66px、圆角 8px，垂直居中、左右各外露 8px，`z-index: 3`，底 `rgba(10,10,15,0.65)`、白色 20px ‹ ›；默认 `opacity: 0`，容器 `:hover` / `:focus-within` 时 0.2s 淡入；悬停底变 {{accent}}、字 #111（0.15s）。点击 `scrollBy` 行宽 × 0.9 平滑滚动。
- 拖拽：只处理 `pointerType === 'mouse'`（触屏交给原生滚动），按下记录 scrollLeft，移动超过 6px 标记「拖过」，松开后在 click 捕获阶段拦截，避免误点海报。

## 技术要求补充
- 行滚动：鼠标 pointerdown 拖拽滚动（拖拽后抑制点击），触屏用原生滚动；箭头一次滚约 90% 视口宽
- 支持键盘操作：容器可聚焦，keydown ← / → 翻屏
- 无障碍：容器带 role="region" 和 aria-roledescription="carousel"，每张海报带含名字的 aria-label
- 系统开启「减少动态效果」（prefers-reduced-motion）时悬停不放大不推挤，只浮现标题

## 完成后请检查
- 悬停的海报放大浮起且不被邻居遮挡、邻居对称让位；移开后一切复位
- 拖拽滚动顺滑、拖完不会误触发海报点击；箭头悬停行时才出现
- 放大的海报上下不被容器裁掉
