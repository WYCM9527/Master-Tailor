## 效果描述

一组排成网格的图标按钮，每个都是「磨砂玻璃前板 + 彩色卡片背板」的两层结构：背板是一张带柔影的彩色渐变卡，默认以右下角为轴斜着露出一角；前板是半透明的白色磨砂玻璃，中间放一个符号。鼠标悬停时，玻璃向你浮起、背板转得更斜并往后退一点，图标的名字从玻璃下方淡入浮出。名称、符号、颜色、尺寸、列数见参数。

## 实现提示

- 每个按钮是 `4.5em × 4.5em` 的正方形，`perspective: 24em; transform-style: preserve-3d`；所有尺寸用 em，基准字号即「图标尺寸」，改一个数整体缩放。
- 背板：绝对铺满，圆角 1.25em，渐变色（主色 → 略深），`transform-origin: 100% 100%; transform: rotate(15deg)`，阴影 `0.5em −0.5em 0.75em hsla(223,10%,10%,0.15)`；悬停 `rotate(25deg) translate3d(−0.5em, −0.5em, 0.5em)`。
- 前板：绝对铺满，`background: hsla(0,0%,100%,0.15); backdrop-filter: blur(0.75em); box-shadow: inset 0 0 0 0.1em hsla(0,0%,100%,0.3)`，`transform-origin: 80% 50%`；悬停 `translateZ(2em)`——因为父级有 perspective，向你浮起会真实变大。
- 名称：`top: 100%`，默认 `opacity: 0`，悬停 `opacity: 1; translateY(20%)`。
- 三层过渡都用 `0.3s cubic-bezier(0.83, 0, 0.17, 1)`。

## 技术要求补充

- 纯 CSS 3D 过渡，无需 JS 动画库；按钮带 aria-label。
- 系统开启「减少动态效果」时去掉过渡。

## 完成后请检查

- 背板斜露一角、玻璃有磨砂透感与细内描边
- 悬停时玻璃明显向你浮起、背板向后翘、名称浮出
- 改「图标尺寸」整组等比缩放
