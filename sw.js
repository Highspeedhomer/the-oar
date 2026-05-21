const CACHE_NAME = "the-oar-cache-v1";
const ASSETS_TO_CACHE = [
  "/the-oar/",
  "/the-oar/index.html",
  "/the-oar/manifest.json",
  "/the-oar/favicon.svg",
  "/the-oar/the_oar_app_icon.png",
  "/the-oar/the_oar_app_icon.svg"
];

// Active notifications timeout storage in the SW scope
const activeAlerts = new Map();

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Use silent catch so install completes even if some assets are missing/dynamic
      return Promise.allSettled(
        ASSETS_TO_CACHE.map((asset) => cache.add(asset))
      );
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  // Let the browser handle standard non-GET requests (e.g. Supabase POSTs) or API URLs
  if (event.request.method !== "GET" || !event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200) {
          return networkResponse;
        }
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return networkResponse;
      }).catch(() => {
        // Fallback for document navigation when offline
        if (event.request.mode === "navigate") {
          return caches.match("/the-oar/index.html");
        }
      });
    })
  );
});

// BACKGROUND ALERTS SCHEDULER
self.addEventListener("message", (event) => {
  const data = event.data;
  if (!data || !data.type) return;

  if (data.type === "SCHEDULE_ALERT") {
    const { id, title, body, delayMs } = data;
    
    // Clear any existing alert with this ID
    if (activeAlerts.has(id)) {
      clearTimeout(activeAlerts.get(id));
      activeAlerts.delete(id);
    }

    if (delayMs > 0) {
      const timeoutId = setTimeout(() => {
        self.registration.showNotification(title, {
          body,
          icon: "/the-oar/the_oar_app_icon.png",
          badge: "/the-oar/favicon.svg",
          vibrate: [200, 100, 200],
          tag: id,
          renotify: true
        });
        activeAlerts.delete(id);
      }, delayMs);
      
      activeAlerts.set(id, timeoutId);
    }
  } else if (data.type === "CANCEL_ALERT") {
    const { id } = data;
    if (activeAlerts.has(id)) {
      clearTimeout(activeAlerts.get(id));
      activeAlerts.delete(id);
    }
  }
});
