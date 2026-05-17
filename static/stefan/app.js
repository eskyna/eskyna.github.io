const APP_URL = "https://eskyna.com/stefan/";
const IMAGE_FALLBACK = "/stefan/images/natalia-portrait.webp";
const PDF_URL = "/10_Styling_Tipps.pdf";
const NOTE_KEY = "eskyna:natalia:notes";
const SPARKLE_KEY = "eskyna:natalia:sparkles";
const TIPS_KEY = "eskyna:styling-tips:done";
const PDF_CACHE_NAME = "eskyna-stefan-pdf-v1";

const prompts = [
  "Heute reicht ein klarer Styling-Schritt: waehle ein Detail bewusst aus.",
  "PWA-Magie: installierbar, offline bereit und mit kleinen Styling-Aufgaben.",
  "Ein Outfit wirkt sofort ruhiger, wenn Farben, Proportionen und Anlass zusammenpassen.",
  "Ziehe einen Tipp, hake ihn ab und speichere deine beste Outfit-Idee als Notiz.",
  "Ein kleiner Goldmoment: weniger Zufall, mehr Stil-System.",
  "Offline-Test: App oeffnen, PDF speichern, Flugmodus aktivieren und erneut laden.",
];

const styleTips = [
  {
    title: "Starte mit deiner Wirkung",
    text: "Frage dich vor dem Anziehen: Wie moechte ich heute wirken - klar, nahbar, kreativ, elegant oder ruhig?",
  },
  {
    title: "Baue eine kleine Farbwelt",
    text: "Waehle zwei neutrale Basisfarben und eine Akzentfarbe. So entstehen schneller stimmige Kombinationen.",
  },
  {
    title: "Pruefe die Passform zuerst",
    text: "Schultern, Taille, Laenge und Bewegungsfreiheit entscheiden oft mehr als Marke oder Trend.",
  },
  {
    title: "Nutze eine Outfit-Formel",
    text: "Zum Beispiel: ruhige Basis, ein strukturiertes Teil, ein bewusster Akzent. Das spart morgens Zeit.",
  },
  {
    title: "Arbeite mit Proportionen",
    text: "Kombiniere weit mit schmal, kurz mit lang oder weich mit klar. Dadurch wirkt der Look geplanter.",
  },
  {
    title: "Setze einen Fokuspunkt",
    text: "Ein Schmuckstueck, ein Schuh, eine Farbe oder eine Linie darf die Hauptrolle spielen - nicht alles gleichzeitig.",
  },
  {
    title: "Plane für deinen Alltag",
    text: "Ein gutes Outfit passt zu Terminen, Wegen, Wetter und Energielevel - nicht nur zum Foto.",
  },
  {
    title: "Sortiere nach Kombinierbarkeit",
    text: "Lieblingsteile werden staerker, wenn du direkt zwei bis drei passende Partner dazu findest.",
  },
  {
    title: "Kaufe mit Lueckenliste",
    text: "Notiere fehlende Teile vor dem Shopping. Das verhindert Fehlkaeufe und macht Entscheidungen klarer.",
  },
  {
    title: "Fotografiere gute Looks",
    text: "Speichere funktionierende Outfits als Mini-Bibliothek. So findest du sie spaeter sofort wieder.",
  },
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
const tipsGrid = document.querySelector("#style-tips-grid");
const tipsProgress = document.querySelector("#tips-progress");
const resetTipsButton = document.querySelector("#reset-tips-button");
const tipRouletteButton = document.querySelector("#tip-roulette-button");
const togglePdfButton = document.querySelector("#toggle-pdf-button");
const savePdfButton = document.querySelector("#save-pdf-button");
const pdfCacheStatus = document.querySelector("#pdf-cache-status");
const pdfViewer = document.querySelector("#pdf-viewer");
const pdfFrame = pdfViewer?.querySelector("iframe");

let deferredInstallPrompt;
let notesHydrated = false;
let tipsHydrated = false;

function runWhenIdle(callback, timeout = 1200) {
  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(callback, { timeout });
    return;
  }

  window.setTimeout(callback, 140);
}

