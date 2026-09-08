import { useEffect, useState } from 'react';
import { CopyButton } from './CopyButton';

interface Props {
  /** 导出版代码（当前参数已烘焙） */
  code: string;
  slug: string;
}

/** Shiki 高亮器单例：只装 HTML 语法 + 一个主题 + JS 正则引擎，避免全量语言进产物 */
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
      themes: [import('shiki/themes/one-dark-pro.mjs')],
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
      if (alive) setHighlighted(highlighter.codeToHtml(code, { lang: 'html', theme: 'one-dark-pro' }));
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
      className="block glass code-block"
      open={open}
      onToggle={(e) => setOpen((e.target as HTMLDetailsElement).open)}
    >
      <summary className="block-head">
        <span className="block-title">
          <span className="chevron">▶</span>
          参考代码
          <span className="hint">原生 HTML 单文件，参数已按当前值写入</span>
        </span>
        <div className="block-actions" onClick={(e) => e.preventDefault()}>
          <CopyButton getText={() => code} label="复制代码" />
          <button
            type="button"
            className="btn"
            onClick={(e) => {
              e.preventDefault();
              download();
            }}
          >
            下载 HTML
          </button>
        </div>
      </summary>
      <div className="block-body">
        {highlighted ? (
          <div className="code-view" dangerouslySetInnerHTML={{ __html: highlighted }} />
        ) : (
          <div className="code-view">
            <pre>
              <code>{code}</code>
            </pre>
          </div>
        )}
      </div>
    </details>
  );
}
