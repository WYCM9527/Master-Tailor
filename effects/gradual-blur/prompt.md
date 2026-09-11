## 效果描述

一个可以滚动的图文容器，靠近某一条边（默认底部）的内容并不是被硬生生裁掉，而是越接近边缘越模糊，像画面在边缘慢慢化进一层磨砂玻璃里；内容滚过去时会从模糊中逐渐清晰。模糊可以放在顶部、底部、上下两侧或左右。强度、宽度、分层数、递增方式与过渡曲线见参数。

## 实现提示

- 在滚动容器的父级上贴一个绝对定位、`pointer-events: none` 的「模糊层组」，宽（或高）等于模糊带宽度。
- 组里叠 N 个铺满的子层，第 i 层（i 从 1 到 N，`inc = 100/N`）：`mask-image: linear-gradient(朝容器内的方向, transparent (i−1)·inc%, black i·inc%, black (i+1)·inc%, transparent (i+2)·inc%)`——每层只负责自己那一段并与邻层过渡重叠；`backdrop-filter: blur(值)`，值线性模式 `0.0625 × (progress×N + 1) × 强度` rem，指数模式 `2^(4·progress) × 0.0625 × 强度` rem，progress 先过一遍过渡曲线（线性 / smoothstep / ease-in / ease-out / ease-in-out）。
- 层数越多每段越窄、过渡越细腻；`opacity` 控制整组不透明度。
- 底部模糊方向 `to top`、顶部 `to bottom`、左 `to right`、右 `to left`；「上下都有」建两组。

## 技术要求补充

- 纯 CSS `backdrop-filter` + `mask-image`，无 JS 动画；容器隐藏滚动条但保留滚动。
- 模糊层组加 `isolation: isolate` 避免与外部混合。

## 完成后请检查

- 边缘处内容由清晰到模糊是连续渐变，看不出分层的硬边
- 滚动时被吞进边缘的图片逐渐化开，滚回来又逐渐清晰
- 切到「上下都有」两端同时模糊
