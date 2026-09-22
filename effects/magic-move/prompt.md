## 效果描述

第一幕里，大标题在左下，配图小小地贴在右上，一枚圆角徽章待在左上角。点「下一幕」，这三样东西不换页、不消失，而是各自起飞：标题缩小飞到顶部居中，配图边飞边长大落到画面中央，徽章滑到右下角——同时起步、同时落定，像同一批物体被重新摆放。返回时全部原路飞回。这就是发布会幻灯片里「神奇移动」的网页版。

## 实现提示

两幕是同文档里互斥显示的两块区域（hidden 切换），同一组元素在两幕里用同样的 view-transition-name 静态命名（CSS 里写死即可，display:none 的一幕不参与快照不会重名）。startViewTransition 的回调里只做换页；位置与尺寸的补间由浏览器按快照自动生成，作者只需在 ::view-transition-group(名字) 上统一 animation-duration 与 animation-timing-function。无 API 时两幕同框播 CSS 淡化动画。

- 舞台：`min(880px, 94vw) × min(560px, 92vh)` 的卡片，底色 #101016、圆角 18px、`overflow: clip`、投影 `0 24px 80px rgba(0,0,0,.5)`；两幕都 `position: absolute; inset: 0`。
- 第一幕：徽章左上（28px / 40px）；配图（占位图）右上（28px / 40px），宽 34%、比例 4:3；标题 + 一行说明贴左下（左右 40px、bottom 38px），标题 `clamp(28px, 4.6vw, 46px)`。第二幕：标题 22px 居中贴顶（top 30px、不换行），说明居中于 top 78px；配图居中偏下（bottom 66px），宽 62%、比例 16:9；徽章右下（28px / 26px）。
- 标题 `font-weight: 700`、颜色 {{accent}}；徽章 13px 等宽、`1px solid rgba(255,255,255,.35)` 胶囊；配图 `object-fit: cover`、圆角 14px；说明 13.5px、#9a9ba8。
- 过渡层：`::view-transition-group(title / pic / badge)` 统一时长 {{duration}}、曲线 {{ease}}（Keynote 标准 `cubic-bezier(.4,0,.2,1)`、苹果标准 `cubic-bezier(.2,.8,.2,1)`、轻微过冲 `cubic-bezier(.34,1.3,.5,1)`）；`old/new(pic)` 设 `width/height: 100%; object-fit: cover`；`(root)` 时长同设 {{duration}}。
- 两侧各一颗 40px 圆钮切幕，第二幕下 Esc / Backspace 返回；转场中忽略新导航，回退淡化同用这组时长与曲线。

## 技术要求补充

- 用同文档 View Transitions（document.startViewTransition）实现：给每个要飞的元素挂各自的 view-transition-name（标题、图片、徽章各一个），名字同一时刻必须全文档唯一；两幕互斥显示（隐藏的一幕不参与快照）即可安全复用同名
- 所有承接元素必须共用同一时长与缓动曲线，同起同落，不能有先后错拍
- 图片快照设宽高 100% 加 object-fit: cover，飞行途中比例变化按裁切处理
- 浏览器没有该 API 时降级为两幕交叉淡化；开启「减少动态效果」时一律瞬间切换

## 完成后请检查

- 三个元素同时起步、同时落定，飞行轨迹自然；返回是严格倒放
- 文字快照在缩放中清晰（终态字号下不发虚）
- 不支持视图过渡的浏览器里换幕依然可用；开启「减少动态效果」后为瞬间切换
