// Chapter 2 content — interactive walkthrough of "Returns: Properties and Models."
// The original book title and author have been removed per the project requirements.

export const chapterMeta = {
  title: "Returns — Properties and Models",
  tagline: "How returns behave, and how to model their volatility.",
  chapter: "Chapter 2: Returns — Properties and Models",
};

export const bigQuestions = [
  {
    id: "q1",
    emoji: "📐",
    title: "How do we even DEFINE a return?",
    beginnerTake:
      "Sounds dumb until you try. Did you get a dividend? Did you borrow cash? Are you measuring net or excess? The setup matters before any math starts.",
  },
  {
    id: "q2",
    emoji: "🔍",
    title: "What patterns do real returns show?",
    beginnerTake:
      'Real markets are NOT random coin flips. There are 4 stubborn empirical patterns ("stylized facts") that any model has to respect.',
  },
  {
    id: "q3",
    emoji: "📈",
    title: "Why is volatility the central character?",
    beginnerTake:
      "You can rarely predict tomorrow's return. But you CAN predict tomorrow's \"size of move\" — and that is what risk management is built on.",
  },
  {
    id: "q4",
    emoji: "🌪️",
    title: "What is GARCH and why is it everywhere?",
    beginnerTake:
      'A simple recipe that says: "today\'s vol depends on yesterday\'s vol AND yesterday\'s shock". It captures the way storms cluster.',
  },
  {
    id: "q5",
    emoji: "⏱️",
    title: "Can we just measure volatility from the data?",
    beginnerTake:
      'With minute-by-minute prices, yes — that\'s "realized volatility". You don\'t even need a fancy model. But there are gotchas.',
  },
  {
    id: "q6",
    emoji: "🔗",
    title: "How do all these models relate?",
    beginnerTake:
      'GARCH and EWMA (exponentially-weighted moving average) are siblings. Both are special cases of "state-space" models. The math unifies what looked like a zoo.',
  },
];

export const returnsTabs = [
  {
    id: "basic",
    label: "The basic return",
    emoji: "💵",
    title: 'A return is "what you got back per dollar in"',
    body: [
      "You buy 1 dollar of stock today. Tomorrow it is worth R dollars. The return is R − 1.",
      "In standard notation: r = (P(1) − P(0)) / P(0). Numerator: how much the price moved. Denominator: what you started with.",
    ],
    formula: "r = (P₁ − P₀) / P₀",
    example: { p0: 100, p1: 108, div: 0, label: "No dividend" },
    detail:
      'If the company paid a dividend D between day 0 and day 1, you also pocketed that. The "dividend-adjusted return" puts D in the top of the fraction: r = (P₁ + D − P₀) / P₀.',
  },
  {
    id: "excess",
    label: "Excess returns",
    emoji: "📉",
    title: 'Subtract the "risk-free rate" — what cash would have earned',
    body: [
      "Even if you never invested, your dollars sitting in a bank account earn a small interest rate r_f (think SOFR overnight rate in the US).",
      'So the part you got from RISKING money is r − r_f. From now on, "return" in this walkthrough means EXCESS return — net of cash. Otherwise we\'d give credit to risky strategies for a return you could have had for free.',
    ],
    formula: "r_excess = r − r_f",
    example: { r: 0.08, rf: 0.02 },
    detail:
      "For a portfolio Σ wᵢ·rᵢ, lending an amount equal to its NMV gives you the same exposure but lets you net out r_f. The excess-return form falls right out of the algebra and is THE standard way to compare strategies.",
  },
  {
    id: "log",
    label: "Log returns",
    emoji: "➕",
    title: "Log returns ADD over time. Net returns multiply.",
    body: [
      "If you make 5%, then 5%, then 5% — your total is NOT 15%. It is 1.05 × 1.05 × 1.05 − 1 ≈ 15.76%. Net returns compound multiplicatively.",
      "Define r̃ = log(1 + r). Then over many periods you just SUM them up. That's a huge simplification for time-series math.",
      "Bonus: for small returns, log(1 + r) ≈ r. So when daily moves are tiny, the two are basically interchangeable. That is why everyone uses log returns for daily analysis.",
    ],
    formula: "r̃ = log(1 + r)   ⇒   Σ r̃(t) = log of compounded return",
    detail:
      "Caveat: log returns don't work cleanly across portfolios — log of a sum is not the sum of logs. So portfolios use net returns; time-series of single assets use log returns.",
  },
];

