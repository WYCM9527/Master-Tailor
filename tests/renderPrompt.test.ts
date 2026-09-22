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
    // 段落标题独占一行；正文里也会提到「【参数】」这类段名（如取舍顺序、检查项），所以按行首定位
    let last = -1;
    for (const s of SECTIONS) {
      const idx = text.search(new RegExp(`(^|\\n)${s}\\n`));
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

  it('【参数】每行带参考实现里的落点（--mt-* / CONFIG.*）与 help', () => {
    const text = renderPrompt({
      meta: fixtureMeta,
      promptMd: fixturePromptMd,
      values: defaultValues(fixtureMeta),
      includeCode: false,
    });
    expect(text).toContain('- 速度 · --mt-speed：1×（1× 是常速）');
    expect(text).toContain('- 主色 · --mt-color：#f9cf00\n'); // 无 help 不加括号
    expect(text).toContain('- 数量 · CONFIG.count：3');
    // 引擎追加的参数核对项接在效果自带的检查项之后
    expect(text).toContain(
      '- 条目数为 3，与参数一致\n- 逐项核对【参数】的值已写入对应的 --mt-* / CONFIG.*',
    );
  });

  it('给了站点地址：不附代码时【参考实现】输出可抓取的 code / meta 地址并保留【实现提示】；附代码时补来源行', () => {
    const site = 'https://example.com/master-tailor/';
    const noCode = renderPrompt({
      meta: fixtureMeta,
      promptMd: fixturePromptMd,
      values: defaultValues(fixtureMeta),
      includeCode: false,
      siteUrl: site,
      previewUrl: `${site}#/e/demo-effect?speed=2`,
    });
    expect(noCode).toContain('以【参考实现】为准，【参数】用于改值');
    expect(noCode).toContain('【实现提示】');
    expect(noCode).toContain(
      '【参考实现】\n- 默认参数版的完整实现（单文件，可直接运行）：https://example.com/master-tailor/code/demo-effect.html',
    );
    expect(noCode).toContain(
      '参数表（键名、类型、范围、默认值、说明）：https://example.com/master-tailor/meta/demo-effect.json',
    );
    expect(
      noCode
        .trimEnd()
        .endsWith(
          '在线预览（供人核对，AI 无需访问）：https://example.com/master-tailor/#/e/demo-effect?speed=2',
        ),
    ).toBe(true);

    const withCode = renderPrompt({
      meta: fixtureMeta,
      promptMd: fixturePromptMd,
      values: defaultValues(fixtureMeta),
      includeCode: true,
      exportedCode: '<html></html>',
      siteUrl: site,
    });
    expect(withCode).toContain(
      '```html\n<html></html>\n```\n\n同一份默认参数版也可从 https://example.com/master-tailor/code/demo-effect.html 获取',
    );
    expect(withCode).not.toContain('【实现提示】');
    expect(withCode).not.toContain('在线预览');
  });

  it('【实现提示】【完成后请检查】【技术要求补充】里的 {{key}} 也按当前值替换', () => {
    const text = renderPrompt({
      meta: fixtureMeta,
      promptMd: fixturePromptMd,
      values: { ...defaultValues(fixtureMeta), speed: 2.5, count: 7 },
      includeCode: false,
    });
    expect(text).toContain('时长按速度 2.5× 换算');
    expect(text).toContain('支持键盘左右切换，共 7 张');
    expect(text).toContain('- 条目数为 7，与参数一致');
    expect(text).not.toContain('{{');
  });

  it('没有站点地址也不附代码：不输出取舍顺序与【参考实现】', () => {
    const text = renderPrompt({
      meta: fixtureMeta,
      promptMd: fixturePromptMd,
      values: defaultValues(fixtureMeta),
      includeCode: false,
    });
    expect(text).not.toContain('以【参考实现】为准');
    expect(text).not.toContain('【参考实现】');
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
