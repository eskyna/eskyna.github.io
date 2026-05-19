import { TUTORIAL } from "./data.js";
import { $ } from "./dom.js";
import { saveProgress } from "./storage.js";
import { game } from "./state.js";
import { startCampaign } from "./session.js";

const overlay = () => $("tutorialOverlay");

export function openTutorial(fromIntro) {
  game.tutorialStep = 0;
  renderTutorialStep();
  overlay().classList.add("open");
  overlay().dataset.fromIntro = fromIntro ? "1" : "0";
}

export function closeTutorial() {
  overlay().classList.remove("open");
  game.progress.tutorialDone = true;
  saveProgress(game.progress);
}

export function renderTutorialStep() {
  const step = TUTORIAL[game.tutorialStep];
  $("tutorialTitle").textContent = step.title;
  $("tutorialBody").innerHTML = step.body;
  $("tutorialVisual").innerHTML = step.visual;
  document.querySelectorAll(".tutorial-steps span").forEach((el, i) => {
    el.classList.toggle("on", i <= game.tutorialStep);
  });
  $("tutorialBack").style.visibility = game.tutorialStep === 0 ? "hidden" : "visible";
  $("tutorialNext").textContent =
    game.tutorialStep === TUTORIAL.length - 1 ? "Level 1 starten" : "Weiter";
}

export function tutorialBack() {
  if (game.tutorialStep > 0) {
    game.tutorialStep--;
    renderTutorialStep();
  }
}

export function tutorialNext() {
  if (game.tutorialStep < TUTORIAL.length - 1) {
    game.tutorialStep++;
    renderTutorialStep();
  } else {
    closeTutorial();
    startCampaign(0);
  }
}

export function tutorialSkip() {
  closeTutorial();
  if (overlay().dataset.fromIntro === "1") startCampaign(0);
}

export function isTutorialOpen() {
  return overlay().classList.contains("open");
}
