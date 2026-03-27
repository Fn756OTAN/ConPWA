const CACHE_NAME = 'cinedetalle-v1';
const CACHE_STATIC = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  '/config.js',
  '/manifest.json',
  'https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600&display=swap',
];

// Dominios de imágenes de TMDB que queremos cachear dinámicamente
const IMAGE_DOMAINS = ['image.tmdb.org'];
const API_DOMAINS   = ['api.themoviedb.org'];

// ── INSTALL: cachear archivos estáticos ───────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(CACHE_STATIC))
  );
  self.skipWaiting();
});

// ── ACTIVATE: limpiar caches viejos ──────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// ── FETCH: estrategia según tipo de recurso ───────────────
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Imágenes de TMDB → Cache first (guardar para offline)
  if (IMAGE_DOMAINS.some(d => url.hostname.includes(d))) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async cache => {
        const cached = await cache.match(event.request);
        if (cached) return cached;
        try {
          const response = await fetch(event.request);
          if (response.ok) cache.put(event.request, response.clone());
          return response;
        } catch {
          // Sin conexión y sin cache → imagen de placeholder
          return new Response(
            `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 300">
              <rect width="200" height="300" fill="#1c1c28"/>
              <text x="100" y="160" text-anchor="middle" fill="#7a7a95" font-size="48">👤</text>
            </svg>`,
            { headers: { 'Content-Type': 'image/svg+xml' } }
          );
        }
      })
    );
    return;
  }

  // API de TMDB → Network first, fallback a cache
  if (API_DOMAINS.some(d => url.hostname.includes(d))) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async cache => {
        try {
          const response = await fetch(event.request);
          if (response.ok) cache.put(event.request, response.clone());
          return response;
        } catch {
          const cached = await cache.match(event.request);
          if (cached) return cached;
          return new Response(
            JSON.stringify({ error: 'Sin conexión y sin datos en cache.' }),
            { headers: { 'Content-Type': 'application/json' }, status: 503 }
          );
        }
      })
    );
    return;
  }

  // Fuentes de Google → Cache first
  if (url.hostname.includes('fonts.')) {
    event.respondWith(
      caches.match(event.request).then(cached =>
        cached || fetch(event.request).then(response => {
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, response.clone()));
          return response;
        })
      )
    );
    return;
  }

  // Todo lo demás → Network first, fallback a cache
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
