## 效果描述
一行大字，带「信号故障」质感：文字上下叠着两个复制层，分别染成色差色 A 和色差色 B，向左右错开形成 RGB 色差；两个复制层还在不断随机地只露出一条条横向切片，像屏幕串行。主体文字每隔几秒整行抽搐一下再复位。所有跳变都是硬切、不是平滑过渡——这正是故障感的关键。

## 实现提示
复制层用 ::before / ::after + attr() 取同一段文字，mix-blend-mode: screen 叠色；切片用 clip-path: inset() 的多帧 keyframes 配 steps() 硬切；错位幅度与抖动频率写成 CSS 变量。

- 结构：一个 `div` 装文字，同一段文字再写进 `data-text`（JS 同时更新两处）。主体 `position: relative; font-weight: 700; letter-spacing: 0.04em; white-space: nowrap`，颜色 {{color}}、字号 {{fontSize}}、字体 {{font}}；深色底、grid 居中。
- 复制层：`::before / ::after` 均 `content: attr(data-text); position: absolute; inset: 0; overflow: hidden; mix-blend-mode: screen`，与主体逐像素重合；`::before` 染 {{colorA}} 并 `translateX(−{{intensity}})`，`::after` 染 {{colorB}} 并 `translateX({{intensity}})`。
- 切片：`clip-path: inset(上 0 下 0)` 只露一条横带，两层各一套 keyframes、都 `steps(1) infinite`，周期不成整数倍才像随机。A 层 `2.4s ÷ {{speed}}`，帧点 0/12/24/36/48/60/66/78/90%，上/下内缩依次 12/61、78/4、45/38、3/88、62/22、0/0（整层全露）、30/55、88/2、18/70（%），100% 回首帧；B 层 `3.1s ÷ {{speed}}`，帧点 0/14/28/42/50/64/76/88%，内缩 66/10、8/80、50/30、0/0、72/12、25/60、90/3、40/45。
- 主体抽搐：第三条 `steps(1)` 动画，周期 `4s ÷ {{speed}}`，0%、92%、100% 在原位，94% `translate(0.6 × 幅度, −0.4 × 幅度)`、96% `translate(−0.5 × 幅度, 0.3 × 幅度)`、98% 回零——一个周期只有末尾 8% 在抖，全程无过渡与缓动。
- 「减少动态效果」时三条动画全 `none`，复制层改为静态分割：`::before` `inset(0 0 55% 0)`（露上 45%）、`::after` `inset(55% 0 0 0)`，保留轻微静态色差。

## 完成后请检查
- 能看到左右两色的色差层和随机横向切片跳变，节奏与参数一致，硬切无缓动
- 主体文字始终可读，偶尔整行抽一下但会立即复位，不会一直歪着
- 系统开启「减少动态效果」时抖动完全停止，只保留轻微的静态色差
