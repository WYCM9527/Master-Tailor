## 效果描述
图片裁成一排等高的竖条并排站着，像一架手风琴。当前展开的那条最宽、图片保持彩色，标题横排在左下角并带一条强调色下划线；其余条被挤成窄边，图片压暗，标题竖排贴在条内。鼠标摸到哪条（或点按哪条）哪条就展开，宽度按展开倍率和展开时长平滑变化；不碰它时按自动轮流展开间隔轮流展开下一条。

## 实现提示
宽度变化用 flex-grow 过渡实现：展开条 flex-grow = 展开倍率，其余为 1；标题横竖排用 writing-mode 切换；间隔为 0 时不启动自动轮换。
- 结构：`display: flex` 容器居中，尺寸 `min(780px, 94vw) × min(400px, 60vh)`，`gap` 取 {{gap}}；每条 `flex: 1 1 0; overflow: hidden`，圆角取 {{rounded}}；初始第 1 条展开（`flex-grow` 取 {{grow}}）。
- 过渡：`transition: flex-grow 展开时长 cubic-bezier(0.33, 1, 0.68, 1)`，展开时长取 {{duration}}。
- 图片：绝对定位铺满、`object-fit: cover`；收起态 `filter: brightness(0.55) saturate(0.85)`，展开态 `filter: none`，滤镜同样以展开时长过渡。
- 标题：绝对定位 `left: 14px; bottom: 14px`，白字 15px、600 字重、字距 0.08em、不换行，`text-shadow: 0 1px 8px rgba(0,0,0,0.6)`；收起态 `writing-mode: vertical-rl`，展开态 `horizontal-tb`、字号 19px、`padding-bottom: 4px`、`border-bottom: 3px solid` 强调色（{{accent}}）。writing-mode 不能渐变，用 `transition: writing-mode 0s linear 展开时长` 把翻转延后到宽度过渡结束。
- 交互：每条同时监听 `mouseenter` 与 `pointerdown` 触发展开；自动轮换用 `setInterval`，间隔取 {{interval}}。

## 技术要求补充
- 支持鼠标拖拽和触摸滑动切换（用 Pointer Events 统一处理）
- 支持键盘操作：容器可聚焦，← / → 切换；聚焦或悬停时暂停自动播放
- 无障碍：容器带 role="region" 和 aria-roledescription="carousel"，每张带 aria-label="第 N 张，共 M 张"
- 页面切到后台时暂停自动播放；系统开启「减少动态效果」时不自动播放、切换为瞬间完成

## 完成后请检查
- 悬停 / 点按任意条即展开，其余条平滑挤扁；展开倍率与参数一致
- 收起条的标题竖排可读、展开条的标题横排带强调色下划线
- 自动轮流展开工作正常，鼠标在组件上时暂停；键盘 ← / → 可切换展开项
