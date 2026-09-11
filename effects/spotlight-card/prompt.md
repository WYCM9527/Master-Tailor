## 效果描述

几张圆角深色卡片并排。鼠标移进哪张卡，卡面上就亮起一团柔和的光斑跟着指针走（像手电筒照在卡面上），移出后半秒内缓缓熄灭；键盘聚焦到卡片时也会亮。光的颜色与浓度、亮起程度、卡片底色 / 边框 / 圆角、卡片文案见参数。

## 实现提示

- 每张卡 `position: relative; overflow: hidden`，里面铺一层绝对定位、`pointer-events: none` 的光层：`background: radial-gradient(circle at var(--x) var(--y), 光色, transparent 80%)`，默认 `opacity: 0`，`transition: opacity 0.5s ease-in-out`。
- pointermove 时把「鼠标相对卡片的坐标」写进 `--x/--y`；pointerenter 把光层 opacity 设为亮起程度（默认 0.6），pointerleave 设回 0；focus/blur 同样处理。
- 光色用带透明度的 rgba（默认白 25%），叠在深底上才柔；渐变到 80% 处完全透明，光斑边缘不能有硬边。
- 标题、描述放在光层之上（`position: relative`），光斑只是氛围不遮内容。

## 技术要求补充

- 纯 CSS 渐变 + 三个事件监听，无需 canvas 或库。
- 系统开启「减少动态效果」时光层不做过渡，直接出现 / 消失。

## 完成后请检查

- 光斑紧贴鼠标位置移动、边缘柔和无硬边
- 移出卡片后光斑在半秒内淡出而不是瞬间消失
- Tab 聚焦卡片时同样亮起
