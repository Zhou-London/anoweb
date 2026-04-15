import { useState } from "react";
import type * as Ch1Data from "../data/chapter1";

type Props = { data: typeof Ch1Data };

export default function Securities({ data }: Props) {
  const { securities } = data;
  const [selected, setSelected] = useState<string>("equities");
  const current = securities.find((s) => s.id === selected) ?? securities[0];

  return (
    <div className="section">
      <div className="section-header">
        <div className="eyebrow">Section 2 — Answering Q1</div>
        <h2 className="section-title">What You Can Actually Trade</h2>
        <p className="section-lede">
          We focus on contracts that are <strong>standardized</strong> (everyone
          agrees on what they are) and <strong>liquid</strong> (you can buy/sell
          quickly, in size, without moving the price). Click any instrument to learn
          more.
        </p>
      </div>

      <div className="definition-box">
        <div className="definition-row">
          <div className="definition-label">Standardized</div>
          <div className="definition-text">
            Everyone knows exactly what the contract says. All AAPL shares are
            identical. A house is <em>not</em> standardized — each one is unique.
          </div>
        </div>
        <div className="definition-row">
          <div className="definition-label">Liquid</div>
          <div className="definition-text">
            You can trade large sizes quickly, with low cost and no long search for a
            counterparty.
          </div>
        </div>
      </div>

      <div className="securities-layout">
        <div className="securities-list">
          {securities.map((sec) => (
            <button
              key={sec.id}
              type="button"
              className={`security-item ${selected === sec.id ? "active" : ""}`}
              onClick={() => setSelected(sec.id)}
            >
              <span className="security-emoji">{sec.emoji}</span>
              <div className="security-text">
                <div className="security-name">{sec.name}</div>
                <div className="security-oneline">{sec.oneLiner}</div>
              </div>
            </button>
          ))}
        </div>

        <div className="security-detail">
          <div className="security-detail-header">
            <div className="security-detail-emoji">{current.emoji}</div>
            <div>
              <h3 className="security-detail-name">{current.name}</h3>
              <div className="security-detail-oneline">{current.oneLiner}</div>
            </div>
          </div>

          <div className="security-analogy">
            <div className="analogy-label">🌱 Beginner analogy</div>
            <div className="analogy-text">{current.analogy}</div>
          </div>

          <div className="security-details">
            <div className="details-label">How it actually works</div>
            <p>{current.details}</p>
          </div>

          <div className="security-examples">
            <div className="details-label">Real-world examples</div>
            <div className="example-chips">
              {current.examples.map((ex) => (
                <span key={ex} className="example-chip">
                  {ex}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="callout">
        <div className="callout-emoji">🔍</div>
        <div>
          <strong>Why standardization matters:</strong> It concentrates demand onto
          fewer products, which boosts liquidity, reduces costs, and builds trust.
          After the 2008 crisis, CDS contracts were dramatically simplified ("Big
          Bang"), which restored confidence in the market.
        </div>
      </div>
    </div>
  );
}
