export const chapterMeta = {
  title: "Evaluating Excess Returns",
  tagline:
    "How do you know your strategy actually works? Backtesting is essential but treacherous — learn the pitfalls and the tools to navigate them.",
  chapter: "Chapter 4",
  readTime: "15 min",
  sections: 10,
};

export const bigQuestions = [
  {
    id: "q1",
    emoji: "\u{1F9EA}",
    title: "How do we test strategies without running them live?",
    beginnerTake:
      "We use historical data to simulate what would have happened. But the data is limited — history doesn't repeat, and we can't design experiments like in a lab.",
  },
  {
    id: "q2",
    emoji: "\u26A0\uFE0F",
    title: "What can go wrong with backtesting?",
    beginnerTake:
      "Data leakage (using future info), survivorship bias (only looking at winners), and data snooping (testing so many strategies that some look good by chance).",
  },
  {
    id: "q3",
    emoji: "\u{1F6E1}\uFE0F",
    title: "How do we guard against false discoveries?",
    beginnerTake:
      "Use walk-forward testing to avoid data leakage, and apply statistical tools like the Rademacher complexity to put a 'haircut' on reported performance.",
  },
];

/* ── Section: Best Practices ── */

export const dataLeakageTypes = [
  {
    id: "survivorship",
    emoji: "\u{1F4C9}",
    name: "Survivorship Bias",
    description:
      "Only including stocks that survived the full backtest period. Delisted stocks often had big losses — removing them inflates performance.",
    remedy:
      "Use an objective inclusion rule applicable at each point in time, and assume complete loss on delisting.",
    severity: "high",
  },
  {
    id: "financial",
    emoji: "\u{1F4C4}",
    name: "Financial Statement Timing",
    description:
      "Using quarterly data as of the quarter it describes, not the day it was actually published. A Q4 report filed in February shouldn't appear in December data.",
    remedy:
      "Only include data as of the public release date, not the reference quarter.",
    severity: "high",
  },
  {
    id: "pointInTime",
    emoji: "\u23F3",
    name: "Point-in-Time vs. Restated Data",
    description:
      "Financial data gets corrected over time. If your backtest uses the corrected version, you're using information that wasn't available at the time.",
    remedy:
      "Always use point-in-time data — the values as they were originally reported.",
    severity: "medium",
  },
  {
    id: "priceAdjust",
    emoji: "\u2702\uFE0F",
    name: "Price Adjustment Leakage",
    description:
      "Split-adjusted prices can leak: a low historical price signals future splits (which happen after big gains). Use adjusted prices only for returns, not features.",
    remedy:
      "Compute returns from adjusted prices but use as-of-date raw prices for features.",
    severity: "medium",
  },
  {
    id: "missingness",
    emoji: "\u2753",
    name: "Informative Missingness",
    description:
      "Data that's missing because it was redacted or not yet available may carry forward-looking information about the stock.",
    remedy:
      "Investigate why data is missing. If missingness correlates with future returns, treat it as leakage.",
    severity: "low",
  },
];

export const bestPracticeCategories = [
  {
    id: "data",
    emoji: "\u{1F4BE}",
    label: "Data Sourcing",
    items: [
      { name: "Definition", detail: "Know exactly what the data means — units, currency, time convention." },
      { name: "Provenance", detail: "Where does the data come from? Is the vendor collecting or reselling?" },
      { name: "Completeness", detail: "Check for obviously and non-obviously missing data." },
      { name: "Quality Assurance", detail: "Does the provider check for change points and errors?" },
      { name: "Transformations", detail: "What imputation, winsorization, or adjustments were applied?" },
    ],
  },
  {
    id: "strategy",
    emoji: "\u{1F9ED}",
    label: "Strategy Development",
    items: [
      { name: "Have a Theory", detail: "Pre-register predictions — reduces the search space and makes results interpretable." },
      { name: "Reproducibility", detail: "Document everything so any strategy can be reproduced and rerun at any time." },
      { name: "Match Production", detail: "Use the same data, optimizer, and market-impact model in backtest as in live trading." },
      { name: "Calibrate Impact", detail: "Don't trust vendor market-impact models at face value — calibrate against live performance." },
      { name: "Define Protocol First", detail: "Lock the backtesting protocol before you start. Changing it after seeing results is data snooping." },
    ],
  },
];

