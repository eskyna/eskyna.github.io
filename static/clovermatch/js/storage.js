import { STORAGE_KEY } from "./config.js";

const DEFAULT_PROGRESS = { tutorialDone: false, unlocked: 1, bestClarity: 0 };

export function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_PROGRESS };
    return Object.assign({ ...DEFAULT_PROGRESS }, JSON.parse(raw));
  } catch (_) {
    return { ...DEFAULT_PROGRESS };
  }
}

export function saveProgress(progress) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (_) {}
}
