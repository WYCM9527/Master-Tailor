## 效果描述
一枚按钮。每次点击时，从点击的位置绽开一圈涟漪色的圆形波纹：先以半透明出现，随后一边放大到盖住整个按钮、一边淡出消失，像水面被点了一下。开启始终从中心扩散后，波纹改为一律从按钮中心绽开。涟漪层不拦截点击，连续快速点击会叠加出多圈涟漪。

## 实现提示
点击时在按钮内追加一个绝对定位的圆形元素，从点击坐标以 scale + opacity 的 keyframes 扩散（时长即扩散时长），动画结束后移除；按钮 overflow: hidden，涟漪层 pointer-events: none。

- 按钮：居中放置，文字 {{label}}，`position: relative; overflow: hidden; padding: 16px 40px; font-size: 17px; font-weight: 600; color: #f2f3f8; background: {{color}}; border: none; border-radius: 12px; cursor: pointer`，系统无衬线字体。
- 涟漪元素：`span.ripple`，`position: absolute; border-radius: 50%; background: {{rippleColor}}; opacity: 0.5; transform: scale(0); pointer-events: none`，`animation: mt-ripple {{duration}} ease-out forwards`；关键帧只写终点 `to { transform: scale(2.6); opacity: 0 }`——初始 scale(0) 配 2.6 倍放大，从角落点击也能盖满整个按钮。
- 定位：监听 `pointerdown`；`size = max(按钮宽, 按钮高)`，涟漪宽高都取 size，`left = x − size/2`、`top = y − size/2`，x、y 为点击点相对按钮左上角的坐标；「始终从中心扩散」开启时改用按钮中心。
- 生命周期：每次点击新建一个节点 append 进按钮，`animationend` 时 `remove()`；不复用节点，连点自然叠加多圈。
- 「减少动态效果」：涟漪改为 `animation: mt-flash 0.25s ease-out forwards`，并 `transform: none; border-radius: 12px; inset: 0 !important; width/height: auto !important` 铺满整个按钮，关键帧 `from { opacity: 0.35 } to { opacity: 0 }`——退化成一次整体轻闪。

## 完成后请检查
- 点击按钮任意位置，涟漪从对应位置（或中心，取决于参数）扩散并平滑淡出，时长与参数一致
- 连续点击能同时存在多圈涟漪，互不干扰；动画结束后涟漪节点被移除，不会越积越多
- 按钮原有的点击行为正常触发；系统开启「减少动态效果」时涟漪退化为一次轻微的整体闪烁
