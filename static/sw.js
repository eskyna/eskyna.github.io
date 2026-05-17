const IMAGE_CACHE = "eskyna-images-v1";

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  const request = event.request;

  // Keep image handling isolated so HTML/JS/CSS behavior stays unchanged.
  if (request.method !== "GET" || request.destination !== "image") {
    return;
  }

  event.respondWith(cacheFirstWithUpdate(request));
});

async function cacheFirstWithUpdate(request) {
  const cache = await caches.open(IMAGE_CACHE);
  const cached = await cache.match(request);

  if (cached) {
    updateInBackground(cache, request);
    return cached;
  }

  try {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    return new Response("", { status: 504, statusText: "Offline" });
  }
}

async function updateInBackground(cache, request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.ok) {
      await cache.put(request, networkResponse.clone());
    }
  } catch (error) {
    // Ignore background update failures and keep cached image.
  }
}
