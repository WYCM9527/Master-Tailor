import { useEffect, useRef } from 'react';

const TOOLS: { name: string; where: string }[] = [
  { name: 'Trae', where: '打开右侧 AI 对话框（Builder 模式），把 prompt 粘进输入框发送' },
  { name: 'Qoder', where: '在聊天输入框粘贴 prompt 发送' },
  { name: 'Cursor', where: '按 Cmd/Ctrl + I 打开 Agent 面板，粘贴 prompt 发送' },
  { name: 'Claude Code', where: '在终端对话里直接粘贴 prompt 回车' },
  { name: '扣子编程', where: '新建或打开项目后，把 prompt 粘到对话框发送' },
  { name: 'CodeBuddy', where: '在 Craft 对话输入框粘贴 prompt 发送' },
  {
    name: '豆包 / DeepSeek / Kimi 网页版',
    where: '直接发消息；把 AI 返回的代码保存成 .html 文件，双击就能打开看效果',
  },
];

interface Props {
  open: boolean;
  onClose: () => void;
}

export function HowToModal({ open, onClose }: Props) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog className="modal" ref={ref} onClose={onClose}>
      <div className="modal-head">
        <h2>怎么用</h2>
        <button type="button" className="btn-ghost btn" onClick={onClose}>
          关闭
        </button>
      </div>
      <div className="modal-body">
        <div className="howto-steps">
          <div className="howto-step">
            <span className="num">1</span>
            <span>
              <b>挑一个效果</b>：在首页点开你喜欢的效果
            </span>
          </div>
          <div className="howto-step">
            <span className="num">2</span>
            <span>
              <b>调成你要的样子</b>：右侧面板拖滑块、换颜色，预览会实时变化
            </span>
          </div>
          <div className="howto-step">
            <span className="num">3</span>
            <span>
              <b>复制 prompt 粘给 AI</b>：点「复制 prompt」，粘到你常用的 AI 编程工具里发送
            </span>
          </div>
        </div>
        <div className="howto-tools">
          {TOOLS.map((t) => (
            <div className="tool" key={t.name}>
              <b>{t.name}</b>
              {t.where}
            </div>
          ))}
        </div>
        <p className="howto-note">
          任何能写代码的 AI 都可以用。prompt 里已经写清楚了效果长什么样、参数是多少、怎么验收，还附了一份参考代码，AI
          照着做就行。
        </p>
      </div>
    </dialog>
  );
}
