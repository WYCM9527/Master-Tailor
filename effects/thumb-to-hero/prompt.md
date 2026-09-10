## 效果描述

图库页排着一格格小方缩略图，每张下面一行小图注。点开任意一张，那格小图跨过页面长成顶部的宽幅头图——比例从方变宽的过程中画面始终按取景裁切，不会压扁或拉宽，像取景框自己在长大。图注文字同时落到大标题的位置。返回、按 Esc 或从左缘右滑，头图原路缩回它在图库里的那一格。

## 技术要求补充

- 用同文档 View Transitions（document.startViewTransition）实现；view-transition-name 同一时刻必须全文档唯一——只给「参与本次转场」的那格缩略图挂名，转场结束立刻移除，重名会让转场被跳过
- 比例变化是本效果的重点：old/new 两张快照都必须设宽高 100% 加 object-fit: cover，任何时刻画面只能被裁切、不能变形
- 浏览器没有该 API 时降级为两页交叉淡化（同一套时长与曲线）；开启「减少动态效果」时一律瞬间切换
- 如果要在多页应用（两个独立 HTML）之间做同款转场：两页同源，各自声明 @view-transition { navigation: auto }（Chrome 126+ / Safari 18.2+，Firefox 暂不支持，需接受淡化降级）

## 实现提示

两个「页面」是同文档里互斥显示的两块区域（hidden 切换）。前进时给点击的缩略图挂 view-transition-name: pic，startViewTransition 回调里换页并把名字移交给头图；返回时反向移交。::view-transition-group(pic) 设 animation-duration 与缓动；::view-transition-old/new(pic) 设 height/width 100% + object-fit: cover 处理方图到宽图的比例差。无 API 时两页同框播 CSS 淡化动画。

## 完成后请检查

- 方图长成宽图的全程画面不变形（只有取景变化），起点终点与缩略图/头图严丝合缝
- 返回是前进的严格倒放；连续快速点击不会错乱
- 不支持视图过渡的浏览器切换依然可用；开启「减少动态效果」后为瞬间切换
