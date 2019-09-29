const appName = 'restaurant-reviews';
const staticCacheName = `${appName}-v1.0`;
const contentImgsCache = `${appName}-images`;

const allCaches = [staticCacheName, contentImgsCache];

// Cache all assets on install
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(staticCacheName).then((cache) => {
      return cache.addAll([
        '/',
        '/restaurant.html',
        '/css/styles.css',
        '/js/dbhelper.js',
        '/js/main.js',
        '/js/restaurant_info.js',
        '/data/restaurants.json',
        '/img/logo.svg',
        '/favicon.ico',
      ]);
    }),
  );
});

// Delete previous caches on activation
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((cacheName) => {
          return cacheName.startsWith(appName)
                 && !allCaches.includes(cacheName);
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

  // highjack requests made to our app (excluding mapbox/leaflet)
  if (requestUrl.origin === location.origin) {

    // respondWith restaurant.html if pathname startsWith '/restaurant.html'
    // this fixes the issue with IDs being placed at the end of the url
    if (requestUrl.pathname.startsWith('/restaurant.html')) {
      event.respondWith(caches.match('/restaurant.html'));
      return; // Done handling request, so exit early.
    }

    // If the request pathname starts with /img, handle those images
    if (requestUrl.pathname.startsWith('/img')) {
      event.respondWith(serveImage(event.request));
      return;
    }

    serveImage(request) => {
      let imageStorageUrl = request.url;

      // Make a new URL with a stripped suffix and extension from the request url
      // '/img/1-medium.jpg' will become '/img/1' then we'll use this as the KEY for
      // storing images into the cache
      imageStorageUrl = imageStorageUrl.replace(/-small\.\w{3}|-medium\.\w{3}|-large\.\w{3}/i, '');

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