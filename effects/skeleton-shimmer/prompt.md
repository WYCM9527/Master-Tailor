## 效果描述
一组内容占位骨架：左上一个圆形头像位，右侧一条标题条和几行文字条（最后一行短一截），下方一块大图占位。所有骨架块是同一种浅灰底色，表面有一道斜向的扫光高光带，按扫光速度从左到右周期性扫过，传达「内容正在加载」。扫光在所有块上同步进行，节奏统一。

## 实现提示
骨架块背景 = 骨架底色 + 一条 linear-gradient 高光带，background-size 放大后用 keyframes 平移 background-position；所有块共用同一个动画，天然同步。
- 布局：容器宽 `min(380px, 80vw)`，`grid-template-columns: 56px 1fr; gap: 14px 16px`；头像 56×56 圆形、`grid-row: span 2`；标题条高 18px、宽 55%；文字行组 `gap: 10px`，{{rows}} 行、每行高 12px，最后一行宽 62%；大图块跨两列，高 120px，`margin-top: 6px`。
- 每块圆角 {{rounded}}，`background: linear-gradient(100deg, transparent 32%, {{highlight}} 50%, transparent 68%) {{base}}`，`background-size: 220% 100%`，起点 `background-position: 120% 0`。
- `@keyframes sweep { to { background-position: -120% 0 } }`，`animation: sweep 周期 ease-in-out infinite`，周期 = 1.6s ÷ 扫光速度倍率（{{speed}}）：高光带从左侧外扫出右侧外，首尾都是纯底色所以不跳；各块同一条 animation、不加 delay 即同步。「减少动态效果」时 `animation: none; background-position: 50% 0`。

## 完成后请检查
- 骨架布局与描述一致（头像 + 标题 + {{rows}} 行文字 + 图块），最后一行明显更短
- 扫光方向从左到右、循环无跳变，颜色与速度符合参数
- 容器带 role="status" 与 aria-label；系统开启「减少动态效果」时扫光停止、保留静态骨架
