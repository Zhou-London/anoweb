export const chapterMeta = {
  title: "Linear Models of Returns",
  tagline: "Factor models are the backbone of quantitative investing — flexible, interpretable, and powerful.",
  chapter: "Chapter 3",
  readTime: "15 min",
  sections: 10,
};

export const bigQuestions = [
  {
    id: "q1",
    emoji: "📐",
    title: "What do we intend for linear models of returns?",
    beginnerTake:
      "A factor model says every stock's return is driven by a handful of common forces (factors) plus some randomness unique to that stock. It's like saying weather affects all farms, but each farm also has its own soil quality.",
  },
  {
    id: "q2",
    emoji: "🔍",
    title: "How do we interpret them?",
    beginnerTake:
      "Three ways: as a network (factors flow into stocks), as a superposition (returns are a blend of a few templates), or as a dot product (each stock's exposure to each factor determines its expected return).",
  },
  {
    id: "q3",
    emoji: "🛠️",
    title: "What are their applications?",
    beginnerTake:
      "Factor models power four pillars of quant investing: understanding performance (attribution), measuring risk, constructing portfolios, and researching alpha signals.",
  },
];

export const factorModelParts = [
  {
    symbol: "r",
    name: "Asset Returns",
    description: "A vector of n asset excess returns (above risk-free rate). This is what we observe in the market each period.",
    color: "#f59e0b",
  },
  {
    symbol: "\u03B1",
    name: "Alpha",
    description: "The expected return that isn't explained by factors. This is the 'skill' component — what every quant is hunting for.",
    color: "#8b5cf6",
  },
  {
    symbol: "B",
    name: "Loadings Matrix",
    description: "An n\u00D7m matrix connecting assets to factors. Each row tells you how sensitive a stock is to each factor. Think of it as a stock's 'DNA' — its factor fingerprint.",
    color: "#3b82f6",
  },
  {
    symbol: "f",
    name: "Factor Returns",
    description: "A vector of m factor returns — the common forces driving all stocks. These are few in number (maybe 50\u2013100) but affect thousands of stocks simultaneously.",
    color: "#10b981",
  },
  {
    symbol: "\u03B5",
    name: "Idiosyncratic Returns",
    description: "Per-stock randomness that isn't explained by factors. Independent across stocks, zero-mean, and the part that diversification can eliminate.",
    color: "#ef4444",
  },
];

export const loadingsTypes = [
  {
    id: "style",
    emoji: "📊",
    name: "Style Loadings",
    color: "#f59e0b",
    description: "Continuous numbers measuring a stock's characteristic: momentum score, value score, size, etc. These are often z-scored (mean 0, std 1) for comparability.",
    example: "AAPL might have momentum = 1.2, value = -0.8, meaning high momentum and expensive",
  },
  {
    id: "country",
    emoji: "🌍",
    name: "Country Loadings",
    color: "#10b981",
    description: "Binary (0 or 1) flags indicating which country a stock belongs to. When the US market factor goes up, all US stocks feel it.",
    example: "A US stock has USA=1, UK=0, Japan=0; a UK stock has USA=0, UK=1, Japan=0",
  },
  {
    id: "industry",
    emoji: "🏭",
    name: "Industry Loadings",
    color: "#3b82f6",
    description: "Binary flags for industry membership. If biotech rallies, all biotech stocks move together through the industry factor.",
    example: "AMZN might have Retail=1, Tech=0; AAPL has Retail=0, Tech=1",
  },
];

