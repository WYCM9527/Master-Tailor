# 运维与开发手册

> 更新：2026-09-21。怎么跑、怎么验、怎么发、坏了怎么查。架构见 [architecture](architecture.md)，效果契约见 [README](../README.md#作者契约新增效果必读)。

## 环境

- Node 22、pnpm 11（`package.json` 的 `engines` / `packageManager` 已声明，`corepack enable` 后自动用对版本）
- 冒烟测试需要 Playwright 的 Chromium：`pnpm exec playwright install chromium`（Linux 加 `--with-deps`）
- 在线站点：<https://wycm9527.github.io/Master-Tailor/>，仓库 `WYCM9527/Master-Tailor`

## 换机器 / 迁移

代码与规则全部在 Git 里（`.cursor/rules/` 也已入库），本地只有可再生的 `node_modules` / `dist` / `*.tsbuildinfo`。新机器：

```bash
git clone https://github.com/WYCM9527/Master-Tailor.git && cd Master-Tailor
corepack enable                      # 或 npm i -g pnpm@11
pnpm install --frozen-lockfile
pnpm exec playwright install --with-deps chromium
pnpm validate && pnpm test && pnpm lint && pnpm build && pnpm smoke ball-pit
```

推送需要 GitHub 凭据（`gh auth login` 或 SSH key）。开发服务器 `pnpm dev --port 5190` 只监听本机，远程开发用 SSH 端口转发，不开公网端口。

## 命令

| 命令                                | 作用                                                   | 何时跑                                  |
| ----------------------------------- | ------------------------------------------------------ | --------------------------------------- |
| `pnpm dev`                          | Vite 开发服务器（HMR；改 `effects/*` 立即生效）        | 开发                                    |
| `pnpm validate`                     | 全部效果的契约校验，任一错误退出码非 0                 | 改效果后；`build` 前自动跑              |
| `pnpm test`                         | 引擎单测（vitest，秒级）                               | 改 `src/engine` / `src/contract` 后     |
| `pnpm lint` / `pnpm format`         | eslint / prettier                                      | 提交前                                  |
| `pnpm smoke [slug…] [--shard=i/n]`  | 效果冒烟（见下）                                       | 改效果、改 previewRuntime / bakeCode 后 |
| `pnpm build`                        | validate → tsc → vite build → 生成 `dist/prompts/*.md` | 提交前确认；CI 自动                     |
| `pnpm preview`                      | 用本地 `dist/` 起静态服务器                            | 复现生产问题                            |
| `pnpm tsx scripts/prepare-fonts.ts` | 重新生成 `public/fonts/`（产物已入库，很少用）         | 升级字体时                              |

## 冒烟测试 `pnpm smoke`

`scripts/smoke.ts` 用无头 Chromium 按详情页同款烘焙（默认参数、深色底、预览 runtime）逐个打开效果，模拟一轮交互（鼠标进入 + 移动；`click` 子类点一下；`scroll` / `stack-scroll` 子类滚两屏）后判定：

1. 没有未捕获异常、`console.error`、本站资源加载失败
2. 没有站外请求（假域名 `mt-smoke.local` 上用 route 拦截，字体与示例图从 `public/` 提供，其余一律记为外链并中止）
3. 画面不是空白：JPEG 截图在独立页里解码，底色取出现最多的颜色，任一通道与底色相差 > 12 的像素占比 ≥ 0.02%（小型加载动画约 0.05%+）。首帧空白会隔 1.2s 再采一帧——逐字浮现、打字机一类循环效果有「全部隐去」的瞬间

| 环境变量                            | 默认                          | 说明                                                                                        |
| ----------------------------------- | ----------------------------- | ------------------------------------------------------------------------------------------- |
| `SMOKE_WORKERS`                     | `min(4, CPU 核数)`            | 并发页数。软件渲染下每页吃满一核，多开只会互相拖慢                                          |
| `SMOKE_VIEWPORT`                    | `1280x720`                    | 视口；着色器耗时与像素数成正比                                                              |
| `SMOKE_SHOTS=1` / `SMOKE_SHOTS_DIR` | 关 / 系统临时目录 `mt-smoke/` | 失败效果的截图落盘                                                                          |
| `SMOKE_DEBUG=1`                     | 关                            | 打印各阶段耗时；对 `thumb.mode = live` 的效果做前后帧对比，静止的列出供人工复核（不算失败） |

本机 14 核 4 路并发全量 272 个约 3.5 分钟；单效果上限 180s。复现 CI 环境：`SMOKE_VIEWPORT=800x450 SMOKE_WORKERS=1 pnpm smoke <slug>`。

## CI（`.github/workflows/ci.yml`）

`main` 推送、PR、手动触发。三个 job：

| job           | 内容                                                                                                      | 用时          |
| ------------- | --------------------------------------------------------------------------------------------------------- | ------------- |
| `build`       | `validate → test → lint → build`（`BASE_PATH=/<repo>/`）→ 上传 Pages 产物                                 | ~40s          |
| `smoke (1…6)` | 6 片交错切分，每片 `SMOKE_WORKERS=1`、`SMOKE_VIEWPORT=800x450`，失败截图上传为 artifact `smoke-shots-<n>` | 每片 2–4 分钟 |
| `deploy`      | `main` 推送且 build + smoke 全绿后 `actions/deploy-pages`；仓库未启用 Pages 时跳过不报红                  | ~15s          |

CI 参数是踩出来的：GitHub 2 核 runner 只有 SwiftShader 软件渲染，重着色器一帧要好几秒，每个输入事件与截图都要等一帧——4 片 × 2 路并发时 81 个超时，6 片 × 单路 + 800×450 + 事件减到 2 个后全绿，最重的浮线背景约 90s。**不要在 CI 里加并发数**。

## 部署（GitHub Pages）

- Settings → Pages → Source 选 **GitHub Actions**（已设置；私有仓库需付费套餐，2026-09-21 仓库已转公开）。
- 项目站地址形如 `https://<owner>.github.io/<repo>/`，`build` job 用 `BASE_PATH=/<repo>/` 构建。绑定自定义域名后在仓库 Settings → Variables 里设 `SITE_BASE_PATH=/`。
- 其他静态托管：`BASE_PATH=/子路径/ pnpm build`（根路径部署不用设），把 `dist/` 整个上传即可；hash 路由无需 SPA fallback。也可用仓库 `Dockerfile`（nginx）。
- 给 AI 抓取的静态端点随站点一起发布：`/prompts/<slug>.md`、`/code/<slug>.html`、`/meta/<slug>.json`、`/prompts/index.json`、`/llms.txt`；构建时需设 `SITE_URL`（完整站点地址，末尾带斜杠），否则端点地址为相对路径。

## 常见故障

| 现象                                                                       | 原因 / 处理                                                                                                                                 |
| -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm validate` 报「效果描述 N 字，超过 200 字上限」「出现实现术语」       | 按 `.cursor/rules/prompt-copy.mdc` 改 `## 效果描述`，数值移到参数、术语移到 `## 实现提示`                                                   |
| validate 报「含外部 URL」                                                  | 效果必须零外链，注释里也不能写 URL（SVG 命名空间除外）                                                                                      |
| `pnpm smoke` 报「无法启动 Chromium」                                       | `pnpm exec playwright install chromium`；注意 `PLAYWRIGHT_BROWSERS_PATH` 环境变量决定浏览器缓存位置                                         |
| smoke 单个效果超时                                                         | 先 `SMOKE_DEBUG=1 pnpm smoke <slug>` 看哪一阶段慢；本机也慢多半是效果每帧开销过大（如每帧强制布局），CI 慢是软件渲染                        |
| smoke 误判空白                                                             | 看 `SMOKE_SHOTS=1` 的截图：内容极小或极暗时调 `BLANK_THRESHOLD` / 颜色距离；循环显隐的效果已由复采一帧兜底                                  |
| `vite build` 警告 chunk 超过 700 KB                                        | 有人把效果源码 / 全量 meta 静态引进首包了，检查 `registry.ts` 的 glob 是否还是懒加载、`vite.config.ts` 的分组是否还在                       |
| 生产环境示例图 / 字体 404                                                  | 子路径部署但没设 `BASE_PATH`，或新代码直接写了 `/samples/…` 而没过 `withBase()` / `baseUrl`                                                 |
| 详情页某断点下舞台右侧露灰                                                 | 跨列元素的 `grid-column` 没跟 `.d-left` 在同一断点里改，见 `app.css` 的 `@media (max-width: 1279px)`                                        |
| tsx 脚本里传给 Playwright `page.evaluate` 的函数报 `__name is not defined` | tsx 给函数表达式包了 `__name` 助手，浏览器里没有；把浏览器侧代码写成源码字符串再 `new Function`（`smoke.ts` 的 `ANALYZE_SRC` 就是这么做的） |

## 发布流程

1. 改动 → `pnpm validate && pnpm test && pnpm lint && pnpm smoke <涉及的 slug>` → 浏览器里过一眼（重效果对照源站）
2. 提交信息用中文、写清「改了什么 + 为什么」（现有 git log 是范例），`git push origin main`
3. CI 全绿后自动部署，约 6–8 分钟后线上更新；失败看 Actions 里对应 job 的日志与 `smoke-shots-*` artifact
