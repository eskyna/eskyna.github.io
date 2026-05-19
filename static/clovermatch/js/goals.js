import { game, getLevel, leafMin } from "./state.js";

export function goalProgress() {
  const g = getLevel().goal;
  if (g.type === "correct") return { cur: game.correctTotal, max: g.target };
  if (g.type === "clarity") return { cur: game.clarity, max: g.target };
  if (g.type === "balance") return { cur: leafMin(), max: g.target };
  if (g.type === "letgo") return { cur: game.counts.letgo, max: g.target };
  if (g.type === "mastery") {
    const cur = Math.max(game.streak, Math.min(g.score, game.score));
    const max = game.streak >= g.target ? g.target : g.score;
    return {
      cur,
      max,
      dual: true,
      streakOk: game.streak >= g.target,
      scoreOk: game.score >= g.score,
    };
  }
  return { cur: 0, max: 1 };
}

export function goalMet() {
  const g = getLevel().goal;
  if (g.type === "correct") return game.correctTotal >= g.target;
  if (g.type === "clarity") return game.clarity >= g.target;
  if (g.type === "balance") return leafMin() >= g.target;
  if (g.type === "letgo") return game.counts.letgo >= g.target;
  if (g.type === "mastery") return game.streak >= g.target || game.score >= g.score;
  return false;
}

export function formatGoalLabel() {
  const g = getLevel().goal;
  const p = goalProgress();
  if (g.type === "correct") return p.cur + " / " + p.max + " richtig";
  if (g.type === "clarity") return p.cur + " % / " + p.max + " %";
  if (g.type === "balance") return p.cur + " / " + p.max + " pro Blatt";
  if (g.type === "letgo") return p.cur + " / " + p.max + " gefiltert";
  if (g.type === "mastery") {
    if (p.streakOk) return "Serie " + game.streak + " ✓";
    return game.score + " / " + g.score + " Pkt.";
  }
  return "";
}
