import { useState, useCallback } from "react";
import type * as Ch4Data from "./data";

type Props = { data: typeof Ch4Data };

/** Pseudo-random number via seed (simple xorshift) */
function xorshift(seed: number) {
  let s = seed | 0;
  return () => {
    s ^= s << 13;
    s ^= s >> 17;
    s ^= s << 5;
    return ((s >>> 0) / 0xffffffff) * 2 - 1; // range (-1, 1)
  };
}

export default function CoinFlipGame({ data }: Props) {
  const { coinFlipGame } = data;
  const T = 20;

  const [numStrategies, setNumStrategies] = useState(1);
  const [results, setResults] = useState<{
    returns: number[];
    strategies: number[][];
    performances: number[];
    bestIdx: number;
  } | null>(null);

  const runSimulation = useCallback(() => {
    const N = numStrategies;
    const rng = xorshift(Date.now());

    // Random returns: +1 or -1
    const returns: number[] = [];
    for (let t = 0; t < T; t++) {
      returns.push(rng() > 0 ? 1 : -1);
    }

    // N random strategies: each predicts +1 or -1 for each period
    const strategies: number[][] = [];
    const performances: number[] = [];

    for (let n = 0; n < N; n++) {
      const strat: number[] = [];
      for (let t = 0; t < T; t++) {
        strat.push(rng() > 0 ? 1 : -1);
      }
      strategies.push(strat);

      // Performance = average of strat[t] * return[t]
      let sum = 0;
      for (let t = 0; t < T; t++) sum += strat[t] * returns[t];
      performances.push(sum / T);
    }

    let bestIdx = 0;
    for (let n = 1; n < N; n++) {
      if (performances[n] > performances[bestIdx]) bestIdx = n;
    }

    setResults({ returns, strategies, performances, bestIdx });
  }, [numStrategies]);

  const bestPerf = results ? results.performances[results.bestIdx] : 0;

  return (
    <div className="section">
      <div className="section-header">
        <span className="eyebrow">Section 6 — Interactive Experiment</span>
        <h2 className="section-title">The Multiple Testing Trap</h2>
        <p className="section-lede">
          All strategies below are{" "}
          <strong>pure random coin flips</strong> — zero skill. Watch how the
          best-of-N performance inflates as you test more strategies.
        </p>
      </div>

      {/* Controls */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          flexWrap: "wrap",
          marginBottom: 20,
        }}
      >
        <div>
          <label
            style={{
              fontSize: 13,
              color: "var(--ql-text-muted)",
              display: "block",
              marginBottom: 4,
            }}
          >
            Number of strategies (N)
          </label>
          <div style={{ display: "flex", gap: 6 }}>
            {coinFlipGame.trialCounts.map((n) => (
              <button
                key={n}
                className={`exchange-tab ${numStrategies === n ? "active" : ""}`}
                onClick={() => {
                  setNumStrategies(n);
                  setResults(null);
                }}
                style={{ fontSize: 13, padding: "4px 10px" }}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <button
          className="btn btn-primary"
          onClick={runSimulation}
          style={{ alignSelf: "flex-end" }}
        >
          {"\u{1F3B2}"} Run Simulation
        </button>
      </div>

      {/* Results */}
      {results && (
        <>
          {/* Returns bar */}
          <div style={{ marginBottom: 20 }}>
            <div
              style={{
                fontSize: 12,
                color: "var(--ql-text-muted)",
                marginBottom: 4,
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              Random Returns (T={T})
            </div>
            <div style={{ display: "flex", gap: 2 }}>
              {results.returns.map((r, i) => (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    height: 28,
                    borderRadius: 3,
                    background:
                      r > 0
                        ? "rgba(16,185,129,0.3)"
                        : "rgba(239,68,68,0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 11,
                    color:
                      r > 0
                        ? "rgb(16,185,129)"
                        : "rgb(239,68,68)",
                    fontWeight: 600,
                  }}
                >
                  {r > 0 ? "+" : "-"}
                </div>
              ))}
            </div>
          </div>

          {/* Best strategy highlight */}
          <div className="definition-box">
            <div
              className="definition-term"
              style={{
                color: bestPerf > 0.15 ? "#ef4444" : "var(--ql-accent)",
              }}
            >
              Best of {numStrategies} strategies: avg return ={" "}
              {bestPerf.toFixed(3)}
            </div>
            <div className="definition-body">
              {numStrategies === 1
                ? "With just 1 random strategy, the performance is close to zero (as expected)."
                : bestPerf > 0.15
                  ? `With ${numStrategies} random strategies, the 'best' one looks impressive — but it's pure luck! This is why we need a multiple testing correction.`
                  : `Even with ${numStrategies} strategies, this run didn't produce a big winner. Try running again — sometimes you get 'lucky.' That randomness is exactly the problem.`}
            </div>
          </div>

          {/* Distribution of performances */}
          {numStrategies > 1 && (
            <div style={{ marginTop: 16 }}>
              <div
                style={{
                  fontSize: 12,
                  color: "var(--ql-text-muted)",
                  marginBottom: 6,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                }}
              >
                All {numStrategies} strategy performances
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-end",
                  gap: 1,
                  height: 80,
                }}
              >
                {results.performances
                  .slice()
                  .sort((a, b) => a - b)
                  .map((p, i) => {
                    const maxAbs = Math.max(
                      ...results.performances.map(Math.abs),
                      0.01
                    );
                    const h = Math.abs(p) / maxAbs;
                    const isBest =
                      Math.abs(p - bestPerf) < 0.0001;
                    return (
                      <div
                        key={i}
                        style={{
                          flex: 1,
                          minWidth: 1,
                          maxWidth: 8,
                          height: `${h * 70 + 2}px`,
                          background: isBest
                            ? "#f59e0b"
                            : p > 0
                              ? "var(--ql-accent)"
                              : "rgba(239,68,68,0.5)",
                          borderRadius: 2,
                          alignSelf: "flex-end",
                        }}
                        title={`Performance: ${p.toFixed(3)}`}
                      />
                    );
                  })}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: "var(--ql-text-muted)",
                  marginTop: 4,
                }}
              >
                Sorted performances. {"\u{1F7E1}"} = best pick. All are random
                — the spread is pure noise.
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
