import { describe, expect, it } from 'vitest';
import { renderPrompt } from '../src/engine/renderPrompt';
import { defaultValues } from '../src/engine/urlState';
import { fixtureMeta, fixturePromptMd } from './fixtures';

const SECTIONS = [
  '【任务】',
  '【效果描述】',
  '【参数】',
  '【技术要求】',
  '【放在哪】',
  '【完成后请检查】',
  '【如果遇到问题】',
  '【参考实现】',
];

describe('renderPrompt', () => {
  it('包含全部 8 段且顺序正确', () => {
    const text = renderPrompt({
      meta: fixtureMeta,
      promptMd: fixturePromptMd,
      values: defaultValues(fixtureMeta),
      bg: { mode: 'dark' },
      placement: '',
      includeCode: true,
      exportedCode: '<!doctype html><html></html>',
    });
    let last = -1;
    for (const s of SECTIONS) {
      const idx = text.indexOf(s);
      expect(idx, `缺少 ${s}`).toBeGreaterThan(last);
      last = idx;
    }
  });

  it('占位符替换为人话：颜色 hex、速度带单位、文字带引号、bg 描述', () => {
    const text = renderPrompt({
      meta: fixtureMeta,
      promptMd: fixturePromptMd,
      values: { ...defaultValues(fixtureMeta), color: '#abcdef', speed: 2.5 },
      bg: { mode: 'light' },
      placement: '',
      includeCode: false,
    });
    expect(text).toContain('主色是 #abcdef');
    expect(text).toContain('速度 2.5×');
    expect(text).toContain('文字为 「你好，世界」');
    expect(text).toContain('浅色（#f5f6fa）');
  });

  it('仅描述模式不含【参考实现】；自定义检查与放在哪生效', () => {
    const text = renderPrompt({
      meta: fixtureMeta,
      promptMd: fixturePromptMd,
      values: defaultValues(fixtureMeta),
      bg: { mode: 'custom', color: '#334455' },
      placement: '导航栏下方',
      includeCode: false,
    });
    expect(text).not.toContain('【参考实现】');
    expect(text).toContain('自定义检查一');
    expect(text).toContain('【放在哪】\n导航栏下方');
    expect(text).toContain('自定义颜色 #334455');
  });

  it('images 占位符列出每张图与标题；【技术要求补充】并入技术要求段', () => {
    const text = renderPrompt({
      meta: fixtureMeta,
      promptMd: fixturePromptMd,
      values: defaultValues(fixtureMeta),
      bg: { mode: 'dark' },
      placement: '',
      includeCode: false,
    });
    expect(text).toContain('共 3 张');
    expect(text).toContain('第 1 张 ./slide-1.jpg，标题「第一张」');
    expect(text).toContain('第 2 张 ./slide-2.jpg；'); // 空标题不输出「标题」
    expect(text).toContain('第 3 张 ./slide-3.jpg，标题「三，带逗号」');
    const tech = text.slice(text.indexOf('【技术要求】'), text.indexOf('【放在哪】'));
    expect(tech).toContain('aria-roledescription="carousel"');
  });

  it('placement 为空时输出引导占位句并附建议', () => {
    const text = renderPrompt({
      meta: fixtureMeta,
      promptMd: fixturePromptMd,
      values: defaultValues(fixtureMeta),
      bg: { mode: 'dark' },
      placement: '',
      includeCode: false,
    });
    expect(text).toContain('请把效果加到：＿＿＿');
    expect(text).toContain('建议：放在页面顶部');
  });
});
