// Chapter 1 content — interactive walkthrough of "The Map and the Territory."
// The original book title and author have been removed per the project requirements.

export const chapterMeta = {
  title: "The Map and the Territory",
  tagline: "A beginner-friendly, interactive walkthrough of how trading really works.",
  chapter: "Chapter 1: The Map and the Territory",
};

export const bigQuestions = [
  {
    id: "q1",
    emoji: "📜",
    title: "What instruments do we trade?",
    beginnerTake:
      'Think of instruments as the "things" you can buy and sell. Not houses or paintings — those are too unique. We focus on standardized, easy-to-trade contracts.',
  },
  {
    id: "q2",
    emoji: "👥",
    title: "Who are the players?",
    beginnerTake:
      "Markets are a crowded room. Some people help others trade (sell side). Some trade for themselves or their clients (buy side). Knowing who's who matters.",
  },
  {
    id: "q3",
    emoji: "💰",
    title: "Where do excess returns come from?",
    beginnerTake:
      '"Excess returns" means beating a safe investment like a Treasury bill. The chapter explains the five main reasons this is possible at all.',
  },
];

export const securities = [
  {
    id: "equities",
    emoji: "🏢",
    name: "Equities & ETFs",
    oneLiner: "A slice of a company (or a basket of companies).",
    analogy:
      "Like buying a share of a pizza shop. If the shop sells more pizzas, your slice is worth more.",
    details:
      "Equities give you partial ownership of a company, and ETFs bundle many companies together. As an owner, you have a claim on future cash flows the company generates.",
    examples: ["AAPL stock", "SPY (S&P 500 ETF)", "VTI (Total Market ETF)"],
  },
  {
    id: "futures",
    emoji: "⛽",
    name: "Futures",
    oneLiner: "A promise to buy or sell something at a set price later.",
    analogy:
      "Imagine locking in the price of your morning coffee for a whole year. You win if coffee prices rise, lose if they fall.",
    details:
      "Futures are contracts that deliver a commodity or cash payment at a future date, at a price decided today. Widely used for commodities, currencies, and stock indices.",
    examples: ["Crude oil futures", "E-mini S&P 500 futures", "Gold futures"],
  },
  {
    id: "bonds",
    emoji: "🏦",
    name: "Bonds",
    oneLiner: "An IOU that can be passed around.",
    analogy:
      "You lend money to your cousin, who promises interest each month. A bond is that same deal, but you can sell the IOU to someone else.",
    details:
      "Bonds are transferable debt contracts. You lend money to a borrower in exchange for fixed future payments (interest + principal). The key feature: you can sell the claim to someone else.",
    examples: ["US Treasury 10-year", "Apple corporate bonds", "Municipal bonds"],
  },
  {
    id: "options",
    emoji: "🎟️",
    name: "Vanilla Options",
    oneLiner: "The right — but not obligation — to buy or sell.",
    analogy:
      "Like a movie ticket that lets you see a film if you want. You paid for the option, but you can also skip it.",
    details:
      'Options give you the right (but not the obligation) to buy or sell an underlying asset at a preset price. "Vanilla" means the terms are standardized. Used for hedging and speculation.',
    examples: ["Call options on TSLA", "Put options on SPY", "Index options"],
  },
  {
    id: "irs",
    emoji: "🔄",
    name: "Interest Rate Swaps",
    oneLiner: "Trading a fixed payment stream for a floating one.",
    analogy:
      "You have a fixed mortgage. Your friend has a variable one. You agree to swap monthly payments — without moving the houses.",
    details:
      "An IRS lets two parties exchange cash flow streams — typically, fixed payments for floating (interest-rate-dependent) payments. Huge market, used for managing interest rate exposure.",
    examples: ["USD SOFR swap", "EUR Euribor swap"],
  },
  {
    id: "cds",
    emoji: "🛡️",
    name: "Credit Default Swaps",
    oneLiner: "Insurance against a company going bust.",
    analogy:
      "Like buying fire insurance — but on a company. You pay regular premiums; you get paid out if the company defaults.",
    details:
      'CDS are contracts where the buyer gets compensated if a reference company defaults. The buyer pays recurring premiums. After the 2009 "Big Bang," contracts were standardized (coupons of 100bps or 500bps).',
    examples: ["Single-name corporate CDS", "CDX index CDS"],
  },
];

