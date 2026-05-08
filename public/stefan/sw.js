const CACHE_NAME = "eskyna-stefan-pwa-v5";
const PDF_CACHE_NAME = "eskyna-stefan-pdf-v1";
const APP_SHELL = [
  "/stefan/",
  "/stefan/index.html",
  "/stefan/styles.css",
  "/stefan/app.js",
  "/stefan/manifest.webmanifest",
  "/stefan/icons/sign_gold.png",
  "/stefan/icons/apple-touch-icon.png",
  "/stefan/icons/icon-192.png",
  "/stefan/icons/icon-512.png",
  "/stefan/icons/icon-maskable-512.png",
  "/stefan/images/natalia-portrait.webp",
];

const REMOTE_PORTRAIT_URL = "https://eskyna.com/images/IMG_5208_transparent.png";
const LOCAL_PORTRAIT_FALLBACK = "/stefan/images/natalia-portrait.webp";
const PDF_URL = "/10_Styling_Tipps.pdf";

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.map((key) =>
            key === CACHE_NAME || key === PDF_CACHE_NAME ? undefined : caches.delete(key)
          )
        )
      )
  );
  self.clients.claim();
});

async function cacheFirst(request, cacheName = CACHE_NAME) {
  const cached = await caches.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  if (request.method === "GET" && response.ok) {
    const cache = await caches.open(cacheName);
    cache.put(request, response.clone());
  }
  return response;
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (request.method === "GET" && response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    return cached || caches.match("/stefan/index.html");
  }
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request));
    return;
  }

  if (request.url === REMOTE_PORTRAIT_URL || url.pathname === "/images/IMG_5208_transparent.png") {
    event.respondWith(cacheFirst(request).catch(() => caches.match(LOCAL_PORTRAIT_FALLBACK)));
    return;
  }

  if (url.pathname === PDF_URL) {
    event.respondWith(cacheFirst(request, PDF_CACHE_NAME));
    return;
  }

  if (url.pathname.startsWith("/stefan/")) {
    event.respondWith(cacheFirst(request));
  }
});
