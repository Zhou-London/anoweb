import type * as Ch1Data from "../data/chapter1";

type Props = {
  data: typeof Ch1Data;
  onStart?: () => void;
};

export default function Intro({ data, onStart }: Props) {
  const { chapterMeta } = data;
  return (
    <div className="intro">
      <div className="intro-badge">An interactive journey</div>
      <h1 className="intro-title">
        Quantitative Investing,
        <br />
        <span className="gradient-text">explained like you're new.</span>
      </h1>
      <p className="intro-subtitle">
        This is an interactive walk-through of <em>{chapterMeta.title}</em>. No math
        required — just curiosity.
      </p>

      <div className="intro-cards">
        <div className="intro-card">
          <div className="intro-card-icon">📜</div>
          <div className="intro-card-title">The Instruments</div>
          <div className="intro-card-desc">
            What can you actually buy and sell? Stocks, bonds, options, swaps —
            explained simply.
          </div>
        </div>
        <div className="intro-card">
          <div className="intro-card-icon">👥</div>
          <div className="intro-card-title">The Players</div>
          <div className="intro-card-desc">
            Who is in the room? Meet the sell side and buy side, and see who has
            what role.
          </div>
        </div>
        <div className="intro-card">
          <div className="intro-card-icon">💰</div>
          <div className="intro-card-title">The Profits</div>
          <div className="intro-card-desc">
            Where do "excess returns" actually come from, and why does the market
            even allow them?
          </div>
        </div>
      </div>

      <div className="intro-cta">
        <button className="btn btn-primary btn-large" onClick={onStart}>
          Start Learning →
        </button>
        <div className="intro-hint">Takes about 10 minutes. Interactive throughout.</div>
      </div>

      <div className="intro-meta">
        <div>
          <strong>Chapter:</strong> The Map and the Territory
        </div>
        <div>
          <strong>Topic:</strong> Markets, instruments, players
        </div>
      </div>
    </div>
  );
}
