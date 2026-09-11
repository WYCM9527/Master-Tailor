## 效果描述

给页面加一个「像素抖动波」的全屏背景：单色噪浪层层翻滚，但整幅画面被有序抖动（dither）量化成少量色阶和粗像素格，像复古印刷品或老游戏机里的渐变。开启鼠标凹陷时，鼠标移到哪里，哪里的浪被压出一片凹陷。颜色、速度、频率、色阶数、像素粒度与凹陷半径见参数。

## 实现提示

- 用一张全屏 WebGL canvas；画面 = 「三重嵌套 fbm 噪浪」+「Bayer 有序抖动量化」两步。
- 噪浪：经典 Perlin 2D（cnoise）做基元，fbm 叠 8 层、每层取 `abs(cnoise)`（出山脊线），频率乘 frequency、幅度乘 amplitude；最外层用 `fbm(p - fbm(p + fbm(p - t*speed)))` 三重嵌套，浪层会互相咬合翻滚而不是单向平移。
- 抖动：8×8 Bayer 阈值矩阵不用查表，可用 2×2 递归公式——`bayer2(a) = fract(a.x/2 + a.y*a.y*0.75)`，`bayer4(a) = bayer2(a/2)*0.25 + bayer2(a)`，`bayer8(a) = bayer4(a/2)*0.25 + bayer2(a)`。量化：亮度加 `(bayer8(cell) - 0.25) / (色阶数-1)` 扰动后 `floor(x*(n-1)+0.5)/(n-1)`。
- 像素粒度 = 多个物理像素共用一格 Bayer 坐标（`floor(fragCoord / pixelSize)`）；canvas 不要乘 devicePixelRatio，1 CSS 像素对 1 渲染像素，格子才有颗粒感。
- 鼠标凹陷：`f -= 0.5 * (1 - smoothstep(0, radius, dist))`，鼠标位置 JS 侧每帧 5% 平滑趋近。

## 技术要求补充

- WebGL1 + 全屏大三角形；Perlin 用公域 webgl-noise 实现（mod289/permute 版本）。
- canvas 加 `image-rendering: pixelated`，缩放时保持硬像素边。
- 页面切后台暂停时间累计。

## 完成后请检查

- 灰阶过渡处能看到清晰的 Bayer 网纹（斜向交叉的点阵），不是平滑渐变
- 浪是多层咬合翻滚，改变「层次强度」能看到层数变化
- 开启系统「减少动态效果」后浪停住，抖动纹理仍在
