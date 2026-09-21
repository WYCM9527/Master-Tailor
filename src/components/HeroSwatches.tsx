import { EFFECTS, EFFECT_BY_SLUG } from '../contract/registry';
import { EffectCard } from './EffectCard';
import { IconScissors } from './Icons';

/**
 * 首页布样卡挑的效果：不同分类各来一点、缩到小卡里仍看得出在动、开销不重。
 * 找不到的 slug（上游改名）静默跳过，不影响首页渲染。
 */
const SWATCH_SLUGS = [
  'ball-pit',
  'aurora-gradient',
  'silk-flow',
  'tilt-card',
  'metallic-paint-logo',
  'glitch-terminal',
];

const pad2 = (n: number) => String(n).padStart(2, '0');

/**
 * 布样卡：hero 巨字上方 3×2 的「面料墙」，撑满 kicker 与巨字之间的全部高度——每格都是真实效果的活体缩略，
 * 只留预览不带名字（复用 EffectCard 的 compact 模式：接近视口才拉效果包、cover 方式等比放大裁切填满格子、
 * 离屏暂停、点击进详情并带舞台形变转场；名字放在 aria-label / title 里）。
 * 标题行的剪刀是隐喻：小样是从整匹布上裁下来的。
 */
export function HeroSwatches() {
  const effects = SWATCH_SLUGS.map((slug) => EFFECT_BY_SLUG.get(slug)).filter(
    (e): e is NonNullable<typeof e> => e !== undefined,
  );
  if (effects.length === 0) return null;

  return (
    <div className="swatches-wrap">
      <div className="swatch-head mono">
        <IconScissors size={14} />
        Swatches · 布样
        <span className="count">
          {pad2(effects.length)} / {EFFECTS.length}
        </span>
      </div>
      <div className="swatches" aria-label="效果小样">
        {effects.map((effect) => (
          <EffectCard key={effect.meta.slug} effect={effect} compact />
        ))}
      </div>
    </div>
  );
}
