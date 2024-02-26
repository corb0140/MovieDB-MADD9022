const version = "2";
const cacheName = `movieDB-v${version}`;
const moviesCache = `movie-v${version}`;
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
  let isDetails = url.pathname.endsWith("/details.html");
  let isIndex = url.pathname.endsWith("/index.html");
  let isCSS = url.pathname.endsWith("main.css");
  let isManifest = url.pathname.endsWith("manifest.json");
  let isFont = url.hostname.includes("fonts.googleapis.com");

  if (isOnline) {
    // cache images to main cache if not in cache
    if (!isAPI && !isSearchResults && !isDetails) {
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

    if (isJS) {
      ev.respondWith(
        caches.match("/js/main.js").then((cacheResponse) => {
          return cacheResponse || fetch(ev.request);
        })
      );
    }

    if (isJSON) {
      ev.respondWith(
        caches.match(ev.request).then((cacheResponse) => {
          return cacheResponse || fetch(ev.request);
        })
      );
    }

    if (isDetails) {
      ev.respondWith(
        caches.match("./details.html").then((cacheResponse) => {
          return cacheResponse || fetch(ev.request);
        })
      );
    }

    if (!isAPI) {
      ev.respondWith(
        caches.match(ev.request).then((cacheResponse) => {
          return cacheResponse || fetch(ev.request);
        })
      );
    }

    if (isAPI || isJSON) {
      ev.respondWith(
        caches
          .open(moviesCache)
          .then((cache) => {
            return cache.keys();
          })
          .then((keys) => {
            //retrieve all the files from the cache

            return Promise.all(keys.map((key) => caches.match(key)));
          })
          .then((responses) => {
            //read the json from all the file response objects
            console.log(responses);
            return Promise.all(responses.map((response) => response.json()));
          })
          .then((objects) => {
            //objects is an array that combined all the json into a single response object
            console.log({ objects });
            let combinedFile = new File(
              [JSON.stringify(objects)],
              "combined.json",
              { type: "application/json" }
            );
            let combinedResponse = new Response(combinedFile);
            return combinedResponse;
          })
          .catch((err) => {
            return new Response(null, {
              status: 437,
              statusText: "Invalid Data",
            });
          })
      );
    }
  }
});
