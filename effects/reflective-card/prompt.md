## 效果描述

一张竖版卡片像一枚镀了全息膜的收藏卡。鼠标在卡面上移动时，卡片朝鼠标方向立体倾斜，表面一层彩虹色的全息条纹随之流转变换位置，还有一团白色高光跟着鼠标在卡面上滑动，像真的在灯下转动一张闪卡。鼠标离开后卡片慢慢回正，全息与高光回到中央。全息浓度与高光强度都可调，全息为 0 时就是一张金属反光卡。

## 实现提示

外层 perspective，卡片用 rotateX/rotateY 绑 CSS 变量，鼠标归一化位置（−0.5…0.5）每帧按迟滞插值后写入：rotateY = x × 倾斜 × 2、rotateX = −y × 倾斜 × 2。全息层是一条多色斜向 linear-gradient，background-size 260%，background-position 随鼠标反向移动，mix-blend-mode: color-dodge 并按全息强度设 opacity；高光层是跟随鼠标位置的 radial-gradient 白光，mix-blend-mode: soft-light。

- 结构：body 网格居中，`perspective: 1000px`；卡片 `width: min(320px, 76vw); aspect-ratio: 3 / 4; border-radius: {{rounded}}; overflow: hidden; background: #14151f; box-shadow: 0 30px 80px rgba(0,0,0,0.5)`，`transform: rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg))`；内含占位图（`object-fit: cover`）、全息层、高光层、底部标题条。
- 全息层（绝对定位铺满、`pointer-events: none`，高光层同）：`linear-gradient(115deg, transparent 20%, rgba(255,80,120,.9) 32%, rgba(255,220,90,.9) 40%, rgba(90,255,160,.9) 48%, rgba(80,180,255,.9) 56%, rgba(200,90,255,.9) 64%, transparent 78%)`，`background-size: 260% 260%`，`background-position: var(--px, 50%) var(--py, 50%)`，`mix-blend-mode: color-dodge`，`opacity = {{holo}} × 0.6`。
- 高光层：`radial-gradient(260px at var(--gx, 50%) var(--gy, 50%), rgba(255,255,255, {{gloss}} × 0.55), transparent 60%)`，`mix-blend-mode: soft-light`。
- 标题条 {{title}}：贴底，`padding: 40px 18px 16px`，白字 13px、字重 700、`letter-spacing: 0.12em`，背景 `linear-gradient(transparent, rgba(0,0,0,0.55))`。
- 交互：`pointermove` 取卡内归一化目标 `tx = (clientX − left) / width − 0.5`（ty 同理），`pointerleave` 归 0 回正；每帧 `x += (tx − x) × {{lag}}`（y 同），写入 `--ry = x × {{tilt}} × 2`、`--rx = −y × {{tilt}} × 2`（deg），高光中心 `--gx/--gy = (x/y + 0.5) × 100%`，全息位置反向 `--px/--py = (0.5 − x/y) × 100%`；`document.hidden` 时跳过。
- 「减少动态效果」：卡片 `transform: none !important` 不再倾斜；JS 不再从 pointermove 采样目标位置（目标保持 0,0），全息与高光留在中心，插值系数取 1。

## 完成后请检查

- 倾斜方向与鼠标一致、有迟滞不抖；离开后回正
- 全息条纹与高光随鼠标位置连续变化，颜色叠在图片上而不是盖住图片
- 系统开启「减少动态效果」时卡片不倾斜，全息与高光固定居中
