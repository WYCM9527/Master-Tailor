# 站点架构

> 更新：2026-09-21。给第一次接手站点代码的人：数据从哪来、怎么变成页面、怎么打包。效果本身的**作者契约**在 [README](../README.md#作者契约新增效果必读)，这里不重复。

## 一句话

纯静态 SPA（Vite 8 / React 19 / react-router `createHashRouter`），没有后端。内容层是 `effects/<slug>/` 的三件套（`meta.json` / `index.html` / `prompt.md`），构建期由 `import.meta.glob` 自动收集；站点把它们烘焙成 `srcdoc` iframe 做实时预览，同一份烘焙逻辑也产出可下载的单文件与 prompt 里的参考实现。

## 数据流

```text
effects/<slug>/{meta.json, index.html, prompt.md}
        │  import.meta.glob（vite.config.ts 的 light-meta 插件裁出 ?light 索引）
        ▼
src/contract/registry.ts
   EFFECTS / EFFECT_BY_SLUG ── 首包只带「索引」：meta 去掉 params / presets
   loadEffectBundle(slug) ─── 懒加载效果包 { meta（全量）, html, promptMd }，按 slug 缓存
        │
        ▼
src/engine/bakeCode.ts ── 参数值写进 :root 的 --mt-* 与 const CONFIG 块
   mode: 'preview' → 注入 previewRuntime + 字体样式表，保留 @mt:thumb 演示块，示例图按 base 改写
   mode: 'export'  → 剥离演示块、图片写 ./your-image.jpg 占位、加文件头注释
        │
        ├─► <iframe srcdoc>（EffectCard 缩略图 / PreviewFrame 详情舞台）
        ├─► CodePanel（复制 / 下载 HTML）
        └─► renderPrompt.ts（7 段中文 prompt，附参考实现或其抓取地址）与 scripts/build-prompts.ts（dist/prompts/<slug>.md、code/<slug>.html、meta/<slug>.json、prompts/index.json、llms.txt）
```

## 契约层 `src/contract/`

| 文件                      | 职责                                                                                                                                                                                  |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `types.ts`                | `EffectMeta`（全量 meta）、`EffectIndex`（= meta 去掉 `params / presets`，首包用）、`EffectBundle`（全量 meta + html + promptMd）、参数类型、`BgSetting`                              |
| `schema.ts`               | zod 校验；**只在开发态和 `pnpm validate` 里跑**，生产包不含 zod                                                                                                                       |
| `categories.ts`           | 一级分类与各自的子类表（`CATEGORIES`）；背景无 `scroll` 子类，文字多 `marquee`，展示类是 `carousel / compare / stack-scroll / wall`，转场是 `shared / push / zoom / keynote / scroll` |
| `registry.ts`             | 收集、排序（一级 → 二级 → slug）、编号、懒加载与缓存                                                                                                                                  |
| `fonts.ts` / `samples.ts` | 字体表与示例图表（`/samples/sample-N.webp`）                                                                                                                                          |
| `base.ts`                 | `BASE_URL` / `withBase()`：站内根路径 → 部署 base 路径（子路径部署用）                                                                                                                |

## 引擎层 `src/engine/`

- **`bakeCode`**：`replaceCssVar` 改 `--mt-<key>: 值;` 保留行内注释；`replaceConfigKey` 在 `const CONFIG = { ... };` 块内按 key 替换（支持单行数组 / 字符串 / 标量）。`collectCssVars` 生成热更新变量表；`configSignature` 只随 config 参数变化——它变了才重建 iframe。
- **`previewRuntime`**：注入到预览文档 `</head>` 前的一段脚本。定义 `window.__MT_ENV = { thumb, visible }`；监听父页面消息：`mt:css`（热更新 CSS 变量）、`mt:pointer`（转发真实鼠标坐标给 `window.__mtOnPointer`）、`mt:visible`（离屏时把 `document.hidden / visibilityState` 改写为隐藏并派发 `visibilitychange`，效果代码只认 `document.hidden`）；向父页面发 `mt:activity`（全屏态退出按钮的活动信号）。thumb 模式把 `devicePixelRatio` 封顶为 1。
- **`renderPrompt`**：任务 → 效果描述 → 参数（值 + help）→ 技术要求（全局四条 + 效果补充）→〔实现提示，仅不附代码时〕→ 完成后请检查 → 如果遇到问题 → 参考实现。每个事实只出现一次。
- **`urlState`**：详情页状态 ↔ URL query，只写非默认值；解码时非法值回退默认；图片列表编码为「示例图索引:标题」，上传的图回退示例图。
- **`search`**：名称 + 摘要 + slug + 标签 + 分类名 + 子类名的子串匹配（AND），`#标签` 精确匹配，标签补全。只用 `EffectIndex` 字段。

## 页面 `src/app/`

路由：`/`（Home：海报 + 分类索引 + 怎么用）、`/effects`（Gallery，query 里带 `cat / sub / tag / q` 筛选）、`/e/:slug`（EffectRoute）、`*`（NotFound）。

- **Gallery / EffectCard**：每张卡是一个 `.cell.card`，预览按 1280×720 设计视口渲染再 `transform: scale` 等比缩进卡宽。两层 IntersectionObserver：进入近区（`rootMargin 240px`）才拉效果包并挂 iframe，离开近区发 `mt:visible=false` 暂停；离开远区（`150%`）卸载 iframe。任一时刻真正在跑的只有视口附近十来张。
- **EffectPage**：外壳（`EffectPage`）持有目录抽屉状态并 `useEffectBundle(slug)`；效果包未到时渲染同布局骨架（页头 + 深底舞台），到达后原位换成正文 `EffectBody`。正文：`decodeState` 初始化 → 状态是唯一事实源，250ms 防抖 `replace` 回 URL；样式参数走 `PreviewFrame` 的 `mt:css` 热更新，config 参数 300ms 防抖重建 `srcdoc`；`exportCode` / `promptText` 由同一份状态派生。从效果页点卡进来时卡片已拉过效果包，同步命中，转场承接不受影响。
- **视图转场**（`src/styles/transitions.css`）：共享元素名 `stage`（卡预览 ↔ 舞台）、`title`（卡标题 ↔ h1）、`heading`（首页入口 ↔ 效果页大标题）、`nav-toggle`（目录开关 ↔ 抽屉关闭钮）。**共享元素名只在参与转场时挂载**，文档内重名会让整次转场被跳过。

## 构建与打包 `vite.config.ts`

- **light-meta 插件**：`load` 钩子拦截 `effects/*/meta.json?light`，返回删掉 `params / presets` 的 JSON（`moduleType: 'json'`）。带 query 的 id 与全量 `meta.json` 是两个模块，可分别落到首包与效果包；文件路径相同，开发服务器改 meta 时两者同时失效。
- **advancedChunks 分组**：`effects/<slug>/meta.json`、`index.html?raw`、`prompt.md?raw` 合成一个 chunk `assets/effects/<slug>-[hash].js`（平均约 8 KB）。
- **首包构成**（2026-09-21）：620 KB / 182 KB gzip ≈ React + Router 270 KB + 272 条索引与加载表 240 KB + 站点代码。`chunkSizeWarningLimit: 700` 是哨兵——效果源码或全量 meta 若再被内联进首包，构建会重新告警。
- **base 路径**：`base: process.env.BASE_PATH || '/'`。子路径部署时 Vite 处理 `index.html` / CSS 里的绝对引用；JS 与 `srcdoc` 里的 `/samples/…`、`/fonts/fonts.css` 由 `withBase()` 与 `bakeCode({ baseUrl })` 改写（`srcdoc` 文档里的绝对路径按父页面 origin 解析，不会自动带子路径）。导出代码与 prompt 只写占位路径，与 base 无关。
- **`pnpm build`** = `validate`（prebuild）→ `tsc -b` → `vite build` → `scripts/build-prompts.ts` 输出给 AI 抓取的静态端点（默认参数、深色底）：`dist/prompts/<slug>.md`（附参考代码）、`dist/code/<slug>.html`（单文件参考实现）、`dist/meta/<slug>.json`（参数表 + 端点）、`dist/prompts/index.json` 与 `dist/llms.txt`（目录）；地址前缀取环境变量 `SITE_URL`（CI 与服务器 deploy.conf 各设自己的站点地址）。

## 样式

三层：`tokens.css`（七级灰阶 / 间距 / 字号）→ `base.css`（reset，全局直角）→ `app.css`（12 栏 `.g12` 全出血网格与全部组件样式）。硬约束见 README「站点视觉」。断点：`1279px` 以下右列落到下方、`.d-left` 与舞台通宽；`767px` 以下手机两列。**新增跨列元素时记得在这两个断点里跟 `.d-left` 一起改 `grid-column`**，否则会像 2026-09-21 之前的舞台那样在平板宽度露出 3/12 的网格底色。

## 测试与门禁

| 层          | 工具                                    | 覆盖                                                                                                                                                   |
| ----------- | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 契约        | `scripts/validate.ts`（zod + 文本规则） | 三件套齐全、schema、`--mt-*` / CONFIG 注释、零外链、reduced-motion、轮播 / 转场基线关键字、thumb 块配对、效果描述 ≤ 200 字且无数值 / 占位符 / 实现术语 |
| 引擎        | `tests/*.test.ts`（vitest）             | bakeCode / renderPrompt / urlState / search                                                                                                            |
| 效果运行    | `scripts/smoke.ts`（Playwright）        | 逐个打开效果：异常 / console.error / 资源失败、站外请求、空白渲染                                                                                      |
| 类型 / 风格 | `tsc -b`、eslint、prettier              | —                                                                                                                                                      |

运行方式与 CI 结构见 [runbook](runbook.md)。
