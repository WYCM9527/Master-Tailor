import { CopyButton } from './CopyButton';

interface ActionsProps {
  promptText: string;
  includeCode: boolean;
  onIncludeCodeChange: (v: boolean) => void;
  getShareUrl: () => string;
}

/** 右列顶部的操作 Cell：主 CTA 常驻视口 */
export function PromptActions({
  promptText,
  includeCode,
  onIncludeCodeChange,
  getShareUrl,
}: ActionsProps) {
  return (
    <div className="d-actions">
      <CopyButton
        getText={() => promptText}
        label="复制 prompt"
        doneLabel="prompt 已复制"
        primary
        large
        block
      />
      <label className="switch-row">
        仅描述（不附参考代码）
        <button
          type="button"
          role="switch"
          aria-checked={!includeCode}
          aria-label="仅复制效果描述，不附参考代码"
          className={`toggle${!includeCode ? ' on' : ''}`}
          onClick={() => onIncludeCodeChange(!includeCode)}
        />
      </label>
      <CopyButton getText={getShareUrl} label="复制分享链接" doneLabel="链接已复制" block />
    </div>
  );
}

interface PromptProps {
  promptText: string;
  placement: string;
  onPlacementChange: (v: string) => void;
}

/** 左列的 prompt Cell：放在哪 + 全文 */
export function PromptCell({ promptText, placement, onPlacementChange }: PromptProps) {
  return (
    <section className="cell span-8 d-prompt" aria-label="Prompt">
      <div className="blk-head">
        <span className="mono">
          Prompt
          <span className="hint">复制后粘给任何 AI 编程工具</span>
        </span>
        <span className="mono">{promptText.length} 字</span>
      </div>
      <div className="placement">
        <label htmlFor="placement-input">放在哪</label>
        <input
          id="placement-input"
          type="text"
          value={placement}
          maxLength={200}
          placeholder="例如：首页最顶部的横幅区域（不填时 AI 会先问你）"
          onChange={(e) => onPlacementChange(e.target.value)}
        />
      </div>
      <pre className="prompt-text">{promptText}</pre>
    </section>
  );
}
