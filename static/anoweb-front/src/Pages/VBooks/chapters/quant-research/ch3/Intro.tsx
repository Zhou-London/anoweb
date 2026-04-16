import type * as Ch3Data from "./data";

type Props = { data: typeof Ch3Data; onStart?: () => void };

export default function Intro({ data, onStart }: Props) {
  const { chapterMeta } = data;
  return (
    <div className="intro">
      <span className="intro-badge">{chapterMeta.chapter}</span>
      <h1 className="intro-title">
        <span className="gradient-text">Linear Models</span> of Returns
      </h1>
      <p className="intro-subtitle">{chapterMeta.tagline}</p>

      <div className="intro-cards">
        <div className="intro-card">
          <div className="intro-card-icon">📐</div>
          <div className="intro-card-title">The Model</div>
          <div className="intro-card-desc">r = α + Bf + ε — a few factors drive thousands of stocks</div>
        </div>
        <div className="intro-card">
          <div className="intro-card-icon">🔍</div>
          <div className="intro-card-title">Interpretations</div>
          <div className="intro-card-desc">Three ways to read the same equation</div>
        </div>
        <div className="intro-card">
          <div className="intro-card-icon">🛠️</div>
          <div className="intro-card-title">Applications</div>
          <div className="intro-card-desc">Attribution, risk, portfolios, and alpha</div>
        </div>
      </div>

      <div className="intro-meta">
        <span>⏱ {chapterMeta.readTime}</span>
        <span>📖 {chapterMeta.sections} sections</span>
        <span>🧩 Interactive quiz</span>
      </div>

      <div className="intro-cta">
        <button className="btn btn-primary btn-large" onClick={onStart}>
          Start Learning →
        </button>
        <span className="intro-hint">Interactive throughout.</span>
      </div>
    </div>
  );
}
