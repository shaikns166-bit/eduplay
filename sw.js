const CACHE_NAME = 'eduplay-pwa-games-v163';

// 1. INSTALLATION: Save the core files immediately
self.addEventListener('install', event => {
    self.skipWaiting(); // Forces the browser to activate the new version immediately
    
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('Opened cache');
            // Cache the main files right away
            return cache.addAll([
                './',
                './index.html',
                './manifest.json'
            ]);
        })
    );
});

// 2. ACTIVATION: Clean up old, outdated caches so they don't take up phone memory
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== CACHE_NAME) {
                        console.log('Clearing old cache:', cache);
                        return caches.delete(cache);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// 3. FETCH: The Offline Engine (Cache-First Strategy)
self.addEventListener('fetch', event => {
    // Only handle standard GET requests (ignore extensions/plugins)
    if (event.request.method !== 'GET' || !event.request.url.startsWith('http')) {
        return;
    }

    event.respondWith(
        caches.match(event.request).then(cachedResponse => {
            // IF FOUND IN CACHE: Return it instantly (Offline Mode)
            if (cachedResponse) {
                return cachedResponse;
            }

            // IF NOT IN CACHE: Go to the internet, then save a copy for next time!
            return fetch(event.request).then(networkResponse => {
                // Don't cache broken responses
                if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                    return networkResponse;
                }

                // Clone the response because we have to save one and show one
                const responseToCache = networkResponse.clone();

                caches.open(CACHE_NAME).then(cache => {
                    cache.put(event.request, responseToCache);
                });

                return networkResponse;
            }).catch(() => {
                // If offline and the file isn't cached yet, fail silently to prevent crashes
                console.log('Offline and asset not found in cache.');
            });
        })
    );
});
