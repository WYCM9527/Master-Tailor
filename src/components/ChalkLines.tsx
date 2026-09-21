import { useEffect, useRef, type RefObject } from 'react';

const pad4 = (n: number) => String(Math.max(0, Math.round(n))).padStart(4, '0');

/**
 * 划粉十字线：跟随指针的横竖两条 1px 虚线 + 角落一行 mono 坐标，像裁缝在布上划粉定位。
 * 挂在 hero 巨字格里（容器需 position: relative）。只在 (pointer: fine) 下显示（CSS 控制），
 * 坐标直接写到容器的 CSS 变量与文本节点上，不经 React 状态，mousemove 不触发重渲染。
 */
export function ChalkLines({ target }: { target: RefObject<HTMLElement | null> }) {
  const labelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = target.current;
    if (!el) return;
    const move = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      el.style.setProperty('--cx', `${x}px`);
      el.style.setProperty('--cy', `${y}px`);
      el.classList.add('chalk-on');
      if (labelRef.current) labelRef.current.textContent = `x ${pad4(x)} · y ${pad4(y)}`;
    };
    const leave = () => el.classList.remove('chalk-on');
    el.addEventListener('mousemove', move);
    el.addEventListener('mouseleave', leave);
    return () => {
      el.removeEventListener('mousemove', move);
      el.removeEventListener('mouseleave', leave);
      el.classList.remove('chalk-on');
    };
  }, [target]);

  return (
    <>
      <span className="chalk chalk-x" aria-hidden="true" />
      <span className="chalk chalk-y" aria-hidden="true" />
      <span className="chalk chalk-xy mono" aria-hidden="true" ref={labelRef} />
    </>
  );
}
