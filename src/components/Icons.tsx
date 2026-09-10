import type { SVGProps } from 'react';

/**
 * 站内图标：统一直角线条——方头线帽（square cap）、尖角连接（miter join），
 * 不用圆角与曲线，与 Swiss Grid 的凌厉线条一致。
 * 线宽 1.5（16px 画布上 2px 的密度过高，笔画多的图标会糊成一团）。默认 16px，随文字颜色。
 */
function Svg({ children, className, ...rest }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      className={['icon', className ?? ''].filter(Boolean).join(' ')}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="square"
      strokeLinejoin="miter"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {children}
    </svg>
  );
}

/** 菜单：三条横杠 */
export function IconMenu(props: SVGProps<SVGSVGElement>) {
  return (
    <Svg {...props}>
      <path d="M1.5 3.5h13M1.5 8h13M1.5 12.5h13" />
    </Svg>
  );
}

/** Prompt：折角文档 + 文本行 */
export function IconPrompt(props: SVGProps<SVGSVGElement>) {
  return (
    <Svg {...props}>
      <path d="M3 1.5h6.5l3.5 3.5v9.5H3z" />
      <path d="M9.5 1.5V5H13" />
      <path d="M5.5 8.5h5M5.5 11h5" />
    </Svg>
  );
}

/** 代码：尖括号 < / > */
export function IconCode(props: SVGProps<SVGSVGElement>) {
  return (
    <Svg {...props}>
      <path d="M4.5 3.5L1 8l3.5 4.5M11.5 3.5L15 8l-3.5 4.5M9.5 2l-3 12" />
    </Svg>
  );
}

/** 参数：三条滑轨 + 方形滑块 */
export function IconParams(props: SVGProps<SVGSVGElement>) {
  return (
    <Svg {...props}>
      <path d="M1 3.5h14M1 8h14M1 12.5h14" />
      <rect x="9.5" y="2" width="3" height="3" fill="currentColor" stroke="none" />
      <rect x="3.5" y="6.5" width="3" height="3" fill="currentColor" stroke="none" />
      <rect x="10.5" y="11" width="3" height="3" fill="currentColor" stroke="none" />
    </Svg>
  );
}

/** 右箭头 → */
export function IconArrowRight(props: SVGProps<SVGSVGElement>) {
  return (
    <Svg {...props}>
      <path d="M2 8h11M9 3l5 5-5 5" />
    </Svg>
  );
}

/** 左箭头 ← */
export function IconArrowLeft(props: SVGProps<SVGSVGElement>) {
  return (
    <Svg {...props}>
      <path d="M14 8H3M7 3L2 8l5 5" />
    </Svg>
  );
}

/** 加号 + */
export function IconPlus(props: SVGProps<SVGSVGElement>) {
  return (
    <Svg {...props}>
      <path d="M8 2v12M2 8h12" />
    </Svg>
  );
}

/** 减号 − */
export function IconMinus(props: SVGProps<SVGSVGElement>) {
  return (
    <Svg {...props}>
      <path d="M2 8h12" />
    </Svg>
  );
}

/** 叉 ×（删除 / 关闭） */
export function IconClose(props: SVGProps<SVGSVGElement>) {
  return (
    <Svg {...props}>
      <path d="M3 3l10 10M13 3L3 13" />
    </Svg>
  );
}
