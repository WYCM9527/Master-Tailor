## 效果描述

页面背景是一片沿着渐变角度、在渐变颜色列表的几个颜色之间依次过渡的线性渐变——两个颜色是干净的双色渐变，三四个颜色就是一片暮色般的多段过渡。渐变之上覆盖一层非常细腻的胶片噪点，让纯色渐变有了磨砂胶片的质感，避免大面积渐变的「塑料感」和色带断层。开启呼吸变化后，整片渐变的色相以半分钟左右一个来回的节奏极缓慢地流转，几乎察觉不到，却让背景是活的。

## 实现提示

渐变用 linear-gradient(角度, 颜色1, 颜色2, …) 把颜色列表按顺序均匀排在渐变线上（颜色数量不定，用 JS 拼字符串写入即可）；噪点用内联 SVG feTurbulence 生成，以 mix-blend-mode: overlay 叠加，噪点浓度控制其不透明度；呼吸变化用 filter: hue-rotate 的长周期 keyframes。

- 结构：两层 `position: fixed; inset: 0; z-index: -1; pointer-events: none` 的 div 垫在页面最底，下层渐变、上层噪点，都 `aria-hidden`（宿主页若 html 与 body 都设了背景，给 body 加 `isolation: isolate` 以免负 z-index 被 body 背景盖住）。渐变层 `background: linear-gradient(var(--angle), 颜色1, 颜色2, …)`：角度走 CSS 变量（渐变角度 {{angle}}），颜色列表（{{colors}}）直接 `join(', ')`，不写色标位置即等距分布。
- 噪点：一张 220×220 的内联 SVG data URL，`<feTurbulence type="fractalNoise" baseFrequency="0.82" numOctaves="3" stitchTiles="stitch"/>` 滤到满幅 `<rect>` 上，作 `background-image` 按原尺寸平铺（stitch 保证拼缝不可见）；层 `opacity` 即噪点浓度 {{grain}}，`mix-blend-mode: overlay` 让噪点暗部压暗、亮部提亮而不是蒙一层灰；噪点本身不动。
- 呼吸：开启时给渐变层加类，`animation: breathe 36s ease-in-out infinite alternate`，关键帧只有 `to { filter: hue-rotate(40deg) saturate(1.15) }`——36 秒单程、alternate 往返，色相最多偏 40°、饱和度微提 15%；关闭时不加类，画面完全静止。
- 「减少动态效果」时呼吸动画 `none`；切后台 `animation-play-state: paused`。

## 完成后请检查

- 背景渐变按列表顺序经过每一个颜色、角度与参数一致，放大看有均匀细噪点，没有明显色带条纹
- 呼吸变化开启时，盯着看 10 秒能察觉到色调在极缓慢变化；关闭时画面完全静止
- 噪点层不拦截鼠标事件，页面内容和交互完全不受影响
