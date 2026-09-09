import { z } from 'zod';

/**
 * meta.json 的 zod 校验 schema。
 * 与 src/contract/types.ts 中的类型一一对应；validate 脚本与运行时 registry 共用。
 */

const KEY_REGEX = /^[a-z][a-zA-Z0-9]*$/;

const baseParam = {
  key: z.string().regex(KEY_REGEX, 'key 必须是 camelCase（小写字母开头，只含字母数字）'),
  label: z.string().min(1),
  help: z.string().optional(),
};

const colorParam = z.object({
  ...baseParam,
  type: z.literal('color'),
  target: z.enum(['css', 'config']),
  default: z.string().regex(/^#[0-9a-fA-F]{6}$/, '颜色默认值必须是 6 位 hex'),
});

const rangeParam = z
  .object({
    ...baseParam,
    type: z.literal('range'),
    target: z.enum(['css', 'config']),
    min: z.number(),
    max: z.number(),
    step: z.number().positive(),
    default: z.number(),
    unit: z.string().optional(),
    displayUnit: z.string().optional(),
  })
  .refine((p) => p.min < p.max, { message: 'range 参数 min 必须小于 max' })
  .refine((p) => p.default >= p.min && p.default <= p.max, {
    message: 'range 默认值必须落在 [min, max] 内',
  });

const toggleParam = z.object({
  ...baseParam,
  type: z.literal('toggle'),
  target: z.enum(['css', 'config']),
  default: z.boolean(),
});

const selectParam = z
  .object({
    ...baseParam,
    type: z.literal('select'),
    target: z.enum(['css', 'config']),
    options: z.array(z.object({ value: z.string(), label: z.string() })).min(2),
    default: z.string(),
  })
  .refine((p) => p.options.some((o) => o.value === p.default), {
    message: 'select 默认值必须是 options 之一',
  });

/** 文本参数只允许 config：把用户文本直接塞进 CSS 变量既危险又没有场景 */
const textParam = z.object({
  ...baseParam,
  type: z.literal('text'),
  target: z.literal('config'),
  default: z.string(),
  maxLength: z.number().int().positive().optional(),
});

const fontParam = z.object({
  ...baseParam,
  type: z.literal('font'),
  target: z.literal('css'),
  default: z.string(),
});

const imageParam = z.object({
  ...baseParam,
  type: z.literal('image'),
  target: z.enum(['css', 'config']),
  default: z.string().startsWith('/samples/', '图片默认值必须是站内示例图（/samples/…）'),
});

export const paramSchema = z.discriminatedUnion('type', [
  colorParam,
  rangeParam,
  toggleParam,
  selectParam,
  textParam,
  fontParam,
  imageParam,
]);

export const effectMetaSchema = z
  .object({
    slug: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'slug 必须是 kebab-case'),
    name: z.string().min(2),
    category: z.enum(['background', 'button', 'text', 'card', 'loading', 'canvas']),
    trigger: z.enum(['idle', 'hover', 'click', 'scroll']),
    tags: z.array(z.string().min(1)).min(1).max(6),
    summary: z.string().min(6).max(60),
    params: z.array(paramSchema).min(1).max(10),
    presets: z
      .array(
        z.object({
          id: z.string().regex(/^[a-z0-9-]+$/),
          name: z.string().min(1),
          values: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])),
        }),
      )
      .min(2)
      .max(4),
    thumb: z.object({ mode: z.enum(['live', 'autoplay']) }),
    source: z.object({
      kind: z.enum(['original', 'reference', 'visual-inspiration']),
      name: z.string().optional(),
      url: z.string().optional(),
      license: z.string().optional(),
    }),
    promptEn: z.string().optional(),
  })
  .superRefine((meta, ctx) => {
    const keys = new Set(meta.params.map((p) => p.key));
    if (keys.size !== meta.params.length) {
      ctx.addIssue({ code: 'custom', message: '参数 key 不能重复' });
    }
    for (const preset of meta.presets) {
      for (const k of Object.keys(preset.values)) {
        if (!keys.has(k)) {
          ctx.addIssue({ code: 'custom', message: `预设「${preset.name}」引用了不存在的参数 ${k}` });
        }
      }
    }
    if (!meta.presets.some((p) => p.id === 'default')) {
      ctx.addIssue({ code: 'custom', message: '必须包含 id 为 default 的预设（values 可为空对象）' });
    }
  });

export type EffectMetaInput = z.input<typeof effectMetaSchema>;
