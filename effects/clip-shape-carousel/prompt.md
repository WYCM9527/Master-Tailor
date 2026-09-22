## 效果描述
一张图铺满容器。切换时新图不是滑进来，而是从揭示圆心位置的一个小圆点开始，以圆形越撑越大，像一滴墨在水里晕开，直到盖满整个容器；旧图留在下层等着被盖住，全程没有位移。按自动播放间隔自动切换、首尾循环，悬停暂停；底部有分页器和可选的左右箭头。

## 实现提示
- 纯 DOM + CSS 过渡：容器 `width: min(720px, 92vw)`、`aspect-ratio` 取容器宽高比参数（当前 {{ratio}}）、圆角 {{rounded}}、`overflow: hidden`，底色 #14151f，聚焦时 `box-shadow: 0 0 0 2px 强调色`；内部一个 `position: absolute; inset: 0` 的视口层（`touch-action: pan-y`，光标 grab / 拖动中 grabbing），每张幻灯片是铺满视口的绝对定位层，图片 `object-fit: cover`，未加载时用 `linear-gradient(135deg, #1a1c2c, #2a2f4a)` 占位。
- 揭示动画：新图 `clip-path: circle(0% at X 50%)` 过渡到 `circle(142% at X 50%)`（142% 能保证圆完整盖住任何宽高比的容器），X 是「揭示圆心位置」对应的百分比（居中 50%、左侧 0%、右侧 100%；当前 {{originX}}）；过渡 `clip-path {{duration}} cubic-bezier(0.33, 1, 0.68, 1)`（缓出，前快后慢）。旧图不做动画，z-index 压在下面即可。
- 三态类：默认态 = 圆半径 0%（不可见）；`is-active` = 满圆、z-index 1；`is-prev` = 满圆、z-index 0、`transition: none`。切换与方向无关（前进后退都是新图晕开）：先把除当前图外的所有卡瞬时归位到默认态（inline `transition: none` → 去掉 `is-prev` / `is-active` → 读一次 offsetWidth 强制 reflow → 还原 transition），再让当前图换成 `is-prev`（满圆垫底、无过渡）、目标加 `is-active` 从圆点撑开。归位所有卡是为了三张以上循环时，底层露出的一定是刚才那张而不是更早留下的满圆卡。
- 说明文字（有 caption 时）：贴底，`padding: 42px 20px 14px`，白字 18px / 600 字重 / 字距 0.02em，底衬 `linear-gradient(transparent, rgba(0,0,0,0.62))`。
- 箭头：40px 圆形按钮，距左右边 12px、垂直居中，底 `rgba(10,10,15,0.55)`、白色 ‹ ›（18px）；悬停底色变强调色、字色 #111，过渡 0.15s。
- 分页器（z-index 2）：圆点样式——底部 10px 居中、间距 7px、8px 白点 40% 透明，当前点为强调色并 `scale(1.25)`，过渡 0.15s；数字样式——右下角（右 12px、下 12px）胶囊，`padding: 3px 10px`、底 `rgba(10,10,15,0.55)`、12.5px 等宽字；进度条样式——贴底 3px 高、底 18% 白，填充为强调色、宽度 = (当前序号 + 1) / 总数，`width` 过渡时长与揭示时长一致。
- 自动播放 `setInterval`，间隔 {{interval}}；悬停 / 聚焦 / 页面隐藏时清掉计时器，离开后重新开始。

## 技术要求补充
- 支持鼠标拖拽和触摸滑动切换（用 Pointer Events 统一处理，滑动超过约 50px 判定翻页）
- 支持键盘操作：容器可聚焦，← / → 切换；聚焦或悬停时暂停自动播放
- 无障碍：容器带 role="region" 和 aria-roledescription="carousel"，每张带 aria-label="第 N 张，共 M 张"
- 页面切到后台时暂停自动播放；系统开启「减少动态效果」时不自动播放、切换为瞬间完成

## 完成后请检查
- 新图从设定位置的圆点均匀撑开、边缘是干净的圆弧；旧图静止在底层被盖住
- 揭示时长与圆心位置符合参数；连续切换节奏稳定
- 自动播放、拖拽、键盘、分页器正常
