# 内容来源与收录台账

> 更新：2026-10-10 · 站内 304 个效果、9 个一级分类（本日「进度条」新增 23 个、子类改按形态，见「进度条（23）」与「分类决策记录」；10-09 删去「滚动描迹光束」「滚动描线」「滚入列表」「色块揭示进场」，历次删除见文末「已删除的效果」，同日「页面转场」「加载与进场」并入新一级分类「加载」）。回答两件事：**已经从哪些源收了什么、为什么不收其余的**，以及**下一批还能去哪找**。加新效果或评估新来源前先读这里，避免重复评估同一批组件。

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
- 历史遗留：最早从 Vue Bits 收的 `visual-inspiration` 效果（现存 107 个）`source.name` 为空（当时只按 kind 标注）。补署名是可选清理项，不影响许可立场。

## 按来源统计

| 来源                   | 授权 → 处理                               | 站内数量 | 收录批次                                           |
| ---------------------- | ----------------------------------------- | -------: | -------------------------------------------------- |
| Vue Bits               | MIT + Commons Clause → visual-inspiration |      107 | 批一～批十（含批六/七重做、批八/九新收、批十补齐） |
| 原创                   | —                                         |       36 | 转场、轮播、表单控件等                             |
| Aceternity UI          | 自有许可 → visual-inspiration             |       25 | 批十二                                             |
| 进度条专题             | 来源混合，见「进度条（23）」              |       23 | 2026-10-10 进度条批一～批五                        |
| animos                 | 闭源 SaaS → visual-inspiration            |       16 | 批十九（2026-09-22，自动播放图片陈列）             |
| Codrops                | MIT → reference                           |       25 | 批十五、十五·附、十六、备选                        |
| 其他通用技法 / 产品    | 见下                                      |       18 | 零散                                               |
| Magic UI               | MIT → reference                           |       19 | 批十一                                             |
| Uiverse（galaxy 仓库） | MIT → reference                           |       15 | 批十四                                             |
| Animata                | MIT → reference                           |       15 | 批十三、批十八                                     |
| Hover.css              | MIT → reference                           | 5 个合集 | 批十三、批十八                                     |

## 各来源记录

### Vue Bits（107）

源站 137 个组件。2026-09-11 对当时已同步的 67 个逐对比对评级：A 忠实 7、B 略简化 32、C 大打折扣 18。

- C 级 18：15 个按源站高保真重做或补齐（反重力粒子、方块波纹网格、球池背景、点场波纹、点阵网格聚光、气泡菜单、文件夹展开、字符洗牌进场、浮线背景、扫描线网格、雷达扫描、镜面高光按钮、滚动浮起标题、文字光标拖尾；聚光边框卡片映射有误 → 另收「卡面聚光」）；1 个是渲染 bug（扫光文字后半周期消失）已修；**2 个有意分道不改回**：「射灯」是本站迭代过四轮的作品（源站 LightPillar 中央扭转光柱另收为「扭转光柱」），「全息反光卡」源站需调用摄像头、iframe 里不适合。
- B 级 32：批十按差距要点逐个补齐（弧线循环拖拽、磁力线阵取向、翻牌进位方向、粘液导航液珠、弹性滑块端点、融球胶体、靶心光标、流动菜单、贴纸撕角、像素翻转显形、果冻光标、十字光标、电光边框、像素雪、图片拖尾、像素拖尾、彩光网格卡、滚速跑马灯、逐字弹入、靠近加粗、聚焦框词、毛边抖动字、悬停乱序字、环形旋字、词语翻转、解密文字、滚动逐词显形、3D 倾斜卡片、魔法便当格、胶囊导航、错落展开菜单、文字坠落堆叠）。
- 未同步的 45 个分两批新收：批八 CSS/JS 20、批九 GLSL 23（原生 WebGL 重写 three.js / ogl 着色器）；另 GradualBlur 后随「背景·滚动触发」子类一起删除。
- 2026-09-17 起又发现 4 个观感与源站不齐的效果已重做：雨滴玻璃（Codrops）、灯管标题（Aceternity）、复古透视网格（Magic UI）、球池背景（Vue Bits）。**批九的 23 个 GLSL 尚未逐一截图对照源站**，是下一轮视觉复查的对象。
- 不收：三维场景 / 流体模拟 8（Beams · LiquidEther · SplashCursor · DomeGallery · InfiniteMenu · ModelViewer · ASCIIText · FlyingPosters，单文件零依赖难以承载）；表单控件 / 进场工具 5（CurvedInput · Stepper · AnimatedContent · FadeContent · Noise）；DarkVeil（权重）；已有等价 12（Aurora / Grainient / GradientText / GlitchText / TextType / LogoLoop / StarBorder / Ribbons / Carousel / Stack / ScrollStack / CircularGallery）。

