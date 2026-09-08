import type { CategoryId } from './types';

export const CATEGORIES: { id: CategoryId; name: string }[] = [
  { id: 'background', name: '背景与氛围' },
  { id: 'button', name: '按钮与交互' },
  { id: 'text', name: '文字效果' },
  { id: 'card', name: '卡片与悬停' },
  { id: 'loading', name: '加载与进场' },
  { id: 'canvas', name: '粒子与光标' },
];

export function categoryName(id: CategoryId): string {
  return CATEGORIES.find((c) => c.id === id)?.name ?? id;
}
