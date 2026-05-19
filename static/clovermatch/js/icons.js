/**
 * ESKYNA Stil-Kleeblatt — line SVG icons (currentColor, gold via CSS).
 */

/** @type {Record<string, string>} */
export const ICONS = {
  color:
    '<path fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" d="M12 3c-2 4-6 5-8 8 2 3 6 4 8 8 2-4 6-5 8-8-2-3-6-4-8-8z"/><circle cx="9" cy="10" r="1.4" fill="currentColor"/><circle cx="14" cy="8" r="1.4" fill="currentColor"/><circle cx="15" cy="14" r="1.4" fill="currentColor"/>',
  "color-swatch":
    '<rect x="4" y="5" width="7" height="14" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.5"/><rect x="11" y="8" width="7" height="11" rx="1.5" fill="currentColor" fill-opacity=".15" stroke="currentColor" stroke-width="1.5"/><rect x="18" y="11" width="4" height="8" rx="1" fill="currentColor" opacity=".85"/>',
  "color-sparkle":
    '<path fill="none" stroke="currentColor" stroke-width="1.5" d="M12 2v4M12 18v4M2 12h4M18 12h4"/><path fill="currentColor" d="M12 7l2.2 4.5 5 .7-3.6 3.5.9 5L12 18.2 7.5 20.7l.9-5L4.8 12.2l5-.7L12 7z"/>',
  form: '<path fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" d="M6 8h12M8 8v11M16 8v11"/><path fill="none" stroke="currentColor" stroke-width="1.5" d="M8 12c2-2 6-2 8 0"/>',
  "form-cut":
    '<path fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" d="M5 6l6 12M19 6l-6 12"/><circle cx="12" cy="12" r="2" fill="currentColor"/>',
  "form-blazer":
    '<path fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" d="M12 4l-5 4v12h10V8l-5-4z"/><path fill="none" stroke="currentColor" stroke-width="1.4" d="M12 8v12M8 11h8"/>',
  "form-drape":
    '<path fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" d="M5 6c3 2 4 8 7 10s5-2 7-4M5 18c4-3 7-3 14 0"/>',
  impact:
    '<path fill="currentColor" d="M12 3l2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.4 6.4 20.2l1.1-6.2L3 9.6l6.2-.9L12 3z" opacity=".92"/>',
  "impact-briefcase":
    '<rect x="4" y="9" width="16" height="11" rx="2" fill="none" stroke="currentColor" stroke-width="1.5"/><path fill="none" stroke="currentColor" stroke-width="1.5" d="M9 9V7a3 3 0 016 0v2"/>',
  "impact-camera":
    '<rect x="3" y="7" width="18" height="13" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="12" cy="13.5" r="3.5" fill="none" stroke="currentColor" stroke-width="1.5"/><path fill="currentColor" d="M9 7l1.5-2h5L16 7"/>',
  life: '<rect x="4" y="5" width="16" height="16" rx="2" fill="none" stroke="currentColor" stroke-width="1.5"/><path fill="none" stroke="currentColor" stroke-width="1.5" d="M4 10h16M9 3v4M15 3v4"/><circle cx="12" cy="15" r="1.5" fill="currentColor"/>',
  "life-hanger":
    '<path fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" d="M6 6c3-2 9-2 12 0M12 6v2"/><path fill="none" stroke="currentColor" stroke-width="1.5" d="M4 20c4-4 12-4 16 0"/>',
  "life-capsule":
    '<rect x="6" y="8" width="12" height="12" rx="2" fill="none" stroke="currentColor" stroke-width="1.5"/><path fill="none" stroke="currentColor" stroke-width="1.5" d="M6 12h12M10 8V6h4v2"/>',
  letgo:
    '<path fill="none" stroke="currentColor" stroke-width="1.6" d="M4 6h16l-6 7v5H10v-5L4 6z"/><path stroke="currentColor" stroke-width="1.8" d="M9 11l6 6M15 11l-6 6"/>',
  "letgo-sale":
    '<path fill="none" stroke="currentColor" stroke-width="1.5" d="M6 10l3-6h6l3 6"/><circle cx="9" cy="18" r="1.5" fill="currentColor"/><circle cx="17" cy="18" r="1.5" fill="currentColor"/><path stroke="currentColor" stroke-width="1.6" d="M14 4l4 4-6 6"/>',
  "letgo-trend":
    '<path fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" d="M4 16l5-6 4 3 7-9"/><path fill="none" stroke="currentColor" stroke-width="1.5" d="M15 4h5v5"/>',
  "letgo-duplicate":
    '<rect x="4" y="6" width="10" height="10" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.5"/><rect x="10" y="10" width="10" height="10" rx="1.5" fill="currentColor" fill-opacity=".18" stroke="currentColor" stroke-width="1.5"/>',
  "letgo-unlink":
    '<path fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" d="M9 12a4 4 0 014-4h2M15 12a4 4 0 01-4 4h-2"/><path stroke="currentColor" stroke-width="1.8" d="M8 8l8 8"/>',
  "letgo-influencer":
    '<rect x="7" y="3" width="10" height="18" rx="2" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="12" cy="17" r="1" fill="currentColor"/><rect x="9" y="6" width="6" height="8" rx="1" fill="currentColor" fill-opacity=".22" stroke="currentColor" stroke-width="1.2"/>',
  "letgo-cart":
    '<path fill="none" stroke="currentColor" stroke-width="1.5" d="M4 5h2l2 10h9l2-7H8"/><circle cx="10" cy="19" r="1.5" fill="currentColor"/><circle cx="17" cy="19" r="1.5" fill="currentColor"/><path stroke="currentColor" stroke-width="1.8" d="M6 3l-2 2"/>',
  ready:
    '<path fill="currentColor" d="M12 4l2.5 5 5.5.8-4 3.9 1 5.5L12 16.8 6.9 19.2l1-5.5-4-3.9 5.5-.8L12 4z"/><circle cx="12" cy="12" r="3" fill="none" stroke="#17100a" stroke-width="1.2"/>',
};

