// Service worker: pozwala zainstalować aplikację i otwierać ją szybko.
// Strona zawsze najpierw z sieci (żeby aktualizacje docierały od razu), z pamięci tylko bez internetu.
var CACHE = 'wydatki-v5';
var PLIKI = ['./', 'index.html', 'manifest.webmanifest', 'logo.png', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(PLIKI); }));
  self.skipWaiting();
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }));
  self.clients.claim();
});

self.addEventListener('fetch', function (e) {
  var url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== self.location.origin) return; // API Google – bez cache
  e.respondWith(
    fetch(e.request).then(function (r) {
      var kopia = r.clone();
      caches.open(CACHE).then(function (c) { c.put(e.request, kopia); });
      return r;
    }).catch(function () { return caches.match(e.request); })
  );
});