### Magic UI（19）

79 个注册组件（2026-09-14 核对）：34 站内已有等价、23 是机壳 / 产品 UI / 静态底纹 / 依赖第三方数据，收 19：复古透视网格、闪烁方格（Flickering Grid + Animated Grid Pattern 合一）、边缘光束隧道、文字融变、连线光束、彩纸礼花、放大镜（与 Aceternity Lens 合并）、主题切换扩散、星光文字、线影文字、3D 标签云、像素渐显图、荧光笔标注、圆点扩散按钮、环形进度、脉冲同心环，以及看过源码后追加的彩带揭示文字（Dia Text Reveal）与背光晕染（Backlight）。跳过 Kinetic Text / Glyph Matrix / Floating 3D Particles（与站内靠近加粗文字 / 字母故障矩阵 / 漂浮粒子云近似）。

不收（节选）：Globe（cobe）、Dotted Map、Tweet Card、Hero Video Dialog、Code Comparison、File Tree、Terminal、机壳类、Bento Grid、Avatar Circles、静态底纹 Pattern 系列、Scroll Progress、Pulsating / Subscribe / Rainbow Button、Comic / Video Text。

### Aceternity UI（25）

约 90 个免费组件（付费 Pro 区块不碰），全部按 visual-inspiration 处理。收 26 + 早期的 3D 倾斜卡片，其中 2 个后被删除（滚动描迹光束 / Tracing Beam、滚动描线 / Google Gemini Effect，见下），现存：背景 9（灯管标题、路径光束、光束撞击、点阵跟随高亮、格子涟漪、鼠标视差层、3D 图墙、云层飘移、粒子涡旋）· 文字与滚动 6（描边渐变悬停字、波纹扭曲字、曲线填充字、翻牌字板、多步加载、滚动隐现导航）· 交互 9（光标遮罩揭示、像素扭曲图、卡片文字揭示、方向感知悬停、输入粒子消散、色散倾斜图、乱码悬停卡、滚动视差行、字符画图）。

不收：约 27 个站内已有等价（3D Card / Wobble Card、Magnetic Button、Typewriter、Text Generate、Meteor、Spotlight、Glare Card、Moving Border、Glowing Effect、Infinite Moving Cards、Floating Dock、Encrypted Text、Card Stack、Sticky Scroll Reveal、Aurora、Wavy Background、Shooting Stars、Background Boxes、Layout Text Flip、Noise Background、Gooey Input 等）；约 27 个区块 / 表单 / 机壳 / 依赖地理数据或摄像头（Hero / Pricing / FAQ 区块、Signup Form、Tabs、Modal、Sidebar、Macbook Scroll、World Map、Webcam Pixel Grid 等）。

### Animata（15）

约 200 个组件，60 余个是 widget / skeleton / graphs 类产品 UI，文字类多为普通进场变体。批十三收 10：群鸟聚散、LED 点阵牌、花瓣展开菜单、揭幕预加载（对开 / 竖条合一）、液态标签页、文字炸裂、模糊色团、照片扇开揭示、悬停滚字、开门揭图；批十八再收 5：镜面切片文字、模糊叠卡、变形图窗标题、邻居失焦导航、扫描线高亮。跳过：斐波那契线（源码已不在仓库）、快照相册（仅悬停放大）、扇开卡组 / 3D 环绕物件（与弹跳卡片扇 / 轨道图片环近似）；21 个站内已有等价（Shooting Stars、Interactive Grid、Border Trail、Marquee、Trailing Image、Counter、Cycle Text、Glitch / Jitter Text、Tilted Card、Shimmer Sweep、Dock、Card Stack、Staggered Card 等）。

