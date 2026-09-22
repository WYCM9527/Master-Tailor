## 效果描述
一面两行多列的图片墙，每格底部一条小标题。放不下的图片自动排到第二页、第三页……切换时整页横向滑动，到最后一页再翻就回卷到第一页。按自动翻页间隔自动翻页，悬停暂停；底部每页一个强调色圆点。

## 实现提示
每页是一个 grid（2 行 × 每页列数），所有页排进横向轨道，翻页即平移轨道 translateX(-页码 × 100%)；张数变化时按列数重新分页。

- 结构：根容器 `width: min(720px, 92vw)`、页面 grid 居中；视口 `overflow: hidden; touch-action: pan-y; cursor: grab`（拖动中 `grabbing`）；轨道 `display: flex`，每页 `flex: none; width: 100%`；根容器聚焦时 `outline: 2px solid {{accent}}; outline-offset: 4px`。
- 分页：每页 2 × {{cols}} 格，页数 = ceil(张数 ÷ 每页格数)；页内 `grid-template-columns: repeat({{cols}}, 1fr); grid-template-rows: repeat(2, 1fr); gap: {{gap}}; padding: 2px`，末页不满时格子从左上排起；页码按页数取模回卷，不克隆首尾页。
- 格子 `<figure>`：`aspect-ratio: 4 / 3; border-radius: {{rounded}}; overflow: hidden`，加载前底色 `linear-gradient(135deg, #1a1c2c, #2a2f4a)`；图片 `object-fit: cover`、`loading="lazy"`、`user-select: none; -webkit-user-drag: none`（防拖拽时拖出图片）。
- 小标题贴底：`padding: 24px 10px 8px`，白字 `12.5px / 600`，底衬 `linear-gradient(transparent, rgba(0,0,0,0.62))`，单行省略。
- 轨道 `transition: transform`，时长取翻页时长 {{duration}}，缓动 `cubic-bezier(0.33, 1, 0.68, 1)`（先快后缓），`will-change: transform`。
- 圆点：`margin-top: 14px`、`gap: 7px` 居中，8px 圆形按钮，底色 `rgba(255,255,255,0.35)`；当前页染 {{accent}} 并 `scale(1.25)`，`transition 0.15s`。
- 自动翻页 `setInterval`，周期 = 自动翻页间隔 {{interval}}；间隔为 0 或只有一页时不启动。

## 技术要求补充
- 支持鼠标拖拽和触摸滑动切换（用 Pointer Events 统一处理，滑动超过约 50px 判定翻页）
- 支持键盘操作：容器可聚焦，← / → 切换；聚焦或悬停时暂停自动播放
- 无障碍：容器带 role="region" 和 aria-roledescription="carousel"，每页带 aria-label="第 N 页，共 M 页"
- 页面切到后台时暂停自动播放；系统开启「减少动态效果」时不自动播放、切换为瞬间完成

## 完成后请检查
- 网格行列数与参数一致，最后一页不满时格子靠左上排、不变形
- 整页滑动干脆、圆点对应页数；自动翻页与悬停暂停正常
- 拖拽和键盘都能翻页
