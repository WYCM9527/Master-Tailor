/**
 * 站点部署的 base 路径（vite `base`，以 / 结尾）。根路径部署时为 '/'；
 * GitHub Pages 项目站这类子路径部署（如 /Master-Tailor/）由构建时的 BASE_PATH 决定。
 *
 * 站内静态资源（public/ 下的 /samples/…、/fonts/…）在代码里一律写根路径——
 * 契约、URL 状态、示例图列表都用 /samples/ 前缀识别「站内示例图」；
 * 只在真正要发请求的地方（img src、预览 iframe 烘焙）经 withBase 改写到部署路径下。
 */
export const BASE_URL: string = import.meta.env.BASE_URL || '/';

/** 站内根路径 → 部署路径；blob: / data: / http(s) 等非站内地址原样返回 */
export function withBase(p: string): string {
  if (!p.startsWith('/') || BASE_URL === '/') return p;
  return BASE_URL.replace(/\/$/, '') + p;
}
