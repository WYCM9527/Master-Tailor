import type { Param, ParamValue, SlideItem } from '../contract/types';
import { IMAGE_PLACEHOLDER, slidePlaceholder } from '../contract/types';
import { fontById } from '../contract/fonts';

/**
 * 把参数当前值序列化为可写入 CSS 变量的字符串。
 * @param exportMode 导出模式下图片一律替换为占位路径
 */
export function toCssValue(param: Param, value: ParamValue, exportMode: boolean): string {
  switch (param.type) {
    case 'color':
      return String(value);
    case 'range':
      return `${value}${param.unit ?? ''}`;
    case 'toggle':
      return value ? '1' : '0';
    case 'select':
      return String(value);
    case 'font':
      return fontById(String(value)).stack;
    case 'image': {
      const url = exportMode ? IMAGE_PLACEHOLDER : String(value);
      return `url("${url}")`;
    }
    case 'text':
    case 'images':
      // schema 已禁止 text / images 参数注入 CSS，此分支仅作类型完备
      return JSON.stringify(String(value));
  }
}

/** 把参数当前值序列化为可写入 CONFIG 块的 JS 字面量 */
export function toConfigValue(param: Param, value: ParamValue, exportMode: boolean): string {
  if (param.type === 'image') {
    return JSON.stringify(exportMode ? IMAGE_PLACEHOLDER : String(value));
  }
  if (param.type === 'images') {
    // 单行对象数组；导出模式下图片地址替换为 ./slide-N.jpg 占位
    const slides = value as SlideItem[];
    const out = slides.map((s, i) => ({
      src: exportMode ? slidePlaceholder(i) : s.src,
      caption: s.caption,
    }));
    return JSON.stringify(out);
  }
  if (param.type === 'range') return String(Number(value));
  if (param.type === 'toggle') return value ? 'true' : 'false';
  return JSON.stringify(value);
}
