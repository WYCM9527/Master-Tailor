## 效果描述
一沓像随手放在桌上的照片：每张都带一个固定的随机小角度，叠出真实的「纸堆感」，纸堆松散度越大越歪。按自动洗牌间隔顶上那张朝随机一侧甩出去，方向、飞出距离和旋转角度每次都略有不同，像有人在慢慢洗一沓牌；甩走的照片回到堆底，永远轮不完。往回翻时堆底的照片飞回顶层。右上角强调色数字角标显示当前第几张，照片底部带标题条。

## 实现提示
照片全部绝对定位叠放、不动 DOM，按「离顶张几层 off」重算 transform / opacity / z-index；每张固定一个伪随机角度 `sin(i × 971) × 5` 度；甩出用 translate + rotate + opacity 过渡，结束时它已在队尾的隐藏位。
- 容器宽 `min(420px, 82vw)`、`aspect-ratio: 4 / 5`，`cursor: grab`。照片 `inset: 0`，圆角 {{rounded}}，`box-shadow: 0 18px 44px rgba(0,0,0,0.45)`，`transition: transform {{duration}} cubic-bezier(0.33, 1, 0.68, 1), opacity {{duration}} ease`。标题条贴底 `padding: 42px 18px 14px`，白字 17px / 600，底 `linear-gradient(transparent, rgba(0,0,0,0.62))`。
- 层叠露 3 层：off = 0 `rotate(角度 × 0.3)`；off = 1…3 `translateY(off × 12px × {{stackDepth}}) rotate(角度) scale(1 − off × 0.04 × {{stackDepth}})`，第 3 层 opacity 0.55；再往后 `translateY(48px × {{stackDepth}}) scale(1 − 0.15 × {{stackDepth}})` 且透明；z-index 按 off 递减。
- 下一张：顶张 `translate(±60%, −(10…24)%) rotate(±(10…24)deg)`（方向随机、符号一致）淡出，序号 +1 后隔一帧重排。上一张：新顶张先无过渡放到 `translate(-55%, -6%) rotate(-10deg)`、透明、z 置顶，强制 reflow 后恢复过渡再重排（从左上飞回）。
- 数字角标 `top: -34px; right: 0; padding: 3px 12px`，胶囊，底 `rgba(10,10,15,0.6)`，字色 {{accent}}，12.5px 等宽字。

## 技术要求补充
- 支持鼠标拖拽和触摸滑动切换（用 Pointer Events 统一处理，滑动超过约 50px 判定翻页）
- 支持键盘操作：容器可聚焦，← / → 切换；聚焦或悬停时暂停自动播放
- 无障碍：容器带 role="region" 和 aria-roledescription="carousel"，每张带 aria-label="第 N 张，共 M 张"
- 页面切到后台时暂停自动播放；系统开启「减少动态效果」时不自动播放、切换为瞬间完成

## 完成后请检查
- 静止时纸堆有自然的错位歪斜；每次甩出的方向和角度有随机变化、不机械重复
- 洗一整圈后顺序不乱；往回翻是「飞回来」
- 拖拽、键盘、悬停暂停、数字角标正常
