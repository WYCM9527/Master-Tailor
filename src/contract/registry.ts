import type { Effect } from './types';
import { effectMetaSchema } from './schema';
import { CATEGORIES, TRIGGERS } from './categories';

/**
 * 效果注册表：构建期用 import.meta.glob 自动收集 effects/<slug>/ 三件套。
 * 新增效果 = 新增一个文件夹，无需改任何代码。
 */

const metaModules = import.meta.glob('../../effects/*/meta.json', {
  eager: true,
}) as Record<string, { default: unknown }>;

const htmlModules = import.meta.glob('../../effects/*/index.html', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>;

const mdModules = import.meta.glob('../../effects/*/prompt.md', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>;

function slugFromPath(path: string): string {
  const parts = path.split('/');
  return parts[parts.length - 2];
}

function byPathSlug<T>(modules: Record<string, T>): Map<string, T> {
  const map = new Map<string, T>();
  for (const [path, mod] of Object.entries(modules)) map.set(slugFromPath(path), mod);
  return map;
}

const htmlBySlug = byPathSlug(htmlModules);
const mdBySlug = byPathSlug(mdModules);

const categoryOrder = new Map(CATEGORIES.map((c, i) => [c.id, i]));
const triggerOrder = new Map(TRIGGERS.map((t, i) => [t.id, i]));

const effects: Effect[] = [];
for (const [path, mod] of Object.entries(metaModules)) {
  const slug = slugFromPath(path);
  const parsed = effectMetaSchema.safeParse(mod.default);
  if (!parsed.success) {
    console.error(`[registry] effects/${slug}/meta.json 不符合契约，已跳过：`, parsed.error.message);
    continue;
  }
  const html = htmlBySlug.get(slug);
  const promptMd = mdBySlug.get(slug);
  if (!html || !promptMd) {
    console.error(`[registry] effects/${slug}/ 缺少 index.html 或 prompt.md，已跳过`);
    continue;
  }
  if (parsed.data.slug !== slug) {
    console.error(`[registry] effects/${slug}/meta.json 的 slug 与目录名不一致，已跳过`);
    continue;
  }
  effects.push({ meta: parsed.data, html, promptMd });
}

// 排序：一级分类 → 触发方式 → slug，与侧边栏的层级顺序一致
effects.sort((a, b) => {
  const ca = categoryOrder.get(a.meta.category) ?? 99;
  const cb = categoryOrder.get(b.meta.category) ?? 99;
  if (ca !== cb) return ca - cb;
  const ta = triggerOrder.get(a.meta.trigger) ?? 99;
  const tb = triggerOrder.get(b.meta.trigger) ?? 99;
  if (ta !== tb) return ta - tb;
  return a.meta.slug.localeCompare(b.meta.slug);
});

export const EFFECTS: readonly Effect[] = effects;

export const EFFECT_BY_SLUG: ReadonlyMap<string, Effect> = new Map(
  effects.map((e) => [e.meta.slug, e]),
);

export function randomSlug(excludeSlug?: string): string | undefined {
  const pool = effects.filter((e) => e.meta.slug !== excludeSlug);
  if (pool.length === 0) return effects[0]?.meta.slug;
  return pool[Math.floor(Math.random() * pool.length)].meta.slug;
}
