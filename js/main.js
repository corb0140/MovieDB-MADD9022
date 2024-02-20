const APP = {
  searchForm: document.getElementById("search-form"),
  search: document.getElementById("search"),
  selectOption: document.querySelector(".selectOption"),
  selection: null,
  cardContainer: document.querySelector("#card-container"),
  fetchUrl: "https://moviedb-6n0o.onrender.com/",

  init: () => {
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

        //  redirect to searchResults.html
        window.location.href = `./searchResults.html?sort=${APP.selection}&keyword=${APP.search.value}`;

        // clear form
        APP.searchForm.reset();
      });
    }
    // call switchPages after setting searchResults url + query
    APP.switchPages();

    // CONNECTED
    console.log("CONNECTED");
  },

  fetchMovies: (sort, keyword) => {
    fetch(`${APP.fetchUrl}api/${sort}?keyword=${keyword}`, { method: "GET" })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then(({ data }) => {
        console.log(data);
        APP.searchResults(data);
      });
  },

  switchPages: () => {
    console.log("switching pages");
    let url = new URL(window.location.href);
    let page = url.pathname;
    let params = new URLSearchParams(url.search);

    console.log(url, page);
    console.log(params.get("sort"), params.get("keyword"));

    if (page.endsWith("searchResults.html")) {
      let sort = params.get("sort");
      let keyword = params.get("keyword");
      APP.fetchMovies(sort, keyword);
    }
  },

  searchResults: (data) => {
    APP.cardContainer.innerHTML = "";

    let li = document.createElement("li");
    let list = new DocumentFragment();
    data.forEach((movie) => {
      li.innerHTML += `
        <div class="card" data-id=${movie.id}>
            <div class="card-img">
            <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}" />
            </div>
            <div class="card-content">
            <h2>${movie.title}</h2>
                  
            <img src="./img/movie.svg" alt="movie icon" />
            </div>
        </div>
          `;
      list.appendChild(li);
    });
    APP.cardContainer.appendChild(list);
  },

  movieDetails: () => {},

  serviceWorker: () => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("./sw.js").then((registration) => {
        console.warn("ServiceWorker registered ", registration);
      });
    }
  },
};

document.addEventListener("DOMContentLoaded", APP.init);
