## 效果描述
一行打字机效果的文字：文案按打字速度逐字打出，整句打完后停顿片刻，再以两倍速度逐字删除，然后换下一句，循环轮播。文字末尾跟着一根光标色的竖条光标，一秒一闪，打字与删除过程中光标始终吸附在最后一个字后面。

## 实现提示
- 结构：页面 grid 居中，一个容器里放文字 span + 光标 span。容器字体 {{font}}、字号 {{fontSize}}、`font-weight: 600`、`letter-spacing: 0.02em`、颜色 {{color}}，`min-height: 1.5em` 免得删空时整行塌掉。
- 光标：`display: inline-block; width: 0.09em; height: 1.1em; margin-left: 0.08em; vertical-align: -0.15em`，背景 {{accent}}；闪烁 `@keyframes` 只写 `50% { opacity: 0 }`，`1s steps(1) infinite`——硬切不渐变，亮暗各半秒。它是紧跟文字 span 的行内元素，天然贴在最后一个字后面。
- 节奏用 rAF 循环 + 目标时间戳 `waitUntil` 驱动（不用 setTimeout 链）：每帧 `now >= waitUntil` 才推进一步。打字阶段 `charCount++`、`textContent = 句子.slice(0, charCount)`，间隔 = 1000 ms ÷ 打字速度（{{speed}}）；打满停 1600 ms 转删除；删除阶段 `charCount--`，间隔 = 500 ms ÷ 打字速度（两倍速）；删到 0 停 400 ms 换下一句（取模循环）。
- 文案 {{sentences}} 按「｜」拆分、trim、过滤空串。`document.hidden` 时只续排下一帧、不推进状态，回前台从当前进度继续，不追帧。
- 「减少动态效果」或没有文案时不跑状态机：直接写入第一句全文，光标 `animation: none`。

## 完成后请检查
- 文字逐字打出与删除的节奏和参数一致，多句按顺序循环，中文不出现乱码或半个字
- 光标颜色正确、稳定闪烁，始终紧跟在当前文字末尾
- 页面切到后台再回来动画不会跳字或加速；系统开启「减少动态效果」时直接显示完整第一句、光标不闪
