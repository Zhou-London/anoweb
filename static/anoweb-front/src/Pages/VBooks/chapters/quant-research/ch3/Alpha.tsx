import { useState } from "react";
import type * as Ch3Data from "./data";

type Props = { data: typeof Ch3Data };

export default function Alpha({ data }: Props) {
  const { alphaTypes } = data;
  const [selected, setSelected] = useState("spanned");
  const current = alphaTypes.find((a) => a.id === selected) ?? alphaTypes[0];

  return (
    <div className="section">
      <div className="section-header">
        <span className="eyebrow">Alpha Decomposition</span>
        <h2 className="section-title">Spanned vs Orthogonal Alpha</h2>
        <p className="section-lede">
          Alpha decomposes into two parts with fundamentally different properties — one mimics factor returns, the other is pure stock-picking skill.
        </p>
      </div>

      <div className="side-toggle">
        {alphaTypes.map((a) => (
          <button
            key={a.id}
            className={`side-btn ${selected === a.id ? "active" : ""}`}
            style={{ "--side-color": a.color } as React.CSSProperties}
            onClick={() => setSelected(a.id)}
          >
            <div className="side-btn-label">{a.emoji} {a.name}</div>
            <div className="side-btn-sub">{a.id === "spanned" ? "Looks like factor returns" : "Pure skill component"}</div>
          </button>
        ))}
      </div>

      <div className="participant-detail">
        <div className="participant-detail-header">
          <span className="participant-detail-emoji">{current.emoji}</span>
          <div>
            <h3>{current.name}</h3>
            <span className="participant-role-big">{current.id === "spanned" ? "In the factor column space" : "Perpendicular to all factors"}</span>
          </div>
        </div>

        <div className="formula-display">
          <span className="formula-tag">Form</span>
          <code>{current.formula}</code>
        </div>

        <p className="participant-desc">{current.description}</p>

        <div className="callout-success callout">
          <span className="callout-emoji">⚡</span>
          <p>{current.implication}</p>
        </div>
      </div>

      <div className="callout" style={{ marginTop: 20 }}>
        <span className="callout-emoji">🧠</span>
        <div>
          <p><strong>The Big Insight:</strong> If orthogonal alpha per-stock doesn't vanish as you add assets, the Sharpe Ratio grows with √n toward infinity. Since that can't happen in real markets, α⊥ per stock must be tiny.</p>
          <p style={{ marginTop: 8 }}>This means real excess returns are mostly <em>alpha spanned</em> — they come with factor risk you can't diversify away. That's why risk management and factor models matter so much.</p>
        </div>
      </div>
    </div>
  );
}
