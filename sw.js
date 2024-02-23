const version = "1";
const cacheName = `MovieDB-v${version}`;
const moviesCache = `movies-v${version}`;
const staticAssets = [
  "./",
  "./index.html",
  "./cacheResults.html",
  "./404.html",
  "./searchResults.html",
  "./details.html",
  "./js/main.js",
  "./css/main.css",
  "./manifest.json",
  "https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;1,100;1,200;1,300;1,400;1,500;1,600;1,700&display=swap",
];

self.addEventListener("install", (ev) => {
  // cache static files
  ev.waitUntil(
    caches.open(cacheName).then((cache) => {
      return cache.addAll(staticAssets);
    })
  );
});

self.addEventListener("activate", async (ev) => {
  //clear old caches
  ev.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== cacheName && key !== moviesCache)
          .map((key) => caches.delete(key))
      );
    })
  );
});

//

self.addEventListener("fetch", function (ev) {
  let url = new URL(ev.request.url);
  let isOnline = navigator.onLine;
  let isImage =
    url.pathname.includes("png") ||
    url.pathname.includes("jpg") ||
    url.pathname.includes("jpeg") ||
    url.pathname.includes("webp") ||
    url.pathname.includes("gif") ||
    url.pathname.includes("svg") ||
    url.pathname.includes("ico") ||
    url.hostname.includes("image.tmdb.org");
  let isSearchResults = url.pathname.includes("/searchResults.html");
  let isAPI = url.pathname.startsWith("/api/id");

  // cache images to main cache if not in cache
  if (isImage) {
    ev.respondWith(
      caches.match(ev.request).then((cacheResponse) => {
        return (
          cacheResponse ||
          fetch(ev.request).then((fetchResponse) => {
            return caches.open(cacheName).then((cache) => {
              cache.put(ev.request, fetchResponse.clone());
              return fetchResponse;
            });
          })
        );
      })
    );
  }

  // Cache to movie cache if movie not in cache
  if (isAPI) {
    ev.respondWith(
      caches.match(ev.request).then((cacheResponse) => {
        return (
          cacheResponse ||
          fetch(ev.request).then((fetchResponse) => {
            return caches.open(moviesCache).then((cache) => {
              cache.put(ev.request, fetchResponse.clone());
              return fetchResponse;
            });
          })
        );
      })
    );
  }

  if (!isOnline) {
    if (isSearchResults) {
      return ev.respondWith(caches.match("./cacheResults.html"));
    }
  }
});

self.addEventListener("message", (ev) => {
  if (ev.data.cache === "movieCache") {
    caches.open(moviesCache).then((cache) => {
      return cache
        .keys()
        .then((keys) => {
          return Promise.all(
            keys.map((key) => {
              return caches.match(key).then((response) => {
                return response.json();
              });
            })
          );
        })
        .then((data) => {
          if (data) {
            self.clients.get(ev.source.id).then((client) => {
              client.postMessage({ movies: data });
            });
          }
        });
    });
  }
});
