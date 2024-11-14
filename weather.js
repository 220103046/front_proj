const apiKey = '445b9096d4f260244a059d5aa247be40'; // Replace 'YOUR_API_KEY' with your actual OpenWeatherMap API key.
let unit = 'metric';

async function getWeatherByCity() {
  const city = document.getElementById("cityInput").value;
  if (!city) return alert("Please enter a city name.");
  const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=${unit}&appid=${apiKey}`;
  fetchWeather(apiUrl);
  get5DayForecast(city);
}

function toggleUnit(selectedUnit) {
  unit = selectedUnit;
  getWeatherByCity();
}

async function fetchWeather(url) {
  try {
    const response = await fetch(url);
    const data = await response.json();
    displayCurrentWeather(data);
  } catch (error) {
    console.error("Error fetching weather data:", error);
  }
}

async function get5DayForecast(city) {
  const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=${unit}&appid=${apiKey}`;
  try {
    const response = await fetch(apiUrl);
    const data = await response.json();
    displayForecast(data);
  } catch (error) {
    console.error("Error fetching forecast data:", error);
  }
}

function displayCurrentWeather(data) {
  document.getElementById("cityName").textContent = data.name;
  document.getElementById("temp").textContent = `${Math.round(data.main.temp)}°`;
  document.getElementById("weatherDescription").textContent = data.weather[0].description;
  document.getElementById("humidity").textContent = `Humidity: ${data.main.humidity}%`;
  document.getElementById("windSpeed").textContent = `Wind Speed: ${data.wind.speed} ${unit === 'metric' ? 'm/s' : 'mph'}`;
  document.getElementById("weatherIcon").innerHTML = `<img src="https://openweathermap.org/img/wn/${data.weather[0].icon}.png" alt="Weather icon">`;
}

function displayForecast(data) {
  const forecastContainer = document.getElementById("forecastContainer");
  forecastContainer.innerHTML = '';
  for (let i = 0; i < data.list.length; i += 8) { // Every 8th item is approximately a daily forecast
    const dayData = data.list[i];
    const dayElement = document.createElement("div");
    dayElement.innerHTML = `
      <p><strong>${new Date(dayData.dt * 1000).toLocaleDateString()}</strong></p>
      <p>${Math.round(dayData.main.temp_max)}° / ${Math.round(dayData.main.temp_min)}°</p>
      <p>${dayData.weather[0].description}</p>
      <img src="https://openweathermap.org/img/wn/${dayData.weather[0].icon}.png" alt="Weather icon">
    `;
    forecastContainer.appendChild(dayElement);
  }
}

function getWeatherByLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(position => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      const apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=${unit}&appid=${apiKey}`;
      fetchWeather(apiUrl);
    });
  } else {
    alert("Geolocation is not supported by this browser.");
  }
}

function autoSuggest() {
  const input = document.getElementById("cityInput").value;
  // Add your autosuggest functionality here if desired.
}
