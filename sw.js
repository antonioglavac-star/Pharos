// Rad bez interneta. Dok ima mreže, igra se uvijek učita svježa (pa se nova verzija vidi odmah)
// i usput spremi kopiju; bez mreže se vrati spremljena kopija. Popis datoteka puni js/app.js.
const CACHE = 'pharos';
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request).then(r => {
      if (r.ok || r.type === 'opaque'){ const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
      return r;
    }).catch(() => caches.match(e.request, { ignoreSearch: true }).then(r => r || Response.error()))
  );
});
