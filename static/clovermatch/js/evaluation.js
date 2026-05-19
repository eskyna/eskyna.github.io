import { LEVELS } from "./data.js";
import { $, show } from "./dom.js";
import { buildEvaluationMessage, LEVEL_LEARNING } from "./learning.js";
import { saveProgress } from "./storage.js";
import { game, getLevel } from "./state.js";

export function updateEndActions() {
  const btn = $("btnEndPrimary");
  const st = game.lastEndState;
  if (st.won && st.allDone) {
    btn.textContent = "Nochmal alle Level";
  } else if (st.won) {
    btn.textContent = "Level " + (game.levelIndex + 2) + " starten";
  } else {
    btn.textContent = "Nochmal versuchen";
  }
}

export function showLevelEvaluation(won, opts = {}) {
  game.running = false;
  clearInterval(game.timer);
  const lv = getLevel();
  const allDone = won && game.levelIndex >= LEVELS.length - 1;
  if (won) {
    game.progress.bestClarity = Math.max(game.progress.bestClarity, game.clarity);
    saveProgress(game.progress);
    if (allDone) game.campaignComplete = true;
  }
  game.lastEndState = {
    won,
    allDone,
    bonus: opts.bonus || 0,
    failMsg: opts.failMsg || "",
    perfect: !!opts.perfect,
  };
  $("endHeadline").textContent = allDone
    ? "Alle Level gemeistert"
    : won
      ? "Level " + lv.id + " geschafft"
      : "Level " + lv.id + " nicht geschafft";
  $("finalScore").textContent = game.clarity + "%";
  $("endLevelTitle").textContent = "Level " + lv.id + " · " + lv.name;
  $("risk").textContent =
    game.counts.letgo >= 4 && game.mistakes < 4 ? "niedrig" : game.clarity > 55 ? "mittel" : "hoch";
  $("combo").textContent = game.clarity > 75 ? "stark" : game.clarity > 45 ? "wachsend" : "Start";
  const diamondOk =
    game.clarity > 70 &&
    [game.counts.color, game.counts.form, game.counts.impact, game.counts.life].filter((v) => v > 0)
      .length >= 3;
  $("diamondState").textContent = diamondOk ? "verbunden" : "offen";
  $("sumColor").textContent = game.counts.color;
  $("sumForm").textContent = game.counts.form;
  $("sumImpact").textContent = game.counts.impact;
  $("sumLife").textContent = game.counts.life;
  $("endTotalScore").textContent = game.campaignScore;
  $("endBestStreak").textContent = game.bestStreak;
  const learn = LEVEL_LEARNING[game.levelIndex];
  const learnEl = $("endLearn");
  if (learnEl && learn) learnEl.textContent = "Geübt: " + learn.practice;
  $("endMessage").textContent = buildEvaluationMessage(
    game.levelIndex,
    won,
    {
      clarity: game.clarity,
      counts: game.counts,
      campaignScore: game.campaignScore,
      mistakes: game.mistakes,
    },
    opts
  );
  updateEndActions();
  show("end");
}

export function completeLevel() {
  const lv = getLevel();
  const timeBonus = Math.round(game.seconds * 4);
  const perfect = game.mistakes === 0;
  const bonus = lv.bonus + timeBonus + (perfect ? 100 : 0);
  game.campaignScore += bonus;
  if (game.levelIndex + 1 >= game.progress.unlocked) game.progress.unlocked = game.levelIndex + 2;
  showLevelEvaluation(true, { bonus, perfect });
}

export function failLevel(msg) {
  showLevelEvaluation(false, { failMsg: msg });
}
