import { useEffect, useState } from 'react';
import type { ThemeRegistrationRaw } from 'shiki/core';
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

export function CodePanel({ code, slug }: Props) {
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState('');

  // 展开后才做语法高亮（Shiki 按需动态加载）；参数变化时跟随刷新
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

  return (
    <details
      className="cell span-12 d-code"
      open={open}
      onToggle={(e) => setOpen((e.target as HTMLDetailsElement).open)}
    >
      <summary className="blk-head">
        <span className="blk-title">
          <span className="fold">▸</span>
          参考代码
          <span className="hint mono">
            原生 HTML 单文件，参数已按当前值写入 · {code.split('\n').length} 行
          </span>
        </span>
        <div className="blk-actions" onClick={(e) => e.preventDefault()}>
          <CopyButton getText={() => code} label="复制代码" />
          <button
            type="button"
            className="btn"
            onClick={(e) => {
              e.preventDefault();
              download();
            }}
          >
            下载 HTML <span className="arrow">↓</span>
          </button>
        </div>
      </summary>
      {highlighted ? (
        <div className="code-view" dangerouslySetInnerHTML={{ __html: highlighted }} />
      ) : (
        <div className="code-view">
          <pre>
            <code>{code}</code>
          </pre>
        </div>
      )}
    </details>
  );
}
