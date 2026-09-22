## 效果描述

在页面任何位置点一下，点击点立刻炸开一圈短短的直线火花：几根线段沿四面八方飞出去，越飞越远、越飞越短，几百毫秒内消失，像卡通里的「叮」一下。火花数量、长度、飞出距离、持续时间和粗细都可调，多次快速点击会叠出多组火花。中间放一个按钮作为示范，按下时微微缩一下。

## 实现提示

一张铺满页面、pointer-events: none 的 canvas 负责画火花。pointerdown 时记录一组火花：等角分布（加一点随机角度微扰）与各自的目标距离。每帧按进度 t（经过时间 ÷ 持续时间）用 easeOutCubic 算外端半径 r1 = 距离 × k，线段长度 = 火花长度 × (1 − t)，内端 r0 = r1 − 长度，画从 r0 到 r1 的径向线段；t ≥ 1 的整组移除。lineCap 用 butt 保持利落。

- canvas `position: fixed; inset: 0`，位图按 `devicePixelRatio`（上限 2）放大并 `setTransform(dpr, 0, 0, dpr, 0, 0)`，之后全用 CSS 像素坐标；`pointerdown` 挂在 window 上、取 `clientX / clientY` 作爆点，点在按钮上也出花。
- 生成：第 i 根角度 `2π·i / {{count}} + (random − 0.5) × 0.3`，目标距离 `{{distance}} × (0.8 + random × 0.4)`，记下 `performance.now()`；所有组放进数组，每帧倒序遍历、到期的 splice 掉，多组互不影响。
- 绘制：每帧先 `clearRect` 整张画布，再设 `strokeStyle = {{color}}`、`lineWidth = {{thickness}}`；`t = 经过毫秒 / {{duration}}`，`k = 1 − (1 − t)³`，`len = {{length}} × (1 − t)`，`r0 = max(0, r1 − len)`，每根从 `(x + cos a·r0, y + sin a·r0)` 画到 `(x + cos a·r1, y + sin a·r1)`；`document.hidden` 时跳过绘制。
- 示范按钮直角无圆角：`padding: 14px 32px`，`1px solid {{accent}}` 边 + `{{accent}}` 底，文字 #0a0a0f、16px、600 字重，`transition: transform 0.12s ease`，`:active` 缩到 `scale(0.96)`，`z-index: 1` 压在 canvas 上；底部 22px 一行提示「页面任意位置点击都有火花」，13px、`letter-spacing: 0.12em`、`rgba(255, 255, 255, 0.35)`。
- `prefers-reduced-motion`：生成函数直接 return，CSS 里 canvas `display: none`，按钮按压反馈保留。

## 完成后请检查

- 火花从点击点出发向外飞、逐渐变短，结束时干净消失没有残留
- 连续点击能同时存在多组火花，互不打断
- 系统开启「减少动态效果」时不出火花，按钮仍有按压反馈
