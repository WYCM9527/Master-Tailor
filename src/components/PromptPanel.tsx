import { CopyButton } from './CopyButton';

interface Props {
  promptText: string;
  placement: string;
  onPlacementChange: (v: string) => void;
  includeCode: boolean;
  onIncludeCodeChange: (v: boolean) => void;
  getShareUrl: () => string;
}

export function PromptPanel({
  promptText,
  placement,
  onPlacementChange,
  includeCode,
  onIncludeCodeChange,
  getShareUrl,
}: Props) {
  return (
    <section className="block glass">
      <div className="block-head">
        <span className="block-title">
          Prompt
          <span className="hint">复制后粘给任何 AI 编程工具</span>
        </span>
        <div className="block-actions">
          <label className="switch-row">
            <button
              type="button"
              role="switch"
              aria-checked={!includeCode}
              aria-label="仅复制效果描述，不附参考代码"
              className={`toggle${!includeCode ? ' on' : ''}`}
              onClick={() => onIncludeCodeChange(!includeCode)}
            />
            仅描述（不附代码）
          </label>
          <CopyButton getText={getShareUrl} label="复制分享链接" doneLabel="链接已复制" />
          <CopyButton getText={() => promptText} label="复制 prompt" accent large />
        </div>
      </div>
      <div className="block-body">
        <div className="placement-row">
          <label htmlFor="placement-input">放在哪：</label>
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
      </div>
    </section>
  );
}
