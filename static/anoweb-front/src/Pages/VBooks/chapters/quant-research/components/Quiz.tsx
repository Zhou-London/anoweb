import { useState } from "react";

type Option = { text: string; correct: boolean };
type QuizQuestion = {
  id: string;
  question: string;
  options: Option[];
  explanation: string;
};

type Props = {
  data: { quizQuestions: QuizQuestion[] };
};

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

  const reset = () => {
    setAnswers({});
    setSubmitted({});
  };

  return (
    <div className="section">
      <div className="section-header">
        <div className="eyebrow">Check Your Understanding</div>
        <h2 className="section-title">Quick Quiz</h2>
        <p className="section-lede">
          A few quick questions to see what stuck. No wrong answers are "bad" — if you
          pick one, the explanation appears immediately.
        </p>
      </div>

      <div className="quiz-progress">
        <div className="quiz-progress-bar">
          <div
            className="quiz-progress-fill"
            style={{ width: `${(numAnswered / quizQuestions.length) * 100}%` }}
          />
        </div>
        <div className="quiz-progress-label">
          {numAnswered} / {quizQuestions.length} answered
          {done && ` · ${numCorrect} correct`}
        </div>
      </div>

      <div className="quiz">
        {quizQuestions.map((q, idx) => {
          const sub = submitted[q.id];
          const ans = answers[q.id];
          return (
            <div key={q.id} className="quiz-card">
              <div className="quiz-q-number">Question {idx + 1}</div>
              <div className="quiz-q">{q.question}</div>
              <div className="quiz-options">
                {q.options.map((opt, oidx) => {
                  const isSelected = ans === oidx;
                  const show = sub;
                  const correct = opt.correct;
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
                      type="button"
                      className={cls}
                      onClick={() => answer(q.id, oidx)}
                      disabled={sub}
                    >
                      <span className="quiz-option-marker">
                        {show && correct
                          ? "✓"
                          : show && isSelected
                            ? "✗"
                            : String.fromCharCode(65 + oidx)}
                      </span>
                      <span>{opt.text}</span>
                    </button>
                  );
                })}
              </div>
              {sub && (
                <div className="quiz-explanation">
                  <strong>Why:</strong> {q.explanation}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {done && (
        <div className="quiz-result">
          <div className="quiz-score">
            {numCorrect} / {quizQuestions.length}
          </div>
          <div className="quiz-score-label">
            {numCorrect === quizQuestions.length && "🏆 Perfect! You nailed it."}
            {numCorrect >= 3 && numCorrect < quizQuestions.length && "👏 Solid understanding."}
            {numCorrect < 3 && "📖 Worth a re-read — scroll back through the sections."}
          </div>
          <button type="button" className="btn btn-secondary" onClick={reset}>
            Try again
          </button>
        </div>
      )}
    </div>
  );
}
