import { useState } from "react";
import type * as Ch4Data from "./data";

type Props = { data: typeof Ch4Data };

export default function WalkForward({ data }: Props) {
  const { walkForwardSchemes, idealProtocolProperties } = data;
  const [selectedScheme, setSelectedScheme] = useState("fixed");
  const [checkedProps, setCheckedProps] = useState<Record<string, boolean>>({});

  const current =
    walkForwardSchemes.find((s) => s.id === selectedScheme) ??
    walkForwardSchemes[0];

  const toggleProp = (id: string) =>
    setCheckedProps((prev) => ({ ...prev, [id]: !prev[id] }));

  /* Walk-forward comparison table */
  const cvMeets = ["nonanticipative", "serial"];
  const wfMeets = ["alldata"];

  return (
    <div className="section">
      <div className="section-header">
        <span className="eyebrow">Section 5 — Walk-Forward</span>
        <h2 className="section-title">Walk-Forward Backtesting</h2>
        <p className="section-lede">
          Use historical data up to time t to predict at time t+1. No shuffling,
          no future information — just like production.
        </p>
      </div>

      {/* Scheme selector */}
      <div className="exchange-tabs">
        {walkForwardSchemes.map((s) => (
          <button
            key={s.id}
            className={`exchange-tab ${selectedScheme === s.id ? "active" : ""}`}
            onClick={() => setSelectedScheme(s.id)}
          >
            {s.name}
          </button>
        ))}
      </div>

      <div className="exchange-detail" style={{ marginTop: 16 }}>
        <div className="definition-box">
          <div className="definition-term">{current.name}</div>
          <div className="definition-body">{current.description}</div>
          <div style={{ display: "flex", gap: 24, marginTop: 12 }}>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: 12,
                  color: "var(--ql-accent)",
                  marginBottom: 4,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                }}
              >
                Pros
              </div>
              {current.pros.map((p, i) => (
                <div
                  key={i}
                  style={{
                    fontSize: 14,
                    color: "var(--ql-text-muted)",
                    lineHeight: 1.8,
                  }}
                >
                  + {p}
                </div>
              ))}
            </div>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: 12,
                  color: "#ef4444",
                  marginBottom: 4,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                }}
              >
                Cons
              </div>
              {current.cons.map((c, i) => (
                <div
                  key={i}
                  style={{
                    fontSize: 14,
                    color: "var(--ql-text-muted)",
                    lineHeight: 1.8,
                  }}
                >
                  - {c}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Ideal protocol checklist — interactive */}
      <div style={{ marginTop: 32 }}>
        <h3 className="section-title" style={{ fontSize: 18 }}>
          The Ideal Backtesting Protocol
        </h3>
        <p
          style={{
            fontSize: 14,
            color: "var(--ql-text-muted)",
            marginBottom: 12,
          }}
        >
          Check each property. CV meets the first pair, walk-forward meets the
          second pair — but neither meets all five.
        </p>

        {idealProtocolProperties.map((p) => {
          const cvHas = !cvMeets.includes(p.id);
          const wfHas = !wfMeets.includes(p.id);
          const checked = !!checkedProps[p.id];

          return (
            <button
              key={p.id}
              onClick={() => toggleProp(p.id)}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
                padding: "10px 12px",
                marginBottom: 6,
                borderRadius: 8,
                border: "1px solid var(--ql-border)",
                background: checked
                  ? "var(--ql-accent-bg, rgba(59,130,246,0.06))"
                  : "transparent",
                cursor: "pointer",
                width: "100%",
                textAlign: "left",
                color: "var(--ql-text)",
              }}
            >
              <span style={{ fontSize: 18, lineHeight: 1 }}>
                {checked ? "\u2611\uFE0F" : "\u2B1C"}
              </span>
              <div style={{ flex: 1 }}>
                <strong>{p.label}</strong>
                <div
                  style={{
                    fontSize: 13,
                    color: "var(--ql-text-muted)",
                    marginTop: 2,
                  }}
                >
                  {p.description}
                </div>
                {checked && (
                  <div
                    style={{
                      fontSize: 12,
                      marginTop: 6,
                      display: "flex",
                      gap: 12,
                    }}
                  >
                    <span style={{ color: cvHas ? "var(--ql-accent)" : "#ef4444" }}>
                      CV: {cvHas ? "\u2713" : "\u2717"}
                    </span>
                    <span style={{ color: wfHas ? "var(--ql-accent)" : "#ef4444" }}>
                      WF: {wfHas ? "\u2713" : "\u2717"}
                    </span>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
