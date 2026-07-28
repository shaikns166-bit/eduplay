const CACHE_NAME = 'eduplay-pwa-games-v9';

self.addEventListener('install', event => { 
    event.waitUntil( caches.open(CACHE_NAME).then(cache => cache.addAll([ './', './index.html' ])) ); 
    self.skipWaiting(); 
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(cachedResponse => {
            if (cachedResponse) return cachedResponse;
            return fetch(event.request).then(networkResponse => {
                return caches.open(CACHE_NAME).then(cache => {
                    if (event.request.url.startsWith('http')) cache.put(event.request, networkResponse.clone());
                    return networkResponse;
                });
            });
        })
    );
});

self.addEventListener('activate', event => { 
    event.waitUntil( caches.keys().then(keys => Promise.all( keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)) )) ); 
    event.waitUntil(clients.claim()); 
});
