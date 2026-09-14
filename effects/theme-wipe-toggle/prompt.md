## 效果描述

一个带标题、说明和三张小卡片的页面，右上角是一颗圆形的日 / 月按钮。点它切换深浅色主题时，新的配色不是整页一闪就换掉，而是从按钮所在的那一点长出一个圆，半秒内扩大到盖住整个页面——圆内已经是新主题，圆外还是旧主题，边界清晰地扫过去。扩散形状可换成菱形、方形或五角星，也可改为从屏幕中心扩散。扩散时长、浅色底色、强调色都可调。

## 实现提示

主题用 CSS 变量：在 `html` 上定义深色变量，`html.light` 覆盖为浅色，切换类即整页换色。扩散用 View Transitions API：`document.startViewTransition(() => html.classList.toggle('light'))`；在 CSS 里把 `::view-transition-old(root)` 和 `::view-transition-new(root)` 的默认动画关掉（`animation: none; mix-blend-mode: normal`），新快照 z-index 更高；`transition.ready` 之后用 `document.documentElement.animate({ clipPath: [起始, 结束] }, { duration, easing, pseudoElement: '::view-transition-new(root)' })`。起始是收缩到按钮中心的形状（`circle(0% at x y)` 或所有顶点重合的 polygon），结束是能盖住全屏的同形状，半径取按钮中心到最远角的距离；坐标写成视口百分比，避免高倍屏下 px 值偏移。不支持该 API 时回退：铺一层新主题底色的全屏遮罩做同样的 clip-path 动画，扩满后再真正切换类并移除遮罩。

## 完成后请检查

- 扩散边界内外分别是新旧主题，边界干净无交叉淡化
- 起点在按钮中心（或屏幕中心），扩到最远角时正好铺满
- 扩散中连点无效；系统开启「减少动态效果」时直接切换
