const APP_URL = "https://eskyna.com/stefan/";
const IMAGE_FALLBACK = "/stefan/images/natalia-portrait.webp";
const NOTE_KEY = "eskyna:natalia:notes";
const SPARKLE_KEY = "eskyna:natalia:sparkles";

const prompts = [
  "Today feels like a good day for a tiny adventure.",
  "A little sparkle, a saved note, and Natalia is ready offline.",
  "Take one calm breath. Then write down one lovely thing.",
  "PWA magic: installable, offline-ready, and still playful.",
  "A golden card for Natalia: make something small feel special.",
  "Offline test idea: open this app, switch to airplane mode, refresh."
];

const statusEl = document.querySelector("#connection-status");
const installButton = document.querySelector("#install-button");
const sparkleButton = document.querySelector("#sparkle-button");
const cardButton = document.querySelector("#card-button");
const shareButton = document.querySelector("#share-button");
const dailyLine = document.querySelector("#daily-line");
const noteForm = document.querySelector("#note-form");
const noteInput = document.querySelector("#note-input");
const noteList = document.querySelector("#note-list");
const portrait = document.querySelector("#natalia-picture");

let deferredInstallPrompt;

function getNotes() {
  try {
    return JSON.parse(localStorage.getItem(NOTE_KEY) || "[]");
  } catch (error) {
    return [];
  }
}

function setNotes(notes) {
  localStorage.setItem(NOTE_KEY, JSON.stringify(notes.slice(0, 8)));
}

function renderNotes() {
  const notes = getNotes();
  noteList.innerHTML = "";

  if (!notes.length) {
    const item = document.createElement("li");
    item.className = "empty";
    item.textContent = "No notes yet. Add one tiny thing Natalia should remember.";
    noteList.append(item);
    return;
  }

  notes.forEach((note, index) => {
    const item = document.createElement("li");
    const text = document.createElement("span");
    const removeButton = document.createElement("button");

    text.textContent = note;
    removeButton.type = "button";
    removeButton.textContent = "×";
    removeButton.setAttribute("aria-label", `Remove note: ${note}`);
    removeButton.addEventListener("click", () => {
      const nextNotes = getNotes().filter((_, currentIndex) => currentIndex !== index);
      setNotes(nextNotes);
      renderNotes();
    });

    item.append(text, removeButton);
    noteList.append(item);
  });
}

function updateConnectionStatus() {
  const isOnline = navigator.onLine;
  statusEl.textContent = isOnline ? "Online · offline cache ready" : "Offline · still working";
  statusEl.dataset.state = isOnline ? "online" : "offline";
}

function drawPrompt() {
  const dayNumber = Math.floor(Date.now() / 86_400_000);
  const index = dayNumber % prompts.length;
  dailyLine.textContent = prompts[index];
}

function makeSparkle(originX = window.innerWidth / 2, originY = window.innerHeight / 2) {
  const symbols = ["✦", "✧", "✶", "♡", "❋"];
  const count = Number(localStorage.getItem(SPARKLE_KEY) || "0") + 1;
  localStorage.setItem(SPARKLE_KEY, String(count));

  for (let index = 0; index < 18; index += 1) {
    const sparkle = document.createElement("span");
    const angle = (Math.PI * 2 * index) / 18;
    const distance = 70 + Math.random() * 130;

    sparkle.className = "sparkle";
    sparkle.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    sparkle.style.left = `${originX}px`;
    sparkle.style.top = `${originY}px`;
    sparkle.style.setProperty("--spark-x", `${Math.cos(angle) * distance}px`);
    sparkle.style.setProperty("--spark-y", `${Math.sin(angle) * distance - 55}px`);
    sparkle.style.animationDelay = `${Math.random() * 120}ms`;
    document.body.append(sparkle);
    sparkle.addEventListener("animationend", () => sparkle.remove(), { once: true });
  }

  sparkleButton.textContent = count === 1 ? "1 sparkle saved" : `${count} sparkles saved`;
}

function randomCard() {
  const index = Math.floor(Math.random() * prompts.length);
  dailyLine.textContent = prompts[index];
  const rect = cardButton.getBoundingClientRect();
  makeSparkle(rect.left + rect.width / 2, rect.top + rect.height / 2);
}

async function shareApp() {
  const shareData = {
    title: "ESKYNA",
    text: "A small playful PWA for Natalia by ESKYNA.",
    url: APP_URL
  };

  if (navigator.share) {
    try {
      await navigator.share(shareData);
      return;
    } catch (error) {
      // Fall back to clipboard if sharing was cancelled or failed.
    }
  }

  try {
    await navigator.clipboard.writeText(APP_URL);
    shareButton.textContent = "Link copied";
    window.setTimeout(() => {
      shareButton.textContent = "Share";
    }, 1800);
  } catch (error) {
    shareButton.textContent = "Copy failed";
    window.setTimeout(() => {
      shareButton.textContent = "Share";
    }, 1800);
  }
}

function setupInstallPrompt() {
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredInstallPrompt = event;
    installButton.hidden = false;
  });

  installButton.addEventListener("click", async () => {
    if (!deferredInstallPrompt) return;
    deferredInstallPrompt.prompt();
    await deferredInstallPrompt.userChoice;
    deferredInstallPrompt = undefined;
    installButton.hidden = true;
  });

  window.addEventListener("appinstalled", () => {
    installButton.hidden = true;
    deferredInstallPrompt = undefined;
  });
}

function setupServiceWorker() {
  if (!("serviceWorker" in navigator)) return;

  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/stefan/sw.js", { scope: "/stefan/" }).catch(() => {
      statusEl.textContent = "Service worker unavailable";
    });
  });
}

portrait.addEventListener("error", () => {
  if (portrait.src.endsWith("natalia-portrait.webp")) return;
  portrait.src = portrait.dataset.fallback || IMAGE_FALLBACK;
});

noteForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const value = noteInput.value.trim();
  if (!value) return;

  const notes = getNotes();
  setNotes([value, ...notes]);
  noteInput.value = "";
  renderNotes();
  const rect = noteForm.getBoundingClientRect();
  makeSparkle(rect.left + rect.width / 2, rect.top + rect.height / 2);
});

sparkleButton.addEventListener("click", (event) => {
  makeSparkle(event.clientX, event.clientY);
});

cardButton.addEventListener("click", randomCard);
shareButton.addEventListener("click", shareApp);
window.addEventListener("online", updateConnectionStatus);
window.addEventListener("offline", updateConnectionStatus);

drawPrompt();
renderNotes();
updateConnectionStatus();
setupInstallPrompt();
setupServiceWorker();