export const stylizedFacts = [
  {
    id: "sf1",
    emoji: "🪙",
    name: "Absence of autocorrelation",
    color: "#60a5fa",
    plain:
      "Knowing yesterday's return tells you essentially NOTHING about the sign of today's return.",
    detail:
      'If we plot lagged correlations of daily returns, they are basically zero past lag 0. This is good news for the "efficient market" intuition — a simple "buy if it went up yesterday" strategy will not work.',
    caveat:
      "But ZERO correlation is not the same as INDEPENDENT. The next 3 facts will show that returns are very much dependent — just not in their sign.",
  },
  {
    id: "sf2",
    emoji: "🦘",
    name: "Heavy tails",
    color: "#f87171",
    plain:
      "Extreme moves happen FAR more often than a normal (bell-curve) distribution predicts.",
    detail:
      "Empirically, the tail of the return distribution decays like a power law: P(r > x) ≈ x^(−α) with α ≈ 4. Meaning: 5-sigma days are not 1-in-3-million, they are more like 1-in-200.",
    caveat:
      "For variance estimation, you need the 4th moment to be finite. With α ≈ 4, you are right on the edge. This is why reckless moving averages of squared returns go wild around crashes.",
  },
  {
    id: "sf3",
    emoji: "🌩️",
    name: "Volatility clustering",
    color: "#fbbf24",
    plain:
      "The SIZE of moves IS predictable — even though the direction is not. Big days follow big days.",
    detail:
      "Take |r_t| or r_t² and compute its lagged correlation. Now correlations are STRONG and DECAY SLOWLY. This is the Taylor effect. It is the single most important empirical fact behind volatility models.",
    caveat:
      "Calm begets calm. Storms beget storms. This is the central insight that GARCH and EWMA both try to formalize.",
  },
  {
    id: "sf4",
    emoji: "📊",
    name: "Aggregational Gaussianity",
    color: "#34d399",
    plain:
      "Daily returns are wild and heavy-tailed. But monthly returns look much more bell-curve-shaped.",
    detail:
      "When you sum many daily returns into a monthly one, the central limit theorem starts pulling the distribution toward a normal. So the tail-fatness is largely a high-frequency phenomenon.",
    caveat:
      "This is good news for long-horizon investors. For day-traders and risk managers, daily heavy tails are very real.",
  },
];

export const garchModel = {
  title: "GARCH(1, 1): the workhorse volatility model",
  oneLiner:
    "Today's variance = a constant + a piece of yesterday's SHOCK + a piece of yesterday's VARIANCE.",
  equations: [
    { label: "Return", tex: "r_t = h_t · ε_t" },
    { label: "Variance", tex: "h²_t = α₀ + α₁ · r²_{t−1} + β₁ · h²_{t−1}" },
    { label: "Shock", tex: "ε_t ~ N(0, 1)" },
  ],
  parts: [
    {
      symbol: "h_t",
      role: "Today's volatility (the unobserved STATE)",
      desc:
        "You can't measure h_t directly. But it controls how big today's return will be — it's the dial that GARCH twists every day.",
    },
    {
      symbol: "ε_t",
      role: "A random shock, mean 0, variance 1",
      desc:
        "Pure noise. The actual return r_t is then volatility × shock. So if h_t is calm, r_t is small — even if ε_t is big.",
    },
    {
      symbol: "α₀",
      role: "A baseline (long-run variance × something)",
      desc:
        "Without shocks, variance drifts toward this floor. It's why GARCH does not blow up to infinity or down to zero.",
    },
    {
      symbol: "α₁",
      role: "How much yesterday's SHOCK affects today's vol",
      desc:
        "Big surprise yesterday → α₁ × that surprise gets added to today's variance. This is what creates clustering.",
    },
    {
      symbol: "β₁",
      role: "How much yesterday's VOL persists into today's vol",
      desc:
        "High β₁ ≈ vol changes slowly. Low β₁ ≈ vol forgets fast. For most stocks, β₁ is around 0.85–0.95.",
    },
  ],
  insight:
    "Reading the formula: today's variance has memory (β₁ piece) AND reacts to news (α₁ piece). After a big shock, the next h_t is bigger. Big h_t means the next r_t is likely big too. Now you have clustering — exactly stylized fact #3.",
  dampening:
    'But variance can\'t grow forever: the equation drags h²_t back toward an "equilibrium" level α₀/(1 − β₁) at a geometric rate. Storms eventually pass.',
};