### Hover.css（5 个合集）

单个悬停效果太薄，合成带 `select` 的合集：悬停效果合集（grow / float / wobble / buzz / sweep / underline / shutter / curl 8 种）、背景过渡 10 种、边框过渡 10 种、2D 变换 13 种、阴影气泡 10 种。Hover.css 已收完。

### Uiverse galaxy（15）

站点按点赞排序的页面拒绝抓取，改为在 galaxy 仓库（718 个 loader / 1231 个按钮，README 明示全部 MIT、署名非必需）按形态取样后自写。加载 10：三点跳动、条形均衡器、双环交错、方块翻转、粘液液滴、沙漏翻转、DNA 螺旋、俄罗斯方块、打字加载、牛顿摆；按钮 5：霓虹描边、液体填充、3D 按压、拆字上翻、边框跑光。仓库只有这两类，第二轮取样价值不高。

### Codrops（25）

组织 345 个仓库（licensing 页已核：可下载演示均 MIT）。2026-09-14 筛出 92 个效果类仓库逐个检测依赖：无依赖 / 纯 CSS 12、anime.js 仅补间 8、GSAP 仅补间 45（补间改 CSS transition / WAAPI，拆字站内已有自写）、GSAP ScrollTrigger + Lenis 平滑滚动 25（滚动进度自写映射，不复现平滑滚动）、three.js / PixiJS / Blotter / mo.js / MIDI 重依赖 5（跳过，唯一例外 RainEffect 是原生 WebGL 可移植）。得 28 个候选并全部收录；其中 4 个后被删除（见下），加早期的 slice slideshow 技法共 25。例外：2013 / 2015 年的 Progress Button Styles、Elastic Progress 不是 MIT，进度条专题里只看效果（见「进度条（23）」）。

不收：重依赖 7（BalloonButton / WebGLBlobs / Interactive3DMallMap / LiquidDistortion / TextDistortionEffects / Animocons / MusicalInteractions）；jQuery 时代插件与整页模板（PageTransitions、SidebarTransitions、BookBlock、Slicebox、Baraja 等）；GSAP Flip 驱动的整页布局切换（ScrollBasedLayoutAnimations、GridToSlider、MenuToGrid 等，复现价值低于成本）；约 27 个站内已有等价（MagneticButtons、TiltHoverEffects、ImageTrailEffects、CircularTextEffect、MarqueeMenu、GooeyCursor、ClickEffects、TypeShuffleAnimation、StickySections、3DCarousel 等）。

### animos（16）

animos.app 是闭源商业 SaaS（设计作品展示的视频动效模板编辑器，beta，付费解锁全部模板与商用），64 个模板、9 组，全部是 5–30 秒自动循环的时间线动效、无交互。自有条款 → **只看效果不读其代码、不搬示例图与文案**，全部 `visual-inspiration`（`source.name` 写「animos 的 XX 模板一类效果」）。2026-09-22 逐个截图核对，收 16 个站内没有的形态，全部归 `showcase/wall`（「图墙」描述随之放宽，见分类决策表）。

