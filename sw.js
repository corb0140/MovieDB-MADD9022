const version = "1";
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

self.addEventListener("fetch", (ev) => {
  let url = new URL(ev.request.url);
  const isJSON = url.hostname.includes("moviedb-6n0o.onrender.com");
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

  if (isOnline) {
    // if online, fetch the resource
    // ev.respondWith(fetchOnline(ev));
  } else {
    // if offline, respond with cached files
    // ev.respondWith(fetchOffline(ev));
  }
});

const fetchOnline = (ev) => {};

const fetchOffline = (ev) => {};

self.addEventListener("message", (ev) => {});
