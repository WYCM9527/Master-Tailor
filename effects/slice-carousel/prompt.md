## 效果描述
一张图铺满容器。切换的瞬间旧图被「切」成若干条等宽竖片，奇数条向上、偶数条向下依次滑走，相邻条按切片错开延迟错开，像百叶窗一片片打开，露出早已垫在下面的新图。按自动播放间隔自动切换、首尾循环，悬停暂停；底部一排强调色分页圆点。

## 实现提示
切片是切换瞬间动态创建的一层 div 条——每条的 background-image 是旧图、background-size 等于容器尺寸、background-position 按条序偏移，正好拼回整图；加 transition-delay 递增再统一加位移类，动画完拆掉这层。
- 容器宽 `min(720px, 92vw)`，`aspect-ratio` 取 {{ratio}}，圆角 {{rounded}}，`overflow: hidden`，底 #14151f。幻灯片绝对定位铺满、`opacity: 0`，当前张 1，不做过渡（切换瞬间直接换底图，新图一开始就在切片层下面）。标题条贴底 `padding: 42px 20px 14px`，白字 18px / 600，底 `linear-gradient(transparent, rgba(0,0,0,0.62))`。
- 切片层 `inset: 0; display: flex; z-index: 2; pointer-events: none`，{{slices}} 条 `flex: 1 1 0` 竖条：`background-size = 容器宽 容器高`、`background-position = −(序号 × 容器宽 ÷ {{slices}}) 0`、`no-repeat`，第 i 条 `transition-delay = i × {{stagger}}`。
- `transition: transform {{duration}} cubic-bezier(0.45, 0, 0.55, 1), opacity {{duration}} ease`；隔两帧再统一加类（否则不触发过渡）：奇数序条 `translateY(-104%)`、偶数序条 `translateY(104%)`，opacity 降到 0.4。`{{duration}} + {{slices}} × {{stagger}}` 后再等约 60ms 拆层解锁，进行中忽略新切换。
- 圆点居中距底 10px、间距 7px，8px `rgba(255,255,255,0.4)`，当前项 {{accent}} 并 `scale(1.25)`。「减少动态效果」时不建切片层。

## 技术要求补充
- 支持鼠标拖拽和触摸滑动切换（用 Pointer Events 统一处理，滑动超过约 50px 判定翻页）
- 支持键盘操作：容器可聚焦，← / → 切换；聚焦或悬停时暂停自动播放
- 无障碍：容器带 role="region" 和 aria-roledescription="carousel"，每张带 aria-label="第 N 张，共 M 张"
- 页面切到后台时暂停自动播放；系统开启「减少动态效果」时不自动播放、切换为瞬间完成

## 完成后请检查
- 切片拼合处严丝合缝（静止时看不出条状），滑走时条与条交替方向、依次错开
- 条数与错开延迟符合参数；切换过程中新图不闪烁
- 自动播放、拖拽、键盘、圆点正常
