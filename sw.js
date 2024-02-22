const version = "5";
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
          .filter((key) => key !== cacheName && key !== moviesCache)
          .map((key) => caches.delete(key))
      );
    })
  );
});

//

self.addEventListener("fetch", function (ev) {
  let url = new URL(ev.request.url);
  let isOnline = navigator.onLine; // determine if the browser is currently offline
  let isIndex = url.pathname.includes("/index.html");
  let isCSS = url.pathname.endsWith(".css");
  let isJS = url.pathname.endsWith(".js");
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
  let isFont = url.hostname.includes("fonts.googleapis.com");
  let isManifest = url.pathname.endsWith("manifest.json");
  let isSocket = url.protocol.startsWith("ws");

  if (isOnline) {
    // if online, fetch the resource
    if (isImage || isFont) {
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
    // if offline, show cacheResults.html if user is on searchResults.html
    if (isSearchResults) {
      ev.respondWith(caches.match("./cacheResults.html"));
    }

    if (
      isImage ||
      isFont ||
      isCSS ||
      isJS ||
      isManifest ||
      isSocket ||
      isIndex
    ) {
      ev.respondWith(caches.match(ev.request));
    }
  }
});

self.addEventListener("message", (ev) => {
  if (ev.data.cache === "movieCache") {
    // Retrieve cached movie details
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
          // Send cached movie details to main
          clients.matchAll().then((clients) => {
            clients.forEach((client) => {
              client.postMessage({ movies: cachedMovies });
            });
          });
        });
    });
  }
});
