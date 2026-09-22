# 内容来源与收录台账

> 更新：2026-09-22 · 站内 268 个效果（本日删去「玻璃图标」glass-icons、「缩放淡入转场」zoom-fade、「滚动接力长页」scroll-handoff、「滚动换底长页」scroll-page-fade）。回答两件事：**已经从哪些源收了什么、为什么不收其余的**，以及**下一批还能去哪找**。加新效果或评估新来源前先读这里，避免重复评估同一批组件。

## 许可口径（红线）

`meta.json` 的 `source.kind` 三档，决定了写效果前能不能打开源码：

| kind                 | 含义                                                                | 适用来源                                                                                                                                       | `source` 字段要求                                               |
| -------------------- | ------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| `original`           | 本站原创                                                            | 表单控件、多数转场与轮播、站内自设的形态                                                                                                       | 可不填 name                                                     |
| `reference`          | 读过 MIT / BSD / CC0 实现后 clean-room 自写，算法与默认值可对齐源站 | Magic UI、Animata、Hover.css、Uiverse galaxy、Codrops、经典技法文章                                                                            | `name` + `license`（写「MIT（思路参考，代码自写）」一类）       |
| `visual-inspiration` | 只看效果不读代码，默认值目测对齐                                    | Vue Bits / React Bits（MIT + Commons Clause，禁再分发组件）、Aceternity UI（站点条款禁复制、源码不公开）、Keynote / apple.com / Netflix 等产品 | `name`（写「XX 的 YY 一类效果」），`license` 写「未使用其代码」 |

- **不碰**：Origin UI（新代码 AGPL）、bg.ibelick（无许可）、Hover.dev（闭源）。
- **源站资产不搬**：雨滴玻璃的水珠精灵为程序生成（源仓库是 PNG）、LED 点阵牌字库自绘 5×7、Vue Bits 的 DarkVeil 由硬编码神经网络权重驱动、无法 clean-room → 跳过。
- 命名与实现均为本站自有；源站行为与其文档不符时按源码实际行为重写并改名（例：Codrops `3DLettersMenuHover` 实为逐字 3D 翻转 → `flip-letters-menu`；`RapidImageHoverMenu` 实为单图跟随光标甩动 → `menu-hover-swing-image`）。
- 历史遗留：最早从 Vue Bits 收的 109 个 `visual-inspiration` 效果 `source.name` 为空（当时只按 kind 标注）。补署名是可选清理项，不影响许可立场。

## 按来源统计

| 来源                   | 授权 → 处理                               | 站内数量 | 收录批次                                           |
| ---------------------- | ----------------------------------------- | -------: | -------------------------------------------------- |
| Vue Bits               | MIT + Commons Clause → visual-inspiration |      109 | 批一～批十（含批六/七重做、批八/九新收、批十补齐） |
| 原创                   | —                                         |       35 | 转场、轮播、表单控件等                             |
| Aceternity UI          | 自有许可 → visual-inspiration             |       27 | 批十二                                             |
| Codrops                | MIT → reference                           |       26 | 批十五、十五·附、十六、备选                        |
| 其他通用技法 / 产品    | 见下                                      |       21 | 零散                                               |
| Magic UI               | MIT → reference                           |       19 | 批十一                                             |
| Uiverse（galaxy 仓库） | MIT → reference                           |       15 | 批十四                                             |
| Animata                | MIT → reference                           |       15 | 批十三、批十八                                     |
| Hover.css              | MIT → reference                           | 5 个合集 | 批十三、批十八                                     |

## 各来源记录

### Vue Bits（109）

源站 137 个组件。2026-09-11 对当时已同步的 67 个逐对比对评级：A 忠实 7、B 略简化 32、C 大打折扣 18。

- C 级 18：15 个按源站高保真重做或补齐（反重力粒子、方块波纹网格、球池背景、点场波纹、点阵网格聚光、气泡菜单、文件夹展开、字符洗牌进场、浮线背景、扫描线网格、雷达扫描、镜面高光按钮、滚动浮起标题、文字光标拖尾；聚光边框卡片映射有误 → 另收「卡面聚光」）；1 个是渲染 bug（扫光文字后半周期消失）已修；**2 个有意分道不改回**：「射灯」是本站迭代过四轮的作品（源站 LightPillar 中央扭转光柱另收为「扭转光柱」），「全息反光卡」源站需调用摄像头、iframe 里不适合。
- B 级 32：批十按差距要点逐个补齐（弧线循环拖拽、磁力线阵取向、翻牌进位方向、粘液导航液珠、弹性滑块端点、融球胶体、靶心光标、流动菜单、贴纸撕角、像素翻转显形、果冻光标、十字光标、电光边框、像素雪、图片拖尾、像素拖尾、彩光网格卡、滚速跑马灯、逐字弹入、靠近加粗、聚焦框词、毛边抖动字、悬停乱序字、环形旋字、词语翻转、解密文字、滚动逐词显形、3D 倾斜卡片、魔法便当格、胶囊导航、错落展开菜单、文字坠落堆叠）。
- 未同步的 45 个分两批新收：批八 CSS/JS 20、批九 GLSL 23（原生 WebGL 重写 three.js / ogl 着色器）；另 GradualBlur 后随「背景·滚动触发」子类一起删除。
- 2026-09-17 起又发现 4 个观感与源站不齐的效果已重做：雨滴玻璃（Codrops）、灯管标题（Aceternity）、复古透视网格（Magic UI）、球池背景（Vue Bits）。**批九的 23 个 GLSL 尚未逐一截图对照源站**，是下一轮视觉复查的对象。
- 不收：三维场景 / 流体模拟 8（Beams · LiquidEther · SplashCursor · DomeGallery · InfiniteMenu · ModelViewer · ASCIIText · FlyingPosters，单文件零依赖难以承载）；表单控件 / 进场工具 5（CurvedInput · Stepper · AnimatedContent · FadeContent · Noise）；DarkVeil（权重）；已有等价 12（Aurora / Grainient / GradientText / GlitchText / TextType / LogoLoop / StarBorder / Ribbons / Carousel / Stack / ScrollStack / CircularGallery）。

