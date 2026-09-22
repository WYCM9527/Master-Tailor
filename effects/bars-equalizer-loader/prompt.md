## 效果描述

五根圆头竖条并排，像播放器里的音量均衡器：每根都在不断伸长、缩短，最矮时只剩三成高度，最高时撑满；各条节奏错开、峰值不同（中间的高、两侧的矮），整体此起彼伏，像有音乐在响。条数、宽度、间距、高度、颜色、速度都可调。

## 实现提示

一个 flex 容器（垂直居中），按条数生成 `<i>`，每根 `height: 100%`、圆角、`transform-origin` 居中，关键帧 `scaleY(0.3) → scaleY(峰值) → scaleY(0.3)`，`ease-in-out` 无限循环。第 i 根的 `animation-delay` 取负值 `−(|i − 中点| × 0.12 + i × 0.05)s` 让相位错开，`--peak` 按离中点的距离从 1 降到 0.7。

- 容器：`display: flex; align-items: center`，`gap` 取 {{gap}}，`height` 取 {{height}}；条数取 {{bars}}，中点 = (条数 − 1) / 2。
- 单条：`display: block; height: 100%`，宽取 {{width}}，`border-radius: calc(条宽 / 2)` 两端全圆，`background` 取 {{color}}，`transform-origin: 50% 50%`（从中心向两端伸缩）。
- 动画：`animation: mt-eq 一轮时长 ease-in-out infinite`，一轮时长取 {{speed}}；`--d`、`--peak` 以内联变量写在每根条上。
- 关键帧：`0%, 100% { scaleY(0.3) }`、`50% { scaleY(var(--peak, 1)) }`。
- 峰值：`--peak = 0.7 + 0.3 × (1 − |i − 中点| / max(1, 中点))`，保留两位小数，中间 1、两侧线性降到 0.7；负延迟让各条起始相位不同。
- 「减少动态效果」时 `animation-play-state: paused`。

## 完成后请检查

- 各条节奏明显错开、中间高两侧矮
- 条数改变后仍居中且间距一致
- 系统开启「减少动态效果」时静止
