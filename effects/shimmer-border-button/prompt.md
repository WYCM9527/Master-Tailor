## 效果描述
一枚深色按钮，边框上有一段由流光色 A 过渡到流光色 B 的光带，沿按钮四周不停顺时针流转一圈又一圈。光带经过的地方还透出一圈柔和的同色光晕，整体像一枚「霓虹描边」按钮。按钮中心保持纯深色，文字始终清晰。

## 实现提示
用 CSS `@property` 注册一个角度变量，配合 `conic-gradient(from 角度, …)` 做旋转动画；按钮的伪元素比按钮大出描边宽度，中间用同底色内层盖住，只露出边缘；再复制一层加 `blur` 作为光晕。
- 按钮 `isolation: isolate; padding: 16px 40px`，字 17px / 600 #f2f3f8，底 #14151f，无边框，圆角 {{rounded}}；`.inner` 内层 `inset: 0; z-index: -1`，同底色同圆角。
- `@property --angle { syntax: '<angle>'; initial-value: 0deg; inherits: false }`。
- `::before` 描边层：`inset: calc({{borderWidth}} * -1)`，圆角 `{{rounded}} + {{borderWidth}}`，`z-index: -2`，`conic-gradient(from var(--angle), transparent 0%, {{colorA}} 18%, {{colorB}} 34%, transparent 52%)`（光带约占半圈，其余透明）。
- `::after` 光晕层：同尺寸同渐变同动画，`z-index: -3; filter: blur(14px); opacity: 0.55`。
- `@keyframes spin { to { --angle: 360deg } }`，两层 `animation: spin 周期 linear infinite`，周期 = 3.2s ÷ 流转速度倍率（{{speed}}）；「减少动态效果」时 `animation: none`。

## 完成后请检查
- 光带沿边框平滑流转，无卡顿、无接缝跳变，速度与参数一致
- 描边粗细均匀，按钮中心是纯色、文字清晰；光晕柔和不刺眼
- 系统开启「减少动态效果」时光带停止流转，只保留静态渐变描边
