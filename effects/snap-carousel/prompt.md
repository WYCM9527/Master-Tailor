## 效果描述
一排卡片排在一个可以横向滚动的容器里，松手后自动吸附到整张卡居中。拖动、惯性、吸附手感全部是浏览器原生的，顺滑程度和系统相册一样，一次猛滑最多翻一张。底部强调色圆点随滚动位置自动高亮，点圆点平滑滚到那张。本效果不自动播放，由用户驱动。

## 实现提示
主体是纯 CSS（overflow-x + scroll-snap + scroll-behavior: smooth）；只需十几行 JS——圆点点击用 scrollIntoView（inline 'center'、block 'nearest'，千万别用锚点，会把整页滚到顶部），滚动位置同步圆点用 IntersectionObserver。聚焦滚动容器后按 keydown 方向键滚动、pointerdown 拖动，都是浏览器原生行为，无需自己写。

## 技术要求补充
- 主体必须用纯 CSS scroll-snap 实现，不要用 JS 计算位移；JS 只做圆点同步与跳转
- 无障碍：容器带 role="region" 和 aria-roledescription="carousel"，每张带 aria-label="第 N 张，共 M 张"；滚动容器 tabindex="0" 让键盘用户聚焦后用方向键滚
- overscroll-behavior-x: contain 防止滚到头带动整页；系统开启「减少动态效果」（prefers-reduced-motion）时 scroll-behavior 改为瞬时

## 完成后请检查
- 拖动松手后总有一张卡端正地吸附在中间，一次猛滑不会跳过多张
- 圆点随滚动实时高亮、点击能滚到对应卡且页面本身不跳动
- 触摸板横扫、触屏拖动、聚焦后方向键都能滚
