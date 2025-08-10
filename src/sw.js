const CACHE_NAME = 'my-react-app-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/assets/*', // Adjust based on your asset structure
  // Add other important assets
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
  );
});
