const CACHE_NAME = 'eduplay-pwa-games-v167'; 

self.addEventListener('install', event => { 
    self.skipWaiting(); 
}); 

self.addEventListener('fetch', event => { 
    event.respondWith( 
        caches.match(event.request).then(cachedResponse => { 
            if (cachedResponse) return cachedResponse; 
            
            return fetch(event.request).then(networkResponse => { 
                return caches.open(CACHE_NAME).then(cache => { 
                    // Sirf valid http/https requests ko save karega (errors se bachne ke liye)
                    if (event.request.url.startsWith('http')) {
                        cache.put(event.request, networkResponse.clone()); 
                    }
                    return networkResponse; 
                }); 
            }); 
        }).catch(() => { 
            return new Response(''); // Offline hone par crash hone se bachayega
        }) 
    ); 
}); 

self.addEventListener('activate', event => { 
    event.waitUntil( 
        caches.keys().then(keys => Promise.all( 
            keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)) 
        )) 
    ); 
    event.waitUntil(clients.claim()); 
});
