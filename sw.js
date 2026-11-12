// Service Worker für Befunde
//
// WICHTIG: Bei jeder Änderung an index.html / js/*.js / style.css die
// Versionsnummer hochzählen, sonst bekommen Nutzer die alte Version aus dem Cache.
const CACHE_VERSION = 'befunde-v1';

const APP_SHELL_FILES = [
  './',
  './index.html',
  './style.css',
  './manifest.json',
  './js/01-core.js',
  './js/02-helpers.js',
  './js/03-types.js',
  './js/04-orders.js',
  './js/05-editor.js',
  './js/06-special.js',
  './js/07-photos.js',
  './js/08-signature.js',
  './js/09-print.js',
  './js/10-settings.js',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png'
];

async function fetchFreshAndCache(cache, url) {
  const response = await fetch(url, { cache: 'reload' });
  await cache.put(url, response.clone());
  return response;
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then((cache) => Promise.all(APP_SHELL_FILES.map((url) => fetchFreshAndCache(cache, url))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Network first, offline aus dem Cache
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  event.respondWith(
    fetch(req)
      .then((response) => {
        if (response && response.ok) {
          const copy = response.clone();
          caches.open(CACHE_VERSION).then((cache) => cache.put(req, copy));
        }
        return response;
      })
      .catch(() => caches.match(req, { ignoreSearch: true })
        .then((hit) => hit || (req.mode === 'navigate' ? caches.match('./index.html') : undefined)))
  );
});
