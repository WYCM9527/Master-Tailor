# 裁缝大师 Master-Tailor

> 我们不做设计，我们只是代码的裁缝师。

面向中文 vibe coding 用户的前端效果图鉴：挑一个效果 → 拖滑块调成你要的样子 → 复制中文 prompt 粘给任何 AI 编程工具。每个效果都有实时预览、可调参数、结构化 prompt 和一份可直接运行的原生 HTML 参考代码。

## 使用方式（给访客）

1. **挑一个效果**：左侧两级侧边栏浏览——原有分类按触发方式细分，「多卡/图展示」按形态细分（轮播图 / 图片对比 / 滚动堆叠）；卡片全部是实时渲染的迷你预览
2. **调成你要的样子**：右侧面板改颜色、拖滑块，预览 / prompt / 代码三者实时同步
3. **复制 prompt 粘给你的 AI**：Trae、Qoder、Cursor、Claude Code、扣子编程、CodeBuddy、豆包网页版……任何能写代码的 AI 都可以

其他出口：

- **复制代码 / 下载 HTML**：拿到参数已写死的单文件，双击就能在浏览器打开
- **复制分享链接**：当前参数编码在 URL 里，别人打开就是你调好的样子
- **静态 prompt 端点**：`/prompts/<slug>.md`（默认参数版），可被 curl / agent 直接拉取

## 本地开发

```bash
pnpm install        # Node 22+ / pnpm 11+
pnpm dev            # 开发服务器
pnpm validate       # 校验所有效果是否符合作者契约
pnpm test           # 引擎单元测试（vitest）
pnpm build          # validate + tsc + vite build + 生成 dist/prompts/*.md
```

部署：`dist/` 是纯静态产物，任何静态服务器可托管（hash 路由，无需 SPA fallback）。也可用仓库里的 `Dockerfile`（nginx）。

字体升级：`pnpm tsx scripts/prepare-fonts.ts`（从 npm 包与 GitHub release 重新生成 `public/fonts/`，产物已提交进仓库）。

## 作者契约（新增效果必读）

一个效果 = `effects/<slug>/` 下的三件套，构建期自动收集，**加效果不用改任何代码**：

```text
effects/<slug>/
  meta.json    # 名称 / 分类 / 触发方式 / 标签 / 参数 schema / 预设 / thumb 模式 / 来源
  index.html   # 原生单文件实现（零依赖、零外链）
  prompt.md    # 中文效果描述模板（{{key}} 占位符引用参数）
```

### meta.json

- `category`：`background | button | text | card | showcase | loading | canvas`（侧边栏一级）
- `sub`：二级分类 id，必须属于所在分类在 `CATEGORIES` 中声明的子类表——原有 6 类的子类是触发方式（`idle | hover | click | scroll`），「多卡/图展示」的子类是 `carousel | compare | stack-scroll`
- `params[]`：8 种控件类型 `color | range | toggle | select | text | font | image | images`
  - `target: "css"` → 值注入 `:root` 的 `--mt-<key>`，调参时**热更新**（动画不重置）
  - `target: "config"` → 值注入 JS 顶部 `const CONFIG` 块，调参时**防抖重建**预览
  - `text` 只允许 config；`font` 只允许 css（值为字体表 id）；`image` 默认值必须是 `/samples/…`
  - `images`（图片列表，轮播用）：只允许 config，列表项为 `{src, caption}`，声明 `min / max / captions`；面板中每槽位可换示例图 / 上传 / 填标题并可增减张数；CONFIG 中必须写成**单行数组** `slides: [ ... ], // 注释`；导出代码与 prompt 一律写 `./slide-1.jpg …` 占位；分享链接编码为「示例图索引:标题」列表（上传的图回退示例图）
- `presets[]`：2–4 套，必须含 `id: "default"`（values 可为空对象），values 只写与默认不同的键
- `thumb.mode`：`live`（效果自身一直在动）或 `autoplay`（依赖鼠标/点击/滚动，需要演示块）
- `source.kind`：`original`（原创）/ `reference`（参考 MIT/BSD/CC0 实现后自写）/ `visual-inspiration`（仅视觉灵感，未读其源码）

