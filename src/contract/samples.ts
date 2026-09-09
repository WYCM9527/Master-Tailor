/**
 * 站内示例图（public/samples/ 下的自制抽象 SVG，零版权风险）。
 * 图片 / 图片列表参数的默认值与分享链接编码都以这张表的索引为准，只增不删不改序。
 */
export const SAMPLE_IMAGES = [
  '/samples/sample-1.svg',
  '/samples/sample-2.svg',
  '/samples/sample-3.svg',
  '/samples/sample-4.svg',
  '/samples/sample-5.svg',
  '/samples/sample-6.svg',
  '/samples/sample-7.svg',
  '/samples/sample-8.svg',
];

export function sampleIndex(src: string): number {
  return SAMPLE_IMAGES.indexOf(src);
}

export function sampleByIndex(index: number): string {
  return SAMPLE_IMAGES[index] ?? SAMPLE_IMAGES[0];
}
