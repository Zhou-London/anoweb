import { useState } from "react";
import type * as Ch4Data from "./data";

type Props = { data: typeof Ch4Data };

export default function LeakageGame({ data }: Props) {
  const { leakageScenarios, dataLeakageTypes } = data;
  const [answers, setAnswers] = useState<Record<string, boolean | null>>({});
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const handleAnswer = (id: string, guess: boolean) => {
    if (revealed[id]) return;
    setAnswers((prev) => ({ ...prev, [id]: guess }));
    setRevealed((prev) => ({ ...prev, [id]: true }));
  };

  const numRevealed = Object.keys(revealed).length;
  const numCorrect = leakageScenarios.reduce((acc, s) => {
    if (answers[s.id] == null) return acc;
    return acc + (answers[s.id] === s.isLeakage ? 1 : 0);
  }, 0);
  const done = numRevealed === leakageScenarios.length;

  const activeType =
    dataLeakageTypes.find((t) => t.id === selectedType) ?? null;

  return (
    <div className="section">
      <div className="section-header">
        <span className="eyebrow">Section 3 — Interactive Game</span>
        <h2 className="section-title">Spot the Data Leakage</h2>
        <p className="section-lede">
          For each scenario, decide: is this data leakage or safe practice?
        </p>
      </div>

      {/* Leakage type reference */}
      <div style={{ marginBottom: 24 }}>
        <div
          style={{
            fontSize: 13,
            color: "var(--ql-text-muted)",
            marginBottom: 8,
            textTransform: "uppercase",
            letterSpacing: 1,
          }}
        >
          Common leakage types
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {dataLeakageTypes.map((t) => (
            <button
              key={t.id}
              className={`exchange-tab ${selectedType === t.id ? "active" : ""}`}
              onClick={() =>
                setSelectedType(selectedType === t.id ? null : t.id)
              }
              style={{ fontSize: 13 }}
            >
              {t.emoji} {t.name}
            </button>
          ))}
        </div>
        {activeType && (
          <div className="definition-box" style={{ marginTop: 10 }}>
            <div className="definition-term">{activeType.name}</div>
            <div className="definition-body">{activeType.description}</div>
            <div
              style={{
                marginTop: 8,
                fontSize: 13,
                color: "var(--ql-accent)",
              }}
            >
              Remedy: {activeType.remedy}
            </div>
          </div>
        )}
      </div>

      {/* Game progress */}
      <div className="quiz-progress">
        <div className="quiz-progress-bar">
          <div
            className="quiz-progress-fill"
            style={{
              width: `${(numRevealed / leakageScenarios.length) * 100}%`,
            }}
          />
        </div>
        <span className="quiz-progress-label">
          {numRevealed}/{leakageScenarios.length}
        </span>
      </div>

      {/* Scenario cards */}
      <div className="quiz">
        {leakageScenarios.map((s, i) => {
          const isRevealed = !!revealed[s.id];
          const userGuess = answers[s.id];
          const correct = userGuess === s.isLeakage;

          return (
            <div className="quiz-card" key={s.id}>
              <div className="quiz-q-number">Scenario {i + 1}</div>
              <div className="quiz-q">{s.scenario}</div>

              {!isRevealed ? (
                <div
                  style={{ display: "flex", gap: 10, marginTop: 12 }}
                >
                  <button
                    className="quiz-option"
                    onClick={() => handleAnswer(s.id, true)}
                    style={{ flex: 1, justifyContent: "center" }}
                  >
                    <span className="quiz-option-marker">{"\u26A0\uFE0F"}</span>
                    Leakage!
                  </button>
                  <button
                    className="quiz-option"
                    onClick={() => handleAnswer(s.id, false)}
                    style={{ flex: 1, justifyContent: "center" }}
                  >
                    <span className="quiz-option-marker">{"\u2705"}</span>
                    Safe
                  </button>
                </div>
              ) : (
                <div
                  className={`quiz-explanation`}
                  style={{
                    borderLeftColor: correct
                      ? "var(--ql-accent)"
                      : "#ef4444",
                  }}
                >
                  <strong>
                    {correct ? "Correct! " : "Not quite. "}
                  </strong>
                  {s.isLeakage ? "This IS leakage. " : "This is safe. "}
                  {s.explanation}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {done && (
        <div className="quiz-result">
          <div className="quiz-score">
            {numCorrect}/{leakageScenarios.length}
          </div>
          <div className="quiz-score-label">
            {numCorrect >= 7
              ? "Excellent data hygiene instincts!"
              : numCorrect >= 5
                ? "Good eye — review the ones you missed."
                : "Data leakage is tricky. Review the types above and try to internalize the patterns."}
          </div>
        </div>
      )}
    </div>
  );
}
