import * as Ch1Data from "./data/chapter1";
import * as Ch2Data from "./data/chapter2";

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
];
