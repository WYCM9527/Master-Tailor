import type { Effect, EffectBundle, EffectIndex, EffectMeta } from './types';
import { CATEGORIES } from './categories';

/**
 * 效果注册表：构建期用 import.meta.glob 自动收集 effects/<slug>/ 三件套。
 * 新增效果 = 新增一个文件夹，无需改任何代码。
 *
 * 首包只带每个效果的「索引」——meta.json 去掉 params / presets 的轻量版（由 vite.config 里的
 * light-meta 插件按 `?light` 查询裁出）。目录、搜索、计数、卡片标题都只靠索引。
 * 完整 meta + index.html + prompt.md 合计 2.5 MB+，按 slug 合成独立 chunk（assets/effects/<slug>-*.js），
 * 卡片滚近视口 / 进入详情页时才通过 loadEffectBundle 拉取。
 */

const indexModules = import.meta.glob('../../effects/*/meta.json', {
  eager: true,
  query: '?light',
}) as Record<string, { default: EffectIndex }>;

// 全量 meta 只被 import() 引用，不带 query 也不会进首包，与 ?light 版本是两个模块
const metaLoaders = import.meta.glob<EffectMeta>('../../effects/*/meta.json', {
  import: 'default',
});

const htmlLoaders = import.meta.glob<string>('../../effects/*/index.html', {
  query: '?raw',
  import: 'default',
});

const mdLoaders = import.meta.glob<string>('../../effects/*/prompt.md', {
  query: '?raw',
  import: 'default',
});

function slugFromPath(path: string): string {
  const parts = path.split('/');
  return parts[parts.length - 2];
}

function byPathSlug<T>(modules: Record<string, T>): Map<string, T> {
  const map = new Map<string, T>();
  for (const [path, mod] of Object.entries(modules)) map.set(slugFromPath(path), mod);
  return map;
}

const metaBySlug = byPathSlug(metaLoaders);
const htmlBySlug = byPathSlug(htmlLoaders);
const mdBySlug = byPathSlug(mdLoaders);

/**
 * 契约校验只在开发态、且在效果包到达时跑：生产构建前 `pnpm validate`（prebuild / CI）已用同一份
 * schema 校过全部 meta.json，schema 纯校验、无默认值与转换，浏览器里再跑只多带 ~25 KB gzip 的 zod。
 * schema 走动态 import——zod 建模是顶层副作用调用，静态引入即使不用也摇不掉；
 * 生产构建中整个 DEV 分支被静态消除，schema / zod 不进任何 chunk。
 */
async function checkMetaInDev(slug: string, meta: EffectMeta): Promise<void> {
  if (!import.meta.env.DEV) return;
  const { effectMetaSchema } = await import('./schema');
  const parsed = effectMetaSchema.safeParse(meta);
  if (!parsed.success) {
    console.error(`[registry] effects/${slug}/meta.json 不符合契约：`, parsed.error.message);
  }
}

const bundleCache = new Map<string, EffectBundle>();
const bundlePending = new Map<string, Promise<EffectBundle>>();

/** 已加载过的效果包同步取用（卡片挂载过的效果，进详情页时零等待，转场承接不掉帧） */
export function peekEffectBundle(slug: string): EffectBundle | undefined {
  return bundleCache.get(slug);
}

/** 懒加载效果包（完整 meta + index.html + prompt.md）；同 slug 并发调用共享一次请求，结果永久缓存 */
export function loadEffectBundle(slug: string): Promise<EffectBundle> {
  const cached = bundleCache.get(slug);
  if (cached) return Promise.resolve(cached);
  const pending = bundlePending.get(slug);
  if (pending) return pending;
  const loadMeta = metaBySlug.get(slug);
  const loadHtml = htmlBySlug.get(slug);
  const loadMd = mdBySlug.get(slug);
  if (!loadMeta || !loadHtml || !loadMd) {
    return Promise.reject(new Error(`[registry] 未知效果 ${slug}`));
  }
  const p = Promise.all([loadMeta(), loadHtml(), loadMd()])
    .then(([meta, html, promptMd]) => {
      void checkMetaInDev(slug, meta);
      const bundle: EffectBundle = { meta, html, promptMd };
      bundleCache.set(slug, bundle);
      return bundle;
    })
    .finally(() => bundlePending.delete(slug));
  bundlePending.set(slug, p);
  return p;
}

const categoryOrder = new Map(CATEGORIES.map((c, i) => [c.id, i]));
// 二级分类顺序按各分类 subs 的声明顺序，key 为 `分类:子类`
const subOrder = new Map<string, number>();
for (const c of CATEGORIES) c.subs.forEach((s, i) => subOrder.set(`${c.id}:${s.id}`, i));

const effects: Effect[] = [];
for (const [path, mod] of Object.entries(indexModules)) {
  const slug = slugFromPath(path);
  const meta = mod.default;
  // 三件套齐全性在这里就能判定：glob 的 key 表构建期已定，不必真正加载文件
  if (!htmlBySlug.has(slug) || !mdBySlug.has(slug)) {
    console.error(`[registry] effects/${slug}/ 缺少 index.html 或 prompt.md，已跳过`);
    continue;
  }
  if (meta.slug !== slug) {
    console.error(`[registry] effects/${slug}/meta.json 的 slug 与目录名不一致，已跳过`);
    continue;
  }
  effects.push({ meta });
}

// 排序：一级分类 → 二级分类 → slug，与侧边栏的层级顺序一致
effects.sort((a, b) => {
  const ca = categoryOrder.get(a.meta.category) ?? 99;
  const cb = categoryOrder.get(b.meta.category) ?? 99;
  if (ca !== cb) return ca - cb;
  const sa = subOrder.get(`${a.meta.category}:${a.meta.sub}`) ?? 99;
  const sb = subOrder.get(`${b.meta.category}:${b.meta.sub}`) ?? 99;
  if (sa !== sb) return sa - sb;
  return a.meta.slug.localeCompare(b.meta.slug);
});

export const EFFECTS: readonly Effect[] = effects;

/** 全站统一编号（按侧边栏顺序 001 起），用于卡片与详情页的 Mono 元数据 */
export function effectNo(effect: Effect): string {
  return String(effects.indexOf(effect) + 1).padStart(3, '0');
}

export const EFFECT_BY_SLUG: ReadonlyMap<string, Effect> = new Map(
  effects.map((e) => [e.meta.slug, e]),
);

export function randomSlug(excludeSlug?: string): string | undefined {
  const pool = effects.filter((e) => e.meta.slug !== excludeSlug);
  if (pool.length === 0) return effects[0]?.meta.slug;
  return pool[Math.floor(Math.random() * pool.length)].meta.slug;
}
