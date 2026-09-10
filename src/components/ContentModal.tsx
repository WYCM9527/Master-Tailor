import { useEffect, useRef, type ReactNode } from 'react';

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  /** 标题前的图标 */
  icon?: ReactNode;
  /** 标题旁的 Mono 元信息（字数 / 行数） */
  meta?: string;
  /** 头部右侧的操作按钮 */
  actions?: ReactNode;
  children: ReactNode;
}

/** 方形内容弹窗（Prompt / 参考代码全文）：1px 白边、黑底，Esc 或点击遮罩关闭 */
export function ContentModal({ open, onClose, title, icon, meta, actions, children }: Props) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      className="modal"
      ref={ref}
      onClose={onClose}
      onClick={(e) => {
        // 点在 dialog 自身（即遮罩区域）而不是内容上时关闭
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-inner">
        <div className="blk-head modal-head">
          <span className="blk-title">
            {icon}
            {title}
            {meta && <span className="hint mono">{meta}</span>}
          </span>
          <div className="blk-actions">
            {actions}
            <button type="button" className="btn" onClick={onClose}>
              关闭
            </button>
          </div>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </dialog>
  );
}
