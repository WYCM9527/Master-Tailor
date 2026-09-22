## 效果描述

整屏铺满一格一格的短线，像撒在纸上的铁屑。鼠标一动，每根线都绕自己的中心转过来，与「它到鼠标的方向」垂直——于是整片线阵呈现出一圈圈以鼠标为中心的同心环纹，像磁铁周围铁屑排出的磁力线；离鼠标越近的线颜色越亮，远处的线也跟着微微转动。转向可以带惯性（慢半拍跟上），也可以瞬间到位。

## 实现提示

CSS grid 均分格子，每格放一根**竖着**的 div（width = 线粗、height = 线长），用 transform: rotate 转向。初始化时记录每根线中心坐标（resize 时重算）；每帧对每根线算 atan2(鼠标 − 中心) 得到方位角，直接把这个角当作旋转角——竖线转过方位角后正好与该方向垂直，同心环纹由此而来（不要用横线，横线会变成放射状）。按最短路径（把角差归一到 ±π）乘以迟滞系数 {{lag}} 插值累加，写入 CSS 变量；靠近变亮用距离 ÷ 半屏对角线线性映射到 opacity 0.25–1。

- 容器 `position: fixed; inset: 0; display: grid; place-items: center; cursor: crosshair`，`grid-template-columns: repeat({{cols}}, 1fr)`、`grid-template-rows: repeat({{rows}}, 1fr)`，每格正中一个 div。
- 每根线：`width: {{thickness}}; height: {{length}}; background: {{color}}`，`transform: rotate(var(--a, 0deg))`、`opacity: var(--o, 0.5)`（关闭「靠近变亮」时恒为 0.5），加 `will-change: transform, opacity`。
- 每根线的角 a 初始 0（竖直）、鼠标初始在视口中心；每帧 `a += 折进 ±π 的角差 × {{lag}}`，写入时转成角度、保留 1 位小数。
- 变亮：`maxD = hypot(视口宽, 视口高) × 0.5`（加载时算一次），`--o = 0.25 + 0.75 × max(0, 1 − 距离 / maxD)`，保留 2 位小数。
- rAF 循环；`document.hidden` 或「减少动态效果」时跳过更新，媒体查询里把线强制 `transform: none; opacity: 0.5`。

## 完成后请检查

- 线阵呈以鼠标为中心的同心环纹（每根线与指向鼠标的方向垂直），鼠标经过 180° 方向时线不会反向打转
- 迟滞小时有明显跟随感，迟滞为 1 时瞬间到位
- 系统开启「减少动态效果」时线条全部竖直静止
