import { HOWTO_ID } from './TopBar';

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

const STEPS: { title: string; desc: string }[] = [
  { title: '挑一个效果', desc: '进入「全部效果」，按分类浏览，点开你喜欢的那个。' },
  { title: '调成你要的样子', desc: '右侧面板拖滑块、换颜色、改文字，预览会实时变化。' },
  { title: '复制 prompt 粘给 AI', desc: '点「复制 prompt」，粘到你常用的 AI 编程工具里发送即可。' },
];

/** 「怎么用」：首页底部的内联网格区块，取代弹层 */
export function HowToSection() {
  return (
    <section className="g12" id={HOWTO_ID} aria-label="怎么用">
      <div className="cell span-12 howto-head">
        <h2>怎么用</h2>
        <span className="mono">HOW TO USE · 三步</span>
      </div>
      {STEPS.map((s, i) => (
        <div className="cell span-4 howto-step" key={s.title}>
          <span className="idx">{String(i + 1).padStart(2, '0')}</span>
          <p>
            <b>{s.title}</b>
            {s.desc}
          </p>
        </div>
      ))}
      <div className="cell span-12 howto-head">
        <span className="mono">粘到哪里 · {TOOLS.length} 个常用工具</span>
      </div>
      {TOOLS.map((t) => (
        <div className="cell span-3 tool" key={t.name}>
          <b>{t.name}</b>
          <p>{t.where}</p>
        </div>
      ))}
      <div className="cell span-3 tool tool-note">
        任何能写代码的 AI 都可以用。prompt
        里已经写清楚了效果长什么样、参数是多少、怎么验收，还附了一份参考代码，AI 照着做就行。
      </div>
    </section>
  );
}
