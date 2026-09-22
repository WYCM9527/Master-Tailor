## 效果描述
一条品牌名跑马灯从右向左匀速滚动，内容首尾相接无限循环，接缝处完全看不出「重新开始」；容器两端渐隐收边，品牌名像从雾里滑入滑出。鼠标悬停整条暂停，掠过某个品牌名时它亮起为悬停高亮色。

## 实现提示
轨道里放两份完全相同的内容（第二份对读屏 aria-hidden），用 CSS 动画把轨道 translateX 到 -50% 后无限循环——位移恰好等于一份内容宽度（含间距），肉眼就是无缝的；滚一圈的时长按内容实际宽度换算，保证品牌数量变化时线速度不变；两端渐隐用 mask-image 线性渐变。

- 结构：容器 `width: min(820px, 96vw); overflow: hidden`；轨道 `display: flex; width: max-content`；每份内容是一个 flex 组，`gap: {{gap}}` 且 `padding-right: {{gap}}`，接缝间距才与组内一致，循环点不会多出一道缝。
- 动画：`@keyframes` 只写 `to { transform: translateX(-50%) }`，`linear infinite`；容器 `:hover` 时轨道 `animation-play-state: paused`。
- 速度换算：线速度 = {{speed}} × 4 px/s；首帧 rAF 里量 `track.scrollWidth`，循环时长（秒）= `scrollWidth / 2 / ({{speed}} × 4)`，写回动画时长变量（量到前先用 20s）。
- 渐隐：`mask-image: linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent)`（两端各 12%，加 `-webkit-` 前缀）。
- 品牌名：字号 {{fontSize}}、`font-weight: 700; letter-spacing: 0.06em; white-space: nowrap; flex: none`，颜色 {{color}}、常态 `opacity: 0.85`；悬停变 {{hoverColor}} 且 opacity 1，`transition: color 0.15s ease`。

## 技术要求补充
- 本效果是纯展示型跑马灯：不需要 keydown 键盘切换、也不需要 pointerdown 拖拽（这两类交互不适用），唯一交互是悬停暂停
- 无障碍：容器带 role="region" 和 aria-roledescription="carousel"；第二份复制内容必须 aria-hidden，避免读屏重复朗读
- 系统开启「减少动态效果」（prefers-reduced-motion）时滚动停止，内容静态展示第一屏

## 完成后请检查
- 滚动匀速、循环接缝处无跳动；两端有渐隐收边
- 悬停整条暂停、离开恢复；单个品牌名悬停变高亮色
- 改品牌数量后滚动线速度不变（不会内容越少滚越快）
