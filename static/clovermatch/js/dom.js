/** DOM helpers and HUD updates. */
import { LABELS, LEAF_IDS } from "./config.js";
import { game, correctCount, getLevel, strongestLeaf } from "./state.js";
import { formatGoalLabel, goalProgress } from "./goals.js";

export function $(id) {
  return document.getElementById(id);
}

export function escapeHtml(str) {
  return String(str).replace(
    /[&<>"]/g,
    (s) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[s]
  );
}

export function show(screenId) {
  document.querySelectorAll(".screen").forEach((s) => {
    s.classList.remove("active");
    s.setAttribute("aria-hidden", "true");
  });
  const screen = $(screenId);
  screen.classList.add("active");
  screen.setAttribute("aria-hidden", "false");
  window.scrollTo(0, 0);
}

export function setCoach(msg) {
  $("coachText").innerHTML = "<strong>Natalia:</strong><br>" + escapeHtml(msg);
}

export function toast(msg, bad) {
  const t = $("toast");
  t.textContent = msg;
  t.style.color = bad ? "#f0b39b" : "#f2d98d";
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 900);
}

export function updateStats() {
  const lv = getLevel();
  $("clarity").textContent = game.clarity + "%";
  $("score").textContent = game.score;
  $("totalScore").textContent = game.campaignScore;
  $("time").textContent = game.seconds;
  $("streak").textContent = game.streak;
  $("goalLabel").textContent = formatGoalLabel();
  const gp = goalProgress();
  const pct = gp.dual
    ? gp.streakOk
      ? 100
      : Math.min(100, (game.score / lv.goal.score) * 100)
    : Math.min(100, (gp.cur / gp.max) * 100);
  $("goalBar").style.width = pct + "%";
  const badge = $("comboBadge");
  badge.textContent = "Serie: " + game.streak + (game.streak >= 3 ? " · Bonus aktiv" : "");
  badge.classList.toggle("hot", game.streak >= 3);
  ["color", "form", "impact", "life"].forEach((k) => {
    const fill = Math.min(100, game.counts[k] * 18);
    $(LEAF_IDS[k]).style.setProperty("--fill", fill);
    $("cnt-" + k).textContent = game.counts[k] + " Signale";
  });
  const analysis = Math.min(100, Math.round(correctCount() * 8));
  const recommendation = Math.min(
    100,
    Math.round(game.clarity * 0.72 + game.counts.letgo * 7 + game.streak * 1.5)
  );
  $("barA").style.width = analysis + "%";
  $("barB").style.width = recommendation + "%";
  $("aPct").textContent = analysis + "%";
  $("bPct").textContent = recommendation + "%";
  const balanced = [
    game.counts.color,
    game.counts.form,
    game.counts.impact,
    game.counts.life,
  ].filter((v) => v > 0).length;
  $("balanceTxt").textContent = balanced + "/4";
  $("avoidTxt").textContent = game.counts.letgo;
  const best = strongestLeaf();
  $("strongTxt").textContent = best ? LABELS[best] : "-";
}
