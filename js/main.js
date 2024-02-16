const APP = {
  searchForm: document.getElementById("search-form"),
  search: document.getElementById("search"),
  fetchUrl: "https://moviedb-6n0o.onrender.com/",

  init: function () {},

  fetchMovies: function (query) {
    fetch(`${APP.fetchUrl}search?query=${query}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        return response.json();
      })
      .then((data) => {
        console.log(data);
      });
  },
};

document.addEventListener("DOMContentLoaded", APP.init);
