const CACHE_NAME = "eskyna-estyle-pwa-v9";
const CORE_ASSETS = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./config.js",
  "./manifest.webmanifest",
  "./sample-api-response.json",
  "./assets/welcome-bg.webp",
  "./assets/logo-gold.png",
  "./assets/logo-white.png",
  "./assets/sign_gold.png",
  "./assets/icon-180.png",
  "./assets/icon-192.png",
  "./assets/icon-512.png",
  "./assets/icon-maskable-512.png",
  "./assets/avatar.webp",
  "./assets/portrait-default.webp",
  "./assets/photo-good.webp",
  "./assets/photo-bad-1.webp",
  "./assets/photo-bad-2.webp",
  "./assets/photo-bad-3.webp",
  "./assets/photo-bad-4.webp",
];

let firebaseMessagingReady = false;

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = new URL(event.notification.data?.url || "./#welcome", self.location.href).href;
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if ("focus" in client) {
          client.navigate(targetUrl).catch(() => undefined);
          return client.focus();
        }
      }
      return self.clients.openWindow(targetUrl);
    })
  );
});

try {
  importScripts("./config.js");
  const eskynaConfig = self.ESKYNA_CONFIG || {};
  const firebaseConfig = eskynaConfig.auth?.firebaseConfig || {};
  const pushConfig = eskynaConfig.push || {};
  const sdkVersion = eskynaConfig.auth?.firebaseSdkVersion || "12.15.0";

  if (
    pushConfig.enabled !== false &&
    (pushConfig.provider || "firebase-cloud-messaging") === "firebase-cloud-messaging" &&
    firebaseConfig.apiKey &&
    firebaseConfig.projectId &&
    firebaseConfig.messagingSenderId
  ) {
    importScripts(
      `https://www.gstatic.com/firebasejs/${encodeURIComponent(sdkVersion)}/firebase-app-compat.js`
    );
    importScripts(
      `https://www.gstatic.com/firebasejs/${encodeURIComponent(sdkVersion)}/firebase-messaging-compat.js`
    );

    firebase.initializeApp(firebaseConfig);
    const messaging = firebase.messaging();
    firebaseMessagingReady = true;

    messaging.onBackgroundMessage((payload) => {
      const notification = payload.notification || {};
      const data = payload.data || {};
      const title = notification.title || data.title || "EStyle Update";
      const options = {
        body: notification.body || data.body || "Es gibt Neuigkeiten in deiner EStyle App.",
        icon: notification.icon || data.icon || "./assets/icon-192.png",
        badge: data.badge || "./assets/sign_gold.png",
        image: notification.image || data.image,
        tag: data.tag || "eskyna-patchnotes",
        renotify: data.renotify === "true" || data.renotify === true,
        data: {
          url: data.url || data.link || "./#welcome",
        },
      };

      self.registration.showNotification(title, options);
    });
  }
} catch (error) {
  // Die App-Shell soll auch dann installierbar bleiben, wenn Firebase Messaging beim ersten Laden nicht verfuegbar ist.
  console.warn(
    "Firebase Cloud Messaging konnte im Service Worker nicht initialisiert werden:",
    error
  );
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(CORE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);

  if (request.method !== "GET") return;
  if (url.pathname.startsWith("/api/")) return;

  if (request.mode === "navigate") {
    event.respondWith(fetch(request).catch(() => caches.match("./index.html")));
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        const responseClone = response.clone();
        if (response.ok && url.origin === self.location.origin) {
          caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
        }
        return response;
      });
    })
  );
});
