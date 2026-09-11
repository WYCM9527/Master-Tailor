## 效果描述

一张竖版个人名片，像一张稀有的全息收藏卡：顶部是渐变色的姓名与头衔，中间是人像，底部一条毛玻璃信息条（小头像、账号、状态、联系按钮）。鼠标移到卡上，卡片随鼠标位置 3D 倾斜，表面浮现出六色彩虹带与斜向金属细纹组成的全息光泽、鼠标所在处一团高光，人像也微微跟着挪动；卡片背后透出一团跟着鼠标走的彩色光晕。鼠标离开后卡片缓缓摆正、光泽淡去。页面打开时卡片从右上角的倾斜姿态慢慢摆正。人像、文字、光晕色、倾斜幅度见参数。

## 实现提示

- 外层 `perspective: 500px`，所有视觉由一组 CSS 变量驱动：鼠标在卡内的百分比 `--px/--py`，纹理位移 `--bx/--by`（把 0–100% 映射到 35–65%），`--from-center`（到中心的归一化距离）、`--from-top/--from-left`，倾斜 `--rx = −(px−50)/5 deg`、`--ry = (py−50)/4 deg`。目标点以时间常数 0.14s 指数趋近（进场前 1.2s 用 0.6s），悬停时卡片 `transform: rotateX(var(--ry)) rotateY(var(--rx))` 不带过渡，离开时目标回中心并恢复 `transition: transform 1s`。
- 卡片 `aspect-ratio: 0.718`、圆角 30px、`display: grid` 所有层叠在同一格。层次自下而上：①内部渐变底 `linear-gradient(145deg, #60496e8c, #71c4ff44)`；②全息层：三张背景叠加——`repeating-linear-gradient(0deg, 六色彩带每 5%)`、`repeating-linear-gradient(−45deg, 深蓝→青灰细纹)`、鼠标处的径向暗晕，`background-blend-mode: color, hard-light`，尺寸 500%/300%/200%，位置跟 `--bx/--by`；整层 `mix-blend-mode: color-dodge`，用一张蜂窝纹样 SVG 做亮度遮罩，平时 `brightness(0.66) contrast(1.33) saturate(0.33) opacity(0.5)` 并做 18s 的背景位移循环，悬停提亮并暂停循环；`::before` 悬停淡入一层 45° 彩虹 + 鼠标处灰亮斑（`mix-blend-mode: luminosity`，亮度/对比随 `--from-center`），`::after` 淡入一层 difference 细纹；③高光 `radial-gradient(circle at 鼠标, 淡紫 12%, 深蓝 90%)` overlay；④人像 `mix-blend-mode: luminosity`（照片吃进底下的全息色），`translateX((from-left−0.5)×6px)` 与 1–2% 的缩放跟随，顶部用渐变 mask 淡出；⑤姓名头衔渐变文字（`background-clip: text`），反向微移；⑥信息条 `backdrop-filter: blur(30px)` 白 10% 底。
- 卡后光晕：一层 `radial-gradient(circle at 鼠标, 光晕色 0%, transparent 50%)`，`filter: blur(50px)`，悬停时 opacity 0.8。
- 阴影随鼠标偏移：`box-shadow: rgba(0,0,0,0.8) (from-left×10−3)px (from-top×20−6)px 20px −5px`。

## 技术要求补充

- 纯 CSS 混合模式 + 一个 rAF 写变量，无依赖；按钮可点、其他层 `pointer-events: none`。
- 系统开启「减少动态效果」时不倾斜、全息层静止。

## 完成后请检查

- 悬停时卡片随鼠标倾斜，表面有彩虹全息光泽与随鼠标移动的高光
- 卡后有跟随鼠标的彩色光晕；离开后卡片缓缓摆正、光泽淡出
- 打开页面时卡片从右上角倾斜姿态缓缓摆正
