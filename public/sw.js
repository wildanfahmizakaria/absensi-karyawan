/**
 * Service Worker — Sistem Absensi CV Mandala Mahardika (SOT v0.2)
 * Bertugas:
 * - Caching application shell secara aman (offline fallback)
 * - TIDAK menyimpan rekaman sensitif / transaksi API ke disk cache
 */

const CACHE_NAME = 'mandala-absensi-v1';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json',
  '/icons/icon-192.svg',
  '/icons/icon-512.svg',
];

// Tahap Install: Simpan berkas shell statis
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Tahap Aktifasi: Bersihkan cache versi lama
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Tahap Fetch: Strategi Caching Aman
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Jangan tangani selain GET (misal POST check-in tidak boleh dicache)
  if (request.method !== 'GET') {
    return;
  }

  // JANGAN CACHE request API atau stream kamera blob/dataUrl
  if (url.pathname.startsWith('/api/') || url.protocol === 'blob:' || url.protocol === 'data:') {
    return;
  }

  // Strategi Navigasi Halaman HTML: Network-first dengan fallback ke offline.html
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(async () => {
        const cache = await caches.open(CACHE_NAME);
        const cachedResponse = await cache.match(request);
        if (cachedResponse) {
          return cachedResponse;
        }
        return cache.match('/offline.html');
      })
    );
    return;
  }

  // Strategi Aset Statis (JS, CSS, Font, SVG): Stale-While-Revalidate
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});