export const interpretations = [
  {
    id: "graphical",
    emoji: "🕸️",
    label: "Graphical Model",
    title: "Factor Models as Networks",
    description:
      "Think of factors as broadcast towers and stocks as receivers. A few factor 'towers' send signals through the loadings 'wires,' and each stock's return is the sum of all the signals it picks up, plus its own noise.",
    formula: "E(r\u1D62 \u2212 \u03B1\u1D62 | f) = \u03A3\u2C7C B\u1D62\u2C7C \u00B7 f\u2C7C",
    insight:
      "In a typical regional risk model, you might have 10,000 stocks connected to 100 factors. The loadings matrix B is sparse \u2014 most entries are zero. This sparsity is what makes the model tractable.",
  },
  {
    id: "superposition",
    emoji: "🎨",
    label: "Superposition",
    title: "Returns as Blended Templates",
    description:
      "Each factor column in B is a 'template' vector across all n stocks. The cross-section of returns at any point in time is a weighted combination of these few templates. Returns live in a low-dimensional space.",
    formula: "E(r \u2212 \u03B1 | f) = \u03A3\u2C7C B\u2099\u2C7C \u00B7 f\u2C7C",
    insight:
      "This is powerful for portfolios: the expected PnL of a portfolio w is w'\u03B1 + \u27E8b, f\u27E9 where b = B'w are the factor exposures. You can decompose PnL into factor-by-factor contributions.",
  },
  {
    id: "dotproduct",
    emoji: "📐",
    label: "Dot Product",
    title: "Per-Stock Scalar Product",
    description:
      "For a single stock i, its factor return is the dot product of its personal loadings vector B\u1D62 with the factor return vector f. Each stock 'projects' onto the factor space differently.",
    formula: "E(r\u1D62 \u2212 \u03B1\u1D62 | f) = \u27E8B\u1D62, f\u27E9",
    insight:
      "This interpretation connects directly to performance attribution: if you know a stock's loadings and the factor returns, you can explain exactly how much of its return came from each factor.",
  },
];

export const alphaTypes = [
  {
    id: "spanned",
    emoji: "🎯",
    name: "Alpha Spanned",
    formula: "\u03B1\u2016 = B[\u03BB + E(f)]",
    description:
      "The component of alpha that lies in the column space of B. This alpha is indistinguishable from expected factor returns \u2014 you can't tell if returns come from alpha or from the factors themselves.",
    implication: "Comes with factor risk. Can't diversify it away. It's 'risky alpha' \u2014 like timing the market factor.",
    color: "#f59e0b",
  },
  {
    id: "orthogonal",
    emoji: "💎",
    name: "Alpha Orthogonal",
    formula: "\u03B1\u22A5 where B'\u03B1\u22A5 = 0",
    description:
      "The component of alpha perpendicular to all factors. This is the 'pure skill' component that can't be replicated by trading factors alone.",
    implication:
      "Extremely valuable! A portfolio proportional to \u03B1\u22A5 has Sharpe ratio \u2265 \u221An \u00B7 \u03BC / \u2016\u03A9\u03B5\u20162 \u2014 it grows with the number of assets. But markets cap this, so \u03B1\u22A5 per stock must be tiny.",
    color: "#8b5cf6",
  },
];

export const transformations = [
  {
    id: "rotations",
    emoji: "🔄",
    name: "Rotations",
    subtitle: "Same model, different view",
    description:
      "Multiply loadings by C\u207B\u00B9 and factors by C. The model r = \u03B1 + \u0042\u0303f\u0303 + \u03B5 produces identical returns. This is called rotational indeterminacy.",
    useCases: [
      { label: "Identity Factor Covariance", detail: "Make factors uncorrelated with unit variance. Factor risk = sum of squared exposures." },
      { label: "Orthonormal Loadings", detail: "Make loading columns unit-norm and orthogonal. Clean geometric interpretation." },
      { label: "Z-Scored Loadings", detail: "Rescale loadings to zero mean, unit variance. Makes exposures comparable across factors." },
    ],
    color: "#3b82f6",
  },
  {
    id: "projections",
    emoji: "📽️",
    name: "Projections",
    subtitle: "Fewer factors, closest approximation",
    description:
      "Replace B with a simpler matrix A (fewer columns). The best approximation uses g = Hf where H = (A'A)\u207B\u00B9A'B. This is idempotent \u2014 projecting twice gives the same result.",
    useCases: [
      { label: "Simplify Vendor Models", detail: "Remove factors you don't trust from a third-party risk model." },
      { label: "Stable Hedging", detail: "If some loadings change too fast, project them out for more stable portfolio management." },
      { label: "User-Friendly Reports", detail: "Give clients a simplified risk model while keeping the full one internally." },
    ],
    color: "#10b981",
  },
  {
    id: "pushouts",
    emoji: "🔧",
    name: "Push-Outs",
    subtitle: "More factors, richer model",
    description:
      "Add new factors by modeling structure in the idiosyncratic returns: \u03B5 = Ag + \u03B7. The enriched model becomes r = \u03B1\u22A5 + Bf + Ag + \u03B7, with A'B = 0.",
    useCases: [
      { label: "Regime Changes", detail: "Historical model misses a new factor. Push out the structure hiding in residuals." },
      { label: "Custom Factors", detail: "Add proprietary alpha signals as new factors while preserving the existing model." },
      { label: "Model Improvement", detail: "Capture residual correlation that the base model missed." },
    ],
    color: "#f59e0b",
  },
];

