import { useState } from "react";
import type * as Ch4Data from "./data";

type Props = { data: typeof Ch4Data };

export default function Backtesting({ data }: Props) {
  const { cvSteps, cvProblems } = data;
  const [activeStep, setActiveStep] = useState(0);
  const [showProblems, setShowProblems] = useState(false);

  return (
    <div className="section">
      <div className="section-header">
        <span className="eyebrow">Section 4 — The Backtesting Protocol</span>
        <h2 className="section-title">Cross-Validation: How and Why</h2>
        <p className="section-lede">
          Cross-validation is a staple of machine learning. But applying it to
          financial time series has some dangerous pitfalls.
        </p>
      </div>

      {/* CV steps interactive */}
      <div style={{ marginBottom: 24 }}>
        <div
          style={{
            fontSize: 13,
            color: "var(--ql-text-muted)",
            marginBottom: 8,
            textTransform: "uppercase",
            letterSpacing: 1,
          }}
        >
          K-Fold Cross-Validation Steps
        </div>

        {/* Visual fold diagram */}
        <div
          style={{
            display: "flex",
            gap: 4,
            marginBottom: 16,
            padding: "12px 0",
          }}
        >
          {cvSteps.map((step, i) => (
            <button
              key={i}
              onClick={() => setActiveStep(i)}
              style={{
                flex: 1,
                height: 40,
                borderRadius: 6,
                border: "2px solid",
                borderColor:
                  i === activeStep ? step.color : "var(--ql-border)",
                background:
                  i === activeStep ? step.color + "22" : "transparent",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
                fontWeight: i === activeStep ? 700 : 400,
                color:
                  i === activeStep ? step.color : "var(--ql-text-muted)",
                transition: "all 0.2s",
              }}
            >
              {i + 1}
            </button>
          ))}
        </div>

        <div className="definition-box">
          <div
            className="definition-term"
            style={{ color: cvSteps[activeStep].color }}
          >
            Step {activeStep + 1}: {cvSteps[activeStep].label}
          </div>
          <div className="definition-body">
            {cvSteps[activeStep].detail}
          </div>
        </div>
      </div>

      {/* CV Problems */}
      <button
        className="btn btn-primary"
        onClick={() => setShowProblems((p) => !p)}
        style={{ marginBottom: 16 }}
      >
        {showProblems ? "Hide" : "Reveal"} Problems with CV for Finance{" "}
        {showProblems ? "\u25B2" : "\u25BC"}
      </button>

      {showProblems && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {cvProblems.map((p) => (
            <div className="definition-box" key={p.id}>
              <div className="definition-term">
                {p.emoji} {p.title}
              </div>
              <div className="definition-body">{p.description}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
