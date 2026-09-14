## 效果描述

一张正方形深色卡片，中央一个圆形玻璃徽标写着「SECURE」。卡面其实铺满了一层几乎看不见的随机字符（字母数字符号的等宽乱码）。鼠标移上来，光标处出现一团青到紫的渐变光斑，光斑范围内的乱码被「照亮」成彩色渐变字符，边缘柔和地隐去；而且悬停期间整层乱码每秒刷新几十次，像密文在流动。鼠标离开光斑熄灭。刷新率、光斑半径、两个颜色、底色都可调。

## 实现提示

卡片 `position: relative; overflow: hidden`，叠三层：底层 `<pre>` 随机字符（等宽小字、6% 不透明）；一团 `radial-gradient` 加 `filter: blur(20px)` 的光斑 div 跟随光标；顶层再放一份相同字符的 `<pre>`，`color: transparent; background: linear-gradient(135deg, A, B); background-clip: text`，并用 `mask: radial-gradient(circle 半径 at x y, #000, transparent)` 只在光标周围显示。pointermove 把相对卡片的坐标写进 `--x / --y`，进入 / 离开切换类控制两层的 opacity（0.4s）。悬停时用 requestAnimationFrame 按刷新率重新生成随机字符串同时写入两层，保证上下字符一致。中央徽标 z-index 最高。

## 完成后请检查

- 光斑处乱码清晰可见且为渐变色，光斑外乱码几乎不可见
- 悬停时字符持续跳变；离开后光斑淡出
- 系统开启「减少动态效果」时字符不跳变；没有鼠标时缩略图里光斑自动游走
