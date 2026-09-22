## 效果描述
当前卡片居中原大展示，左右两侧各露出邻卡的一条边——邻卡按邻卡缩小比例缩小、按邻卡亮度压暗，一眼就能看出「旁边还有内容可以翻」。切换时整组卡片平滑滑到新位置，环形循环无缝；点击两侧露出的卡直接跳过去。按自动播放间隔自动切换，悬停暂停；有标题的卡底部带渐变标题条，底部一排强调色分页圆点。

## 实现提示
- 结构：容器 `position: relative; width: min(760px, 94vw); height: min(400px, 60vh); touch-action: pan-y`，光标 grab / 拖动中 grabbing，`:focus-visible` 时 `outline: 2px solid 强调色; outline-offset: 4px`。所有卡片都 `position: absolute; left: 50%; top: 50%` 叠在容器中心，位置完全由 JS 写 transform 决定。
- 卡片：`<figure>`，宽为容器的 62%、`aspect-ratio: 16 / 10`、圆角 {{rounded}}、`overflow: hidden`，投影 `0 22px 50px rgba(0, 0, 0, 0.5)`，加载前底色 `linear-gradient(135deg, #1a1c2c, #2a2f4a)` 占位；图片用占位图，`object-fit: cover; loading="lazy"`，并禁选中与拖拽（`user-select: none; -webkit-user-drag: none`），否则拖动翻页会把图片拖出来。
- 定位：每张卡按「与当前张的环形距离 off」定位——`off = (i − index + total) % total`，大于 total/2 就减去 total，折算到 ±total/2 即可无缝循环。`transform: translate(-50%, -50%) translateX(off × {{gap}}) scale(off ? {{sideScale}} : 1)`（translateX 的百分比按 CSS 语义相对卡片自身宽度，不是容器）；`z-index = total − |off|`；`filter: brightness(off ? max(0.3, {{dim}} − (|off| − 1) × 0.18) : 1)`，第二层邻卡再暗 0.18；非当前卡 `aria-hidden="true"`。
- 过渡：`transition: transform 切换时长 cubic-bezier(0.33, 1, 0.68, 1), filter 切换时长 ease`（切换时长取 {{duration}}）；`prefers-reduced-motion` 下 `transition: none`。
- 标题条：有 caption 才渲染，贴卡底部，`padding: 36px 16px 12px`，白字 16px / 600 字重，底衬 `linear-gradient(transparent, rgba(0, 0, 0, 0.62))`。
- 分页圆点：容器底部（`bottom: -6px`）flex 居中、`gap: 7px`，每个 8px 圆形 `<button>`，底色 `rgba(255, 255, 255, 0.35)`，当前页染强调色 {{accent}} 并 `scale(1.25)`，`transition: 0.15s`。
- 交互阈值：自动播放 `setInterval` 间隔 {{interval}}（0 或只有一张时不启动）；拖拽位移超过 8px 视为拖动并抑制随后的点击跳卡，松手时位移超过 50px 才翻页（左滑下一张）；点击侧卡直接跳到它。

## 技术要求补充
- 支持鼠标拖拽和触摸滑动切换（用 Pointer Events 统一处理）
- 支持键盘操作：容器可聚焦，← / → 切换；聚焦或悬停时暂停自动播放
- 无障碍：容器带 role="region" 和 aria-roledescription="carousel"，每张带 aria-label="第 N 张，共 M 张"
- 页面切到后台时暂停自动播放；系统开启「减少动态效果」时不自动播放、切换为瞬间完成

## 完成后请检查
- 当前卡居中、两侧对称露边；邻卡缩小与压暗程度符合参数
- 环形循环：第一张的左边露的是最后一张；点击侧卡能跳转
- 拖拽、键盘、圆点、悬停暂停正常
