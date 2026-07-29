/* ════════════════════════════════════════════════════════════════════════
   ESKYNA — Goldene Partikel-Ankunft (Seiteneinstieg für eskyna.com)
   ────────────────────────────────────────────────────────────────────────
   Eigenständiges Skript, keine Abhängigkeiten. Beim Laden der Seite ist die
   Logo-Fläche zunächst leer. Dann fliegen goldene Partikel von überall im
   Sichtfeld zusammen, docken exakt an der Position des echten Logo-Elements
   an und lösen sich zu scharfen Vektor-Kanten auf. Das Endbild ist immer
   das Kleeblatt aus sign-gold.png — nie das ursprüngliche Element darunter
   (z. B. ein Platzhalter-Text oder ein anderes Icon).

   EINBAU
   ──────
  1. Dieses Skript auf den Server kopieren, z. B. nach
    /assets/eskyna-entrance/.
   2. Kurz vor </body> einbinden und per data-target auf das echte
      Logo-Element zeigen (CSS-Selektor):

        <script src="/assets/eskyna-entrance/eskyna-entrance.js"
                data-target="#site-logo"
                defer></script>

      Das Endbild wird aus /images/sign_gold.png geladen.

   KONFIGURATION (alles optional, als data-Attribute am <script>-Tag)
   ────────────────────────────────────────────────────────────────────────
   data-target        CSS-Selektor des echten Logo-Elements. Pflicht —
                       ohne passendes Element tut das Skript nichts.
   data-once           "true" (Standard) · nur einmal pro Browser-Session
                       (sessionStorage). "false" ⇒ bei jedem Laden erneut.
   data-particles      Anzahl Partikel (Standard 1800).
   data-duration       Sekunden für den Einflug (Standard 2.4).
   data-hold           Sekunden vom Andocken bis zur Übergabe ans
                       permanente Bild — die ersten 0,5 s davon sind der
                       Crossfade Punktwolke → scharfes Bild (Standard 0.9).

   VERHALTEN
   ─────────
   - Respektiert prefers-reduced-motion: Animation wird komplett
     übersprungen, das scharfe Logo (sign-gold.png) erscheint sofort,
     ohne Partikel.
   - Das echte Logo-Element (data-target) bleibt für immer unsichtbar
     (visibility:hidden) — es wird durch ein eigenes <img> mit
     sign-gold.png an derselben Position/Größe ersetzt. Nichts vom
     ursprünglichen Element (Text, Icon, Platzhalter) scheint je durch.
   - Der Canvas-Overlay ist transparent und pointer-events:none — die
     Seite bleibt während der Animation voll bedienbar, nichts wird
     blockiert.
   - Nach Ablauf entfernt sich der Canvas-Overlay selbst aus dem DOM;
     übrig bleibt nur das leichte, permanente <img>-Element.
   - Schlagen die Bild-Assets aus irgendeinem Grund fehl zu laden, wird
     stattdessen das ursprüngliche Element wieder sichtbar gemacht
     (nie dauerhaft leere Fläche).
   ════════════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  /* document.currentScript ist null, sobald das Skript async/defer geladen
     oder nachträglich injiziert wird — Fallback über den src-Pfad. */
  var scriptEl = document.currentScript || document.querySelector('script[src*="particles.js"]');
  if (!scriptEl) {
    console.warn("[eskyna-entrance] eigenes <script>-Tag nicht gefunden — übersprungen.");
    return;
  }

  var cfg = {
    target: scriptEl.getAttribute("data-target") || "",
    once: scriptEl.getAttribute("data-once") !== "false",
    particles: parseInt(scriptEl.getAttribute("data-particles"), 10) || 1800,
    duration: parseFloat(scriptEl.getAttribute("data-duration")) || 2.4,
    hold: parseFloat(scriptEl.getAttribute("data-hold")) || 0.9,
  };
  var IMG_SRC = "/images/sign_gold.png";
  var STORAGE_KEY = "eskynaEntrancePlayed";

  if (!cfg.target) {
    console.warn("[eskyna-entrance] kein data-target gesetzt — übersprungen.");
    return;
  }

  /* DOMContentLoaded ist bereits vorbei, wenn dieses Skript (üblicherweise
     mit defer oder am Ende von <body>) erst nach dem Parsen ausgeführt
     wird — ein neuer Listener darauf würde dann nie feuern. */
  function whenReady(fn) {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fn);
    else fn();
  }

  function start() {
    var targetEl = document.querySelector(cfg.target);
    if (!targetEl) {
      console.warn(
        '[eskyna-entrance] data-target "' + cfg.target + '" nicht gefunden — übersprungen.'
      );
      return;
    }
    if (cfg.once) sessionStorage.setItem(STORAGE_KEY, "1");

    /* Das echte Element bleibt ab hier für immer unsichtbar — Erfolg wie
       Fehlschlag entscheiden nur, WOMIT die Fläche gefüllt wird. */
    targetEl.style.visibility = "hidden";

    var reduced =
      window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      placeStaticSign(targetEl);
      return;
    } /* sofort scharfes Logo, keine Partikel */

    run(targetEl);
  }
  if (cfg.once && sessionStorage.getItem(STORAGE_KEY) === "1") {
    /* Schon gezeigt in dieser Session: das Ziel dennoch sofort durch das
       scharfe Bild ersetzen (still, ohne Partikel) statt gar nichts zu tun —
       sonst bliebe die Fläche für Folgeseiten in derselben Session leer. */
    whenReady(function () {
      var targetEl = document.querySelector(cfg.target);
      if (targetEl) {
        targetEl.style.visibility = "hidden";
        placeStaticSign(targetEl);
      }
    });
    return;
  }

  /* Ersetzt targetEl dauerhaft durch ein <img> mit sign-gold.png an
     derselben Position/Größe (position:fixed, „contain“-gefittet). Wird
     sowohl vom Normalpfad (nach der Animation) als auch von
     prefers-reduced-motion/Wiederholungs-Sessions genutzt. */
  function placeStaticSign(targetEl) {
    var img = new Image();
    img.setAttribute("aria-hidden", "true");
    img.style.cssText = "position:fixed;z-index:2147483647;pointer-events:none;";
    function layout() {
      var r = targetEl.getBoundingClientRect();
      img.style.left = r.left + "px";
      img.style.top = r.top + "px";
      img.style.width = r.width + "px";
      img.style.height = r.height + "px";
    }
    img.onload = function () {
      document.body.appendChild(img);
      layout();
      window.addEventListener("resize", layout);
    };
    img.onerror = function () {
      console.warn(
        "[eskyna-entrance] sign-gold.png nicht gefunden unter " + IMG_SRC + " — zeige Original."
      );
      targetEl.style.visibility = "";
    };
    img.src = IMG_SRC;
  }

  /* ── Utils (kondensiert aus der ESKYNA-Partikel-Lab-Engine) ─────────── */
  function mulberry32(seed) {
    var s = seed >>> 0;
    return function () {
      s = (s + 0x6d2b79f5) | 0;
      var z = Math.imul(s ^ (s >>> 15), 1 | s);
      z = (z + Math.imul(z ^ (z >>> 7), 61 | z)) ^ z;
      return ((z ^ (z >>> 14)) >>> 0) / 4294967296;
    };
  }
  function clamp(v, a, b) {
    return v < a ? a : v > b ? b : v;
  }
  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  /* Die ESKYNA-Wortmarke, bereinigt (nur Umrisse, kein Seitenhintergrund) —
     dient ausschließlich als Alpha-Maske zum Punkte-Sampling, die Fillfarbe
     spielt dafür keine Rolle. */
  var MARK_SVG =
    '<svg width="391" height="392" viewBox="366 201 391 392" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="m 0,0 c -5.052,12.02 -7.944,24.693 -8.602,37.717 -0.026,0.512 -0.055,1.108 -0.084,1.744 10.599,0.435 20.378,2.671 29.277,6.741 4.533,2.074 11.329,5.953 38.279,31.486 5.928,5.616 10.748,10.31 13.968,13.473 0.412,-0.342 0.825,-0.684 1.238,-1.026 5.178,-4.614 9.733,-8.696 13.735,-12.28 22.745,-20.383 28.857,-25.862 39.32,-30.239 8.986,-3.759 18.79,-5.671 29.347,-5.772 -0.826,-11.858 -3.864,-24.787 -9.17,-38.749 -12.246,1.301 -24.211,4.333 -35.612,9.037 C 98.919,17.4 87.131,24.643 76.655,33.657 l -2.728,2.35 -2.777,-2.29 C 60.721,25.12 49.222,17.853 36.968,12.116 25.185,6.601 12.764,2.533 0,0 m -48.711,92.956 c 5.268,12.777 12.511,24.566 21.525,35.042 l 2.35,2.728 -2.29,2.777 c -8.603,10.434 -15.87,21.933 -21.601,34.182 -5.515,11.783 -9.583,24.204 -12.116,36.968 12.02,5.052 24.693,7.944 37.717,8.602 1.494,0.078 3.557,0.178 6.037,0.208 0.638,-9.031 2.54,-20.564 7.61,-32.787 C -4.65,169.034 1.255,161.324 28.953,133.425 1.04,105.066 -4.86,97.31 -9.659,85.59 c -5.938,-14.505 -7.435,-28.005 -7.67,-37.532 -12.308,0.644 -25.802,3.731 -40.419,9.287 1.299,12.243 4.333,24.208 9.037,35.611 M -0.216,266.308 C 12.561,263.838 25,259.827 36.809,254.366 49.081,248.69 60.614,241.477 71.09,232.924 l 2.788,-2.274 2.717,2.358 c 10.437,9.065 22.194,16.363 34.943,21.689 11.371,4.75 23.321,7.842 35.567,9.201 5.478,-14.217 8.596,-27.371 9.404,-39.418 -9.576,-0.406 -23.834,-2.156 -39.053,-8.979 -11.419,-5.119 -18.93,-11.183 -45.558,-39.128 -27.8,27.334 -35.525,33.179 -47.151,37.939 -12.597,5.158 -24.43,6.958 -33.571,7.498 0.002,2.807 0.105,5.107 0.18,6.742 0.601,13.034 3.433,25.721 8.428,37.756 m 203.534,-57.652 c -2.114,-12.845 -5.773,-25.393 -10.896,-37.345 -5.325,-12.428 -12.212,-24.159 -20.466,-34.872 l -2.199,-2.85 2.436,-2.65 c 9.355,-10.174 16.981,-21.72 22.668,-34.315 5.068,-11.237 8.496,-23.095 10.2,-35.297 -14.331,-5.989 -27.632,-9.508 -39.844,-10.584 -0.286,11.142 -2.518,21.401 -6.766,30.691 -4.714,10.307 -10.386,16.233 -31.486,38.279 -3.295,3.442 -6.986,7.299 -11.114,11.63 -0.586,0.599 -1.172,1.197 -1.758,1.796 3.061,3.212 7.667,8.074 13.21,14.049 25.204,27.168 28.948,33.196 31.309,38.423 4.166,9.222 6.347,19.386 6.617,30.408 0.033,-0.001 0.076,-0.002 0.109,-0.002 13.045,-0.232 25.804,-2.707 37.98,-7.361 M 88.652,105.982 c 6.98,6.57 13.983,13.108 20.933,19.549 4.165,-4.371 7.886,-8.259 11.206,-11.729 20.827,-21.757 25.775,-26.928 29.888,-35.924 3.775,-8.256 5.758,-17.44 6.004,-27.477 -9.499,0.079 -18.273,1.76 -26.254,5.101 -9.131,3.818 -14.464,8.6 -36.916,28.717 -3.981,3.568 -8.509,7.626 -13.654,12.211 2.913,3.172 5.825,6.343 8.793,9.552 m -55.184,19.84 c 8.552,-7.412 17.246,-15.008 25.895,-22.639 2.415,-2.382 4.685,-4.614 6.809,-6.702 C 61.195,91.742 56.813,87.549 52.959,83.862 31.202,63.035 26.031,58.087 17.035,53.974 9.238,50.409 0.614,48.443 -8.773,48.025 c 0.234,8.813 1.632,21.162 7.021,34.328 4.024,9.822 8.239,15.969 35.22,43.469 m 10.42,22.66 c -3.182,-3.191 -6.137,-6.162 -8.925,-8.974 -28.116,28.338 -32.424,34.504 -36.545,44.442 -4.482,10.803 -6.259,21.068 -6.906,29.281 8.321,-0.563 18.874,-2.274 29.998,-6.827 9.921,-4.064 16.099,-8.33 44.313,-36.049 -6.138,-6.087 -13.539,-13.456 -21.935,-21.873 m 64.659,-8.679 c -4.019,4.051 -8.562,8.616 -13.582,13.642 -5.506,5.866 -10.976,11.727 -16.374,17.554 26.659,27.94 32.667,32.358 42.364,36.704 13.809,6.192 26.848,7.845 35.726,8.238 -0.274,-9.767 -2.205,-18.729 -5.857,-26.811 -4.073,-9.014 -8.998,-14.206 -29.721,-36.062 -3.669,-3.868 -7.841,-8.268 -12.556,-13.265 M 80.19,109.763 c -2.608,-2.459 -5.072,-4.789 -7.428,-7.022 -2.32,2.057 -4.732,4.193 -7.286,6.446 -0.084,0.075 -0.169,0.148 -0.253,0.223 -4.512,4.448 -9.447,9.328 -14.841,14.686 -2.903,2.885 -5.615,5.585 -8.178,8.147 5.738,6.175 12.575,13.509 20.383,21.824 3.411,3.634 6.561,6.978 9.512,10.097 2.958,-2.928 6.104,-6.056 9.507,-9.448 2.469,-2.464 4.823,-4.818 7.108,-7.105 2.059,-2.194 4.115,-4.392 6.176,-6.578 2.603,-2.762 5.073,-5.373 7.424,-7.853 -2.222,-2.366 -4.541,-4.841 -6.987,-7.46 -4.26,-4.561 -8.492,-9.121 -12.694,-13.663 -0.813,-0.766 -1.631,-1.529 -2.443,-2.294 M 73.815,24.885 C 84.286,16.335 95.918,9.393 108.438,4.23 c 13.199,-5.443 27.105,-8.79 41.335,-9.948 l 3.147,-0.258 1.168,2.933 c 6.489,16.276 10.137,31.373 10.983,45.216 14.227,1.13 29.7,5.3 46.349,12.579 l 2.894,1.265 -0.361,3.137 c -1.632,14.19 -5.435,27.98 -11.304,40.986 -5.57,12.343 -12.889,23.738 -21.781,33.925 7.746,10.502 14.269,21.882 19.41,33.878 5.858,13.667 9.898,28.074 12.009,42.816 l 0.471,3.279 -3.058,1.273 c -14.1,5.867 -28.975,8.98 -44.211,9.253 -0.125,0.002 -0.28,0.004 -0.412,0.006 -0.873,13.93 -4.605,29.123 -11.22,45.499 l -1.182,2.928 -3.147,-0.271 c -14.232,-1.231 -28.123,-4.643 -41.285,-10.143 -12.494,-5.218 -24.095,-12.215 -34.529,-20.817 -10.279,8.04 -21.473,14.878 -33.319,20.357 -13.5,6.244 -27.787,10.689 -42.462,13.211 l -3.264,0.563 -1.356,-3.022 c -6.262,-13.925 -9.791,-28.707 -10.494,-43.928 -0.079,-1.696 -0.183,-4.068 -0.192,-6.942 -2.531,-0.035 -4.642,-0.136 -6.185,-0.213 -15.213,-0.77 -29.976,-4.37 -43.88,-10.697 l -3.015,-1.372 0.576,-3.261 c 2.592,-14.662 7.103,-28.928 13.409,-42.4 5.531,-11.822 12.423,-22.983 20.51,-33.225 -8.55,-10.471 -15.491,-22.103 -20.655,-34.622 -5.443,-13.201 -8.79,-27.108 -9.948,-41.335 l -0.258,-3.147 2.933,-1.168 c 16.841,-6.714 32.412,-10.381 46.642,-11.055 0.035,-0.819 0.072,-1.584 0.105,-2.225 0.77,-15.213 4.37,-29.976 10.697,-43.88 l 1.372,-3.015 3.261,0.576 c 14.662,2.592 28.928,7.103 42.4,13.409 11.827,5.536 22.988,12.429 33.224,20.51" fill="#C5A059" transform="matrix(1.3333333,0,0,-1.3333333,465.352,574.3756)" /> <path d="M 0,0 -12.534,12.534 -25.068,0 -12.534,-12.534 Z" fill="#C5A059" transform="matrix(1.3333333,0,0,-1.3333333,580.66853,297.3228)" /> <path d="M 0,0 -12.534,12.534 -25.068,0 -12.534,-12.534 Z" fill="#C5A059" transform="matrix(1.3333333,0,0,-1.3333333,580.66853,496.17347)" /> </svg>';

  /* ── Ablauf ──────────────────────────────────────────────────────────── */
  function run(targetEl) {
    var canvas = document.createElement("canvas");
    canvas.setAttribute("aria-hidden", "true");
    canvas.style.cssText =
      "position:fixed;inset:0;width:100vw;height:100vh;" +
      "z-index:2147483647;pointer-events:none;transition:opacity .5s ease;";
    document.body.appendChild(canvas);
    var ctx = canvas.getContext("2d");

    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    function sizeCanvas() {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    sizeCanvas();
    window.addEventListener("resize", sizeCanvas);

    /* Bail-out: die Maske selbst lädt nie (data:-URI, sollte praktisch nie
       fehlschlagen) — dann lieber sofort das Original zurückgeben. */
    function bailOut() {
      window.removeEventListener("resize", sizeCanvas);
      if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
      targetEl.style.visibility = "";
    }

    var markImg = new Image();
    markImg.onload = onMarkReady;
    markImg.onerror = function () {
      console.warn("[eskyna-entrance] Logo-Maske konnte nicht geladen werden — übersprungen.");
      bailOut();
    };
    markImg.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(MARK_SVG);

    function onMarkReady() {
      /* Content-Box per Alpha-Scan bestimmen (wie im Partikel-Lab). */
      var S = 400,
        mcv = document.createElement("canvas");
      mcv.width = S;
      mcv.height = S;
      var mg = mcv.getContext("2d", { willReadFrequently: true });
      mg.drawImage(markImg, 0, 0, S, S);
      var d = mg.getImageData(0, 0, S, S).data;
      var minX = S,
        minY = S,
        maxX = 0,
        maxY = 0;
      for (var y = 0; y < S; y++)
        for (var x = 0; x < S; x++) {
          if (d[(y * S + x) * 4 + 3] > 8) {
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
          }
        }
      var kx = markImg.naturalWidth / S,
        ky = markImg.naturalHeight / S;
      var src = {
        x: Math.max(0, (minX - 1) * kx),
        y: Math.max(0, (minY - 1) * ky),
        w: Math.min(markImg.naturalWidth, (maxX - minX + 3) * kx),
        h: Math.min(markImg.naturalHeight, (maxY - minY + 3) * ky),
      };
      /* Maske für Punkt-Sampling: 200er-Grid. */
      var GW = 200,
        GH = Math.round(GW * (src.h / src.w));
      var gcv = document.createElement("canvas");
      gcv.width = GW;
      gcv.height = GH;
      var gg = gcv.getContext("2d", { willReadFrequently: true });
      gg.drawImage(markImg, src.x, src.y, src.w, src.h, 0, 0, GW, GH);
      var gd = gg.getImageData(0, 0, GW, GH).data;
      var filled = [];
      for (var i = 0; i < GW * GH; i++) if (gd[i * 4 + 3] / 255 > 0.5) filled.push(i);

      var N = cfg.particles;
      var rng = mulberry32(0x45534b59 ^ N);
      var homeLocal = new Float32Array(N * 2); /* 0..1 im Maskenrahmen */
      for (var p = 0; p < N; p++) {
        var cell = filled[(rng() * filled.length) | 0];
        var cx = cell % GW,
          cy = (cell / GW) | 0;
        homeLocal[p * 2] = (cx + rng()) / GW;
        homeLocal[p * 2 + 1] = (cy + rng()) / GH;
      }

      startAnimation(homeLocal, src.w / src.h);
    }

    function startAnimation(homeLocal, aspect) {
      var N = homeLocal.length / 2;
      var home = new Float32Array(N * 2);
      var pos = new Float32Array(N * 2);
      var fromBuf = new Float32Array(N * 2);
      var seed = new Float32Array(N);
      var flash = new Float32Array(N);
      var arrived = new Uint8Array(N);
      var kind = new Uint8Array(N);
      var rng2 = mulberry32(0x21de57a9);
      var targetRect = { x: 0, y: 0, w: 0, h: 0 };

      function layoutTarget() {
        var r = targetEl.getBoundingClientRect();
        /* Zielrahmen exakt auf das reale Logo-Element gefittet, Seiten-
           verhältnis der Maske gewahrt (contain), zentriert im Element. */
        var elAspect = r.width / r.height;
        var w = r.width,
          h = r.height;
        if (elAspect > aspect) {
          w = h * aspect;
        } else {
          h = w / aspect;
        }
        targetRect.x = r.left + (r.width - w) / 2;
        targetRect.y = r.top + (r.height - h) / 2;
        targetRect.w = w;
        targetRect.h = h;
        for (var p = 0; p < N; p++) {
          home[p * 2] = targetRect.x + homeLocal[p * 2] * targetRect.w;
          home[p * 2 + 1] = targetRect.y + homeLocal[p * 2 + 1] * targetRect.h;
        }
      }
      layoutTarget();
      window.addEventListener("resize", layoutTarget);

      var GOLD = "#f0c869",
        CHAMPAGNE = "#fff6da",
        BRONZE = "#b6862c";
      function hexRgb(hex) {
        return [
          parseInt(hex.slice(1, 3), 16),
          parseInt(hex.slice(3, 5), 16),
          parseInt(hex.slice(5, 7), 16),
        ];
      }
      function rgba(hex, a) {
        var c = hexRgb(hex);
        return "rgba(" + c[0] + "," + c[1] + "," + c[2] + "," + a + ")";
      }
      function makeDot(d, hex, mid) {
        var s = Math.max(4, Math.ceil(d * 2)),
          cv = document.createElement("canvas");
        cv.width = s;
        cv.height = s;
        var g = cv.getContext("2d"),
          r = s / 2;
        var gr = g.createRadialGradient(r, r, 0, r, r, r);
        gr.addColorStop(0, rgba(hex, 1));
        gr.addColorStop(mid, rgba(hex, 0.5));
        gr.addColorStop(1, rgba(hex, 0));
        g.fillStyle = gr;
        g.fillRect(0, 0, s, s);
        return cv;
      }
      var spr = [makeDot(6, GOLD, 0.2), makeDot(7, CHAMPAGNE, 0.16), makeDot(5, BRONZE, 0.28)];
      var sprFlash = makeDot(10, CHAMPAGNE, 0.12);

      for (var i = 0; i < N; i++) {
        var sd = rng2();
        seed[i] = sd;
        pos[i * 2] = rng2() * window.innerWidth;
        pos[i * 2 + 1] = rng2() * window.innerHeight;
        kind[i] = sd < 0.72 ? 0 : sd < 0.92 ? 1 : 2;
      }
      fromBuf.set(pos);

      var m = 0,
        holdT = 0,
        phase = "in",
        lastNow = performance.now(),
        raf = 0;

      function tick(now) {
        var dt = clamp((now - lastNow) / 1000, 0.0001, 0.05);
        lastNow = now;
        var dec = Math.exp(-4.5 * dt);
        for (var i2 = 0; i2 < N; i2++) flash[i2] *= dec;

        if (phase === "in") {
          m = Math.min(1, m + dt / cfg.duration);
          for (var i = 0; i < N; i++) {
            var d = seed[i] * 0.4;
            var mm = easeInOutCubic(clamp((m - d) / (1 - d), 0, 1));
            pos[i * 2] = fromBuf[i * 2] + (home[i * 2] - fromBuf[i * 2]) * mm;
            pos[i * 2 + 1] = fromBuf[i * 2 + 1] + (home[i * 2 + 1] - fromBuf[i * 2 + 1]) * mm;
            if (mm >= 1 && !arrived[i]) {
              arrived[i] = 1;
              flash[i] = 1;
            }
          }
          if (m >= 1) {
            phase = "hold";
            holdT = 0;
          }
        } else if (phase === "hold") {
          holdT += dt;
          if (holdT > cfg.hold) {
            phase = "out";
            canvas.style.opacity = "0";
            holdT = 0;
          }
        }

        draw();

        if (phase === "out") {
          holdT += dt;
          if (holdT > 0.55) {
            finish();
            return;
          } /* Fade-Transition abgeschlossen */
        }
        raf = requestAnimationFrame(tick);
      }

      function draw() {
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        var FADE = 0.5;
        var inHold = phase === "hold" || phase === "out";
        var imgA = inHold ? Math.min(1, holdT / FADE) : 0;
        var dotA = inHold ? Math.max(0, 1 - holdT / FADE) : 1;

        if (dotA > 0.01) {
          for (var i = 0; i < N; i++) {
            var s = spr[kind[i]];
            var sz = 2.6 + 1.7 * seed[i];
            ctx.globalAlpha = (0.4 + 0.4 * seed[i]) * dotA;
            ctx.drawImage(s, pos[i * 2] - sz / 2, pos[i * 2 + 1] - sz / 2, sz, sz);
          }
        }
        ctx.globalCompositeOperation = "lighter";
        for (var j = 0; j < N; j++) {
          if (flash[j] < 0.03) continue;
          var fz = 6 + 5 * flash[j];
          ctx.globalAlpha = flash[j] * 0.85;
          ctx.drawImage(sprFlash, pos[j * 2] - fz / 2, pos[j * 2 + 1] - fz / 2, fz, fz);
        }
        ctx.globalCompositeOperation = "source-over";
        if (imgA > 0.01 && signImg.complete && signImg.naturalWidth > 0) {
          ctx.globalAlpha = imgA;
          ctx.drawImage(signImg, targetRect.x, targetRect.y, targetRect.w, targetRect.h);
        }
        ctx.globalAlpha = 1;
      }

      /* Übergabe ans permanente <img> — die Canvas-Ebene war nur die
         Einflug-Choreografie, das dauerhafte Endbild ist ein echtes
         <img>-Element (leichter als ein für immer transparent bleibender
         Vollbild-Canvas). */
      function finish() {
        if (raf) cancelAnimationFrame(raf);
        window.removeEventListener("resize", sizeCanvas);
        window.removeEventListener("resize", layoutTarget);
        if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
        placeStaticSign(targetEl);
      }

      raf = requestAnimationFrame(tick);
    }

    /* signImg wird hier (statt in onMarkReady) geladen, damit es parallel
       zur Masken-Analyse bereitsteht. draw() prüft signImg.complete direkt,
       kein separates Ready-Flag nötig. */
    var signImg = new Image();
    signImg.onerror = function () {
      console.warn("[eskyna-entrance] sign-gold.png nicht gefunden unter " + IMG_SRC);
    };
    signImg.src = IMG_SRC;
  }

  whenReady(start);
})();
