## 效果描述

页面背景是一整片缓慢流动的「极光」：若干巨大的彩色圆形光斑漂浮在底色上，颜色按极光颜色的顺序轮流出现（颜色可以多到七八种），边缘极其柔和，交叠处透出混合后的亮色。每个光斑沿自己的路径慢慢漂移、忽大忽小，彼此错开节拍，整体按流动速度呼吸般起伏。安静、有氛围，不抢内容的注意力。

## 实现提示

光斑用大尺寸圆形元素 + filter: blur（光斑柔和度）实现，共用一组 keyframes，靠起始位置和 animation-delay 错开相位；流动速度换算为 animation-duration。

- 结构：`position: fixed; inset: 0; overflow: hidden` 容器垫底，生成 {{blobs}} 个 `div`。
- 单个光斑：`position: absolute`，宽高 `58vmax`，`border-radius: 50%`，`filter: blur({{blur}})`，`opacity: 0.55`，`mix-blend-mode: screen`（交叠处透出叠色亮光的关键）。
- 颜色：第 i 个取颜色列表第 `i % 颜色数` 个，背景 `radial-gradient(circle at 50% 50%, 该色, transparent 70%)`（70% 处已透明，叠 blur 后无硬边）。
- 位置：`left = ((i × 37) % 70 − 12)%`，`top = ((i × 53) % 55 − 15)%`。
- 动画：`animation: mt-drift 时长 ease-in-out infinite alternate`，时长 = 26s ÷ 流动速度倍率（{{speed}}），第 i 个 `animation-delay = −7s × i ÷ 倍率`；alternate 往返不跳变。
- 关键帧：0% `translate(-8%, -6%) scale(1) rotate(0)`；50% `translate(10%, 8%) scale(1.18) rotate(12deg)`；100% `translate(-4%, 12%) scale(0.92) rotate(-10deg)`。
- 「减少动态效果」时 `animation: none`，保留静态配色。

## 完成后请检查

- 背景上有 {{blobs}} 个彼此交叠的柔和光斑，颜色与参数一致，边缘没有生硬的轮廓
- 光斑在持续缓慢漂移，速度符合参数，不同光斑的动作不同步、不闪烁
- 页面原有内容仍显示在效果之上，清晰可读，背景不挡任何按钮和链接
