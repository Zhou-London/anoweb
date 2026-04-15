import { useState } from "react";
import type * as Ch2Data from "../../data/chapter2";

type Props = { data: typeof Ch2Data };

export default function Questions({ data }: Props) {
  const { bigQuestions } = data;
  const [revealed, setRevealed] = useState<Set<string>>(() => new Set());

  const toggle = (id: string) => {
    setRevealed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="section">
      <div className="section-header">
        <span className="eyebrow">Roadmap</span>
        <h2 className="section-title">The 6 questions this chapter answers</h2>
        <p className="section-lede">
          Chapter 2 is a tool chest, not a story. These are the 6 questions every
          section is quietly trying to answer. Click each card for a beginner-friendly
          first take.
        </p>
      </div>

      <div className="question-grid q6-grid">
        {bigQuestions.map((q, idx) => {
          const isOpen = revealed.has(q.id);
          return (
            <button
              key={q.id}
              type="button"
              className={`question-card ${isOpen ? "revealed" : ""}`}
              onClick={() => toggle(q.id)}
            >
              <div className="question-number">Q{idx + 1}</div>
              <div className="question-emoji">{q.emoji}</div>
              <div className="question-title">{q.title}</div>
              <div className="question-reveal">
                {isOpen ? (
                  <>
                    <div className="question-label">Plain English</div>
                    <div className="question-body">{q.beginnerTake}</div>
                  </>
                ) : (
                  <div className="question-cta">Click to reveal →</div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <div className="callout">
        <div className="callout-emoji">💡</div>
        <p>
          You don't need to memorize these. They're a map. As we walk through the
          chapter, ask yourself: <em>which question is this section solving?</em>
        </p>
      </div>
    </div>
  );
}
