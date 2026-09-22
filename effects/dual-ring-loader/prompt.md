## 效果描述

两段圆弧套在一起：外圈是上下两段白色弧，内圈是左右两段蓝色弧。外圈顺时针匀速转，内圈逆时针转得更快一点，两圈的弧段不断交错、错开，看着像两个齿轮在咬合。尺寸、线宽、两个颜色、速度都可调。

## 实现提示

- 纯 CSS：一个 `position: relative` 的方形容器，边长 {{size}}；里面两个绝对定位的圆形 div，`border-radius: 50%; border: {{thickness}} solid transparent; box-sizing: border-box`（border-box 让 `inset` 缩进后尺寸仍准确）。
- 外圈 `inset: 0`，只给 `border-top-color` 和 `border-bottom-color` 上色 {{colorA}}，得到上下两段对称的四分之一弧；内圈只给 `border-left-color` / `border-right-color` 上色 {{colorB}}，`inset` 缩进 2.2 倍线宽（即 2.2 × {{thickness}}），两圈之间留出 1.2 倍线宽的空隙，线宽拉到最粗也不重叠；内圈弧段初始位置正好与外圈错开 90°。
- 关键帧只有一帧 `to { transform: rotate(360deg) }`，`linear infinite`：外圈一转用 {{speed}}，内圈时长取其 0.7 倍并加 `animation-direction: reverse`——一顺一逆、一慢一快，两圈弧段周期性交错咬合。两圈都没有缓动、没有过渡，其他样式（阴影、渐变）一律不加。
- 容器带 `role="status"` 与 `aria-label="加载中"`。系统开启「减少动态效果」时用 `animation-play-state: paused` 让两圈静止在初始相位；页面切到后台时同样暂停动画。

## 完成后请检查

- 两圈方向相反、速度不同；弧段对称
- 改线宽后内圈不与外圈重叠
- 系统开启「减少动态效果」时静止
