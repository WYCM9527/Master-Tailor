## 效果描述
通栏大图轮播，图片水平滑动切换、首尾无缝循环。关键在「错峰进场」：图先滑到位，随后这一帧的大标题（左下角，粗体大字压在从透明到深色的渐变上）晚半拍淡入上移，紧接着强调色的按钮再晚一点进场——三层节奏让每次切换都像一次小型开场。按自动播放间隔自动切换，悬停暂停；底部有分页器和可选的左右箭头。

## 实现提示
不用长轨道，用「三态类切换」：幻灯片都绝对定位铺满容器，默认态在右侧待命 `translateX(100%)`，`is-active` 态 `transform: none; z-index: 1`，`is-prev` 态在左侧 `translateX(-100%)`；每次只动相邻两张，首尾循环天然无缝。文字层的错峰不是 transition-delay，而是挂在 `is-active` 上的入场动画——类一加上就自动重播，标题延迟约切换时长的一半，按钮再加 0.15s。
- 容器 `width: min(920px, 94vw)`、`aspect-ratio` 取 {{ratio}}、圆角 {{rounded}}、`overflow: hidden`，底色 #14151f 兜住图片未加载的空白，聚焦时 `box-shadow: 0 0 0 2px 强调色`；内部视口层 `position: absolute; inset: 0; touch-action: pan-y`，光标 grab / 拖动中 grabbing。幻灯片 `transition: transform 切换时长 cubic-bezier(0.33, 1, 0.68, 1)`，切换时长取 {{duration}}，未加载时用 `linear-gradient(135deg, #1a1c2c, #2a2f4a)` 占位；图片 `object-fit: cover`、禁选中与拖拽，首张 eager、其余 lazy。
- 切换：目标张先内联 `transition: none`，后退时挂 `is-prev`（从左进）、前进时去掉，读一次 `offsetWidth` 强制 reflow 后还原过渡；再让当前张去掉 `is-active`（前进时挂 `is-prev` 向左退、后退时回右侧默认态），目标张去掉 `is-prev`、加 `is-active`。
- 文字层贴底撑满：`padding: 90px 36px 30px`，白字、系统无衬线字体，底衬 `linear-gradient(transparent, rgba(0,0,0,0.66))`；标题 `font-size: clamp(22px, 4vw, 38px)`、800 字重、字距 0.03em、行高 1.25、`text-shadow: 0 2px 14px rgba(0,0,0,0.4)`。按钮（文字 {{ctaText}}，留空则不渲染）是 `inline-block` 胶囊：`margin-top: 14px; padding: 9px 22px; border-radius: 999px`，底色 {{accent}}、字色 #111、14px / 600 字重。
- 错峰入场：`.is-active .title` 与 `.is-active .mt-cta` 跑同一条关键帧 `from { opacity: 0; transform: translateY(22px) } to { opacity: 1; transform: none }`，0.6s、`cubic-bezier(0.22, 1, 0.36, 1)`、`animation-fill-mode: both`（延迟期间停在起点、不可见）；标题 `animation-delay: calc(切换时长 × 0.55)`，按钮再 `+ 0.15s`。非当前帧不带动画，跟着整张滑出视口即可；`prefers-reduced-motion` 下两者 `animation: none`、幻灯片 `transition: none`。
- 箭头（显示：{{arrows}}）：40px 圆形按钮，垂直居中、距左右边 12px，底 `rgba(10,10,15,0.55)`、白色 ‹ ›（18px）；悬停底色换成强调色、字色 #111，过渡 0.15s。
- 分页器（当前 {{pager}}，z-index 2）：进度条——贴底 3px 高，轨道 `rgba(255,255,255,0.18)`，填充强调色，宽 = (当前序号 + 1) ÷ 总数，`width` 过渡与切换时长一致；圆点——居中距底 10px、间距 7px，8px 圆点 `rgba(255,255,255,0.4)`，当前点换强调色并 `scale(1.25)`，过渡 0.15s；数字——右下角距边 12px 的胶囊，`padding: 3px 10px`，底同箭头，白色 12.5px 等宽字「当前 / 总数」。
- 自动播放 `setInterval`，间隔 {{interval}}（为 0 或只有一张时不启动）；悬停 / 聚焦 / 页面隐藏时清掉计时器，离开后重新开始。

## 技术要求补充
- 支持鼠标拖拽和触摸滑动切换（用 Pointer Events 统一处理，滑动超过约 50px 判定翻页）
- 支持键盘操作：容器可聚焦，方向键切换上一张 / 下一张；聚焦或悬停时暂停自动播放
- 无障碍：容器带 role="region" 和 aria-roledescription="carousel"，每张幻灯片带 aria-label="第 N 张，共 M 张"
- 页面切到后台时暂停自动播放；系统开启「减少动态效果」时不自动播放、切换为瞬间完成

## 完成后请检查
- 每次切换先见图、再见标题、后见按钮，三者延迟依次递增；重复切换每次都会重播这个节奏
- 标题在渐变底上清晰可读；按钮是强调色胶囊、可点击
- 无缝循环、拖拽、键盘、悬停暂停正常；「减少动态效果」时文字直接显示不做进场
