import { useMemo, useState } from "react";
import type * as Ch2Data from "../../data/chapter2";

type Props = { data: typeof Ch2Data };

function BasicCalculator() {
  const [p0, setP0] = useState(100);
  const [p1, setP1] = useState(108);
  const [div, setDiv] = useState(0);

  const safeP0 = p0 > 0 ? p0 : 1;
  const r = (p1 + div - safeP0) / safeP0;
  const rPct = (r * 100).toFixed(2);

  return (
    <div className="calc-box">
      <div className="calc-grid">
        <label className="calc-field">
          <span>Buy price P₀</span>
          <input
            type="number"
            value={p0}
            min={0}
            step={1}
            onChange={(e) => setP0(parseFloat(e.target.value) || 0)}
          />
        </label>
        <label className="calc-field">
          <span>Sell price P₁</span>
          <input
            type="number"
            value={p1}
            min={0}
            step={1}
            onChange={(e) => setP1(parseFloat(e.target.value) || 0)}
          />
        </label>
        <label className="calc-field">
          <span>Dividend D</span>
          <input
            type="number"
            value={div}
            min={0}
            step={0.5}
            onChange={(e) => setDiv(parseFloat(e.target.value) || 0)}
          />
        </label>
      </div>
      <div className="calc-result">
        <div className="calc-formula-line">
          r = (P₁ + D − P₀) / P₀ = ({p1} + {div} − {p0}) / {p0}
        </div>
        <div className={`calc-output ${r >= 0 ? "pos" : "neg"}`}>= {rPct}%</div>
      </div>
    </div>
  );
}

function ExcessExample() {
  const [r, setR] = useState(8);
  const [rf, setRf] = useState(2);
  const excess = (r - rf).toFixed(2);
  return (
    <div className="calc-box">
      <div className="calc-grid">
        <label className="calc-field">
          <span>Stock return r (%)</span>
          <input
            type="number"
            value={r}
            step={0.5}
            onChange={(e) => setR(parseFloat(e.target.value) || 0)}
          />
        </label>
        <label className="calc-field">
          <span>Risk-free r_f (%)</span>
          <input
            type="number"
            value={rf}
            step={0.25}
            onChange={(e) => setRf(parseFloat(e.target.value) || 0)}
          />
        </label>
      </div>
      <div className="calc-result">
        <div className="calc-formula-line">
          r_excess = r − r_f = {r}% − {rf}%
        </div>
        <div className={`calc-output ${r - rf >= 0 ? "pos" : "neg"}`}>
          = {excess}%
        </div>
        <p className="calc-caption">
          {r - rf >= 0
            ? `You earned ${excess}% MORE than just sitting in cash.`
            : `You actually did ${Math.abs(r - rf).toFixed(2)}% WORSE than just sitting in cash.`}
        </p>
      </div>
    </div>
  );
}

function LogReturnDemo() {
  const [r, setR] = useState(5);
  const [n, setN] = useState(3);
  const compoundedNet = useMemo(() => {
    const rDec = r / 100;
    return Math.pow(1 + rDec, n) - 1;
  }, [r, n]);
  const sumOfNet = (r * n) / 100;
  const logR = Math.log(1 + r / 100);
  const sumOfLog = logR * n;
  const compFromLog = Math.exp(sumOfLog) - 1;

  return (
    <div className="calc-box">
      <div className="calc-grid">
        <label className="calc-field">
          <span>Return per period r (%)</span>
          <input
            type="number"
            value={r}
            step={1}
            onChange={(e) => setR(parseFloat(e.target.value) || 0)}
          />
        </label>
        <label className="calc-field">
          <span>Number of periods</span>
          <input
            type="number"
            value={n}
            min={1}
            max={50}
            step={1}
            onChange={(e) => setN(parseInt(e.target.value) || 1)}
          />
        </label>
      </div>
      <div className="log-grid">
        <div className="log-pane">
          <div className="log-pane-tag">Naive: just add the percentages</div>
          <div className="log-formula">
            {r}% × {n} = {(sumOfNet * 100).toFixed(2)}%
          </div>
          <div className="log-pane-warn">⚠️ Wrong! Doesn't account for compounding.</div>
        </div>
        <div className="log-pane">
          <div className="log-pane-tag">Truth: compound them</div>
          <div className="log-formula">
            (1 + {r / 100})<sup>{n}</sup> − 1 = {(compoundedNet * 100).toFixed(2)}%
          </div>
          <div className="log-pane-ok">✓ The actual cumulative return.</div>
        </div>
        <div className="log-pane log-pane-highlight">
          <div className="log-pane-tag">Log returns to the rescue</div>
          <div className="log-formula">
            log(1 + r) × n = {logR.toFixed(4)} × {n} = {sumOfLog.toFixed(4)}
          </div>
          <div className="log-formula">
            exp({sumOfLog.toFixed(4)}) − 1 = {(compFromLog * 100).toFixed(2)}%
          </div>
          <div className="log-pane-ok">
            ✓ Same answer — but obtained by ADDING. That's why log returns are nice.
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Returns({ data }: Props) {
  const { returnsTabs } = data;
  const [activeIdx, setActiveIdx] = useState(0);
  const tab = returnsTabs[activeIdx];

  return (
    <div className="section">
      <div className="section-header">
        <span className="eyebrow">§ 2.1 Returns</span>
        <h2 className="section-title">What is a "return", actually?</h2>
        <p className="section-lede">
          Three little definitions you HAVE to nail before any modeling. Click through
          the tabs to play with each one.
        </p>
      </div>

      <div className="tab-row">
        {returnsTabs.map((t, idx) => (
          <button
            key={t.id}
            type="button"
            className={`tab-btn ${idx === activeIdx ? "active" : ""}`}
            onClick={() => setActiveIdx(idx)}
          >
            <span className="tab-emoji">{t.emoji}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      <div className="tab-panel">
        <h3 className="tab-title">{tab.title}</h3>
        {tab.body.map((p, i) => (
          <p key={i} className="tab-para">
            {p}
          </p>
        ))}

        <div className="formula-display">
          <span className="formula-tag">Formula</span>
          <code>{tab.formula}</code>
        </div>

        {tab.id === "basic" && <BasicCalculator />}
        {tab.id === "excess" && <ExcessExample />}
        {tab.id === "log" && <LogReturnDemo />}

        <div className="callout">
          <div className="callout-emoji">🧠</div>
          <p>{tab.detail}</p>
        </div>
      </div>
    </div>
  );
}
