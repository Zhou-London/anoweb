import { useState } from "react";
import type * as Ch4Data from "./data";

type Props = { data: typeof Ch4Data };

export default function HaircutCalc({ data }: Props) {
  const { haircutFormula, haircutCalculator } = data;
  const [mode, setMode] = useState<"signal" | "sharpe">("signal");

  const defaults = haircutCalculator.defaults;
  const [T, setT] = useState(defaults.T);
  const [N, setN] = useState(defaults.N);
  const [delta, setDelta] = useState(defaults.delta);
  const [observed, setObserved] = useState(defaults.observedSharpe);
  const [rHat, setRHat] = useState(defaults.rademacher);

  // Compute haircut
  const dataSnooping = 2 * rHat;
  const estimationSignal = 2 * Math.sqrt(Math.log(2 / delta) / T);
  const estimationSharpe =
    3 * Math.sqrt((2 * Math.log(2 / delta)) / T) +
    Math.sqrt((2 * Math.log((2 * N) / delta)) / T);

  const estimation = mode === "signal" ? estimationSignal : estimationSharpe;
  const totalHaircut = dataSnooping + estimation;
  const lowerBound = observed - totalHaircut;

  const formula = mode === "signal" ? haircutFormula.signalVersion : haircutFormula.sharpeVersion;

  return (
    <div className="section">
      <div className="section-header">
        <span className="eyebrow">Section 8 — Interactive Calculator</span>
        <h2 className="section-title">The Haircut Calculator</h2>
        <p className="section-lede">
          Adjust the parameters to see how the performance lower bound changes.
          The true performance is at least the observed minus the haircut.
        </p>
      </div>

      {/* Mode selector */}
      <div className="exchange-tabs" style={{ marginBottom: 20 }}>
        <button
          className={`exchange-tab ${mode === "signal" ? "active" : ""}`}
          onClick={() => setMode("signal")}
        >
          {"\u{1F4CA}"} Signal (IC)
        </button>
        <button
          className={`exchange-tab ${mode === "sharpe" ? "active" : ""}`}
          onClick={() => setMode("sharpe")}
        >
          {"\u{1F4C8}"} Sharpe Ratio
        </button>
      </div>

      {/* Formula display */}
      <div className="definition-box" style={{ marginBottom: 20 }}>
        <div className="definition-term">{formula.label}</div>
        <div className="definition-body" style={{ marginBottom: 10 }}>
          {formula.description}
        </div>
        {formula.terms.map((term, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 8,
              padding: "4px 0",
              fontSize: 14,
            }}
          >
            <code
              style={{
                fontWeight: 700,
                color: "var(--ql-accent)",
                minWidth: 100,
              }}
            >
              {term.symbol}
            </code>
            <span style={{ color: "var(--ql-text-muted)" }}>
              {term.role}
            </span>
          </div>
        ))}
      </div>

      {/* Sliders */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
          marginBottom: 24,
        }}
      >
        {[
          {
            label: "Time periods (T)",
            value: T,
            set: setT,
            min: 100,
            max: 10000,
            step: 100,
          },
          {
            label: "Strategies (N)",
            value: N,
            set: setN,
            min: 1,
            max: 100000,
            step: 100,
          },
          {
            label: `Confidence (1-\u03B4 = ${((1 - delta) * 100).toFixed(0)}%)`,
            value: delta,
            set: setDelta,
            min: 0.001,
            max: 0.2,
            step: 0.001,
          },
          {
            label: `Observed ${mode === "signal" ? "IC" : "Sharpe"}`,
            value: observed,
            set: setObserved,
            min: 0,
            max: 5,
            step: 0.05,
          },
          {
            label: "Rademacher R\u0302",
            value: rHat,
            set: setRHat,
            min: 0,
            max: 1,
            step: 0.01,
          },
        ].map((s) => (
          <div key={s.label}>
            <label
              style={{
                fontSize: 12,
                color: "var(--ql-text-muted)",
                display: "block",
                marginBottom: 4,
              }}
            >
              {s.label}:{" "}
              <strong style={{ color: "var(--ql-text)" }}>
                {typeof s.value === "number" && s.value < 1 && s.value > 0
                  ? s.value.toFixed(3)
                  : s.value}
              </strong>
            </label>
            <input
              type="range"
              min={s.min}
              max={s.max}
              step={s.step}
              value={s.value}
              onChange={(e) => s.set(Number(e.target.value))}
              style={{ width: "100%", accentColor: "var(--ql-accent)" }}
            />
          </div>
        ))}
      </div>

      {/* Result */}
      <div
        style={{
          display: "flex",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <div
          className="definition-box"
          style={{
            flex: 1,
            minWidth: 140,
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 12, color: "var(--ql-text-muted)" }}>
            Data Snooping
          </div>
          <div
            style={{
              fontSize: 24,
              fontWeight: 700,
              color: "#f59e0b",
            }}
          >
            {dataSnooping.toFixed(3)}
          </div>
        </div>
        <div
          className="definition-box"
          style={{
            flex: 1,
            minWidth: 140,
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 12, color: "var(--ql-text-muted)" }}>
            Estimation Error
          </div>
          <div
            style={{
              fontSize: 24,
              fontWeight: 700,
              color: "#3b82f6",
            }}
          >
            {estimation.toFixed(3)}
          </div>
        </div>
        <div
          className="definition-box"
          style={{
            flex: 1,
            minWidth: 140,
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 12, color: "var(--ql-text-muted)" }}>
            Total Haircut
          </div>
          <div
            style={{
              fontSize: 24,
              fontWeight: 700,
              color: "#ef4444",
            }}
          >
            {totalHaircut.toFixed(3)}
          </div>
        </div>
      </div>

      <div
        className="definition-box"
        style={{
          marginTop: 16,
          textAlign: "center",
          background:
            lowerBound > 0
              ? "rgba(16,185,129,0.08)"
              : "rgba(239,68,68,0.08)",
        }}
      >
        <div
          style={{ fontSize: 12, color: "var(--ql-text-muted)", marginBottom: 4 }}
        >
          Lower Bound on True {mode === "signal" ? "IC" : "Sharpe"} (
          {((1 - delta) * 100).toFixed(0)}% confidence)
        </div>
        <div
          style={{
            fontSize: 32,
            fontWeight: 700,
            color: lowerBound > 0 ? "rgb(16,185,129)" : "#ef4444",
          }}
        >
          {lowerBound.toFixed(3)}
        </div>
        <div
          style={{
            fontSize: 13,
            color: "var(--ql-text-muted)",
            marginTop: 4,
          }}
        >
          {lowerBound > 0
            ? "After the haircut, the strategy still shows positive performance."
            : "After applying the haircut, you cannot rule out zero performance. Be cautious."}
        </div>
      </div>
    </div>
  );
}
