// Service Worker for offline support and caching
const CACHE_NAME = 'pastlife-v1';
const RUNTIME_CACHE = 'pastlife-runtime-v1';

// Files to cache on install
const STATIC_CACHE_FILES = [
    '/',
    '/index.html',
    '/search.html',
    '/profile.html',
    '/login.html',
    '/person.html',
    '/family-tree.html',
    '/about.html',
    '/css/style.css',
    '/css/family-tree.css',
    '/js/auth.js',
    '/js/data.js',
    '/js/main.js',
    '/js/search.js',
    '/js/profile.js',
    '/js/login.js',
    '/js/person.js',
    '/js/family-tree.js',
    '/js/utils.js',
    '/js/onboarding.js',
    '/assets/images/PastLifeLogo.jpg',
    '/favicon.svg'
];

// Install event - cache static files
self.addEventListener('install', (event) => {
    console.log('[Service Worker] Installing...');
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[Service Worker] Caching static files');
            return cache.addAll(STATIC_CACHE_FILES.map(url => new Request(url, { cache: 'reload' }))).catch(err => {
                console.warn('[Service Worker] Failed to cache some files:', err);
            });
        })
    );
    self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activating...');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
                        console.log('[Service Worker] Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    return self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Skip cross-origin requests
    if (url.origin !== location.origin) {
        return;
    }
    
    // Skip API requests (OpenRouter)
    if (url.hostname === 'openrouter.ai') {
        return;
    }
    
    // Strategy: Cache first, then network
    event.respondWith(
        caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
                return cachedResponse;
            }
            
            return fetch(request).then((response) => {
                // Don't cache if not a valid response
                if (!response || response.status !== 200 || response.type !== 'basic') {
                    return response;
                }
                
                // Clone the response
                const responseToCache = response.clone();
                
                // Cache dynamic content
                caches.open(RUNTIME_CACHE).then((cache) => {
                    cache.put(request, responseToCache);
                });
                
                return response;
            }).catch(() => {
                // If network fails and we have a cached version, return it
                if (request.destination === 'document') {
                    return caches.match('/index.html');
                }
            });
        })
    );
});

// Message handler for cache updates
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'CACHE_URLS') {
        event.waitUntil(
            caches.open(RUNTIME_CACHE).then((cache) => {
                return cache.addAll(event.data.urls);
            })
        );
    }
});

