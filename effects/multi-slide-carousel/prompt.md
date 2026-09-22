## 效果描述
同屏并排显示几张卡片，各卡底部有小标题条。按自动滚动间隔整排向左滚动一格，滚到最后能无缝接回第一张，中间没有「跳回去」的痕迹。底部一排强调色分页圆点对应每张卡，可选的左右箭头悬在轮播两侧边缘。

## 实现提示
所有卡片排进一条 flex 轨道，滚动即平移轨道；无缝循环用「首尾各克隆同屏张数」的办法——滑进克隆区后在过渡结束时无动画瞬跳回真实区；卡宽用 `calc((100% - 间距×(张数-1)) / 张数)` 算，窗口 resize 后无动画重排。
- 结构：居中容器 `width: min(780px, 94vw)`，聚焦时 2px 强调色（{{accent}}）outline、偏移 4px；里面一个 `overflow: hidden` 的视口（`touch-action: pan-y`，光标 grab / grabbing），视口内是 `display: flex; gap: {{gap}}` 的轨道，`will-change: transform`。
- 卡片：`flex: none`，宽 `calc((100% − {{gap}} × (同屏张数 − 1)) / 同屏张数)`，同屏张数取 {{perView}}（写成 CSS 变量，且不超过总张数），`aspect-ratio: 4 / 3`，圆角 {{rounded}}，`overflow: hidden`，兜底底图 `linear-gradient(135deg, #1a1c2c, #2a2f4a)`，图片 `object-fit: cover`。标题条贴底：`padding: 30px 12px 10px`，白字 13.5px / 600，背景 `linear-gradient(transparent, rgba(0,0,0,0.62))`，单行省略。
- 平移：轨道 `transition: transform {{duration}} cubic-bezier(0.33, 1, 0.68, 1)`；位置 = −(当前序号 + 同屏张数) × 步长，步长 = 首张实际像素宽 + gap（用像素算 gap 才精确）。真实卡前面放最后「同屏张数」张的克隆、后面放前「同屏张数」张的克隆（克隆 `aria-hidden`）；`transitionend`（目标为轨道本身）时序号 < 0 加总数、≥ 总数减总数，再关过渡重排（加 no-anim 类、读一次 `offsetWidth` 强制生效后移除）；过渡进行中忽略新的切换。减少动态时没有 transitionend，用 120ms 定时器兜底归位。
- 箭头（{{arrows}}）：38px 圆按钮，垂直居中、左右各外露 14px，底 `rgba(10,10,15,0.55)`、白色 17px ‹ ›，悬停底变强调色、字 #111，0.15s；总张数 ≤ 同屏张数时不渲染。
- 分页圆点：轨道下方 14px，间距 7px，8px 圆点 35% 白；当前项（序号对总数取模）为强调色并 `scale(1.25)`，0.15s；点圆点直接跳到对应序号。
- 自动滚动 `setInterval` 每 {{interval}} 滚一格（0、总张数 ≤ 同屏张数或减少动态时不启动）；拖拽位移超过 50px 翻一格（左滑下一格）。

## 技术要求补充
- 支持鼠标拖拽和触摸滑动切换（用 Pointer Events 统一处理）
- 支持键盘操作：容器可聚焦，← / → 切换；聚焦或悬停时暂停自动播放
- 无障碍：容器带 role="region" 和 aria-roledescription="carousel"，每张带 aria-label="第 N 张，共 M 张"
- 页面切到后台时暂停自动播放；系统开启「减少动态效果」时不自动播放、切换为瞬间完成

## 完成后请检查
- 同屏张数、间距与参数一致；从最后一张滚回第一张是连续的，没有整排倒带
- 拖拽一格格翻动、圆点能跳到指定卡、箭头正常
- 改变窗口宽度后卡片重新排满一行，不错位不留缝
