const API_KEY = 'f7db11ec528e4cf3975336ac3e27ec53';
const BASE_URL = 'https://api.spoonacular.com/recipes';

// DOM Elements
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const recipesContainer = document.getElementById('recipes-container');
const suggestionsList = document.getElementById('suggestions');
const recipeModal = document.getElementById('recipe-modal');
const recipeTitle = document.getElementById('recipe-title');
const ingredientsList = document.getElementById('ingredients-list');
const instructions = document.getElementById('instructions');
const nutrition = document.getElementById('nutrition');
const closeBtn = document.querySelector('.close-btn');
const favoriteBtn = document.getElementById('favorite-btn');
const recentlyViewedContainer = document.getElementById('recently-viewed-container');
const favoritesContainer = document.getElementById('favorites-container');

// Local storage for favorites and recently viewed recipes
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
let recentlyViewed = JSON.parse(localStorage.getItem('recentlyViewed')) || [];

// Fetch suggestions
searchInput.addEventListener('input', async () => {
    const query = searchInput.value;
    if (query.length > 2) {
        const suggestions = await fetchSuggestions(query);
        displaySuggestions(suggestions);
    } else {
        suggestionsList.innerHTML = '';
    }
});

async function fetchSuggestions(query) {
    const response = await fetch(`${BASE_URL}/autocomplete?query=${query}&number=5&apiKey=${API_KEY}`);
    if (!response.ok) return [];
    return response.json();
}

function displaySuggestions(suggestions) {
    suggestionsList.innerHTML = '';
    suggestions.forEach(item => {
        const li = document.createElement('li');
        li.textContent = item.title;
        li.onclick = () => {
            searchInput.value = item.title;
            suggestionsList.innerHTML = '';
        };
        suggestionsList.appendChild(li);
    });
}

// Search recipes
searchBtn.addEventListener('click', async () => {
    const query = searchInput.value;
    recipesContainer.innerHTML = '<p>Loading recipes...</p>';
    const recipes = await fetchRecipes(query);
    displayRecipes(recipes);
});

async function fetchRecipes(query) {
    const response = await fetch(`${BASE_URL}/complexSearch?query=${query}&addRecipeInformation=true&apiKey=${API_KEY}`);
    if (!response.ok) return [];
    const data = await response.json();
    return data.results;
}

// Display recipes
function displayRecipes(recipes) {
    recipesContainer.innerHTML = '';
    recipes.forEach(recipe => {
        const card = document.createElement('div');
        card.classList.add('recipe-card');
        card.innerHTML = `
            <img src="${recipe.image}" alt="${recipe.title}">
            <h3>${recipe.title}</h3>
            <p>Ready in ${recipe.readyInMinutes || 'N/A'} minutes</p>
            <p>${recipe.summary?.slice(0, 100) || 'No description available'}...</p>
        `;
        card.onclick = () => {
            openRecipeModal(recipe.id);
            addRecentlyViewed(recipe);
        };
        recipesContainer.appendChild(card);
    });
}

// Open recipe modal
async function openRecipeModal(id) {
    const response = await fetch(`${BASE_URL}/${id}/information?apiKey=${API_KEY}`);
    if (!response.ok) return;
    const recipe = await response.json();

    recipeTitle.textContent = recipe.title;
    ingredientsList.innerHTML = recipe.extendedIngredients.map(ing => `<li>${ing.original}</li>`).join('');
    instructions.textContent = recipe.instructions || 'No instructions available';
    nutrition.textContent = `Calories: ${recipe.nutrition?.nutrients[0]?.amount || 'N/A'} kcal`;

    favoriteBtn.onclick = () => addToFavorites(recipe);
    recipeModal.style.display = 'block';
}

closeBtn.onclick = () => (recipeModal.style.display = 'none');
window.onclick = (event) => {
    if (event.target === recipeModal) {
        recipeModal.style.display = 'none';
    }
};

// Add to favorites
function addToFavorites(recipe) {
    if (!favorites.some(fav => fav.id === recipe.id)) {
        favorites.push(recipe);
        localStorage.setItem('favorites', JSON.stringify(favorites));
        alert('Recipe added to favorites!');
        displayFavorites();
    } else {
        alert('Recipe is already in favorites!');
    }
}

// Add to recently viewed
function addRecentlyViewed(recipe) {
    if (!recentlyViewed.some(viewed => viewed.id === recipe.id)) {
        recentlyViewed.unshift(recipe);  // Add to the beginning
        if (recentlyViewed.length > 10) recentlyViewed.pop();  // Limit to 10
        localStorage.setItem('recentlyViewed', JSON.stringify(recentlyViewed));
        displayRecentlyViewed();
    }
}

// Display recently viewed recipes
function displayRecentlyViewed() {
    recentlyViewedContainer.innerHTML = recentlyViewed.length ? '' : '<p>No recently viewed recipes yet.</p>';
    recentlyViewed.forEach(recipe => {
        const card = document.createElement('div');
        card.classList.add('recipe-card');
        card.innerHTML = `
            <img src="${recipe.image}" alt="${recipe.title}">
            <h3>${recipe.title}</h3>
            <p>Ready in ${recipe.readyInMinutes || 'N/A'} minutes</p>
        `;
        recentlyViewedContainer.appendChild(card);
    });
}

// Display favorites
function displayFavorites() {
    favoritesContainer.innerHTML = favorites.length ? '' : '<p>No favorite recipes yet.</p>';
    favorites.forEach(fav => {
        const card = document.createElement('div');
        card.classList.add('recipe-card');
        card.innerHTML = `
            <img src="${fav.image}" alt="${fav.title}">
            <h3>${fav.title}</h3>
            <button onclick="removeFromFavorites(${fav.id})">Remove from Favorites</button>
        `;
        favoritesContainer.appendChild(card);
    });
}

function removeFromFavorites(id) {
    favorites = favorites.filter(fav => fav.id !== id);
    localStorage.setItem('favorites', JSON.stringify(favorites));
    displayFavorites();
}

// Display initial favorites and recently viewed
document.addEventListener('DOMContentLoaded', function () {
    displayFavorites();
    displayRecentlyViewed();
});
