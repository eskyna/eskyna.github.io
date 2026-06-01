const API_BASE_URL = "https://api.eskyna-style.workers.dev";
const API_URL = `${API_BASE_URL.replace(/\/$/, "")}/v1/images`;
const MAX_IMAGE_EDGE = 1600;
const JPEG_QUALITY = 0.88;

const els = {
  input: document.querySelector("#photoInput"),
  dropZone: document.querySelector("#dropZone"),
  previewShell: document.querySelector("#previewShell"),
  previewImage: document.querySelector("#previewImage"),
  analyzeButton: document.querySelector("#analyzeButton"),
  clearButton: document.querySelector("#clearButton"),
  statusText: document.querySelector("#statusText"),
  loading: document.querySelector("#loadingIndicator"),
  emptyState: document.querySelector("#emptyState"),
  errorBox: document.querySelector("#errorBox"),
  resultContent: document.querySelector("#resultContent"),
  resultBadge: document.querySelector("#resultBadge"),
  installButton: document.querySelector("#installButton"),
  installPromoButton: document.querySelector("#installPromoButton"),
  installHint: document.querySelector("#installHint"),
};

let selectedFile = null;
let previewUrl = null;
let deferredInstallPrompt = null;

function setStatus(message) {
  els.statusText.textContent = message;
}

function setBusy(isBusy) {
  els.loading.hidden = !isBusy;
  els.analyzeButton.disabled = isBusy || !selectedFile;
  els.clearButton.disabled = isBusy || !selectedFile;
  els.analyzeButton.textContent = isBusy ? "Portraitfoto wird analysiert …" : "Analyse starten";
  els.resultBadge.textContent = isBusy ? "Analysiert" : selectedFile ? "Bereit" : "Warten";
}

function setError(message) {
  els.errorBox.hidden = !message;
  els.errorBox.textContent = message || "";
  if (message) {
    els.resultBadge.textContent = "Hinweis";
  }
}

function resetResult() {
  els.emptyState.hidden = false;
  els.resultContent.hidden = true;
  els.resultContent.innerHTML = "";
  setError("");
  els.resultBadge.textContent = "Bereit";
}

function clearSelection() {
  selectedFile = null;
  els.input.value = "";
  els.previewShell.hidden = true;
  els.previewImage.removeAttribute("src");
  if (previewUrl) URL.revokeObjectURL(previewUrl);
  previewUrl = null;
  els.analyzeButton.disabled = true;
  els.clearButton.disabled = true;
  setStatus("Noch kein Portraitfoto ausgewählt.");
  resetResult();
}

function setInstallHint(message) {
  if (els.installHint) {
    els.installHint.textContent = message;
  }
}

function toggleHeaderInstallButton(isVisible) {
  if (els.installButton) {
    els.installButton.hidden = !isVisible;
  }
}

function updateInstallHintForDevice() {
  const isMobile = window.matchMedia("(max-width: 900px)").matches;
  if (!isMobile) return;

  if (deferredInstallPrompt) {
    setInstallHint(
      "Installiere die App jetzt auf deinem Smartphone und starte die Analyse direkt vom Home-Bildschirm."
    );
    return;
  }

  const isiOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  if (isiOS) {
    setInstallHint("iPhone/iPad: Tippen Du auf Teilen und wähle anschließend Zum Home-Bildschirm.");
  } else {
    setInstallHint(
      "Android: Öffne das Browser-Menü und wähle App installieren oder Zum Startbildschirm hinzufügen."
    );
  }
}

async function triggerInstallFlow() {
  if (deferredInstallPrompt) {
    deferredInstallPrompt.prompt();
    await deferredInstallPrompt.userChoice;
    deferredInstallPrompt = null;
    toggleHeaderInstallButton(false);
    setInstallHint(
      "Vielen Dank. Du kannst die Analyse jetzt jederzeit direkt auf deinem Smartphone starten."
    );
    return;
  }

  const isiOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isMobile = window.matchMedia("(max-width: 900px)").matches;

  if (isMobile && navigator.share) {
    try {
      await navigator.share({
        title: "EStyle (beta)",
        text: "EStyle (beta) auf dem Startbildschirm installieren",
        url: window.location.href,
      });
    } catch (error) {
      console.warn("Share-Dialog konnte nicht geöffnet werden:", error);
    }
  }

  if (isiOS) {
    setInstallHint(
      "iPhone/iPad: Öffne Teilen und wähle Zum Home-Bildschirm. Danach ist die App direkt auf deinem Startbildschirm verfügbar."
    );
  } else {
    setInstallHint(
      "Android: Öffne das Browser-Menü und wähle App installieren oder Zum Startbildschirm hinzufügen."
    );
  }
}

