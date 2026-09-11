## 效果描述

一个可以滚动的竖向列表，条目滚进视野时并不是直接出现，而是从略小、透明的状态快速放大浮现到位；滚出去又缩回。列表顶部和底部各有一段渐隐，滚到头时对应一端的渐隐消失。支持键盘：上下方向键（或 Tab）移动选中，选中项自动滚到可见位置；鼠标悬停 / 点击也会选中。条目、浮现时长、起始缩放、颜色见参数。

## 实现提示

- 列表是一个固定最大高度、`overflow-y: auto` 的容器（隐藏滚动条）；每个条目默认 `transform: scale(0.7); opacity: 0`，加上 `in` 类后 `scale(1); opacity: 1`，过渡 0.2s ease-out。
- 用 `IntersectionObserver({ root: 列表, threshold: 0.5 })` 监听每个条目，进入视口一半以上加 `in`、离开移除——滚回来会再浮一次。
- 渐隐：两个绝对定位、`pointer-events: none` 的渐变层（顶部 50px、底部 100px，从页面底色到透明），滚动时 `顶部 opacity = min(scrollTop/50, 1)`，`底部 opacity = min(距底距离/50, 1)`。
- 键盘：容器 `tabindex="0" role="listbox"`，↓/Tab 选下一个、↑/Shift+Tab 选上一个、Enter 确认；选中项若在容器上下 50px 安全区之外就 `scrollTo({ behavior: 'smooth' })` 滚到可见。
- 选中项换一个更亮的底色，条目带 `aria-selected`。

## 技术要求补充

- 纯 CSS 过渡 + IntersectionObserver，无需动画库。
- 系统开启「减少动态效果」时条目直接可见、滚动不做平滑。

## 完成后请检查

- 滚动时条目在进入视野处逐个放大浮现，滚回去会再演一次
- 顶端滚到头时顶部渐隐消失，底端同理
- 上下键能移动选中并自动滚到可见
