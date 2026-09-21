import { useEffect, useState } from 'react';

interface Props {
  value: number;
  /** 最少位数，不足补 0（保持等宽字宽度稳定，如 272 → "272"、9 → "09"） */
  pad?: number;
  /** 翻滚时长（ms） */
  duration?: number;
}

function reducedMotion(): boolean {
  return (
    typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

/**
 * 进场时从 0 翻滚到目标值的等宽数字（首页元数据格）。
 * 位数按目标值补零，翻滚过程中宽度不变；系统开启「减少动态效果」时直接显示终值。
 */
export function CountUp({ value, pad = 0, duration = 900 }: Props) {
  // 减少动态效果：初始态即终值，效果里不再动它
  const [n, setN] = useState(() => (reducedMotion() ? value : 0));

  useEffect(() => {
    if (reducedMotion()) return;
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(value * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);

  return <>{String(n).padStart(Math.max(pad, String(value).length), '0')}</>;
}