/* ── Section: Backtesting Protocol ── */

export const cvSteps = [
  { label: "Split Data", detail: "Divide into K equal-sized folds (e.g. K=5).", color: "#f59e0b" },
  { label: "Hold Out One Fold", detail: "Use one fold as the test set, the rest as training.", color: "#3b82f6" },
  { label: "Train & Evaluate", detail: "Fit on K-1 folds, evaluate on the held-out fold.", color: "#10b981" },
  { label: "Rotate", detail: "Repeat for each fold, then average all K performances.", color: "#8b5cf6" },
  { label: "Final Holdout", detail: "Reserve a separate holdout set that is only used once, at the end.", color: "#ef4444" },
];

export const cvProblems = [
  {
    id: "timedep",
    emoji: "\u23F0",
    title: "Time Dependence",
    description:
      "Financial data is time-ordered. Shuffling rows breaks the temporal structure — tomorrow's returns depend on today's volatility.",
  },
  {
    id: "leakage",
    emoji: "\u{1F50D}",
    title: "Look-Ahead Leakage",
    description:
      "If a validation fold precedes the training fold, the training data contains future information. Momentum signals use past returns, which can appear in the validation fold.",
  },
  {
    id: "fishing",
    emoji: "\u{1F3A3}",
    title: "Fishing Expedition",
    description:
      "Run cross-validation on enough strategy classes and you'll inevitably find favorable results. The holdout set becomes 'just another variable to optimize.'",
  },
];

export const walkForwardSchemes = [
  {
    id: "fixed",
    name: "Fixed-Length Window",
    description:
      "The training window always has the same length. As we slide forward, old data drops off and new data is added.",
    pros: ["Consistent estimation conditions", "Natural for non-stationary data"],
    cons: ["Discards potentially useful older data"],
  },
  {
    id: "expanding",
    name: "Expanding Window",
    description:
      "The training window starts at a fixed point and grows over time. All historical data up to the test point is used.",
    pros: ["Uses all available data", "More stable estimates"],
    cons: ["Old data may not be relevant", "Heavier computation over time"],
  },
];

export const idealProtocolProperties = [
  { id: "nonanticipative", label: "Non-anticipative", description: "No data leakage — only past information is used." },
  { id: "serial", label: "Handles Serial Dependence", description: "Accounts for the time structure of financial data." },
  { id: "alldata", label: "Uses All Data", description: "No data is wasted sitting in a locked holdout set." },
  { id: "multiple", label: "Handles Multiple Testing", description: "Adjusts for the fact that many strategies are tested simultaneously." },
  { id: "rigorous", label: "Rigorous Decision Rule", description: "Provides probabilistic guarantees, not just heuristics." },
];

/* ── Section: Rademacher Anti-Serum ── */

export const rademacherInterpretations = [
  {
    id: "noise",
    emoji: "\u{1F4E1}",
    label: "Covariance with Noise",
    title: "How much can strategies match random noise?",
    description:
      "Generate a random sequence of +1 and -1 signals. The Rademacher complexity measures the best correlation any strategy can achieve with this pure noise. High complexity means the strategy set is rich enough to fit anything — including randomness.",
  },
  {
    id: "crossval",
    emoji: "\u2696\uFE0F",
    label: "Generalized Cross-Validation",
    title: "How inconsistent is performance across random splits?",
    description:
      "Split the time periods randomly into two halves. The Rademacher complexity measures the maximum discrepancy in average performance between the two halves. High discrepancy means unstable performance.",
  },
  {
    id: "span",
    emoji: "\u{1F4D0}",
    label: "Geometric Span",
    title: "How much of the ambient space do strategies cover?",
    description:
      "Think of each strategy's performance as a vector. The Rademacher complexity measures how well these vectors span the space of all possible outcomes. If they cover many directions, it's easy to overfit.",
  },
];

