## 效果描述

画面上压着一块厚厚的圆角玻璃：透过它看底下的图片和大字，中间部分是清透的，靠边一圈却像镜头边缘一样把内容向内折弯，而且折弯处红、绿、蓝三色略微错开，带出真实玻璃的色散感；玻璃本身有内外多层柔和的光边。可以按住拖着它在画面上滑，看底下的内容被它揉过去。底图、尺寸、圆角、折射边宽、折射与色散强度、中央柔化、亮度见参数。

## 实现提示

- 核心是 `backdrop-filter: url(#滤镜)`——把一个 SVG 滤镜作用在面板背后的内容上（Chrome / Edge 支持；不支持的浏览器检测 `el.style.backdropFilter = 'url(#x)'` 是否被接受，不行就回退到 `blur(12px) saturate(1.8) brightness(1.2)` 的普通毛玻璃）。
- 位移图用 JS 拼一个 data-URI SVG：黑底；一层从右到左由透明到纯红的渐变矩形（红通道 = x 位移）；一层从上到下由透明到纯蓝的渐变矩形，`mix-blend-mode: difference`（蓝通道 = y 位移）；最后在中央盖一块向内缩「短边 × 边宽比例 × 0.5」的灰色矩形（`hsl(0 0% 亮度% / 0.93)`，`filter: blur(柔化px)`）——灰色把中央位移压成 0，于是只有边缘折射，且过渡柔和。矩形都用同一个 rx 圆角。
- 滤镜链：`feImage` 载入位移图 → 三个 `feDisplacementMap`（in=SourceGraphic，xChannelSelector R，yChannelSelector G，scale 分别为「强度」「强度 + 10 × 色散」「强度 + 20 × 色散」，强度默认 −180）→ 各接一个 `feColorMatrix` 只留红 / 绿 / 蓝一个通道 → 两次 `feBlend mode=screen` 合并 → `feGaussianBlur stdDeviation=0.7`。三通道位移量不同就是色散。
- 面板叠多层 `box-shadow`：两层 inset 白色细光边（`0 0 2px 1px` 65% 透明、`0 0 10px 4px` 85% 透明）加内外各三层极淡的深色柔影，模拟厚度。
- 拖动：pointerdown 记录偏移，pointermove 改 left/top，`setPointerCapture` 防止拖出面板丢事件。

## 技术要求补充

- 纯 CSS + SVG 滤镜，无依赖；SVG 本体 `opacity: 0` 放在面板内只为提供滤镜定义。
- 系统开启「减少动态效果」时不做自动游走演示。

## 完成后请检查

- 玻璃边缘一圈明显把底下内容向内折弯，中央清透
- 折弯处能看到红绿蓝三色略微错开
- 拖动玻璃时折射实时跟随；不支持的浏览器显示为普通毛玻璃而非空白
