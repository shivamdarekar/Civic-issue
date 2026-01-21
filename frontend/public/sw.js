// Self-unregistering service worker for development
// This will automatically unregister itself to prevent caching issues

self.addEventListener('install', function(event) {
  // Skip waiting to activate immediately
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  // Unregister this service worker immediately
  event.waitUntil(
    self.registration.unregister().then(function() {
      console.log('Service worker unregistered successfully for development');
      // Clear all caches
      return caches.keys().then(function(cacheNames) {
        return Promise.all(
          cacheNames.map(function(cacheName) {
            return caches.delete(cacheName);
          })
        );
      });
    })
  );
});
