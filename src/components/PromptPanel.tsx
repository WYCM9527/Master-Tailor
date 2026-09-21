import { useState } from 'react';
import { ContentModal } from './ContentModal';
import { CopyButton } from './CopyButton';
import { IconPrompt, IconUp } from './Icons';

interface PromptProps {
  promptText: string;
  includeCode: boolean;
  onIncludeCodeChange: (v: boolean) => void;
}

/**
 * 左列下半的 Prompt Cell（占 4 栏）：头部（标题 + 「附加代码」开关 + 复制）→ 截断预览；全文在弹窗里。
 * 开关默认开（includeCode: true）：prompt 末尾附带参考代码；关掉后改为输出【实现提示】，状态经 URL 持久化。
 * 预览整块是一个按钮，底部叠渐隐遮罩与「查看全文」提示（提示只是视觉引导，点哪里都打开弹窗）。
 */
export function PromptCell({ promptText, includeCode, onIncludeCodeChange }: PromptProps) {
  const [open, setOpen] = useState(false);
  const meta = `${promptText.length} 字`;
  // 预览框只是「露一角」：截前 40 行，避免把整篇塞进 DOM 再靠 overflow 藏起来
  const preview = promptText.split('\n').slice(0, 40).join('\n');

  const toggle = (
    <label
      className="switch-row"
      title="开：prompt 末尾附带按当前参数烘焙的参考代码；关：只有效果描述与实现提示"
    >
      <button
        type="button"
        role="switch"
        aria-checked={includeCode}
        aria-label="复制 Prompt 时附带参考代码"
        className={`toggle${includeCode ? ' on' : ''}`}
        onClick={() => onIncludeCodeChange(!includeCode)}
      />
      附加代码
    </label>
  );
  const copy = (
    <CopyButton getText={() => promptText} label="复制 Prompt" doneLabel="Prompt 已复制" />
  );

  return (
    <section className="cell blk" aria-label="Prompt">
      <div className="blk-head">
        <span className="blk-title">
          <IconPrompt />
          Prompt
          <span className="hint mono">{meta}</span>
        </span>
        <div className="blk-actions">
          {toggle}
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
        <span className="blk-fade" aria-hidden="true">
          <span className="blk-more">
            查看全文
            <IconUp size={14} />
          </span>
        </span>
      </button>

      <ContentModal
        open={open}
        onClose={() => setOpen(false)}
        title="Prompt"
        icon={<IconPrompt />}
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
