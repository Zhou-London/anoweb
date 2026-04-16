import type * as Ch3Data from "./data";

type Props = { data: typeof Ch3Data };

export default function Summary({ data }: Props) {
  const { takeaways } = data;

  return (
    <div className="section">
      <div className="section-header">
        <span className="eyebrow">Chapter Complete</span>
        <h2 className="section-title">Key Takeaways</h2>
      </div>

      <div className="takeaway-grid">
        {takeaways.map((t, i) => (
          <div className="takeaway-card" key={i}>
            <div className="takeaway-num">{i + 1}</div>
            <div className="takeaway-body">
              <h3><span className="takeaway-emoji">{t.emoji}</span>{t.title}</h3>
              <p style={{ fontSize: 14, lineHeight: 1.6, color: "var(--ql-text-muted)" }}>{t.body}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="final-quote">
        <span className="quote-mark">&#x275D;</span>
        <p>Factor models are the lingua franca of quantitative investing. Even if you outgrow them, they will still be how you reason about the entire investment process.</p>
        <div className="quote-author">Adapted from Paleologo</div>
      </div>

      <div className="next-steps">
        <h3>What's Next</h3>
        <ul>
          <li>Chapter 4: Evaluating Excess Returns — how to test if your alpha is real</li>
          <li>Chapter 6: Fundamental Factor Models — building characteristic models from data</li>
          <li>Chapter 7: Statistical Factor Models — extracting factors from returns alone</li>
        </ul>
      </div>
    </div>
  );
}
