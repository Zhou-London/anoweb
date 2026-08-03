import { useState } from "react";
import type * as Ch4Data from "./data";

type Props = { data: typeof Ch4Data };

export default function Questions({ data }: Props) {
  const { bigQuestions } = data;
  const [revealed, setRevealed] = useState<boolean[]>(bigQuestions.map(() => false));

  const toggle = (i: number) => {
    const next = [...revealed];
    next[i] = !next[i];
    setRevealed(next);
  };

  return (
    <div className="section">
      <div className="section-header">
        <span className="eyebrow">The Big Questions</span>
        <h2 className="section-title">What This Chapter Answers</h2>
      </div>

      <div className="question-grid">
        {bigQuestions.map((q, i) => (
          <button
            key={q.id}
            className={`question-card ${revealed[i] ? "revealed" : ""}`}
            onClick={() => toggle(i)}
          >
            <span className="question-number">Q{i + 1}</span>
            <div className="question-emoji">{q.emoji}</div>
            <div className="question-title">{q.title}</div>
            <div className="question-reveal">
              {revealed[i] ? (
                <>
                  <div className="question-label">Beginner Take</div>
                  <div className="question-body">{q.beginnerTake}</div>
                </>
              ) : (
                <div className="question-cta">Click to reveal {"\u2192"}</div>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
