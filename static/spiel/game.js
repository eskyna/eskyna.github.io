(() => {
  "use strict";

  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");

  const ui = {
    scoreText: document.getElementById("scoreText"),
    bestText: document.getElementById("bestText"),
    levelText: document.getElementById("levelText"),
    startOverlay: document.getElementById("startOverlay"),
    pauseOverlay: document.getElementById("pauseOverlay"),
    endOverlay: document.getElementById("endOverlay"),
    startButton: document.getElementById("startButton"),
    resumeButton: document.getElementById("resumeButton"),
    restartButton: document.getElementById("restartButton"),
    jumpButton: document.getElementById("jumpButton"),
    duckButton: document.getElementById("duckButton"),
    liveStatus: document.getElementById("liveStatus"),
    resultTitle: document.getElementById("resultTitle"),
    resultText: document.getElementById("resultText"),
    finalScore: document.getElementById("finalScore"),
    finalItems: document.getElementById("finalItems"),
    finalBest: document.getElementById("finalBest"),
  };

  const W = 960;
  const H = 420;
  const GROUND_Y = 334;
  const STORAGE_KEY = "eskyna-style-run-highscore-v1";
  const ASSET_URLS = {
    natalia: "https://eskyna.com/images/Natalia_white_hero.png",
    clover: "https://eskyna.com/images/sign.png",
  };

  const assets = {
    natalia: createGameImage(ASSET_URLS.natalia),
    clover: createGameImage(ASSET_URLS.clover),
  };

  const itemTypes = [
    { key: "colors", label: "Farbkarte", icon: "◆", points: 46, color: "#b7d9c2", y: 222 },
    { key: "outfits", label: "Outfit-Idee", icon: "✦", points: 58, color: "#e9b9aa", y: 184 },
    { key: "accessories", label: "Accessoire", icon: "●", points: 38, color: "#f1d6a6", y: 250 },
    { key: "wardrobe", label: "Klarheit", icon: "✓", points: 52, color: "#c8dbe8", y: 204 },
  ];

  const obstacleTypes = [
    { key: "badBuy", label: "Fehlkauf", kind: "ground", w: 52, h: 62, color: "#d98d7d" },
    { key: "time", label: "Zeitdruck", kind: "ground", w: 48, h: 72, color: "#d1aa62" },
    { key: "chaos", label: "Chaos-Schrank", kind: "ground", w: 70, h: 86, color: "#8f7a68" },
    { key: "trend", label: "Trend-Falle", kind: "air", w: 128, h: 34, color: "#b28ac9" },
  ];

  const levelLabels = [
    { at: 0, label: "Morgenroutine" },
    { at: 900, label: "Meeting-fit" },
    { at: 1900, label: "Capsule-Modus" },
    { at: 3200, label: "EStyle Flow" },
    { at: 5200, label: "Stil-Souveränität" },
  ];

  const state = {
    mode: "ready",
    lastFrame: 0,
    elapsed: 0,
    score: 0,
    distanceScore: 0,
    styleScore: 0,
    best: readBest(),
    speed: 290,
    nextObstacleIn: 650,
    nextItemIn: 420,
    obstacles: [],
    items: [],
    particles: [],
    clouds: [],
    floorDots: [],
    collected: {
      colors: 0,
      outfits: 0,
      accessories: 0,
      wardrobe: 0,
    },
    totalItems: 0,
    duckHeld: false,
    runStarted: false,
    announceAt: 0,
  };

  const player = {
    x: 88,
    y: GROUND_Y - 96,
    w: 68,
    h: 96,
    normalH: 96,
    duckH: 60,
    vy: 0,
    onGround: true,
    isDucking: false,
    blink: 0,
  };

  function createGameImage(src) {
    const img = new Image();
    const asset = { img, loaded: false, failed: false };
    img.onload = () => {
      asset.loaded = true;
      asset.failed = false;
      draw();
    };
    img.onerror = () => {
      asset.loaded = false;
      asset.failed = true;
    };
    img.decoding = "async";
    img.src = src;
    return asset;
  }

  function readBest() {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? Number(raw) : 0;
      return Number.isFinite(parsed) ? parsed : 0;
    } catch (_) {
      return 0;
    }
  }

  function writeBest(value) {
    try {
      window.localStorage.setItem(STORAGE_KEY, String(value));
    } catch (_) {
      // Non-critical. The game works without localStorage.
    }
  }

  function resizeCanvas() {
    const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    canvas.width = Math.floor(W * dpr);
    canvas.height = Math.floor(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function resetRun() {
    state.mode = "running";
    state.lastFrame = performance.now();
    state.elapsed = 0;
    state.score = 0;
    state.distanceScore = 0;
    state.styleScore = 0;
    state.speed = 290;
    state.nextObstacleIn = 720;
    state.nextItemIn = 360;
    state.obstacles = [];
    state.items = [];
    state.particles = [];
    state.collected = { colors: 0, outfits: 0, accessories: 0, wardrobe: 0 };
    state.totalItems = 0;
    state.duckHeld = false;
    state.runStarted = true;
    state.announceAt = 0;
    player.y = GROUND_Y - player.normalH;
    player.vy = 0;
    player.onGround = true;
    player.isDucking = false;
    player.h = player.normalH;
    hideOverlay(ui.startOverlay);
    hideOverlay(ui.endOverlay);
    hideOverlay(ui.pauseOverlay);
    setLiveStatus(
      "Spiel gestartet. Sammle Kleeblätter für Stil-Sicherheit und vermeide Fehlkäufe."
    );
    updateHud();
    requestAnimationFrame(loop);
  }

  function togglePause(force) {
    if (state.mode !== "running" && state.mode !== "paused") return;
    const paused = typeof force === "boolean" ? force : state.mode !== "paused";
    state.mode = paused ? "paused" : "running";
    if (paused) {
      showOverlay(ui.pauseOverlay);
      setLiveStatus("Spiel pausiert.");
    } else {
      state.lastFrame = performance.now();
      hideOverlay(ui.pauseOverlay);
      setLiveStatus("Spiel läuft weiter.");
      requestAnimationFrame(loop);
    }
  }

  function showOverlay(el) {
    el.classList.add("overlay--visible");
    el.setAttribute("aria-hidden", "false");
  }

  function hideOverlay(el) {
    el.classList.remove("overlay--visible");
    el.setAttribute("aria-hidden", "true");
  }

  function setLiveStatus(text) {
    ui.liveStatus.textContent = text;
  }

  function updateHud() {
    ui.scoreText.textContent = Math.floor(state.score).toLocaleString("de-DE");
    ui.bestText.textContent = Math.floor(state.best).toLocaleString("de-DE");
    ui.levelText.textContent = getLevelLabel();
  }

  function getLevelLabel() {
    let label = levelLabels[0].label;
    for (const level of levelLabels) {
      if (state.score >= level.at) label = level.label;
    }
    return label;
  }

  function jump() {
    if (state.mode === "ready" || state.mode === "gameover") {
      resetRun();
      return;
    }
    if (state.mode === "paused") {
      togglePause(false);
      return;
    }
    if (!player.onGround) return;
    player.vy = -760;
    player.onGround = false;
    player.isDucking = false;
    player.h = player.normalH;
    burst(player.x + player.w / 2, GROUND_Y - 4, "#a06a43", 6, -80);
  }

  function setDuck(active) {
    state.duckHeld = active;
    if (state.mode !== "running") return;
    if (!player.onGround) return;
    player.isDucking = active;
    player.h = active ? player.duckH : player.normalH;
    player.y = GROUND_Y - player.h;
  }

  function spawnObstacle() {
    const scoreBias = Math.min(1, state.score / 4200);
    let pool = obstacleTypes;
    if (Math.random() < 0.14 + scoreBias * 0.18) {
      pool = [obstacleTypes[2], obstacleTypes[3], obstacleTypes[0]];
    }
    const type = pool[Math.floor(Math.random() * pool.length)];
    const y = type.kind === "air" ? GROUND_Y - 148 - Math.random() * 18 : GROUND_Y - type.h;
    state.obstacles.push({
      ...type,
      x: W + 30,
      y,
      passed: false,
      wobble: Math.random() * Math.PI * 2,
    });
  }

  function spawnItemCluster() {
    const type = itemTypes[Math.floor(Math.random() * itemTypes.length)];
    const clusterSize = Math.random() < 0.34 ? 3 : 2;
    const baseY = type.y + (Math.random() - 0.5) * 22;
    const startX = W + 40;

    for (let i = 0; i < clusterSize; i += 1) {
      state.items.push({
        ...type,
        x: startX + i * 46,
        y: baseY + Math.sin(i) * 18,
        r: 17,
        spin: Math.random() * Math.PI * 2,
        collected: false,
      });
    }
  }

  function update(dt) {
    state.elapsed += dt;
    state.speed = Math.min(610, 290 + state.elapsed * 0.018 + state.score * 0.018);
    state.distanceScore += dt * 0.045;
    state.score = state.distanceScore + state.styleScore;

    updatePlayer(dt);
    updateSpawns(dt);
    updateEntities(dt);
    updateParticles(dt);
    updateBackdrop(dt);
    handleCollisions();

    if (state.score > state.announceAt + 850) {
      state.announceAt = state.score;
      setLiveStatus(`${getLevelLabel()}. ${Math.floor(state.score)} Stil-Sicherheits-Punkte.`);
    }

    updateHud();
  }

  function updatePlayer(dt) {
    const gravity = 2100;
    player.vy += gravity * (dt / 1000);
    player.y += player.vy * (dt / 1000);

    const targetH = state.duckHeld && player.onGround ? player.duckH : player.normalH;
    if (targetH !== player.h) {
      player.h += (targetH - player.h) * Math.min(1, dt / 80);
    }

    if (player.y + player.h >= GROUND_Y) {
      player.y = GROUND_Y - player.h;
      player.vy = 0;
      player.onGround = true;
      player.isDucking = state.duckHeld;
    } else {
      player.onGround = false;
      player.isDucking = false;
    }

    player.blink += dt;
  }

  function updateSpawns(dt) {
    state.nextObstacleIn -= dt;
    state.nextItemIn -= dt;

    if (state.nextObstacleIn <= 0) {
      spawnObstacle();
      const minGap = Math.max(620, 1120 - state.speed * 0.9);
      const maxGap = Math.max(860, 1540 - state.speed * 1.1);
      state.nextObstacleIn = minGap + Math.random() * (maxGap - minGap);
    }

    if (state.nextItemIn <= 0) {
      spawnItemCluster();
      state.nextItemIn = 820 + Math.random() * 880;
    }
  }

  function updateEntities(dt) {
    const dx = state.speed * (dt / 1000);
    for (const obstacle of state.obstacles) {
      obstacle.x -= dx;
      obstacle.wobble += dt * 0.004;
      if (!obstacle.passed && obstacle.x + obstacle.w < player.x) {
        obstacle.passed = true;
        state.styleScore += 14;
      }
    }
    for (const item of state.items) {
      item.x -= dx;
      item.spin += dt * 0.006;
    }
    state.obstacles = state.obstacles.filter((obstacle) => obstacle.x + obstacle.w > -60);
    state.items = state.items.filter((item) => item.x + item.r > -60 && !item.collected);
  }

  function updateParticles(dt) {
    for (const particle of state.particles) {
      particle.life -= dt;
      particle.x += particle.vx * (dt / 1000);
      particle.y += particle.vy * (dt / 1000);
      particle.vy += 650 * (dt / 1000);
      particle.alpha = Math.max(0, particle.life / particle.maxLife);
    }
    state.particles = state.particles.filter((particle) => particle.life > 0);
  }

  function updateBackdrop(dt) {
    if (!state.clouds.length) {
      for (let i = 0; i < 5; i += 1) {
        state.clouds.push({
          x: i * 225 + Math.random() * 50,
          y: 48 + Math.random() * 64,
          s: 0.7 + Math.random() * 0.8,
        });
      }
    }
    if (!state.floorDots.length) {
      for (let i = 0; i < 20; i += 1) {
        state.floorDots.push({
          x: i * 62,
          y: GROUND_Y + 28 + Math.random() * 36,
          r: 1 + Math.random() * 2,
        });
      }
    }
    const dx = state.speed * (dt / 1000);
    for (const cloud of state.clouds) {
      cloud.x -= dx * 0.12 * cloud.s;
      if (cloud.x < -100) {
        cloud.x = W + 60 + Math.random() * 120;
        cloud.y = 48 + Math.random() * 64;
      }
    }
    for (const dot of state.floorDots) {
      dot.x -= dx;
      if (dot.x < -20) {
        dot.x = W + Math.random() * 80;
        dot.y = GROUND_Y + 28 + Math.random() * 36;
      }
    }
  }

  function handleCollisions() {
    const hitbox = getPlayerHitbox();

    for (const item of state.items) {
      if (circleRectCollision(item.x, item.y, item.r, hitbox)) {
        item.collected = true;
        state.collected[item.key] += 1;
        state.totalItems += 1;
        state.styleScore += item.points;
        burst(item.x, item.y, "#d5af60", 10, -170);
      }
    }

    for (const obstacle of state.obstacles) {
      const padding = obstacle.kind === "air" ? 5 : 8;
      const rect = {
        x: obstacle.x + padding,
        y: obstacle.y + padding,
        w: obstacle.w - padding * 2,
        h: obstacle.h - padding * 2,
      };
      if (rectsOverlap(hitbox, rect)) {
        endGame(obstacle.label);
        return;
      }
    }
  }

  function getPlayerHitbox() {
    const crouchOffset = player.isDucking ? 14 : 12;
    return {
      x: player.x + 16,
      y: player.y + crouchOffset,
      w: player.w - 28,
      h: player.h - crouchOffset - 8,
    };
  }

  function rectsOverlap(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }

  function circleRectCollision(cx, cy, radius, rect) {
    const closestX = clamp(cx, rect.x, rect.x + rect.w);
    const closestY = clamp(cy, rect.y, rect.y + rect.h);
    const dx = cx - closestX;
    const dy = cy - closestY;
    return dx * dx + dy * dy <= radius * radius;
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function burst(x, y, color, count, lift) {
    for (let i = 0; i < count; i += 1) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 70 + Math.random() * 150;
      state.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed + lift * Math.random(),
        r: 2 + Math.random() * 4,
        color,
        life: 420 + Math.random() * 320,
        maxLife: 740,
        alpha: 1,
      });
    }
  }

  function endGame(reason) {
    state.mode = "gameover";
    const rounded = Math.floor(state.score);
    if (rounded > state.best) {
      state.best = rounded;
      writeBest(rounded);
    }
    setResultCopy(reason);
    ui.finalScore.textContent = rounded.toLocaleString("de-DE");
    ui.finalItems.textContent = state.totalItems.toLocaleString("de-DE");
    ui.finalBest.textContent = Math.floor(state.best).toLocaleString("de-DE");
    updateHud();
    showOverlay(ui.endOverlay);
    setLiveStatus(`Spiel beendet durch ${reason}. Ergebnis: ${rounded} Punkte.`);
  }

  function setResultCopy(reason) {
    const entries = Object.entries(state.collected).sort((a, b) => b[1] - a[1]);
    const [topKey, topCount] = entries[0];
    const copy = {
      colors: {
        title: "Du hast ein gutes Farbgefühl.",
        text: "Du hast besonders oft harmonische Farbkarten gewählt. Dein Style-Impuls: Eine EStyle-ID kann dir helfen, deine besten Farben noch schneller zu erkennen.",
      },
      outfits: {
        title: "Du denkst in Kombinationen.",
        text: "Du hast viele Outfit-Ideen gesammelt. Dein Style-Impuls: Mit digitaler Kombinationshilfe werden aus Einzelteilen schneller tragbare Looks.",
      },
      accessories: {
        title: "Du setzt Akzente bewusst.",
        text: "Du hast viele Accessoires mitgenommen. Dein Style-Impuls: Kleine Details können Outfits klarer, persönlicher und alltagstauglicher machen.",
      },
      wardrobe: {
        title: "Du suchst System im Schrank.",
        text: "Du hast besonders viel Klarheit gesammelt. Dein Style-Impuls: Ein Garderoben-Manager kann Chaos reduzieren und Fehlkäufe vermeiden.",
      },
    };

    if (!topCount) {
      ui.resultTitle.textContent = "Morgenstress erkannt.";
      ui.resultText.textContent = `Die ${reason} hat dich erwischt. Dein Style-Impuls: Weniger Shopping-Stress beginnt mit klaren Kriterien für Farben, Schnitte und Anlässe.`;
      return;
    }

    ui.resultTitle.textContent = copy[topKey].title;
    ui.resultText.textContent = `${copy[topKey].text} Herausforderung diesmal: ${reason}.`;
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    drawSky();
    drawRoomLines();
    drawClouds();
    drawGround();
    drawItems();
    drawObstacles();
    drawPlayer();
    drawParticles();
    drawHintText();
  }

  function drawSky() {
    const gradient = ctx.createLinearGradient(0, 0, 0, H);
    gradient.addColorStop(0, "#fffaf2");
    gradient.addColorStop(0.62, "#f7ead8");
    gradient.addColorStop(1, "#ead9c3");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = "rgba(183, 217, 194, 0.30)";
    blob(84, 72, 90, 52);
    ctx.fillStyle = "rgba(233, 185, 170, 0.30)";
    blob(812, 72, 124, 64);
  }

  function drawRoomLines() {
    ctx.save();
    ctx.strokeStyle = "rgba(21, 17, 13, 0.08)";
    ctx.lineWidth = 2;
    for (let i = 0; i < 5; i += 1) {
      const x = 180 + i * 170 - ((state.elapsed * 0.012) % 170);
      ctx.beginPath();
      ctx.moveTo(x, 32);
      ctx.lineTo(x - 80, GROUND_Y);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawClouds() {
    ctx.save();
    for (const cloud of state.clouds) {
      ctx.fillStyle = "rgba(255, 255, 255, 0.68)";
      roundedRect(cloud.x, cloud.y, 86 * cloud.s, 30 * cloud.s, 18 * cloud.s);
      ctx.fillStyle = "rgba(255, 252, 247, 0.80)";
      ctx.beginPath();
      ctx.arc(cloud.x + 22 * cloud.s, cloud.y + 2 * cloud.s, 20 * cloud.s, 0, Math.PI * 2);
      ctx.arc(cloud.x + 49 * cloud.s, cloud.y - 6 * cloud.s, 27 * cloud.s, 0, Math.PI * 2);
      ctx.arc(cloud.x + 74 * cloud.s, cloud.y + 5 * cloud.s, 18 * cloud.s, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  function drawGround() {
    ctx.fillStyle = "#e8d0b7";
    ctx.fillRect(0, GROUND_Y, W, H - GROUND_Y);
    ctx.fillStyle = "rgba(255, 250, 243, 0.48)";
    ctx.fillRect(0, GROUND_Y, W, 12);
    ctx.strokeStyle = "rgba(21, 17, 13, 0.12)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, GROUND_Y + 1);
    ctx.lineTo(W, GROUND_Y + 1);
    ctx.stroke();

    ctx.fillStyle = "rgba(21, 17, 13, 0.16)";
    for (const dot of state.floorDots) {
      ctx.beginPath();
      ctx.arc(dot.x, dot.y, dot.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawItems() {
    for (const item of state.items) {
      ctx.save();
      ctx.translate(item.x, item.y);
      ctx.rotate(item.spin * 0.28);

      ctx.fillStyle = item.color;
      ctx.globalAlpha = 0.68;
      ctx.beginPath();
      ctx.arc(0, 0, 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;

      ctx.strokeStyle = "rgba(21, 17, 13, 0.12)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, 22, 0, Math.PI * 2);
      ctx.stroke();

      if (assets.clover.loaded) {
        ctx.shadowColor = "rgba(111, 72, 28, 0.26)";
        ctx.shadowBlur = 10;
        ctx.shadowOffsetY = 4;
        ctx.drawImage(assets.clover.img, -17, -17, 34, 34);
        ctx.shadowBlur = 0;
        ctx.shadowOffsetY = 0;
      } else {
        drawCloverFallback(0, 0, 15);
      }

      ctx.fillStyle = "#15110d";
      ctx.font = "900 11px Inter, system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(item.icon, 0, 1);
      ctx.restore();

      ctx.save();
      ctx.fillStyle = "rgba(21, 17, 13, 0.42)";
      ctx.font = "700 11px Inter, system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(item.label, item.x, item.y - 30);
      ctx.restore();
    }
  }

  function drawCloverFallback(x, y, size) {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = "#d5af60";
    for (let i = 0; i < 4; i += 1) {
      ctx.save();
      ctx.rotate((i * Math.PI) / 2);
      ctx.beginPath();
      ctx.ellipse(0, -size * 0.46, size * 0.38, size * 0.58, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.22, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawObstacles() {
    for (const obstacle of state.obstacles) {
      if (obstacle.key === "trend") drawTrendTrap(obstacle);
      if (obstacle.key === "badBuy") drawBadBuy(obstacle);
      if (obstacle.key === "time") drawTimePressure(obstacle);
      if (obstacle.key === "chaos") drawChaosWardrobe(obstacle);
    }
  }

  function drawTrendTrap(o) {
    const y = o.y + Math.sin(o.wobble) * 2;
    ctx.save();
    ctx.fillStyle = o.color;
    ctx.strokeStyle = "rgba(21, 17, 13, 0.2)";
    ctx.lineWidth = 2;
    roundedRect(o.x, y, o.w, o.h, 18, true, true);
    ctx.fillStyle = "#fffaf3";
    ctx.font = "850 13px Inter, system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("TREND-FALLE", o.x + o.w / 2, y + o.h / 2 + 1);
    drawLabel(o.label, o.x + o.w / 2, y - 11);
    ctx.restore();
  }

  function drawBadBuy(o) {
    ctx.save();
    ctx.fillStyle = o.color;
    roundedRect(o.x + 8, o.y + 18, o.w - 16, o.h - 15, 8, true, false);
    ctx.strokeStyle = "rgba(21, 17, 13, 0.28)";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(o.x + o.w / 2, o.y + 20, 13, Math.PI, 0);
    ctx.stroke();
    ctx.strokeStyle = "#fff8ee";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(o.x + 20, o.y + 35);
    ctx.lineTo(o.x + o.w - 20, o.y + 52);
    ctx.moveTo(o.x + o.w - 20, o.y + 35);
    ctx.lineTo(o.x + 20, o.y + 52);
    ctx.stroke();
    drawLabel(o.label, o.x + o.w / 2, o.y - 8);
    ctx.restore();
  }

  function drawTimePressure(o) {
    ctx.save();
    ctx.fillStyle = "#fffaf3";
    ctx.strokeStyle = o.color;
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.arc(o.x + o.w / 2, o.y + 30, 23, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = "#15110d";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(o.x + o.w / 2, o.y + 30);
    ctx.lineTo(o.x + o.w / 2, o.y + 14);
    ctx.moveTo(o.x + o.w / 2, o.y + 30);
    ctx.lineTo(o.x + o.w / 2 + 12, o.y + 38);
    ctx.stroke();
    ctx.fillStyle = o.color;
    roundedRect(o.x + 12, o.y + 56, o.w - 24, 13, 7, true, false);
    drawLabel(o.label, o.x + o.w / 2, o.y - 8);
    ctx.restore();
  }

  function drawChaosWardrobe(o) {
    ctx.save();
    ctx.fillStyle = o.color;
    roundedRect(o.x, o.y, o.w, o.h, 9, true, false);
    ctx.fillStyle = "rgba(255, 250, 243, 0.25)";
    ctx.fillRect(o.x + o.w / 2 - 2, o.y + 8, 4, o.h - 16);
    ctx.fillStyle = "#f1d6a6";
    roundedRect(o.x + 10, o.y + 18, 18, 9, 4, true, false);
    ctx.fillStyle = "#e9b9aa";
    roundedRect(o.x + 38, o.y + 34, 19, 9, 4, true, false);
    ctx.fillStyle = "#b7d9c2";
    roundedRect(o.x + 12, o.y + 54, 22, 9, 4, true, false);
    ctx.strokeStyle = "rgba(255, 250, 243, 0.84)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(o.x + 18, o.y + 35);
    ctx.lineTo(o.x + 28, o.y + 44);
    ctx.lineTo(o.x + 17, o.y + 49);
    ctx.moveTo(o.x + 46, o.y + 55);
    ctx.lineTo(o.x + 54, o.y + 65);
    ctx.stroke();
    drawLabel(o.label, o.x + o.w / 2, o.y - 8);
    ctx.restore();
  }

  function drawLabel(text, x, y) {
    ctx.save();
    ctx.font = "800 12px Inter, system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const width = ctx.measureText(text).width + 18;
    ctx.fillStyle = "rgba(255, 250, 243, 0.92)";
    roundedRect(x - width / 2, y - 11, width, 22, 11, true, false);
    ctx.fillStyle = "rgba(21, 17, 13, 0.76)";
    ctx.fillText(text, x, y + 1);
    ctx.restore();
  }

  function drawPlayer() {
    ctx.save();
    const bob = player.onGround ? Math.sin(state.elapsed * 0.016) * 2 : 0;
    const x = player.x;
    const y = player.y + bob;
    const h = player.h;

    ctx.fillStyle = "rgba(21, 17, 13, 0.18)";
    ctx.beginPath();
    ctx.ellipse(x + 35, GROUND_Y + 8, player.isDucking ? 35 : 29, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    if (assets.natalia.loaded) {
      drawNataliaRunner(x, y, h);
    } else {
      drawFallbackRunner(x, y, h);
    }

    drawRunningLegs(x, y, h);
    ctx.restore();
  }

  function drawNataliaRunner(x, y, h) {
    const duck = player.isDucking;
    const drawW = duck ? 76 : 74;
    const drawH = duck ? 74 : 110;
    const drawX = x - 3;
    const drawY = GROUND_Y - drawH + (duck ? 1 : -3);
    const img = assets.natalia.img;

    const sx = img.width * 0.235;
    const sy = img.height * 0.055;
    const sw = img.width * 0.555;
    const sh = img.height * 0.925;

    ctx.save();
    ctx.translate(drawX + drawW / 2, drawY + drawH / 2);
    if (duck) {
      ctx.rotate(-0.05);
      ctx.scale(1.04, 0.86);
    }
    ctx.translate(-(drawX + drawW / 2), -(drawY + drawH / 2));

    ctx.shadowColor = "rgba(21, 17, 13, 0.28)";
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 3;
    ctx.drawImage(img, sx, sy, sw, sh, drawX, drawY, drawW, drawH);

    ctx.shadowColor = "rgba(255, 250, 243, 0.95)";
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.filter = "saturate(1.18) contrast(1.08)";
    ctx.drawImage(img, sx, sy, sw, sh, drawX, drawY, drawW, drawH);

    ctx.filter = "none";
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    ctx.strokeStyle = "rgba(21, 17, 13, 0.55)";
    ctx.lineWidth = 2;
    roundedRect(drawX + 8, drawY + 7, drawW - 16, drawH - 8, 20, false, true);

    ctx.fillStyle = "rgba(255, 250, 243, 0.88)";
    roundedRect(drawX + 7, drawY + drawH - 25, 58, 17, 9, true, false);
    ctx.fillStyle = "rgba(21, 17, 13, 0.72)";
    ctx.font = "900 9px Inter, system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Natalia", drawX + 36, drawY + drawH - 16);
    ctx.restore();

    ctx.save();
    const armSwing = Math.sin(state.elapsed * 0.021) * 4;
    ctx.strokeStyle = "#d5af60";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(x + 16, y + h * 0.45);
    ctx.lineTo(x + 3, y + h * 0.55 + armSwing);
    ctx.moveTo(x + 52, y + h * 0.45);
    ctx.lineTo(x + 65, y + h * 0.55 - armSwing);
    ctx.stroke();
    ctx.restore();
  }

  function drawFallbackRunner(x, y, h) {
    ctx.fillStyle = "#15110d";
    roundedRect(x + 17, y + 22, 34, h - 20, 16, true, false);
    ctx.fillStyle = "#f1d6a6";
    roundedRect(x + 18, y + 2, 32, 32, 16, true, false);
    ctx.fillStyle = "#211711";
    roundedRect(x + 12, y + 6, 44, 14, 9, true, false);
    ctx.fillStyle = "#fff8ee";
    ctx.beginPath();
    ctx.arc(x + 39, y + 18, 2.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#d5af60";
    drawCloverFallback(x + 34, y + 55, 9);
  }

  function drawRunningLegs(x, y, h) {
    ctx.save();
    ctx.strokeStyle = "#15110d";
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.beginPath();
    if (player.isDucking) {
      ctx.moveTo(x + 20, y + h - 10);
      ctx.lineTo(x + 5, y + h - 2);
      ctx.moveTo(x + 48, y + h - 10);
      ctx.lineTo(x + 65, y + h - 2);
    } else {
      const stride = Math.sin(state.elapsed * 0.025) * 9;
      ctx.moveTo(x + 26, y + h - 11);
      ctx.lineTo(x + 22 + stride, GROUND_Y);
      ctx.moveTo(x + 44, y + h - 11);
      ctx.lineTo(x + 46 - stride, GROUND_Y);
    }
    ctx.stroke();
    ctx.restore();
  }

  function drawParticles() {
    ctx.save();
    for (const particle of state.particles) {
      ctx.globalAlpha = particle.alpha;
      ctx.fillStyle = particle.color;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  function drawHintText() {
    if (state.mode !== "running") return;
    ctx.save();
    ctx.globalAlpha = Math.max(0, 1 - state.elapsed / 5500);
    ctx.fillStyle = "rgba(21, 17, 13, 0.58)";
    ctx.font = "800 14px Inter, system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(
      "Leertaste: springen · ↓: ducken · sammle Kleeblätter für Stil-Sicherheit",
      W / 2,
      34
    );
    ctx.restore();
  }

  function roundedRect(x, y, w, h, r, fill = true, stroke = false) {
    const radius = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + w, y, x + w, y + h, radius);
    ctx.arcTo(x + w, y + h, x, y + h, radius);
    ctx.arcTo(x, y + h, x, y, radius);
    ctx.arcTo(x, y, x + w, y, radius);
    ctx.closePath();
    if (fill) ctx.fill();
    if (stroke) ctx.stroke();
  }

  function blob(x, y, w, h) {
    ctx.beginPath();
    ctx.ellipse(x, y, w, h, -0.18, 0, Math.PI * 2);
    ctx.fill();
  }

  function loop(now) {
    if (state.mode !== "running") {
      draw();
      return;
    }
    const dt = Math.min(34, now - state.lastFrame || 16.7);
    state.lastFrame = now;
    update(dt);
    draw();
    requestAnimationFrame(loop);
  }

  function bindEvents() {
    ui.startButton.addEventListener("click", resetRun);
    ui.restartButton.addEventListener("click", resetRun);
    ui.resumeButton.addEventListener("click", () => togglePause(false));
    ui.jumpButton.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      jump();
    });
    ui.duckButton.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      setDuck(true);
    });
    ui.duckButton.addEventListener("pointerup", () => setDuck(false));
    ui.duckButton.addEventListener("pointercancel", () => setDuck(false));
    ui.duckButton.addEventListener("pointerleave", () => setDuck(false));

    window.addEventListener("keydown", (event) => {
      if (event.code === "Space" || event.code === "ArrowUp") {
        event.preventDefault();
        jump();
      }
      if (event.code === "ArrowDown") {
        event.preventDefault();
        setDuck(true);
      }
      if (event.code === "KeyP") {
        event.preventDefault();
        togglePause();
      }
    });

    window.addEventListener("keyup", (event) => {
      if (event.code === "ArrowDown") {
        event.preventDefault();
        setDuck(false);
      }
    });

    let touchStartX = 0;
    let touchStartY = 0;
    canvas.addEventListener("pointerdown", (event) => {
      if (event.pointerType === "mouse") return;
      touchStartX = event.clientX;
      touchStartY = event.clientY;
      canvas.setPointerCapture?.(event.pointerId);
    });

    canvas.addEventListener("pointerup", (event) => {
      if (event.pointerType === "mouse") return;
      const dx = event.clientX - touchStartX;
      const dy = event.clientY - touchStartY;
      if (dy > 32 && Math.abs(dy) > Math.abs(dx)) {
        setDuck(true);
        window.setTimeout(() => setDuck(false), 260);
      } else {
        jump();
      }
    });

    window.addEventListener("blur", () => {
      if (state.mode === "running") togglePause(true);
    });
    window.addEventListener("resize", () => {
      resizeCanvas();
      draw();
    });
  }

  function init() {
    resizeCanvas();
    bindEvents();
    updateHud();
    updateBackdrop(16);
    draw();
    ui.bestText.textContent = Math.floor(state.best).toLocaleString("de-DE");
  }

  init();
})();
