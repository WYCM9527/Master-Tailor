## 效果描述
纪录片质感的轮播：每张图在停留的整段时间里都被「镜头」缓缓推近，按推拉幅度匀速放大并轻微平移，奇偶帧的平移方向交替，避免每张都朝同一边。到点后旧图淡出、新图淡入接管，新图的推拉从头开始。画面永远在极缓慢地动，有种深呼吸般的电影感。按自动播放间隔自动切换，悬停暂停；底部有分页器和可选的左右箭头。

## 实现提示
- 纯 DOM + CSS：容器 `width: min(720px, 92vw)`、`aspect-ratio` 取容器宽高比（当前 {{ratio}}）、圆角 {{rounded}}、`overflow: hidden`，底色 #14151f 兜住图片未加载的空白，聚焦时 `box-shadow: 0 0 0 2px {{accent}}`；内部视口层 `position: absolute; inset: 0; touch-action: pan-y`，光标 grab / 拖动中 grabbing。
- 淡入淡出用三态类切换：每张幻灯片 `position: absolute; inset: 0; opacity: 0`，`transition: opacity {{duration}} ease`，`.is-active { opacity: 1; z-index: 1 }`，`.is-prev` 同样 opacity 0（三态都在原位，只变透明度）；切换时新卡先关过渡、按方向切 is-prev 并强制 reflow，再恢复过渡、旧卡去掉 is-active、新卡加上 is-active。幻灯片底色 `linear-gradient(135deg, #1a1c2c, #2a2f4a)` 占位，图片 `object-fit: cover` 铺满、禁选中与拖拽、`will-change: transform`。
- 推拉是 `.is-active img { animation: 推拉 keyframes {{kbtime}} linear forwards }`——类加上时动画自动从头播，无需 JS 控制；keyframes 从 `scale(1) translate(0, 0)` 匀速到 `scale({{zoom}}) translate(-1.6%, 1.2%)`，偶数张（`:nth-child(even)`）换一条反向平移的 keyframes `translate(1.6%, -1.2%)`。推拉时长要比自动播放间隔略长，图才会全程都在动。
- 字幕贴底铺满，`padding: 42px 20px 14px`，白色 18px / 600 字重 / 字距 0.02em，背景 `linear-gradient(transparent, rgba(0,0,0,0.62))`。箭头是 40px 圆形按钮，`background: rgba(10,10,15,0.55)`、白色 18px 的 ‹ ›，垂直居中、距左右 12px，悬停底色换 {{accent}}、文字 #111，过渡 0.15s。
- 分页器按参数选一种（当前 {{pager}}）。圆点：贴底 10px、间距 7px，8px 圆点 `rgba(255,255,255,0.4)`，当前项 {{accent}} 且 `scale(1.25)`，0.15s 过渡；数字：右下角 12px 处的胶囊，`padding: 3px 10px`，背景 `rgba(10,10,15,0.55)`，白色 12.5px 等宽字「当前 / 总数」；进度条：贴底 3px 高，底色 `rgba(255,255,255,0.18)`，填充 {{accent}}，宽度 = 当前序号 / 总数，宽度过渡同样用 {{duration}}。
- 自动播放用 `setInterval` 每 {{interval}} 切下一张（0 或 reduced-motion 不启动）；`prefers-reduced-motion` 下透明度过渡置 none、推拉动画直接禁用。

## 技术要求补充
- 支持鼠标拖拽和触摸滑动切换（用 Pointer Events 统一处理，滑动超过约 50px 判定翻页）
- 支持键盘操作：容器可聚焦，方向键切换上一张 / 下一张；聚焦或悬停时暂停自动播放
- 无障碍：容器带 role="region" 和 aria-roledescription="carousel"，每张幻灯片带 aria-label="第 N 张，共 M 张"
- 页面切到后台时暂停自动播放；系统开启「减少动态效果」时不自动播放、切换为瞬间完成

## 完成后请检查
- 每张图在整个停留期间持续缓慢放大（不是切换瞬间才动），切到下一张时新图从原大重新开始推
- 奇偶帧的平移方向不同；推拉幅度与时长符合参数
- 淡化切换柔和无闪烁；拖拽、键盘、悬停暂停正常
