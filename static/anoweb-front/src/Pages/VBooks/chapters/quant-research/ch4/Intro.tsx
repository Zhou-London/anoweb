import type * as Ch4Data from "./data";

type Props = { data: typeof Ch4Data; onStart?: () => void };

export default function Intro({ data, onStart }: Props) {
  const { chapterMeta } = data;
  return (
    <div className="intro">
      <span className="intro-badge">{chapterMeta.chapter}</span>
      <h1 className="intro-title">
        <span className="gradient-text">Evaluating</span> Excess Returns
      </h1>
      <p className="intro-subtitle">{chapterMeta.tagline}</p>

      <div className="intro-cards">
        <div className="intro-card">
          <div className="intro-card-icon">{"\u{1F9EA}"}</div>
          <div className="intro-card-title">Best Practices</div>
          <div className="intro-card-desc">Data hygiene and research process essentials</div>
        </div>
        <div className="intro-card">
          <div className="intro-card-icon">{"\u{1F504}"}</div>
          <div className="intro-card-title">Backtesting Protocol</div>
          <div className="intro-card-desc">Cross-validation vs walk-forward and their trade-offs</div>
        </div>
        <div className="intro-card">
          <div className="intro-card-icon">{"\u{1F6E1}\uFE0F"}</div>
          <div className="intro-card-title">Rademacher Anti-Serum</div>
          <div className="intro-card-desc">A principled haircut for multiple testing</div>
        </div>
      </div>

      <div className="intro-meta">
        <span>{"\u23F1"} {chapterMeta.readTime}</span>
        <span>{"\u{1F4D6}"} {chapterMeta.sections} sections</span>
        <span>{"\u{1F3AE}"} Interactive games</span>
      </div>

      <div className="intro-cta">
        <button className="btn btn-primary btn-large" onClick={onStart}>
          Start Learning {"\u2192"}
        </button>
        <span className="intro-hint">Interactive throughout.</span>
      </div>
    </div>
  );
}