| 源站模板                                                                     | 站内                              | 备注                                                                                       |
| ---------------------------------------------------------------------------- | --------------------------------- | ------------------------------------------------------------------------------------------ |
| Showcase Stream                                                              | `band-ring-showcase` 带状环陈列   | 倾斜连续环带自转，背面镜像压暗                                                             |
| Sphere Wall + Sphere Cascade                                                 | `curved-wall-rows` 弧面图墙       | 合为一个，`mode` 切交错流动 / 级联步进                                                     |
| Card Tunnel                                                                  | `card-tunnel` 卡片隧道            | 四壁贴卡向前飞                                                                             |
| Spiral Stream                                                                | `spiral-card-stream` 螺旋卡片流   | 螺旋自转的理发店招牌式「上升」错觉                                                         |
| Depth Stack Scroll                                                           | `depth-fly-through` 纵深飞入      | 源站按时间线推进，这里改为自动循环                                                         |
| Card Globe + Orbit Globe                                                     | `card-globe` 卡片球               | `mode` 切密铺 / 稀疏；Σ卡片 ≤ 96 的性能门槛                                                |
| Vortex Spin                                                                  | `vortex-rings` 涡旋双环           | 内外环反向                                                                                 |
| Wheel Spin + Wheel Spin Bottom                                               | `card-wheel-spin` 卡片轮盘        | `position` 切居中 / 底部半轮                                                               |
| Iso Cascade + Iso Focus + Iso Orbit                                          | `iso-card-stack` 等轴测叠卡       | `mode` 切三种运镜                                                                          |
| Orbit Showcase + Orbit Bloom + Photo Orbit（+ Orbit Carousel / Focus Orbit） | `orbit-cluster` 轨道群卡          | 与站内 `orbit-images`（2D 路径绕文字）不同，是 3D 倾斜轨道绕主卡；`mode` 切环绕 / 花瓣绽放 |
| Parallax Totem                                                               | `parallax-drift-cards` 视差漂移卡 | 自动漂移，区别于鼠标驱动的 `mouse-parallax-layers`                                         |
| Diagonal Carousel                                                            | `diagonal-card-flow` 斜向叠卡流   |                                                                                            |
| Mosaic Marquee                                                               | `mosaic-marquee` 图片马赛克跑马灯 | 异形拼贴，区别于等格的文字 / Logo 跑马灯                                                   |
| Flip Grid                                                                    | `flip-swap-grid` 网格翻面换图     |                                                                                            |
| Position Dance                                                               | `position-dance-cards` 换位卡组   |                                                                                            |
| Card Totem                                                                   | `card-totem-stream` 竖向卡片流    | 连续流 + 中央放大，区别于离散切换的 `vertical-carousel`                                    |

不收 · 与站内重合（约 20）：Cover Ring / Cover Ring Vertical（`ring-carousel`）、Cover Flow / Cover Flow Vertical（`coverflow-carousel`）、Carousel Flow / Focus Slider（`peek-carousel` / `multi-slide-carousel`）、Film Strip / Hero Reel（`slide-carousel` / `hero-text-carousel`）、Image Trail（`image-trail`）、Card Toss / Cascade Drop / Cascade Deck / Stack Slide / Deck Peel（`stack-cards-carousel` / `shuffle-stack-carousel` / `card-swap`）、Ticker Loop / Ticker Tilt / Column Drift / Totem Wall（`tilted-image-wall` / `grid-motion`）、Grid Reveal / Pop Grid（`masonry-grid`）、Center Stage / Focus Shift / Spotlight Zoom / Zoom Parallax（`kenburns-carousel` / `zoom-fade-carousel`）、Diagonal Wipe / Stripe Reveal / Split Reveal / Mosaic Wipe（`slice-carousel` / `clip-shape-carousel` / 页面转场）。

不收 · 不是网页组件形态（约 12）：Multiscene 8 个（Triple Scene、Collage Reel、Fan Shuffle、Sweep Ring、Scatter Dial、Grid Zoom Strip、Spread Rows、Spread Columns）是多场景蒙太奇剪辑，参数模型装不下多段时间线；Feed Scroll 是手机信息流机壳；Poster Burst 以大字排版为主，不算图片陈列。

### 原创（36）与其他（18）

- 原创：表单控件 5（日夜切换开关、液态开关、勾选动画、单选胶囊组、浮动标签输入框）、多数页面转场、多数轮播形态、以及站内自设的效果。
- 其他 18 是通用交互或经典技法，按其性质分别标 reference / visual-inspiration：Keynote 转场（溶解、立方体、切页、圆形揭示、神奇移动）、Netflix 海报行、Cover Flow、Swiper / Glide 的轮播形态、particles.js 粒子连线、iCSS glitch 技法、Ken Burns、Intro to CSS 3D Transforms 的 carousel 一章、CSS sticky 堆叠等。

### 进度条（23）

