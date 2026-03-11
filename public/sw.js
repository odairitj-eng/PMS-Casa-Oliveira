const CACHE_NAME = 'casa-oliveira-pwa-v2';
const STATIC_ASSETS = [
    '/',
    '/offline',
    '/manifest.json',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png',
    '/imagens/logo.png',
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(STATIC_ASSETS);
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // 🚨 EXCLUSÃO CRÍTICA: Não interceptar AUTH ou API do NextAuth
    if (url.pathname.includes('/api/auth') || url.pathname.includes('/auth/login') || url.pathname.includes('/auth/error')) {
        return; // Deixa o navegador lidar (Sempre Rede)
    }

    // Áreas dinâmicas (Admin, API restante): Network-Only ou Network-First
    if (url.pathname.startsWith('/api') || url.pathname.startsWith('/admin')) {
        event.respondWith(fetch(request).catch(() => caches.match(request)));
        return;
    }

    // Assets Estáticos: Cache-First
    if (
        request.destination === 'style' ||
        request.destination === 'script' ||
        request.destination === 'image' ||
        request.destination === 'font'
    ) {
        event.respondWith(
            caches.match(request).then((cachedResponse) => {
                if (cachedResponse) return cachedResponse;
                return fetch(request).then((networkResponse) => {
                    const responseToCache = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(request, responseToCache);
                    });
                    return networkResponse;
                });
            })
        );
        return;
    }

    // Navegação: Stale-While-Revalidate com Offline Fallback
    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request).catch(() => {
                return caches.match('/offline') || caches.match('/');
            })
        );
        return;
    }

    event.respondWith(
        caches.match(request).then((cachedResponse) => {
            const fetchPromise = fetch(request).then((networkResponse) => {
                const responseToCache = networkResponse.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(request, responseToCache);
                });
                return networkResponse;
            });
            return cachedResponse || fetchPromise;
        })
    );
});
