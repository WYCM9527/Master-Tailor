import { useEffect, useState } from 'react';
import type { ThemeRegistrationRaw } from 'shiki/core';
import { ContentModal } from './ContentModal';
import { CopyButton } from './CopyButton';

interface Props {
  /** 导出版代码（当前参数已烘焙） */
  code: string;
  slug: string;
}

/** 灰阶高亮主题：靠明度与字重分层，零彩色 */
const MONO_THEME: ThemeRegistrationRaw = {
  name: 'mt-mono',
  type: 'dark',
  colors: {
    'editor.background': '#000000',
    'editor.foreground': '#d4d4d4',
  },
  settings: [
    {
      scope: ['comment', 'punctuation.definition.comment'],
      settings: { foreground: '#6b6b6b', fontStyle: 'italic' },
    },
    { scope: ['string', 'string.quoted', 'string.unquoted'], settings: { foreground: '#d4d4d4' } },
    {
      scope: [
        'keyword',
        'storage',
        'storage.type',
        'entity.name.tag',
        'punctuation.definition.tag',
      ],
      settings: { foreground: '#ffffff', fontStyle: 'bold' },
    },
    {
      scope: [
        'entity.other.attribute-name',
        'support.type.property-name',
        'variable',
        'variable.other',
      ],
      settings: { foreground: '#a3a3a3' },
    },
    { scope: ['entity.name.function', 'support.function'], settings: { foreground: '#ffffff' } },
    {
      scope: ['constant.numeric', 'constant.language', 'constant.other.color'],
      settings: { foreground: '#e5e5e5' },
    },
    { scope: ['punctuation', 'meta.brace'], settings: { foreground: '#8a8a8a' } },
    {
      scope: [
        'entity.name.selector',
        'entity.other.attribute-name.class',
        'entity.other.attribute-name.id',
      ],
      settings: { foreground: '#ffffff' },
    },
  ],
};

/** Shiki 高亮器单例：只装 HTML 语法 + 灰阶主题 + JS 正则引擎，避免全量语言进产物 */
let highlighterPromise: Promise<{
  codeToHtml: (code: string, options: { lang: string; theme: string }) => string;
}> | null = null;

function getHighlighter() {
  highlighterPromise ??= (async () => {
    const [{ createHighlighterCore }, { createJavaScriptRegexEngine }] = await Promise.all([
      import('shiki/core'),
      import('shiki/engine/javascript'),
    ]);
    return createHighlighterCore({
      themes: [MONO_THEME],
      langs: [import('shiki/langs/html.mjs')],
      engine: createJavaScriptRegexEngine(),
    });
  })();
  return highlighterPromise;
}

/** 左列下半的参考代码 Cell（占 4 栏）：头部（标题 + 复制）→ 截断预览 → 底栏（下载 + 查看全文）；全文在弹窗里高亮显示 */
export function CodePanel({ code, slug }: Props) {
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState('');
  const lines = code.split('\n').length;

  // 打开弹窗后才做语法高亮（Shiki 按需动态加载）；参数变化时跟随刷新
  useEffect(() => {
    if (!open) return;
    let alive = true;
    void getHighlighter().then((highlighter) => {
      if (alive) setHighlighted(highlighter.codeToHtml(code, { lang: 'html', theme: 'mt-mono' }));
    });
    return () => {
      alive = false;
    };
  }, [open, code]);

  const download = () => {
    const blob = new Blob([code], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${slug}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copy = <CopyButton getText={() => code} label="复制代码" />;
  const downloadBtn = (
    <button type="button" className="btn" onClick={download}>
      下载 HTML
    </button>
  );

  return (
    <section className="cell span-4 blk" aria-label="参考代码">
      <div className="blk-head">
        <span className="blk-title">
          参考代码
          <span className="hint mono">{lines} 行</span>
        </span>
        <div className="blk-actions">{copy}</div>
      </div>
      <button
        type="button"
        className="blk-preview"
        onClick={() => setOpen(true)}
        aria-label="查看参考代码全文"
      >
        <pre className="code-text">{code}</pre>
      </button>
      <div className="blk-foot">
        <span className="mono blk-foot-note">单文件 · 双击即可在浏览器打开</span>
        <div className="blk-actions">
          {downloadBtn}
          <button type="button" className="btn" onClick={() => setOpen(true)}>
            查看全文
          </button>
        </div>
      </div>

      <ContentModal
        open={open}
        onClose={() => setOpen(false)}
        title="参考代码"
        meta={`原生 HTML 单文件，参数已按当前值写入 · ${lines} 行`}
        actions={
          <>
            {downloadBtn}
            {copy}
          </>
        }
      >
        {highlighted ? (
          <div className="code-view" dangerouslySetInnerHTML={{ __html: highlighted }} />
        ) : (
          <div className="code-view">
            <pre>
              <code>{code}</code>
            </pre>
          </div>
        )}
      </ContentModal>
    </section>
  );
}
