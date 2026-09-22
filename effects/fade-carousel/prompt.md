## 效果描述
一张图铺满容器，有标题的图片底部压一条深色渐变标题条。切换时没有任何位移：旧图原地淡出、新图原地淡入，两张图在半透明中短暂交叠，像呼吸一样柔和。按自动播放间隔自动切换、任意两张之间都能无缝循环，悬停暂停；底部有分页器和可选的左右箭头。

## 实现提示
- 纯 DOM：容器 `position: relative; width: min(720px, 92vw)`，宽高比 {{ratio}}，圆角 {{rounded}}，`overflow: hidden`，底色 #14151f；键盘聚焦时 `box-shadow: 0 0 0 2px {{accent}}` 当焦点环。里面一个铺满的视口层（`touch-action: pan-y`、光标 grab）装全部幻灯片。
- 每张幻灯片 `position: absolute; inset: 0`，只靠透明度切换：默认 `opacity: 0`，当前张 `.is-active { opacity: 1; z-index: 1 }`，`transition: opacity {{duration}} ease`。每张自带 `linear-gradient(135deg, #1a1c2c, #2a2f4a)` 兜底背景，图片 `object-fit: cover` 铺满、禁用原生拖拽，交叠期间不会闪出底色。
- 切换 = 同一帧里旧图去掉 `.is-active`、新图加上，两者的透明度过渡同时进行（新图在上层淡入、旧图在下层淡出），没有任何位移；索引 `(next + total) % total` 取模，任意两张之间直接循环。
- 标题条贴底：`padding: 42px 20px 14px`，白字 18px / 600 字重 / `letter-spacing: 0.02em`，背景 `linear-gradient(transparent, rgba(0,0,0,0.62))`；没标题的图不渲染它。
- 左右箭头（{{arrows}}）：40px 圆形按钮，垂直居中、离左右边 12px，背景 `rgba(10,10,15,0.55)`、白色 18px 的 ‹ ›；悬停背景变 {{accent}}、字色 #111，过渡 0.15s。
- 分页器按参数选一种（当前：{{pager}}）。圆点：贴底 10px、间距 7px，8px 圆点 `rgba(255,255,255,0.4)`，当前项 {{accent}} 且 `scale(1.25)`，0.15s 过渡；数字：右下角 12px 处的胶囊，`padding: 3px 10px`，背景 `rgba(10,10,15,0.55)`，白色 12.5px 等宽字「当前 / 总数」；进度条：贴底 3px 高，底色 `rgba(255,255,255,0.18)`，填充 {{accent}}，宽度 = 当前序号 / 总数，宽度过渡同样用 {{duration}}。
- 自动播放：`setInterval` 每 {{interval}} 切下一张（为 0 不启动）；悬停、聚焦、页面隐藏时清掉计时器，离开 / 失焦 / 回到前台再重建。

## 技术要求补充
- 支持鼠标拖拽和触摸滑动切换（用 Pointer Events 统一处理，滑动超过约 50px 判定翻页）
- 支持键盘操作：容器可聚焦，方向键切换上一张 / 下一张；聚焦或悬停时暂停自动播放
- 无障碍：容器带 role="region" 和 aria-roledescription="carousel"，每张幻灯片带 aria-label="第 N 张，共 M 张"
- 页面切到后台时暂停自动播放；系统开启「减少动态效果」时不自动播放、切换为瞬间完成

## 完成后请检查
- 切换是纯淡入淡出，没有滑动位移；交叠过程中不露出底色或闪白
- 自动播放间隔与淡化时长符合参数；悬停时自动播放暂停
- 拖拽、键盘左右键、分页器点击都能切换
