## 效果描述

漆黑的深空里散落着许多卡片，观者像乘着飞船不停向前：远处的小卡片先是隐隐浮现，慢慢长大，随后越来越快地掠过身边、从画面边缘消失；身后的深处又有新的卡片浮出来，源源不断。卡片各自散落在画面的上下左右，带着一点点随意的歪斜，像穿越一片由照片组成的星云。不需要任何操作，也没有尽头。

## 实现提示

- 舞台 `.stage { perspective: 800px; transform-style: preserve-3d }` 铺满全屏，近处的卡自动盖住远处的；不要在舞台上写 `overflow: hidden`（会强制拍平、失去深度排序），裁切交给 body。
- 卡片总数 {{count}}（上限 24），横版 4:3，宽 {{cardWidth}}，圆角 {{radius}}，`position: absolute; left: 50%; top: 50%`，图片 `object-fit: cover; display: block`，加载前底色 #16161d，`will-change: transform, opacity`。按序循环取图，相邻起飞的两张卡不同图。
- 生成时用固定种子的线性同余伪随机数（a = 1664525，c = 1013904223，模 2^32；横向、纵向、倾斜各用一条独立序列，种子分别 42、1337、7——同一条序列相邻值有相关性，会让卡片排成一条斜线）给每张卡三个量并写成自定义属性：横向 `--x = 符号 × (0.2 + 0.8u) × {{spread}}vw`、纵向 `--y` 同理用 vh（幅度从 0.2 起，避开画面正中央，卡片不会正撞镜头）；倾斜 `--rz` 在 ±8deg 内，{{tilt}} 关闭时为 0deg 但仍消耗一次随机数，保证开关倾斜不改变位置。同一份参数每次重建布局一致。
- 关键帧 `fly`：`0% { transform: translate(-50%, -50%) translate3d(var(--x), var(--y), calc(-1 * {{depth}})); opacity: 0 } 12% { opacity: 1 } 90% { opacity: 1 } 100% { transform: translate(-50%, -50%) translate3d(var(--x), var(--y), 260px); opacity: 0 }`，两端变换函数顺序一致才能平滑插值；`animation: fly {{speed}} linear infinite`。深度线性推进，透视自然产生「先慢后快」的加速感。
- 卡 i 的 `animation-delay: calc(-i / N × {{speed}})`，N 张卡相位均匀，任何时刻深度方向都排满，首尾无缝。
- `@media (prefers-reduced-motion: reduce)` 下 `animation: none`，并给卡片默认 transform：第 i 张放在深度 −{{depth}} + (i / N) × ({{depth}} + 260px) 处，得到一片由远及近散开的静止卡片。
- 后台暂停：监听 visibilitychange，页面隐藏时把所有带动画元素的 animation-play-state 置为 paused。

## 完成后请检查

- 近处卡片盖在远处卡片之上（深度排序正确），卡片飞到眼前时先淡出再回到最深处，不出现闪跳
- 同一份参数每次重建布局一致，卡片没有正撞镜头把整屏盖住
- 页面切后台时暂停，系统开启「减少动态效果」时静止
