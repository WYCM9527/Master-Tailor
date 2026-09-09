import { CopyButton } from './CopyButton';

interface PromptProps {
  promptText: string;
  includeCode: boolean;
  onIncludeCodeChange: (v: boolean) => void;
}

/** 左列的 Prompt Cell：头部（标题 + 仅描述开关 + 复制按钮）→ 全文 */
export function PromptCell({ promptText, includeCode, onIncludeCodeChange }: PromptProps) {
  return (
    <section className="cell span-8 d-prompt" aria-label="Prompt">
      <div className="blk-head">
        <span className="blk-title">
          Prompt
          <span className="hint mono">复制后粘给任何 AI 编程工具 · {promptText.length} 字</span>
        </span>
        <div className="blk-actions">
          <label className="switch-row">
            <button
              type="button"
              role="switch"
              aria-checked={!includeCode}
              aria-label="仅复制效果描述，不附参考代码"
              className={`toggle${!includeCode ? ' on' : ''}`}
              onClick={() => onIncludeCodeChange(!includeCode)}
            />
            仅描述（不附参考代码）
          </label>
          <CopyButton
            getText={() => promptText}
            label="复制 Prompt"
            doneLabel="Prompt 已复制"
            primary
          />
        </div>
      </div>
      <pre className="prompt-text">{promptText}</pre>
    </section>
  );
}