2026-10-10 一次调研（Material 3、CodePen、SmoothUI、KokonutUI、Animata、NProgress、Codrops 与几款产品），23 个候选全部收录，分五批提交。这 23 个单列，不计入上面各来源行；进度条分类另有 3 个仍记在原来源下：原有的挤值圆头滑块（原创），以及迁入的弹性滑块（Vue Bits）、环形进度（Magic UI）。

| 子类       | 效果                                         | 来源 → 处理                                                                          |
| ---------- | -------------------------------------------- | ------------------------------------------------------------------------------------ |
| 线性进度   | 波浪进度条                                   | Material 3 Expressive 规范（Apache-2.0）→ reference，按规范自写                      |
|            | 顶部加载条                                   | NProgress（MIT，已查仓库）→ reference                                                |
|            | 细栅进度条                                   | Animata Progress（MIT）→ reference                                                   |
|            | 分段故事进度、视频进度条                     | Instagram Stories、YouTube 播放器 → visual-inspiration                               |
|            | 格斗血条、阅读进度、火花彗尾、经典进度条合集 | 原创                                                                                 |
| 环形与仪表 | 活动圆环                                     | KokonutUI Apple Activity Card（MIT，已查仓库）→ reference                            |
|            | 液体水球                                     | Elaine Xu 的 CodePen 作品 wavePercent（MIT）→ reference                              |
|            | 温控旋钮                                     | Google Nest Learning Thermostat → visual-inspiration                                 |
|            | 仪表盘指针                                   | 原创                                                                                 |
| 滑块       | 刻度拨盘、数值拖拽条                         | SmoothUI Exposure Slider / Scrubber（MIT，已查仓库）→ reference                      |
|            | 摆动气泡滑块、滑块皮肤合集                   | Temani Afif 的 CodePen 作品（MIT）→ reference                                        |
|            | 玻璃水滴滑块、价格区间滑块                   | iOS 26 Liquid Glass、Airbnb 价格筛选 → visual-inspiration                            |
|            | 表情评分滑块                                 | 原创                                                                                 |
| 按钮与步骤 | 步骤进度条                                   | SmoothUI Animated Stepper（MIT）→ reference                                          |
|            | 按钮变进度、弹性下载进度                     | Codrops Progress Button Styles（2013）/ Elastic Progress（2015）→ visual-inspiration |

合计原创 6、reference 10、visual-inspiration 7。

- **Codrops 例外**：上面两个早期仓库用 Codrops 自有许可（可改写使用、禁止原样转载），不是 MIT，所以只看效果、不读代码。
- **CodePen 公开作品**默认 MIT，读码后自写，`source.name` 署作者。
- **和「多步加载」不重复**：步骤进度条是横向、手动前进后退的步骤指示；「加载 · loading动画」里的多步加载是竖向、自动走完的等待提示。
- 不收：里程碑时间线（Animata Timeline，和「时间线轮播」同形态）、SVG 路径描线进度（和已删的「滚动描线」「滚动描迹光束」同类）、技能条进场（等于依次上浮加数字滚动计数，太薄）、波浪轨道滑块（Temani Afif，和波浪进度条观感重合；调研时建议并作波浪进度条的可拖动模式，尚未做）、Cult UI Animated Progress / Motion UI Progress（付费 Pro）。
- 留在原处：揭幕预加载、多步加载（表达「在等」，不是数值）；前后对比滑块（拖的是对比分界线）。

## 已删除的效果

2026-09-17，共 4 个：

- `gradual-blur`（边缘渐进模糊）、`morphing-blob-scroll`（滚动形变色块）、`page-reflection-scroll`（页面倒影）：背景分类取消「滚动触发」子类（`BACKGROUND_SUBS` 不再含 `scroll`），三者随之删除。
- `clip-window-menu`（裁切窗菜单）：形态价值不足，删除。

2026-09-22，共 4 个（维护者决定删除）：

- `glass-icons`（玻璃图标）：Vue Bits。
- `zoom-fade`（缩放淡入转场）：macOS 启动台 / visionOS 空间过渡；`scroll-handoff`（滚动接力长页）、`scroll-page-fade`（滚动换底长页）：apple.com 产品长页 / 分节换底。

2026-10-09，共 4 个（维护者决定删除）：

