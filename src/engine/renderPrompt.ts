import type { EffectMeta, Param, ParamValue, SlideItem, Values } from '../contract/types';
import { slidePlaceholder } from '../contract/types';
import { fontById } from '../contract/fonts';

/**
 * 渲染 7 段式中文 prompt：
 * 任务 → 效果描述 → 参数 → 技术要求 →（实现提示，仅在不附代码时）→ 完成后请检查 → 如果遇到问题 → 参考实现 →（在线预览）
 *
 * 原则：每个事实只出现一次——效果描述只写体验，数值全在【参数】（附 help 与代码里的键名），
 * 技术路线在【实现提示】/【参考实现】。文案规则见 .cursor/rules/prompt-copy.mdc。
 * 预览底色只影响站内预览与导出代码的页面底色，不写进 prompt 正文。
 *
 * 还原度的关键是让 AI 拿到可搬运的参考实现：附代码时直接内联；不附代码时给出静态端点地址
 * （code/<slug>.html 与 meta/<slug>.json，构建时由 scripts/build-prompts.ts 生成），能联网的 agent 自己取回再按【参数】改值。
 */

export interface PromptOptions {
  meta: EffectMeta;
  /** effects/<slug>/prompt.md 原文 */
  promptMd: string;
  values: Values;
  includeCode: boolean;
  /** includeCode 时附带的导出版代码（bakeCode export 模式产物） */
  exportedCode?: string;
  /**
   * 站点地址（含子路径，末尾带斜杠，如 https://host/master-tailor/）：
   * 用于拼参考实现 code/<slug>.html 与参数表 meta/<slug>.json 的抓取地址；缺省则不输出地址
   */
  siteUrl?: string;
  /** 在线预览地址（带当前参数，给人核对用，AI 无需访问）；缺省则不输出 */
  previewUrl?: string;
}

/** 参数在参考实现里的落点：样式类是 :root 的 CSS 变量，配置类是 CONFIG 块的同名键 */
export function paramTarget(param: Param): string {
  return param.target === 'css' ? `--mt-${param.key}` : `CONFIG.${param.key}`;
}

/** 静态端点地址（与 scripts/build-prompts.ts 的输出路径一致） */
export function effectEndpoints(siteUrl: string, slug: string) {
  return {
    code: `${siteUrl}code/${slug}.html`,
    meta: `${siteUrl}meta/${slug}.json`,
    prompt: `${siteUrl}prompts/${slug}.md`,
    preview: `${siteUrl}#/e/${slug}`,
  };
}

interface PromptSections {
  description: string;
  checks?: string;
  /** 追加在全局【技术要求】之后的效果专属要求（如轮播的无障碍 / 键盘 / 暂停） */
  techExtra?: string;
  /** 给 AI 的技术路线，只在「仅描述」（不附参考代码）模式输出 */
  hints?: string;
}

/** 解析 prompt.md：按 ## 标题切分 */
export function parsePromptMd(md: string): PromptSections {
  const sections: Record<string, string> = {};
  const re = /^##\s+(.+)$/gm;
  const titles: { title: string; start: number; end: number }[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(md)) !== null) {
    titles.push({ title: m[1].trim(), start: m.index, end: m.index + m[0].length });
  }
  for (let i = 0; i < titles.length; i++) {
    const body = md.slice(titles[i].end, i + 1 < titles.length ? titles[i + 1].start : md.length);
    sections[titles[i].title] = body.trim();
  }
  return {
    description: sections['效果描述'] ?? '',
    checks: sections['完成后请检查'],
    techExtra: sections['技术要求补充'],
    hints: sections['实现提示'],
  };
}

/** 把参数值转成人话（用于占位符替换与参数清单） */
export function humanValue(param: Param, value: ParamValue): string {
  switch (param.type) {
    case 'color':
      return String(value);
    case 'range': {
      const unit = param.displayUnit ?? param.unit ?? '';
      return `${value}${unit}`;
    }
    case 'toggle':
      return value ? '开启' : '关闭';
    case 'select':
      return param.options.find((o) => o.value === value)?.label ?? String(value);
    case 'text':
      return `「${value}」`;
    case 'font': {
      const font = fontById(String(value));
      return `${font.label}（font-family: ${font.stack}）`;
    }
    case 'image':
      return '占位路径 ./your-image.jpg（生成后我会换成自己的图片）';
    case 'images': {
      const slides = value as SlideItem[];
      const items = slides.map((s, i) => {
        const caption = param.captions && s.caption.trim() ? `，标题「${s.caption.trim()}」` : '';
        return `第 ${i + 1} 张 ${slidePlaceholder(i)}${caption}`;
      });
      return `共 ${slides.length} 张（占位路径，生成后我会换成自己的图片）：${items.join('；')}`;
    }
    case 'colors': {
      const colors = value as string[];
      return `共 ${colors.length} 色，按顺序 ${colors.join('、')}`;
    }
  }
}

/** 替换效果描述中的 {{key}} 占位符 */
function fillPlaceholders(text: string, meta: EffectMeta, values: Values): string {
  return text.replace(/\{\{(\w+)\}\}/g, (_m, key: string) => {
    const param = meta.params.find((p) => p.key === key);
    if (!param) return _m;
    return humanValue(param, values[key] ?? param.default);
  });
}

