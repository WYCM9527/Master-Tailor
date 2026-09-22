## 效果描述
一条单行公告滚动栏：左侧一枚强调色底的前缀标签，右侧视口只有一行高，轮流展示条目。按自动滚动间隔当前条向上滑出、下一条从下方滑入，循环不停；过长的条目用省略号截断。鼠标悬停暂停，在条目上往上或往下拖一小段也能手动切换。

## 实现提示
- 结构：外框 `display: flex; width: min(640px, 92vw)`，圆角 10px、`overflow: hidden`、底色 #14151f、`border: 1px solid rgba(255,255,255,0.08)`。前缀标签 `flex: none`、grid 居中、`padding: 0 14px`，底色 {{accent}}、文字 #111111、12.5px / 700、`letter-spacing: 0.1em`，内容 {{label}}。
- 视口 `position: relative; flex: 1; height: 44px; overflow: hidden`，只有一行高。条目绝对定位 `inset: 0`、`display: flex; align-items: center; padding: 0 16px`，字号 {{fontSize}}、颜色 {{color}}，`white-space: nowrap; overflow: hidden; text-overflow: ellipsis`。
- 三态类竖向滑动：默认态 `translateY(100%)`（下方待命），`.is-active` 为 `transform: none`，`.is-prev` 为 `translateY(-100%)`；只过渡 transform，时长 {{duration}}、曲线 `cubic-bezier(0.33, 1, 0.68, 1)`。
- goTo(next, dir)：目标条先 `transition: none`，dir < 0 时挂 is-prev 放到上方，读 `offsetWidth` 强制 reflow 后恢复过渡；当前条摘 is-active（dir > 0 时挂 is-prev 向上滑出）；目标条摘 is-prev、挂 is-active。方向由 dir 决定，末条回首条仍向上滚。
- 条目 {{items}} 按「｜」拆分、trim、过滤空串；自动滚动间隔 {{interval}}，为 0 不启动；拖动只监听视口、读 clientY，上滑下一条。

## 技术要求补充
- 支持鼠标拖拽和触摸滑动切换（用 Pointer Events 统一处理，竖向滑动超过约 24px 判定切换）
- 支持键盘操作：容器可聚焦，↑ / ↓ 切换；聚焦或悬停时暂停自动播放
- 无障碍：容器带 role="region" 和 aria-roledescription="carousel"，每张带 aria-label="第 N 张，共 M 张"
- 页面切到后台时暂停自动播放；系统开启「减少动态效果」时不自动播放、切换为瞬间完成

## 完成后请检查
- 条目向上滚动轮换、节奏与参数一致；从最后一条回第一条方向不变
- 悬停暂停；↑↓ 键与竖向拖动都能切换
- 条目过长时省略号截断、不换行不撑破一行高度
