## 效果描述
当前封面在正中央、正面朝向观众；两侧的封面各自朝中心倾斜、向后退、水平散开，离中心越远越暗，层层叠出唱片架般的纵深。切换时所有封面一起平滑滑到新位置，首尾相接环形循环；点击两侧的封面可以直接跳到它。按自动播放间隔自动轮到下一张，悬停暂停；封面顶部有一道浅浅的高光，底部一排分页圆点。

## 实现提示
- 纯 DOM + CSS 3D：容器 `width: min(760px, 94vw)`、`height: min(400px, 60vh)`、`perspective: 1000px`（纵深感全靠它），`touch-action: pan-y`，光标 grab / 拖动中 grabbing，聚焦时 2px 强调色 outline（偏移 4px）。每张封面是 `position: absolute; left: 50%; top: 50%` 的 figure，宽度为容器的 52%、`aspect-ratio: 4 / 3`，圆角 {{rounded}}，`overflow: hidden`，投影 `0 22px 50px rgba(0,0,0,0.5)`，图片 `object-fit: cover`，未加载时以 `linear-gradient(135deg, #1a1c2c, #2a2f4a)` 占位。
- 布局算法：每张封面按「与当前张的环形距离 off」计算，off = (i − 当前序号 + 总数) % 总数，大于总数/2 时减去总数，折算到 ±总数/2 区间即可无缝循环。transform 依次写 `translate(-50%, -50%) translateX(off × {{gap}}) translateZ(−|off| × {{depth}}) rotateY(∓{{angle}})`——先居中再散开；translateX 用百分比，基准是封面自身宽度而不是容器；右侧封面 rotateY 取负、左侧取正，都朝中心倾斜，当前张为 0。z-index = 总数 − |off|，近的盖住远的。
- 亮度用 `filter: brightness(max(0.45, 1 − |off| × 0.22))` 随 |off| 递减（每级暗 22%，最暗不低于 45%）。
- 过渡：`transform {{duration}} cubic-bezier(0.33, 1, 0.68, 1)`，`filter {{duration}} ease`；切换只是改当前序号后重算所有封面的 transform，浏览器插值就是「整排一起滑」。
- 顶部高光：封面 `::after` 铺满、`pointer-events: none`，背景 `linear-gradient(rgba(255,255,255,0.14), transparent 32%)`。
- 分页圆点：容器底边下方 6px（`bottom: -6px`）居中，间距 7px，8px 白点 35% 透明，当前点为强调色并 `scale(1.25)`，过渡 0.15s。
- 交互细节：点击非当前封面直接跳到它；拖拽位移超过 8px 即标记为「拖过」并在 click 捕获阶段拦截，避免松手时误触跳卡；自动播放 `setInterval` 间隔 {{interval}}，悬停 / 聚焦 / 页面隐藏时清除，离开后重新开始。

## 技术要求补充
- 支持鼠标拖拽和触摸滑动切换（Pointer Events，横向滑动约 50px 判定翻页；拖拽后不要误触发封面的点击跳转）
- 支持键盘操作：容器可聚焦，← / → 切换；聚焦或悬停时暂停自动播放
- 无障碍：容器带 role="region" 和 aria-roledescription="carousel"，每张封面带 aria-label="第 N 张，共 M 张"，非当前封面 aria-hidden
- 页面切到后台时暂停自动播放；系统开启「减少动态效果」时不自动播放、封面位置瞬间到位

## 完成后请检查
- 中央封面端正朝前，两侧对称倾斜后退、亮度递减；参数（倾角 / 纵深 / 间距）改动能明显看出变化
- 从最后一张到第一张是就近的环形滑动，不会整排倒回去
- 点击侧面封面能跳到它；拖拽、键盘、圆点、悬停暂停都正常
