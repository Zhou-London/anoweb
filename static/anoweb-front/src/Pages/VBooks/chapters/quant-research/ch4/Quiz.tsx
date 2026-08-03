import { useState } from "react";
import type * as Ch4Data from "./data";

type Props = { data: typeof Ch4Data };

export default function Quiz({ data }: Props) {
  const { quizQuestions } = data;
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState<Record<string, boolean>>({});

  const answer = (qid: string, idx: number) => {
    if (submitted[qid]) return;
    setAnswers((prev) => ({ ...prev, [qid]: idx }));
    setSubmitted((prev) => ({ ...prev, [qid]: true }));
  };

  const numAnswered = Object.keys(submitted).length;
  const numCorrect = quizQuestions.reduce((acc, q) => {
    const a = answers[q.id];
    if (a == null) return acc;
    return acc + (q.options[a].correct ? 1 : 0);
  }, 0);
  const done = numAnswered === quizQuestions.length;
  const pct = Math.round((numAnswered / quizQuestions.length) * 100);

  return (
    <div className="section">
      <div className="section-header">
        <span className="eyebrow">Test Your Knowledge</span>
        <h2 className="section-title">Chapter 4 Quiz</h2>
      </div>

      <div className="quiz-progress">
        <div className="quiz-progress-bar">
          <div className="quiz-progress-fill" style={{ width: `${pct}%` }} />
        </div>
        <span className="quiz-progress-label">
          {numAnswered}/{quizQuestions.length}
        </span>
      </div>

      <div className="quiz">
        {quizQuestions.map((q, qi) => {
          const sub = !!submitted[q.id];
          return (
            <div className="quiz-card" key={q.id}>
              <div className="quiz-q-number">Question {qi + 1}</div>
              <div className="quiz-q">{q.question}</div>
              <div className="quiz-options">
                {q.options.map((o, oidx) => {
                  const isSelected = answers[q.id] === oidx;
                  const show = sub;
                  const correct = o.correct;
                  let cls = "quiz-option";
                  if (show) {
                    if (correct) cls += " correct";
                    else if (isSelected) cls += " incorrect";
                  } else if (isSelected) {
                    cls += " selected";
                  }
                  return (
                    <button
                      key={oidx}
                      className={cls}
                      onClick={() => answer(q.id, oidx)}
                      disabled={sub}
                    >
                      <span className="quiz-option-marker">
                        {show && correct
                          ? "\u2713"
                          : show && isSelected
                            ? "\u2717"
                            : String.fromCharCode(65 + oidx)}
                      </span>
                      {o.text}
                    </button>
                  );
                })}
              </div>
              {sub && (
                <div className="quiz-explanation">
                  <strong>Why: </strong>
                  {q.explanation}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {done && (
        <div className="quiz-result">
          <div className="quiz-score">
            {numCorrect}/{quizQuestions.length}
          </div>
          <div className="quiz-score-label">
            {numCorrect === quizQuestions.length
              ? "Perfect score!"
              : numCorrect >= 4
                ? "Strong understanding!"
                : "Review the sections above and try again."}
          </div>
        </div>
      )}
    </div>
  );
}
