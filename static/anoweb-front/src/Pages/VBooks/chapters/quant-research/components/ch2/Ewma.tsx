import { useState } from "react";
import type * as Ch2Data from "../../data/chapter2";

type Props = { data: typeof Ch2Data };

function WeightDecay({ k }: { k: number }) {
  const lags = Array.from({ length: 30 }, (_, i) => i);
  return (
    <svg viewBox="0 0 720 160" className="sim-chart">
      <line x1="20" y1="140" x2="710" y2="140" stroke="#3a3a50" />
      {lags.map((lag) => {
        const w = (1 - k) * Math.pow(k, lag);
        const x = 20 + lag * 22;
        const firstBar = (1 - k) * 1;
        const h = (w / Math.max(firstBar, 1e-6)) * 110;
        return (
          <g key={lag}>
            <rect x={x} y={140 - h} width={16} height={h} fill="#a78bfa" opacity="0.85" />
            {lag === 0 && (
              <text
                x={x}
                y={140 - h - 6}
                fill="#e5e7eb"
                fontSize="10"
                textAnchor="middle"
              >
                {(w * 100).toFixed(1)}%
              </text>
            )}
          </g>
        );
      })}
      <text x="20" y="158" fill="#9ca3af" fontSize="10">
        today
      </text>
      <text x="660" y="158" fill="#9ca3af" fontSize="10">
        30 days ago
      </text>
    </svg>
  );
}

function EwmaPlayground() {
  const [k, setK] = useState(0.94);
  const halfLife = Math.log(0.5) / Math.log(k);
  return (
    <div className="ewma-playground">
      <div className="sim-controls">
        <label className="sim-slider">
          <span>
            K (memory parameter) = <strong>{k.toFixed(2)}</strong>
          </span>
          <input
            type="range"
            min={0.1}
            max={0.99}
            step={0.01}
            value={k}
            onChange={(e) => setK(parseFloat(e.target.value))}
          />
        </label>
      </div>
      <WeightDecay k={k} />
      <div className="ewma-readout">
        <div>
          <strong>Half-life:</strong> ~{halfLife.toFixed(1)} days
          <div className="ewma-readout-sub">
            (after this many days, an old observation has half its original weight)
          </div>
        </div>
        <div>
          <strong>RiskMetrics default:</strong> K = 0.94
          <div className="ewma-readout-sub">
            (used by the financial industry for daily risk reports)
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Ewma({ data }: Props) {
  const { ewmaModel } = data;

  return (
    <div className="section">
      <div className="section-header">
        <span className="eyebrow">§ 2.3 EWMA & State-Space</span>
        <h2 className="section-title">{ewmaModel.title}</h2>
        <p className="section-lede">{ewmaModel.oneLiner}</p>
      </div>

      <div className="formula-display">
        <span className="formula-tag">Recursive form</span>
        <code>{ewmaModel.formula}</code>
      </div>

      <p className="tab-para">{ewmaModel.intuition}</p>

      <div className="formula-display">
        <span className="formula-tag">Unfolded</span>
        <code>{ewmaModel.unfolded}</code>
      </div>

      <h3 className="subhead">What the K knob does</h3>
      <div className="ewma-grid">
        {ewmaModel.knobMeaning.map((row) => (
          <div key={row.k} className="ewma-row">
            <div className="ewma-k">{row.k}</div>
            <div className="ewma-meaning">{row.meaning}</div>
          </div>
        ))}
      </div>

      <h3 className="subhead">Drag K — see the weight on history</h3>
      <EwmaPlayground />

      <div className="callout callout-success big-reveal">
        <div className="callout-emoji">🤯</div>
        <div>
          <div className="reveal-title">{ewmaModel.bigReveal.title}</div>
          <p>{ewmaModel.bigReveal.desc}</p>
          <p>
            <em>{ewmaModel.bigReveal.why}</em>
          </p>
        </div>
      </div>

      <h3 className="subhead">{ewmaModel.stateSpace.title}</h3>
      <p className="tab-para">{ewmaModel.stateSpace.desc}</p>
      <div className="callout">
        <div className="callout-emoji">📚</div>
        <p>
          <strong>Muth's example:</strong> {ewmaModel.stateSpace.muthExample}
        </p>
      </div>
      <div className="callout">
        <div className="callout-emoji">🎁</div>
        <p>{ewmaModel.stateSpace.payoff}</p>
      </div>
    </div>
  );
}