export const exchangeModes = [
  {
    id: "exchange",
    emoji: "🏛️",
    name: "Exchanges",
    subtitle: "Public, anonymous, ultra-fast",
    howItWorks:
      "Orders from buyers and sellers go into a 'limit-order book' (LOB). The exchange's matching engine pairs them by price and time priority. Both sides never meet.",
    pros: [
      "Very transparent pricing",
      "Low costs for liquid assets",
      "Anonymous counterparties",
    ],
    cons: [
      "Must be an exchange member to trade directly",
      "Some exchange-listed assets still trade thinly",
    ],
    examples: ["NYSE", "NASDAQ", "CME", "Eurex"],
    tradeFraction: "Majority of stocks, futures, listed options",
  },
  {
    id: "otc",
    emoji: "📞",
    name: "Over-the-Counter (OTC)",
    subtitle: "Broker-dealer negotiated trades",
    howItWorks:
      "Buyers and sellers transact through a broker-dealer, who's connected to other broker-dealers and helps match orders. Pricing is often quoted bilaterally.",
    pros: [
      "Handles custom, less-standardized products",
      "Some OTC markets (like FX) are incredibly liquid",
    ],
    cons: ["Less transparent than exchanges", "Relies on dealer networks"],
    examples: ["Corporate bonds", "FX (currencies)", "CDS", "Interest rate swaps"],
    tradeFraction: "Bonds, swaps, currencies",
  },
  {
    id: "darkpool",
    emoji: "🌑",
    name: "Dark Pools",
    subtitle: "Hidden liquidity",
    howItWorks:
      "A type of Alternative Trading System (ATS). Orders are hidden — neither side sees the other's intent. Trades are only revealed after execution.",
    pros: [
      "Large investors can hide intentions",
      'Reduces "market impact" when moving big blocks',
    ],
    cons: ["Less transparency", "You may not get the best available price"],
    examples: ["UBS ATS", "Credit Suisse Crossfinder", "MS Pool"],
    tradeFraction: "~16% of US equity volume (as of 2024)",
  },
];

export const participants = {
  sellSide: {
    label: "Sell Side",
    oneLiner: "They facilitate trading and earn fees for it.",
    color: "#f59e0b",
    actors: [
      {
        id: "dealers",
        emoji: "🤝",
        name: "Dealers",
        role: "Liquidity providers",
        description:
          "Dealers take the opposite side of your trade using their own inventory. They quote a bid price (what they buy at) and an ask price (what they sell at). The difference — the spread — is their profit.",
        analogy:
          "Like a currency exchange kiosk at the airport. They always quote a buy and sell price, and pocket the spread.",
        profit: "From the bid–ask spread and information in client order flow.",
      },
      {
        id: "brokers",
        emoji: "🧑‍💼",
        name: "Brokers",
        role: "Order routers",
        description:
          "Brokers don't take on inventory. They take your order, split it into pieces, and route them to the best venues. They give you access to markets and anonymize your trades.",
        analogy:
          "Like a travel agent booking flights on your behalf — they find the best route, you pay a commission.",
        profit:
          "Commissions, interest on cash balances, lending, payment for order flow.",
      },
      {
        id: "broker-dealers",
        emoji: "🎭",
        name: "Broker-Dealers",
        role: "Hybrid (dual traders)",
        description:
          "They do both — trade for clients AND for themselves. This creates a conflict of interest (e.g. the temptation to front-run client orders), which regulation aims to police.",
        analogy:
          "Like a restaurant that owns both the dining room and the supply chain. Convenient, but watch for self-dealing.",
        profit: "Both commissions and trading profits.",
      },
    ],
  },
  buySide: {
    label: "Buy Side",
    oneLiner: "They trade for their own benefit or on behalf of clients.",
    color: "#3b82f6",
    actors: [
      {
        id: "indexers",
        emoji: "📈",
        name: "Indexers",
        role: "Passive investors",
        description:
          "They build portfolios that track an index — like the S&P 500 — holding roughly the same stocks in the same proportions. They rebalance quarterly or semiannually.",
        analogy:
          "Like a chef who always cooks the same recipe exactly as written. No creativity, but reliable.",
        examples: "BlackRock, Vanguard, State Street",
      },
      {
        id: "hedgers",
        emoji: "🛡️",
        name: "Hedgers",
        role: "Risk reducers",
        description:
          "Not trying to make money from markets — trying to protect existing business. Airlines hedge fuel, importers hedge currencies, farmers hedge crop prices.",
        analogy:
          "Like buying umbrella insurance. You hope you never use it, but you sleep better.",
        examples: "Airlines, manufacturers, commodity-dependent businesses",
      },
      {
        id: "institutional-active",
        emoji: "🏛️",
        name: "Institutional Active Managers",
        role: "Benchmark beaters",
        description:
          "They try to beat an index. Their 'tracking error' measures how far they stray from it. Unfortunately, 91% trail the S&P 500 over 15 years (as of Jan 2024).",
        analogy:
          "Like a chef who starts with a recipe, then tweaks it. Sometimes better, often not.",
        examples: "Fidelity active funds, T. Rowe Price",
      },
      {
        id: "asset-allocators",
        emoji: "🧩",
        name: "Asset Allocators",
        role: "Multi-asset portfolio managers",
        description:
          "They decide how much to put in stocks vs bonds vs commodities. Within each bucket, they usually just track a benchmark. They also invest in 'alternatives' — PE, VC, hedge funds, real estate.",
        analogy:
          "Like a nutritionist: they don't cook, but they decide what goes on your plate.",
        examples: "University endowments, pension funds, sovereign wealth funds",
      },
      {
        id: "informed-traders",
        emoji: "🧠",
        name: "Informed Traders",
        role: "The alpha hunters",
        description:
          "Hedge funds and principal trading firms. They pursue absolute returns — not tied to a benchmark — using data, technology, and analytics. They do price discovery and provide liquidity ahead of predictable flows.",
        analogy:
          "Like a treasure hunter with the best maps and tools. They don't follow anyone — they find value first.",
        examples: "Citadel, Renaissance Technologies, Jane Street",
      },
      {
        id: "retail",
        emoji: "🧍",
        name: "Retail Investors",
        role: "Individual traders",
        description:
          "You and me. About 20% of total volume (up from 10% in 2011). Studies consistently show retail traders lose money on average — which is why dealers pay brokers to route retail orders to them (PFOF).",
        analogy:
          "Like amateur poker players at a casino — the house (and the pros) usually win.",
        examples: "Robinhood users, E*TRADE users",
      },
    ],
  },
};

