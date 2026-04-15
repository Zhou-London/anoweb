export default function Summary() {
  return (
    <div className="section">
      <div className="section-header">
        <div className="eyebrow">Chapter Wrap-up</div>
        <h2 className="section-title">🎓 The Takeaways</h2>
        <p className="section-lede">
          You made it. Here's the whole chapter distilled to the bits you should
          remember.
        </p>
      </div>

      <div className="takeaway-grid">
        <div className="takeaway-card">
          <div className="takeaway-num">1</div>
          <div className="takeaway-body">
            <h3>Market participants split into two sides</h3>
            <div className="takeaway-sides">
              <div>
                <strong>Sell side</strong>
                <ul>
                  <li>Dealers</li>
                  <li>Brokers</li>
                  <li>Broker-Dealers</li>
                </ul>
              </div>
              <div>
                <strong>Buy side</strong>
                <ul>
                  <li>Indexers</li>
                  <li>Hedgers</li>
                  <li>Institutional Active Managers</li>
                  <li>Asset Allocators</li>
                  <li>Informed Traders</li>
                  <li>Retail Investors</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="takeaway-card">
          <div className="takeaway-num">2</div>
          <div className="takeaway-body">
            <h3>Excess returns come from 5 major sources</h3>
            <ol className="takeaway-list">
              <li>
                <strong>Risk</strong> — getting paid for bearing volatility.
              </li>
              <li>
                <strong>Liquidity</strong> — profiting from the inability of others to
                trade.
              </li>
              <li>
                <strong>Funding constraints</strong> — being able to act when others
                can't.
              </li>
              <li>
                <strong>Predictable flows</strong> — knowing who has to trade, and
                when.
              </li>
              <li>
                <strong>Informational advantage</strong> — knowing things others don't.
              </li>
            </ol>
          </div>
        </div>

        <div className="takeaway-card">
          <div className="takeaway-num">3</div>
          <div className="takeaway-body">
            <h3>Quantitative investing = 3 model families</h3>
            <div className="takeaway-modelgrid">
              <div className="model-pill">
                <div className="model-pill-icon">📉</div>
                <div className="model-pill-label">Risk measurement</div>
              </div>
              <div className="model-pill">
                <div className="model-pill-icon">💥</div>
                <div className="model-pill-label">Market impact</div>
              </div>
              <div className="model-pill">
                <div className="model-pill-icon">📈</div>
                <div className="model-pill-label">Expected returns</div>
              </div>
            </div>
            <p className="takeaway-footer">
              The next chapter dives into returns, the building block of all three. You
              now have the map — and know what the territory looks like.
            </p>
          </div>
        </div>
      </div>

      <div className="final-quote">
        <div className="quote-mark">"</div>
        <p>
          Your success will come from reasoning about the behavior of your
          counterparties, the rules governing the trading of your assets, and the
          functioning of exchanges.
        </p>
        <div className="quote-author">— Chapter takeaway</div>
      </div>

      <div className="next-steps">
        <h3>What's next?</h3>
        <ul>
          <li>
            📖 <strong>Re-read with new eyes.</strong> Now that you have the map, the
            material will feel much more approachable.
          </li>
          <li>
            🔢 <strong>Chapter 2 introduces returns and models</strong> — it has math,
            but the framework you just learned makes it much easier to ground.
          </li>
          <li>
            🧪 <strong>Try explaining a concept to someone else.</strong> Teaching is
            the best test of understanding.
          </li>
        </ul>
      </div>
    </div>
  );
}
