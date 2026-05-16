(() => {
  "use strict";

  const CLOVER_SRC = "assets/sign.png";

  const palettes = [
    {
      id: "soft-summer",
      client: "Mira Schneider",
      type: "Soft Summer",
      subtitle: "kühl · gedämpft · elegant",
      advisor: "Eskyna Farbberatung",
      mood: "Ruhige Eleganz mit pudrigen Blaunuancen, kühlen Rosétönen und soften Neutrals.",
      colors: [
        { name: "Dusty Aqua", hex: "#69c7bd", note: "frisch am Gesicht" },
        { name: "Deep Teal", hex: "#057b66", note: "Business-Akzent" },
        { name: "Blueberry", hex: "#3f3f8f", note: "stark statt schwarz" },
        { name: "Mauve", hex: "#8d508e", note: "feminin & ruhig" },
        { name: "Coral Rose", hex: "#f24042", note: "nur leicht gedämpft" },
        { name: "Plum", hex: "#9c1b76", note: "Abendlook" },
        { name: "Raspberry", hex: "#ec1d72", note: "Lippenfarbe" },
        { name: "Muted Pink", hex: "#df6c87", note: "Blusen & Tücher" },
        { name: "Soft Grey", hex: "#8b94a0", note: "Basisfarbe" },
        { name: "Wisteria", hex: "#785aa3", note: "Akzent" },
        { name: "Royal Blue", hex: "#1559ae", note: "Statement" },
        { name: "Taupe Rose", hex: "#a4919b", note: "Neutral" },
        { name: "Smoky Plum", hex: "#826673", note: "Alternative Braun" },
        { name: "Cornflower", hex: "#6f8fd6", note: "Hemden" },
        { name: "Stone", hex: "#92959a", note: "Hosen & Mäntel" },
        { name: "Mist", hex: "#bec8d3", note: "heller Neutral" },
        { name: "Pink Bloom", hex: "#df4f92", note: "Make-up" },
        { name: "Ice Grey", hex: "#e5e9ee", note: "Weiß-Ersatz" },
        { name: "Powder Blue", hex: "#91bee9", note: "Sommerkleid" },
        { name: "Cherry", hex: "#dc173a", note: "festlich" },
        { name: "Petrol", hex: "#16817a", note: "Allrounder" },
        { name: "Ink Blue", hex: "#184d7c", note: "Marine-Ersatz" },
        { name: "Denim", hex: "#38627d", note: "Casual" },
      ],
    },
    {
      id: "clear-winter",
      client: "Lea Wagner",
      type: "Clear Winter",
      subtitle: "kühl · klar · kontrastreich",
      advisor: "Eskyna Farbberatung",
      mood: "Klar, modern und kontraststark: brillante Farben, kühle Basics, viel Leuchtkraft.",
      colors: [
        { name: "Pure White", hex: "#f7f7fb", note: "heller Kontrast" },
        { name: "Black Navy", hex: "#111827", note: "Basis" },
        { name: "Sapphire", hex: "#0051c8", note: "Statement" },
        { name: "Fuchsia", hex: "#e10072", note: "Lippen & Tuch" },
        { name: "Ice Pink", hex: "#f4b6cd", note: "zart" },
        { name: "Emerald", hex: "#008d78", note: "Schmuckfarbe" },
        { name: "Ruby", hex: "#d30f3b", note: "klassisch" },
        { name: "Violet", hex: "#693bb8", note: "kreativ" },
      ],
    },
  ];

  const looks = [
    {
      title: "Business soft",
      items: ["Stone", "Ink Blue", "Muted Pink"],
      vibe: "souverän, ruhig, kompetent",
    },
    {
      title: "Date night",
      items: ["Smoky Plum", "Cherry", "Ice Grey"],
      vibe: "edel, feminin, nicht laut",
    },
    {
      title: "Casual clean",
      items: ["Denim", "Powder Blue", "Dusty Aqua"],
      vibe: "frisch, unkompliziert, hochwertig",
    },
  ];

  const icons = {
    heart:
      "M12 21s-7-4.4-9.5-8.4C.4 9.1 2.1 5 6.1 5c2 0 3.4 1.1 4.1 2.2C10.9 6.1 12.3 5 14.3 5c4 0 5.7 4.1 3.6 7.6C19 16.6 12 21 12 21z",
    camera:
      "M4 7h3l1.4-2h7.2L17 7h3a2 2 0 012 2v9a2 2 0 01-2 2H4a2 2 0 01-2-2V9a2 2 0 012-2zm8 11a4 4 0 100-8 4 4 0 000 8z",
    check: "M9.2 16.2L4.8 11.8l-1.4 1.4 5.8 5.8L21 7.2l-1.4-1.4L9.2 16.2z",
  };

  let state = {
    paletteId: getQueryPalette() || localStorage.getItem("eskyna.palette") || "soft-summer",
    tab: "karte",
    selected: 0,
    favorites: JSON.parse(
      localStorage.getItem("eskyna.favorites") || '["Ink Blue","Petrol","Muted Pink"]'
    ),
  };

  let installPrompt = null;
  let toastTimer = null;

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    installPrompt = event;
  });

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("service-worker.js").catch(() => {});
    });
  }

  function getQueryPalette() {
    const params = new URLSearchParams(window.location.search);
    const value = params.get("palette");
    return palettes.some((p) => p.id === value) ? value : null;
  }

  function palette() {
    return palettes.find((p) => p.id === state.paletteId) || palettes[0];
  }

  function colorByName(name, selectedPalette) {
    return (
      selectedPalette.colors.find((c) => c.name === name) ||
      palettes[0].colors.find((c) => c.name === name) ||
      selectedPalette.colors[0]
    );
  }

  function clover(className = "", soft = false) {
    return `<img src="${CLOVER_SRC}" alt="Eskyna Kleeblatt" title="Eskyna Kleeblatt" class="clover ${soft ? "clover-soft" : ""} ${className}">`;
  }

  function icon(type) {
    return `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="${icons[type] || icons.check}"></path></svg>`;
  }

  function render() {
    const p = palette();
    const active = p.colors[state.selected] || p.colors[0];
    const isFavorite = state.favorites.includes(active.name);
    const app = document.getElementById("app");

    app.innerHTML = `
      <div class="app-shell">
        <header class="app-header">
          <div class="brand-lockup">
            <div class="logo-tile">${clover()}</div>
            <div>
              <p class="kicker">eskyna</p>
              <h1>Meine Farbkarte</h1>
            </div>
          </div>

          <div class="selector" role="tablist" aria-label="Farbtypen">
            ${palettes
              .map(
                (item) => `
              <button type="button" data-palette="${item.id}" class="${item.id === state.paletteId ? "active" : ""}">${item.type}</button>
            `
              )
              .join("")}
          </div>
        </header>

        <main>
          <section class="palette-hero">
            <div class="palette-hero-bg" style="background: radial-gradient(circle at 20% 20%, ${active.hex} 0, transparent 34%), radial-gradient(circle at 85% 15%, rgba(255,255,255,.35) 0, transparent 22%)"></div>
            ${clover("hero-clover")}
            <div class="palette-hero-content">
              <div class="hero-top">
                <div>
                  <p class="client">${p.client}</p>
                  <h2>${p.type}</h2>
                  <p class="subtitle">${p.subtitle}</p>
                </div>
                <button type="button" class="favorite ${isFavorite ? "active" : ""}" data-action="favorite" aria-label="Favorit umschalten">${icon("heart")}</button>
              </div>
              <p class="mood">${p.mood}</p>
              <div class="active-color">
                <div class="active-chip" style="background:${active.hex}"></div>
                <div>
                  <p class="color-name">${active.name}</p>
                  <p class="color-hex">${active.hex}</p>
                  <p class="color-note">${active.note}</p>
                </div>
              </div>
            </div>
          </section>

          <nav class="tabs" aria-label="Bereiche">
            ${["karte", "looks", "shop"]
              .map(
                (tab) => `
              <button type="button" data-tab="${tab}" class="${state.tab === tab ? "active" : ""}">${tab}</button>
            `
              )
              .join("")}
          </nav>

          <section class="panel">${renderPanel(p, active)}</section>
        </main>

        <footer class="app-footer">
          <button type="button" class="primary-btn" data-action="share">${clover()}<span>Karte teilen</span></button>
          <p>Privater Link · erstellt von ${p.advisor}</p>
        </footer>
      </div>
      <div id="toast" class="toast" role="status" aria-live="polite"></div>`;

    bindEvents();
  }

  function renderPanel(p, active) {
    if (state.tab === "looks") {
      return looks
        .map(
          (look) => `
        <button type="button" class="look-card-mobile">
          <div class="look-head">
            <div>
              <h3>${look.title}</h3>
              <p>${look.vibe}</p>
            </div>
            <span>›</span>
          </div>
          <div class="look-color-grid">
            ${look.items.map((name) => `<div style="background:${colorByName(name, p).hex}" title="${name}"></div>`).join("")}
          </div>
        </button>`
        )
        .join("");
    }

    if (state.tab === "shop") {
      return `
        <article class="shop-card">
          <div class="shop-row">
            <div class="shop-icon">${icon("camera")}</div>
            <div>
              <h3>Farbe vergleichen</h3>
              <p>Kleidungsstück fotografieren und neben die Palette legen.</p>
            </div>
          </div>
        </article>
        <article class="shop-card">
          <h3>Shopping-Regeln</h3>
          <ul class="rules">
            <li><span>✓</span><span>Lieber gedämpft als knallig.</span></li>
            <li><span>✓</span><span>Grau, Petrol und Ink Blue ersetzen Schwarz.</span></li>
            <li><span>✓</span><span>Lippenfarben in Beeren- und Rosétönen testen.</span></li>
          </ul>
        </article>`;
    }

    return `
      <div class="panel-head"><h3>Palette</h3><span>${p.colors.length} Farben</span></div>
      <div class="swatch-grid">
        ${p.colors
          .map(
            (color, index) => `
          <button type="button" class="swatch ${index === state.selected ? "active" : ""}" data-color="${index}" style="background:${color.hex}" aria-label="${color.name} ${color.hex}">
            ${index === state.selected ? `<span>${icon("check")}</span>` : ""}
          </button>`
          )
          .join("")}
      </div>
      <article class="selected-card">
        <div class="selected-chip" style="background:${active.hex}"></div>
        <div>
          <h3>${active.name}</h3>
          <p>${active.note}</p>
        </div>
        ${clover("selected-clover", true)}
      </article>`;
  }

  function bindEvents() {
    document.querySelectorAll("[data-palette]").forEach((button) => {
      button.addEventListener("click", () => {
        state.paletteId = button.dataset.palette;
        state.selected = 0;
        localStorage.setItem("eskyna.palette", state.paletteId);
        render();
      });
    });

    document.querySelectorAll("[data-tab]").forEach((button) => {
      button.addEventListener("click", () => {
        state.tab = button.dataset.tab;
        render();
      });
    });

    document.querySelectorAll("[data-color]").forEach((button) => {
      button.addEventListener("click", () => {
        state.selected = Number(button.dataset.color);
        render();
      });
    });

    const favorite = document.querySelector("[data-action='favorite']");
    if (favorite) {
      favorite.addEventListener("click", () => {
        const active = palette().colors[state.selected] || palette().colors[0];
        if (state.favorites.includes(active.name)) {
          state.favorites = state.favorites.filter((name) => name !== active.name);
          showToast("Aus Favoriten entfernt");
        } else {
          state.favorites = [...state.favorites, active.name];
          showToast("Zu Favoriten hinzugefügt");
        }
        localStorage.setItem("eskyna.favorites", JSON.stringify(state.favorites));
        render();
      });
    }

    const share = document.querySelector("[data-action='share']");
    if (share) {
      share.addEventListener("click", async () => {
        const url = `${location.origin}${location.pathname}?palette=${state.paletteId}`;

        if (navigator.share) {
          try {
            await navigator.share({
              title: "Eskyna Farbkarte",
              text: "Meine persönliche Eskyna Farbkarte",
              url,
            });
            return;
          } catch (error) {
            if (error && error.name === "AbortError") return;
          }
        }

        if (installPrompt) {
          installPrompt.prompt();
          installPrompt = null;
          return;
        }

        try {
          await navigator.clipboard.writeText(url);
          showToast("Link kopiert");
        } catch (_) {
          showToast("Link: " + url);
        }
      });
    }
  }

  function showToast(message) {
    const toast = document.getElementById("toast");
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("visible"), 2200);
  }

  render();
})();
