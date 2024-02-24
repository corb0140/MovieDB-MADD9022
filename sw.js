const version = "3";
const cacheName = `MovieDB-v${version}`;
const moviesCache = `movies-v${version}`;
const staticAssets = [
  "./",
  "./index.html",
  "./cacheResults.html",
  "./404.html",
  "./searchResults.html",
  "./details.html",
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
  let mode = ev.request.mode;
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
  let isAPI = url.pathname.startsWith("/api/id");
  let isFont = url.hostname.includes("fonts.googleapis.com");
  let isCSS = url.pathname.includes(".css");
  let isJS = url.pathname.includes(".js");
  let isManifest = url.pathname.includes("manifest.json");
  let isIndex =
    url.pathname.endsWith("/") || url.pathname.endsWith("/index.html");
  let isSearchResults = url.pathname.endsWith("/searchResults.html");

  if (isOnline) {
    // cache images to main cache if not in cache
    if (isImage || isFont || isCSS || isJS || isIndex || isManifest) {
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
    } else {
      // if not in cache, return 404 page
    }

    // Cache to movie cache if movie not in cache
    if (isAPI) {
      ev.respondWith(
        caches.match(ev.request).then((cacheResponse) => {
          return (
            cacheResponse ||
            fetch(ev.request)
              .catch(() => {
                return caches.match("./404.html");
              })
              .then((fetchResponse) => {
                return caches.open(moviesCache).then((cache) => {
                  cache.put(ev.request, fetchResponse.clone());
                  return fetchResponse;
                });
              })
          );
        })
      );
    }
  } else {
    if (isSearchResults) {
      ev.respondWith(
        caches.match("./cacheResults.html").then((cacheResponse) => {
          return cacheResponse;
        })
      );
    }

    if (isImage || isIndex || isCSS || isManifest || isFont) {
      ev.respondWith(
        caches.match(ev.request).catch(() => {
          return caches.match("./404.html");
        })
      );
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
