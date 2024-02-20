const APP = {
  searchForm: document.getElementById("search-form"),
  search: document.getElementById("search"),
  selectOption: document.querySelector(".selectOption"),
  selection: null,
  cardContainer: document.querySelector(".card-container"),

  init: function () {
    APP.serviceWorker();

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
      window.location.href = `./searchResults.html?sort=${APP.selection}&keyword=${APP.search.value}`;

      // clear form
      APP.searchForm.reset();
    });

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
};

document.addEventListener("DOMContentLoaded", APP.init);
