import { useEffect, useReducer } from 'react';
import type { EffectBundle } from '../contract/types';
import { loadEffectBundle, peekEffectBundle } from '../contract/registry';

/**
 * 取一个效果的效果包（完整 meta + index.html + prompt.md，懒加载）。
 * - 已缓存 → 首次渲染即同步拿到，不经历 undefined 帧（从效果页点卡进详情就是这条路）
 * - 未缓存 → 先返回 undefined，加载完成后触发一次重渲染
 * - slug 传 undefined 表示暂不需要（卡片尚未滚近视口）
 */
export function useEffectBundle(slug: string | undefined): EffectBundle | undefined {
  const [, rerender] = useReducer((n: number) => n + 1, 0);
  const bundle = slug ? peekEffectBundle(slug) : undefined;

  useEffect(() => {
    if (!slug || peekEffectBundle(slug)) return;
    let alive = true;
    loadEffectBundle(slug).then(
      () => {
        if (alive) rerender();
      },
      (err: unknown) => console.error(err),
    );
    return () => {
      alive = false;
    };
  }, [slug]);

  return bundle;
}
