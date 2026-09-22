## 效果描述

一条由卡片首尾相接围成的环带悬在画面中央，像一只放大了的手环。整只环向观者略微俯倾，绕着竖轴缓缓转动：前排的卡片正面清晰地滑过，转到后排的卡片透出压暗的背影，透过环的内侧还能看见它们的镜像。不需要任何操作，一圈接一圈永不停歇。

## 实现提示

- 结构：全屏舞台 `perspective: 1400px`，里面一个 0×0 的锚点 `rotateX({{tilt}})`（负值俯视），锚点里的环 `transform-style: preserve-3d` 做 `rotateY(0 → 360deg)` 线性无限动画，时长 {{speed}}，`animation-direction` 取 {{direction}}。
- 几何：环上 {{count}} 张 4:3 横版卡，宽 {{cardWidth}}，相邻缝 6px；半径 R = (宽 + 6) / (2 · tan(π / 张数))，第 i 张 `rotateY(i · 360 / 张数) translateZ(R)`，用负外边距把卡片中心对到锚点。
- 适配：整只环占画面短边的 78%——按 (2R + 卡宽) 算一个 ≤ 1 的 scale 写在锚点上，resize 时重算。
- 背面压暗：卡片 backface 保持可见（后排看到镜像），另放一层 `::after` 黑色遮罩、透明度 {{backDim}}，遮罩自身 `rotateY(180deg) translateZ(0.5px)` 且 `backface-visibility: hidden`，这样它只在卡片背对观者时露出来。卡片本身不能 `overflow: hidden`（会被压平成 2D，遮罩就失效），圆角写在图片和遮罩上。
- 卡片圆角 {{radius}}，投影 `0 18px 40px rgba(0,0,0,0.35)`，图片 `object-fit: cover`，加载前底色 `#16161d`，图片不够时按序号循环取用。
- 页面切后台把环的 `animation-play-state` 设为 paused；`prefers-reduced-motion` 下去掉动画，环停在起始角度。

## 完成后请检查

- 环带首尾相接没有缺口，转一整圈回到起点时没有跳变
- 后排卡片是压暗的镜像而不是漏出底色或完全消失；俯仰角为负时是从上往下看
- 页面在后台时暂停；系统开启「减少动态效果」时环静止
