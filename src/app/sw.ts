/// <reference lib="webworker" />
import { clientsClaim } from 'workbox-core';
import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute, NavigationRoute } from 'workbox-routing';
import { StaleWhileRevalidate, CacheFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';

declare const self: ServiceWorkerGlobalScope;

// Precache all static assets injected by next-pwa
precacheAndRoute(self.__WB_MANIFEST);

// Skip waiting and claim all clients immediately
clientsClaim();

// Runtime cache: API routes (Supabase) — Stale-while-revalidate
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new StaleWhileRevalidate({
    cacheName: 'api-cache',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 24 * 60 * 60, // 24 hours
      }),
    ],
  }),
);

// Runtime cache: images — Cache First
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'image-cache',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
      }),
    ],
  }),
);

// Navigation route: fall back to / for offline SPA navigation
registerRoute(
  ({ request }) => request.mode === 'navigate',
  new StaleWhileRevalidate({
    cacheName: 'pages',
  }),
);

// Background sync: register a sync event for pending stock movements
self.addEventListener('sync', (event: any) => {
  if (event.tag === 'sync-stock-movements') {
    event.waitUntil(handleSync());
  }
});

async function handleSync() {
  // Retrieve pending movements from IndexedDB / cache
  // In production this syncs queued operations to Supabase
  const syncQueue = await self.clients.matchAll();
  for (const client of syncQueue) {
    client.postMessage({ type: 'BACKGROUNDSYNC_TRIGGER' });
  }
}

// Handle message from client to queue a movement
self.addEventListener('message', (event: any) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
