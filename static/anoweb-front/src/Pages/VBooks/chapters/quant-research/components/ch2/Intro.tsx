import type * as Ch2Data from "../../data/chapter2";

type Props = {
  data: typeof Ch2Data;
  onStart?: () => void;
};

export default function Intro({ data, onStart }: Props) {
  const { chapterMeta } = data;
  return (
    <div className="intro">
      <div className="intro-badge">Chapter 2 · Interactive walkthrough</div>
      <h1 className="intro-title">
        How returns behave,
        <br />
        <span className="gradient-text">and how to model their storms.</span>
      </h1>
      <p className="intro-subtitle">
        This is an interactive walk-through of <em>{chapterMeta.title}</em>. We assume
        you finished Chapter 1 — but no math beyond high-school algebra is required.
      </p>

      <div className="intro-cards">
        <div className="intro-card">
          <div className="intro-card-icon">📐</div>
          <div className="intro-card-title">Define a Return</div>
          <div className="intro-card-desc">
            Sounds trivial. Isn't. Dividends, risk-free rate, log vs net — the setup
            matters.
          </div>
        </div>
        <div className="intro-card">
          <div className="intro-card-icon">🔍</div>
          <div className="intro-card-title">4 Stylized Facts</div>
          <div className="intro-card-desc">
            The empirical patterns markets actually show. Every model has to respect
            them.
          </div>
        </div>
        <div className="intro-card">
          <div className="intro-card-icon">🌪️</div>
          <div className="intro-card-title">Modeling Volatility</div>
          <div className="intro-card-desc">
            GARCH, Realized Vol, EWMA, Kalman — and why they are all the same animal.
          </div>
        </div>
      </div>

      <div className="intro-cta">
        <button type="button" className="btn btn-primary btn-large" onClick={onStart}>
          Start Chapter 2 →
        </button>
        <div className="intro-hint">
          ~12 minutes. Interactive throughout. Math kept gentle.
        </div>
      </div>

      <div className="intro-meta">
        <div>
          <strong>Chapter:</strong> Returns — Properties and Models
        </div>
        <div>
          <strong>Topic:</strong> Volatility, GARCH, EWMA
        </div>
      </div>
    </div>
  );
}
