## 效果描述
一枚普通的按钮静静待在原位。鼠标进入它周围的感应半径后，按钮像被磁铁吸住一样朝鼠标方向轻轻偏移，离鼠标越近偏得越多（幅度由磁力强度决定）；鼠标离开感应范围后，按钮用一条带轻微过冲的弹簧曲线弹回原位。整体手感是「按钮想跟着你的鼠标走」，俏皮但不夸张。

## 实现提示
pointermove 时算鼠标到按钮中心的向量，乘以磁力强度写入 transform: translate；超出感应半径或离开时切到带过冲的 cubic-bezier 过渡回零。

- 结构只有一个居中的 `<button>`（body `display: grid; place-items: center`），文字 {{label}}；`padding: 16px 36px; font-size: 17px; font-weight: 600; border: none; cursor: pointer`，底色 {{color}}、文字色 {{textColor}}、圆角 {{rounded}}，`will-change: transform`。
- 跟随的平滑感和回弹都来自同一条过渡：`transition: transform 0.45s cubic-bezier(0.22, 1.4, 0.36, 1)`（第二个控制点 1.4 > 1 才有过冲）。不用 rAF 插值，每次事件直接写目标位移；出界或离开时把 transform 清空，同一条曲线让按钮越过原位再弹回。
- 监听挂在 `document` 的 `mousemove` 上（挂按钮自身则鼠标没碰到按钮就不会被吸）：每次用 `getBoundingClientRect()` 取按钮当前中心，`dx / dy` = 鼠标 − 中心，`dist = hypot(dx, dy)`；`dist < {{radius}}` 时写 `translate(dx × {{strength}}, dy × {{strength}})`（px），否则 `transform = ''`。
- `document` 的 `mouseleave` 同样清空 transform；「减少动态效果」时整段位移逻辑跳过，按钮静止。不改 pointer-events、不加 scale，键盘焦点与 click 不受影响。

## 完成后请检查
- 鼠标在按钮附近移动时按钮平滑跟随，离开后有一次自然的回弹，不生硬、不抖动
- 感应范围、吸附幅度与参数一致；鼠标在感应范围外时按钮完全静止
- 按钮本身仍可正常点击，键盘 Tab 聚焦和原有点击事件不受影响
