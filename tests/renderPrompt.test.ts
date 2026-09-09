import { describe, expect, it } from 'vitest';
import { renderPrompt } from '../src/engine/renderPrompt';
import { defaultValues } from '../src/engine/urlState';
import { fixtureMeta, fixturePromptMd } from './fixtures';

const SECTIONS = [
  '【任务】',
  '【效果描述】',
  '【参数】',
  '【技术要求】',
  '【完成后请检查】',
  '【如果遇到问题】',
  '【参考实现】',
];

describe('renderPrompt', () => {
  it('包含全部 7 段且顺序正确，不含【放在哪】与底色', () => {
    const text = renderPrompt({
      meta: fixtureMeta,
      promptMd: fixturePromptMd,
      values: defaultValues(fixtureMeta),
      includeCode: true,
      exportedCode: '<!doctype html><html></html>',
    });
    let last = -1;
    for (const s of SECTIONS) {
      const idx = text.indexOf(s);
      expect(idx, `缺少 ${s}`).toBeGreaterThan(last);
      last = idx;
    }
    expect(text).not.toContain('放在哪');
    expect(text).not.toContain('页面底色');
  });

  it('占位符替换为人话：颜色 hex、速度带单位、文字带引号', () => {
    const text = renderPrompt({
      meta: fixtureMeta,
      promptMd: fixturePromptMd,
      values: { ...defaultValues(fixtureMeta), color: '#abcdef', speed: 2.5 },
      includeCode: false,
    });
    expect(text).toContain('主色是 #abcdef');
    expect(text).toContain('速度 2.5×');
    expect(text).toContain('文字为 「你好，世界」');
  });

  it('仅描述模式不含【参考实现】但含【实现提示】；附代码时反之', () => {
    const noCode = renderPrompt({
      meta: fixtureMeta,
      promptMd: fixturePromptMd,
      values: defaultValues(fixtureMeta),
      includeCode: false,
    });
    expect(noCode).not.toContain('【参考实现】');
    expect(noCode).toContain('【实现提示】\n用 transform: translateX 三态过渡实现滑动');
    expect(noCode).toContain('自定义检查一');

    const withCode = renderPrompt({
      meta: fixtureMeta,
      promptMd: fixturePromptMd,
      values: defaultValues(fixtureMeta),
      includeCode: true,
      exportedCode: '<html></html>',
    });
    expect(withCode).toContain('【参考实现】');
    expect(withCode).not.toContain('【实现提示】');
  });

  it('【参数】每行带 help 说明数字含义', () => {
    const text = renderPrompt({
      meta: fixtureMeta,
      promptMd: fixturePromptMd,
      values: defaultValues(fixtureMeta),
      includeCode: false,
    });
    expect(text).toContain('- 速度：1×（1× 是常速）');
    expect(text).toContain('- 主色：#f9cf00\n'); // 无 help 不加括号
  });

  it('images 占位符列出每张图与标题；【技术要求补充】并入技术要求段', () => {
    const text = renderPrompt({
      meta: fixtureMeta,
      promptMd: fixturePromptMd,
      values: defaultValues(fixtureMeta),
      includeCode: false,
    });
    expect(text).toContain('共 3 张');
    expect(text).toContain('第 1 张 ./slide-1.jpg，标题「第一张」');
    expect(text).toContain('第 2 张 ./slide-2.jpg；'); // 空标题不输出「标题」
    expect(text).toContain('第 3 张 ./slide-3.jpg，标题「三，带逗号」');
    const tech = text.slice(text.indexOf('【技术要求】'), text.indexOf('【完成后请检查】'));
    expect(tech).toContain('aria-roledescription="carousel"');
  });
});
