import { useState } from "react";
import type * as Ch3Data from "./data";

type Props = { data: typeof Ch3Data };

export default function FactorModel({ data }: Props) {
  const { factorModelParts, covarianceFormula, loadingsTypes } = data;
  const [selectedPart, setSelectedPart] = useState("r");
  const [selectedLoading, setSelectedLoading] = useState("style");

  const currentPart = factorModelParts.find((p) => p.symbol === selectedPart) ?? factorModelParts[0];
  const currentLoading = loadingsTypes.find((l) => l.id === selectedLoading) ?? loadingsTypes[0];

  return (
    <div className="section">
      <div className="section-header">
        <span className="eyebrow">The Core Equation</span>
        <h2 className="section-title">The Factor Model</h2>
        <p className="section-lede">
          Every stock's return is the sum of three things: alpha (expected skill), factor-driven returns, and idiosyncratic noise.
        </p>
      </div>

      <div className="formula-display">
        <span className="formula-tag">Model</span>
        <code>r = α + Bf + ε</code>
      </div>

      <p style={{ fontSize: 14, color: "var(--ql-text-dim)", textAlign: "center" }}>
        Click any symbol to learn what it represents
      </p>

      <div className="exchange-tabs" style={{ gridTemplateColumns: `repeat(${factorModelParts.length}, 1fr)` }}>
        {factorModelParts.map((p) => (
          <button
            key={p.symbol}
            className={`exchange-tab ${selectedPart === p.symbol ? "active" : ""}`}
            onClick={() => setSelectedPart(p.symbol)}
          >
            <div className="exchange-tab-emoji" style={{ fontFamily: "ui-monospace, monospace", fontSize: 24 }}>{p.symbol}</div>
            <div className="exchange-tab-name">{p.name}</div>
          </button>
        ))}
      </div>

      <div className="exchange-detail">
        <div className="exchange-detail-header">
          <span className="exchange-detail-emoji" style={{ fontFamily: "ui-monospace, monospace" }}>{currentPart.symbol}</span>
          <h3 className="exchange-detail-title">{currentPart.name}</h3>
        </div>
        <p style={{ fontSize: 15, lineHeight: 1.65, color: "var(--ql-text-muted)" }}>{currentPart.description}</p>
      </div>

      <div style={{ marginTop: 28 }}>
        <h3 style={{ fontSize: 22, fontWeight: 600, marginBottom: 14, color: "var(--ql-text)" }}>Covariance Decomposition</h3>
        <div className="formula-display">
          <span className="formula-tag">Key</span>
          <code>{covarianceFormula.equation}</code>
        </div>
        <div className="definition-box" style={{ marginTop: 14 }}>
          {covarianceFormula.parts.map((p) => (
            <div className="definition-row" key={p.symbol}>
              <div className="definition-label">{p.symbol}</div>
              <div className="definition-text">{p.detail}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="callout" style={{ marginTop: 20 }}>
        <span className="callout-emoji">💡</span>
        <p>This decomposition compresses an n×n covariance matrix into a low-rank factor part (rank m) plus a sparse diagonal — making it possible to model 5,000+ stocks with just 50–100 factors.</p>
      </div>

      <div style={{ marginTop: 28 }}>
        <h3 style={{ fontSize: 22, fontWeight: 600, marginBottom: 14, color: "var(--ql-text)" }}>Types of Loadings</h3>
        <div className="exchange-tabs">
          {loadingsTypes.map((l) => (
            <button
              key={l.id}
              className={`exchange-tab ${selectedLoading === l.id ? "active" : ""}`}
              onClick={() => setSelectedLoading(l.id)}
            >
              <div className="exchange-tab-emoji">{l.emoji}</div>
              <div className="exchange-tab-name">{l.name}</div>
            </button>
          ))}
        </div>
        <div className="exchange-detail">
          <p style={{ fontSize: 15, lineHeight: 1.65, color: "var(--ql-text-muted)" }}>{currentLoading.description}</p>
          <div className="security-analogy">
            <div className="analogy-label">Example</div>
            <div className="analogy-text">{currentLoading.example}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
