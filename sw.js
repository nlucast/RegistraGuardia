const CACHE = 'guardias-v4';
const STATIC = ['./manifest.json', './icon.svg', './xlsx.min.js'];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(STATIC).catch(() => {})));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (!e.request.url.startsWith('http')) return;
  var url = e.request.url;
  // Network-first para HTML: siempre trae la versión más reciente de GitHub
  if (url.endsWith('/') || url.includes('index.html') || url.includes('GuardiasMedicas.html')) {
    e.respondWith(
      fetch(e.request)
        .then(function(r) {
          var clone = r.clone();
          caches.open(CACHE).then(function(c){ c.put(e.request, clone); });
          return r;
        })
        .catch(function(){ return caches.match(e.request); })
    );
    return;
  }
  // Cache-first para assets estáticos (xlsx, icon, manifest)
  e.respondWith(
    caches.match(e.request).then(function(r){ return r || fetch(e.request); })
  );
});
