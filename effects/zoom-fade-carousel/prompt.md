## 效果描述
一张图铺满容器。切换时新图以放大的状态淡入并缩回原大，旧图同时缩小并淡出——一进一退像镜头轻轻推拉了一下，缩放幅度决定推拉的力度。按自动播放间隔自动切换、首尾循环，悬停暂停；底部有分页器和可选的左右箭头。

## 实现提示
- 三态类：进入态 `opacity: 0; transform: scale(1 + 幅度)` → 当前态 `opacity: 1; transform: none; z-index: 1` → 离开态 `opacity: 0; transform: scale(1 − 幅度)`，幅度取 {{zoom}}（CSS 里写 `calc(1 ± var(--幅度))`）；transform 与 opacity 同时长过渡，时长 {{duration}}，opacity 用 ease、transform 用 `cubic-bezier(0.33, 1, 0.68, 1)`。
- 结构：容器宽 `min(720px, 92vw)`，宽高比 {{ratio}}，圆角 {{rounded}}，`overflow: hidden`、底色 #14151f；视口层绝对铺满、`touch-action: pan-y`。占位图 `object-fit: cover`，兜底背景 `linear-gradient(135deg, #1a1c2c, #2a2f4a)`；标题条 `padding: 42px 20px 14px`、白字 18px / 600、背景 `linear-gradient(transparent, rgba(0,0,0,0.62))`。
- goTo(next, dir)：目标卡先 `transition: none`，dir < 0 时挂 is-prev（从缩小态进），读 `offsetWidth` 强制 reflow 后恢复过渡；当前卡摘 is-active（dir > 0 时挂 is-prev 缩小淡出，否则回到放大态淡出）；目标卡摘 is-prev、挂 is-active。新卡在上层且始终 ≥ 原大，盖住旧卡缩小露出的边缘。
- 箭头（「显示左右箭头」当前 {{arrows}}）：40×40 圆形，垂直居中、左右贴边 12px，底 `rgba(10,10,15,0.55)`、白色 18px「‹」「›」，悬停底色换 {{accent}}、字色 #111111。
- 分页器（当前 {{pager}}）：圆点贴底 10px、`gap: 7px`、8px 圆 `rgba(255,255,255,0.4)`，当前点换 {{accent}} 并 `scale(1.25)`；数字为右下 12px 处的胶囊（`padding: 3px 10px`、底 `rgba(10,10,15,0.55)`、12.5px 等宽）显示「N / M」；进度条贴底 3px、底 `rgba(255,255,255,0.18)`、填充 {{accent}}、宽 (index+1)/total。自动播放间隔 {{interval}}，为 0 不启动。

## 技术要求补充
- 支持鼠标拖拽和触摸滑动切换（用 Pointer Events 统一处理，滑动超过约 50px 判定翻页）
- 支持键盘操作：容器可聚焦，方向键切换上一张 / 下一张；聚焦或悬停时暂停自动播放
- 无障碍：容器带 role="region" 和 aria-roledescription="carousel"，每张幻灯片带 aria-label="第 N 张，共 M 张"
- 页面切到后台时暂停自动播放；系统开启「减少动态效果」时不自动播放、切换为瞬间完成

## 完成后请检查
- 新图从放大状态平滑缩回、旧图缩小淡出，两个方向的缩放幅度与参数一致
- 缩放过程中图片不露出容器边缘的底色（图始终铺满容器）
- 自动播放、拖拽、键盘、分页器行为正常
