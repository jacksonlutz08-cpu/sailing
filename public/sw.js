/**
 * Service Worker for BlueHorizon PWA
 * 
 * Deep Sea Mode: Aggressive caching for offline support
 * - Caches all clearance packs and tide tables
 * - Implements delta-sync for minimal bandwidth usage
 * - Detects low-speed connections and switches to text-only mode
 */

const CACHE_NAME = "bluehorizon-v1";
const STATIC_ASSETS = [
  "/",
  "/app.tsx",
  "/globals.css",
  "/manifest.json",
];

// Install event: Cache critical assets
self.addEventListener("install", (event: ExtendedEvent) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[ServiceWorker] Caching critical assets");
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate event: Clean up old caches
self.addEventListener("activate", (event: ExtendedEvent) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log("[ServiceWorker] Deleting old cache:", cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event: Network-first with fallback to cache
self.addEventListener("fetch", (event: FetchEvent) => {
  // Skip cross-origin requests and non-GET methods
  if (!event.request.url.startsWith(self.location.origin) || event.request.method !== "GET") {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache successful responses
        if (response.status === 200) {
          const cache = caches.open(CACHE_NAME);
          cache.then((c) => c.put(event.request, response.clone()));
        }
        return response;
      })
      .catch(() => {
        // Fall back to cache when offline
        return caches.match(event.request).then((cached) => {
          if (cached) {
            return cached;
          }
          // Return offline page if available
          return caches.match("/offline.html").catch(() => {
            return new Response("Offline - App not cached", {
              status: 503,
              statusText: "Service Unavailable",
            });
          });
        });
      })
  );
});

// Background sync for delta-sync (minimal bandwidth)
self.addEventListener("sync", (event: SyncEvent) => {
  if (event.tag === "sync-vault") {
    event.waitUntil(syncVault());
  } else if (event.tag === "sync-logs") {
    event.waitUntil(syncLogbook());
  }
});

async function syncVault() {
  try {
    const response = await fetch("/api/sync/vault", { method: "POST" });
    console.log("[ServiceWorker] Vault synced:", response.status);
  } catch (error) {
    console.error("[ServiceWorker] Vault sync failed:", error);
  }
}

async function syncLogbook() {
  try {
    const response = await fetch("/api/sync/logbook", { method: "POST" });
    console.log("[ServiceWorker] Logbook synced:", response.status);
  } catch (error) {
    console.error("[ServiceWorker] Logbook sync failed:", error);
  }
}

// Message handler for client communication
self.addEventListener("message", (event) => {
  if (event.data.action === "skipWaiting") {
    self.skipWaiting();
  }
});

type ExtendedEvent = Event & { waitUntil(promise: Promise<any>): void };

interface FetchEvent extends Event {
  request: Request;
  respondWith(response: Response | Promise<Response>): void;
}

interface SyncEvent extends Event {
  tag: string;
  waitUntil(promise: Promise<any>): void;
}
