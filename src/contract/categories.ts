import type { CategoryId, SubDef } from './types';

/** 原有 6 类共用的二级分类：触发方式 */
const TRIGGER_SUBS: SubDef[] = [
  { id: 'idle', name: '默认效果', desc: '不需要任何操作，打开页面就在动或直接呈现' },
  { id: 'hover', name: '鼠标悬浮', desc: '鼠标移入、悬停或移动时触发' },
  { id: 'click', name: '点击效果', desc: '点击或按下时触发' },
  { id: 'scroll', name: '滚动触发', desc: '页面滚动到指定位置时触发' },
];

/** 「多卡/图展示」的二级分类：按内容形态 */
const SHOWCASE_SUBS: SubDef[] = [
  { id: 'carousel', name: '轮播图', desc: '多张图片或卡片按节奏轮流展示' },
  { id: 'compare', name: '图片对比', desc: '拖动分割线对比两张图片' },
  { id: 'stack-scroll', name: '滚动堆叠', desc: '页面滚动时卡片依次叠上' },
];

/** 一级分类（subs 即该分类下的二级分类表，侧边栏只显示有效果的子项） */
export const CATEGORIES: { id: CategoryId; name: string; subs: SubDef[] }[] = [
  { id: 'background', name: '背景与氛围', subs: TRIGGER_SUBS },
  { id: 'button', name: '按钮与交互', subs: TRIGGER_SUBS },
  { id: 'text', name: '文字效果', subs: TRIGGER_SUBS },
  { id: 'card', name: '卡片与悬停', subs: TRIGGER_SUBS },
  { id: 'showcase', name: '多卡/图展示', subs: SHOWCASE_SUBS },
  { id: 'loading', name: '加载与进场', subs: TRIGGER_SUBS },
  { id: 'canvas', name: '粒子与光标', subs: TRIGGER_SUBS },
];

export function categoryName(id: CategoryId): string {
  return CATEGORIES.find((c) => c.id === id)?.name ?? id;
}

export function categorySubs(id: CategoryId): SubDef[] {
  return CATEGORIES.find((c) => c.id === id)?.subs ?? [];
}

/** 取某分类下的二级分类定义；未知 id 回退一个占位定义（UI 容错） */
export function subDef(category: CategoryId, subId: string): SubDef {
  return categorySubs(category).find((s) => s.id === subId) ?? { id: subId, name: subId, desc: '' };
}
