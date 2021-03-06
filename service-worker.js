const appName = 'restaurant-reviews';
const staticCacheName = `${appName}-v1.0`;
const contentImgsCache = `${appName}-images`;
const allCaches = [staticCacheName, contentImgsCache];

// Cache all assets on install
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(staticCacheName).then((cache) => {
      return cache.addAll([
        '/FEND-Project5/',
        '/FEND-Project5/restaurant.html',
        '/FEND-Project5/css/styles.css',
        '/FEND-Project5/js/dbhelper.js',
        '/FEND-Project5/js/main.js',
        '/FEND-Project5/js/restaurant_info.js',
        '/FEND-Project5/data/restaurants.json',
        '/FEND-Project5/img/logo.svg',
        '/FEND-Project5/favicon.ico',
      ]);
    }),
  );
});

// Delete previous caches on activation
self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((cacheNames) => {
      return Promise.all(cacheNames.filter((cacheName) => {
          return cacheName.startsWith(appName) && !allCaches.includes(cacheName);
        }).map((cacheName) => {
          return caches.delete(cacheName);
        }),
      );
    }),
  );
});

// Watch fetch requests for highjack opportunities
self.addEventListener('fetch', (event) => {

  const requestUrl = new URL(event.request.url);

  // highjack requests made to the app (excluding mapbox/leaflet)
  if (requestUrl.origin === location.origin) {

    // respondWith restaurant.html if pathname startsWith '/restaurant.html'
    // this fixes the issue with IDs being placed at the end of the url
    if (requestUrl.pathname.startsWith('/FEND-Project5/restaurant.html')) {
      event.respondWith(caches.match('/FEND-Project5/restaurant.html'));
      return;
    }

    // If the request pathname starts with /img, handle those images
    if (requestUrl.pathname.startsWith('/img')) {
      event.respondWith(serveImage(event.request));
      return;
    }

    serveImage = (request) => {
      let imageStorageUrl = request.url;

      // Make a new URL with a stripped suffix and extension from the request url
      // '/img/1-medium.jpg' becomes '/img/1' this becomes the key for stored images
      // in the cache
      imageStorageUrl = imageStorageUrl.replace(/-small\.\w{4}|-medium\.\w{4}|-large\.\w{4}/i, '');

      return caches.open(contentImgsCache).then((cache) => {
        return cache.match(imageStorageUrl).then((response) => {

          // if an image is in the cache, return it,
          // else fetch it from the network, cache a clone, then return network response
          return response || fetch(request).then((networkResponse) => {
            cache.put(imageStorageUrl, networkResponse.clone());
            return networkResponse;
          });
        });
      });
    }
  }

  // Default to responding with cached elements.
  // fall back to network if necessary.
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});