const version = "4";
const cacheName = `MovieDB-v${version}`;
const moviesCache = `movies-v${version}`;
const staticAssets = [
  "./",
  "./index.html",
  "./cacheResults.html",
  "./404.html",
  "./searchResults.html",
  "./details.html",
  "./manifest.json",
  "./css/main.css",
  "./js/main.js",
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
  let isAPI = url.pathname.startsWith("/api");
  let isJSON = url.pathname.includes("/api/id");
  let isJS = url.pathname.endsWith("main.js");
  let isSearchResults = url.pathname.endsWith("/searchResults.html");

  if (isOnline) {
    // cache images to main cache if not in cache
    if (!isAPI && !isSearchResults) {
      ev.respondWith(
        caches.match(ev.request).then((cacheResponse) => {
          return (
            cacheResponse ||
            fetch(ev.request).then((fetchResponse) => {
              console.log(fetchResponse);

              if (fetchResponse.status === 404) {
                return caches.match("./404.html");
              }
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
    if (isJSON) {
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
  } else {
    if (isSearchResults) {
      ev.respondWith(
        caches.match("./cacheResults.html").then((cacheResponse) => {
          return cacheResponse;
        })
      );
    }

    if (!isSearchResults) {
      ev.respondWith(
        caches.match(ev.request).catch(() => {
          return caches.match("./404.html");
        })
      );
    }

    if (isJS) {
      ev.respondWith(
        caches.match("/js/main.js").then((cacheResponse) => {
          return cacheResponse || fetch(ev.request);
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
