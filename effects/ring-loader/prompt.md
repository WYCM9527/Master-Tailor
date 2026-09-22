## 效果描述
一个居中的加载指示器，按样式呈现三种形态之一：「渐变环」是一个从透明渐变到主色的圆环匀速顺时针旋转，头尾相接像彗星绕圈；「点阵旋转」是八个小圆点围成一圈、透明度由淡到浓形成尾巴，整体一格一格跳着转，带复古机械感；「双弧追逐」是外圈一段弧顺时针、内圈一段弧逆时针，一快一慢互相追逐，底下衬着一圈淡淡的轨道环。

## 实现提示
渐变环用 conic-gradient + mask 挖空中心；点阵用 steps(8) 的 rotate 动画；双弧用两个只着色一侧 border 的圆环分别正反向旋转；轨道环的不透明度即轨道可见度；尺寸与转速写成 CSS 变量。

- 结构：居中一个 `div.mt-loader`（宽高 {{size}}），JS 按样式追加 `ring` / `dots` / `dual` 类，只有点阵要生成 8 个 `<i>`；共用 `@keyframes mt-spin { to { rotate(360deg) } }` 与反向的 `mt-spin-rev`，各时长 = 基准秒 ÷ 转速 {{speed}}（用 `calc()`）。
- 渐变环：`border-radius: 50%`，`background: conic-gradient(from 0deg, transparent 8%, {{color}}) border-box`（8% 透明缺口即彗尾起点），`mask: radial-gradient(farthest-side, transparent calc(100% - 6px), #000 calc(100% - 5px))`（加 `-webkit-mask`）挖出 6px 宽的环；基准 1s、linear。
- 点阵：容器基准 1.6s、`steps(8)`；第 i 个点 `position: absolute; top: 0; left: calc(50% - {{size}} / 16)`，直径 `{{size}} / 8`，圆形，背景 {{color}}，`transform-origin: calc({{size}} / 16) calc({{size}} / 2)`（绕容器中心），`rotate(i × 45deg)`，`opacity = 0.2 + i / 8 × 0.8`。
- 双弧：`::before` / `::after` 都是 `position: absolute; inset: 0; border-radius: 50%; border: 4px solid rgba(255,255,255, {{track}})`（半透明白圈即轨道）；外弧 `border-top-color: {{color}}`、基准 1s 顺时针，内弧 `inset: 22%`、`border-bottom-color: {{color}}`、基准 1.4s 逆时针，缓动均为 `cubic-bezier(0.6, 0.2, 0.4, 0.8)`。
- 「减少动态效果」：三种样式（含伪元素）统一改为 `mt-pulse 2s ease-in-out infinite !important`，关键帧 `50% { opacity: 0.45 }`；纯 CSS 动画，后台自动暂停。

## 完成后请检查
- 指示器样式、颜色、大小、转速与参数一致，旋转匀滑（点阵样式除外，它就该是跳格的）
- 元素带 role="status" 和 aria-label="加载中"，屏幕阅读器能识别
- 系统开启「减少动态效果」时停止旋转，改为缓慢的透明度呼吸（仍能看出在加载）
