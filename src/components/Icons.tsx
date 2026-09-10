import type { CSSProperties, ReactElement } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Close,
  Code,
  FileText,
  HamburgerButton,
  Minus,
  Plus,
  SettingConfig,
} from '@icon-park/react';

/**
 * 站内图标统一取自字节开源 IconPark（https://iconpark.oceanengine.com/official，Apache-2.0）。
 * 本文件是唯一入口：outline 主题、strokeWidth 4（48 画布，16px 显示时约等于 1.33px）、
 * 方头线帽（square）+ 尖角连接（miter），与 Swiss Grid 的直角线条一致。
 * 新增图标请到 IconPark 官网检索后在此包装，不要手绘 path、不要引入其他图标库；
 * 完整规则见 .cursor/rules/icons.mdc。
 */

interface IconProps {
  /** 显示尺寸，默认 16 */
  size?: number | string;
  className?: string;
  style?: CSSProperties;
}

type IconParkComponent = (props: Record<string, unknown>) => ReactElement;

function wrap(Comp: IconParkComponent) {
  return function Icon({ size = 16, className, style }: IconProps) {
    return (
      <Comp
        theme="outline"
        size={size}
        strokeWidth={4}
        strokeLinecap="square"
        strokeLinejoin="miter"
        className={['icon', className].filter(Boolean).join(' ')}
        style={style}
        aria-hidden="true"
      />
    );
  };
}

/** 菜单：三条横杠（hamburger-button） */
export const IconMenu = wrap(HamburgerButton as IconParkComponent);
/** Prompt：文档（file-text） */
export const IconPrompt = wrap(FileText as IconParkComponent);
/** 代码：尖括号（code） */
export const IconCode = wrap(Code as IconParkComponent);
/** 参数：滑轨（setting-config） */
export const IconParams = wrap(SettingConfig as IconParkComponent);
/** 右箭头（arrow-right） */
export const IconArrowRight = wrap(ArrowRight as IconParkComponent);
/** 左箭头（arrow-left） */
export const IconArrowLeft = wrap(ArrowLeft as IconParkComponent);
/** 加号（plus） */
export const IconPlus = wrap(Plus as IconParkComponent);
/** 减号（minus） */
export const IconMinus = wrap(Minus as IconParkComponent);
/** 叉：删除 / 关闭（close） */
export const IconClose = wrap(Close as IconParkComponent);
