(() => {
  "use strict";

  const $ = (selector) => document.querySelector(selector);

  const els = {
    stage: $("#stage"),
    message: $("#message"),
    occasionTitle: $("#occasion-title"),
    occasionHint: $("#occasion-hint"),
    score: $("#score"),
    time: $("#time"),
    streak: $("#streak"),
    auraValue: $("#aura-value"),
    auraMeter: $("#aura-meter"),
    auraBar: $("#aura-bar"),
    comboStatus: $("#combo-status"),
    comboSlots: Array.from(document.querySelectorAll("#combo-slots span")),
    startBtn: $("#start-btn"),
    pauseBtn: $("#pause-btn"),
    restartBtn: $("#restart-btn"),
    introModal: $("#intro-modal"),
    resultModal: $("#result-modal"),
    playNow: $("#play-now"),
    againBtn: $("#again-btn"),
    resultRank: $("#result-rank"),
    resultTitle: $("#result-title"),
    resultText: $("#result-text"),
    finalScore: $("#final-score"),
    highScore: $("#high-score"),
  };

  const occasions = [
    {
      id: "business",
      title: "Business Meeting",
      hint: "Souveraen, klar und ruhig.",
      tags: ["neutral", "cool", "deep", "clear"],
      risky: ["neon", "candy", "muddy"],
      winText: "Klarer Auftritt: Die Palette wirkt professionell und fokussiert.",
    },
    {
      id: "date",
      title: "Date",
      hint: "Nahbar, warm und nicht zu laut.",
      tags: ["soft", "warm", "romantic", "deep"],
      risky: ["neon", "office", "acid"],
      winText: "Charmant kombiniert: Die Farben wirken weich, persoenlich und selbstbewusst.",
    },
    {
      id: "client",
      title: "Kundentermin",
      hint: "Vertrauen, Kompetenz und Frische.",
      tags: ["trusted", "cool", "neutral", "fresh"],
      risky: ["neon", "too-playful", "harsh"],
      winText: "Vertrauen gewonnen: Die Kombination bleibt praezise und einladend.",
    },
    {
      id: "daily",
      title: "Alltag",
      hint: "Leicht, tragbar und unkompliziert.",
      tags: ["casual", "natural", "warm", "soft"],
      risky: ["harsh", "formal", "acid"],
      winText: "Alltagstauglich: Die Farben sind unkompliziert und harmonisch.",
    },
  ];

  const colors = [
    {
      name: "Dunkelblau",
      hex: "#18324a",
      family: "blue",
      tags: ["neutral", "cool", "deep", "clear", "trusted"],
      fit: ["business", "client"],
    },
    {
      name: "Graphit",
      hex: "#3f4146",
      family: "grey",
      tags: ["neutral", "deep", "clear"],
      fit: ["business", "client"],
    },
    {
      name: "Elfenbein",
      hex: "#f3ead7",
      family: "cream",
      tags: ["neutral", "soft", "warm", "casual"],
      fit: ["business", "date", "daily"],
    },
    {
      name: "Burgunder",
      hex: "#713043",
      family: "red",
      tags: ["deep", "romantic", "clear"],
      fit: ["business", "date"],
    },
    {
      name: "Petrol",
      hex: "#0f6064",
      family: "teal",
      tags: ["cool", "trusted", "deep", "fresh"],
      fit: ["client", "business"],
    },
    {
      name: "Salbei",
      hex: "#99a875",
      family: "green",
      tags: ["soft", "natural", "fresh", "casual"],
      fit: ["client", "daily"],
    },
    {
      name: "Taupe",
      hex: "#8a7d72",
      family: "brown",
      tags: ["neutral", "soft", "trusted", "natural"],
      fit: ["client", "daily"],
    },
    {
      name: "Rosenholz",
      hex: "#b77b7d",
      family: "pink",
      tags: ["soft", "romantic", "warm"],
      fit: ["date", "daily"],
    },
    {
      name: "Pflaume",
      hex: "#58304d",
      family: "violet",
      tags: ["deep", "romantic", "soft"],
      fit: ["date"],
    },
    {
      name: "Champagner",
      hex: "#d8bc87",
      family: "gold",
      tags: ["warm", "soft", "romantic"],
      fit: ["date", "daily"],
    },
    {
      name: "Denim",
      hex: "#456985",
      family: "blue",
      tags: ["casual", "cool", "trusted"],
      fit: ["daily", "client"],
    },
    {
      name: "Terrakotta",
      hex: "#b46446",
      family: "orange",
      tags: ["warm", "natural", "casual"],
      fit: ["daily", "date"],
    },
    {
      name: "Olive",
      hex: "#667046",
      family: "green",
      tags: ["natural", "casual", "warm"],
      fit: ["daily"],
    },
    {
      name: "Himmelblau",
      hex: "#9fc2dc",
      family: "blue",
      tags: ["soft", "fresh", "casual"],
      fit: ["client", "daily"],
    },
    {
      name: "Neonlime",
      hex: "#b6ff00",
      family: "acid",
      tags: ["neon", "acid", "too-playful"],
      fit: [],
    },
    { name: "Signalrot", hex: "#d21f34", family: "red", tags: ["harsh", "clear"], fit: [] },
    { name: "Bonbonpink", hex: "#ff75c8", family: "pink", tags: ["candy", "too-playful"], fit: [] },
    { name: "Schlamm", hex: "#5b5141", family: "mud", tags: ["muddy", "natural"], fit: [] },
    {
      name: "Eisgrau",
      hex: "#d8e0e5",
      family: "grey",
      tags: ["cool", "neutral", "clear"],
      fit: ["business", "client"],
    },
    {
      name: "Koralle",
      hex: "#d97a66",
      family: "orange",
      tags: ["warm", "romantic", "fresh"],
      fit: ["date", "daily"],
    },
  ];

  const state = {
    running: false,
    paused: false,
    score: 0,
    aura: 100,
    time: 60,
    streak: 0,
    combo: [],
    occasion: occasions[0],
    spawnTimer: null,
    clockTimer: null,
    occasionTimer: null,
    round: 0,
    spawnEvery: 850,
  };

  const random = (items) => items[Math.floor(Math.random() * items.length)];
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

  function init() {
    syncUI();
    bindEvents();
  }

  function bindEvents() {
    els.startBtn.addEventListener("click", startGame);
    els.playNow.addEventListener("click", startGame);
    els.againBtn.addEventListener("click", startGame);
    els.restartBtn.addEventListener("click", startGame);
    els.pauseBtn.addEventListener("click", togglePause);
    document.addEventListener("visibilitychange", () => {
      if (document.hidden && state.running && !state.paused) togglePause(true);
    });
  }

  function startGame() {
    closeDialog(els.introModal);
    closeDialog(els.resultModal);
    clearTimers();
    clearTokens();

    Object.assign(state, {
      running: true,
      paused: false,
      score: 0,
      aura: 100,
      time: 60,
      streak: 0,
      combo: [],
      round: 0,
      spawnEvery: 850,
    });

    nextOccasion(true);
    syncUI();
    setMessage("Tippe passende Farben an!", "good");
    els.pauseBtn.disabled = false;
    els.pauseBtn.textContent = "Pause";
    els.startBtn.textContent = "Laeuft";
    els.startBtn.disabled = true;

    state.spawnTimer = window.setInterval(spawnToken, state.spawnEvery);
    state.clockTimer = window.setInterval(tick, 1000);
    state.occasionTimer = window.setInterval(() => nextOccasion(false), 15000);

    for (let i = 0; i < 4; i += 1) {
      window.setTimeout(spawnToken, i * 420);
    }
  }

  function togglePause(forcePause = false) {
    if (!state.running) return;
    state.paused = forcePause || !state.paused;
    els.pauseBtn.textContent = state.paused ? "Weiter" : "Pause";
    els.stage.querySelectorAll(".color-token").forEach((token) => {
      token.style.animationPlayState = state.paused ? "paused" : "running";
    });
    setMessage(state.paused ? "Pausiert" : "Weiter geht's", state.paused ? "neutral" : "good");
  }

  function tick() {
    if (!state.running || state.paused) return;
    state.time -= 1;
    if (state.time <= 0) {
      state.time = 0;
      endGame("time");
    }
    if (state.time === 40 || state.time === 20) increaseTempo();
    syncUI();
  }

  function increaseTempo() {
    state.spawnEvery = Math.max(520, state.spawnEvery - 140);
    if (state.spawnTimer) window.clearInterval(state.spawnTimer);
    state.spawnTimer = window.setInterval(spawnToken, state.spawnEvery);
    setMessage("Tempo steigt", "neutral");
  }

  function nextOccasion(initial) {
    state.round += 1;
    const candidates = occasions.filter((item) => item.id !== state.occasion.id);
    state.occasion = initial ? random(occasions) : random(candidates);
    state.combo = [];
    syncCombo();
    syncUI();
    setMessage(
      initial ? `Anlass: ${state.occasion.title}` : `Neuer Anlass: ${state.occasion.title}`,
      "neutral"
    );
  }

  function spawnToken() {
    if (!state.running || state.paused) return;

    const tokenData = chooseColorForCurrentRound();
    const token = document.createElement("button");
    token.className = "color-token";
    token.type = "button";
    token.style.setProperty("--swatch", tokenData.hex);
    token.style.setProperty("--y", `${10 + Math.random() * 72}%`);
    token.style.setProperty("--dur", `${5.2 + Math.random() * 2.7}s`);
    token.dataset.name = tokenData.name;
    token.dataset.hex = tokenData.hex;
    token.dataset.family = tokenData.family;
    token.dataset.fit = tokenData.fit.join(",");
    token.dataset.tags = tokenData.tags.join(",");
    token.innerHTML = `<strong>${tokenData.name}</strong><small>${tokenTagline(tokenData)}</small>`;
    token.setAttribute("aria-label", `${tokenData.name} einsammeln`);

    token.addEventListener("pointerdown", (event) => collectToken(event, token, tokenData), {
      once: true,
    });
    token.addEventListener("animationend", () => token.remove(), { once: true });
    els.stage.appendChild(token);
  }

  function chooseColorForCurrentRound() {
    const good = colors.filter((color) => isGood(color, state.occasion));
    const decoys = colors.filter((color) => !isGood(color, state.occasion));
    return Math.random() < 0.62 ? random(good) : random(decoys);
  }

  function isGood(color, occasion) {
    if (color.fit.includes(occasion.id)) return true;
    const tagScore = color.tags.filter((tag) => occasion.tags.includes(tag)).length;
    const risky = color.tags.some((tag) => occasion.risky.includes(tag));
    return tagScore >= 3 && !risky;
  }

  function tokenTagline(color) {
    const topTags = color.tags
      .filter((tag) => !["neutral", "clear"].includes(tag))
      .slice(0, 2)
      .join(" + ");
    return topTags || "Basis";
  }

  function collectToken(event, token, color) {
    if (!state.running || state.paused) return;
    token.classList.add("collected");
    window.setTimeout(() => token.remove(), 150);

    const good = isGood(color, state.occasion);
    const rect = els.stage.getBoundingClientRect();
    const x = event.clientX ? event.clientX - rect.left : rect.width / 2;
    const y = event.clientY ? event.clientY - rect.top : rect.height / 2;

    if (good) {
      const comboBonus = state.combo.some((item) => item.family === color.family) ? 0 : 2;
      const points = 10 + Math.min(20, state.streak * 2) + comboBonus;
      state.score += points;
      state.streak += 1;
      state.aura = clamp(state.aura + 3, 0, 100);
      state.combo.push(color);
      showFloatingScore(`+${points}`, x, y);
      setMessage(random(["Stimmig", "Passt", "Ausstrahlung +"]), "good");
      if (state.combo.length >= 3) resolveCombo();
    } else {
      state.score = Math.max(0, state.score - 6);
      state.aura = clamp(state.aura - 13, 0, 100);
      state.streak = 0;
      state.combo = [];
      showFloatingScore("- Ausstrahlung", x, y);
      setMessage("Diese Farbe stoert den Anlass", "bad");
      els.gameCard?.classList?.add("shake");
      els.stage.classList.add("shake");
      window.setTimeout(() => els.stage.classList.remove("shake"), 280);
      if (state.aura <= 0) endGame("aura");
    }

    syncUI();
    syncCombo();
  }

  function resolveCombo() {
    const uniqueFamilies = new Set(state.combo.map((item) => item.family)).size;
    const allGood = state.combo.every((item) => isGood(item, state.occasion));
    if (allGood && uniqueFamilies >= 2) {
      const bonus = uniqueFamilies === 3 ? 35 : 22;
      state.score += bonus;
      state.aura = clamp(state.aura + 8, 0, 100);
      setMessage(`${state.occasion.winText} +${bonus}`, "good");
      els.stage.classList.add("flash");
      window.setTimeout(() => els.stage.classList.remove("flash"), 300);
    } else {
      state.aura = clamp(state.aura - 8, 0, 100);
      setMessage("Zu aehnlich: Mehr Balance waehlen", "bad");
    }
    state.combo = [];
    window.setTimeout(syncCombo, 160);
  }

  function showFloatingScore(text, x, y) {
    const bubble = document.createElement("div");
    bubble.className = "floating-score";
    bubble.textContent = text;
    bubble.style.left = `${x}px`;
    bubble.style.top = `${y}px`;
    els.stage.appendChild(bubble);
    window.setTimeout(() => bubble.remove(), 740);
  }

  function setMessage(text, type) {
    els.message.textContent = text;
    els.message.classList.remove("hidden");
    els.message.classList.add("pop");
    if (type === "bad") {
      els.message.style.borderColor = "rgba(210, 31, 52, 0.54)";
    } else if (type === "good") {
      els.message.style.borderColor = "rgba(215, 182, 111, 0.6)";
    } else {
      els.message.style.borderColor = "rgba(255, 255, 255, 0.16)";
    }
    window.clearTimeout(els.message._timer);
    els.message._timer = window.setTimeout(
      () => {
        els.message.classList.remove("pop");
        els.message.classList.add("hidden");
      },
      Math.min(2200, Math.max(1100, text.length * 32))
    );
  }

  function syncUI() {
    els.occasionTitle.textContent = state.occasion.title;
    els.occasionHint.textContent = state.occasion.hint;
    els.score.textContent = state.score.toString();
    els.time.textContent = state.time.toString();
    els.streak.textContent = state.streak.toString();
    els.auraValue.textContent = `${state.aura}%`;
    els.auraBar.style.width = `${state.aura}%`;
    els.auraMeter.setAttribute("aria-valuenow", state.aura.toString());
  }

  function syncCombo() {
    els.comboSlots.forEach((slot, index) => {
      const color = state.combo[index];
      slot.classList.toggle("filled", Boolean(color));
      if (color) {
        slot.style.setProperty("--slot-color", color.hex);
        slot.title = color.name;
      } else {
        slot.style.removeProperty("--slot-color");
        slot.title = "";
      }
    });
    const missing = Math.max(0, 3 - state.combo.length);
    els.comboStatus.textContent =
      missing === 0 ? "Kombination pruefen" : `${missing} Farbe${missing === 1 ? "" : "n"} fehlen`;
  }

  function endGame(reason) {
    if (!state.running) return;
    state.running = false;
    clearTimers();
    clearTokens();
    els.pauseBtn.disabled = true;
    els.startBtn.disabled = false;
    els.startBtn.textContent = "Spiel starten";

    const high = Math.max(Number(localStorage.getItem("cmd-highscore") || 0), state.score);
    localStorage.setItem("cmd-highscore", high.toString());

    const rank = getRank(state.score, state.aura);
    els.resultRank.textContent = rank.label;
    els.resultTitle.textContent = reason === "aura" ? "Ausstrahlung verbraucht" : "Runde beendet";
    els.resultText.textContent = rank.text;
    els.finalScore.textContent = state.score.toString();
    els.highScore.textContent = high.toString();
    openDialog(els.resultModal);
  }

  function getRank(score, aura) {
    if (score >= 520 && aura >= 50) {
      return {
        label: "Farbpass-Profi",
        text: "Sehr stark: Du erkennst Anlaesse schnell und kombinierst Farben mit System.",
      };
    }
    if (score >= 330) {
      return {
        label: "Stilsicher",
        text: "Gutes Farbgefuehl: Du triffst viele sichere Entscheidungen und haeltst die Ausstrahlung stabil.",
      };
    }
    if (score >= 170) {
      return {
        label: "Palette im Aufbau",
        text: "Solide Runde: Mit etwas mehr Fokus werden die Kombinationen noch harmonischer.",
      };
    }
    return {
      label: "Farbgefuehl aktiviert",
      text: "Ein Anfang ist gemacht. Achte auf Anlass, Wirkung und Balance der Farbfamilien.",
    };
  }

  function clearTimers() {
    [state.spawnTimer, state.clockTimer, state.occasionTimer].forEach((timer) => {
      if (timer) window.clearInterval(timer);
    });
    state.spawnTimer = null;
    state.clockTimer = null;
    state.occasionTimer = null;
  }

  function clearTokens() {
    els.stage.querySelectorAll(".color-token, .floating-score").forEach((node) => node.remove());
  }

  function openDialog(dialog) {
    if (!dialog.open) dialog.showModal();
  }

  function closeDialog(dialog) {
    if (dialog.open) dialog.close();
  }

  window.addEventListener("load", init);
})();