export const realizedVol = {
  title: "Realized Volatility: just measure it",
  oneLiner:
    "If you have minute-by-minute prices, you can ESTIMATE today's volatility directly from data — no GARCH model needed.",
  intuition: [
    { step: 1, desc: "Slice today into n little intervals (say, 78 five-minute bars)." },
    { step: 2, desc: "Compute the return r(j) inside each bar." },
    { step: 3, desc: "Add up r(j)² across all bars. That sum IS your estimate of today's variance σ²." },
  ],
  formula: "σ̂² = Σⱼ r(j)²",
  whyItWorks:
    "As n grows, the noise in the estimate shrinks like 2σ⁴/n. So 5-minute bars give a much better daily-vol estimate than just one bar (i.e. the daily return squared).",
  catches: [
    {
      emoji: "🔬",
      name: "Microstructure noise",
      desc:
        "At very high frequencies, bid-ask bounce dominates. The sum-of-squared-returns starts measuring noise, not value. The sweet spot is around 5-minute bars for liquid stocks.",
    },
    {
      emoji: "🧊",
      name: "Thinly-traded stocks",
      desc:
        'If a stock trades less than once per 5 minutes, your "5-minute returns" are mostly stale. Don\'t use this method for illiquid names.',
    },
    {
      emoji: "🏔️",
      name: "Time-varying vol",
      desc:
        "You assumed σ was constant inside the day. It's usually not — open and close are way more volatile than midday. There are corrections (truncated RV, kernel RV) for this.",
    },
    {
      emoji: "🌃",
      name: "Open vs close",
      desc:
        "The gap between yesterday's close and today's open is huge — overnight news drops with no trading. Realized vol from intraday data misses it.",
    },
  ],
  practitionerChoice:
    'Liu et al. (2015) compared dozens of variants. The verdict: plain "vanilla" RV at 5-minute intervals is hard to beat for most assets. Boring. Reliable. Pick that one until you have a reason not to.',
};

export const ewmaModel = {
  title: "EWMA: the simplest possible volatility filter",
  oneLiner:
    "Just take an exponentially-weighted moving average of squared returns. Old observations fade out smoothly.",
  formula: "σ̂²_t = (1 − K) · r²_t + K · σ̂²_{t−1}",
  intuition:
    "Each day's squared return gets weighted by (1 − K), and the previous estimate gets weighted by K. With 0 < K < 1, the influence of any past return decays geometrically.",
  unfolded: "σ̂²_t = (1 − K) · [ r²_t + K·r²_{t−1} + K²·r²_{t−2} + K³·r²_{t−3} + ... ]",
  knobMeaning: [
    {
      k: "K close to 0",
      meaning: "Short memory. Last few days dominate. Reacts fast — but also very jumpy.",
    },
    {
      k: "K close to 1",
      meaning:
        "Long memory. Many years of history matter. Smooth — but slow to react to regime change.",
    },
  ],
  bigReveal: {
    title: "Insight: GARCH IS EWMA, with one extra piece",
    desc:
      "Look at GARCH(1,1) again. If you drop the constant α₀ and set α₁ = 1 − K and β₁ = K — the GARCH variance recursion becomes EXACTLY the EWMA formula. EWMA is GARCH(1,1) without the long-run-mean offset.",
    why:
      "So when practitioners (RiskMetrics, Barra, Axioma) use EWMA in production, they are implicitly using a sibling of GARCH. Same family, simpler face.",
  },
  stateSpace: {
    title: 'And both are special cases of a "state-space" model',
    desc:
      "A state-space model has TWO equations: one for how a hidden state evolves over time, and one for how a noisy observation depends on it. The Kalman filter optimally estimates the state from observations.",
    muthExample:
      "Muth (1960): the state is the variance, evolving as a random walk. The observation is r_t² = state + noise. The optimal filter? An exponentially-weighted moving average. Surprise — same animal.",
    payoff:
      'This is why state-space models are the unifying language. Kalman filter, EWMA, GARCH, and Harvey-Shephard volatility models are all variations on "estimate a hidden state from noisy observations."',
  },
};

