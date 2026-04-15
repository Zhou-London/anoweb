import { type CSSProperties, useState } from "react";
import type * as Ch1Data from "../data/chapter1";

type Props = { data: typeof Ch1Data };

export default function ExcessReturns({ data }: Props) {
  const { excessReturnSources } = data;
  const [flipped, setFlipped] = useState<Record<string, boolean>>({});

  const toggle = (id: string) => {
    setFlipped((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const numFlipped = Object.values(flipped).filter(Boolean).length;

  return (
    <div className="section">
      <div className="section-header">
        <div className="eyebrow">Section 5 — Answering Q3</div>
        <h2 className="section-title">Where Do Excess Returns Come From?</h2>
        <p className="section-lede">
          "Excess return" means beating a safe asset like a Treasury bill. But{" "}
          <em>why</em> is beating the market even possible? The chapter identifies{" "}
          <strong>5 sources</strong>. Click each card to flip it.
        </p>
      </div>

      <div className="progress-pills">
        {excessReturnSources.map((s) => {
          const pillStyle: CSSProperties = {
            ["--pill-color" as never]: s.color,
          } as CSSProperties;
          return (
            <div
              key={s.id}
              className={`pill ${flipped[s.id] ? "filled" : ""}`}
              style={pillStyle}
            />
          );
        })}
        <div className="progress-pills-label">
          {numFlipped} / {excessReturnSources.length} revealed
        </div>
      </div>

      <div className="returns-grid">
        {excessReturnSources.map((src) => {
          const cardStyle: CSSProperties = {
            ["--card-color" as never]: src.color,
          } as CSSProperties;
          return (
            <div
              key={src.id}
              className={`return-card ${flipped[src.id] ? "flipped" : ""}`}
              onClick={() => toggle(src.id)}
              style={cardStyle}
            >
              <div className="return-card-inner">
                <div className="return-card-front">
                  <div className="return-emoji">{src.emoji}</div>
                  <div className="return-name">{src.name}</div>
                  <div className="return-short">{src.shortDesc}</div>
                  <div className="return-cta">Click to flip →</div>
                </div>
                <div className="return-card-back">
                  <div className="return-name-small">{src.name}</div>
                  <div className="return-long">{src.longDesc}</div>
                  <div className="return-example">
                    <div className="example-label">Example</div>
                    {src.example}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {numFlipped === excessReturnSources.length && (
        <div className="callout callout-success">
          <div className="callout-emoji">🎓</div>
          <div>
            <strong>Nicely done.</strong> The key insight: excess returns are possible
            precisely because <em>not everyone can act</em> on the same information.
            Some are constrained by risk appetite, liquidity, funding, institutional
            rules, or just lack the edge.
          </div>
        </div>
      )}

      <div className="quote-box">
        <div className="quote-mark">"</div>
        <p>
          The road to hell of an investor is littered with quite accurate predictions
          of assets that barely trade or do not trade at all.
        </p>
        <div className="quote-author">— on the 3Com / Palm mispricing</div>
      </div>
    </div>
  );
}
