import { useEffect, useRef } from 'react';

interface Props {
  /** 已烘焙的预览 HTML（config 参数变化时整体重建） */
  srcdoc: string;
  /** 当前 CSS 变量表（滑块等样式类参数走热更新，不重置动画） */
  cssVars: Record<string, string>;
  title: string;
}

export function PreviewFrame({ srcdoc, cssVars, title }: Props) {
  const ref = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    ref.current?.contentWindow?.postMessage({ type: 'mt:css', vars: cssVars }, '*');
  }, [cssVars]);

  // iframe 重建完成后补发一次当前变量，消除「重建期间调参丢失」的竞态。
  // onLoad 闭包随每次渲染更新，触发时拿到的 cssVars 就是最新值。
  const onLoad = () => {
    ref.current?.contentWindow?.postMessage({ type: 'mt:css', vars: cssVars }, '*');
  };

  return (
    <iframe
      ref={ref}
      srcDoc={srcdoc}
      onLoad={onLoad}
      sandbox="allow-scripts allow-same-origin"
      title={title}
    />
  );
}
