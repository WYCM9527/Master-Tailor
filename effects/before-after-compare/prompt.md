## 效果描述
两张图完全重叠铺满容器：底层是「前」图，上层是「后」图，只露出分割线左侧的部分。一条强调色竖线立在分界处，线上一枚圆形手柄，左上、右上各有「后」「前」小角标。在容器任意位置按下，分割线立刻吸到指针处并实时跟手拖动：往右拖看到更多「后」图，往左拖回到「前」图。

## 实现提示
上层图用 clip-path: inset(0 X% 0 0) 裁切，拖动时同步分割线 left 与裁切比例；用 Pointer Events 统一处理鼠标与触摸，按下即跳到指针位置。
- 容器 `width: min(680px, 92vw); aspect-ratio: 16 / 10; border-radius: {{rounded}}; overflow: hidden; cursor: ew-resize; touch-action: pan-y`，底色 #14151f 兜住图片未加载的空白；两张占位图 `<img>` 绝对铺满、`object-fit: cover`、禁选中与拖拽。
- 位置只存一个 CSS 变量 `--pos`（初始 `{{startPos}}`）：上层图 `clip-path: inset(0 calc(100% − var(--pos)) 0 0)`；竖线 `left: var(--pos); width: {{lineWidth}}; translateX(-50%)` 贯穿上下，背景 `{{accent}}`。
- 手柄居中压在竖线上：40px 圆、背景 `{{accent}}`、#111111 的「‹›」（15px、700 字重），`box-shadow: 0 6px 18px rgba(0, 0, 0, 0.45)`。角标 `top: 12px`，「前」贴右、「后」贴左各 12px，`padding: 3px 12px; border-radius: 999px`，底 `rgba(10, 10, 15, 0.6)`、白字 12.5px、`letter-spacing: 0.08em`。竖线、手柄、角标都 `z-index: 2; pointer-events: none`。
- `pointerdown` 时 `setPointerCapture` 并立刻 `pos = clamp((clientX − rect.left) / rect.width × 100, 0, 100)`，`pointermove` 持续更新；键盘步进时给容器加 `smooth` 类（`clip-path` 与 `left` 各 `transition 0.2s ease`），按下即移除。

## 技术要求补充
- 拖拽用 Pointer Events 且必须实时跟手（拖动中不能有过渡动画）；在容器任意位置按下都有效，不必精确点中手柄
- 无障碍：容器作为滑块——role="slider"、aria-valuemin/max/now、可聚焦；← / → 按约 4% 步进，Home / End 直达两端
- 分割线位置用一个 CSS 变量驱动（clip-path 和竖线共用），保证两者永远对齐
- 本效果没有自动动画；键盘步进可带 0.2s 平滑，系统开启「减少动态效果」时步进也瞬间完成

## 完成后请检查
- 拖动分割线时上层图的裁切边缘与竖线严格对齐、完全跟手
- 键盘 ← / → 步进、Home / End 到两端；角标「前」「后」位置正确
- 两张图始终对齐（同尺寸同位置），不会错位或露底色
