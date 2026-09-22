## 效果描述

一句话起初只是一团看不清的虚影。然后从第一个字开始，字一个接一个地「对焦」：从模糊、半透明、略微偏上（或偏下）的位置，先快后慢地清晰下来、落回原位，相邻两个字之间隔着固定的一小段错开，整句像镜头逐字拉清。可以按字也可以按词浮现。全部清晰后停一会儿，再从头来一遍。

## 实现提示

把文案拆成逐字或逐词的 inline-block span，每个 span 用同一条 keyframes（filter: blur 从起始模糊到 0、opacity 0→1、translateY 从方向 × −0.6em 到 0，中途在 50% 过一个半清晰略过头的点），animation-delay = 序号 × 相邻错开；方向用 CSS 变量 ±1 乘进位移。循环用 setInterval 重新渲染一遍 span。

- 容器是居中的 `<p>`：`max-width: 86vw; text-align: center; font-weight: 600; line-height: 1.5`，字号 `{{fontSize}}`、颜色 `{{color}}`、字体 {{font}}；整句写进容器 `aria-label`，span 一律 `aria-hidden`。
- 拆分：逐字 `Array.from(text)`（空格也算一个单位）；逐词 `text.split(/(\s+)/)` 滤掉空串，空白段也是独立 span。span `display: inline-block; white-space: pre`，空格才不被折叠。
- 方向系数 `--dir` 取自浮现方向（「从上方落下」为 -1、「从下方升起」为 1，当前 {{direction}}）。span 初始态 `filter: blur({{blurAmount}}); opacity: 0; transform: translateY(calc(var(--dir) × 0.6em))`（-1 起点在上方、1 在下方）。
- 关键帧 50%：`blur(calc({{blurAmount}} × 0.35))`、`opacity 0.6`、`translateY(calc(var(--dir) × 0.12em))`（反向略过头）；100%：`blur(0); opacity: 1; transform: none`。缓动 `cubic-bezier(0.2, 0.7, 0.2, 1)`、`forwards`，时长 `{{duration}}`，`animation-delay` 走每个 span 的内联变量 `--d = 序号 × {{stagger}}`。
- 循环：一轮 = 单位数 × {{stagger}} + {{duration}} + 1.8s 停留，到点清空容器重新生成全部 span（重建即重播），`document.hidden` 时跳过这一轮；`prefers-reduced-motion` 下不起定时器，CSS 直接 `animation: none; filter: none; opacity: 1; transform: none`。

## 完成后请检查

- 字是一个个先后对焦的，不是整句一起变清晰；错开间隔均匀
- 落定后没有残留模糊或位移，行高不因动画抖动
- 系统开启「减少动态效果」时直接完整显示，不做动画
