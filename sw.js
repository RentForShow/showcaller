// ShowCaller · service worker: permite abrir la app sin conexión.
// Red primero (así siempre ves la última versión) y, si no hay red, copia guardada.
const C = 'showcaller-v1';
self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(C).then(c => c.addAll(['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'])).catch(() => {}));
});
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const u = new URL(r.url);
  if (u.hostname.endsWith('supabase.co')) return; // la API siempre va a la red
  if (u.origin === location.origin || u.hostname === 'cdn.jsdelivr.net') {
    e.respondWith(
      fetch(r).then(res => { const cp = res.clone(); caches.open(C).then(c => c.put(r, cp)).catch(() => {}); return res; })
        .catch(() => caches.match(r).then(m => m || caches.match('./index.html')))
    );
  }
});
