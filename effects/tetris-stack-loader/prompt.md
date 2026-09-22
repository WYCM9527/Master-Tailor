## 效果描述

一个四行高的小「井」。方块一块块从井口落下：每块随机选一列，加速落到那一列最高的空位停住、留下一个亮格。当某一行被填满，整行先闪一下白光、缩小消失，上面的方块顺势落下一层；如果堆到了顶，整井清空重新开始。像一局自动进行、永远打不完的俄罗斯方块。格数、格子大小、下落速度、颜色都可调。

## 实现提示

- 一个 CSS Grid 的「井」（{{cols}} 列 × 4 行，每格一个默认透明的 div）：`grid-template-columns: repeat({{cols}}, {{cell}})`、`grid-template-rows: repeat(4, {{cell}})`、`gap: 2px`、`padding: 4px`、圆角 6px、底 `rgba(255, 255, 255, 0.05)`、`position: relative`。格子圆角 2px、底色 {{color}}、`opacity: 0; transition: opacity 0.05s`，占住后加 `.on` → opacity 1。
- 下落的块是井内另一个绝对定位的 div（{{cell}} 见方、圆角 2px、{{color}}）：`left: calc(4px + 列 × ({{cell}} + 2px))`，起点 `top: -4px`，下一帧把 `top` 设为 `calc(4px + 目标行 × ({{cell}} + 2px))`，过渡 `top {{speed}} cubic-bezier(0.5, 0, 1, 0.5)`（加速下落）；等同样时长后移除它并把目标格设为亮。
- 用 4 × {{cols}} 的布尔矩阵记录占位：落点 = 该列从下往上第一个空位。选列是把 0…{{cols}}−1 洗牌后逐个弹出、用完再洗（一轮每列各落一块）；选到已满的列 50ms 后重选。
- 行满：给井加 `flash` 类，该行格子播 `mt-flash 0.28s ease-out both`：`30% { background: {{accent}}; transform: scale(1.1) } 100% { opacity: 0; transform: scale(0.6) }`（其他行格子临时 `animation: none`），300ms 后去掉类、上面的行整体下移一层并按矩阵重刷 `.on`。
- 落定后若首行有格子被占（堆到顶）：停 400ms 清空整井重来。每块落定后隔 80ms 再落下一块；减少动态或页面在后台时不落块（每 500ms 轮询恢复）。

## 完成后请检查

- 方块加速下落、准确落到该列最高空位；满行闪光消除并整体下移
- 堆到顶自动清空；格数改变后井宽随之变化
- 系统开启「减少动态效果」时不再落块
