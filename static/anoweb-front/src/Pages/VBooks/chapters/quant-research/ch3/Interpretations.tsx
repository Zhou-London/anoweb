import { useState } from "react";
import type * as Ch3Data from "./data";

type Props = { data: typeof Ch3Data };

function FactorGraphSVG() {
  const factors = [
    { x: 80, label: "F₁" },
    { x: 200, label: "F₂" },
    { x: 320, label: "F₃" },
  ];
  const assets = Array.from({ length: 7 }, (_, i) => ({
    x: 40 + i * 53,
    label: `S${i + 1}`,
  }));

  return (
    <div className="anim-box">
      <div className="anim-label">Factor → Asset Network</div>
      <svg viewBox="0 0 400 180" className="sf-svg">
        {factors.map((f, fi) =>
          assets.map((a, ai) => {
            const opacity = Math.random() > 0.4 ? 0.25 : 0.08;
            return (
              <line
                key={`${fi}-${ai}`}
                x1={f.x} y1={40} x2={a.x} y2={130}
                stroke="var(--ql-text-dim)" strokeWidth={1.5} opacity={opacity}
              />
            );
          })
        )}
        {factors.map((f) => (
          <g key={f.label}>
            <circle cx={f.x} cy={30} r={18} fill="#10b981" opacity={0.85} />
            <text x={f.x} y={35} textAnchor="middle" fill="#fff" fontSize={12} fontWeight={700}>{f.label}</text>
          </g>
        ))}
        {assets.map((a) => (
          <g key={a.label}>
            <rect x={a.x - 14} y={125} width={28} height={28} rx={4} fill="#f59e0b" opacity={0.85} />
            <text x={a.x} y={144} textAnchor="middle" fill="#fff" fontSize={10} fontWeight={600}>{a.label}</text>
          </g>
        ))}
        <text x={380} y={35} fill="#10b981" fontSize={10} fontWeight={600}>Factors</text>
        <text x={380} y={80} fill="#9ca3af" fontSize={9}>Loadings</text>
        <text x={380} y={144} fill="#f59e0b" fontSize={10} fontWeight={600}>Assets</text>
      </svg>
      <div className="anim-caption">A few factors (green) drive many asset returns (yellow) through the loadings matrix B</div>
    </div>
  );
}

export default function Interpretations({ data }: Props) {
  const { interpretations } = data;
  const [active, setActive] = useState("graphical");
  const current = interpretations.find((i) => i.id === active) ?? interpretations[0];

  return (
    <div className="section">
      <div className="section-header">
        <span className="eyebrow">Three Perspectives</span>
        <h2 className="section-title">How to Read the Model</h2>
        <p className="section-lede">
          The same equation has three distinct interpretations, each useful in different contexts.
        </p>
      </div>

      <div className="tab-row">
        {interpretations.map((interp) => (
          <button
            key={interp.id}
            className={`tab-btn ${active === interp.id ? "active" : ""}`}
            onClick={() => setActive(interp.id)}
          >
            <span className="tab-emoji">{interp.emoji}</span>
            {interp.label}
          </button>
        ))}
      </div>

      <div className="tab-panel">
        <h3 className="tab-title">{current.title}</h3>
        <p className="tab-para">{current.description}</p>

        <div className="formula-display">
          <span className="formula-tag">Formula</span>
          <code>{current.formula}</code>
        </div>

        {active === "graphical" && <FactorGraphSVG />}

        <div className="callout">
          <span className="callout-emoji">💡</span>
          <p>{current.insight}</p>
        </div>
      </div>
    </div>
  );
}
