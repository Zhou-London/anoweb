import { useMemo, useState } from "react";
import type * as Ch2Data from "../../data/chapter2";

type Props = { data: typeof Ch2Data };

function mulberry32(seed: number) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function normal(rng: () => number) {
  const u = Math.max(rng(), 1e-9);
  const v = Math.max(rng(), 1e-9);
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function RvDemo() {
  const [n, setN] = useState(78);
  const [seed, setSeed] = useState(7);
  const sigmaTrue = 1.0;

  const result = useMemo(() => {
    const rng = mulberry32(seed);
    const sigmaPerBar = sigmaTrue / Math.sqrt(n);
    let sumSq = 0;
    const bars: number[] = [];
    for (let i = 0; i < n; i++) {
      const r = sigmaPerBar * normal(rng);
      bars.push(r);
      sumSq += r * r;
    }
    return { bars, rv: Math.sqrt(sumSq), sumSq };
  }, [n, seed]);

  return (
    <div className="rv-demo">
      <div className="sim-controls">
        <label className="sim-slider">
          <span>
            Number of bars per day n = <strong>{n}</strong>
            <span className="rv-note">
              {n <= 6
                ? " (1-hour bars)"
                : n <= 26
                  ? " (15-min bars)"
                  : n <= 78
                    ? " (5-min bars)"
                    : n <= 195
                      ? " (2-min bars)"
                      : " (1-min bars)"}
            </span>
          </span>
          <input
            type="range"
            min={1}
            max={390}
            step={1}
            value={n}
            onChange={(e) => setN(parseInt(e.target.value))}
          />
        </label>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => setSeed((s) => s + 1)}
        >
          🎲 New random day
        </button>
      </div>

      <div className="rv-bars">
        <svg viewBox="0 0 720 100" className="sim-chart">
          <line x1="0" y1="50" x2="720" y2="50" stroke="#3a3a50" />
          {result.bars.map((r, i) => {
            const x = (i / result.bars.length) * 720;
            const w = Math.max(720 / result.bars.length - 1, 1);
            const h = (r / 0.5) * 40;
            return (
              <line
                key={i}
                x1={x + w / 2}
                y1={50}
                x2={x + w / 2}
                y2={50 - h}
                stroke="#06b6d4"
                strokeWidth={Math.max(w, 1)}
              />
            );
          })}
        </svg>
      </div>

      <div className="rv-readout">
        <div className="rv-true">
          True σ (set by simulator) = <strong>{sigmaTrue.toFixed(3)}</strong>
        </div>
        <div className="rv-est">
          Realized σ̂ = √(Σ rⱼ²) = <strong>{result.rv.toFixed(3)}</strong>
        </div>
        <div className={`rv-error ${Math.abs(result.rv - sigmaTrue) < 0.1 ? "good" : ""}`}>
          Error: {((result.rv - sigmaTrue) * 100).toFixed(1)}% off
        </div>
      </div>
      <p className="calc-caption">
        Drag <strong>n</strong> down to 1 — you only have ONE return for the day, and
        your estimate is very noisy. Push it higher and the estimate sharpens. This is
        the magic of realized volatility.
      </p>
    </div>
  );
}

export default function RealizedVol({ data }: Props) {
  const { realizedVol } = data;

  return (
    <div className="section">
      <div className="section-header">
        <span className="eyebrow">§ 2.2.4 Realized Volatility</span>
        <h2 className="section-title">{realizedVol.title}</h2>
        <p className="section-lede">{realizedVol.oneLiner}</p>
      </div>

      <h3 className="subhead">The 3-step recipe</h3>
      <div className="step-list">
        {realizedVol.intuition.map((s) => (
          <div key={s.step} className="step-row">
            <div className="step-num">{s.step}</div>
            <div className="step-desc">{s.desc}</div>
          </div>
        ))}
      </div>

      <div className="formula-display">
        <span className="formula-tag">Formula</span>
        <code>{realizedVol.formula}</code>
      </div>

      <div className="callout callout-success">
        <div className="callout-emoji">📉</div>
        <p>{realizedVol.whyItWorks}</p>
      </div>

      <h3 className="subhead">Try it: more samples = sharper estimate</h3>
      <RvDemo />

      <h3 className="subhead">The catches (where it breaks)</h3>
      <div className="catch-grid">
        {realizedVol.catches.map((c) => (
          <div key={c.name} className="catch-card">
            <div className="catch-emoji">{c.emoji}</div>
            <div className="catch-name">{c.name}</div>
            <div className="catch-desc">{c.desc}</div>
          </div>
        ))}
      </div>

      <div className="callout">
        <div className="callout-emoji">🥇</div>
        <p>
          <strong>Practitioner verdict:</strong> {realizedVol.practitionerChoice}
        </p>
      </div>
    </div>
  );
}
