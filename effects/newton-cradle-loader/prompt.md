## 效果描述

四颗小球用细线悬着并排挂成一列，像桌面上的牛顿摆。最左边的球向左甩起、减速到最高点、再加速落回撞上球列；那一瞬间最右边的球被弹出去向右甩起，同样回落撞回；然后又轮到左球。中间两颗始终纹丝不动。摆动的速度先慢后快再慢，像真的钟摆。颜色、尺寸、摆角、周期都可调。

## 实现提示

四个等宽的竖条元素 flex 排列，每个 `transform-origin: 50% 0`（顶端为轴），用 `::before` 画一条细线、`::after` 在底端画球。只有首尾两个有动画：左球关键帧 0% → 25% 转到 `+角度`（`ease-out` 减速上摆）→ 50% 回到 0（`ease-in` 加速落回）→ 100% 保持不动；右球把这段挪到 50%–100%、角度取负。总时长即一轮周期，线性驱动、靠关键帧内的分段缓动模拟重力。

- 尺寸：容器是 {{size}} 见方的正方形，`display: flex; justify-content: center; align-items: flex-start`，放在深色底（#0a0a0f）页面正中；四个竖条各占容器宽的 25%、高 100%，`position: relative; display: block`。
- 线：`::before` 绝对定位在竖条水平中央（`left: 50%` 加 `translateX(-50%)`），1px 宽、高 78%，颜色固定 `rgba(255,255,255,0.25)`，不随小球颜色变。
- 球：`::after` 贴竖条底部（`left: 0; right: 0; bottom: 0; aspect-ratio: 1; border-radius: 50%`），直径等于竖条宽即整体尺寸的 1/4，四球正好相切排成一排，颜色 {{color}}；线高 78% 加球径 25% 略超过容器高，线尾伸进球里一点，看起来球正挂在线上。
- 动画：`animation: 关键帧名 {{speed}} linear infinite`（一轮 = 左球一去一回 + 右球一去一回），摆角取 {{angle}}。左球：`0% { rotate(0); animation-timing-function: ease-out } 25% { rotate(+角度); animation-timing-function: ease-in } 50%, 100% { rotate(0) }`；右球：`0%, 50% { rotate(0); ease-out } 75% { rotate(−角度); ease-in } 100% { rotate(0) }`。每段的 timing-function 写在该段起始关键帧里，整条 animation 保持 linear，否则两段缓动会叠加失真。中间两个竖条不加动画。
- 减少动态：`animation-play-state: paused`，四球静止垂直。

## 完成后请检查

- 左右两球交替摆动、衔接在撞击瞬间；中间两球不动
- 摆到最高点减速、落回加速
- 系统开启「减少动态效果」时静止
