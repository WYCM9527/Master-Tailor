## 效果描述
一张图铺满容器。切换时新图从下方滑入、旧图向上方滑出，先快后慢，首尾无缝循环，像竖向翻页。按自动播放间隔自动切换，悬停暂停；上下两端各有一个箭头按钮（可选显示），底部有分页器，上下拖拽也能切换。

## 实现提示
- 结构：容器宽 `min(720px, 92vw)`，宽高比 {{ratio}}，圆角 {{rounded}}，`overflow: hidden`、底色 #14151f；视口层绝对铺满、`touch-action: pan-x`（竖向手势留给轮播）。占位图 `object-fit: cover`，兜底背景 `linear-gradient(135deg, #1a1c2c, #2a2f4a)`；标题条 `padding: 42px 20px 14px`、白字 18px / 600、背景 `linear-gradient(transparent, rgba(0,0,0,0.62))`。
- 三态类：默认态在下方待命 `translateY(100%)`，`.is-active` 为 `transform: none; z-index: 1`，`.is-prev` 在上方 `translateY(-100%)`；只过渡 transform，时长 {{duration}}、曲线 `cubic-bezier(0.33, 1, 0.68, 1)`（先快后慢）。
- goTo(next, dir)：目标卡先 `transition: none`，dir < 0 时挂 is-prev 放到上方，读 `offsetWidth` 强制 reflow 后恢复过渡；当前卡摘 is-active（dir > 0 时挂 is-prev 向上滑出），目标卡摘 is-prev、挂 is-active。方向由 dir 而非索引决定，末张回首张也同向。拖拽读 clientY，上滑下一张。
- 箭头（「显示左右箭头」当前 {{arrows}}）：40×40 圆形，底 `rgba(10,10,15,0.55)`、白色 18px「‹」「›」，悬停底色换 {{accent}}、字色 #111111；两枚水平居中并 `rotate(90deg)` 变上下箭头，上一张贴顶 16px、下一张贴底 46px。
- 分页器（当前 {{pager}}）：圆点贴底 10px、`gap: 7px`、8px 圆 `rgba(255,255,255,0.4)`，当前点换 {{accent}} 并 `scale(1.25)`；数字为右下 12px 处的胶囊（`padding: 3px 10px`、底 `rgba(10,10,15,0.55)`、12.5px 等宽）显示「N / M」；进度条贴底 3px、底 `rgba(255,255,255,0.18)`、填充 {{accent}}、宽 (index+1)/total。自动播放间隔 {{interval}}，为 0 不启动。

## 技术要求补充
- 支持鼠标拖拽和触摸滑动切换（用 Pointer Events 统一处理，滑动超过约 50px 判定翻页）
- 支持键盘操作：容器可聚焦，方向键切换上一张 / 下一张；聚焦或悬停时暂停自动播放
- 无障碍：容器带 role="region" 和 aria-roledescription="carousel"，每张幻灯片带 aria-label="第 N 张，共 M 张"
- 页面切到后台时暂停自动播放；系统开启「减少动态效果」时不自动播放、切换为瞬间完成

## 完成后请检查
- 切换方向是竖向（下进上出），从最后一张回第一张也是同方向滑动
- 上下拖拽能翻页且不影响页面本身的横向滚动；↑↓ 键可用
- 自动播放、悬停暂停、分页器行为正常
