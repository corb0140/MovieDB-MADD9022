const APP = {
  searchForm: document.getElementById("search-form"),
  search: document.getElementById("search"),
  selectOption: document.querySelector(".selectOption"),
  selection: null,
  cardContainer: document.querySelector(".card-container"),
  h1: document.querySelector("h1"),

  init: function () {
    APP.serviceWorker();

    if (window.location.pathname === "./index.html") {
      APP.searchForm.addEventListener("submit", (ev) => {
        ev.preventDefault();

        if (APP.selectOption.value === "popularity") {
          APP.selection = "popularity";
        } else if (APP.selectOption.value === "release-date") {
          APP.selection = "release-date";
        } else if (APP.selectOption.value === "vote") {
          APP.selection = "vote";
        }

        //  redirect to searchResults.html
        window.location.href = `./searchResults.html?selection=${APP.selection}&keyword=${APP.search.value}`;

        // clear form
        APP.searchForm.reset();
      });
    }
    // Online/Offline
    // APP.online();
    // APP.offline();

    // CONNECTED
    console.log("CONNECTED");
  },

  serviceWorker: () => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("./sw.js").then((registration) => {
        console.warn("ServiceWorker registered ", registration);
      });
    }
  },

  sendMessage: (message) => {
    navigator.serviceWorker.ready.then((reg) => {
      reg.active.postMessage(message);
    });
  },

  receiveMessage: () => {
    navigator.serviceWorker.addEventListener("message", (ev) => {
      console.log("Message received from service worker", ev.data);
    });
  },

  online: () => {
    window.addEventListener("online", () => {
      APP.h1.textContent = "Online";
    });
  },

  offline: () => {
    window.addEventListener("offline", () => {
      APP.h1.textContent = "Offline";
    });
  },
};

document.addEventListener("DOMContentLoaded", APP.init);
