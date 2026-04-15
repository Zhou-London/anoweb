import { useState } from "react";
import type * as Ch1Data from "../data/chapter1";

type Props = { data: typeof Ch1Data };

export default function Exchanges({ data }: Props) {
  const { exchangeModes } = data;
  const [selected, setSelected] = useState<string>("exchange");
  const current = exchangeModes.find((m) => m.id === selected) ?? exchangeModes[0];

  return (
    <div className="section">
      <div className="section-header">
        <div className="eyebrow">Section 3</div>
        <h2 className="section-title">Where Trading Actually Happens</h2>
        <p className="section-lede">
          Three very different venues. Same goal: connect buyers and sellers. Let's see
          how each one works.
        </p>
      </div>

      <div className="exchange-tabs">
        {exchangeModes.map((mode) => (
          <button
            key={mode.id}
            type="button"
            className={`exchange-tab ${selected === mode.id ? "active" : ""}`}
            onClick={() => setSelected(mode.id)}
          >
            <div className="exchange-tab-emoji">{mode.emoji}</div>
            <div className="exchange-tab-name">{mode.name}</div>
            <div className="exchange-tab-sub">{mode.subtitle}</div>
          </button>
        ))}
      </div>

      <div className="exchange-detail">
        <div className="exchange-detail-header">
          <div className="exchange-detail-emoji">{current.emoji}</div>
          <h3 className="exchange-detail-title">{current.name}</h3>
        </div>

        {selected === "exchange" && <ExchangeAnimation />}
        {selected === "otc" && <OTCAnimation />}
        {selected === "darkpool" && <DarkPoolAnimation />}

        <div className="exchange-info-grid">
          <div className="exchange-info-card">
            <div className="exchange-info-label">⚙️ How it works</div>
            <p>{current.howItWorks}</p>
          </div>

          <div className="exchange-info-card">
            <div className="exchange-info-label">✅ Strengths</div>
            <ul>
              {current.pros.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </div>

          <div className="exchange-info-card">
            <div className="exchange-info-label">⚠️ Weaknesses</div>
            <ul>
              {current.cons.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </div>

          <div className="exchange-info-card">
            <div className="exchange-info-label">🎯 Typical use</div>
            <p>{current.tradeFraction}</p>
            <div className="example-chips" style={{ marginTop: 8 }}>
              {current.examples.map((ex) => (
                <span key={ex} className="example-chip">
                  {ex}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ExchangeAnimation() {
  return (
    <div className="anim-box">
      <div className="anim-label">The Limit Order Book</div>
      <div className="lob">
        <div className="lob-side lob-bids">
          <div className="lob-side-label">Buyers (Bids)</div>
          <div className="lob-row">
            <span className="lob-qty">500</span>
            <span className="lob-price">$100.02</span>
          </div>
          <div className="lob-row">
            <span className="lob-qty">200</span>
            <span className="lob-price">$100.01</span>
          </div>
          <div className="lob-row lob-best">
            <span className="lob-qty">100</span>
            <span className="lob-price">$100.00</span>
          </div>
        </div>
        <div className="lob-spread">
          <div className="lob-spread-label">spread</div>
          <div className="lob-spread-value">$0.01</div>
        </div>
        <div className="lob-side lob-asks">
          <div className="lob-side-label">Sellers (Asks)</div>
          <div className="lob-row lob-best">
            <span className="lob-qty">150</span>
            <span className="lob-price">$100.01</span>
          </div>
          <div className="lob-row">
            <span className="lob-qty">300</span>
            <span className="lob-price">$100.02</span>
          </div>
          <div className="lob-row">
            <span className="lob-qty">400</span>
            <span className="lob-price">$100.03</span>
          </div>
        </div>
      </div>
      <div className="anim-caption">
        The exchange maintains this "book" and matches buyers and sellers by{" "}
        <strong>price</strong> and <strong>time</strong> priority. Anonymous, fast,
        transparent.
      </div>
    </div>
  );
}

function OTCAnimation() {
  return (
    <div className="anim-box">
      <div className="anim-label">OTC: Dealer Network</div>
      <div className="otc-network">
        <div className="otc-node otc-client">You (Buyer)</div>
        <div className="otc-arrow">→</div>
        <div className="otc-node otc-dealer">Dealer A</div>
        <div className="otc-arrow">↔</div>
        <div className="otc-node otc-dealer">Dealer B</div>
        <div className="otc-arrow">←</div>
        <div className="otc-node otc-client">Someone (Seller)</div>
      </div>
      <div className="anim-caption">
        No central exchange. Dealers quote prices on request and pass orders between
        themselves until a match is found. Common for bonds, currencies, swaps.
      </div>
    </div>
  );
}

function DarkPoolAnimation() {
  return (
    <div className="anim-box">
      <div className="anim-label">Dark Pool: Hidden Orders</div>
      <div className="darkpool">
        <div className="darkpool-cloud">
          <div className="darkpool-order">🔒</div>
          <div className="darkpool-order">🔒</div>
          <div className="darkpool-order">🔒</div>
          <div className="darkpool-order">🔒</div>
          <div className="darkpool-label">Pending orders (hidden)</div>
        </div>
      </div>
      <div className="anim-caption">
        Orders are hidden. Only after a trade executes does anyone see it. Great for
        institutions moving large blocks — nobody can front-run them.
      </div>
    </div>
  );
}