### Magic UI（19）

79 个注册组件（2026-09-14 核对）：34 站内已有等价、23 是机壳 / 产品 UI / 静态底纹 / 依赖第三方数据，收 19：复古透视网格、闪烁方格（Flickering Grid + Animated Grid Pattern 合一）、边缘光束隧道、文字融变、连线光束、彩纸礼花、放大镜（与 Aceternity Lens 合并）、主题切换扩散、星光文字、线影文字、3D 标签云、像素渐显图、荧光笔标注、圆点扩散按钮、环形进度、脉冲同心环，以及看过源码后追加的彩带揭示文字（Dia Text Reveal）与背光晕染（Backlight）。跳过 Kinetic Text / Glyph Matrix / Floating 3D Particles（与站内靠近加粗文字 / 字母故障矩阵 / 漂浮粒子云近似）。

不收（节选）：Globe（cobe）、Dotted Map、Tweet Card、Hero Video Dialog、Code Comparison、File Tree、Terminal、机壳类、Bento Grid、Avatar Circles、静态底纹 Pattern 系列、Scroll Progress、Pulsating / Subscribe / Rainbow Button、Comic / Video Text。

### Aceternity UI（27）

约 90 个免费组件（付费 Pro 区块不碰），全部按 visual-inspiration 处理。收 26 + 早期的 3D 倾斜卡片：背景 9（灯管标题、路径光束、光束撞击、点阵跟随高亮、格子涟漪、鼠标视差层、3D 图墙、云层飘移、粒子涡旋）· 文字与滚动 8（描边渐变悬停字、波纹扭曲字、曲线填充字、翻牌字板、滚动描迹光束、滚动描线、多步加载、滚动隐现导航）· 交互 9（光标遮罩揭示、像素扭曲图、卡片文字揭示、方向感知悬停、输入粒子消散、色散倾斜图、乱码悬停卡、滚动视差行、字符画图）。

不收：约 27 个站内已有等价（3D Card / Wobble Card、Magnetic Button、Typewriter、Text Generate、Meteor、Spotlight、Glare Card、Moving Border、Glowing Effect、Infinite Moving Cards、Floating Dock、Encrypted Text、Card Stack、Sticky Scroll Reveal、Aurora、Wavy Background、Shooting Stars、Background Boxes、Layout Text Flip、Noise Background、Gooey Input 等）；约 27 个区块 / 表单 / 机壳 / 依赖地理数据或摄像头（Hero / Pricing / FAQ 区块、Signup Form、Tabs、Modal、Sidebar、Macbook Scroll、World Map、Webcam Pixel Grid 等）。

### Animata（15）

约 200 个组件，60 余个是 widget / skeleton / graphs 类产品 UI，文字类多为普通进场变体。批十三收 10：群鸟聚散、LED 点阵牌、花瓣展开菜单、揭幕预加载（对开 / 竖条合一）、液态标签页、文字炸裂、模糊色团、照片扇开揭示、悬停滚字、开门揭图；批十八再收 5：镜面切片文字、模糊叠卡、变形图窗标题、邻居失焦导航、扫描线高亮。跳过：斐波那契线（源码已不在仓库）、快照相册（仅悬停放大）、扇开卡组 / 3D 环绕物件（与弹跳卡片扇 / 轨道图片环近似）；21 个站内已有等价（Shooting Stars、Interactive Grid、Border Trail、Marquee、Trailing Image、Counter、Cycle Text、Glitch / Jitter Text、Tilted Card、Shimmer Sweep、Dock、Card Stack、Staggered Card 等）。

### Hover.css（5 个合集）

单个悬停效果太薄，合成带 `select` 的合集：悬停效果合集（grow / float / wobble / buzz / sweep / underline / shutter / curl 8 种）、背景过渡 10 种、边框过渡 10 种、2D 变换 13 种、阴影气泡 10 种。Hover.css 已收完。

