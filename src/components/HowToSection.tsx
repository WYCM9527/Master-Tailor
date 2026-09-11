const HOWTO_ID = 'howto';

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
    </section>
  );
}