const DEFAULT_CHECKS = [
  '效果的样子和动法与上面【效果描述】一致，颜色、速度等都按【参数】里的值来',
  '页面里原有的内容、样式和交互没有被改动或破坏',
  '把系统的「减少动态效果」（prefers-reduced-motion）打开后，动画会停止或明显减弱',
];

/** 引擎追加的通用检查项（可在控制台核对，机器可验证） */
const PARAM_CHECK = '逐项核对【参数】的值已写入对应的 --mt-* / CONFIG.*，没有漏改或仍是默认值';

export function renderPrompt(o: PromptOptions): string {
  const { meta, values } = o;
  const sections = parsePromptMd(o.promptMd);
  const endpoints = o.siteUrl ? effectEndpoints(o.siteUrl, meta.slug) : undefined;
  const code = o.includeCode ? o.exportedCode?.trim() : undefined;
  // 有参考实现（内联或可抓取）时才声明取舍顺序，否则这句指向不存在的段落
  const hasReference = Boolean(code) || Boolean(endpoints);

  const parts: string[] = [];

  // 1.【任务】（+ 取舍顺序：有参考实现时，明确它是终极规格）
  const priority = hasReference
    ? '以【参考实现】为准，【参数】用于改值，【效果描述】用于理解意图；冲突时按此顺序取舍。'
    : '';
  parts.push(
    `【任务】\n请在我的网页里加入「${meta.name}」效果（${meta.summary}）。下面有效果说明、具体参数和技术要求，请严格按参数实现。${priority}`,
  );

  // 2.【效果描述】
  parts.push(`【效果描述】\n${fillPlaceholders(sections.description, meta, values)}`);

  // 3.【参数】：值 + help（help 解释「这个数字是什么意思」，是参数语义的唯一出处）
  //    每行带参考实现里的落点（--mt-<key> / CONFIG.<key>），AI 可一一对应地改值，不必猜
  const paramLines = meta.params.map((p) => {
    const help = p.help ? `（${p.help}）` : '';
    return `- ${p.label} · ${paramTarget(p)}：${humanValue(p, values[p.key] ?? p.default)}${help}`;
  });
  parts.push(
    `【参数】\n（每项的 --mt-* 是参考实现 :root 里的 CSS 变量，CONFIG.* 是 const CONFIG 里的键，值直接写进去即可）\n${paramLines.join('\n')}`,
  );

  // 4.【技术要求】（全局四条 + 效果专属补充）
  const techLines = [
    `- 用原生 HTML/CSS/JS 实现，不要引入任何第三方库、框架或外部资源（不要 CDN、不要外链字体和图片）`,
    `- 尊重系统的 prefers-reduced-motion 设置：用户开启「减少动态效果」时，动画停止或降级为静态`,
    `- 动画用 CSS animation 或 requestAnimationFrame 实现，页面切到后台时暂停，不要空耗性能`,
    `- 只新增代码，不要修改、删除或覆盖我页面里已有的内容和样式`,
  ];
  if (sections.techExtra) techLines.push(sections.techExtra);
  parts.push(`【技术要求】\n${techLines.join('\n')}`);

  // 4b.【实现提示】：不附参考代码时，用技术路线补上「怎么做」
  if (!o.includeCode && sections.hints) {
    parts.push(`【实现提示】\n${sections.hints}`);
  }

  // 5.【完成后请检查】：效果自带的检查项（或默认三条）+ 引擎追加的参数核对
  const checks = sections.checks ? sections.checks : DEFAULT_CHECKS.map((c) => `- ${c}`).join('\n');
  parts.push(`【完成后请检查】\n${checks}\n- ${PARAM_CHECK}`);

  // 6.【如果遇到问题】：框架集成是走样的头号来源，把要点写具体
  parts.push(
    `【如果遇到问题】\n` +
      `- 如果我的项目用了 React / Vue 等框架，请改写成对应框架的组件并保持视觉和参数完全一致：` +
      `脚本放进组件挂载后的生命周期（如 useEffect / onMounted），卸载时清理 requestAnimationFrame 与事件监听；` +
      `原本作用在 body / document 上的样式与监听改到组件根元素；CSS 变量挂在组件根元素上\n` +
      `- 如果找不到合适的插入位置，或者和现有样式冲突，先停下来问我，不要擅自改动我页面的其他部分`,
  );

  // 7.【参考实现】：附代码时内联完整实现；不附时给出可抓取的默认参数版地址
  if (code) {
    const also = endpoints
      ? `\n\n同一份默认参数版也可从 ${endpoints.code} 获取（参数表：${endpoints.meta}）。`
      : '';
    parts.push(
      `【参考实现】\n下面是一份可以直接运行的完整实现（参数值已调好）。请以它为准复现效果，可以按我的项目结构改造，但不要改变视觉表现：\n\n\`\`\`html\n${code}\n\`\`\`${also}`,
    );
  } else if (endpoints) {
    parts.push(
      `【参考实现】\n` +
        `- 默认参数版的完整实现（单文件，可直接运行）：${endpoints.code}\n` +
        `- 参数表（键名、类型、范围、默认值、说明）：${endpoints.meta}\n` +
        `能访问网络就先把实现取回来，再按【参数】改值，不必从头写；取不到时按【实现提示】实现。`,
    );
  }

  // 8. 在线预览：给人核对用的链接（hash 路由，抓取拿不到内容，明确告诉 AI 不必访问）
  if (o.previewUrl) {
    parts.push(`在线预览（供人核对，AI 无需访问）：${o.previewUrl}`);
  }

  return parts.join('\n\n');
}
