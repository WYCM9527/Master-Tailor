## 效果描述
一个立体翻转的轮播：容器宽高比 {{ratio}}、圆角 {{rounded}}，展示这些图片——{{slides}}。切换时旧图沿自己的左棱向左后方转出（像立方体的面被转走），新图同时沿右棱从右后方转入，两个面一转一接（时长 {{duration}}，带 3D 透视 perspective 约 1100px），像在转动一个立方体。每 {{interval}}自动切换（0 为不自动播放），悬停暂停，无缝循环。分页器样式 {{pager}}（强调色 {{accent}}），「显示左右箭头」为 {{arrows}}。

实现提示：给视口设 perspective；进入面 transform-origin 设为 left center 并从 translateX(100%) rotateY(72deg) 转到原位，离开面 transform-origin 设为 right center 转向 translateX(-100%) rotateY(-72deg)，配透明度渐变，就有立方体折面的效果。

## 技术要求补充
- 支持鼠标拖拽和触摸滑动切换（用 Pointer Events 统一处理，滑动超过约 50px 判定翻页）
- 支持键盘操作：容器可聚焦，方向键切换上一张 / 下一张；聚焦或悬停时暂停自动播放
- 无障碍：容器带 role="region" 和 aria-roledescription="carousel"，每张幻灯片带 aria-label="第 N 张，共 M 张"
- 页面切到后台时暂停自动播放；系统开启「减少动态效果」时不自动播放、切换为瞬间完成

## 完成后请检查
- 切换有明显的 3D 纵深（面是「转」进来的不是平移），转动过程中两面在棱线处基本贴合
- 翻转不露穿帮：看不到背面文字镜像（backface-visibility: hidden）
- 自动播放、拖拽、键盘、分页器行为正常

## 放在哪
适合需要一点炫技感的图片位：产品发布页、活动宣传位；不建议一页放多个立方体轮播
