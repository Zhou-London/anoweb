import { useState } from "react";
import type * as Ch3Data from "./data";

type Props = { data: typeof Ch3Data };

export default function Transformations({ data }: Props) {
  const { transformations } = data;
  const [openId, setOpenId] = useState<string | null>("rotations");

  return (
    <div className="section">
      <div className="section-header">
        <span className="eyebrow">Model Flexibility</span>
        <h2 className="section-title">Transformations</h2>
        <p className="section-lede">
          A factor model is not unique. Three operations reshape it without changing predictions.
        </p>
      </div>

      <div className="sf-grid">
        {transformations.map((t) => {
          const isOpen = openId === t.id;
          return (
            <div
              key={t.id}
              className={`sf-card ${isOpen ? "open" : ""}`}
              style={{ "--fact-color": t.color } as React.CSSProperties}
            >
              <button
                className="sf-card-header"
                onClick={() => setOpenId(isOpen ? null : t.id)}
              >
                <span className="sf-emoji">{t.emoji}</span>
                <span className="sf-name">{t.name}</span>
                <span className="sf-chevron">{isOpen ? "−" : "+"}</span>
              </button>

              {!isOpen && (
                <div className="sf-plain">{t.subtitle}</div>
              )}

              {isOpen && (
                <div className="sf-detail">
                  <p className="sf-detail-text">{t.description}</p>

                  <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--ql-text-dim)", fontWeight: 600, marginTop: 8 }}>
                    Use Cases
                  </div>
                  <div className="components-grid">
                    {t.useCases.map((uc) => (
                      <div className="component-card" key={uc.label}>
                        <div className="component-name">{uc.label}</div>
                        <div className="component-desc">{uc.detail}</div>
                      </div>
                    ))}
                  </div>

                  {t.id === "rotations" && (
                    <div className="sf-caveat">
                      <strong>Key property:</strong> Total factor risk (b'Ω_f b) is invariant to rotations. Single-factor risk attributions change, but the total stays the same.
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
