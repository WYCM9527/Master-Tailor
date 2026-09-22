## 效果描述
图片轮播，切换时容器照常整幅平移，但里面分了「前后景」：图片朝滑动的反方向让出视差幅度，于是它移动得比容器慢、像远处的背景；标题条反而带一点超前位移再归位，像贴在近处的前景——一慢一快，滑动瞬间画面就有了纵深。按自动播放间隔自动切换、首尾循环，悬停暂停；底部有分页器和可选的左右箭头。

## 实现提示
容器 translateX(±100%) 三态过渡；图片在非活动态加 `translateX(∓视差幅度)`、活动态归零，与容器同时长过渡即可产生速度差；标题用更小的反向位移加透明度。
- 结构：居中容器 `width: min(720px, 92vw)`，宽高比 {{ratio}}，圆角 {{rounded}}，`overflow: hidden`，底色 #14151f，聚焦时 `box-shadow: 0 0 0 2px {{accent}}`；铺满的视口层装全部幻灯片（`touch-action: pan-y`，光标 grab / grabbing）。
- 三态：幻灯片 `position: absolute; inset: 0`，默认（右侧待命）`translateX(100%)`，`.is-active { transform: none; z-index: 1 }`，`.is-prev { translateX(-100%) }`；`transition: transform {{duration}} cubic-bezier(0.33, 1, 0.68, 1)`，`will-change: transform`，兜底底图 `linear-gradient(135deg, #1a1c2c, #2a2f4a)`。
- 视差层：图片绝对定位铺满、`object-fit: cover`，transform 过渡与容器同时长同曲线；待命态 `translateX(−{{shift}})`、活动态 `none`、已过态 `translateX({{shift}})`（百分比相对图片自身宽度）。标题条待命态 `opacity: 0; translateX(24%)`，活动态 `opacity: 1; transform: none`，已过态 `opacity: 0; translateX(-24%)`；过渡 `transform {{duration}} cubic-bezier(0.22, 1, 0.36, 1), opacity {{duration}} ease` 只声明在活动态上——标题入场从右侧 24% 滑入淡入，离场直接消失。
- 切换：新卡先 `transition: none` 放到进入侧（下一张在右侧默认态、上一张加 `.is-prev`），读一次 `offsetWidth` 强制 reflow 再清掉；同一帧旧卡去 `.is-active`、往前时加 `.is-prev`（往回时去掉），新卡去 `.is-prev` 加 `.is-active`；序号 `(next + total) % total` 循环。
- 标题条贴底：`padding: 42px 20px 14px`，白字 18px / 600 / `letter-spacing: 0.02em`，背景 `linear-gradient(transparent, rgba(0,0,0,0.62))`。
- 箭头（{{arrows}}）：40px 圆按钮，距左右 12px 垂直居中，底 `rgba(10,10,15,0.55)`、白色 18px ‹ ›，悬停底 {{accent}}、字 #111，0.15s。
- 分页器（{{pager}}）：圆点贴底 10px、间距 7px，8px 圆点 40% 白，当前项 {{accent}} + `scale(1.25)`，0.15s；数字为右下角 12px 处胶囊（`padding: 3px 10px`，底 `rgba(10,10,15,0.55)`，白色 12.5px 等宽「N / M」）；进度条贴底 3px，轨道 18% 白、填充 {{accent}}，宽 = (序号 + 1) / 总数，宽度过渡 {{duration}} ease。
- 自动播放 `setInterval` 每 {{interval}} 切下一张（0、单张或减少动态时不启动）。

## 技术要求补充
- 支持鼠标拖拽和触摸滑动切换（用 Pointer Events 统一处理，滑动超过约 50px 判定翻页）
- 支持键盘操作：容器可聚焦，← / → 切换；聚焦或悬停时暂停自动播放
- 无障碍：容器带 role="region" 和 aria-roledescription="carousel"，每张带 aria-label="第 N 张，共 M 张"
- 页面切到后台时暂停自动播放；系统开启「减少动态效果」时不自动播放、切换为瞬间完成

## 完成后请检查
- 滑动时能明显看出图片比容器「走得慢」、标题「走得快」，三层速度不同
- 静止时图片完整居中无裁切错位；视差幅度随参数变化
- 无缝循环、自动播放、拖拽、键盘、分页器正常
