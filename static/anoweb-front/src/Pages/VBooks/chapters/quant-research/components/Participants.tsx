import { type CSSProperties, useState } from "react";
import type * as Ch1Data from "../data/chapter1";

type Props = { data: typeof Ch1Data };
type SideKey = "sellSide" | "buySide";

export default function Participants({ data }: Props) {
  const { participants } = data;
  const [side, setSide] = useState<SideKey>("sellSide");
  const [selected, setSelected] = useState<string | null>(null);
  const current = participants[side];

  const handleSideChange = (s: SideKey) => {
    setSide(s);
    setSelected(null);
  };

  const selectedActor = selected
    ? current.actors.find((a) => a.id === selected) ?? null
    : null;

  const sellSideStyle: CSSProperties = {
    ["--side-color" as never]: participants.sellSide.color,
  } as CSSProperties;
  const buySideStyle: CSSProperties = {
    ["--side-color" as never]: participants.buySide.color,
  } as CSSProperties;
  const gridStyle: CSSProperties = {
    ["--side-color" as never]: current.color,
  } as CSSProperties;

  return (
    <div className="section">
      <div className="section-header">
        <div className="eyebrow">Section 4 — Answering Q2</div>
        <h2 className="section-title">Meet the Players</h2>
        <p className="section-lede">
          Every market is a collection of people playing different roles. The cleanest
          split: <strong>sell side</strong> (they help others trade) and{" "}
          <strong>buy side</strong> (they trade for themselves or their clients). Click
          any character to dig in.
        </p>
      </div>

      <div className="side-toggle">
        <button
          type="button"
          className={`side-btn ${side === "sellSide" ? "active" : ""}`}
          onClick={() => handleSideChange("sellSide")}
          style={sellSideStyle}
        >
          <div className="side-btn-label">Sell Side</div>
          <div className="side-btn-sub">{participants.sellSide.oneLiner}</div>
        </button>
        <button
          type="button"
          className={`side-btn ${side === "buySide" ? "active" : ""}`}
          onClick={() => handleSideChange("buySide")}
          style={buySideStyle}
        >
          <div className="side-btn-label">Buy Side</div>
          <div className="side-btn-sub">{participants.buySide.oneLiner}</div>
        </button>
      </div>

      <div className="participants-grid" style={gridStyle}>
        {current.actors.map((actor) => (
          <button
            key={actor.id}
            type="button"
            className={`participant-card ${selected === actor.id ? "selected" : ""}`}
            onClick={() => setSelected(selected === actor.id ? null : actor.id)}
          >
            <div className="participant-emoji">{actor.emoji}</div>
            <div className="participant-name">{actor.name}</div>
            <div className="participant-role">{actor.role}</div>
          </button>
        ))}
      </div>

      {selectedActor && (
        <div className="participant-detail">
          <div className="participant-detail-header">
            <div className="participant-detail-emoji">{selectedActor.emoji}</div>
            <div>
              <h3>{selectedActor.name}</h3>
              <div className="participant-role-big">{selectedActor.role}</div>
            </div>
          </div>

          <p className="participant-desc">{selectedActor.description}</p>

          <div className="participant-analogy">
            <div className="analogy-label">🌱 Analogy</div>
            <div className="analogy-text">{selectedActor.analogy}</div>
          </div>

          {"profit" in selectedActor && selectedActor.profit && (
            <div className="participant-meta">
              <strong>💵 How they make money:</strong> {selectedActor.profit}
            </div>
          )}
          {"examples" in selectedActor && selectedActor.examples && (
            <div className="participant-meta">
              <strong>🏷️ Examples:</strong> {selectedActor.examples}
            </div>
          )}
        </div>
      )}

      {!selectedActor && (
        <div className="hint-bar">👆 Click any character above to see their story</div>
      )}
    </div>
  );
}
