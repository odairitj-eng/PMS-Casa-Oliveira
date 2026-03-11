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

    // 🚨 EXCLUSÃO ABSOLUTA: NextAuth, API de Auth e Login
    // Nunca interceptar ou cachear nada relacionado a autenticação
    if (
        url.pathname.includes('/api/auth') ||
        url.pathname.includes('/auth/login') ||
        url.pathname.includes('/auth/error') ||
        url.pathname.includes('/favicon.ico')
    ) {
        return;
    }

    // 1. Áreas Dinâmicas e API (Excluindo Auth acima): Network-Only
    if (url.pathname.startsWith('/api') || url.pathname.startsWith('/admin')) {
        event.respondWith(
            fetch(request).catch(() => {
                // Tenta cache apenas se a rede falhar (fallback básico)
                return caches.match(request);
            })
        );
        return;
    }

    // 2. Navegação (Páginas HTML): Network-First
    // Crucial para garantir que o status de login seja atualizado
    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    // Opcional: Atualizar o cache da página principal ou offline
                    if (url.pathname === '/') {
                        const responseClone = response.clone();
                        caches.open(CACHE_NAME).then(cache => cache.put(request, responseClone));
                    }
                    return response;
                })
                .catch(() => {
                    // Fallback Offline
                    return caches.match(request) || caches.match('/offline') || caches.match('/');
                })
        );
        return;
    }

    // 3. Assets Estáticos: Cache-First (Performance)
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
                    // Só guarda no cache se a resposta for válida
                    if (networkResponse.ok) {
                        const responseToCache = networkResponse.clone();
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(request, responseToCache);
                        });
                    }
                    return networkResponse;
                });
            })
        );
        return;
    }

    // 4. Estratégia Padrão: Network-First
    event.respondWith(
        fetch(request).catch(() => caches.match(request))
    );
});
