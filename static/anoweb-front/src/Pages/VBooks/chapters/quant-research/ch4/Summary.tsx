import type * as Ch4Data from "./data";

type Props = { data: typeof Ch4Data };

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
              <h3>
                <span className="takeaway-emoji">{t.emoji}</span>
                {t.title}
              </h3>
              <p
                style={{
                  fontSize: 14,
                  lineHeight: 1.6,
                  color: "var(--ql-text-muted)",
                }}
              >
                {t.body}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="final-quote">
        <span className="quote-mark">&#x275D;</span>
        <p>
          History is not replaceable, and sometimes is not deep. The pace at
          which the real world outside of finance changes is breathtaking — and
          markets are a timid reflection of it. Use your judgement and research
          integrity, which no theorems can help.
        </p>
        <div className="quote-author">
          Inspired by general principles of quantitative research
        </div>
      </div>

      <div className="next-steps">
        <h3>What's Next</h3>
        <ul>
          <li>Chapter 5: Evaluating Risk — testing factor models themselves</li>
          <li>
            Chapter 6: Fundamental Factor Models — building characteristic
            models from data
          </li>
          <li>
            Chapter 8: Portfolio Management — turning signals into optimal
            portfolios
          </li>
        </ul>
      </div>
    </div>
  );
}