export const haircutFormula = {
  signalVersion: {
    label: "For Signals (IC)",
    description:
      "The true performance is at least the observed performance minus two penalties:",
    terms: [
      { symbol: "\u03B8\u0302\u2099", name: "Observed IC", role: "What you measure in the backtest" },
      { symbol: "2R\u0302", name: "Data Snooping", role: "Penalty for testing many strategies — grows with Rademacher complexity" },
      { symbol: "\u221A(log(2/\u03B4)/T)", name: "Estimation Error", role: "Finite-sample noise — shrinks as T grows" },
    ],
  },
  sharpeVersion: {
    label: "For Sharpe Ratios",
    description:
      "Similar but with larger estimation error because Sharpe values are unbounded:",
    terms: [
      { symbol: "\u03B8\u0302\u2099", name: "Observed Sharpe", role: "Empirical Sharpe ratio from the backtest" },
      { symbol: "2R\u0302", name: "Data Snooping", role: "Same Rademacher penalty — independent of distribution" },
      { symbol: "3\u221A(2log(2/\u03B4)/T) + \u221A(2log(2N/\u03B4)/T)", name: "Estimation Error", role: "Larger: accounts for unbounded values and N strategies" },
    ],
  },
};

/* ── Interactive game data ── */

export const leakageScenarios = [
  {
    id: "s1",
    scenario: "You use quarterly earnings data as of the quarter end date, not the filing date.",
    isLeakage: true,
    explanation: "Earnings are released weeks after the quarter ends. Using the quarter-end date means you're using data before it was publicly available.",
  },
  {
    id: "s2",
    scenario: "You compute 3-month momentum using split-adjusted prices and test on future returns.",
    isLeakage: false,
    explanation: "Using split-adjusted prices for return computation is fine — the adjustment is mechanical and doesn't leak future information.",
  },
  {
    id: "s3",
    scenario: "Your backtest universe only includes companies in the current S&P 500.",
    isLeakage: true,
    explanation: "This is survivorship bias. Companies currently in the S&P 500 are winners — they survived. The historical universe was different.",
  },
  {
    id: "s4",
    scenario: "You use last year's revenue to predict this year's returns.",
    isLeakage: false,
    explanation: "Using lagged data is correct — last year's revenue was known at the start of this year. No future info is used.",
  },
  {
    id: "s5",
    scenario: "You pick your lookback window (30 days vs 90 days) after seeing which performs better on the full sample.",
    isLeakage: true,
    explanation: "This is a subtle form of data snooping. The parameter was chosen after seeing outcomes — equivalent to testing multiple strategies.",
  },
  {
    id: "s6",
    scenario: "Analyst earnings estimates you use were revised after the company pre-announced bad results.",
    isLeakage: true,
    explanation: "If the pre-announcement happened after your signal date, the revised estimates contain future information.",
  },
  {
    id: "s7",
    scenario: "You train your model on 2010-2020 data and evaluate on 2021-2023 data, without overlap.",
    isLeakage: false,
    explanation: "Clean temporal separation with no overlap is proper out-of-sample testing.",
  },
  {
    id: "s8",
    scenario: "You remove stocks with missing data from your backtest universe.",
    isLeakage: true,
    explanation: "Missingness can be informative — stocks with missing data may have been delisted or in distress. Removing them biases toward healthy companies.",
  },
];

export const coinFlipGame = {
  description:
    "You have T=20 coin flips (returns) and N strategies. Each strategy predicts +1 or -1 for each flip. See how the best-of-N performance inflates as you add more strategies — even when ALL strategies are random.",
  trialCounts: [1, 5, 20, 100, 500],
};

export const haircutCalculator = {
  description:
    "Compute the 'haircut' — the penalty subtracted from your observed performance to get a lower bound on true performance.",
  defaults: {
    T: 2500,
    N: 1000,
    delta: 0.05,
    observedSharpe: 1.5,
    rademacher: 0.15,
  },
};

/* ── Quiz ── */

