## 效果描述
一组随滚动堆叠的卡片，右上角带强调色序号角标。页面往下滚时，每张卡滚到顶部就「吸」住，下一张继续滚上来叠在它上面——被盖住的卡随着盖住的进度缩小、压暗，像被推向远处；每张卡的吸附位置逐层下移叠边高度，叠满后能看到每张卡露出的一条边，一摞卡片的层次一目了然。往回滚整个过程倒放。

## 实现提示
- 纯 DOM + `position: sticky`，无 canvas。卡片列 `width: min(560px, 88vw)`、居中、`padding-bottom: 30vh`（最后一张也能滚到吸附位），列前留 34vh 的引导区；真实使用就是页面滚动。
- 每张卡 `position: sticky; height: 54vh; margin-bottom: 12vh; overflow: hidden`，圆角 {{rounded}}，`top: calc(4vh + 序号 × {{topGap}})`（序号从 0 起），`z-index: 序号 + 1`，`transform-origin: center top`（缩小时顶边不动），`will-change: transform, filter`。图片加载前底色 `linear-gradient(135deg, #1a1c2c, #2a2f4a)`，朝上的投影 `0 -12px 40px rgba(0, 0, 0, 0.45)` 把叠层分开；图片 `object-fit: cover`（占位图）。
- 序号角标 `top: 14px; right: 16px; padding: 3px 12px`、等宽 14px / 700、色 {{accent}}、底 `rgba(10, 10, 15, 0.55)`、圆角 999px，内容「N / M」；标题条 `padding: 46px 20px 16px`、白字 18px / 600、背景 `linear-gradient(transparent, rgba(0, 0, 0, 0.62))`。
- 只算前 total − 1 张（最后一张永远不被盖）：`progress = clamp((我的 bottom − 下一张的 top) / 我的 height, 0, 1)`，写入 `transform: scale(1 − progress × {{shrink}})` 与 `filter: brightness(1 − progress × 0.35)`。scroll（passive）里 rAF 节流，每帧直接写值、不加 transition，往回滚自然倒放；初始化先算一次。

## 技术要求补充
- 堆叠吸附用 CSS position: sticky 实现（每张卡的 top 逐层递增），不要用 JS 定位
- 缩小与压暗在 scroll 事件里用 requestAnimationFrame 节流计算：按「下一张卡顶边推进到我高度的比例」得到 0-1 的进度再映射到 scale / brightness
- 系统开启「减少动态效果」（prefers-reduced-motion）时保留 sticky 叠放、去掉缩小与压暗动画
- 效果由页面自身滚动驱动，不拦截滚轮、不劫持滚动位置

## 完成后请检查
- 每张卡滚到顶部吸住、下一张自然盖上来；被盖的卡平滑缩小压暗
- 叠满后每张卡露出一条边、序号可见；往回滚动完整倒放
- 滚动流畅无抖动（计算在 rAF 中进行）