function formatBytes(bytes) {
  if (!Number.isFinite(bytes)) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function pickFile(file) {
  if (!file) return;
  if (!file.type.startsWith("image/")) {
    setError("Bitte wähle eine Bilddatei aus.");
    return;
  }

  selectedFile = file;
  if (previewUrl) URL.revokeObjectURL(previewUrl);
  previewUrl = URL.createObjectURL(file);
  els.previewImage.src = previewUrl;
  els.previewShell.hidden = false;
  els.analyzeButton.disabled = false;
  els.clearButton.disabled = false;
  setStatus(`${file.name || "Foto"} ausgewählt (${formatBytes(file.size)}).`);
  resetResult();
}

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Das Bild konnte nicht für die Vorschau verarbeitet werden."));
    };
    image.src = url;
  });
}

async function prepareImage(file) {
  if (
    !file.type.startsWith("image/") ||
    file.type === "image/gif" ||
    file.type === "image/svg+xml"
  ) {
    return file;
  }

  try {
    const image = await loadImage(file);
    const scale = Math.min(1, MAX_IMAGE_EDGE / Math.max(image.naturalWidth, image.naturalHeight));

    if (scale === 1 && file.size < 4_000_000) {
      return file;
    }

    const canvas = document.createElement("canvas");
    canvas.width = Math.round(image.naturalWidth * scale);
    canvas.height = Math.round(image.naturalHeight * scale);
    const ctx = canvas.getContext("2d", { alpha: false });
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

    return await new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob || file), "image/jpeg", JPEG_QUALITY);
    });
  } catch (error) {
    console.warn(error);
    return file;
  }
}

async function analyzeSelectedPhoto() {
  if (!selectedFile) return;

  setBusy(true);
  setError("");
  els.emptyState.hidden = true;
  els.resultContent.hidden = true;
  els.resultContent.innerHTML = "";
  setStatus("Foto wird vorbereitet …");

  try {
    const uploadBlob = await prepareImage(selectedFile);
    setStatus(`Analyse läuft (${formatBytes(uploadBlob.size)} werden übertragen) …`);

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/octet-stream",
      },
      body: uploadBlob,
      cache: "no-store",
    });

    const contentType = response.headers.get("content-type") || "";
    const payload = contentType.includes("application/json")
      ? await response.json()
      : await response.text();

    if (!response.ok) {
      const detail = typeof payload === "string" ? payload : JSON.stringify(payload, null, 2);
      throw new Error(`Der Analysedienst hat mit HTTP ${response.status} geantwortet.\n${detail}`);
    }

    renderResult(payload);
    setStatus("Analyse abgeschlossen.");
    els.resultBadge.textContent = "Fertig";
  } catch (error) {
    console.error(error);
    els.emptyState.hidden = true;
    setError(error.message || "Die Analyse konnte nicht abgeschlossen werden.");
    setStatus("Analyse fehlgeschlagen. Bitte prüfen Du Verbindung, CORS-Freigabe und Bildformat.");
  } finally {
    setBusy(false);
  }
}

function normalizeText(value) {
  if (value == null) return "";
  if (Array.isArray(value)) return value.filter(Boolean).join(", ");
  if (typeof value === "object") return JSON.stringify(value, null, 2);
  return String(value);
}

function findFirst(obj, keys) {
  if (!obj || typeof obj !== "object") return undefined;
  for (const key of keys) {
    if (obj[key] != null && obj[key] !== "") return obj[key];
  }
  return undefined;
}

function toList(value) {
  if (value == null || value === "") return [];
  if (Array.isArray(value))
    return value
      .flatMap((item) => (typeof item === "string" ? [item] : [normalizeText(item)]))
      .filter(Boolean);
  if (typeof value === "object")
    return Object.entries(value).map(([key, item]) => `${key}: ${normalizeText(item)}`);
  return [String(value)];
}

