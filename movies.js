const apiKey = '3c4495ed9a4ae83ca2e09f757c853f32';
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const moviesGrid = document.getElementById('moviesGrid');
const suggestionsBox = document.getElementById('suggestions');
const modal = document.getElementById('movieDetailsModal');
const movieDetails = document.getElementById('movieDetails');
const closeModal = document.getElementById('closeModal');

// Sorting buttons
const sortPopularity = document.getElementById('sortPopularity');
const sortReleaseDate = document.getElementById('sortReleaseDate');
const sortRating = document.getElementById('sortRating');

// Watchlist elements
const watchlistButton = document.getElementById('watchlistButton');
const watchlistModal = document.getElementById('watchlistModal');
const closeWatchlistModal = document.getElementById('closeWatchlistModal');
const watchlistContent = document.getElementById('watchlistContent');

// Fetch movies based on search input
async function fetchMovies(query) {
    const url = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${query}`;
    const response = await fetch(url);
    const data = await response.json();
    displayMovies(data.results);
}

// Display movies in grid
function displayMovies(movies) {
    moviesGrid.innerHTML = '';
    movies.forEach(movie => {
        const movieCard = document.createElement('div');
        movieCard.classList.add('movie-card');
        
        // Add data attributes for sorting
        movieCard.setAttribute('data-popularity', movie.popularity || 0);
        movieCard.setAttribute('data-release-date', movie.release_date || '1970-01-01');
        movieCard.setAttribute('data-rating', movie.vote_average || 0);

        movieCard.innerHTML = `
            <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}">
            <h3>${movie.title}</h3>
            <p>${movie.release_date || 'Unknown'}</p>
        `;
        movieCard.onclick = () => showMovieDetails(movie.id);
        moviesGrid.appendChild(movieCard);
    });
}

// Show movie details in modal
async function showMovieDetails(movieId) {
    const url = `https://api.themoviedb.org/3/movie/${movieId}?api_key=${apiKey}&append_to_response=credits,videos`;
    const response = await fetch(url);
    const movie = await response.json();
    movieDetails.innerHTML = `
        <h2>${movie.title}</h2>
        <p>${movie.overview}</p>
        <p><strong>Rating:</strong> ${movie.vote_average}</p>
        <button onclick="toggleWatchlist(${movie.id}, '${movie.title}')">
            ${isInWatchlist(movie.id) ? 'Remove from' : 'Add to'} Watchlist
        </button>
    `;
    modal.classList.remove('hidden');
}

// Close modal
closeModal.onclick = () => modal.classList.add('hidden');

// Add or Remove from Watchlist
function toggleWatchlist(movieId, movieTitle) {
    let watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];
    if (isInWatchlist(movieId)) {
        watchlist = watchlist.filter(movie => movie.id !== movieId);
        alert(`${movieTitle} removed from your watchlist.`);
    } else {
        watchlist.push({ id: movieId, title: movieTitle });
        alert(`${movieTitle} added to your watchlist.`);
    }
    localStorage.setItem('watchlist', JSON.stringify(watchlist));
}

// Check if a movie is in the watchlist
function isInWatchlist(movieId) {
    const watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];
    return watchlist.some(movie => movie.id === movieId);
}

// Display Watchlist in modal
watchlistButton.onclick = () => displayWatchlist();
closeWatchlistModal.onclick = () => watchlistModal.classList.add('hidden');

function displayWatchlist() {
    const watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];
    
    watchlistContent.innerHTML = ''; // Clear previous list

    if (watchlist.length === 0) {
        watchlistContent.innerHTML = '<p>Your watchlist is empty.</p>';
    } else {
        watchlist.forEach(movie => {
            const watchlistItem = document.createElement('div');
            watchlistItem.classList.add('watchlist-item');
            watchlistItem.innerHTML = `
                <h3>${movie.title}</h3>
                <button onclick="removeFromWatchlist(${movie.id})">Remove</button>
            `;
            watchlistContent.appendChild(watchlistItem);
        });
    }

    watchlistModal.classList.remove('hidden'); // Show modal
}

// Remove movie from Watchlist
function removeFromWatchlist(movieId) {
    let watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];
    watchlist = watchlist.filter(movie => movie.id !== movieId);
    localStorage.setItem('watchlist', JSON.stringify(watchlist));
    displayWatchlist(); // Update Watchlist after removal
}

// Sorting functionality
sortPopularity.onclick = () => sortMovies('popularity');
sortReleaseDate.onclick = () => sortMovies('release-date');
sortRating.onclick = () => sortMovies('rating');

function sortMovies(criteria) {
    const movieCards = Array.from(moviesGrid.children);

    movieCards.sort((a, b) => {
        if (criteria === 'popularity') {
            return parseFloat(b.dataset.popularity) - parseFloat(a.dataset.popularity);
        } else if (criteria === 'release-date') {
            return new Date(b.dataset.releaseDate) - new Date(a.dataset.releaseDate);
        } else if (criteria === 'rating') {
            return parseFloat(b.dataset.rating) - parseFloat(a.dataset.rating);
        }
    });

    moviesGrid.innerHTML = '';
    movieCards.forEach(card => moviesGrid.appendChild(card));
}

// Search button event
searchButton.onclick = () => {
    const query = searchInput.value;
    fetchMovies(query);
};

// Auto-suggest feature
searchInput.addEventListener('input', async () => {
    const query = searchInput.value;
    if (query.length < 3) return;
    const url = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${query}`;
    const response = await fetch(url);
    const data = await response.json();
    showSuggestions(data.results);
});

function showSuggestions(movies) {
    suggestionsBox.innerHTML = '';
    movies.slice(0, 5).forEach(movie => {
        const suggestion = document.createElement('div');
        suggestion.textContent = movie.title;
        suggestion.onclick = () => {
            searchInput.value = movie.title;
            suggestionsBox.innerHTML = '';
            fetchMovies(movie.title);
        };
        suggestionsBox.appendChild(suggestion);
    });
}
