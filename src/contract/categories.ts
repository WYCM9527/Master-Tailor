import type { CategoryId, TriggerId } from './types';

/** 一级分类 */
export const CATEGORIES: { id: CategoryId; name: string }[] = [
  { id: 'background', name: '背景与氛围' },
  { id: 'button', name: '按钮与交互' },
  { id: 'text', name: '文字效果' },
  { id: 'card', name: '卡片与悬停' },
  { id: 'loading', name: '加载与进场' },
  { id: 'canvas', name: '粒子与光标' },
];

/** 二级分类：触发方式（每个一级分类下只展示有效果的项） */
export const TRIGGERS: { id: TriggerId; name: string; desc: string }[] = [
  { id: 'idle', name: '默认效果', desc: '不需要任何操作，打开页面就在动或直接呈现' },
  { id: 'hover', name: '鼠标悬浮', desc: '鼠标移入、悬停或移动时触发' },
  { id: 'click', name: '点击效果', desc: '点击或按下时触发' },
  { id: 'scroll', name: '滚动触发', desc: '页面滚动到指定位置时触发' },
];

export function categoryName(id: CategoryId): string {
  return CATEGORIES.find((c) => c.id === id)?.name ?? id;
}

export function triggerById(id: TriggerId) {
  return TRIGGERS.find((t) => t.id === id) ?? TRIGGERS[0];
}
