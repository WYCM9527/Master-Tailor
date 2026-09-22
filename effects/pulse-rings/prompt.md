## 效果描述

画面中央一组同心圆环，一圈套一圈向外扩展，越外圈越大也越淡，整体从上到下渐渐隐去、只在上半部分清晰。所有圆环都在缓缓呼吸——缩小一点再回来——但外圈比内圈稍晚一步，于是看起来像一次次由内向外扩散的脉冲。中间放一句话，圆环就是它的舞台。圆环数量、大小、间距、透明度、呼吸节奏和颜色都可调。

## 实现提示

按数量生成绝对定位、居中的圆形 div：第 i 圈直径 = 最内圈直径 + i × 每圈增大，不透明度 = 内圈值 − i × 0.03，1px 描边加 25% 同色填充。关键帧 `scale(1) → scale(0.9) → scale(1)`、ease、无限循环，第 i 圈 `animation-delay = i × 相邻圈延迟`。整组容器用 `mask-image: linear-gradient(to bottom, #000, transparent)` 做向下渐隐。文字放在圆环之上，z-index 高一层。

- 结构：body 网格居中、`overflow: hidden`；圆环容器 `position: fixed; inset: 0; pointer-events: none`，`mask-image: linear-gradient(to bottom, #000, transparent {{fade}})`（加 `-webkit-` 前缀）；JS 生成 {{count}} 个圆环 div。
- 单个圆环：绝对定位在 50% / 50%，直径 `{{baseSize}} + i × {{step}}`，`border: 1px solid {{ring}}`，填充 `color-mix(in srgb, {{ring}} 25%, transparent)`，`box-shadow: 0 20px 25px -5px rgba(0,0,0,0.25)`，不透明度 `max(0.02, {{opacity}} − i × 0.03)`。
- 动画：`mt-pulse {{duration}} ease infinite`，`animation-delay = i × {{stagger}}`；关键帧 `0%, 100% { translate(-50%, -50%) scale(1) }`、`50% { translate(-50%, -50%) scale(0.9) }`——居中的 translate 要写进每个关键帧，否则会被覆盖、圆环跳到左上角。
- 中央文字 {{title}}：`position: relative; z-index: 1; text-align: center; white-space: pre-wrap`，48px、字重 500、`letter-spacing: -0.03em`，颜色 {{color}}，系统无衬线字体；留空则隐藏。
- 切后台：`visibilitychange` 时把圆环的 `animation-play-state` 置为 paused / running；「减少动态效果」时 `animation: none`，圆环静止。

## 完成后请检查

- 脉冲方向是由内向外（内圈先动）；外圈明显更淡
- 底部渐隐平滑，没有硬边；页面在后台时动画暂停
- 系统开启「减少动态效果」时圆环静止
