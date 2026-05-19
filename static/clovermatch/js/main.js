/**
 * ESKYNA Stil-Kleeblatt — entry point: wires UI events to game modules.
 */
import { answer } from "./gameplay.js";
import {
  renderIntroLevels,
  beginPlay,
  toggleLevelSelect,
  openLevelSelectFromEnd,
} from "./intro.js";
import { continueFromEvaluation, restartCampaign } from "./session.js";
import {
  openTutorial,
  tutorialBack,
  tutorialNext,
  tutorialSkip,
  isTutorialOpen,
} from "./tutorial.js";
import { completeLevel } from "./evaluation.js";
import { applyStaticIcons } from "./icons.js";
import { INTRO_COPY, LEARN_POINTS } from "./learning.js";

function bindAnswerControls() {
  document.querySelectorAll("[data-answer]").forEach((btn) => {
    btn.addEventListener("click", () => answer(btn.dataset.answer, completeLevel));
  });
}

function bindIntro() {
  document.getElementById("btnPlay").addEventListener("click", beginPlay);
  document.getElementById("btnLevels").addEventListener("click", toggleLevelSelect);
  document.getElementById("btnIntroTutorial").addEventListener("click", () => openTutorial(false));
}

function bindTutorial() {
  document.getElementById("btnTutorial").addEventListener("click", () => openTutorial(false));
  document.getElementById("tutorialSkip").addEventListener("click", tutorialSkip);
  document.getElementById("tutorialBack").addEventListener("click", tutorialBack);
  document.getElementById("tutorialNext").addEventListener("click", tutorialNext);
}

function bindEndScreen() {
  document.getElementById("btnEndPrimary").addEventListener("click", continueFromEvaluation);
  document.getElementById("btnRestart").addEventListener("click", restartCampaign);
  document.getElementById("btnEndLevels").addEventListener("click", openLevelSelectFromEnd);
}

function bindKeyboard() {
  document.addEventListener("keydown", (e) => {
    if (isTutorialOpen()) return;
    if (e.key === "1") answer("color", completeLevel);
    if (e.key === "2") answer("form", completeLevel);
    if (e.key === "3") answer("impact", completeLevel);
    if (e.key === "4") answer("life", completeLevel);
    if (e.key.toLowerCase() === "l") answer("letgo", completeLevel);
  });
}

function renderIntroLearning() {
  const lead = document.getElementById("introLead");
  const claim = document.getElementById("introClaim");
  if (lead) lead.textContent = INTRO_COPY.lead;
  if (claim) claim.textContent = INTRO_COPY.claim;
  const list = document.getElementById("learnList");
  if (!list) return;
  list.innerHTML = LEARN_POINTS.map((p) => `<li><b>${p.title}</b><br>${p.text}</li>`).join("");
}

applyStaticIcons();
renderIntroLearning();
bindAnswerControls();
bindIntro();
bindTutorial();
bindEndScreen();
bindKeyboard();
renderIntroLevels();
