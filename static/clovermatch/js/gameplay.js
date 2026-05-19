import { LABELS } from "./config.js";
import { ITEMS } from "./data.js";
import { iconForItem } from "./icons.js";
import { $, setCoach, toast, updateStats } from "./dom.js";
import { animateToken, flash, sparkles } from "./effects.js";
import { goalMet } from "./goals.js";
import { game, getLevel } from "./state.js";

export function pickItem() {
  const lv = getLevel();
  const hazards = ITEMS.filter((i) => i.hazard);
  const safe = ITEMS.filter((i) => !i.hazard);
  if (Math.random() < lv.hazard && hazards.length) {
    let idx;
    do {
      idx = Math.floor(Math.random() * hazards.length);
    } while (hazards.length > 1 && hazards[idx] === game.current);
    return hazards[idx];
  }
  let idx;
  do {
    idx = Math.floor(Math.random() * safe.length);
  } while (safe.length > 1 && safe[idx] === game.current);
  return safe[idx];
}

export function nextToken() {
  if (!game.running) return;
  game.current = pickItem();
  const token = $("token");
  token.className = "token" + (game.current.hazard ? " hazard" : "");
  token.innerHTML = `<span class="facet">${game.current.facet}</span><div class="icon">${iconForItem(game.current, 44)}</div><b>${game.current.text}</b><small>${game.current.sub}</small>`;
  token.style.opacity = "1";
}

function gainFor(type) {
  if (type === "letgo") return 6;
  const filled = [game.counts.color, game.counts.form, game.counts.impact, game.counts.life].filter(
    (v) => v > 0
  ).length;
  return filled >= 3 ? 8 : 7;
}

function balanceBonus() {
  const vals = [game.counts.color, game.counts.form, game.counts.impact, game.counts.life];
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  return min > 0 && max - min <= 1 ? 45 : 0;
}

export function answer(type, onGoalMet) {
  if (!game.running || !game.current) return;
  const right = type === game.current.type;
  if (right) {
    const base = game.current.type === "letgo" ? 130 : 110;
    const mult = 1 + Math.min(game.streak, 6) * 0.08;
    const gained = Math.round((base + balanceBonus()) * mult);
    game.score += gained;
    game.campaignScore += gained;
    game.clarity = Math.min(100, game.clarity + gainFor(game.current.type));
    game.streak++;
    game.bestStreak = Math.max(game.bestStreak, game.streak);
    game.counts[game.current.type]++;
    game.correctTotal++;
    toast("Richtig: " + LABELS[game.current.type] + " (+" + gained + ")", false);
    animateToken(game.current.type);
    flash(game.current.type, true);
    sparkles();
    setCoach(game.current.coach);
    updateStats();
    if (goalMet()) {
      onGoalMet();
      return;
    }
  } else {
    game.score = Math.max(0, game.score - 45);
    game.clarity = Math.max(0, game.clarity - 7);
    game.streak = 0;
    game.mistakes++;
    toast("Gehört zu " + LABELS[game.current.type], true);
    flash(type, false);
    setCoach("Dieses Signal gehört zu " + LABELS[game.current.type] + ".");
  }
  updateStats();
  setTimeout(nextToken, 340);
}
