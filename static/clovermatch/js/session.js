import { $, setCoach, show, updateStats } from "./dom.js";
import { levelCoachIntro } from "./learning.js";
import { completeLevel, failLevel } from "./evaluation.js";
import { nextToken } from "./gameplay.js";
import { goalMet } from "./goals.js";
import { game, getLevel, resetRoundState } from "./state.js";

export function startCampaign(idx) {
  game.levelIndex = idx;
  game.campaignScore = 0;
  game.campaignComplete = false;
  $("introLevelSelect").hidden = true;
  startLevel();
}

export function startLevel() {
  resetRoundState();
  const lv = getLevel();
  game.seconds = lv.duration;
  game.running = true;
  show("game");
  $("levelLabel").textContent = lv.id + " · " + lv.name;
  $("levelHint").textContent = lv.hint;
  setCoach(levelCoachIntro(game.levelIndex, lv.name, lv.hint));
  updateStats();
  nextToken();
  clearInterval(game.timer);
  game.timer = setInterval(() => {
    game.seconds--;
    updateStats();
    if (game.seconds <= 0) {
      if (goalMet()) completeLevel();
      else failLevel("Die Zeit ist um – versuchen Sie es noch einmal.");
    }
  }, 1000);
}

export function restartCampaign() {
  startCampaign(0);
}

export function continueFromEvaluation() {
  const st = game.lastEndState;
  if (st.won && !st.allDone) {
    game.levelIndex++;
    startLevel();
    return;
  }
  if (st.won && st.allDone) {
    restartCampaign();
    return;
  }
  startLevel();
}
