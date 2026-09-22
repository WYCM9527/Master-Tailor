## 效果描述
一行大标题文字，文字本身没有纯色，而是被一条从渐变色 A 经渐变色 B 到渐变色 C 的斜向渐变填充；渐变在文字内部持续朝一个方向缓缓流动，像字面上有一层光泽在走。渐变首尾同色，流动无缝循环，看不到跳变接缝。

## 实现提示
`background: linear-gradient(...)` + `background-size: 300% 100%` + `background-clip: text; color: transparent`，再用 keyframes 平移 background-position 到 300% 即可无缝循环。

- 结构：一个 `<h1>`，页面 grid 居中；`font-weight: 700; letter-spacing: 0.02em; text-align: center; padding: 0 24px`，字号 {{fontSize}}、字体 {{font}}，文字 {{content}} 由 JS 写入。
- 渐变：`linear-gradient(100deg, {{colorA}}, {{colorB}}, {{colorC}}, {{colorA}})`——100deg 近水平、略向下倾；第四个色标重复色 A，首尾同色是循环无缝的前提。
- 铺法：`background-size: 300% 100%`（横向三倍、纵向一倍）；`-webkit-background-clip: text` 与 `background-clip: text` 都写，再 `color: transparent` 让渐变透出来。
- 动画：`animation: flow (6s ÷ {{speed}}) linear infinite`，关键帧只写 `to { background-position: 300% 0 }`（起点为默认 0 0）；位移与 background-size 同为 300%，走一轮正好回到同一张图；必须 `linear`，缓动会让流速在循环点忽快忽慢。
- 「减少动态效果」时 `animation: none`，保留静态三色渐变填充。

## 完成后请检查
- 文字内部有三色渐变且在持续流动，速度与参数一致，循环处无闪跳
- 换不同文案与字号后渐变仍然铺满整段文字，没有文字被裁掉或渐变错位
- 系统开启「减少动态效果」时渐变静止但文字仍是彩色渐变填充