### index.html 硬性规范（validate 强制）

- `<!doctype html>` + `lang="zh-CN"`
- `:root` 中每个 css 参数都有 `--mt-<key>: 默认值; /* 中文注释 */`，且必须有 `--mt-bg`（预览底色切换依赖它）
- 每个 config 参数在 `const CONFIG = { ... };` 中有 `key: 默认值, // 中文注释`（一键一行）
- **零外部请求**：不允许任何 `http(s)://`（SVG 命名空间除外），不引第三方库
- 尊重 `prefers-reduced-motion`（动画停止或明显降级）
- rAF 动画在 `document.hidden` 时暂停；纯 CSS 动画可依赖浏览器自动节流
- `thumb.mode: "autoplay"` 时提供演示块，包裹在标记对中（导出代码时会被剥离）：

```js
/* @mt:thumb-start */
if (window.__MT_ENV && window.__MT_ENV.thumb) {
  // 自动演示；可选：window.__mtOnPointer = (x, y) => {...} 接收父页面转发的真实鼠标
}
/* @mt:thumb-end */
```

### prompt.md

- 必须有 `## 效果描述`（人话讲清楚长什么样、怎么动、什么时候触发；`{{key}}` 会被替换为当前参数的人话表述，`{{bg}}` 为底色描述）
- 可选 `## 技术要求补充`（追加在全局【技术要求】之后的效果专属要求，如轮播的无障碍 / 键盘 / 暂停约定）、`## 完成后请检查`（验收清单，缺省用全局默认三条）与 `## 放在哪`（位置建议）

### 轮播基线（`sub: "carousel"` 的效果强制）

validate 会检查 index.html 含四个基线能力关键字：`aria-roledescription`（轮播语义）、`keydown`（键盘切换）、`prefers-reduced-motion`（不自动播放降级）、`pointerdown`（拖拽/触摸）。纯 CSS 实现（如 scroll-snap 版）可在注释中如实说明原生能力。除此之外的约定基线：无缝循环、悬停/聚焦暂停自动播放、页面切后台暂停。新写轮播请从 `scripts/templates/carousel-core.html` 起步——它带完整的三态类切换骨架（无缝循环）、自动播放、Pointer Events 拖拽、三种分页器与 aria 结构，多数形态只需改「过渡层」CSS。

最终 prompt 由引擎拼装为 8 段：任务 → 效果描述 → 参数 → 技术要求 → 放在哪 → 完成后请检查 → 如果遇到问题 → 参考实现（可开关）。

## 目录结构

```text
effects/           # 52 个效果（内容层，唯一需要日常维护的目录）
src/contract/      # 类型、zod schema、字体表、分类与子类、示例图表、registry（import.meta.glob 收集）
src/engine/        # bakeCode（参数烘焙）、renderPrompt（8 段）、urlState（分享链接）、previewRuntime
src/components/    # 参数面板 / 预览 iframe / prompt 面板 / 代码面板 / 卡片……
src/app/           # HashRouter 页面：Home / EffectPage / NotFound
scripts/           # validate（契约校验）、build-prompts（静态 md 端点）、prepare-fonts、templates/（轮播核心模板）
public/fonts/      # 自托管 OFL 字体（思源黑体 / 霞鹜文楷 / 得意黑 / JetBrains Mono）+ 许可文件
public/samples/    # 8 张自制抽象 SVG 示例图（图片 / 图片列表参数默认值）
tests/             # 引擎单测
```

## 许可与来源

- 站点代码与所有效果实现均为本仓库原创（clean room：只阅读 MIT/BSD/CC0 许可的实现作参考；对 Commons Clause / 自有许可站点仅标注视觉灵感、不读其源码），效果代码可自由复制使用
- 每个效果详情页底部标注来源与许可说明（`meta.json` 的 `source` 字段）
- 自托管字体均为 OFL 1.1 开源许可，许可文本随字体文件放在 `public/fonts/<id>/`
