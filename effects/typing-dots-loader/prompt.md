## 效果描述

一行文字被一个字一个字地打出来：「加」「载」「中」，然后省略号的三个点也一点一点追加；末尾始终有一条闪烁的竖线光标。打完停一小会儿，再从后往前一个字一个字删掉（删得比打快一倍），删空停一下再重打，循环。文字、字号、颜色、每字用时、点数都可调。

## 实现提示

一个 span 承载输出，旁边一条 2px 宽、`step-end` 闪烁的竖线当光标。把文字 {{text}} 用展开运算符拆成字符数组（emoji 不会被劈成半个）并追加 {{dots}} 个「.」；用 setTimeout 递归：方向为正时每步多显示一个字符（间隔 = 每字用时 {{speed}}），到末尾切换方向并停 900ms；方向为负时每步少一个（间隔减半），到 0 再停 400ms 换回正向。`aria-live="polite"` 让读屏能感知。

- 容器 `display: inline-flex; align-items: baseline`、`role="status"`；字体 {{font}}、字号 {{fontSize}}、`font-weight: 600`、`letter-spacing: 0.04em`、颜色 {{color}}；页面 grid 居中，底色 #0a0a0f。
- 光标：`display: inline-block; width: 2px; height: 1.1em; margin-left: 3px; transform: translateY(0.15em)`，颜色与文字同色（没有单独的光标色）；`@keyframes` 只写 `50% { opacity: 0 }`，`0.9s step-end infinite`。
- 每步 `i += dir` 后写 `full.slice(0, i).join('')`；页面在后台时不推进，每 400ms 轮询一次等回前台。
- 「减少动态效果」时直接写入全文并停止递归，同时把所有动画 `animation-play-state: paused`。

## 完成后请检查

- 逐字出现、逐字删除，删比打快；光标一直闪
- 省略号点数与设置一致；文字换成英文也正常
- 系统开启「减少动态效果」时直接显示完整文字
