import { useState } from "react";
import type * as Ch4Data from "./data";

type Props = { data: typeof Ch4Data };

export default function BestPractices({ data }: Props) {
  const { bestPracticeCategories } = data;
  const [selectedCat, setSelectedCat] = useState("data");

  const current =
    bestPracticeCategories.find((c) => c.id === selectedCat) ??
    bestPracticeCategories[0];

  return (
    <div className="section">
      <div className="section-header">
        <span className="eyebrow">Section 2 — Best Practices</span>
        <h2 className="section-title">Data Sourcing & Strategy Development</h2>
        <p className="section-lede">
          Before running a single backtest, you need to get the fundamentals
          right. These are the non-negotiable hygiene steps.
        </p>
      </div>

      <div className="exchange-tabs">
        {bestPracticeCategories.map((c) => (
          <button
            key={c.id}
            className={`exchange-tab ${selectedCat === c.id ? "active" : ""}`}
            onClick={() => setSelectedCat(c.id)}
          >
            <span style={{ marginRight: 6 }}>{c.emoji}</span>
            {c.label}
          </button>
        ))}
      </div>

      <div className="exchange-detail" style={{ marginTop: 16 }}>
        <div className="definition-box">
          <div className="definition-term" style={{ marginBottom: 12 }}>
            {current.emoji} {current.label}
          </div>
          {current.items.map((item, i) => (
            <div
              key={i}
              style={{
                padding: "10px 0",
                borderBottom:
                  i < current.items.length - 1
                    ? "1px solid var(--ql-border)"
                    : "none",
              }}
            >
              <strong style={{ color: "var(--ql-text)" }}>{item.name}</strong>
              <p
                style={{
                  margin: "4px 0 0",
                  fontSize: 14,
                  color: "var(--ql-text-muted)",
                  lineHeight: 1.5,
                }}
              >
                {item.detail}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