export const applications = [
  {
    id: "attribution",
    emoji: "📊",
    label: "Performance Attribution",
    title: "Where Did the PnL Come From?",
    body: "Portfolio PnL at time t decomposes into factor PnL (b'f) and residual PnL (w'\u03B1 + w'\u03B5). You can slice it by factor, by time period, by stock group, or by factor group (style vs industry vs country). This lets portfolio managers understand whether they made money from skill (\u03B1) or from factor bets.",
    formula: "PnL = \u03A3 Factor\u2C7C PnL + \u03A3 Stock\u1D62 Residual PnL",
    keyTerms: [
      { term: "Factor Exposures", def: "b = B'w \u2014 how much your portfolio 'bets' on each factor" },
      { term: "Factor PnL", def: "b'\u1D57f\u1D57 \u2014 returns explained by common factors" },
      { term: "Residual PnL", def: "w'\u1D57(\u03B1 + \u03B5\u1D57) \u2014 stock-specific returns" },
    ],
  },
  {
    id: "risk",
    emoji: "🛡️",
    label: "Risk Management",
    title: "Forecast and Decompose Volatility",
    body: "Portfolio variance = b'\u03A9\u2091b + w'\u03A9\u03B5w. The first term is factor risk, the second is idiosyncratic risk. You can decompose factor risk further by partitioning factors into groups (style/industry/country). Key metrics include percentage of idio variance, marginal contribution to risk (MCR), and Sharpe ratio sensitivity.",
    formula: "var(r'w) = b'\u03A9\u2091b + w'\u03A9\u03B5w",
    keyTerms: [
      { term: "% Idio Variance", def: "100 \u00D7 (idio var) / (total var) \u2014 how much risk is stock-specific" },
      { term: "Marginal Contribution", def: "m\u1D62 = \u03C1\u1D62 \u2014 the beta of factor group i to the total portfolio" },
      { term: "Factor Variance", def: "b'\u03A9\u2091b \u2014 risk from common factor movements" },
    ],
  },
  {
    id: "portfolio",
    emoji: "💼",
    label: "Portfolio Construction",
    title: "Build Better Portfolios",
    body: "Factor models enable mean-variance optimization because the empirical covariance matrix (T\u207B\u00B9RR') is usually not invertible when assets outnumber time periods. The factor structure provides a well-conditioned \u03A9\u1D63 and its inverse \u03A9\u1D63\u207B\u00B9, both essential for optimization. The model also separates expected returns into \u03B1 (skill) and B'E(f) (factor premia), letting PM plan, monitor, and understand their strategies.",
    formula: "w = \u03BB\u03A9\u1D63\u207B\u00B9\u03B1",
    keyTerms: [
      { term: "Precision Matrix", def: "\u03A9\u1D63\u207B\u00B9 \u2014 inverse covariance, central to optimization" },
      { term: "Factor Structure", def: "Makes \u03A9\u1D63 invertible even when n >> T" },
      { term: "Legibility", def: "Factor exposures + risk decomposition make strategies transparent to PMs" },
    ],
  },
  {
    id: "alpha",
    emoji: "🔬",
    label: "Alpha Research",
    title: "Find and Validate Signals",
    body: "The signal researcher focuses on \u03B1, the risk manager on Bf, and the portfolio manager combines everything. Factor models help alpha research by separating priced factors (Bf \u2014 returns you get from bearing systematic risk) from unpriced factors (\u03B1 \u2014 genuine skill). For 'smart beta' investors, Bf is everything that matters.",
    formula: "E(r) = \u03B1 + B'E(f)",
    keyTerms: [
      { term: "Priced Factors", def: "Factors with positive expected returns \u2014 compensation for risk" },
      { term: "Unpriced Factors", def: "Alpha signals \u2014 expected returns not explained by risk" },
      { term: "Smart Beta", def: "Investment style that systematically harvests factor premia" },
    ],
  },
];