export const FACET_ICONS = {
  Klarheit: "color",
  Farbtyp: "color-swatch",
  Sichtbarkeit: "color-sparkle",
  Silhouette: "form-cut",
  Struktur: "form-blazer",
  Material: "form-drape",
  Business: "impact-briefcase",
  Visibility: "impact-camera",
  Auftritt: "impact",
  Alltag: "life",
  Garderobe: "life-hanger",
  Capsule: "life-capsule",
  Fehlkauf: "letgo-sale",
  Impuls: "letgo-trend",
  Chaos: "letgo-duplicate",
  Prüfung: "letgo-unlink",
  Trend: "letgo-influencer",
  Druck: "letgo-cart",
};

const TYPE_ICONS = {
  color: "color",
  form: "form",
  impact: "impact",
  life: "life",
  letgo: "letgo",
};

/**
 * @param {string} name
 * @param {number} [size]
 * @param {string} [extraClass]
 */
export function iconHtml(name, size = 32, extraClass = "") {
  const body = ICONS[name] || ICONS.color;
  const cls = ["game-icon", `game-icon--${name}`, extraClass].filter(Boolean).join(" ");
  return (
    `<span class="${cls}" style="--icon-size:${size}px" aria-hidden="true">` +
    `<svg viewBox="0 0 24 24" width="${size}" height="${size}" focusable="false">${body}</svg></span>`
  );
}

/**
 * @param {{ type: string, facet?: string, hazard?: boolean }} item
 * @param {number} [size]
 */
export function iconForItem(item, size = 40) {
  const name = item.hazard
    ? FACET_ICONS[item.facet] || "letgo"
    : FACET_ICONS[item.facet] || TYPE_ICONS[item.type] || "color";
  return iconHtml(name, size, item.hazard ? "game-icon--hazard" : "");
}

/** Fill elements marked with data-icon-slot="icon-name". */
export function applyStaticIcons() {
  document.querySelectorAll("[data-icon-slot]").forEach((slot) => {
    const name = slot.dataset.iconSlot;
    const size = Number(slot.dataset.iconSize) || 22;
    const body = ICONS[name] || ICONS.color;
    slot.innerHTML = `<svg viewBox="0 0 24 24" width="${size}" height="${size}" focusable="false">${body}</svg>`;
    slot.classList.add("game-icon", `game-icon--${name}`);
    slot.style.setProperty("--icon-size", `${size}px`);
    slot.setAttribute("aria-hidden", "true");
  });
}
