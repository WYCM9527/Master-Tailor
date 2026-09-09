import type { EffectMeta } from '../src/contract/types';

/** 覆盖各参数类型的测试用效果 */
export const fixtureMeta: EffectMeta = {
  slug: 'demo-effect',
  name: '演示效果',
  category: 'background',
  sub: 'idle',
  tags: ['测试'],
  summary: '一个覆盖各种参数类型的演示效果',
  params: [
    {
      key: 'slides',
      label: '幻灯片',
      type: 'images',
      target: 'config',
      min: 2,
      max: 6,
      captions: true,
      default: [
        { src: '/samples/sample-1.webp', caption: '第一张' },
        { src: '/samples/sample-2.webp', caption: '' },
        { src: '/samples/sample-3.webp', caption: '三，带逗号' },
      ],
    },
    { key: 'color', label: '主色', type: 'color', target: 'css', default: '#f9cf00' },
    {
      key: 'speed',
      label: '速度',
      type: 'range',
      target: 'css',
      min: 0.2,
      max: 3,
      step: 0.1,
      default: 1,
      unit: '',
      displayUnit: '×',
    },
    {
      key: 'size',
      label: '尺寸',
      type: 'range',
      target: 'css',
      min: 10,
      max: 100,
      step: 1,
      default: 40,
      unit: 'px',
    },
    { key: 'glow', label: '发光', type: 'toggle', target: 'css', default: true },
    { key: 'text', label: '文字内容', type: 'text', target: 'config', default: '你好，世界' },
    {
      key: 'count',
      label: '数量',
      type: 'range',
      target: 'config',
      min: 1,
      max: 9,
      step: 1,
      default: 3,
    },
    { key: 'font', label: '字体', type: 'font', target: 'css', default: 'system-sans' },
    {
      key: 'photo',
      label: '图片',
      type: 'image',
      target: 'config',
      default: '/samples/sample-1.webp',
    },
  ],
  presets: [
    { id: 'default', name: '默认', values: {} },
    { id: 'alt', name: '变体', values: { color: '#00e5ff', speed: 2 } },
  ],
  thumb: { mode: 'autoplay' },
  source: { kind: 'original' },
};

export const fixtureHtml = `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<title>演示效果</title>
<style>
  :root {
    --mt-bg: #0a0a0f;      /* 页面底色 */
    --mt-color: #f9cf00;   /* 主色 */
    --mt-speed: 1;         /* 速度倍率 */
    --mt-size: 40px;       /* 尺寸 */
    --mt-glow: 1;          /* 发光开关 */
    --mt-font: sans-serif; /* 字体 */
  }
  @media (prefers-reduced-motion: reduce) { .x { animation: none; } }
</style>
</head>
<body>
<script>
  const CONFIG = {
    slides: [{"src":"/samples/sample-1.webp","caption":"第一张"},{"src":"/samples/sample-2.webp","caption":""},{"src":"/samples/sample-3.webp","caption":"三，带逗号"}], // 幻灯片列表
    text: "你好，世界", // 文字内容
    count: 3, // 数量
    photo: "/samples/sample-1.webp", // 图片
  };
  /* @mt:thumb-start */
  if (window.__MT_ENV && window.__MT_ENV.thumb) {
    // 缩略图演示
  }
  /* @mt:thumb-end */
</script>
</body>
</html>
`;

export const fixturePromptMd = `## 效果描述
主色是 {{color}}，速度 {{speed}}，文字为 {{text}}，共 {{count}} 个，底色 {{bg}}，幻灯片：{{slides}}。

## 技术要求补充
- 轮播容器带 aria-roledescription="carousel"，支持键盘左右切换

## 完成后请检查
- 自定义检查一
- 自定义检查二
`;
