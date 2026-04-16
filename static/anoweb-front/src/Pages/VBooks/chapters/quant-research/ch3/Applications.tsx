import { useState } from "react";
import type * as Ch3Data from "./data";

type Props = { data: typeof Ch3Data };

export default function Applications({ data }: Props) {
  const { applications } = data;
  const [selected, setSelected] = useState("attribution");
  const current = applications.find((a) => a.id === selected) ?? applications[0];

  return (
    <div className="section">
      <div className="section-header">
        <span className="eyebrow">Putting It to Work</span>
        <h2 className="section-title">Applications of Factor Models</h2>
        <p className="section-lede">
          Factor models serve four core functions in quantitative investing.
        </p>
      </div>

      <div className="exchange-tabs" style={{ gridTemplateColumns: "repeat(2, 1fr)" }}>
        {applications.map((app) => (
          <button
            key={app.id}
            className={`exchange-tab ${selected === app.id ? "active" : ""}`}
            onClick={() => setSelected(app.id)}
          >
            <div className="exchange-tab-emoji">{app.emoji}</div>
            <div className="exchange-tab-name">{app.label}</div>
          </button>
        ))}
      </div>

      <div className="exchange-detail">
        <div className="exchange-detail-header">
          <span className="exchange-detail-emoji">{current.emoji}</span>
          <h3 className="exchange-detail-title">{current.title}</h3>
        </div>

        <p style={{ fontSize: 15, lineHeight: 1.65, color: "var(--ql-text-muted)" }}>
          {current.body}
        </p>

        <div className="formula-display">
          <span className="formula-tag">Key</span>
          <code>{current.formula}</code>
        </div>

        <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--ql-text-dim)", fontWeight: 600 }}>
          Key Terms
        </div>
        <div className="definition-box">
          {current.keyTerms.map((kt) => (
            <div className="definition-row" key={kt.term}>
              <div className="definition-label">{kt.term}</div>
              <div className="definition-text">{kt.def}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
