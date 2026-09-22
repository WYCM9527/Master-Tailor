## 效果描述
企业发展史式的时间线：上方舞台展示当前里程碑——大图、左上角强调色的大号年份、底部渐变上的事件标题；切换时旧内容淡出、新内容淡入并轻轻上移进场。下方一条水平时间轴，一根细线串起所有年份节点，当前节点是放大的强调色圆点、年份文字加粗高亮；点任何节点直接跳到那一年。按自动前进间隔自动前进，悬停暂停，循环播放。

## 实现提示
- 结构：容器宽 `min(680px, 92vw)`，上舞台、下时间轴。舞台 `aspect-ratio: 16 / 9`、圆角 {{rounded}}、`overflow: hidden`、底色 #14151f；占位图 `object-fit: cover`；年份大字 `left: 22px; top: 14px`、44px / 800、颜色 {{accent}}、ui-monospace、`text-shadow: 0 2px 14px rgba(0,0,0,0.5)`；底部标题条 `padding: 42px 20px 14px`、白字 17px / 600、背景 `linear-gradient(transparent, rgba(0,0,0,0.65))`。
- 舞台切换是 opacity + translateY 两态过渡：非当前 `opacity: 0; transform: translateY(16px)`，当前 `opacity: 1; transform: none; z-index: 1`；时长 {{duration}}，opacity 用 ease、transform 用 `cubic-bezier(0.22, 1, 0.36, 1)`——新站从下方 16px 上浮淡入，旧站淡出并回落。
- 年份列表 {{years}} 按「｜」拆开并 trim，与里程碑按索引一一对应，缺年份的节点显示序号。
- 时间轴 `display: flex; justify-content: space-between; margin-top: 26px; padding: 0 8px`；轴线是 `::before`：`top: 5px; height: 2px`、`rgba(255,255,255,0.15)`。节点是透明 button，`padding: 14px 6px 0`、13px ui-monospace、颜色 #6d7285，悬停 #f2f3f8；圆点是节点的 `::before`：12×12 圆、贴顶水平居中、底色 #2a2d3f、`border: 2px solid rgba(255,255,255,0.25)`。当前节点文字 {{accent}} + 700，圆点底色与边框换 {{accent}} 并 `scale(1.25)`；颜色 / 边框 / transform 都 0.15s ease 过渡。
- 自动前进间隔 {{interval}}，为 0 不启动；拖拽只监听舞台。

## 技术要求补充
- 支持鼠标拖拽和触摸滑动切换（用 Pointer Events 统一处理，滑动超过约 50px 判定翻页）
- 支持键盘操作：容器可聚焦，← / → 切换；聚焦或悬停时暂停自动播放
- 无障碍：容器带 role="region" 和 aria-roledescription="carousel"，每张带 aria-label="第 N 张，共 M 张"
- 页面切到后台时暂停自动播放；系统开启「减少动态效果」时不自动播放、切换为瞬间完成

## 完成后请检查
- 时间轴节点与图片一一对应、点击可跳转；当前节点与年份高亮明显
- 切换是「淡入 + 上移」的进场；年份大字与标题随图更新
- 自动前进、悬停暂停、拖拽、键盘正常