export const excessReturnSources = [
  {
    id: "risk",
    emoji: "⚡",
    name: "Risk",
    color: "#ef4444",
    shortDesc:
      "You might know a stock will rise — but can you stomach the volatility?",
    longDesc:
      "Even with good predictions, uncertainty around outcomes limits how much risk you want to take. Example: you expect 8% from the market next year vs 2% cash, but a 20% standard deviation of returns makes going all-in too risky. Getting compensated for bearing risk is a legitimate source of excess return.",
    example:
      "Holding stocks instead of Treasury bills earns a premium — not because stocks are 'better', but because they're scarier.",
  },
  {
    id: "liquidity",
    emoji: "💧",
    name: "Liquidity",
    color: "#06b6d4",
    shortDesc: "Being right doesn't matter if you can't trade on it.",
    longDesc:
      "A famous 2000 example: Palm IPO'd via 3Com, which retained 95% of shares. The math said 3Com had $-22B in value (absurd), but shorting Palm was impossible — shares were too scarce or borrow rates were astronomical. Prediction was correct; execution was impossible.",
    example:
      "The 3Com / Palm spin-off: anyone could see the mispricing, but nobody could trade it.",
  },
  {
    id: "funding",
    emoji: "💸",
    name: "Funding constraints",
    color: "#8b5cf6",
    shortDesc: "You need cash to act on your ideas. In crashes, cash is scarce.",
    longDesc:
      "When markets fall, margin calls hit, capital dries up. You see a great opportunity but can't act — you might face further drawdowns and need a buffer. This is why distressed assets recover slowly: the people who could buy don't have the money.",
    example:
      "Deleveraging spirals in 2008 — the fire sale goes on longer because everyone is out of capital.",
  },
  {
    id: "flow",
    emoji: "🔁",
    name: "Predictable flows",
    color: "#10b981",
    shortDesc: "Some people HAVE to trade. Others can profit by being there first.",
    longDesc:
      "Index funds must buy new index additions on effective dates — predictable demand. Example: TSLA joined the NASDAQ 100 on July 15, 2013. Announced July 10. Traders bought in between and sold into the closing auction when ETFs had to buy. Small, recurring edge.",
    example:
      "Index reconstitution — ETFs have to rebalance, informed traders front-run it.",
  },
  {
    id: "info",
    emoji: "🔍",
    name: "Informational advantage",
    color: "#f59e0b",
    shortDesc: "Simply knowing something others don't.",
    longDesc:
      '"Statistical arbitrage": building predictive models from public data that competitors don\'t have. Not insider trading — just better analytics, faster data pipelines, or smarter models.',
    example:
      "A hedge fund builds a satellite imagery pipeline to count cars in retailer parking lots — 2 weeks before earnings.",
  },
];