export const factorModelTypes = [
  {
    id: "characteristic",
    emoji: "📋",
    name: "Characteristic Model",
    inputs: "Returns r\u1D57 and loadings B\u1D57",
    estimated: "Factor returns f\u1D57 and idiosyncratic returns \u03B5\u1D57",
    description:
      "The most common approach. B\u1D57 is a matrix of observable asset characteristics (value, momentum, size, industry membership) available at the start of each period. Factor returns are estimated via cross-sectional regression.",
    covered: "Chapter 6",
    color: "#f59e0b",
  },
  {
    id: "statistical",
    emoji: "🧮",
    name: "Statistical Model",
    inputs: "Returns r\u1D57 only",
    estimated: "Everything: B\u1D57, f\u1D57, and \u03B5\u1D57",
    description:
      "Only returns are observed. Both loadings and factors are extracted from the data using techniques like PCA. The factors don't have economic labels \u2014 they're purely statistical constructs.",
    covered: "Chapter 7",
    color: "#3b82f6",
  },
  {
    id: "macro",
    emoji: "🏛️",
    name: "Macroeconomic Model",
    inputs: "Returns r\u1D57 and factors f\u1D57",
    estimated: "Loadings B\u1D57 and idiosyncratic \u03B5\u1D57",
    description:
      "Factors are observable macro time series (GDP growth, inflation, interest rates). Loadings are estimated by regressing each stock's returns on the macro factors.",
    covered: "Time series regression",
    color: "#10b981",
  },
];

export const covarianceFormula = {
  equation: "\u03A9\u1D63 = B\u03A9\u2091B' + \u03A9\u03B5",
  parts: [
    {
      symbol: "\u03A9\u1D63",
      name: "Asset Covariance",
      detail: "The full n\u00D7n covariance matrix of asset returns",
    },
    {
      symbol: "B\u03A9\u2091B'",
      name: "Factor Covariance",
      detail: "Systematic risk — the part explained by common factors. Has rank m << n.",
    },
    {
      symbol: "\u03A9\u03B5",
      name: "Idiosyncratic Covariance",
      detail: "Stock-specific risk. Often diagonal (strict model) or sparse (approximate model).",
    },
  ],
};