export const quizQuestions = [
  {
    id: "q1",
    question:
      "You buy 1 share of a stock at $100. A month later it pays a $2 dividend, and the next day it trades at $105. What is your dividend-adjusted return for the month?",
    options: [
      { text: "7%", correct: true },
      { text: "5%", correct: false },
      { text: "2%", correct: false },
      { text: "−2%", correct: false },
    ],
    explanation:
      "r = (P₁ + D − P₀) / P₀ = (105 + 2 − 100) / 100 = 7%. The dividend is part of what you actually received, so it goes in the numerator.",
  },
  {
    id: "q2",
    question: "Why do we usually work with EXCESS returns instead of raw returns?",
    options: [
      {
        text: "Because cash sitting in your account also earns interest, so we want the part of the return that came from RISKING the money",
        correct: true,
      },
      { text: "Because they are easier to compute", correct: false },
      { text: "Because regulators require it", correct: false },
      { text: "Because they always have mean zero", correct: false },
    ],
    explanation:
      "Excess return = r − r_f. We subtract the risk-free rate so we don't give a strategy credit for returns you could have earned by doing nothing risky.",
  },
  {
    id: "q3",
    question: "Which of these is NOT one of the 4 stylized facts about returns?",
    options: [
      {
        text: "Daily returns can be predicted from the previous day's sign",
        correct: true,
      },
      { text: "Returns have heavy tails (extreme moves are common)", correct: false },
      {
        text: "Absolute returns are positively autocorrelated (volatility clusters)",
        correct: false,
      },
      { text: "Monthly returns look more Gaussian than daily returns", correct: false },
    ],
    explanation:
      "Stylized fact #1 is the OPPOSITE: returns have ESSENTIALLY ZERO autocorrelation. You cannot predict the sign of tomorrow's return from yesterday's. The other three statements are all real stylized facts.",
  },
  {
    id: "q4",
    question:
      "In GARCH(1,1): h²_t = α₀ + α₁·r²_{t−1} + β₁·h²_{t−1}. What does the term β₁·h²_{t−1} represent?",
    options: [
      { text: "How much yesterday's VOLATILITY level persists into today", correct: true },
      { text: "A random shock", correct: false },
      { text: "The risk-free rate", correct: false },
      { text: "The long-run mean variance", correct: false },
    ],
    explanation:
      'β₁ controls the "memory" of the variance process. Yesterday\'s variance (h²_{t−1}) carries forward into today, scaled by β₁. Typical values are 0.85–0.95 for daily stock returns — meaning vol persists strongly.',
  },
  {
    id: "q5",
    question: 'What is "Realized Volatility" using 5-minute bars?',
    options: [
      {
        text: "The square root of the sum of 5-minute squared returns over a day",
        correct: true,
      },
      { text: "A forecast from a GARCH model fit on 5-minute returns", correct: false },
      { text: "The standard deviation of monthly returns", correct: false },
      { text: "The implied volatility from option prices", correct: false },
    ],
    explanation:
      "Realized variance is just Σⱼ r(j)² over the day. Realized volatility is its square root. The bigger n is, the lower the noise in the estimate — until microstructure noise starts to dominate.",
  },
  {
    id: "q6",
    question: "EWMA and GARCH(1,1) are related how?",
    options: [
      {
        text: "EWMA is GARCH(1,1) with α₀ = 0 — i.e. without the long-run mean offset",
        correct: true,
      },
      { text: "They are completely different families with no relation", correct: false },
      { text: "EWMA is a forecast of GARCH parameters", correct: false },
      { text: "GARCH is a special case of realized volatility", correct: false },
    ],
    explanation:
      "Set α₀ = 0, α₁ = 1 − K, β₁ = K and the GARCH recursion becomes the EWMA recursion exactly. The two models are siblings.",
  },
  {
    id: "q7",
    question: "Why are LOG returns convenient for time-series analysis?",
    options: [
      {
        text: "Because they ADD over time, so the log of compound return = sum of log returns",
        correct: true,
      },
      { text: "Because they are always positive", correct: false },
      { text: "Because they have zero variance", correct: false },
      { text: "Because they ignore dividends", correct: false },
    ],
    explanation:
      "Net returns multiply when you compound: (1+r₁)(1+r₂)(1+r₃)... Log returns sum: log(1+r₁) + log(1+r₂) + ... This is much easier for variance and time-series math. For small returns, log(1+r) ≈ r, so the two are nearly the same on a daily scale.",
  },
];

export const takeaways = [
  {
    emoji: "📜",
    title: "A return is what you get back, per dollar in",
    body:
      "Add dividends. Subtract the risk-free rate. Use log returns when summing over time. None of these are math tricks — they are accounting choices that make the rest of the analysis consistent.",
  },
  {
    emoji: "🔍",
    title: "Real returns have 4 stubborn empirical patterns",
    body:
      "No autocorrelation in returns. Heavy tails. Strong autocorrelation in absolute / squared returns (volatility clustering). And aggregational Gaussianity at longer horizons.",
  },
  {
    emoji: "🌩️",
    title: "Volatility is the predictable part",
    body:
      "You cannot easily forecast tomorrow's SIGN. But you CAN forecast tomorrow's SIZE. That is what risk management is built on, and what GARCH and EWMA are designed to capture.",
  },
  {
    emoji: "⏱️",
    title: "High-frequency data lets you measure vol directly",
    body:
      "Sum of squared 5-minute returns ≈ today's variance. Boring, robust, hard to beat. The catches: microstructure noise at very high frequency, illiquid names, and overnight gaps.",
  },
  {
    emoji: "🔗",
    title: "GARCH, EWMA, Kalman — same family",
    body:
      "EWMA is GARCH(1,1) with the long-run mean dropped. Both are special cases of state-space models, optimally estimated by a Kalman filter.",
  },
];
