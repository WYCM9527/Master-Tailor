## 效果描述

竖版卡片沿着一条竖直的螺旋线逐张排开，像旋转楼梯的台阶盘旋而上：前面的卡片清晰明亮，转到后方的只透出压暗的背影。整条螺旋绕着竖轴不停地匀速转动，因为螺旋本身的走势，看起来像卡片在源源不断地向上流动。不需要任何操作，转满整圈自然接上，循环永不停歇，像一串盘旋上升的画页。

## 实现提示

- 舞台 `.stage { perspective: 1400px; overflow: hidden }` 铺满全屏；里面放一个零尺寸锚点钉在画面正中央，先 `rotateX({{tilt}})` 做整体俯仰，再套一层 `.helix { transform-style: preserve-3d; animation: spin {{speed}} linear infinite }`，关键帧 `rotateY(0 → 360deg)`。整条螺旋是刚体，转满一圈回到原样，线性缓动首尾速度一致，循环没有跳变。
- 卡片总数 {{count}}（上限 30），图片不够时按序循环取图，每循环完一轮整体错开一张，避免上下相邻圈同图对齐。卡 i 的变换：`translate(-50%, -50%) rotateY(i × {{angleStep}}) translateZ({{ring}}) translateY((i − (N − 1) / 2) × {{pitch}})`——先绕竖轴转到自己的角度，再推到螺旋半径处，最后逐张抬高，整条螺旋以画面中心为竖直中点。半径与螺距直接引用 CSS 变量，调参不必重建。
- 卡片竖版 3:4，宽 {{cardWidth}}，圆角 {{radius}}，`transform-style: preserve-3d; will-change: transform`。不要给卡片写 `overflow: hidden`（会把子元素拍平、背面压暗层失效），圆角写在图片和压暗层上。
- 背面压暗：卡内 `::after` 铺满卡面，`background: rgba(0, 0, 0, {{backDim}})`，`transform: rotateY(180deg) translateZ(1px); backface-visibility: hidden`——卡片正对观者时它背对观者而被隐藏，卡片转到后方时它正好盖在镜像图片之上。图片本体背面保持可见，于是后方卡片呈现「镜像 + 压暗」。
- 图片 `object-fit: cover; display: block`，加载前底色 #16161d；全程只改 transform，不在每帧读取布局。
- 适配：整条螺旋的高度（(N − 1) × 螺距 + 一张卡的高度）占画面高度的 92%，超出时给俯仰锚点加一个 ≤ 1 的 scale，resize 时重算。
- 后台暂停：监听 visibilitychange，页面隐藏时把所有带动画元素的 animation-play-state 设为 paused。`@media (prefers-reduced-motion: reduce)` 下 `.helix { animation: none }`，停成静态螺旋。

## 完成后请检查

- 转到后方的卡片只看到压暗的镜像，没有露出亮图；正面卡片没有被压暗层误盖
- 转满一圈回到起点时没有跳变，螺旋整体居中、上下对称
- 页面切后台时暂停，系统开启「减少动态效果」时静止
