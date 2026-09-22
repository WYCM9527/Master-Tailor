## 效果描述

漆黑的画面中央悬着一颗由许多张卡片拼成的球体，转轴略微歪着，像地球仪那样缓慢自转。密铺时卡片紧紧相贴、铺满整个球面，转起来像迪斯科球在闪；稀疏时卡片少而大、彼此留出空隙，透过缝隙能看到球背面那些压暗的卡片正朝反方向掠过。转动匀速而安静，不需要任何操作，整圈接整圈永不停歇。

## 实现提示

- 舞台 `.stage { perspective: 1500px; overflow: hidden }` 全屏；中央放零尺寸锚点 `.axis { transform: rotateX({{tilt}}) rotateZ(8deg); transform-style: preserve-3d }`，里面 `.globe { transform-style: preserve-3d; animation: spin {{speed}} linear infinite }`，关键帧 `rotateY(0 → 360deg)`，刚体转满一圈回到原样即无缝。
- 按纬度分 {{bands}} 带，带 k 的纬度 φ_k = −70° + k × 140° / (B − 1)，两极留空；带内卡数 n_k = max(4, round(P × cos φ_k))，P 为赤道卡数 {{perEquator}}（稀疏模式下 P 减半）。卡 (k, j)：`translate(-50%, -50%) rotateY(j × 360° / n_k + k × 180° / n_k) rotateX(−φ_k) translateZ({{sphere}})`，每带错开半格像砌砖。
- 总数 Σn_k 不超过 96：超出时按 96 / Σ 的比例缩小 P 再重算（七带二十张会缩到十九张），仍超就逐张减。
- 卡宽系数 wk = 2 × sin(π / P) × 0.96（稀疏模式再 × 1.6，P 用未减半的值），每带再用本纬圈弦长 2 × cos φ_k × sin(π / n_k) × 0.96 兜底，避免极区卡片互相穿插；卡高系数 hk = min(wk × 1.4, 带间弧长 × 0.94) × (0.55 + 0.45 × cos φ_k)，越靠两极越矮。宽高写成 `calc({{sphere}} × 系数)`，改球半径整体等比缩放。
- 排布模式 {{mode}}：密铺时卡片 `transform-style: flat; overflow: hidden; backface-visibility: hidden`，背面直接裁掉；稀疏时卡片 `transform-style: preserve-3d`、不写 overflow，圆角 {{radius}} 给图片与压暗层；卡内 `::after` 铺满，`background: rgba(0, 0, 0, {{backDim}})`，`transform: rotateY(180deg) translateZ(1px); backface-visibility: hidden`，正面时它被隐藏、转到背面时盖在镜像图片上。
- 图片 `object-fit: cover; display: block`，加载前底色 #16161d，按序循环取图并每轮错开一张；`will-change: transform`，全程只动 transform。
- 后台暂停：visibilitychange 时把带动画元素的 animation-play-state 置为 paused；`@media (prefers-reduced-motion: reduce)` 下 `.globe { animation: none }`，静止的球。

## 完成后请检查

- 密铺时球面没有明显的大缝，背面卡片不透出；稀疏时透过缝隙看到的背面卡片是压暗的镜像
- 转满一圈回到起点时没有跳变，球居中且转轴有可见的倾斜
- 页面切后台时暂停，系统开启「减少动态效果」时静止
