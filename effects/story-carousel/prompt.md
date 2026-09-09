## 效果描述
一块 9:16 的竖屏「限时动态」。顶部一排分段进度条，每张图对应一段：当前段用强调色从左到右匀速填满（历时每张停留），填满自动切到下一张，已看过的段保持全满，循环播放。进度条下面是渐变彩环头像和名字。交互完全照搬 story 的习惯：点画面左三分之一回上一张、点其余位置去下一张；按住不放画面暂停（进度条也停），松手继续，鼠标悬停时也暂停。

## 实现提示
进度条用 transform: scaleX 的线性动画，时长即每张停留，animationend 触发切换；暂停用 animation-play-state: paused；按住用 pointerdown / pointerup 判定。

## 技术要求补充
- 计时用 requestAnimationFrame 累计（不要 setInterval），按住 / 悬停 / 页面切后台时停止累计；进度条宽度随时间实时更新
- 点按判定（Pointer Events）：pointerdown 到 pointerup 少于 250ms 算「点按翻页」，更久算「按住暂停」
- 支持键盘操作：容器可聚焦，← / → 翻页
- 无障碍：容器带 role="region" 和 aria-roledescription="carousel"，每张带 aria-label="第 N 张，共 M 张"
- 系统开启「减少动态效果」（prefers-reduced-motion）时不自动前进，只能手动点按翻页

## 完成后请检查
- 进度条逐段填充、切换时机准确；按住画面进度停、松手继续
- 点左 1/3 回上一张、点其余去下一张；循环一圈后从头开始
- 悬停暂停、键盘翻页正常
