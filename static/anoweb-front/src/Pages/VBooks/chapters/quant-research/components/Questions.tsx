import { useState } from "react";
import type * as Ch1Data from "../data/chapter1";

type Props = { data: typeof Ch1Data };

export default function Questions({ data }: Props) {
  const { bigQuestions } = data;
  const [revealed, setRevealed] = useState<boolean[]>([false, false, false]);

  const toggle = (i: number) => {
    const next = [...revealed];
    next[i] = !next[i];
    setRevealed(next);
  };

  const allRevealed = revealed.every(Boolean);

  return (
    <div className="section">
      <div className="section-header">
        <div className="eyebrow">Section 1</div>
        <h2 className="section-title">The Three Big Questions</h2>
        <p className="section-lede">
          The whole chapter revolves around answering three questions. Tap each card to
          see what it's really asking.
        </p>
      </div>

      <div className="question-grid">
        {bigQuestions.map((q, i) => (
          <button
            key={q.id}
            type="button"
            className={`question-card ${revealed[i] ? "revealed" : ""}`}
            onClick={() => toggle(i)}
          >
            <div className="question-number">Q{i + 1}</div>
            <div className="question-emoji">{q.emoji}</div>
            <div className="question-title">{q.title}</div>
            <div className="question-reveal">
              {revealed[i] ? (
                <>
                  <div className="question-label">Beginner take</div>
                  <div className="question-body">{q.beginnerTake}</div>
                </>
              ) : (
                <div className="question-cta">Click to reveal →</div>
              )}
            </div>
          </button>
        ))}
      </div>

      {allRevealed && (
        <div className="callout callout-success">
          <div className="callout-emoji">🎉</div>
          <div>
            <strong>Great — you've seen all three!</strong> The next few sections
            walk through the answers, one at a time. Press <kbd>→</kbd> or click{" "}
            <strong>Next</strong> when ready.
          </div>
        </div>
      )}

      <div className="quote-box">
        <div className="quote-mark">"</div>
        <p>
          To be successful, an investor must understand how things work. Theory is
          cheap. What's hard is putting the right tool at the service of the right
          insight.
        </p>
        <div className="quote-author">— paraphrased from the chapter</div>
      </div>
    </div>
  );
}
