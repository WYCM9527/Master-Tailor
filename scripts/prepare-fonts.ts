/**
 * 准备自托管字体：从 npm 包拷贝 woff2 与 css 到 public/fonts/，生成统一入口 fonts.css。
 *
 * 产物已提交进仓库，日常开发无需重跑；升级字体版本时执行：pnpm tsx scripts/prepare-fonts.ts
 * 得意黑（smiley-sans）不在 npm 上，由本脚本从 GitHub release 下载 zip 解压（需要网络）。
 */
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const fontsDir = path.join(root, 'public', 'fonts');
const nm = path.join(root, 'node_modules');

/** 拷贝 css 并去掉 woff 回退（只保留 woff2，减少一半体积） */
function copyCssWoff2Only(src: string, dest: string) {
  const css = readFileSync(src, 'utf8').replace(/,\s*url\([^)]*\.woff\)\s*format\('woff'\)/g, '');
  writeFileSync(dest, css);
}

/** 按 css 内引用拷贝对应的 woff2 文件 */
function copyReferencedWoff2(cssFile: string, filesSrcDir: string, filesDestDir: string) {
  mkdirSync(filesDestDir, { recursive: true });
  const css = readFileSync(cssFile, 'utf8');
  const names = [...css.matchAll(/\.\/files\/([\w.-]+\.woff2)/g)].map((m) => m[1]);
  let copied = 0;
  for (const name of new Set(names)) {
    const src = path.join(filesSrcDir, name);
    if (existsSync(src)) {
      cpSync(src, path.join(filesDestDir, name));
      copied++;
    }
  }
  return copied;
}

rmSync(fontsDir, { recursive: true, force: true });
mkdirSync(fontsDir, { recursive: true });

// ---- Noto Sans SC（思源黑体，400/700，站点 UI 主字体 + 字体参数选项） ----
{
  const pkg = path.join(nm, '@fontsource', 'noto-sans-sc');
  const dest = path.join(fontsDir, 'noto-sans-sc');
  mkdirSync(dest, { recursive: true });
  for (const weight of ['400', '700']) {
    copyCssWoff2Only(path.join(pkg, `${weight}.css`), path.join(dest, `${weight}.css`));
    const n = copyReferencedWoff2(path.join(dest, `${weight}.css`), path.join(pkg, 'files'), path.join(dest, 'files'));
    console.log(`noto-sans-sc ${weight}: ${n} 个 woff2`);
  }
  cpSync(path.join(pkg, 'LICENSE'), path.join(dest, 'LICENSE'));
}

// ---- 霞鹜文楷（屏幕阅读版，regular） ----
{
  const pkg = path.join(nm, 'lxgw-wenkai-screen-webfont');
  const dest = path.join(fontsDir, 'lxgw-wenkai-screen');
  mkdirSync(dest, { recursive: true });
  copyCssWoff2Only(path.join(pkg, 'lxgwwenkaiscreen.css'), path.join(dest, 'lxgwwenkaiscreen.css'));
  const n = copyReferencedWoff2(
    path.join(dest, 'lxgwwenkaiscreen.css'),
    path.join(pkg, 'files'),
    path.join(dest, 'files'),
  );
  console.log(`lxgw-wenkai-screen: ${n} 个 woff2`);
  cpSync(path.join(pkg, 'OFL.txt'), path.join(dest, 'OFL.txt'));
}

// ---- JetBrains Mono（latin 400/700，代码与数字） ----
{
  const pkg = path.join(nm, '@fontsource', 'jetbrains-mono');
  const dest = path.join(fontsDir, 'jetbrains-mono');
  mkdirSync(path.join(dest, 'files'), { recursive: true });
  for (const weight of ['400', '700']) {
    cpSync(
      path.join(pkg, 'files', `jetbrains-mono-latin-${weight}-normal.woff2`),
      path.join(dest, 'files', `jetbrains-mono-latin-${weight}-normal.woff2`),
    );
  }
  cpSync(path.join(pkg, 'LICENSE'), path.join(dest, 'LICENSE'));
  writeFileSync(
    path.join(dest, 'jetbrains-mono.css'),
    ['400', '700']
      .map(
        (w) => `@font-face {
  font-family: 'JetBrains Mono';
  font-style: normal;
  font-display: swap;
  font-weight: ${w};
  src: url(./files/jetbrains-mono-latin-${w}-normal.woff2) format('woff2');
}`,
      )
      .join('\n') + '\n',
  );
  console.log('jetbrains-mono: 2 个 woff2');
}

// ---- 得意黑 Smiley Sans（GitHub release，需要网络；已存在则跳过） ----
{
  const dest = path.join(fontsDir, 'smiley-sans');
  const woff2 = path.join(dest, 'SmileySans-Oblique.woff2');
  const cached = path.join(root, 'node_modules', '.cache-smiley');
  const cachedWoff2 = path.join(cached, 'SmileySans-Oblique.woff2');
  mkdirSync(dest, { recursive: true });
  try {
    if (!existsSync(cachedWoff2)) {
      mkdirSync(cached, { recursive: true });
      execSync(
        `curl -fsSL -o "${cached}/smiley.zip" https://github.com/atelier-anchor/smiley-sans/releases/download/v2.0.1/smiley-sans-v2.0.1.zip`,
        { stdio: 'inherit' },
      );
      execSync(`cd "${cached}" && unzip -o smiley.zip`, { stdio: 'inherit' });
      const candidates = readdirSync(cached, { recursive: true }).map(String);
      // zip 内的 web 字体名为 SmileySans-Oblique.ttf.woff2（ttf 转制版，体积更小）
      const found =
        candidates.find((f) => f.endsWith('SmileySans-Oblique.ttf.woff2')) ??
        candidates.find((f) => f.endsWith('.woff2'));
      if (!found) throw new Error('zip 中未找到 woff2 文件');
      cpSync(path.join(cached, found), cachedWoff2);
      const license = readdirSync(cached, { recursive: true })
        .map(String)
        .find((f) => /LICENSE|OFL/i.test(f) && !f.endsWith('.zip'));
      if (license) cpSync(path.join(cached, license), path.join(cached, 'OFL.txt'));
    }
    cpSync(cachedWoff2, woff2);
    if (existsSync(path.join(cached, 'OFL.txt'))) {
      cpSync(path.join(cached, 'OFL.txt'), path.join(dest, 'OFL.txt'));
    }
    writeFileSync(
      path.join(dest, 'smiley-sans.css'),
      `@font-face {
  font-family: 'Smiley Sans Oblique';
  font-style: normal;
  font-display: swap;
  font-weight: 400;
  src: url(./SmileySans-Oblique.woff2) format('woff2');
}
`,
    );
    console.log('smiley-sans: 1 个 woff2');
  } catch (err) {
    console.warn('得意黑下载失败（不影响其余字体）：', (err as Error).message);
  }
}

// ---- 统一入口 fonts.css ----
{
  const entries = [
    './noto-sans-sc/400.css',
    './noto-sans-sc/700.css',
    './lxgw-wenkai-screen/lxgwwenkaiscreen.css',
    './jetbrains-mono/jetbrains-mono.css',
    './smiley-sans/smiley-sans.css',
  ].filter((p) => existsSync(path.join(fontsDir, p)));
  writeFileSync(
    path.join(fontsDir, 'fonts.css'),
    `/* 裁缝大师自托管字体（均为 OFL 开源许可，许可文件见各字体目录） */\n` +
      entries.map((p) => `@import url('${p}');`).join('\n') +
      '\n',
  );
  console.log('fonts.css 已生成：', entries.length, '个字体');
}
