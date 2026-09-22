## 效果描述

一颗像机械键盘键帽的按钮：蓝色的键面下面露出一条更深的蓝色「侧面」，看起来有 6px 厚，还带一点投影。鼠标悬停时整颗键帽微微抬高、更亮一点；按下的瞬间键帽向下压进底座，侧面被压没、投影缩小，松手弹回。键面色、侧面色、厚度、圆角、字号都可调。

## 实现提示

- 一个居中的原生 `<button>`（文字 {{label}}）：`padding: 14px 36px; border: 0`，圆角 {{radius}}，底色键面色 {{face}}，字色 {{color}}，字号 {{fontSize}}、字重 800、字距 0.04em，系统无衬线字体，`cursor: pointer`。厚度、颜色都放进 CSS 变量，后面的偏移量全用 `calc()` 从厚度推出来，改厚度时侧面高度与按下距离才会一起变。
- 按钮不用真的 3D，厚度用 `box-shadow: 0 厚度 0 侧面色` 画一条实心的向下偏移阴影（厚度取 {{depth}}，侧面色取 {{side}}），再叠一层带模糊的普通投影 `0 calc(厚度 + 6px) 14px -6px rgba(0, 0, 0, 0.6)`；静止态 `transform: translateY(0)`。
- 悬停（`:hover` 与 `:focus-visible` 同款，`outline: none`）：`translateY(-2px)` 且侧面阴影偏移加 2px（`0 calc(厚度 + 2px) 0 侧面色`），投影跟着拉长为 `0 calc(厚度 + 10px) 18px -6px rgba(0, 0, 0, 0.6)`，`filter: brightness(1.06)`。
- 按下（`:active`）：`translateY(厚度)` 把键面移到侧面原来的位置，同时侧面阴影偏移归零（`0 0 0 侧面色`），投影缩成 `0 2px 6px -2px rgba(0, 0, 0, 0.6)`，`filter: brightness(0.95)`——视觉上就是压进去了。
- 过渡 `transition: transform 0.12s ease, box-shadow 0.12s ease, filter 0.12s`；按下态把 `transition-duration` 改成 0.06s（下压比回弹快）。`prefers-reduced-motion` 时 `transition: none`。

## 完成后请检查

- 静止时有清晰的侧面厚度；悬停抬高、按下压平、松开弹回
- 改厚度时侧面高度与按下距离一致
- 系统开启「减少动态效果」时无过渡