export const quizQuestions = [
  {
    id: "q1",
    question: "In the factor model r = \u03B1 + Bf + \u03B5, what does B represent?",
    options: [
      { text: "The vector of factor returns", correct: false },
      { text: "The loadings matrix connecting assets to factors", correct: true },
      { text: "The idiosyncratic returns", correct: false },
      { text: "The covariance matrix of returns", correct: false },
    ],
    explanation:
      "B is the n\u00D7m loadings matrix. Each row is a stock's 'fingerprint' of factor sensitivities; each column represents how all stocks are exposed to one factor.",
  },
  {
    id: "q2",
    question: "Why can't you simply use the empirical covariance matrix for portfolio optimization?",
    options: [
      { text: "It's too expensive to compute", correct: false },
      { text: "It's not symmetric", correct: false },
      { text: "When assets outnumber time periods, it's rank-deficient and not invertible", correct: true },
      { text: "It doesn't account for dividends", correct: false },
    ],
    explanation:
      "With n assets and T time periods, the empirical covariance has rank at most T. When n >> T (typical: 5000 stocks, 250 days), the matrix is singular. A factor model provides a well-structured, invertible approximation.",
  },
  {
    id: "q3",
    question: "What does 'rotational indeterminacy' of a factor model mean?",
    options: [
      { text: "The model only works for rotating portfolios", correct: false },
      { text: "You can transform B and f together without changing the model's predictions", correct: true },
      { text: "The factors must be orthogonal", correct: false },
      { text: "The loadings matrix must be square", correct: false },
    ],
    explanation:
      "For any invertible matrix C, replacing B with BC\u207B\u00B9 and f with Cf produces identical returns. This flexibility lets us choose convenient representations (uncorrelated factors, unit-norm loadings, etc.).",
  },
  {
    id: "q4",
    question: "If 'alpha orthogonal' grows with \u221An as you add assets, why doesn't everyone get infinite Sharpe?",
    options: [
      { text: "Trading costs eat all the profits", correct: false },
      { text: "The factor model must be wrong, or \u03B1\u22A5 per stock shrinks to zero", correct: true },
      { text: "You can't buy more than 100 stocks", correct: false },
      { text: "The risk-free rate adjusts upward", correct: false },
    ],
    explanation:
      "Since Sharpe ratios can't be infinite in practice, one of the assumptions must break down. Under the factor model assumption, this means \u03B1\u22A5 per stock vanishes as n grows. Real alpha is mostly 'spanned' \u2014 it comes with factor risk you can't diversify away.",
  },
  {
    id: "q5",
    question: "In performance attribution, what are 'factor exposures'?",
    options: [
      { text: "The returns of each factor", correct: false },
      { text: "The vector b = B'w — the portfolio's sensitivity to each factor", correct: true },
      { text: "The alpha of the portfolio", correct: false },
      { text: "The number of stocks in each sector", correct: false },
    ],
    explanation:
      "Factor exposures b = B'w aggregate each stock's loadings weighted by the portfolio holdings. They tell you 'how much does my portfolio bet on momentum, on tech, on the US market?' — the starting point for understanding risk and PnL.",
  },
  {
    id: "q6",
    question: "Which factor model type uses only return data as input?",
    options: [
      { text: "Characteristic model", correct: false },
      { text: "Macroeconomic model", correct: false },
      { text: "Statistical model", correct: true },
      { text: "Fundamental model", correct: false },
    ],
    explanation:
      "The statistical model extracts both loadings and factors from return data alone (e.g., via PCA). Characteristic models observe B, macro models observe f, but statistical models estimate everything from r alone.",
  },
];

export const takeaways = [
  {
    emoji: "📐",
    title: "Factor Models Decompose Returns",
    body: "r = \u03B1 + Bf + \u03B5 splits returns into common factor-driven and stock-specific components.",
  },
  {
    emoji: "🕸️",
    title: "Three Interpretations",
    body: "Graphical model (network), superposition (blended templates), and dot product (per-stock projection onto factor space).",
  },
  {
    emoji: "💎",
    title: "Alpha is Spanned or Orthogonal",
    body: "Spanned alpha looks like factor returns (risky). Orthogonal alpha is pure skill but vanishes per-stock as markets grow.",
  },
  {
    emoji: "🔄",
    title: "Models are Not Unique",
    body: "Rotations give different views; projections simplify; push-outs enrich. Total risk is invariant to rotations.",
  },
  {
    emoji: "🛠️",
    title: "Four Core Applications",
    body: "Performance attribution, risk forecasting and decomposition, portfolio construction, and alpha research.",
  },
  {
    emoji: "📋",
    title: "Three Estimation Approaches",
    body: "Characteristic (observe B), statistical (observe only r), macroeconomic (observe f). Each has distinct trade-offs.",
  },
];