### Uiverse galaxy（15）

站点按点赞排序的页面拒绝抓取，改为在 galaxy 仓库（718 个 loader / 1231 个按钮，README 明示全部 MIT、署名非必需）按形态取样后自写。加载 10：三点跳动、条形均衡器、双环交错、方块翻转、粘液液滴、沙漏翻转、DNA 螺旋、俄罗斯方块、打字加载、牛顿摆；按钮 5：霓虹描边、液体填充、3D 按压、拆字上翻、边框跑光。仓库只有这两类，第二轮取样价值不高。

### Codrops（26）

组织 345 个仓库（licensing 页已核：可下载演示均 MIT）。2026-09-14 筛出 92 个效果类仓库逐个检测依赖：无依赖 / 纯 CSS 12、anime.js 仅补间 8、GSAP 仅补间 45（补间改 CSS transition / WAAPI，拆字站内已有自写）、GSAP ScrollTrigger + Lenis 平滑滚动 25（滚动进度自写映射，不复现平滑滚动）、three.js / PixiJS / Blotter / mo.js / MIDI 重依赖 5（跳过，唯一例外 RainEffect 是原生 WebGL 可移植）。得 28 个候选并全部收录；其中 3 个后被删除（见下），加早期的 slice slideshow 技法共 26。

不收：重依赖 7（BalloonButton / WebGLBlobs / Interactive3DMallMap / LiquidDistortion / TextDistortionEffects / Animocons / MusicalInteractions）；jQuery 时代插件与整页模板（PageTransitions、SidebarTransitions、BookBlock、Slicebox、Baraja 等）；GSAP Flip 驱动的整页布局切换（ScrollBasedLayoutAnimations、GridToSlider、MenuToGrid 等，复现价值低于成本）；约 27 个站内已有等价（MagneticButtons、TiltHoverEffects、ImageTrailEffects、CircularTextEffect、MarqueeMenu、GooeyCursor、ClickEffects、TypeShuffleAnimation、StickySections、3DCarousel 等）。

### 原创（35）与其他（21）

- 原创：表单控件 5（日夜切换开关、液态开关、勾选动画、单选胶囊组、浮动标签输入框）、多数页面转场、多数轮播形态、以及站内自设的效果。
- 其他 21 是通用交互或经典技法，按其性质分别标 reference / visual-inspiration：Keynote 转场（溶解、立方体、切页、圆形揭示、神奇移动）、apple.com 长页 / 分节换底、macOS 启动台、Netflix 海报行、Cover Flow、Swiper / Glide 的轮播形态、particles.js 粒子连线、iCSS glitch 技法、Ken Burns、Intro to CSS 3D Transforms 的 carousel 一章、CSS sticky 堆叠等。

## 已删除的效果

2026-09-17，共 4 个：

- `gradual-blur`（边缘渐进模糊）、`morphing-blob-scroll`（滚动形变色块）、`page-reflection-scroll`（页面倒影）：背景分类取消「滚动触发」子类（`BACKGROUND_SUBS` 不再含 `scroll`），三者随之删除。
- `clip-window-menu`（裁切窗菜单）：形态价值不足，删除。

## 分类决策记录

| 决策                                     | 内容                                                                                                                       |
| ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| 背景不收滚动触发                         | 背景效果的子类只有自动 / 鼠标交互 / 点击；滚动驱动的背景归「页面转场·滚动接力」或不收                                      |
| 表单控件归「按钮与交互」                 | 单个控件（开关 / 复选框 / 输入框）不单设分类；累计已到 5 个的阈值，**再加一个就该新增「表单控件」分类并把现有 5 个迁过去** |
| 「鼠标交互」分类（`canvas`）只放光标本体 | 果冻光标、十字瞄准线等 7 个纯光标效果；全屏氛围类（融球、粒子星空等）归背景效果                                            |
| 多图 / 卡片墙归 `showcase/wall`          | 3D 图墙、斜向图墙、鼠标视差层从背景移入「多卡/图展示·图墙」                                                                |
| 薄库合成合集                             | Hover.css、链接下划线、图说悬停、线条菜单等单个太薄的形态用一个 `select` 参数切多种                                        |

## 候选池（未启动）

- **MIT 安全源，尚未核对目录与去重**：Cult UI（开源部分）、Motion-Primitives、HyperUI、KokonutUI、UI Layouts、fancycomponents、smoothui。
- **薄子类待补或合并**：`showcase/compare` 1 个、`button/idle` 1 个、`text/click` 2 个、`nav/scroll` 2 个、`transition` 全类 11 个。侧栏里点开只有一两张卡，要么补到 4–5 个，要么合并子类。
- **视觉复查**：批九 GLSL 23 个对照源站截图逐个过一遍（2026-09-17～09-21 重做的 4 个观感不齐的效果都是这类「算法照搬、观感没对齐」）。
