import { LEVELS } from "./data.js";
import { LEAF_IDS } from "./config.js";
import { loadProgress } from "./storage.js";

/** Mutable runtime state for the active session. */
export const game = {
  progress: loadProgress(),
  levelIndex: 0,
  running: false,
  score: 0,
  campaignScore: 0,
  clarity: 0,
  streak: 0,
  bestStreak: 0,
  seconds: 60,
  current: null,
  timer: null,
  counts: { color: 0, form: 0, impact: 0, life: 0, letgo: 0 },
  correctTotal: 0,
  mistakes: 0,
  tutorialStep: 0,
  campaignComplete: false,
  lastEndState: { won: false, allDone: false, bonus: 0, failMsg: "", perfect: false },
};

export function getLevel() {
  return LEVELS[game.levelIndex];
}

export function resetRoundState() {
  game.score = 0;
  game.clarity = 0;
  game.streak = 0;
  game.mistakes = 0;
  game.correctTotal = 0;
  game.counts = { color: 0, form: 0, impact: 0, life: 0, letgo: 0 };
  ["color", "form", "impact", "life"].forEach((k) => {
    document.getElementById(LEAF_IDS[k]).style.setProperty("--fill", 0);
    document.getElementById("cnt-" + k).textContent = "0 Signale";
  });
}

export function correctCount() {
  return (
    game.counts.color + game.counts.form + game.counts.impact + game.counts.life + game.counts.letgo
  );
}

export function leafMin() {
  return Math.min(game.counts.color, game.counts.form, game.counts.impact, game.counts.life);
}

export function strongestLeaf() {
  const vals = {
    color: game.counts.color,
    form: game.counts.form,
    impact: game.counts.impact,
    life: game.counts.life,
  };
  const entries = Object.entries(vals).sort((a, b) => b[1] - a[1]);
  return entries[0][1] > 0 ? entries[0][0] : "";
}