export const investmentProcess = {
  stages: [
    {
      id: "data",
      emoji: "🗃️",
      name: "Data",
      when: "Inputs",
      description: "Raw material for every quant strategy.",
      components: [
        {
          name: "Prices & Volumes",
          description:
            "What people traded, when, and how much. Minutely, daily, or order-by-order.",
        },
        {
          name: "Characteristics",
          description:
            'Descriptors of a security at a point in time — like "free cash flow / market cap."',
        },
        {
          name: "Time Series",
          description: "Macro data: CPI, VIX, 10-year Treasury yield, Fed Funds rate.",
        },
        {
          name: "Unstructured Data",
          description:
            'Earnings call transcripts, news articles, satellite images, audio — the "dark matter" of finance.',
        },
      ],
    },
    {
      id: "before",
      emoji: "📐",
      name: "Before the Trade",
      when: "Preparation",
      description: "Build the pieces used in portfolio construction.",
      components: [
        {
          name: "Risk Models",
          description:
            'Estimate portfolio volatility. "Risk" here means: how much can my P&L swing?',
        },
        {
          name: "Expected Returns",
          description:
            "Models that predict future returns. Modern shops may have thousands or millions of them combined.",
        },
        {
          name: "Transaction Costs",
          description:
            "Trading isn't free. Costs determine which predictions can actually become profitable.",
        },
      ],
    },
    {
      id: "during",
      emoji: "⚙️",
      name: "During the Trade",
      when: "Execution",
      description: "Portfolio construction — where strategies become positions.",
      components: [
        {
          name: "Risk Constraints",
          description:
            "Hard limits or penalties that shape the final portfolio (e.g. max gross exposure).",
        },
        {
          name: "Signal Aggregation",
          description:
            "Combining thousands of predictions into one coherent buy/sell decision.",
        },
        {
          name: "Hedging",
          description:
            "Neutralizing unwanted systematic exposures (e.g. market beta, sector risk).",
        },
      ],
    },
    {
      id: "after",
      emoji: "🔬",
      name: "After the Trade",
      when: "Review",
      description: "Learn from the realized P&L to improve tomorrow.",
      components: [
        {
          name: "Performance Attribution",
          description:
            "Trace P&L to its sources. What worked? What failed? Can you repeat it?",
        },
        {
          name: "Volatility Allocation & Leverage",
          description:
            "How much risk to take next period — and whether to lever up the portfolio.",
        },
      ],
    },
  ],
};

export const quizQuestions = [
  {
    id: "quiz1",
    question:
      "Which of these is NOT a typical 'standardized and liquid' contract in the chapter?",
    options: [
      { text: "A single-family house", correct: true },
      { text: "A 10-year US Treasury bond", correct: false },
      { text: "An S&P 500 ETF", correct: false },
      { text: "A crude oil futures contract", correct: false },
    ],
    explanation:
      "Houses are deeply un-standardized: every one has unique location, size, and condition. That's why housing is illiquid compared to financial instruments.",
  },
  {
    id: "quiz2",
    question:
      "A dealer trades with you. What is their primary source of profit?",
    options: [
      { text: "The bid-ask spread and order flow information", correct: true },
      { text: "Commissions charged to you", correct: false },
      { text: "Payment for order flow from retail brokers", correct: false },
      { text: "Custodial fees", correct: false },
    ],
    explanation:
      "Dealers profit from the difference between the price they buy at (bid) and sell at (ask), plus information they glean from seeing client order flow. Commissions are a broker thing.",
  },
  {
    id: "quiz3",
    question:
      "Which of the following is NOT a major source of excess returns described in the chapter?",
    options: [
      { text: "Having more followers on social media", correct: true },
      { text: "Being compensated for bearing risk", correct: false },
      {
        text: "Taking advantage of predictable flows like index rebalancing",
        correct: false,
      },
      {
        text: "An informational advantage like better data pipelines",
        correct: false,
      },
    ],
    explanation:
      "The five sources are: risk, liquidity, funding, predictable flows, and informational advantage. Social media is not on the list.",
  },
  {
    id: "quiz4",
    question:
      'In the investment process, where does "performance attribution" belong?',
    options: [
      { text: "After the Trade", correct: true },
      { text: "Before the Trade", correct: false },
      { text: "During the Trade", correct: false },
      { text: "In the Data layer", correct: false },
    ],
    explanation:
      'Performance attribution is an "ex post" (after-the-fact) analysis that breaks down realized P&L to learn from it. Before, During, and After are the three time stages around each trade.',
  },
  {
    id: "quiz5",
    question: 'What is a "dark pool"?',
    options: [
      {
        text: "An alternative trading venue that hides order details until after execution",
        correct: true,
      },
      { text: "An illegal market for trading insider information", correct: false },
      { text: "A type of futures contract on commodities", correct: false },
      { text: "A hedge fund that doesn't disclose holdings", correct: false },
    ],
    explanation:
      "Dark pools are a type of Alternative Trading System (ATS) that hides the limit order book. About 16% of US stock volume trades in dark pools — useful for big institutional orders.",
  },
];
