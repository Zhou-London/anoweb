import * as Ch1Data from "./data/chapter1";
import * as Ch2Data from "./data/chapter2";
import * as Ch3Data from "./ch3/data";
import * as Ch4Data from "./ch4/data";

import Ch1Intro from "./components/Intro";
import Ch1Questions from "./components/Questions";
import Ch1Securities from "./components/Securities";
import Ch1Exchanges from "./components/Exchanges";
import Ch1Participants from "./components/Participants";
import Ch1ExcessReturns from "./components/ExcessReturns";
import Ch1Process from "./components/Process";
import Ch1Quiz from "./components/Quiz";
import Ch1Summary from "./components/Summary";

import Ch2Intro from "./components/ch2/Intro";
import Ch2Questions from "./components/ch2/Questions";
import Ch2Returns from "./components/ch2/Returns";
import Ch2StylizedFacts from "./components/ch2/StylizedFacts";
import Ch2Garch from "./components/ch2/Garch";
import Ch2RealizedVol from "./components/ch2/RealizedVol";
import Ch2Ewma from "./components/ch2/Ewma";
import Ch2Quiz from "./components/Quiz";
import Ch2Summary from "./components/ch2/Summary";

import Ch3Intro from "./ch3/Intro";
import Ch3Questions from "./ch3/Questions";
import Ch3FactorModel from "./ch3/FactorModel";
import Ch3Interpretations from "./ch3/Interpretations";
import Ch3Alpha from "./ch3/Alpha";
import Ch3Transformations from "./ch3/Transformations";
import Ch3Applications from "./ch3/Applications";
import Ch3FactorTypes from "./ch3/FactorTypes";
import Ch3Quiz from "./ch3/Quiz";
import Ch3Summary from "./ch3/Summary";

import Ch4Intro from "./ch4/Intro";
import Ch4Questions from "./ch4/Questions";
import Ch4BestPractices from "./ch4/BestPractices";
import Ch4LeakageGame from "./ch4/LeakageGame";
import Ch4Backtesting from "./ch4/Backtesting";
import Ch4WalkForward from "./ch4/WalkForward";
import Ch4CoinFlipGame from "./ch4/CoinFlipGame";
import Ch4Rademacher from "./ch4/Rademacher";
import Ch4HaircutCalc from "./ch4/HaircutCalc";
import Ch4Quiz from "./ch4/Quiz";
import Ch4Summary from "./ch4/Summary";

import type { ComponentType } from "react";

export type Section = {
  id: string;
  label: string;
  emoji: string;
  Component: ComponentType<{ data: any; onStart?: () => void }>;
};

export type ChapterDef = {
  id: string;
  label: string;
  shortLabel: string;
  title: string;
  data: any;
  sections: Section[];
};

export const chapters: ChapterDef[] = [
  {
    id: "ch1",
    label: "Chapter 1",
    shortLabel: "Ch 1",
    title: "The Map and the Territory",
    data: Ch1Data,
    sections: [
      { id: "intro", label: "Welcome", emoji: "👋", Component: Ch1Intro },
      { id: "questions", label: "The 3 Questions", emoji: "🎯", Component: Ch1Questions },
      { id: "securities", label: "What You Trade", emoji: "📜", Component: Ch1Securities },
      { id: "exchanges", label: "Where You Trade", emoji: "🏛️", Component: Ch1Exchanges },
      { id: "participants", label: "Who's Trading", emoji: "👥", Component: Ch1Participants },
      { id: "returns", label: "Where Profits Come From", emoji: "💰", Component: Ch1ExcessReturns },
      { id: "process", label: "The Investment Process", emoji: "⚙️", Component: Ch1Process },
      { id: "quiz", label: "Check Your Understanding", emoji: "✅", Component: Ch1Quiz },
      { id: "summary", label: "Takeaways", emoji: "🎓", Component: Ch1Summary },
    ],
  },
  {
    id: "ch2",
    label: "Chapter 2",
    shortLabel: "Ch 2",
    title: "Returns — Properties and Models",
    data: Ch2Data,
    sections: [
      { id: "intro", label: "Welcome", emoji: "👋", Component: Ch2Intro },
      { id: "questions", label: "The 6 Questions", emoji: "🎯", Component: Ch2Questions },
      { id: "returns", label: "What is a Return?", emoji: "📐", Component: Ch2Returns },
      { id: "stylized", label: "4 Stylized Facts", emoji: "🔍", Component: Ch2StylizedFacts },
      { id: "garch", label: "GARCH Model", emoji: "🌪️", Component: Ch2Garch },
      { id: "rv", label: "Realized Volatility", emoji: "⏱️", Component: Ch2RealizedVol },
      { id: "ewma", label: "EWMA & State-Space", emoji: "🔗", Component: Ch2Ewma },
      { id: "quiz", label: "Check Your Understanding", emoji: "✅", Component: Ch2Quiz },
      { id: "summary", label: "Takeaways", emoji: "🎓", Component: Ch2Summary },
    ],
  },
  {
    id: "ch3",
    label: "Chapter 3",
    shortLabel: "Ch 3",
    title: "Linear Models of Returns",
    data: Ch3Data,
    sections: [
      { id: "intro", label: "Welcome", emoji: "👋", Component: Ch3Intro },
      { id: "questions", label: "The 3 Questions", emoji: "🎯", Component: Ch3Questions },
      { id: "factormodel", label: "The Factor Model", emoji: "📐", Component: Ch3FactorModel },
      { id: "interpretations", label: "Three Perspectives", emoji: "🔍", Component: Ch3Interpretations },
      { id: "alpha", label: "Alpha Decomposition", emoji: "💎", Component: Ch3Alpha },
      { id: "transformations", label: "Transformations", emoji: "🔄", Component: Ch3Transformations },
      { id: "applications", label: "Applications", emoji: "🛠️", Component: Ch3Applications },
      { id: "factortypes", label: "Model Types", emoji: "📋", Component: Ch3FactorTypes },
      { id: "quiz", label: "Chapter Quiz", emoji: "✅", Component: Ch3Quiz },
      { id: "summary", label: "Takeaways", emoji: "🎓", Component: Ch3Summary },
    ],
  },
  {
    id: "ch4",
    label: "Chapter 4",
    shortLabel: "Ch 4",
    title: "Evaluating Excess Returns",
    data: Ch4Data,
    sections: [
      { id: "intro", label: "Welcome", emoji: "👋", Component: Ch4Intro },
      { id: "questions", label: "The 3 Questions", emoji: "🎯", Component: Ch4Questions },
      { id: "bestpractices", label: "Best Practices", emoji: "📋", Component: Ch4BestPractices },
      { id: "leakagegame", label: "Spot the Leakage", emoji: "🎮", Component: Ch4LeakageGame },
      { id: "backtesting", label: "Cross-Validation", emoji: "🔄", Component: Ch4Backtesting },
      { id: "walkforward", label: "Walk-Forward", emoji: "⏩", Component: Ch4WalkForward },
      { id: "coinflip", label: "Multiple Testing Trap", emoji: "🎲", Component: Ch4CoinFlipGame },
      { id: "rademacher", label: "Rademacher Anti-Serum", emoji: "🛡️", Component: Ch4Rademacher },
      { id: "haircut", label: "Haircut Calculator", emoji: "🧮", Component: Ch4HaircutCalc },
      { id: "quiz", label: "Chapter Quiz", emoji: "✅", Component: Ch4Quiz },
      { id: "summary", label: "Takeaways", emoji: "🎓", Component: Ch4Summary },
    ],
  },
];
