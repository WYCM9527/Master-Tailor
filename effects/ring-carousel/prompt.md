## 效果描述
所有图片贴在一个看不见的圆柱环上，正前方那张最大最亮。整个环按自动旋转间隔朝同一方向转动一格，永远同向、无缝循环；开启后方压暗后，卡片转到环后方会逐渐变暗，正面驶来时再亮起。底部一枚强调色数字角标显示当前是第几张。悬停暂停旋转，横向拖拽可以手动转环。

## 实现提示
舞台元素 transform-style: preserve-3d，第 i 张卡 `rotateY(i×360/N) translateZ(r)`，r = (卡宽/2)/tan(π/N)；转动只改舞台的 rotateY，角度累加不取模就不会倒转。

- 结构：居中容器 `width: min(760px, 94vw); height: min(380px, 58vh); perspective: 1200px; touch-action: pan-y; cursor: grab`（拖拽中 grabbing），`:focus-visible` 时 `outline: 2px solid {{accent}}; outline-offset: 4px`；舞台铺满容器，`transition: transform {{duration}} cubic-bezier(0.33, 1, 0.68, 1)`。
- 卡片：`position: absolute; left: 50%; top: 50%; width: 36%; aspect-ratio: 4 / 3; border-radius: {{rounded}}; overflow: hidden; backface-visibility: hidden`（后方的卡不透出镜像），`box-shadow: 0 18px 44px rgba(0,0,0,0.45)`，底色 `linear-gradient(135deg, #1a1c2c, #2a2f4a)`，图 `object-fit: cover`；transform 最前面加 `translate(-50%, -50%)` 居中。
- 半径：卡宽 = 容器宽 × 0.36，`r = round(卡宽 / 2 / tan(π / N) × 1.18)`（1.18 留出卡间缝隙）。
- 数字角标：底部居中、`bottom: -8px`，`padding: 3px 12px; border-radius: 999px; background: rgba(10,10,15,0.6)`，等宽字体 12.5px，颜色 {{accent}}，内容「当前 / N」；当前序号 = `((round(−累计角 / 步长) mod N) + N) mod N`。
- 后方压暗开启时每张卡 `filter: brightness(max(0.4, 1 − off × (1.2 / N) × 2))`，off 为与当前卡的环形距离 `min(|i − idx|, N − |i − idx|)`；关闭时不设 filter。
- 自动旋转：每 {{interval}} 调一次「下一张」（累计角 −= 360/N）；间隔为 0、不足两张或「减少动态效果」时不启动。

## 技术要求补充
- 支持鼠标拖拽和触摸滑动切换（用 Pointer Events 统一处理，滑动超过约 50px 判定翻页）
- 支持键盘操作：容器可聚焦，← / → 切换；聚焦或悬停时暂停自动播放
- 无障碍：容器带 role="region" 和 aria-roledescription="carousel"，每张带 aria-label="第 N 张，共 M 张"
- 页面切到后台时暂停自动播放；系统开启「减少动态效果」时不自动播放、切换为瞬间完成

## 完成后请检查
- 环始终朝同一个方向转（最后一张到第一张不会反向倒回）；正前方的卡端正朝向观众
- 后方压暗开启时能看出前亮后暗的层次；关掉后所有卡亮度一致
- 拖拽转环、键盘左右、悬停暂停、数字角标更新都正常
