import { type CSSProperties, type ReactElement, useState } from "react";
import type * as Ch2Data from "../../data/chapter2";

type Props = { data: typeof Ch2Data };

function NoAutocorrViz() {
  const lags = Array.from({ length: 21 }, (_, i) => i);
  return (
    <svg viewBox="0 0 320 120" className="sf-svg">
      <line x1="20" y1="60" x2="310" y2="60" stroke="#3a3a50" />
      {lags.map((lag) => {
        const h = lag === 0 ? 50 : Math.sin(lag * 7.3) * 4;
        return (
          <line
            key={lag}
            x1={20 + lag * 14}
            y1={60}
            x2={20 + lag * 14}
            y2={60 - h}
            stroke="#60a5fa"
            strokeWidth="3"
          />
        );
      })}
      <text x="20" y="110" fill="#9ca3af" fontSize="10">
        Lag 0
      </text>
      <text x="280" y="110" fill="#9ca3af" fontSize="10">
        Lag 20
      </text>
    </svg>
  );
}

function HeavyTailsViz() {
  const xs = Array.from({ length: 100 }, (_, i) => -3 + (i * 6) / 99);
  const normal = (x: number) => Math.exp(-(x * x) / 2) / Math.sqrt(2 * Math.PI);
  const heavy = (x: number) => 0.3 / Math.pow(1 + (x * x) / 4, 2.5);
  const toPath = (fn: (x: number) => number) =>
    xs
      .map((x, i) => {
        const px = 20 + ((x + 3) / 6) * 280;
        const py = 110 - fn(x) * 200;
        return `${i === 0 ? "M" : "L"} ${px} ${py}`;
      })
      .join(" ");
  return (
    <svg viewBox="0 0 320 120" className="sf-svg">
      <line x1="20" y1="110" x2="300" y2="110" stroke="#3a3a50" />
      <path d={toPath(normal)} stroke="#9ca3af" fill="none" strokeWidth="2" />
      <path d={toPath(heavy)} stroke="#f87171" fill="none" strokeWidth="2.5" />
      <text x="22" y="20" fill="#9ca3af" fontSize="10">
        — Normal (thin tails)
      </text>
      <text x="22" y="34" fill="#f87171" fontSize="10">
        — Real returns (heavy tails)
      </text>
    </svg>
  );
}

function ClusteringViz() {
  const points: number[] = [];
  let vol = 0.5;
  let prng = 1;
  const rng = () => {
    prng = (prng * 16807) % 2147483647;
    return (prng / 2147483647) * 2 - 1;
  };
  for (let i = 0; i < 100; i++) {
    const shock = rng();
    const r = vol * shock;
    points.push(r);
    vol = 0.05 + 0.85 * vol + 0.15 * Math.abs(r);
  }
  const max = Math.max(...points.map((p) => Math.abs(p))) || 1;
  return (
    <svg viewBox="0 0 320 120" className="sf-svg">
      <line x1="10" y1="60" x2="310" y2="60" stroke="#3a3a50" />
      {points.map((p, i) => {
        const px = 10 + i * 3;
        const h = (p / max) * 50;
        return (
          <line
            key={i}
            x1={px}
            y1={60}
            x2={px}
            y2={60 - h}
            stroke={Math.abs(p) > 0.5 ? "#fbbf24" : "#9ca3af"}
            strokeWidth="2"
          />
        );
      })}
      <text x="12" y="115" fill="#9ca3af" fontSize="10">
        Calm and stormy days come in clumps
      </text>
    </svg>
  );
}

function AggGaussianViz() {
  const dailyBars = [2, 4, 8, 16, 28, 22, 14, 8, 4, 2];
  const monthlyBars = [1, 3, 7, 14, 24, 24, 14, 7, 3, 1];
  return (
    <svg viewBox="0 0 320 120" className="sf-svg">
      <text x="20" y="14" fill="#9ca3af" fontSize="10">
        Daily (heavy)
      </text>
      <text x="180" y="14" fill="#34d399" fontSize="10">
        Monthly (≈ Gaussian)
      </text>
      {dailyBars.map((h, i) => (
        <rect
          key={`d${i}`}
          x={20 + i * 12}
          y={110 - h * 2.5}
          width="10"
          height={h * 2.5}
          fill="#9ca3af"
          opacity="0.6"
        />
      ))}
      {monthlyBars.map((h, i) => (
        <rect
          key={`m${i}`}
          x={180 + i * 12}
          y={110 - h * 2.5}
          width="10"
          height={h * 2.5}
          fill="#34d399"
          opacity="0.7"
        />
      ))}
    </svg>
  );
}

const VIZ: Record<string, () => ReactElement> = {
  sf1: NoAutocorrViz,
  sf2: HeavyTailsViz,
  sf3: ClusteringViz,
  sf4: AggGaussianViz,
};

export default function StylizedFacts({ data }: Props) {
  const { stylizedFacts } = data;
  const [openId, setOpenId] = useState<string | null>("sf3");

  return (
    <div className="section">
      <div className="section-header">
        <span className="eyebrow">§ 2.1.5 Stylized Facts</span>
        <h2 className="section-title">The 4 stubborn empirical patterns of returns</h2>
        <p className="section-lede">
          A "stylized fact" is something that holds across stocks, decades, and
          countries — even if no theory neatly explains it. These 4 are the ones every
          working modeler must internalize. Click each card to expand.
        </p>
      </div>

      <div className="sf-grid">
        {stylizedFacts.map((fact) => {
          const isOpen = openId === fact.id;
          const Viz = VIZ[fact.id];
          const cardStyle: CSSProperties = {
            ["--fact-color" as never]: fact.color,
          } as CSSProperties;
          return (
            <div
              key={fact.id}
              className={`sf-card ${isOpen ? "open" : ""}`}
              style={cardStyle}
            >
              <button
                type="button"
                className="sf-card-header"
                onClick={() => setOpenId(isOpen ? null : fact.id)}
              >
                <span className="sf-emoji">{fact.emoji}</span>
                <span className="sf-name">{fact.name}</span>
                <span className="sf-chevron">{isOpen ? "−" : "+"}</span>
              </button>
              <div className="sf-plain">{fact.plain}</div>
              {isOpen && (
                <div className="sf-detail">
                  <div className="sf-viz-wrap">{Viz && <Viz />}</div>
                  <p className="sf-detail-text">{fact.detail}</p>
                  <div className="sf-caveat">
                    <strong>So what:</strong> {fact.caveat}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="callout">
        <div className="callout-emoji">🎯</div>
        <p>
          <strong>The connecting insight:</strong> stylized fact #3 (volatility
          clustering) is the single most important one. It is what lets you make money
          — and lose money — in risk management. The next section is a model designed
          around exactly this fact.
        </p>
      </div>
    </div>
  );
}
