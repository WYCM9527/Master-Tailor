import { useEffect, useRef, useState } from 'react';

interface Props {
  /** 点击时取当前文本（惰性求值，避免每次渲染都生成大字符串） */
  getText: () => string;
  label: string;
  doneLabel?: string;
  className?: string;
}

export function CopyButton({ getText, label, doneLabel = '已复制', className }: Props) {
  const [done, setDone] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const onClick = async () => {
    try {
      await navigator.clipboard.writeText(getText());
    } catch {
      // clipboard API 不可用时退回 textarea 方案
      const ta = document.createElement('textarea');
      ta.value = getText();
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
    }
    setDone(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setDone(false), 1600);
  };

  return (
    <button
      type="button"
      className={['btn', className ?? ''].filter(Boolean).join(' ')}
      onClick={onClick}
    >
      {done ? doneLabel : label}
    </button>
  );
}