function isColorLike(value) {
  return (
    typeof value === "string" &&
    (/^#([0-9a-f]{3}){1,2}$/i.test(value.trim()) || /^rgb/.test(value.trim()))
  );
}

function makeCard(title, content, options = {}) {
  const card = document.createElement("section");
  card.className = `insight-card${options.full ? " full" : ""}`;
  const heading = document.createElement("h4");
  heading.textContent = title;
  card.append(heading);

  if (Array.isArray(content)) {
    const list = document.createElement("ul");
    content.forEach((item) => {
      const li = document.createElement("li");
      li.textContent = item;
      list.append(li);
    });
    card.append(list);
  } else if (options.html instanceof HTMLElement) {
    card.append(options.html);
  } else {
    const paragraph = document.createElement("p");
    paragraph.textContent = normalizeText(content);
    card.append(paragraph);
  }

  return card;
}

function makeColorChips(value) {
  const wrapper = document.createElement("div");
  wrapper.className = "color-chips";
  toList(value).forEach((item) => {
    const chip = document.createElement("span");
    chip.className = "color-chip";
    const dot = document.createElement("span");
    dot.className = "color-dot";
    const label = String(item);
    const color =
      label.match(/#([0-9a-f]{3}){1,2}\b/i)?.[0] || (isColorLike(label.trim()) ? label.trim() : "");
    if (color) dot.style.setProperty("--dot-color", color);
    const text = document.createElement("span");
    text.textContent = label;
    chip.append(dot, text);
    wrapper.append(chip);
  });
  return wrapper;
}

function toPngDataUrl(base64Value) {
  if (typeof base64Value !== "string") return "";
  const trimmed = base64Value.trim();
  if (!trimmed) return "";
  if (/^data:image\/png;base64,/i.test(trimmed)) return trimmed;
  return `data:image/png;base64,${trimmed}`;
}

function makeOverlayPreview(base64Value) {
  const imageSrc = toPngDataUrl(base64Value);
  if (!imageSrc) return null;

  const wrapper = document.createElement("figure");
  wrapper.className = "overlay-preview";

  const image = document.createElement("img");
  image.src = imageSrc;
  image.alt = "Coach-Overlay zur Analyse";
  image.decoding = "async";
  image.loading = "lazy";

  const caption = document.createElement("figcaption");
  caption.textContent = "Visualisierte Analyse mit Coach-Overlay";

  wrapper.append(image, caption);
  return wrapper;
}

function renderResult(payload) {
  els.resultContent.innerHTML = "";
  els.emptyState.hidden = true;
  els.resultContent.hidden = false;

  const data = typeof payload === "string" ? { antwort: payload } : payload;
  const grid = document.createElement("div");
  grid.className = "insight-grid";

  const summary = findFirst(data, [
    "summary",
    "zusammenfassung",
    "analysis",
    "analyse",
    "description",
    "beschreibung",
    "result",
  ]);
  const styleType = findFirst(data, ["styleType", "style_type", "stiltyp", "type", "persona"]);
  const confidence = findFirst(data, ["confidence", "score", "sicherheit"]);
  const colors = findFirst(data, [
    "colors",
    "colours",
    "palette",
    "farben",
    "colorPalette",
    "farbpalette",
  ]);
  const recommendations = findFirst(data, [
    "recommendations",
    "recommendation",
    "suggestions",
    "tipps",
    "empfehlungen",
    "advice",
  ]);
  const avoid = findFirst(data, ["avoid", "donts", "vermeiden", "risks", "hinweise"]);
  const outfits = findFirst(data, [
    "outfits",
    "combinations",
    "kombinationen",
    "nextSteps",
    "next_steps",
  ]);
  const overlayBase64 =
    findFirst(data, ["coach_overlay_png_base64"]) ||
    findFirst(data?.artifacts, ["coach_overlay_png_base64"]);

  if (overlayBase64) {
    const overlayPreview = makeOverlayPreview(overlayBase64);
    if (overlayPreview) {
      grid.append(makeCard("Coach Overlay", null, { html: overlayPreview, full: true }));
    }
  }

  if (summary) grid.append(makeCard("Zusammenfassung", summary, { full: true }));
  if (styleType) grid.append(makeCard("Stilrichtung", styleType));
  if (confidence) grid.append(makeCard("Sicherheit", normalizeText(confidence)));
  if (colors) grid.append(makeCard("Farben", null, { html: makeColorChips(colors) }));
  if (recommendations)
    grid.append(makeCard("Empfehlungen", toList(recommendations), { full: true }));
  if (outfits) grid.append(makeCard("Nächste Schritte", toList(outfits), { full: true }));
  if (avoid) grid.append(makeCard("Darauf achten", toList(avoid), { full: true }));

  if (!grid.childElementCount) {
    grid.append(makeCard("Antwort des Dienstes", normalizeText(data), { full: true }));
  }

  const raw = document.createElement("details");
  raw.className = "raw-json";
  const summaryEl = document.createElement("summary");
  summaryEl.textContent = "Rohdaten anzeigen";
  const pre = document.createElement("pre");
  pre.textContent = typeof payload === "string" ? payload : JSON.stringify(payload, null, 2);
  raw.append(summaryEl, pre);

  els.resultContent.append(grid, raw);
}

els.input.addEventListener("change", (event) => {
  pickFile(event.target.files?.[0]);
});

["dragenter", "dragover"].forEach((type) => {
  els.dropZone.addEventListener(type, (event) => {
    event.preventDefault();
    els.dropZone.classList.add("is-dragging");
  });
});

["dragleave", "drop"].forEach((type) => {
  els.dropZone.addEventListener(type, (event) => {
    event.preventDefault();
    els.dropZone.classList.remove("is-dragging");
  });
});

els.dropZone.addEventListener("drop", (event) => {
  pickFile(event.dataTransfer?.files?.[0]);
});

els.analyzeButton.addEventListener("click", analyzeSelectedPhoto);
els.clearButton.addEventListener("click", clearSelection);

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  deferredInstallPrompt = event;
  toggleHeaderInstallButton(true);
  updateInstallHintForDevice();
});

if (els.installButton) {
  els.installButton.addEventListener("click", triggerInstallFlow);
}

if (els.installPromoButton) {
  els.installPromoButton.addEventListener("click", triggerInstallFlow);
}

window.addEventListener("appinstalled", () => {
  toggleHeaderInstallButton(false);
  setInstallHint("Die App ist installiert und auf deinem Startbildschirm verfügbar.");
});

updateInstallHintForDevice();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch((error) => {
      console.warn("Service Worker konnte nicht registriert werden:", error);
    });
  });
}
