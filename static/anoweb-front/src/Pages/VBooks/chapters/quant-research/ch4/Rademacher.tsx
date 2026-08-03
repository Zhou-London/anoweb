import { useState } from "react";
import type * as Ch4Data from "./data";

type Props = { data: typeof Ch4Data };

export default function Rademacher({ data }: Props) {
  const { rademacherInterpretations } = data;
  const [selectedInterp, setSelectedInterp] = useState("noise");

  const current =
    rademacherInterpretations.find((r) => r.id === selectedInterp) ??
    rademacherInterpretations[0];

  return (
    <div className="section">
      <div className="section-header">
        <span className="eyebrow">Section 7 — The Rademacher Anti-Serum</span>
        <h2 className="section-title">A Principled Haircut on Performance</h2>
        <p className="section-lede">
          The Rademacher complexity measures how well your strategy set can
          fit pure noise. The higher it is, the bigger the penalty you pay.
        </p>
      </div>

      {/* Core definition */}
      <div className="formula-display" style={{ marginBottom: 24 }}>
        <span className="formula-tag">Definition</span>
        <code style={{ fontSize: 16 }}>
          R&#x0302; = E<sub>{"\u03B5"}</sub>(sup<sub>n</sub> |{"\u03B5"}
          {"\u2032"}x<sup>n</sup>| / T)
        </code>
      </div>

      <p
        style={{
          fontSize: 14,
          color: "var(--ql-text-muted)",
          lineHeight: 1.7,
          marginBottom: 20,
        }}
      >
        Here {"\u03B5"} is a Rademacher random vector — each element is +1 or
        -1 with equal probability. x<sup>n</sup> is the performance time series
        of strategy n. R&#x0302; measures the worst-case correlation between any
        strategy and random noise.
      </p>

      {/* Three interpretations */}
      <div className="exchange-tabs">
        {rademacherInterpretations.map((r) => (
          <button
            key={r.id}
            className={`exchange-tab ${selectedInterp === r.id ? "active" : ""}`}
            onClick={() => setSelectedInterp(r.id)}
          >
            {r.emoji} {r.label}
          </button>
        ))}
      </div>

      <div className="exchange-detail" style={{ marginTop: 16 }}>
        <div className="definition-box">
          <div className="definition-term">{current.title}</div>
          <div className="definition-body">{current.description}</div>
        </div>
      </div>

      {/* Key properties */}
      <div style={{ marginTop: 24 }}>
        <h3 style={{ fontSize: 16, marginBottom: 10, color: "var(--ql-text)" }}>
          Key Properties
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[
            {
              icon: "\u{1F4C8}",
              text: "More diverse (uncorrelated) strategies \u2192 higher complexity",
            },
            {
              icon: "\u{1F501}",
              text: "N identical strategies \u2192 same complexity as 1 strategy",
            },
            {
              icon: "\u{1F4CA}",
              text: "Easy to compute even for millions of strategies via Monte Carlo",
            },
            {
              icon: "\u23F3",
              text: "Does NOT go to zero as T \u2192 \u221E (unlike estimation error)",
            },
          ].map((prop, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 14,
                color: "var(--ql-text-muted)",
              }}
            >
              <span>{prop.icon}</span>
              <span>{prop.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
