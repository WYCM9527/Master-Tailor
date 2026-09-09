import type {
  BgSetting,
  EffectMeta,
  Param,
  ParamValue,
  SlideItem,
  Values,
} from '../contract/types';
import { BG_DARK, BG_LIGHT, bgColor, slidePlaceholder } from '../contract/types';
import { fontById } from '../contract/fonts';

/**
 * 渲染 8 段式中文 prompt：
 * 任务 → 效果描述 → 参数 → 技术要求 → 放在哪（固定引导 + 效果建议）→ 完成后请检查 → 如果遇到问题 → 参考实现（可选）
 */

export interface PromptOptions {
  meta: EffectMeta;
  /** effects/<slug>/prompt.md 原文 */
  promptMd: string;
  values: Values;
  bg: BgSetting;
  includeCode: boolean;
  /** includeCode 时附带的导出版代码（bakeCode export 模式产物） */
  exportedCode?: string;
}

interface PromptSections {
  description: string;
  checks?: string;
  placementHint?: string;
  /** 追加在全局【技术要求】之后的效果专属要求（如轮播的无障碍 / 键盘 / 暂停） */
  techExtra?: string;
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
    placementHint: sections['放在哪'],
    techExtra: sections['技术要求补充'],
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
  }
}

function bgHuman(bg: BgSetting): string {
  if (bg.mode === 'dark') return `深色（${BG_DARK}）`;
  if (bg.mode === 'light') return `浅色（${BG_LIGHT}）`;
  return `自定义颜色 ${bg.color}`;
}

/** 替换效果描述中的 {{key}} 占位符 */
function fillPlaceholders(text: string, meta: EffectMeta, values: Values, bg: BgSetting): string {
  return text.replace(/\{\{(\w+)\}\}/g, (_m, key: string) => {
    if (key === 'bg') return bgHuman(bg);
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

export function renderPrompt(o: PromptOptions): string {
  const { meta, values, bg } = o;
  const sections = parsePromptMd(o.promptMd);

  const parts: string[] = [];

  // 1.【任务】
  parts.push(
    `【任务】\n请在我的网页里加入「${meta.name}」效果（${meta.summary}）。下面有效果说明、具体参数和技术要求，请严格按参数实现。`,
  );

  // 2.【效果描述】
  parts.push(`【效果描述】\n${fillPlaceholders(sections.description, meta, values, bg)}`);

  // 3.【参数】
  const paramLines = meta.params.map(
    (p) => `- ${p.label}：${humanValue(p, values[p.key] ?? p.default)}`,
  );
  paramLines.push(`- 我的页面底色：${bgHuman(bg)}（效果要在这个底色上好看）`);
  parts.push(`【参数】\n${paramLines.join('\n')}`);

  // 4.【技术要求】（全局四条 + 效果专属补充）
  const techLines = [
    `- 用原生 HTML/CSS/JS 实现，不要引入任何第三方库、框架或外部资源（不要 CDN、不要外链字体和图片）`,
    `- 尊重系统的 prefers-reduced-motion 设置：用户开启「减少动态效果」时，动画停止或降级为静态`,
    `- 动画用 CSS animation 或 requestAnimationFrame 实现，页面切到后台时暂停，不要空耗性能`,
    `- 只新增代码，不要修改、删除或覆盖我页面里已有的内容和样式`,
  ];
  if (sections.techExtra) techLines.push(sections.techExtra);
  parts.push(`【技术要求】\n${techLines.join('\n')}`);

  // 5.【放在哪】：不再由用户填写，固定让 AI 先推荐位置再确认；prompt.md 的「## 放在哪」作为建议附上
  const hint = sections.placementHint ? `\n（建议：${sections.placementHint}）` : '';
  parts.push(
    `【放在哪】\n请先根据我的页面结构推荐 1-2 个合适的位置并问我确认，不要自行大改页面${hint}`,
  );

  // 6.【完成后请检查】
  const checks = sections.checks ? sections.checks : DEFAULT_CHECKS.map((c) => `- ${c}`).join('\n');
  parts.push(`【完成后请检查】\n${checks}`);

  // 7.【如果遇到问题】
  parts.push(
    `【如果遇到问题】\n` +
      `- 如果我的项目用了 React / Vue 等框架，请把这段效果改写成对应框架的组件，但保持视觉和参数完全一致\n` +
      `- 如果找不到合适的插入位置，或者和现有样式冲突，先停下来问我，不要擅自改动我页面的其他部分`,
  );

  // 8.【参考实现】
  if (o.includeCode && o.exportedCode) {
    parts.push(
      `【参考实现】\n下面是一份可以直接运行的完整实现（参数值已调好）。请以它为准复现效果，可以按我的项目结构改造，但不要改变视觉表现：\n\n\`\`\`html\n${o.exportedCode.trim()}\n\`\`\``,
    );
  }

  return parts.join('\n\n');
}

export { bgColor };
