## 效果描述

一张歪着贴在页面上的圆角贴纸，带着淡淡的投影。鼠标悬停时，贴纸沿一条水平折线（默认在上方）整体向下翻折下来一截，露出灰白色的背胶面，翻下来的那截在正面上投出一片软阴影；按住鼠标时翻得更多，松开回弹一点，移开后慢慢贴回去。贴纸表面有一小块跟着鼠标走的高光，像光泽的塑料膜。可以按住拖着它到处贴。翻折方向可以改成从下、从左、从右。图片、宽度、翻折比例、方向、歪斜、投影、高光、圆角见参数。

## 实现提示

- 结构三层，全部是同一张图（贴纸容器宽 {{size}}，图 `width: 100%; height: auto`，圆角 {{rounded}}）：①正面 `img`，`clip-path: polygon` 把上方 `peel%` 裁掉（多边形四角向外留 12px 余量，避免投影被切）；②背面翻片：正面的副本 `transform: scaleY(-1)`，`top: calc(−100% + 2 × peel − 1px)`，`clip-path` 只露出 0–peel% 那一条——上下翻转后正好像沿折线翻下来贴在正面上；背面图套一个 `feColorMatrix` 压成半透明白灰模拟背胶；③翻片的影子：再一份翻片 `filter: brightness(0) blur(8px)`、`opacity 0.4`、偏移 (8px, 16px)。
- `peel` 是 CSS 变量：初始 0，悬停 {{peelHover}}、按住 {{peelActive}}，`clip-path` 与 `top` 用 0.6s ease-out 过渡。
- 翻折方向：外层容器 `rotate(方向角)`（从上 / 下 / 右 / 左翻分别取 0° / 180° / 90° / 270°），内层贴纸 `rotate({{rotate}} − 方向角)` 抵消，这样折线永远在「上方」的逻辑不变、只是整体转了方向。
- 高光：SVG 滤镜 `feGaussianBlur(SourceAlpha) → feSpecularLighting(specularExponent 100, specularConstant = {{lighting}}, fePointLight z=300) → feComposite 叠回原图并按 alpha 裁`；pointermove 把光源 x/y 设为鼠标相对贴纸的坐标，翻片那一份的 y 取 `高度 − y`（因为它被上下翻转了）。
- 投影用 `feDropShadow(dx 2, dy 4, stdDeviation 3 × {{shadow}}, flood-opacity = {{shadow}})`。拖拽用 pointer 事件改外层 translate。

## 完成后请检查

- 悬停时贴纸沿折线整体翻下一截、露出背面并在正面留下软阴影；按住翻得更多
- 高光随鼠标在贴纸表面移动；切换方向后从对应边翻折
- 拖拽跟手；系统开启「减少动态效果」时翻折直接切换
