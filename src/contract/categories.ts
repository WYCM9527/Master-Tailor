import type { CategoryId, SubDef } from './types';

/** 原有 6 类共用的二级分类：触发方式 */
const TRIGGER_SUBS: SubDef[] = [
  { id: 'idle', name: '自动效果', desc: '不需要任何操作，打开页面就在动或直接呈现' },
  { id: 'hover', name: '鼠标交互', desc: '鼠标移入、悬停或移动时触发' },
  { id: 'click', name: '点击效果', desc: '点击或按下时触发' },
  { id: 'scroll', name: '滚动触发', desc: '页面滚动到指定位置时触发' },
];

/** 「背景效果」不收滚动触发：背景是页面的底，随滚动变化的应归到转场 / 展示类 */
const BACKGROUND_SUBS: SubDef[] = TRIGGER_SUBS.filter((s) => s.id !== 'scroll');

/** 「文字效果」：触发方式之外，多一类持续滚动 / 轮换的纯文字条目 */
const TEXT_SUBS: SubDef[] = [
  ...TRIGGER_SUBS,
  { id: 'marquee', name: '跑马灯', desc: '品牌名、公告等纯文字条目持续滚动或逐条轮换' },
];

/** 「多卡/图展示」的二级分类：按内容形态 */
const SHOWCASE_SUBS: SubDef[] = [
  { id: 'carousel', name: '轮播图', desc: '多张图片或卡片按节奏轮流展示' },
  { id: 'compare', name: '图片对比', desc: '拖动分割线对比两张图片' },
  { id: 'stack-scroll', name: '滚动堆叠', desc: '页面滚动时卡片依次叠上' },
];

/** 「页面转场」的二级分类：按过渡形态（苹果式页面间过渡） */
const TRANSITION_SUBS: SubDef[] = [
  { id: 'shared', name: '共享元素', desc: '点击的元素连续形变到下一页，像同一个物体在两页间移动' },
  { id: 'push', name: '推屏导航', desc: '新页从一侧推入、旧页让位，返回时严格反向' },
  { id: 'zoom', name: '缩放淡入', desc: '新页整体缩放淡入登场，旧页轻轻退后' },
  { id: 'keynote', name: '发布会转场', desc: '擦除、揭示、翻转、溶解等舞台式换场' },
  { id: 'scroll', name: '滚动接力', desc: '随页面滚动推进的换场与分节接力' },
];

/** 一级分类（subs 即该分类下的二级分类表，侧边栏只显示有效果的子项） */
export const CATEGORIES: { id: CategoryId; name: string; subs: SubDef[] }[] = [
  { id: 'background', name: '背景效果', subs: BACKGROUND_SUBS },
  { id: 'button', name: '按钮与交互', subs: TRIGGER_SUBS },
  { id: 'nav', name: '导航菜单', subs: TRIGGER_SUBS },
  { id: 'text', name: '文字效果', subs: TEXT_SUBS },
  { id: 'card', name: '卡片与悬停', subs: TRIGGER_SUBS },
  { id: 'showcase', name: '多卡/图展示', subs: SHOWCASE_SUBS },
  { id: 'transition', name: '页面转场', subs: TRANSITION_SUBS },
  { id: 'loading', name: '加载与进场', subs: TRIGGER_SUBS },
  { id: 'canvas', name: '鼠标交互', subs: TRIGGER_SUBS },
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
