// ---------------- DARK MODE ----------------
document.getElementById('darkModeIcon').addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
});

// ---------------- SEARCH TOGGLE ----------------
const searchIcon = document.getElementById('searchIcon');
const searchInput = document.getElementById('searchInput');
searchIcon.addEventListener('click', () => {
  searchInput.classList.toggle('show');
  if (searchInput.classList.contains('show')) searchInput.focus();
});

// ---------------- TMDb CONFIG ----------------
const API_KEY = "a786e14e27d8eb49d513c53352b755be";
const BASE_URL = "https://api.themoviedb.org/3";
const IMG_BASE = "https://image.tmdb.org/t/p/w500";

// ---------------- FETCH FUNCTIONS ----------------
async function fetchMovies(url) {
  const res = await fetch(url);
  const data = await res.json();
  return data.results;
}

async function fetchTrailer(id) {
  const res = await fetch(`${BASE_URL}/movie/${id}/videos?api_key=${API_KEY}&language=en-US`);
  const data = await res.json();
  const trailer = data.results.find(v => v.type === "Trailer" && v.site === "YouTube");
  return trailer ? trailer.key : null;
}

// ---------------- MOVIE DISPLAY ----------------
function clearMovies() {
  document.getElementById('row2').innerHTML = '';
}

function createMovieCard(movie) {
  const stars = Math.round(movie.vote_average / 2);
  const div = document.createElement('div');
  div.className = 'movie-card';
  div.innerHTML = `
    <img src="${IMG_BASE}${movie.poster_path}" alt="${movie.title}">
    <div class="movie-info">
      <h3>${movie.title}</h3>
      <div class="stars">${'⭐'.repeat(stars)}</div>
    </div>
  `;
  div.addEventListener('click', async () => {
    const key = await fetchTrailer(movie.id);
    if (key) window.open(`https://www.youtube.com/watch?v=${key}`, "_blank");
  });
  return div;
}

// Display movies either by genre or search
async function displayMovies(url) {
  const movies = await fetchMovies(url);
  if (!movies || movies.length === 0) return;

  const featured1 = document.getElementById('featured1');
  featured1.querySelector('img').src = `https://image.tmdb.org/t/p/original${movies[0].backdrop_path}`;
  featured1.querySelector('.featured-title').textContent = movies[0].title;
  featured1.onclick = async () => {
    const key = await fetchTrailer(movies[0].id);
    if (key) window.open(`https://www.youtube.com/watch?v=${key}`, "_blank");
  };

  clearMovies();
  const row = document.getElementById('row2');
  movies.slice(1, 10).forEach(movie => row.appendChild(createMovieCard(movie)));
}

// ---------------- GENRE MAPPING ----------------
const genreMap = {
  "Horror": 27,
  "Romance": 10749,
  "Action": 28,
  "Comedy": 35,
  "Sci-Fi": 878,
  "Documentary": 99,
  "Drama": 18
};

// ---------------- SIDEBAR HANDLER ----------------
document.querySelectorAll('.sidebar a').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const genreName = e.target.textContent.trim();
    const genreId = genreMap[genreName];
    if (genreId) {
      displayMovies(`${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${genreId}&sort_by=popularity.desc&page=1`);
    }
  });
});

// ---------------- SEARCH HANDLER ----------------
searchInput.addEventListener('keypress', e => {
  if (e.key === 'Enter') {
    const query = searchInput.value.trim();
    if (query) {
      displayMovies(`${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}&page=1`);
    }
  }
});

// ---------------- INITIAL POPULAR MOVIES ----------------
displayMovies(`${BASE_URL}/movie/popular?api_key=${API_KEY}&language=en-US&page=1`);
