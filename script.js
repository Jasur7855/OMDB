document.addEventListener("DOMContentLoaded", load);

function load() {

  // Элементы
  const main = document.getElementsByClassName("main")[0];
  const movieTitle = document.getElementsByClassName("movieTitle")[0];
  const simularMovieTitle = document.getElementsByClassName("movieTitle")[1];
  const movie = document.getElementsByClassName("movie")[0];
  //Кнопки
  const themeBtn = document.getElementById("themeChange");
  const searchBtn = document.getElementById("searchBtn");

  //Слушатели событий
  if(themeBtn){
    themeBtn.addEventListener("click", changeTheme);
  }
  if(searchBtn){
    searchBtn.addEventListener("click", findMovie);
  }

  document.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      findMovie();
    }
  });

  // Смена темы
  function changeTheme() {
    const body = document.querySelector("body");
    body.classList.toggle("dark");
  }

  // Пойск фильма
  async function findMovie() {
    let search = document.getElementsByName("search")[0].value;
    let loader = document.getElementsByClassName("loader")[0];
    loader.style.display = "block";
    let data = { apikey: "1b7ff984", t: search };
    let result = await sendRequest("https://www.omdbapi.com/", "GET", data);
    loader.style.display = "none";

    if (result.Response == "False") {
      movie.style.display = "none";
      main.style.display = "block";
      movieTitle.style.display = "block";
      movieTitle.innerHTML = `${result.Error}`;
    } else {
      showMovie(result);
      findSimilarMovies();
    }
  }

  function showMovie(movie) {
    main.style.display = "block";
    movieTitle.style.display = "block";
    document.getElementsByClassName("movie")[0].style.display = "flex";
    document.getElementById(
      "movieImg"
    ).style.backgroundImage = `url(${movie.Poster})`;
    movieTitle.innerHTML = `${movie.Title}`;
    const movieDesc = document.getElementsByClassName("movieDescription")[0];
    movieDesc.innerHTML = "";
    let params = [
      "imdbRating",
      "Year",
      "Released",
      "Genre",
      "Country",
      "Language",
      "Director",
      "Writer",
      "Actors",
    ];
    params.forEach((key) => {
      movieDesc.innerHTML += `
      <div class="desc">
            <span class="title">${key}</span>
            <span class="subtitle">${movie[key]}</span>
      </div>
      `;
    });
  }

  async function findSimilarMovies() {
    const search = document.getElementsByName("search")[0].value;
    const similarMovieTitle = document.getElementsByClassName("movieTitle")[1];
    const data = { apikey: "1b7ff984", s: search };
    const result = await sendRequest("https://www.omdbapi.com/", "GET", data);

    if (result.Response == "False") {
    } else {
      similarMovieTitle.style.display = "block";
      similarMovieTitle.innerHTML = `Найдено похожих фильмов: ${result.totalResults}`;

      showSimilarMovies(result.Search);
    }
  }

  function showSimilarMovies(movies) {
    const similarMovies = document.getElementsByClassName("simularMovie")[0];
    similarMovies.innerHTML = "";
    similarMovies.style.display = "grid";
    for (let i = 0; i < movies.length; i++) {
      const movie = movies[i];
      if (movie.Poster != "N/A") {
        let similarMovie = `
            <div class="simularMovieCard" style="background-image: url('${movie.Poster}');">
                <div class="saved" onclick="addSaved(event)" 
                data-imdbID="${movie.imdbID}" data-title="${movie.Title}" data-poster="${movie.Poster}">
                   
                </div>
                <div class="simularMovieTitle"  > 
                    ${movie.Title}
                </div>
            </div>`;
        similarMovies.innerHTML += similarMovie;
      }
    }
  }

  function addSaved(event) {
    const target = event.currentTarget;

    const movieData = {
      imdbID: target.getAttribute("data-imdbID"),
      title: target.getAttribute("data-title"),
      poster: target.getAttribute("data-poster"),
    };

    let favs = JSON.parse(localStorage.getItem("favs")) || [];

    const movieIndex = favs.findIndex(
      (movie) => movie.imdbID === movieData.imdbID
    );

    if (movieIndex > -1) {
      favs.splice(movieIndex, 1);
      localStorage.setItem("favs", JSON.stringify(favs));
      // alert(`Фильм "${movieData.title}" удален из избранного!`);
      console.log(favs);
    } else {
      // Если фильма нет, добавляем его
      favs.push(movieData);
      localStorage.setItem("favs", JSON.stringify(favs));
      // alert(`Фильм "${movieData.title}" добавлен в избранное!`);
      console.log(favs);
    }
  }

  async function sendRequest(url, method, data) {
    if (method == "POST") {
      let response = await fetch(url, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      response = await response.json();
      return response;
    } else if (method == "GET") {
      url = url + "?" + new URLSearchParams(data);
      let response = await fetch(url, {
        method: "GET",
      });
      response = await response.json();
      return response;
    }
  }
}
