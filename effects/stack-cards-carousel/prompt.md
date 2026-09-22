## 效果描述
一沓竖版卡片叠在一起：顶层卡片完整清晰，下面露出几层「一沓」的边，每往下一层就按层叠强度缩小一点、下移一点，最底那层半透明。按自动切换间隔顶卡向左上方飞出、旋转淡出，下面整沓同时上浮一层补位，飞走的卡悄悄回到队尾，永远轮不完。往回翻时队尾的卡从左上方飞回顶层。右上角强调色数字角标显示当前第几张，卡片底部带标题渐变条。

## 实现提示
- 纯 DOM + CSS transition。容器 `position: relative; width: min(420px, 82vw); aspect-ratio: 4 / 5; cursor: grab`。所有卡 `position: absolute; inset: 0` 叠在同一位置：圆角 {{rounded}}、`overflow: hidden`、投影 `0 18px 44px rgba(0, 0, 0, 0.45)`、图片加载前底色 `linear-gradient(135deg, #1a1c2c, #2a2f4a)`，图片 `object-fit: cover`（占位图）。卡的过渡：`transform {{duration}} cubic-bezier(0.33, 1, 0.68, 1)`、`opacity {{duration}} ease`（层叠位移与飞出共用）。
- 按层号 `off = (i − index + total) % total` 布局：off = 0 顶卡，transform 置空、opacity 1、z-index 最高；off = 1–3 露出的那沓：`translateY(off × 16px × {{stackDepth}}) scale(1 − off × 0.05 × {{stackDepth}})`，z-index 逐层递减，第 3 层 opacity 0.55、其余 1；off > 3 藏在最底：与第 3 层同 transform、opacity 0、z-index 0。
- 下一张：顶卡写入 `translate(-55%, -6%) rotate(-10deg)` + `opacity: 0`，index 前进一位，两帧 rAF 后 layout() 让其余卡上浮一层，飞出的卡随之落到队尾隐藏位（过渡从飞行途中重定向，被新顶卡盖住后淡出）。上一张：index 退一位，新顶卡关过渡、瞬移到同一飞出姿态并置顶，强制 reflow 恢复过渡后 layout()，从左上方飞回。
- 角标 `top: -34px; right: 0; padding: 3px 12px`、圆角 999px、底 `rgba(10, 10, 15, 0.6)`、{{accent}} 12.5px 等宽字，内容「N / M」；标题条 `padding: 42px 18px 14px`、白字 17px / 600、背景 `linear-gradient(transparent, rgba(0, 0, 0, 0.62))`。
- 自动播放每 {{interval}} 切下一张；拖拽中卡片不跟手，松手后才判定。

## 技术要求补充
- 支持鼠标拖拽和触摸滑动切换（用 Pointer Events 统一处理，滑动超过约 50px 判定翻页）
- 支持键盘操作：容器可聚焦，← / → 切换；聚焦或悬停时暂停自动播放
- 无障碍：容器带 role="region" 和 aria-roledescription="carousel"，每张带 aria-label="第 N 张，共 M 张"
- 页面切到后台时暂停自动播放；系统开启「减少动态效果」时不自动播放、切换为瞬间完成

## 完成后请检查
- 顶卡飞出的同时下层卡片平滑上浮补位；连续切换一整圈后顺序不乱、不会出现空档
- 往回翻是「飞回来」而不是简单闪现；层叠强度调整能明显看出下层错位变化
- 拖拽左右滑、键盘、悬停暂停、数字角标都正常
