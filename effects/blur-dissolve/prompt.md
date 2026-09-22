## 效果描述

整屏是一张带大标题的海报。点「下一幕」，画面不是切走，而是慢慢晕开——像镜头突然失焦，旧幕化成一团光雾并轻轻放大淡去；与此同时新幕从同一团雾里聚焦成形，由虚到实落定。返回时过程完全对称：新幕晕开，旧幕从雾里重新变清晰。雾感的轻重由模糊强度决定，整体气质像 Keynote 的溶解换场。

## 实现提示

两幕是同文档里互斥显示的两块海报（hidden 切换）。转场期间给离场页与进场页都挂 view-transition-name: page；old 快照播 opacity 1→0 + filter: blur(0→模糊强度) + 轻微放大，new 快照反向（模糊强度→0、透明→实、轻微缩小到原大）。模糊强度直接用 CSS 变量注入 blur() 半径。无 API 回退：同一套 keyframes 以类名加在真实页面上。

- 舞台 `min(880px, 94vw) × min(560px, 92vh)`，`border-radius: 18px; overflow: clip`，底色 #101016，`box-shadow: 0 24px 80px rgba(0, 0, 0, 0.5)`；每幕绝对铺满、占位图 `background-size: cover`，上压 `::after` 渐变 `linear-gradient(transparent 45%, rgba(0, 0, 0, 0.62))`。
- 文案靠左下、`padding: 0 44px 46px`：标题 `clamp(30px, 5.4vw, 52px)` 用 `{{accent}}`，说明 14.5px、`rgba(255, 255, 255, 0.72)`；换幕按钮在底部 20px、距侧边 22px，胶囊 `padding: 9px 20px`、`1px solid rgba(255, 255, 255, 0.4)` 边、`rgba(10, 10, 15, 0.45)` 底、14px `{{accent}}` 字。
- 关键帧：出场 `opacity 1→0`、`blur(0→{{blurAmount}})`、`scale(1→1.03)`；入场 `opacity 0→1`、`blur({{blurAmount}}→0)`、`scale(0.97→1)`。old / new 同时起跑，时长 `{{duration}}`，曲线 `cubic-bezier(0.45, 0, 0.25, 1)`，`animation-fill-mode: both`。
- 先给离场页写 `viewTransitionName = 'page'`，在 `startViewTransition` 回调里切 hidden 并把 name 挪给进场页，结束后清 name、复位「进行中」标志；回退时两幕同框（`.fx-in` z-index 2、`.fx-out` z-index 1），进场页 `animationend` 再隐藏离场页。第二幕按 Esc / Backspace 也返回。

## 技术要求补充

- 用同文档 View Transitions（document.startViewTransition）实现；溶解是对称转场，前进与返回共用同一套动画
- 旧幕的晕开淡出与新幕的聚焦淡入必须同时同曲线交叉进行，中段两幕短暂叠出「雾中换景」的效果
- 浏览器没有该 API 时降级为 CSS 类动画（两幕同框播同一套动画），视觉一致；开启「减少动态效果」时一律瞬间切换
- 如果要在多页应用（两个独立 HTML）之间做同款转场：两页同源，各自声明 @view-transition { navigation: auto }（Chrome 126+ / Safari 18.2+，Firefox 暂不支持，需接受直接切换降级）

## 完成后请检查

- 溶解中段有明显的「雾中交叠」，但结束后画面完全清晰、无残留模糊
- 前进与返回手感对称；连续点击不会错乱（进行中的导航应被忽略）
- 不支持视图过渡的浏览器里溶解依然成立；开启「减少动态效果」后为瞬间切换
