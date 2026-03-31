// Service Worker for 3Tree Wellness Platform
// Handles background push notifications and offline caching

const CACHE_NAME = '3tree-cache-v1';
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/manifest.json',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(STATIC_ASSETS);
        })
    );
    self.skipWaiting();
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME)
                    .map((name) => caches.delete(name))
            );
        })
    );
    self.clients.claim();
});

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', (event) => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') return;

    // Skip API requests
    if (event.request.url.includes('/functions/') ||
        event.request.url.includes('supabase.co')) {
        return;
    }

    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
                // Return cached version and update in background
                event.waitUntil(
                    fetch(event.request).then((networkResponse) => {
                        if (networkResponse.ok) {
                            caches.open(CACHE_NAME).then((cache) => {
                                cache.put(event.request, networkResponse);
                            });
                        }
                    }).catch(() => { })
                );
                return cachedResponse;
            }

            return fetch(event.request).then((networkResponse) => {
                // Cache successful responses
                if (networkResponse.ok) {
                    const responseClone = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseClone);
                    });
                }
                return networkResponse;
            });
        })
    );
});

// Push notification event
self.addEventListener('push', (event) => {
    if (!event.data) return;

    try {
        const data = event.data.json();

        const options = {
            body: data.message || data.body,
            icon: '/icon-192.png',
            badge: '/badge-72.png',
            vibrate: [200, 100, 200],
            tag: data.tag || 'default',
            data: {
                url: data.url || '/',
                ...data,
            },
            actions: data.actions || [],
        };

        event.waitUntil(
            self.registration.showNotification(
                data.title || '3Tree Wellness',
                options
            )
        );
    } catch (error) {
        console.error('Push notification error:', error);
    }
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    const url = event.notification.data?.url || '/';

    event.waitUntil(
        self.clients.matchAll({ type: 'window' }).then((clients) => {
            // Focus existing window if available
            for (const client of clients) {
                if (client.url.includes(self.location.origin) && 'focus' in client) {
                    client.navigate(url);
                    return client.focus();
                }
            }
            // Open new window
            return self.clients.openWindow(url);
        })
    );
});

// Handle notification close
self.addEventListener('notificationclose', (event) => {
    console.log('Notification closed:', event.notification.tag);
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-messages') {
        event.waitUntil(syncMessages());
    }
});

async function syncMessages() {
    // Sync any queued offline messages when back online
    const cache = await caches.open('3tree-offline-queue');
    const requests = await cache.keys();

    for (const request of requests) {
        try {
            await fetch(request);
            await cache.delete(request);
        } catch (error) {
            console.error('Failed to sync message:', error);
        }
    }
}
