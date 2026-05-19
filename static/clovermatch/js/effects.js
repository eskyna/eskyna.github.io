import { LEAF_IDS } from "./config.js";
import { $ } from "./dom.js";
import { game } from "./state.js";

export function animateToken(type) {
  const token = $("token");
  token.classList.add("fly-" + type);
  setTimeout(() => {
    token.className = "token" + (game.current && game.current.hazard ? " hazard" : "");
  }, 310);
}

export function flash(type, good) {
  if (type === "letgo") {
    const f = $("filter");
    f.classList.add("flash");
    setTimeout(() => f.classList.remove("flash"), 300);
    return;
  }
  const id = LEAF_IDS[type];
  if (!id) return;
  const el = $(id);
  el.classList.add(good ? "flash" : "bad");
  setTimeout(() => el.classList.remove("flash", "bad"), 310);
}

export function sparkles() {
  const board = $("board");
  for (let i = 0; i < 14; i++) {
    const p = document.createElement("span");
    p.className = "particle";
    p.style.left = "50%";
    p.style.top = "50%";
    const a = Math.random() * Math.PI * 2;
    const d = 80 + Math.random() * 150;
    p.style.setProperty("--x", Math.cos(a) * d + "px");
    p.style.setProperty("--y", Math.sin(a) * d + "px");
    board.appendChild(p);
    setTimeout(() => p.remove(), 750);
  }
}
