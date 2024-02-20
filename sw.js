const version = "2";
const cacheName = `MovieDB-v${version}`;
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
        keys.filter((key) => key !== cacheName).map((key) => caches.delete(key))
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
  // let isDetails = url.pathname.includes("./details.html");

  if (isOnline) {
    // if online, fetch the resource

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
  } else {
    // if offline, respond with cached files
    if (mode === "navigate") {
      if (isSearchResults) {
        ev.respondWith(caches.match("./cacheResults.html"));
      }
    }
  }
});
