import { describe, expect, it } from 'vitest';
import { bakeCode, collectCssVars, configSignature } from '../src/engine/bakeCode';
import { defaultValues } from '../src/engine/urlState';
import { fixtureHtml, fixtureMeta } from './fixtures';

describe('bakeCode', () => {
  it('把 css 参数值写入 --mt-* 声明并保留注释', () => {
    const values = { ...defaultValues(fixtureMeta), color: '#112233', size: 72 };
    const out = bakeCode({ meta: fixtureMeta, html: fixtureHtml, values, bg: '#ffffff', mode: 'export' });
    expect(out).toContain('--mt-color: #112233;   /* 主色 */');
    expect(out).toContain('--mt-size: 72px;');
    expect(out).toContain('--mt-bg: #ffffff;');
  });

  it('替换 CONFIG 值时不破坏含逗号的中文字符串与行内注释', () => {
    const values = { ...defaultValues(fixtureMeta), text: '你好，裁缝，大师', count: 7 };
    const out = bakeCode({ meta: fixtureMeta, html: fixtureHtml, values, bg: '#000000', mode: 'export' });
    expect(out).toContain('text: "你好，裁缝，大师", // 文字内容');
    expect(out).toContain('count: 7, // 数量');
  });

  it('导出模式：剥离 thumb 块、图片写占位路径、附文件头注释', () => {
    const values = { ...defaultValues(fixtureMeta), photo: 'blob:http-local-preview' };
    const out = bakeCode({ meta: fixtureMeta, html: fixtureHtml, values, bg: '#0a0a0f', mode: 'export' });
    expect(out).not.toContain('@mt:thumb-start');
    expect(out).not.toContain('缩略图演示');
    expect(out).toContain('photo: "./your-image.jpg"');
    expect(out).toContain('由裁缝大师 Master-Tailor 生成');
    expect(out).not.toContain('__MT_ENV');
  });

  it('预览模式：注入 runtime 与字体样式表、保留 thumb 块、图片用真实地址', () => {
    const values = { ...defaultValues(fixtureMeta), photo: 'blob:http-local-preview' };
    const out = bakeCode({
      meta: fixtureMeta,
      html: fixtureHtml,
      values,
      bg: '#0a0a0f',
      mode: 'preview',
      thumb: true,
      fontsCssHref: '/fonts/fonts.css',
    });
    expect(out).toContain('window.__MT_ENV = { thumb: true }');
    expect(out).toContain('<link rel="stylesheet" href="/fonts/fonts.css">');
    expect(out).toContain('@mt:thumb-start');
    expect(out).toContain('photo: "blob:http-local-preview"');
  });

  it('font 参数注入 font-family 栈；toggle 注入 1/0', () => {
    const values = { ...defaultValues(fixtureMeta), font: 'jetbrains-mono', glow: false };
    const out = bakeCode({ meta: fixtureMeta, html: fixtureHtml, values, bg: '#0a0a0f', mode: 'export' });
    expect(out).toContain('--mt-font: "JetBrains Mono"');
    expect(out).toContain('--mt-glow: 0;');
  });
});

describe('collectCssVars / configSignature', () => {
  it('collectCssVars 只包含 css 参数和底色', () => {
    const vars = collectCssVars(fixtureMeta, defaultValues(fixtureMeta), '#123456');
    expect(vars['--mt-bg']).toBe('#123456');
    expect(vars['--mt-color']).toBe('#f9cf00');
    expect(vars['--mt-text']).toBeUndefined();
  });

  it('configSignature 只随 config 参数变化', () => {
    const base = defaultValues(fixtureMeta);
    const sig = configSignature(fixtureMeta, base);
    expect(configSignature(fixtureMeta, { ...base, color: '#000000' })).toBe(sig);
    expect(configSignature(fixtureMeta, { ...base, count: 9 })).not.toBe(sig);
  });
});
