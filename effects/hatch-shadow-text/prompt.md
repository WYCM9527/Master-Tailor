## 效果描述

一行大标题，其中的关键词带一层特别的投影：不是实心的、也不是模糊的，而是由细密的 45° 斜线排成的——像版画或老海报上手工画的阴影，向右下方错开一点。仔细看，斜线纹理还在沿对角线缓缓流动，让这块静态的阴影有了呼吸。关键词可以设成斜体。投影颜色、偏移量、斜线密度、流动速度、字号都可调。

## 实现提示

关键词包在一个 `position: relative` 的 span 里，把文字同时写进 `data-text` 属性。用 `::after` 伪元素 `content: attr(data-text)` 复制一份文字，绝对定位向右下偏移 {{offset}}（`top` 与 `left` 同值）、z-index 放到本体之下。伪元素的背景用 `linear-gradient(45deg, transparent 45%, 投影色 45%, 投影色 55%, transparent 0)` 平铺、`background-size` 取 {{hatch}}（宽高同值），再 `background-clip: text; color: transparent` 把纹理裁进字形。流动用关键帧 `background-position: 0 0 → 100% -100%`，一轮时长取 {{speed}}，线性无限循环。

## 完成后请检查

- 投影是清晰的斜线纹理而非实色块，与本体错开一点、露出线条
- 纹理在缓慢流动；换字号时投影偏移和线密度等比例跟随（都用 em）
- 系统开启「减少动态效果」时纹理静止
