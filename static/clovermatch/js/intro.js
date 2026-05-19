import { LEVELS } from "./data.js";
import { $, show } from "./dom.js";
import { game } from "./state.js";
import { startCampaign } from "./session.js";
import { openTutorial } from "./tutorial.js";

export function renderIntroLevels() {
  const box = $("introLevelSelect");
  box.innerHTML = LEVELS.map((lv, i) => {
    const locked = i > game.progress.unlocked - 1;
    const state = locked
      ? "Gesperrt"
      : i === game.progress.unlocked - 1 && !game.campaignComplete
        ? "Aktuell"
        : "Geschafft";
    return `<button type="button" class="level-pick${locked ? "" : " active"}" data-level="${i}" ${locked ? "disabled" : ""}>
      <span class="num">${lv.id}</span>
      <span><b>${lv.name}</b><small>${lv.hint}</small></span>
      <span class="state">${state}</span>
    </button>`;
  }).join("");
  box.querySelectorAll(".level-pick:not([disabled])").forEach((btn) => {
    btn.addEventListener("click", () => startCampaign(Number(btn.dataset.level)));
  });
}

export function beginPlay() {
  if (!game.progress.tutorialDone) openTutorial(true);
  else startCampaign(Math.min(game.progress.unlocked, LEVELS.length) - 1);
}

export function toggleLevelSelect() {
  const box = $("introLevelSelect");
  const open = box.hidden;
  if (open) renderIntroLevels();
  box.hidden = !open;
}

export function openLevelSelectFromEnd() {
  show("intro");
  renderIntroLevels();
  $("introLevelSelect").hidden = false;
}
