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

function GarchSimulator() {
  const [alpha0, setAlpha0] = useState(0.05);
  const [alpha1, setAlpha1] = useState(0.1);
  const [beta1, setBeta1] = useState(0.85);
  const [seed, setSeed] = useState(42);
  const [shockAt, setShockAt] = useState<number | null>(null);

  const N = 120;
  const data = useMemo(() => {
    const rng = mulberry32(seed);
    let h2 = alpha0 / Math.max(1 - beta1, 0.001);
    const rs: number[] = [];
    const hs: number[] = [];
    for (let t = 0; t < N; t++) {
      let eps = normal(rng);
      if (shockAt !== null && t === shockAt) eps = eps > 0 ? 4 : -4;
      const r = Math.sqrt(Math.max(h2, 0)) * eps;
      rs.push(r);
      hs.push(Math.sqrt(Math.max(h2, 0)));
      h2 = alpha0 + alpha1 * r * r + beta1 * h2;
    }
    return { rs, hs };
  }, [alpha0, alpha1, beta1, seed, shockAt]);

  const maxAbs = Math.max(...data.rs.map((r) => Math.abs(r)), 0.1);
  const maxH = Math.max(...data.hs, 0.1);

  return (
    <div className="garch-sim">
      <div className="sim-controls">
        <label className="sim-slider">
          <span>
            α₀ (baseline) = <strong>{alpha0.toFixed(3)}</strong>
          </span>
          <input
            type="range"
            min={0.0}
            max={0.2}
            step={0.005}
            value={alpha0}
            onChange={(e) => setAlpha0(parseFloat(e.target.value))}
          />
        </label>
        <label className="sim-slider">
          <span>
            α₁ (shock weight) = <strong>{alpha1.toFixed(2)}</strong>
          </span>
          <input
            type="range"
            min={0}
            max={0.4}
            step={0.01}
            value={alpha1}
            onChange={(e) => setAlpha1(parseFloat(e.target.value))}
          />
        </label>
        <label className="sim-slider">
          <span>
            β₁ (vol persistence) = <strong>{beta1.toFixed(2)}</strong>
          </span>
          <input
            type="range"
            min={0}
            max={0.99}
            step={0.01}
            value={beta1}
            onChange={(e) => setBeta1(parseFloat(e.target.value))}
          />
        </label>
        <div className="sim-buttons">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setSeed((s) => s + 1)}
          >
            🎲 New random seed
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setShockAt(Math.floor(N / 3))}
            title="Drop a huge shock at t≈40 and watch how it ripples"
          >
            ⚡ Inject big shock at t=40
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setShockAt(null)}
          >
            Reset shock
          </button>
        </div>
      </div>

      <div className="sim-chart-wrap">
        <div className="sim-chart-label">Returns r_t (each bar is a day)</div>
        <svg viewBox="0 0 720 140" className="sim-chart">
          <line x1="0" y1="70" x2="720" y2="70" stroke="#3a3a50" />
          {data.rs.map((r, i) => {
            const x = (i / N) * 720;
            const h = (r / maxAbs) * 60;
            return (
              <line
                key={i}
                x1={x + 3}
                y1={70}
                x2={x + 3}
                y2={70 - h}
                stroke={
                  shockAt === i
                    ? "#fbbf24"
                    : Math.abs(r) > maxAbs * 0.6
                      ? "#f87171"
                      : "#60a5fa"
                }
                strokeWidth="3"
              />
            );
          })}
        </svg>

        <div className="sim-chart-label">Volatility h_t (model's belief about vol)</div>
        <svg viewBox="0 0 720 100" className="sim-chart">
          {data.hs.map((h, i) => {
            if (i === 0) return null;
            const x1 = ((i - 1) / N) * 720;
            const x2 = (i / N) * 720;
            const y1 = 90 - (data.hs[i - 1] / maxH) * 80;
            const y2 = 90 - (h / maxH) * 80;
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#a78bfa"
                strokeWidth="2.5"
              />
            );
          })}
        </svg>
      </div>

      <div className="sim-readout">
        <strong>Try this:</strong> push β₁ near 1 — see how a single shock leaves a long
        trail of elevated vol? That is "volatility persistence." Now push β₁ to 0 — the
        storm is forgotten in one day.
      </div>
    </div>
  );
}

export default function Garch({ data }: Props) {
  const { garchModel } = data;

  return (
    <div className="section">
      <div className="section-header">
        <span className="eyebrow">§ 2.2 GARCH(1, 1)</span>
        <h2 className="section-title">{garchModel.title}</h2>
        <p className="section-lede">{garchModel.oneLiner}</p>
      </div>

      <div className="formula-stack">
        {garchModel.equations.map((eq, i) => (
          <div key={i} className="formula-row">
            <span className="formula-tag">{eq.label}</span>
            <code>{eq.tex}</code>
          </div>
        ))}
      </div>

      <h3 className="subhead">Reading the recipe, piece by piece</h3>
      <div className="garch-parts">
        {garchModel.parts.map((part) => (
          <div key={part.symbol} className="garch-part">
            <div className="garch-symbol">{part.symbol}</div>
            <div>
              <div className="garch-role">{part.role}</div>
              <div className="garch-desc">{part.desc}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="callout callout-success">
        <div className="callout-emoji">⚡</div>
        <p>
          <strong>Why it captures clustering:</strong> {garchModel.insight}
        </p>
      </div>

      <div className="callout">
        <div className="callout-emoji">🌀</div>
        <p>
          <strong>Why it doesn't blow up:</strong> {garchModel.dampening}
        </p>
      </div>

      <h3 className="subhead">Play with it: a tiny GARCH(1,1) simulator</h3>
      <p className="tab-para">
        Drag the sliders to change α₀, α₁, β₁ — see how the simulated returns and the
        model's volatility belief change in real time. Press ⚡ to inject a huge shock
        and watch it ripple.
      </p>
      <GarchSimulator />
    </div>
  );
}