function hydrateWhenVisible(targetElement, hydrateFn) {
  if (!targetElement) {
    runWhenIdle(hydrateFn);
    return;
  }

  if (!("IntersectionObserver" in window)) {
    runWhenIdle(hydrateFn);
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      if (!entries[0]?.isIntersecting) return;
      observer.disconnect();
      hydrateFn();
    },
    { rootMargin: "260px 0px" }
  );

  observer.observe(targetElement);
}

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

function getDoneTips() {
  try {
    const parsed = JSON.parse(localStorage.getItem(TIPS_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

function setDoneTips(doneTips) {
  const validIndexes = [...new Set(doneTips)].filter(
    (index) => Number.isInteger(index) && index >= 0 && index < styleTips.length
  );
  localStorage.setItem(TIPS_KEY, JSON.stringify(validIndexes));
}

function renderNotes() {
  const notes = getNotes();
  noteList.innerHTML = "";

  if (!notes.length) {
    const item = document.createElement("li");
    item.className = "empty";
    item.textContent = "Noch keine Notiz. Halte eine Styling-Idee oder Erinnerung fest.";
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
    removeButton.setAttribute("aria-label", `Notiz entfernen: ${note}`);
    removeButton.addEventListener("click", () => {
      const nextNotes = getNotes().filter((_, currentIndex) => currentIndex !== index);
      setNotes(nextNotes);
      renderNotes();
    });

    item.append(text, removeButton);
    noteList.append(item);
  });
}

function ensureNotesHydrated() {
  if (notesHydrated) return;
  renderNotes();
  notesHydrated = true;
}

function renderStyleTips() {
  if (!tipsGrid || !tipsProgress) return;

  const doneTips = getDoneTips();
  tipsGrid.innerHTML = "";

  styleTips.forEach((tip, index) => {
    const item = document.createElement("li");
    const title = document.createElement("h3");
    const text = document.createElement("p");
    const button = document.createElement("button");
    const isDone = doneTips.includes(index);

    item.className = `tip-card${isDone ? " is-done" : ""}`;
    title.textContent = tip.title;
    text.textContent = tip.text;
    button.type = "button";
    button.className = "tip-toggle";
    button.textContent = isDone ? "Erledigt" : "Abhaken";
    button.setAttribute("aria-pressed", String(isDone));
    button.addEventListener("click", () => toggleTip(index, button));

    item.append(title, text, button);
    tipsGrid.append(item);
  });

  const count = doneTips.length;
  tipsProgress.textContent = `${count} von ${styleTips.length} Tipps abgehakt`;
}

function ensureTipsHydrated() {
  if (tipsHydrated) return;
  renderStyleTips();
  tipsHydrated = true;
}

function toggleTip(index, triggerElement) {
  const doneTips = getDoneTips();
  const nextTips = doneTips.includes(index)
    ? doneTips.filter((tipIndex) => tipIndex !== index)
    : [...doneTips, index];

  setDoneTips(nextTips);
  renderStyleTips();

  if (!doneTips.includes(index) && triggerElement) {
    const rect = triggerElement.getBoundingClientRect();
    makeSparkle(rect.left + rect.width / 2, rect.top + rect.height / 2);
  }
}

function resetTips() {
  ensureTipsHydrated();
  setDoneTips([]);
  renderStyleTips();
  dailyLine.textContent = "Zurueck auf Anfang: Ziehe einen Tipp und probiere ihn heute aus.";
}

function drawRandomTip() {
  ensureTipsHydrated();
  const index = Math.floor(Math.random() * styleTips.length);
  const tip = styleTips[index];
  dailyLine.textContent = `${tip.title}: ${tip.text}`;

  const cards = [...document.querySelectorAll(".tip-card")];
  cards.forEach((card) => card.classList.remove("is-featured"));
  const chosenCard = cards[index];
  if (chosenCard) {
    chosenCard.scrollIntoView({ behavior: "smooth", block: "center" });
    chosenCard.classList.add("is-featured");
    window.setTimeout(() => chosenCard.classList.remove("is-featured"), 1800);
    const rect = chosenCard.getBoundingClientRect();
    makeSparkle(rect.left + rect.width / 2, rect.top + rect.height / 2);
  }
}

function updateConnectionStatus() {
  const isOnline = navigator.onLine;
  statusEl.textContent = isOnline
    ? "Online · Offline-Cache bereit"
    : "Offline · App funktioniert weiter";
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

  sparkleButton.textContent =
    count === 1 ? "1 Glitzer gespeichert" : `${count} Glitzer gespeichert`;
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
    text: "Eine kleine spielerische PWA mit Styling-Tipps von ESKYNA.",
    url: APP_URL,
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
    shareButton.textContent = "Link kopiert";
    window.setTimeout(() => {
      shareButton.textContent = "Teilen";
    }, 1800);
  } catch (error) {
    shareButton.textContent = "Kopieren fehlgeschlagen";
    window.setTimeout(() => {
      shareButton.textContent = "Teilen";
    }, 1800);
  }
}

function togglePdfPreview() {
  if (!pdfViewer || !pdfFrame) return;

  const shouldShow = pdfViewer.hidden;
  pdfViewer.hidden = !shouldShow;
  togglePdfButton.textContent = shouldShow ? "PDF-Vorschau ausblenden" : "PDF-Vorschau laden";

  if (shouldShow && pdfFrame.src === "about:blank") {
    pdfFrame.src = pdfFrame.dataset.src || PDF_URL;
    pdfCacheStatus.textContent =
      "PDF-Vorschau wird geladen. Auf manchen mobilen Browsern oeffnet sich das PDF besser extern.";
  }
}

async function updatePdfCacheStatus() {
  if (!pdfCacheStatus || !("caches" in window)) return;

  const cached = await caches.match(PDF_URL);
  pdfCacheStatus.textContent = cached
    ? "PDF ist im Browser-Cache gespeichert und kann spaeter schneller/offline geoeffnet werden."
    : "PDF wird erst geladen, wenn du es anforderst.";
}

async function savePdfOffline() {
  if (!("caches" in window)) {
    pdfCacheStatus.textContent = "Dieser Browser unterstuetzt den Cache-Zugriff hier nicht.";
    return;
  }

  savePdfButton.disabled = true;
  savePdfButton.textContent = "Speichere...";
  pdfCacheStatus.textContent = "PDF wird geladen und in den Cache gelegt.";

  try {
    const response = await fetch(PDF_URL, { cache: "reload" });
    if (!response.ok) throw new Error(`PDF request failed: ${response.status}`);
    const cache = await caches.open(PDF_CACHE_NAME);
    await cache.put(PDF_URL, response.clone());
    pdfCacheStatus.textContent =
      "PDF gespeichert. Jetzt kannst du die App spaeter wieder oeffnen und schneller auf das PDF zugreifen.";
    makeSparkle(window.innerWidth / 2, window.innerHeight / 2);
  } catch (error) {
    pdfCacheStatus.textContent =
      "PDF konnte nicht gespeichert werden. Bitte online sein und erneut versuchen.";
  } finally {
    savePdfButton.disabled = false;
    savePdfButton.textContent = "PDF offline speichern";
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
      statusEl.textContent = "Service Worker nicht verfuegbar";
    });
  });
}

portrait.addEventListener("error", () => {
  if (portrait.src.endsWith("natalia-portrait.webp")) return;
  portrait.src = portrait.dataset.fallback || IMAGE_FALLBACK;
});

noteForm.addEventListener("submit", (event) => {
  event.preventDefault();
  ensureNotesHydrated();
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
resetTipsButton?.addEventListener("click", resetTips);
tipRouletteButton?.addEventListener("click", drawRandomTip);
togglePdfButton?.addEventListener("click", togglePdfPreview);
savePdfButton?.addEventListener("click", savePdfOffline);
window.addEventListener("online", updateConnectionStatus);
window.addEventListener("offline", updateConnectionStatus);

if ("caches" in window) {
  window.addEventListener("load", updatePdfCacheStatus);
}

drawPrompt();
updateConnectionStatus();
setupInstallPrompt();
setupServiceWorker();

hydrateWhenVisible(tipsGrid, ensureTipsHydrated);
hydrateWhenVisible(noteList, ensureNotesHydrated);

runWhenIdle(() => {
  ensureTipsHydrated();
  ensureNotesHydrated();
});