- `scroll-trace-beam`（滚动描迹光束）、`scroll-draw-lines`（滚动描线）：Aceternity UI 的 Tracing Beam / Google Gemini Effect。
- `animated-list`（滚入列表）：Vue Bits。
- `block-reveal-enter`（色块揭示进场）：Codrops BlockRevealers。

## 分类决策记录

| 决策                                       | 内容                                                                                                                                                                                                                                                                                                                                      |
| ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 背景不收滚动触发                           | 背景效果的子类只有自动 / 鼠标交互 / 点击；滚动驱动的背景归「多卡/图展示·滚动交互」或不收                                                                                                                                                                                                                                                  |
| 转场不收滚动接力                           | 「加载·页面转场」只收页面间换场（擦除、揭示、翻转、溶解、共享元素形变等），随滚动推进的分节、视差、堆叠一律归「多卡/图展示·滚动交互」                                                                                                                                                                                                     |
| 表单控件归「按钮与交互」                   | 单个控件（开关 / 复选框 / 输入框）不单设分类；累计已到 5 个的阈值，**再加一个就该新增「表单控件」分类并把现有 5 个迁过去**                                                                                                                                                                                                                |
| 「鼠标样式」分类（`canvas`）只放光标本体   | 果冻光标、十字瞄准线、拖尾等 10 个纯光标效果；全屏氛围类（融球、粒子星空等）与鼠标驱动的整幅图像 / 网格（字符画图、网格扭曲图、像素扭曲图、光标格纹、魔法光环、幽灵烟雾光标，2026-09-23 迁入）归背景效果                                                                                                                                  |
| 多图 / 卡片墙归 `showcase/wall`            | 3D 图墙、斜向图墙、鼠标视差层从背景移入「多卡/图展示·图墙」                                                                                                                                                                                                                                                                               |
| 自动播放的 3D 图片陈列也归 `showcase/wall` | 环带、弧面墙、隧道、螺旋、卡片球、轮盘这类无交互的自动陈列不另设子类，「图墙」描述已放宽为「墙、环、球、隧道等陈列」                                                                                                                                                                                                                      |
| 薄库合成合集                               | Hover.css、链接下划线、图说悬停、线条菜单等单个太薄的形态用一个 `select` 参数切多种                                                                                                                                                                                                                                                       |
| 「进度条」独立成一级分类（`progress`）     | 2026-09-23 新增：进度条 / 滑块 / 数值指示这类「表示进度并可拖动」的控件归此；首个效果是挤值圆头滑块。2026-10-10 子类改按形态：线性进度（`linear`）/ 环形与仪表（`ring`）/ 滑块（`slider`）/ 按钮与步骤（`button`），「弹性滑块」从按钮、「环形进度」从加载迁入；同日新增 23 个后共 26 个（线性 9 / 环形与仪表 5 / 滑块 9 / 按钮与步骤 3） |
| 「加载」一级分类（`loading`）              | 2026-10-09：原一级「页面转场」与「加载与进场」并入新一级「加载」，下设「页面转场」（`transition`，7 个）、「loading动画」（`anim`，15 个）与「进场」（`enter`，收页面内容出现时的入场动画；原「滚动进场」移入并改名「依次上浮」）；原转场的共享元素 / 推屏 / 缩放淡入 / 发布会转场与加载类的触发方式子类不再细分                          |

## 候选池（未启动）

- **MIT 安全源，尚未核对目录与去重**：Cult UI（开源部分）、Motion-Primitives、HyperUI、KokonutUI、UI Layouts、fancycomponents、smoothui（KokonutUI、smoothui 只核过进度条与滑块类，其余目录未看）。
- **薄子类待补或合并**：`showcase/compare` 1 个、`button/idle` 1 个、`text/click` 2 个、`nav/scroll` 2 个、`loading/enter` 1 个。侧栏里点开只有一两张卡，要么补到 4–5 个，要么合并子类。
- **视觉复查**：批九 GLSL 23 个对照源站截图逐个过一遍（2026-09-17～09-21 重做的 4 个观感不齐的效果都是这类「算法照搬、观感没对齐」）。
