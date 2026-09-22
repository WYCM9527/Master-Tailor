## 效果描述
页面里需要进场的元素初始是透明的，并停在原位下方一点。随着滚动进入视野时，它们淡入并上移回原位，缓动先快后慢、落定干脆。同一组相邻元素（如一排卡片）按错开延迟依次进场，形成「一个接一个浮上来」的节奏。开启只进场一次时，播过就保持；关闭时每次滚回视野都会重新播放。

## 实现提示
给目标元素统一加一个类（如 .reveal，内含 opacity/transform 初始态与 transition），用 IntersectionObserver 进入视口时加 .in 类；错开延迟用 CSS 变量 --i 乘以延迟步长实现。

- 初始态：`.mt-reveal { opacity: 0; transform: translateY({{distance}}) }`；`transition: opacity {{duration}} ease-out, transform {{duration}} cubic-bezier(0.22, 1, 0.36, 1)`（easeOutQuint：先快后慢、落定干脆），`transition-delay: calc({{stagger}} * var(--mt-i, 0))`；进场态 `.in { opacity: 1; transform: none }`。
- 错开：同组元素在标签上内联 `style="--mt-i: n"`，第一个不写（默认 0）、标题 1、三张卡依次 2、3、4。
- 观察器：`new IntersectionObserver(cb, { root: 滚动容器, threshold: 0.18 })`——元素露出 18% 才触发；`isIntersecting` 时加 `.in`，「只进场一次」开启则随即 `unobserve`；关闭时离开视口就移除 `.in`，滚回来重播。真实页面里 root 用 null（视口）即可。
- 演示页（可换成自己的内容）：滚动容器 `height: 100vh; overflow-y: auto; scroll-behavior: smooth; padding: 0 clamp(16px, 6vw, 64px)`，文字 #f2f3f8；两个 `section`（`padding: 9vh 0`）各含 13px、`letter-spacing: 0.2em`、颜色 {{accent}} 的小标签，30px 标题，三列 `gap: 14px` 卡片（`padding: 20px 16px; border-radius: 12px; background: #16182490; border: 1px solid #ffffff14; font-size: 14px; line-height: 1.7; color: #aab0c0`）；段间用 `height: 36vh` 的灰字（#6d7285、13px）提示区隔开，保证首屏之下有内容可滚。
- 「减少动态效果」：`.mt-reveal { opacity: 1; transform: none; transition: none }`，内容直接可见。

## 完成后请检查
- 往下滚动时元素按「淡入 + 上移」进场，同组元素依次错开，参数与设置一致
- 首屏本来就可见的元素不会闪一下再进场（初始就该是可见的或立即触发）
- 系统开启「减少动态效果」时所有内容直接可见，无位移动画；进场不引起横向滚动条
