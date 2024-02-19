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

self.addEventListener("fetch", function (event) {
  console.log("Fetch event for ", event.request.url);
  event.respondWith(
    fetch(event.request).catch(function () {
      console.error("Fetch failed; returning offline page instead.");
      return new Response("You are offline.");
    })
  );
});

// self.addEventListener("fetch", (ev) => {
//   let mode = ev.request.mode;
//   let url = new URL(ev.request.url);
//   const isJSON = url.hostname.includes("moviedb-6n0o.onrender.com");
//   let isOnline = navigator.onLine; // determine if the browser is currently offline
//   let isImage =
//     url.pathname.includes("png") ||
//     url.pathname.includes("jpg") ||
//     url.pathname.includes("jpeg") ||
//     url.pathname.includes("webp") ||
//     url.pathname.includes("gif") ||
//     url.pathname.includes("svg") ||
//     url.pathname.includes("ico") ||
//     url.hostname.includes("image.tmdb.org");
//   let isSearchResults = url.pathname.includes("searchResults.html");
//   let isDetails = url.pathname.includes("details.html");

//   console.log(url);
//   console.log(ev.request);
//   console.log(isJSON);

//   if (isOnline) {
//     // if online, fetch the resource

//     if (mode === "navigate") {
//       if (isSearchResults) {
//         ev.respondWith(
//           fetch(ev.request).catch(() => {
//             return caches.match("./searchResults.html");
//           })
//         );
//       } else if (isDetails) {
//         ev.respondWith(
//           fetch(ev.request).catch(() => {
//             return caches.match("./details.html");
//           })
//         );
//       } else {
//         ev.respondWith(
//           fetch(ev.request).catch(() => {
//             return caches.match("./index.html");
//           })
//         );
//       }
//     }
//   } else {
//     // if offline, respond with cached files

//     if (mode === "navigate") {
//       if (caches.keys().length === 0) {
//         ev.respondWith(
//           fetch(ev.request).catch(() => {
//             return caches.match("./404.html");
//           })
//         );
//       } else {
//         ev.respondWith(
//           fetch(ev.request).catch(() => {
//             return caches.match("./cacheResults.html");
//           })
//         );
//       }
//     }
//   }
// });

self.addEventListener("message", (ev) => {});
