import { useState } from "react";
import type * as Ch3Data from "./data";

type Props = { data: typeof Ch3Data };

export default function FactorTypes({ data }: Props) {
  const { factorModelTypes } = data;
  const [selected, setSelected] = useState("characteristic");
  const current = factorModelTypes.find((t) => t.id === selected) ?? factorModelTypes[0];

  return (
    <div className="section">
      <div className="section-header">
        <span className="eyebrow">Estimation Approaches</span>
        <h2 className="section-title">Factor Model Types</h2>
        <p className="section-lede">
          Three approaches to building a factor model. Each observes different inputs and estimates the rest.
        </p>
      </div>

      <div className="exchange-tabs">
        {factorModelTypes.map((t) => (
          <button
            key={t.id}
            className={`exchange-tab ${selected === t.id ? "active" : ""}`}
            onClick={() => setSelected(t.id)}
          >
            <div className="exchange-tab-emoji">{t.emoji}</div>
            <div className="exchange-tab-name">{t.name}</div>
            <div className="exchange-tab-sub">Inputs: {t.inputs}</div>
          </button>
        ))}
      </div>

      <div className="exchange-detail">
        <div className="exchange-detail-header">
          <span className="exchange-detail-emoji">{current.emoji}</span>
          <h3 className="exchange-detail-title">{current.name}</h3>
        </div>

        <div className="definition-box">
          <div className="definition-row">
            <div className="definition-label">Observed</div>
            <div className="definition-text">{current.inputs}</div>
          </div>
          <div className="definition-row">
            <div className="definition-label">Estimated</div>
            <div className="definition-text">{current.estimated}</div>
          </div>
        </div>

        <p style={{ fontSize: 15, lineHeight: 1.65, color: "var(--ql-text-muted)" }}>
          {current.description}
        </p>

        <div className="callout">
          <span className="callout-emoji">📖</span>
          <p>Covered in: <strong>{current.covered}</strong></p>
        </div>
      </div>
    </div>
  );
}
