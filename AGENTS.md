# AGENTS.md · 裁缝大师 Master-Tailor

面向中文 vibe coding 用户的前端效果图鉴：272 个效果，每个是 `effects/<slug>/` 下的三件套（`meta.json` / `index.html` / `prompt.md`），站点把它们烘焙成实时预览、可调参数、中文 prompt 与可下载的单文件。纯静态 SPA，无后端。在线：<https://wycm9527.github.io/Master-Tailor/>。用中文沟通与写注释、提交信息。

## 命令

| 命令                 | 用途                                                                                   |
| -------------------- | -------------------------------------------------------------------------------------- |
| `pnpm dev`           | 开发服务器（改 `effects/*` 即时生效）                                                  |
| `pnpm validate`      | 效果契约校验，改效果后必跑                                                             |
| `pnpm test`          | 引擎单测                                                                               |
| `pnpm lint`          | eslint                                                                                 |
| `pnpm smoke <slug…>` | 无头浏览器打开效果查异常 / 外链 / 空白（首次 `pnpm exec playwright install chromium`） |
| `pnpm build`         | validate → tsc → vite build → dist/prompts                                             |

提交前：`validate` + `test` + `lint` + 涉及效果的 `smoke`，再在浏览器里看一眼。推送 `main` 即触发 CI 与自动部署。

## 硬边界

- **加效果不改代码**：新效果只新增 `effects/<slug>/` 目录，registry 自动收集。分类 / 子类改动才碰 `src/contract/categories.ts`，并同步 README 与 `docs/sources.md` 的分类决策表。
- **效果 `index.html` 零依赖、零外链、单文件**：不引库、不写 `http(s)://`（连注释都不行，SVG 命名空间除外）。`document.hidden` 时暂停 rAF；尊重 `prefers-reduced-motion`；与父页面的通信只经 `previewRuntime` 注入的 `window.__MT_ENV` / `window.__mtOnPointer`。
- **许可红线**：只读 MIT / BSD / CC0 源的代码作参考（`source.kind: reference`，写明 name + license）；Vue Bits / React Bits（Commons Clause）、Aceternity 等自有许可站点只看效果不读源码（`visual-inspiration`）；不搬源站资产（图、字库、权重）。详见 `docs/sources.md`「许可口径」。
- **prompt 文案**：每个事实只出现一次——`## 效果描述` 只写体验、≤ 200 字、无数值 / 占位符 / 实现术语；数值在参数、技术路线在 `## 实现提示`。规则全文 `.cursor/rules/prompt-copy.mdc`，validate 强制。
- **站点 chrome 视觉**：纯黑白灰、全直角、无阴影渐变、12 栏 1px 线网格、图标只用 IconPark（`.cursor/rules/icons.mdc`）。效果 `index.html` 内部样式不受此约束。
- **首包纪律**：`registry.ts` 首包只带 `?light` 索引，效果源码与全量 meta 走 `loadEffectBundle` 懒加载；不要在首包静态引入 `effects/*` 的 html / prompt / 全量 meta，也不要把 zod / schema 静态引到非 DEV 路径。`vite build` 的 700 KB 告警就是这条被破坏的信号。
- **子路径部署**：JS 里要发请求的站内根路径（`/samples/…`、`/fonts/…`）必须经 `withBase()`（`src/contract/base.ts`）或 `bakeCode({ baseUrl })`；契约、URL 状态、示例图表里继续写根路径不动。
- **视图转场名唯一**：`stage` / `title` / `heading` / `nav-toggle` 只在参与转场的那个元素上挂载，重名会让整次转场被跳过。
- **CI 冒烟不加并发**：runner 是 2 核软件渲染，参数（6 片 × 单路 × 800×450）是踩出来的；改效果导致 CI 超时先看效果自身每帧开销。

## 分类决策（已拍板，别反复讨论）

- 背景效果不收「滚动触发」子类；滚动驱动的归「页面转场·滚动接力」或不收。
- 表单控件归「按钮与交互」，累计 5 个已到阈值：**再加一个就新增「表单控件」分类并迁移现有 5 个**。
- `canvas` 分类（侧栏名「鼠标交互」）只放光标本体；全屏氛围类归背景。多图 / 卡片墙归 `showcase/wall`。
- 太薄的形态（Hover.css、下划线、图说悬停等）合成一个带 `select` 的合集，不拆成十几个效果。

## 踩坑警示

- 新增跨列元素（如舞台）要在 `app.css` 的 `1279px` / `767px` 断点里跟 `.d-left` 一起改 `grid-column`，否则平板宽度右侧露灰。
- `srcdoc` iframe 里的绝对路径按父页面 origin 解析，不带子路径——这就是 `baseUrl` 存在的原因。
- tsx 编译会给函数表达式包 `__name` 助手，传给 Playwright `page.evaluate` 的函数在浏览器里会炸；浏览器侧代码写成字符串再 `new Function`。
- 对照源站重做效果时，先截图对比再动手：2026-09-17～09-21 重做的 4 个「算法对了观感不对」的效果（雨滴、灯管、复古网格、球池）都是这么发现的。
- 效果里每帧强制布局（读 `clientHeight` 后写 transform）在软件渲染下会拖垮冒烟测试，能缓存就缓存。

## 深入文档

| 想知道                                                           | 读                                                                               |
| ---------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| 效果怎么写（meta / index.html / prompt.md 契约、轮播与转场基线） | `README.md`「作者契约」                                                          |
| prompt 文案规则 / 图标规则                                       | `.cursor/rules/prompt-copy.mdc` / `.cursor/rules/icons.mdc`                      |
| 站点怎么工作（registry、bakeCode、runtime 协议、页面、打包）     | `docs/architecture.md`                                                           |
| 怎么跑、CI、部署、冒烟参数、常见故障、换机器                     | `docs/runbook.md`                                                                |
| 从哪些源收了什么、不收什么、许可口径、候选池                     | `docs/sources.md`                                                                |
| 轮播 / 转场新效果的起步模板                                      | `scripts/templates/carousel-core.html`、`scripts/templates/transition-core.html` |
