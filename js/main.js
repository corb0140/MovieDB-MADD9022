const APP = {
  searchForm: document.getElementById("search-form"),
  search: document.getElementById("search"),
  selectOption: document.querySelector(".selectOption"),
  selection: null,
  cardContainer: document.querySelector("#card-container"),
  cacheContainer: document.querySelector("#cache-container"),
  detailsContainer: document.querySelector("#movie-details--container"),
  fetchUrl: "https://moviedb-6n0o.onrender.com/",

  init: () => {
    APP.serviceWorker();

    if (
      window.location.pathname === "/" ||
      window.location.pathname === "/index.html" ||
      window.location.pathname === "/MovieDB-MADD9022/" ||
      window.location.pathname === "/MovieDB-MADD9022/index.html"
    ) {
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

    // call pageParams after clicking submit button
    APP.pageParams();

    if (!navigator.onLine) {
      // call cache results page if offline
      APP.cacheResults();
    }

    // CONNECTED
    console.log("CONNECTED");
  },

  fetchMovies: (sort, keyword) => {
    if (navigator.onLine) {
      if (sort === "popularity" || sort === "release-date" || sort === "vote") {
        fetch(`${APP.fetchUrl}api/${sort}?keyword=${keyword}`, {
          method: "GET",
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error("Network response was not ok");
            }
            return response.json();
          })
          .then(({ data }) => {
            // console.log(data);
            APP.searchResults(data);
          });
      } else {
        fetch(`${APP.fetchUrl}api/id/${sort}`)
          .then((response) => {
            if (!response.ok) {
              throw new Error("Network response was not ok");
            }
            return response.json();
          })
          .then(({ data }) => {
            APP.movieDetails(data);
          })
          .catch((err) => {
            console.log("ServiceWorker not ready", err);
          });
      }
    }
  },

  pageParams: () => {
    let url = new URL(window.location.href);
    let page = url.pathname;
    let params = new URLSearchParams(url.search);

    if (page.endsWith("/searchResults.html")) {
      let sort = params.get("sort");
      let keyword = params.get("keyword");
      APP.fetchMovies(sort, keyword);
    } else if (page.endsWith("/details.html")) {
      let id = params.get("id");

      if (navigator.onLine) {
        APP.fetchMovies(id);
      } else {
        APP.offlineDetails(id);
      }
    }
  },

  searchResults: (data) => {
    let li = document.createElement("li");
    let list = new DocumentFragment();

    data.forEach((movie) => {
      let img =
        movie.poster_path === null
          ? "./img/image-not-found-icon.svg"
          : `https://image.tmdb.org/t/p/w500${movie.poster_path}`;

      li.innerHTML += `
        <div class="card" data-uid=${movie.id}>
            <div class="card-img">
            <img src="${img}" alt="${movie.title}" />
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

    // add onclick event listener to each card
    APP.cardContainer.addEventListener("click", (ev) => {
      const target = ev.target.closest(".card");
      const id = target.getAttribute("data-uid");

      if (id) {
        window.location.href = `./details.html?id=${id}`;
      }
    });
  },

  movieDetails: (data) => {
    APP.detailsContainer.innerHTML = "";

    let img =
      data.poster_path === null
        ? "./img/image-not-found-icon.svg"
        : `https://image.tmdb.org/t/p/w500${data.poster_path}`;

    let detailsCard = document.createElement("div");
    detailsCard.classList.add("details-card");

    detailsCard.innerHTML = `
           <h2>${data.title}</h2>

            <div class="details-card--img">
                <img src="${img}" alt="${data.title}" />
            </div>

            <div class="details-card--content">
                <p>${data.overview}</p>
                <p>Release Date: ${data.release_date}</p>
                <p>Vote Average: ${data.vote_average}</p>
            </div>
            `;

    APP.detailsContainer.appendChild(detailsCard);
  },

  cacheResults: () => {
    console.log("cacheResults");

    navigator.serviceWorker.ready.then((reg) => {
      console.log("Message sent to service worker");
      reg.active.postMessage({ cache: "movieCache" });
    });

    navigator.serviceWorker.addEventListener("message", (ev) => {
      console.log(ev.data.movies);

      const movies = ev.data.movies;

      let li = document.createElement("li");
      let list = new DocumentFragment();

      movies.forEach((movie) => {
        let img =
          movie.data.poster_path === null
            ? "./img/image-not-found-icon.svg"
            : `https://image.tmdb.org/t/p/w500${movie.data.poster_path}`;

        li.innerHTML += `
        <div class="card" data-uid=${movie.data.id}>
            <div class="card-img">
            <img src="${img}" alt="${movie.data.title}" />
            </div>
            <div class="card-content">
            <h2>${movie.data.title}</h2>

            <img src="./img/movie.svg" alt="movie icon" />
            </div>
        </div>
              `;
        list.appendChild(li);
      });
      APP.cacheContainer.appendChild(list);

      APP.cacheContainer.addEventListener("click", (ev) => {
        const target = ev.target.closest(".card");
        const id = target.getAttribute("data-uid");

        if (id) {
          window.location.href = `./details.html?id=${id}`;
        }
      });
    });
  },

  offlineDetails: (id) => {
    navigator.serviceWorker.addEventListener("message", (ev) => {
      const movies = ev.data.movies;

      movies.forEach((movie) => {
        if (movie.data.id === parseInt(id)) {
          let img =
            movie.data.poster_path === null
              ? "./img/image-not-found-icon.svg"
              : `https://image.tmdb.org/t/p/w500${movie.data.poster_path}`;

          let detailsCard = document.createElement("div");
          detailsCard.classList.add("details-card");

          detailsCard.innerHTML = `
           <h2>${movie.data.title}</h2>

            <div class="details-card--img">
                <img src="${img}" alt="${movie.data.title}" />
            </div>

            <div class="details-card--content">
                <p>${movie.data.overview}</p>
                <p>Release Date: ${movie.data.release_date}</p>
                <p>Vote Average: ${movie.data.vote_average}</p>
            </div>
            `;

          APP.detailsContainer.appendChild(detailsCard);
        }
      });
    });
  },

  serviceWorker: () => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("./sw.js").then((reg) => {
        console.log("ServiceWorker registered ", reg);
      });
    }
  },
};

document.addEventListener("DOMContentLoaded", APP.init);
