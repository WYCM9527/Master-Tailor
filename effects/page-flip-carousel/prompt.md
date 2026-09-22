## 效果描述
一本可以翻的「杂志」，左侧有一条装订书脊的阴影。翻页时当前页以书脊为轴立体地翻起、掀向左后方，翻起过程中页面上滑过一道弯折的光影，纸感十足，下一页就躺在下面；往回翻则是已翻走的页从左后方翻回来盖上。按自动翻页间隔自动翻页，翻到底自动合上重来；底部强调色数字角标显示页码。

## 实现提示
每页 transform-origin: left center，翻走态 rotateY(-150deg)，容器 perspective；光影用页面伪元素的渐变随翻页淡入；z-index 按「未翻的按顺序、已翻的反序在上」排。
- 结构：书本容器 `position: relative; width: min(380px, 78vw)`，宽高比 {{ratio}}，`perspective: 1400px`，`touch-action: pan-y`，光标 grab / grabbing，聚焦时 2px 强调色（{{accent}}）outline、偏移 6px。书脊是容器 `::before`：`left: -2px; top: 2%; bottom: 2%; width: 10px`，圆角 `6px 0 0 6px`，背景 `linear-gradient(90deg, rgba(0,0,0,0.6), transparent)`，`z-index: 5`、不响应指针。
- 页面：全部 `position: absolute; inset: 0` 叠在一起，圆角 {{rounded}}，`overflow: hidden`，兜底底图 `linear-gradient(135deg, #1a1c2c, #2a2f4a)`，`transform-origin: left center`，`backface-visibility: hidden`（翻过 90° 后自然看不见），投影 `6px 10px 30px rgba(0,0,0,0.4)`，`transition: transform {{duration}} cubic-bezier(0.45, 0.05, 0.35, 1)`；翻走态 `.is-prev { rotateY(-150deg) }`；图片 `object-fit: cover`。
- 光影：页面 `::after` 铺满，`linear-gradient(100deg, rgba(0,0,0,0.35), transparent 46%)`，默认 `opacity: 0`、翻走态 1，`transition: opacity` 取翻页时长的一半（`calc({{duration}} × 0.5)`）ease。
- 层级：`off = (i − 当前序号 + 总数) % 总数`，`z-index = 总数 − off`，带 `.is-prev` 的再加总数（翻走的页压在未翻页之上，翻得越早越靠上）；非当前页 `aria-hidden`。
- 翻页：下一页 = 当前页加 `.is-prev`、序号 +1，序号回到 0 时把所有页的 `.is-prev` 一起去掉（合上书重来）；上一页 = 序号 −1 并去掉该页的 `.is-prev`（从左后方翻回盖上）；每次重算 z-index。
- 标题条贴底：`padding: 40px 16px 12px`，白字 16px / 600，背景 `linear-gradient(transparent, rgba(0,0,0,0.62))`。
- 页码角标：容器正下方 34px（`bottom: -34px`）居中的胶囊，`padding: 3px 12px`，底 `rgba(10,10,15,0.6)`，字色 {{accent}}，12.5px 等宽「当前 / 总数」。
- 自动翻页 `setInterval` 每 {{interval}}（0、单页或减少动态时不启动）；拖拽位移超过 50px 判定（左滑下一页、右滑翻回）。

## 技术要求补充
- 支持鼠标拖拽和触摸滑动切换（用 Pointer Events 统一处理，左滑翻页、右滑翻回）
- 支持键盘操作：容器可聚焦，← / → 切换；聚焦或悬停时暂停自动播放
- 无障碍：容器带 role="region" 和 aria-roledescription="carousel"，每张带 aria-label="第 N 张，共 M 张"
- 页面切到后台时暂停自动播放；系统开启「减少动态效果」时不自动播放、切换为瞬间完成

## 完成后请检查
- 页面绕左侧书脊翻起、有纵深和光影；翻走的页不遮挡新页内容
- 往回翻是翻回来的动作；翻完一轮自动回到第一页
- 自动翻页、拖拽、键盘、页码正常
