import type * as Ch2Data from "../../data/chapter2";

type Props = { data: typeof Ch2Data };

export default function Summary({ data }: Props) {
  const { takeaways } = data;
  return (
    <div className="section">
      <div className="section-header">
        <div className="eyebrow">Chapter 2 Wrap-up</div>
        <h2 className="section-title">🎓 The Takeaways</h2>
        <p className="section-lede">
          You made it through the math chapter. Here is the whole thing distilled into
          5 things worth carrying forward.
        </p>
      </div>

      <div className="ch2-takeaway-grid">
        {takeaways.map((t, idx) => (
          <div key={t.title} className="takeaway-card">
            <div className="takeaway-num">{idx + 1}</div>
            <div className="takeaway-body">
              <h3>
                <span className="takeaway-emoji">{t.emoji}</span> {t.title}
              </h3>
              <p>{t.body}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="final-quote">
        <div className="quote-mark">"</div>
        <p>
          GARCH models capture most properties of returns, and can be used to estimate
          volatility. The GARCH volatility estimates are exponential weighted averages
          of non-iid squared returns.
        </p>
        <div className="quote-author">— Chapter 2 Takeaways</div>
      </div>

      <div className="next-steps">
        <h3>What you can now do</h3>
        <ul>
          <li>
            📐 <strong>Define a return correctly</strong> — including dividends, the
            risk-free rate, and when to use log returns.
          </li>
          <li>
            🔍 <strong>Recognize the 4 stylized facts</strong> in any plot of returns.
          </li>
          <li>
            🌪️ <strong>Read a GARCH(1,1) equation</strong> and explain what each
            parameter does in English.
          </li>
          <li>
            ⏱️ <strong>Compute Realized Volatility</strong> from intraday data, and
            know its failure modes.
          </li>
          <li>
            🔗 <strong>See the unifying view:</strong> EWMA, GARCH and Kalman filters
            are all members of the state-space family.
          </li>
        </ul>
      </div>
    </div>
  );
}