export const quizQuestions = [
  {
    id: "q1",
    question:
      "You test 500 trading signals and the best one has a Sharpe ratio of 2.0. What should you conclude?",
    options: [
      { text: "The signal is very strong and should be deployed immediately", correct: false },
      { text: "The signal might be a false discovery — apply a multiple testing correction", correct: true },
      { text: "Sharpe ratios above 1.5 are always real", correct: false },
      { text: "500 signals is too few to worry about multiple testing", correct: false },
    ],
    explanation:
      "Testing 500 signals inflates the best observed Sharpe. The Rademacher Anti-Serum applies a haircut that accounts for data snooping. With 500 signals, a Sharpe of 2.0 might correspond to a true Sharpe well below 1.0.",
  },
  {
    id: "q2",
    question:
      "Why is survivorship bias the 'simplest and most impactful' form of data leakage?",
    options: [
      { text: "Because it's easy to detect", correct: false },
      { text: "Because survivors have higher liquidity, momentum, and size — systematically biasing the sample", correct: true },
      { text: "Because only large-cap stocks survive", correct: false },
      { text: "Because it only affects penny stocks", correct: false },
    ],
    explanation:
      "Delisted stocks tend to have experienced large losses, low prices, and illiquidity. Removing them biases the sample toward outperformers, making any strategy appear better than it really is.",
  },
  {
    id: "q3",
    question:
      "What is the key advantage of walk-forward backtesting over K-fold cross-validation for financial data?",
    options: [
      { text: "It uses more data", correct: false },
      { text: "It respects the time ordering and avoids temporal data leakage", correct: true },
      { text: "It's faster to compute", correct: false },
      { text: "It always gives higher Sharpe ratios", correct: false },
    ],
    explanation:
      "Walk-forward only uses data up to time t to make decisions for time t+1, just like in real trading. K-fold cross-validation shuffles time periods, which can leak future information through time-dependent features like momentum.",
  },
  {
    id: "q4",
    question: "In the Rademacher haircut formula, what does the '2R-hat' term represent?",
    options: [
      { text: "The estimation error from finite samples", correct: false },
      { text: "The data snooping penalty — grows with the richness of the strategy set", correct: true },
      { text: "The risk-free rate adjustment", correct: false },
      { text: "The transaction cost estimate", correct: false },
    ],
    explanation:
      "2R-hat is the Rademacher complexity term. It measures how well the strategy set can fit random noise. More strategies, or more diverse strategies, means higher R-hat and a larger haircut.",
  },
  {
    id: "q5",
    question:
      "If two strategy sets have the same size N, which one has higher Rademacher complexity?",
    options: [
      { text: "The one with more correlated strategies", correct: false },
      { text: "The one with more diverse (uncorrelated) strategies", correct: true },
      { text: "They are always equal if N is the same", correct: false },
      { text: "The one with higher average returns", correct: false },
    ],
    explanation:
      "Rademacher complexity depends on how much the strategy vectors 'span' the ambient space, not just how many there are. N identical strategies have the same complexity as one. Diverse strategies cover more directions, making it easier to fit noise.",
  },
  {
    id: "q6",
    question: "What is the recommended use for split-adjusted stock prices?",
    options: [
      { text: "Use them for everything — they're always better", correct: false },
      { text: "Use them for return computation only, not for features", correct: true },
      { text: "Never use them — always use raw prices", correct: false },
      { text: "Use them only for stocks that actually split", correct: false },
    ],
    explanation:
      "Split-adjusted prices reflect future splits (which tend to follow big gains), leaking forward-looking information. They're fine for computing returns (mechanical adjustment), but raw as-of-date prices should be used for features.",
  },
];

/* ── Summary ── */

export const takeaways = [
  {
    emoji: "\u26A0\uFE0F",
    title: "Backtesting Is Not Experimentation",
    body: "Financial studies are observational and use historical data that's limited and non-stationary. Designing and following a rigorous protocol is essential.",
  },
  {
    emoji: "\u{1F50D}",
    title: "Data Leakage Kills Backtests",
    body: "Survivorship bias, point-in-time errors, and price adjustment leakage are the most common and dangerous pitfalls. Use point-in-time data and define your universe prospectively.",
  },
  {
    emoji: "\u{1F504}",
    title: "Cross-Validation Has Limits",
    body: "K-fold CV shuffles time, risking temporal leakage. Walk-forward respects time ordering but uses less data. Neither alone is sufficient.",
  },
  {
    emoji: "\u{1F6E1}\uFE0F",
    title: "The Rademacher Anti-Serum",
    body: "A principled 'haircut' on backtested performance: true performance \u2265 observed - data snooping penalty - estimation error. Works for any number of strategies simultaneously.",
  },
  {
    emoji: "\u{1F4CA}",
    title: "Complexity Captures Overfitting Risk",
    body: "Rademacher complexity measures how well your strategy set can fit noise. More diverse strategies = higher complexity = bigger haircut needed.",
  },
  {
    emoji: "\u{1F3AF}",
    title: "Have a Theory, Lock the Protocol",
    body: "Pre-register predictions, define the protocol before testing, enforce reproducibility, and match backtest conditions to production as closely as possible.",
  },
];
