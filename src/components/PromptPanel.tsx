import { useState } from 'react';
import { ContentModal } from './ContentModal';
import { CopyButton } from './CopyButton';

interface PromptProps {
  promptText: string;
  includeCode: boolean;
  onIncludeCodeChange: (v: boolean) => void;
}

/** 左列下半的 Prompt Cell（占 4 栏）：头部（标题 + 复制）→ 截断预览 → 底栏（仅描述开关 + 查看全文）；全文在弹窗里 */
export function PromptCell({ promptText, includeCode, onIncludeCodeChange }: PromptProps) {
  const [open, setOpen] = useState(false);
  const meta = `${promptText.length} 字`;
  // 预览框只是「露一角」：截前 40 行，避免把整篇塞进 DOM 再靠 overflow 藏起来
  const preview = promptText.split('\n').slice(0, 40).join('\n');

  const toggle = (
    <label className="switch-row" title="只复制效果描述，不附参考代码">
      <button
        type="button"
        role="switch"
        aria-checked={!includeCode}
        aria-label="仅复制效果描述，不附参考代码"
        className={`toggle${!includeCode ? ' on' : ''}`}
        onClick={() => onIncludeCodeChange(!includeCode)}
      />
      仅描述
    </label>
  );
  const copy = (
    <CopyButton getText={() => promptText} label="复制 Prompt" doneLabel="Prompt 已复制" />
  );
  const viewAll = (
    <button type="button" className="btn" onClick={() => setOpen(true)}>
      查看全文
    </button>
  );

  return (
    <section className="cell span-4 blk" aria-label="Prompt">
      <div className="blk-head">
        <span className="blk-title">
          Prompt
          <span className="hint mono">{meta}</span>
        </span>
        <div className="blk-actions">
          {toggle}
          {viewAll}
          {copy}
        </div>
      </div>
      <button
        type="button"
        className="blk-preview"
        onClick={() => setOpen(true)}
        aria-label="查看 Prompt 全文"
      >
        <pre className="prompt-text">{preview}</pre>
      </button>

      <ContentModal
        open={open}
        onClose={() => setOpen(false)}
        title="Prompt"
        meta={`复制后粘给任何 AI 编程工具 · ${meta}`}
        actions={
          <>
            {toggle}
            {copy}
          </>
        }
      >
        <pre className="prompt-text">{promptText}</pre>
      </ContentModal>
    </section>
  );
}
