## 效果描述
一张深色卡片，常态下只有一圈几乎看不见的暗边框。鼠标在卡片附近移动时，边框上离鼠标最近的一段被「点亮」成光的颜色：亮起的范围是以鼠标为圆心的一段圆弧渐变，沿边框平滑衔接、跟着鼠标游走，像一盏小聚光灯打在卡片轮廓上。卡片内部保持纯深色，只有边框发光。

## 实现提示
- 纯 CSS 渐变 + mask，不用 canvas。卡片 `position: relative`，宽 `min(360px, 78vw)`、内边距 `34px 30px`、圆角 16px、底色 #14151f、文字色 #f2f3f8；常态边框 `{{borderWidth}} solid rgba(255, 255, 255, 0.08)`，光熄灭后靠它撑轮廓。标题 20px、字距 0.03em、下距 10px；描述 14px、行高 1.7、色 #aab0c0。
- 发光层是 `::before`：`position: absolute; inset: calc({{borderWidth}} × −1)`（外扩一个边框宽盖住边框环）、`border-radius: 16px`（与卡片同值）、`padding: {{borderWidth}}`、`pointer-events: none`；背景 `radial-gradient(circle {{glowRadius}} at var(--mx) var(--my), {{glowColor}}, transparent 100%)`（鼠标处纯色 → 半径处全透明）。
- 只留边框环：`mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)` 两层相减，`mask-composite: exclude`（WebKit 写 `-webkit-mask-composite: xor`），只剩 padding 宽（= 边框宽）的一圈。
- 鼠标坐标用 CSS 变量 `--mx / --my` 传入，初始 `-9999px`（圆心在画面外，边框全暗）。监听 `document` 的 `mousemove`（鼠标在卡片附近也要亮），写入 `clientX/Y − 卡片 getBoundingClientRect().left/top`（px）；`document` 的 `mouseleave` 时恢复 `-9999px`。变量不加过渡，光斑直接跟手。
- 系统开启「减少动态效果」时把 `--mx: 20%; --my: 0%` 固定在卡片顶部偏左，JS 不再更新。

## 完成后请检查
- 鼠标绕卡片移动时，边框亮起的一段始终朝向鼠标，过渡柔和无断裂
- 卡片内部没有被渐变污染，只有边框环发光；光的颜色与半径符合参数
- 鼠标离开页面后边框恢复安静的暗色；系统开启「减少动态效果」时光固定不跟随
