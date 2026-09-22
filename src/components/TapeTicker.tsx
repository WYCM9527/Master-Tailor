import { EFFECTS, effectNo } from '../contract/registry';
import { IconTape } from './Icons';

/** 刻度尺的大格数（每格 100px，一格一个数字）：4800px，足够盖住超宽屏，多余部分被裁掉 */
const MAJOR_TICKS = 48;

/**
 * 软尺：hero 与三步行之间的通栏白带。
 *   - 左端黑色端头（卷尺的金属头）：软尺图标 + 效果总数
 *   - 底部一条静止的刻度（1px 小格 + 每 10 格一个 mono 数字），像贴在桌边的量尺
 *   - 上半部分是全部效果的编号与名字，沿着尺子缓慢滑过（两份拼接、平移 -50% 无缝循环）
 * 纯装饰（aria-hidden），系统开启「减少动态效果」时停止滑动（CSS）。
 */
export function TapeTicker() {
  const items = EFFECTS.map((e) => (
    <span key={e.meta.slug}>
      <b>{effectNo(e)}</b>
      {e.meta.name}
    </span>
  ));
  const itemsAgain = EFFECTS.map((e) => (
    <span key={`${e.meta.slug}-2`}>
      <b>{effectNo(e)}</b>
      {e.meta.name}
    </span>
  ));

  return (
    <div className="tape" aria-hidden="true">
      <div className="tape-end">
        <IconTape size={14} />
        {EFFECTS.length} 效果 · 量体裁衣
      </div>
      <div className="tape-body">
        <div className="tape-track">
          {items}
          {itemsAgain}
        </div>
        <div className="tape-ruler">
          {Array.from({ length: MAJOR_TICKS }, (_, i) => (
            <span key={i} className="tape-major">
              {i * 10}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
