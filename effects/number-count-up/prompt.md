## 效果描述

一个大号数字从 0 开始往上滚，一路飞快地跳到接近目标值时明显放慢，最后稳稳停在目标数值上，下方一行小字说明它是什么。数字可以带千位分隔符、前缀（如货币符号）和后缀（如加号、百分号）。滚动过程中数字宽度不会抖动。停住后停一会儿，再从零滚一遍。

## 实现提示

用 requestAnimationFrame 按进度 t（经过时间 ÷ 滚动时长）计算当前值 = 目标 × 缓动(t)，缓动按收尾方式选 easeOutCubic / easeInOutCubic / 线性；每帧格式化为整数并按开关加千位分隔符，前后缀用小号上标 span。数字用 font-variant-numeric: tabular-nums 保证等宽。

- 参数落点：目标 {{target}}，滚动时长 {{duration}}，收尾方式 {{ease}}——out 为 `1 − (1 − t)³`，inout 为 `t < 0.5 ? 4t³ : 1 − (−2t + 2)³ / 2`，linear 为 `t`；千位分隔符（{{separator}}）用正则 `\B(?=(\d{3})+(?!\d))` 插逗号；前缀 {{prefix}}、后缀 {{suffix}}，为空则不渲染对应 span；说明文字 {{label}}。
- 排版：整体 `text-align: center` 居中在深色底（#0a0a0f）页面上。数字：字号 {{fontSize}}，字体 {{font}}，700 字重，`line-height: 1`，`letter-spacing: -0.02em`，颜色 {{color}}，`font-variant-numeric: tabular-nums`，容器加 `aria-live="polite"`。前后缀 span：`font-size: 0.55em; vertical-align: 0.25em; margin: 0 0.1em; opacity: 0.85`（相对数字字号）。说明文字：上边距 14px，14px 字号，`letter-spacing: 0.12em`，颜色 `rgba(255,255,255,0.55)`。
- 时序：每帧 `t = min(1, (now − start) / 总毫秒)`，显示 `Math.round(目标 × ease(t))`，t < 1 继续请求下一帧，t = 1 时正好等于目标不会超；页面隐藏时只续 rAF、跳过更新（t 仍按真实经过时间算）。停住后 2.5 秒再从零重跑（`setInterval` 周期 = 滚动时长 + 2.5s，隐藏时跳过）。
- 减少动态：不滚动，直接写入格式化后的目标值。

## 完成后请检查

- 滚动是先快后慢（或按所选方式）最终精确停在目标值，不多不少
- 千位分隔符与前后缀按参数显示；滚动时数字整体不左右抖动
- 系统开启「减少动态效果」时直接显示目标值
