## 效果描述

一颗透明底、只有一圈灰白细边的按钮，文字大写、字距拉开。鼠标悬停时它像一根霓虹灯管被点亮：边框和文字都变成青色，边框向外晕开一圈青色光雾、内侧也泛着光，文字带发光；点亮的瞬间还会像老灯管接触不良一样快速暗两下再稳定亮着。移开后灭掉。霓虹颜色、光雾范围、圆角、字号、是否闪烁都可调。

## 实现提示

按钮 `background: transparent; border: 2px solid 25% 白`。悬停 / 聚焦态：`color` 与 `border-color` 换成霓虹色，`box-shadow: 0 0 光雾 霓虹色(70%), inset 0 0 光雾/2 霓虹色(35%)`，`text-shadow: 0 0 8px 霓虹色, 0 0 1.2×光雾 霓虹色`，各属性 0.25s 过渡。闪烁用一段 `steps(1, end)` 的关键帧在 10% 与 24% 处把 opacity 压到 0.35、其余为 1，悬停时播放一次（0.7s）。

- 静态外观：纯 DOM 一个 `<button>`，放在深色底（#0a0a0f）页面正中；`padding: 14px 34px`，边框 `2px solid rgba(255,255,255,0.25)`，圆角 {{radius}}，默认字色 {{color}}，字号 {{fontSize}}、700 字重、`letter-spacing: 0.12em`、`text-transform: uppercase`，光标 pointer，文字取 {{label}}。
- 点亮态的具体值：霓虹色取 {{neon}}，光雾取 {{glow}}；半透明霓虹色用 `color-mix(in srgb, 霓虹色 70%, transparent)` / `35%` 得到，不必手算 rgba。`:focus-visible` 与 `:hover` 共用同一组样式并去掉 outline；`transition: color 0.25s, border-color 0.25s, box-shadow 0.25s, text-shadow 0.25s`，移开后按同一过渡熄灭。
- 闪烁（{{flicker}}）：开启时给按钮加一个类，只有带该类的按钮在悬停 / 聚焦态才播放 `animation: 0.7s steps(1, end) 1`；关键帧 0%、18%、30%、100% 处 opacity 为 1，10%、24% 处为 0.35——`steps(1, end)` 让明暗是硬切而非渐变，才像接触不良的灯管。关闭时不加该类，其他样式不变。
- 减少动态：`transition: none; animation: none !important`，直接切到点亮态。

## 完成后请检查

- 悬停时边框、文字同时亮起并发光；点亮瞬间闪两下后稳定
- 键盘聚焦触发同样效果；移开后平滑熄灭
- 系统开启「减少动态效果」时无过渡与闪烁
