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
          .filter((key) => key !== cacheName && moviesCache)
          .map((key) => caches.delete(key))
      );
    })
  );
});

//

self.addEventListener("fetch", (ev) => {
  let mode = ev.request.mode;
  let url = new URL(ev.request.url);
  let isOnline = navigator.onLine; // determine if the browser is currently offline
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
  let isCSS = url.pathname.endsWith(".css");

  if (isOnline) {
    // if online, fetch the resource
    if (isImage) {
      ev.respondWith(
        caches
          .match(ev.request)
          .then((response) => {
            if (response) {
              return response;
            }

            return fetch(ev.request).then((fetchResponse) => {
              if (fetchResponse.status > 0 && !fetchResponse.ok)
                throw Error("no data");
              return caches.open(cacheName).then((cache) => {
                cache.put(ev.request, fetchResponse.clone());
                return fetchResponse;
              });
            });
          })
          .catch(() => {
            return caches.match("./404.html");
          })
      );
    }

    // store api responses for movie details in a separate cache
    if (isAPI) {
      ev.respondWith(
        caches.match(ev.request).then((response) => {
          if (response) {
            return response;
          }

          return fetch(ev.request).then((response) => {
            return caches.open(moviesCache).then((cache) => {
              cache.put(ev.request, response.clone());
              return response;
            });
          });
        })
      );
    }
  } else {
    // if offline, respond with cached files
    if (mode === "navigate") {
      if (isSearchResults) {
        ev.respondWith(caches.match("./cacheResults.html"));
      }
    }
  }
});

self.addEventListener("message", (ev) => {
  if (ev.data.cache === "movieCache") {
    // Retrieve cached movie details and send them to cacheResults.html
    caches.open(moviesCache).then((cache) => {
      return cache
        .keys()
        .then((keys) => {
          return Promise.all(
            keys.map((key) => {
              return cache.match(key).then((response) => {
                if (response) {
                  return response.json();
                }
              });
            })
          );
        })
        .then((cachedMovies) => {
          // Send cached movie details to cacheResults.html
          ev.source.postMessage({ movies: cachedMovies });
        });
    });
  }
});
