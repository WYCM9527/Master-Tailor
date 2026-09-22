## 效果描述
两排品牌名跑马灯：上排从右向左滚、下排从左向右滚，两排交错穿行像双向车流。内容首尾相接无限循环、接缝不可见，容器两端渐隐收边。鼠标悬停两排一起暂停，掠过的品牌名亮起为悬停高亮色。

## 实现提示
- 纯 DOM + CSS 动画。外层容器 `width: min(820px, 96vw)`，纵向 flex、两排间距 18px、`overflow: hidden`，用 `mask-image: linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent)` 做两端各 12% 的渐隐收边。
- 每排一条轨道 `display: flex; width: max-content`，里面放两份完全相同的品牌组；品牌组是 flex 行，间距用 {{gap}}，`padding-right` 也取 {{gap}}，这样两份内容的接缝正好也是一个间距，循环看不出缝。关键帧只有一帧 `to { transform: translateX(-50%) }`，`linear infinite`——位移正好一份内容宽度时回到起点。
- 第二排复用同一个动画，只加 `animation-direction: reverse`，并把品牌顺序倒过来生成，两排交错时更错落。
- 时长按内容宽度换算，保证不同品牌数下两排线速度一致：布局完成后（下一帧）读每条轨道的 `scrollWidth`，`一圈秒数 = scrollWidth / 2 / ({{speed}} × 4)`，即线速度 {{speed}} × 4 px/s，写回该轨道的 `animation-duration`（换算前兜底 20s）。
- 品牌名：字号 {{fontSize}}，`font-weight: 700; letter-spacing: 0.06em; white-space: nowrap`，颜色 {{color}} 且默认 `opacity: 0.85`（微降饱和的灰 logo 墙质感）；悬停变 {{hoverColor}}、opacity 回到 1，`transition: color 0.15s ease`。
- 悬停暂停挂在整个容器上（容器 `:hover` 时所有轨道 `animation-play-state: paused`），两排一起停。品牌列表按「｜」拆分、去掉空白项。

## 技术要求补充
- 本效果是纯展示型跑马灯：不需要 keydown 键盘切换、也不需要 pointerdown 拖拽（这两类交互不适用），唯一交互是悬停暂停
- 无障碍：容器带 role="region" 和 aria-roledescription="carousel"；除第一排第一份内容外全部 aria-hidden，避免读屏重复朗读
- 系统开启「减少动态效果」（prefers-reduced-motion）时两排都停止滚动、静态展示

## 完成后请检查
- 两排方向相反、速度一致；循环接缝处无跳动，两端渐隐
- 悬停两排同时暂停；单个品牌名悬停高亮
- 改品牌数量后两排线速度仍一致
