import type { SVGProps } from 'react';

/**
 * 站内图标：统一 2px 直角线条——方头线帽（square cap）、尖角连接（miter join），
 * 不用圆角与曲线，与 Swiss Grid 的凌厉线条一致。默认 16px，随文字颜色。
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
      strokeWidth="2"
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
      <path d="M1 3h14M1 8h14M1 13h14" />
    </Svg>
  );
}

/** Prompt：终端提示符 >_ */
export function IconPrompt(props: SVGProps<SVGSVGElement>) {
  return (
    <Svg {...props}>
      <path d="M2 3l5 5-5 5M9 13h5" />
    </Svg>
  );
}

/** 代码：尖括号 < / > */
export function IconCode(props: SVGProps<SVGSVGElement>) {
  return (
    <Svg {...props}>
      <path d="M5 3L1 8l4 5M11 3l4 5-4 5M9.5 2l-3 12" />
    </Svg>
  );
}

/** 参数：三条滑轨 + 方形滑块 */
export function IconParams(props: SVGProps<SVGSVGElement>) {
  return (
    <Svg {...props}>
      <path d="M1 3.5h14M1 8h14M1 12.5h14" />
      <rect x="9" y="1.5" width="3" height="4" fill="currentColor" stroke="none" />
      <rect x="3" y="6" width="3" height="4" fill="currentColor" stroke="none" />
      <rect x="10" y="10.5" width="3" height="4" fill="currentColor" stroke="none" />
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
