## 效果描述

深底上一排浅色按钮，悬停时各自出现不同的阴影或气泡变化：底下浮出一片投影；放大同时带投影；四周泛出蓝色光晕；按钮浮起 5px、脚下留一团模糊的椭圆影子；上下两侧同时浮出弧形阴影像被夹在两块玻璃间；顶部冒出一个同色的气泡尖角变成对话框；整颗上浮、底部尖角向下探出；右侧探出尖角；右上角像纸一样卷起一角、翻面泛蓝；左下角卷起。颜色、时长、圆角都可调，也可以只显示其中一种。

## 实现提示

阴影类只过渡 `box-shadow`（与 `transform`）：投影 `0 10px 14px -8px rgba(0,0,0,.8)`，光晕 `0 0 14px 2px 强调色`；浮起留影用 `::before` 在按钮下方（`top: 100%`）放一条 `radial-gradient(ellipse, rgba(0,0,0,.6), transparent 80%)` 的 10px 高影子，按钮 `translateY(−5px)` 同时影子 `translateY(5px)` 并淡入，看起来影子留在原地；上下弧影用 `::before / ::after` 各一条 6px 高的径向渐变贴在上下边外淡入。气泡尖角用 `border` 三角：如顶部尖角 `border: 10px solid transparent; border-top: 0; border-bottom-color: 按钮底色`，默认藏在按钮内（`top: 0`），悬停 `translateY(−10px)` 探出；上浮下探是按钮 `translateY(−10px)`、底部三角 `translateY(10px)`。卷角：按钮 `overflow: hidden`，`::before` 在角上 `width/height: 0 → 26px`，背景 `linear-gradient(225deg, 页面底色 45%, 亮强调色 50%, 强调色 56%, 暗底色 80%)` 模拟翻面与背面。

## 完成后请检查

- 十种变化各自成立，气泡尖角与按钮同色、卷角看得出翻面
- 只显示单一效果时按钮文字为自定义文字
- 系统开启「减少动态效果」时无过渡；没有鼠标时缩略图里轮流演示
