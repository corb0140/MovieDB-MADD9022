const APP = {
  searchForm: document.getElementById("search-form"),
  search: document.getElementById("search"),
  selectOption: document.querySelector(".selectOption"),
  selection: null,
  cardContainer: document.querySelector(".card-container"),
  fetchUrl: "https://moviedb-6n0o.onrender.com/",
  h1: document.querySelector("h1"),

  init: function () {
    APP.serviceWorker();

    if (window.location.pathname === "/index.html") {
      APP.searchForm.addEventListener("submit", (ev) => {
        ev.preventDefault();

        if (APP.selectOption.value === "popularity") {
          APP.selection = "popularity";
        } else if (APP.selectOption.value === "release-date") {
          APP.selection = "release-date";
        } else if (APP.selectOption.value === "vote") {
          APP.selection = "vote";
        }

        // fetch movies
        // APP.fetchMovies(APP.selection, APP.search.value);

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

  fetchMovies: (selection, keyword) => {
    // fetch(`${APP.fetchUrl}api/${selection}?keyword=${keyword}`)
    //   .then((response) => {
    //     if (!response.ok) {
    //       throw new Error("Network response was not ok");
    //     }
    //     return response.json();
    //   })
    //   .then(({ data }) => {
    //     console.log(data);
    //     APP.cardContainer.innerHTML = "";
    //     console.log(data);
    //     let li = document.createElement("li");
    //     let list = new DocumentFragment();
    //     data.forEach((movie) => {
    //       li.innerHTML += `
    //           <div class="card">
    //               <div class="card-img">
    //               <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}" />
    //               </div>
    //               <div class="card-content">
    //               <h2>${movie.title}</h2>
    //               </div>
    //           </div>
    //         `;
    //       list.appendChild(li);
    //     });
    //     APP.cardContainer.appendChild(list);
    //   });
  },

  searchResults: () => {},

  cacheResults: () => {},

  details: () => {},

  handleMovieClick: () => {},

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
