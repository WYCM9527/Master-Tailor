## 效果描述

一排图片卡。鼠标悬停某一张时，它背后「抽」出三张纯色卡片——粉、紫、蓝——一张接一张（相隔几十毫秒）向右下方阶梯式错开，越靠后的越淡，主卡自己向左上微微抬起，整体像一叠彩纸被推开了一角；移开鼠标全部收回叠齐。变体可换成绕左下角扇形展开，或向 3D 纵深一层层后退并翘起。彩卡颜色与数量、错开距离、时长、圆角都可调。

## 实现提示

每个卡片项 `position: relative`，主卡 z-index 2；每种颜色一个 `position: absolute; inset: 0` 的色卡放在主卡下面，默认 `opacity: 0; transform: none`（完全被主卡盖住）。悬停时第 n 张色卡 `transform: translate(错开 × n, 错开 × n)`、opacity 按 `1 − 0.22n` 递减，`transition-delay = 40ms × 序号`，主卡 `translate(−错开/2, −错开/2)`。扇开变体把色卡 `transform-origin` 设在 `10% 100%`，`rotate(−5deg × n)`，主卡 `rotate(3deg)`；纵深变体给网格 `perspective: 1000px`、卡片项 `preserve-3d`，色卡 `translate3d(0, −错开 × n, −40px × n) rotateX(4deg × n)`，主卡 `translateZ(20px) rotateX(−4deg)`。过渡用 `cubic-bezier(0.2, 1, 0.3, 1)`。

## 完成后请检查

- 色卡依次错开出现、越远越淡；移开后收回叠齐无残影
- 三种变体各自成立，改颜色数量后层数随之变化
- 系统开启「减少动态效果」时无过渡；没有鼠标时缩略图里轮流演示
