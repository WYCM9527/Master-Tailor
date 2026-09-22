## 效果描述

一条大弧线横跨整个画面，可以向上拱起也可以向下垂，一串大字贴着这条弧线不停地流过：从一侧流入、沿着弧线弯着走、从另一侧流出，首尾相接看不出接缝，像一面挂在天边的环形横幅。流动方向、速度和弧线的弯度都可调；可以按住文字左右拖动，松手后它会顺着你甩的方向继续跑。

## 实现提示

用 SVG：一条二次贝塞尔曲线 path（两端放在视口外，控制点高度由弯度决定）作为 textPath 的路径；把文案重复到比路径总长更长再多补一段，然后每帧递增 textPath 的 startOffset，并把它归一到 [-单段文案长度, 0] 区间——正好平移一个文案单位后回到起点，肉眼无缝。速度按 px/秒 乘帧间隔。拖动：pointerdown 记录起点并暂停自动流动，pointermove 把屏幕位移换算成 viewBox 单位直接加到 startOffset 上（同样做归一），记录最后一次位移的符号；pointerup 恢复自动流动并把方向改成最后甩动的方向。

- SVG `viewBox="0 0 1200 600"`，铺满视口、`overflow: visible`，下面的量都是 viewBox 单位。
- 路径 `M -200 340 Q 600 (340 − 2 × 弯度) 1400 340`，弯度取 {{curve}}；二次曲线顶点只到控制点一半高，故乘 2。
- 文字 `font-weight: 700`、`letter-spacing: 0.04em`、`text-transform: uppercase`，填色 {{color}}、字号 {{fontSize}}、字体 {{font}}。
- 重复份数 = `ceil(路径长 / 单段文案长) + 2`，单段长用 `getComputedTextLength()` 量，`document.fonts.ready` 后及之后每 1.5s 重量一次。
- 归一 `wrap(v) = ((v % L) − L) % L`（L 为单段长）；每帧 `offset = wrap(offset + dir × 速度 × dt)`，速度取 {{speed}}，向左 dir = −1、向右 1。
- 拖动由「可按住拖动」控制（当前：{{draggable}}）：pointerdown 时 `setPointerCapture`，像素换算比例 = 1200 ÷ svg 渲染宽度。

## 完成后请检查

- 文字紧贴弧线且字的朝向随弧线弯曲，两端流入流出处没有空档和跳变
- 弯度为负时弧线向下垂、为 0 时是直线；方向与速度符合参数
- 系统开启「减少动态效果」时文字静止在弧线上
