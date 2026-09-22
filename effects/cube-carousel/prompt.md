## 效果描述
一张图铺满容器。切换时旧图沿自己的左棱向左后方转出，新图同时沿右棱从右后方转入，两个面一转一接，像在转动一个立方体。按自动播放间隔自动切换、首尾循环，悬停暂停；底部有分页器和可选的左右箭头。

## 实现提示
- 纯 DOM + CSS 3D 过渡：容器 `width: min(720px, 92vw)`、`aspect-ratio` 取容器宽高比参数（当前 {{ratio}}）、圆角 {{rounded}}、`overflow: hidden`，底色 #14151f，聚焦时 `box-shadow: 0 0 0 2px 强调色`；内部视口层 `position: absolute; inset: 0`，给视口设 `perspective: 1100px`（纵深感来自这里），`touch-action: pan-y`，光标 grab / 拖动中 grabbing。每张幻灯片铺满视口，图片 `object-fit: cover`，未加载时用 `linear-gradient(135deg, #1a1c2c, #2a2f4a)` 占位，`backface-visibility: hidden` 防止转动中露出背面。
- 折面动画：进入面 transform-origin 设为 left center 并从 `translateX(100%) rotateY(72deg)`、opacity 0 转到原位（`transform: none`、opacity 1、z-index 1）；离开面 transform-origin 设为 right center 转向 `translateX(-100%) rotateY(-72deg)`、opacity 0，配透明度渐变，就有立方体折面的效果。过渡 `transform {{duration}} cubic-bezier(0.45, 0, 0.25, 1)`（两头慢中间快），`opacity {{duration}} ease`；transform-origin 不在过渡列表里，换类时瞬时切换。
- 三态类切换：默认态 = 右侧待入位置（上面的进入起点）；`is-active` = 原位；`is-prev` = 左侧转出位置。切换时先把目标瞬时归位到进入侧（inline `transition: none` → 前进时去掉 / 后退时挂上 `is-prev` → 读一次 offsetWidth 强制 reflow → 还原 transition），再让当前图去掉 `is-active`（前进时挂 `is-prev` 向左转出，后退时回到默认态向右转出）、目标加 `is-active` 转入；两面同时动，棱线处基本贴合。
- 说明文字（有 caption 时）：贴底，`padding: 42px 20px 14px`，白字 18px / 600 字重 / 字距 0.02em，底衬 `linear-gradient(transparent, rgba(0,0,0,0.62))`。
- 箭头：40px 圆形按钮，距左右边 12px、垂直居中，底 `rgba(10,10,15,0.55)`、白色 ‹ ›（18px）；悬停底色变强调色、字色 #111，过渡 0.15s。
- 分页器（z-index 2）：圆点——底部 10px 居中、间距 7px、8px 白点 40% 透明，当前点为强调色并 `scale(1.25)`，过渡 0.15s；数字——右下角（右 12px、下 12px）胶囊，`padding: 3px 10px`、底 `rgba(10,10,15,0.55)`、12.5px 等宽字；进度条——贴底 3px 高、底 18% 白，填充为强调色、宽度 = (当前序号 + 1) / 总数，`width` 过渡时长与切换时长一致。
- 自动播放 `setInterval`，间隔 {{interval}}；悬停 / 聚焦 / 页面隐藏时清掉计时器，离开后重新开始。

## 技术要求补充
- 支持鼠标拖拽和触摸滑动切换（用 Pointer Events 统一处理，滑动超过约 50px 判定翻页）
- 支持键盘操作：容器可聚焦，方向键切换上一张 / 下一张；聚焦或悬停时暂停自动播放
- 无障碍：容器带 role="region" 和 aria-roledescription="carousel"，每张幻灯片带 aria-label="第 N 张，共 M 张"
- 页面切到后台时暂停自动播放；系统开启「减少动态效果」时不自动播放、切换为瞬间完成

## 完成后请检查
- 切换有明显的 3D 纵深（面是「转」进来的不是平移），转动过程中两面在棱线处基本贴合
- 翻转不露穿帮：看不到背面文字镜像（backface-visibility: hidden）
- 自动播放、拖拽、键盘、分页器行为正常
