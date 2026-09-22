## 效果描述
上方是大图区，有标题的图底部带渐变标题条，大图切换用交叉淡化。下方一条横向缩略图：非当前项半透明，鼠标掠过变亮，当前项完全不透明并带一圈强调色描边；点任何缩略图大图立即切过去，当前缩略图还会自动平滑滚到条的可见区中间。大图按自动播放间隔自动轮播，悬停暂停；在大图上左右拖拽也能翻。

## 实现提示
- 结构：容器宽 `min(640px, 92vw)`，上主图区、下缩略图条。主图区 `aspect-ratio: 4 / 3`、圆角 {{rounded}}、`overflow: hidden`，兜底背景 `linear-gradient(135deg, #1a1c2c, #2a2f4a)`；占位图 `object-fit: cover`，有标题的底部叠标题条：`padding: 42px 18px 14px`、白字 16px / 600、背景 `linear-gradient(transparent, rgba(0,0,0,0.62))`。
- 大图切换只靠 opacity 两态交叉淡化：幻灯片绝对铺满、`opacity: 0`，当前项 `opacity: 1; z-index: 1`，过渡时长 {{duration}}、曲线 ease，没有位移或缩放。
- 缩略图条 `display: flex; gap: 8px; margin-top: 10px; padding: 3px; overflow-x: auto`，隐藏滚动条（`scrollbar-width: none` + `::-webkit-scrollbar { display: none }`）。缩略图是 button：`flex: none`、高 {{thumbSize}}、`aspect-ratio: 4 / 3`、圆角 8px、`border: 2px solid transparent`、底色 #14151f、`opacity: 0.55`，悬停 0.85，当前项 `opacity: 1` 且边框换成强调色 {{accent}}；opacity 与 border-color 都 0.15s ease 过渡。
- 切换时用条自身的 `scrollTo({ left: 缩略图.offsetLeft − (条宽 − 缩略图宽) / 2, behavior: 'smooth' })` 把当前缩略图滚到可见区中间（不要用 scrollIntoView，会连带滚动整个页面）；「减少动态效果」时 behavior 改 'auto'。
- 自动播放间隔 {{interval}}，为 0 不启动；拖拽只在主图区上监听。

## 技术要求补充
- 支持鼠标拖拽和触摸滑动切换（用 Pointer Events 统一处理）
- 支持键盘操作：容器可聚焦，← / → 切换；聚焦或悬停时暂停自动播放
- 无障碍：容器带 role="region" 和 aria-roledescription="carousel"，每张带 aria-label="第 N 张，共 M 张"
- 页面切到后台时暂停自动播放；系统开启「减少动态效果」时不自动播放、切换为瞬间完成

## 完成后请检查
- 点缩略图大图立刻切换；当前缩略图有描边高亮并自动滚到可见位置
- 缩略图条超宽时可以横向滑动，且不显示系统滚动条
- 大图拖拽、键盘、自动播放（若开启）、悬停暂停正常
