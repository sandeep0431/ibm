
class WeatherDashboard {
    constructor() {
        this.API_KEY = 'b514fe7ef891e035f7fba8aa70f32755';
        this.BASE_URL = 'https://api.openweathermap.org/data/2.5';
        this.currentWeather = null;
        this.forecast = [];
        this.isLoading = false;
        
        this.initializeElements();
        this.bindEvents();
        this.loadCurrentLocation();
    }

    initializeElements() {
        // Form elements
        this.searchForm = document.getElementById('search-form');
        this.cityInput = document.getElementById('city-input');
        this.searchBtn = document.getElementById('search-btn');
        this.locationBtn = document.getElementById('location-btn');

        // Display elements
        this.loadingEl = document.getElementById('loading');
        this.currentWeatherEl = document.getElementById('current-weather');
        this.forecastEl = document.getElementById('forecast');
        this.initialStateEl = document.getElementById('initial-state');

        // Current weather elements
        this.weatherIcon = document.getElementById('weather-icon');
        this.temperature = document.getElementById('temperature');
        this.description = document.getElementById('description');
        this.location = document.getElementById('location');
        this.humidity = document.getElementById('humidity');
        this.wind = document.getElementById('wind');
        this.visibility = document.getElementById('visibility');
        this.pressure = document.getElementById('pressure');
        this.sunrise = document.getElementById('sunrise');
        this.sunset = document.getElementById('sunset');

        // Forecast elements
        this.forecastList = document.getElementById('forecast-list');

        // Travel advisory elements
        this.travelAdvisoryEl = document.getElementById('travel-advisory');

        // App element
        this.app = document.getElementById('app');
    }

    bindEvents() {
        this.searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const city = this.cityInput.value.trim();
            if (city) {
                this.searchWeatherByCity(city);
                this.cityInput.value = '';
            }
        });

        this.locationBtn.addEventListener('click', () => {
            this.loadCurrentLocation();
        });
    }

    showLoading() {
        this.isLoading = true;
        this.setLoadingState(true);
        this.loadingEl.classList.remove('hidden');
        this.currentWeatherEl.classList.add('hidden');
        this.forecastEl.classList.add('hidden');
        this.travelAdvisoryEl.classList.add('hidden');
        this.initialStateEl.classList.add('hidden');
    }

    hideLoading() {
        this.isLoading = false;
        this.setLoadingState(false);
        this.loadingEl.classList.add('hidden');
    }

    setLoadingState(loading) {
        this.cityInput.disabled = loading;
        this.searchBtn.disabled = loading;
        this.locationBtn.disabled = loading;

        // Update button icons
        if (loading) {
            this.searchBtn.innerHTML = '<div class="loading-spinner" style="width: 1.25rem; height: 1.25rem; margin: 0;"></div>';
            this.locationBtn.innerHTML = '<div class="loading-spinner" style="width: 1.25rem; height: 1.25rem; margin: 0;"></div>';
        } else {
            this.searchBtn.innerHTML = `
                <svg class="btn-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.35-4.35"></path>
                </svg>
            `;
            this.locationBtn.innerHTML = `
                <svg class="btn-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                </svg>
            `;
        }
    }

    async loadCurrentLocation() {
        if (!navigator.geolocation) {
            this.showToast('Error', 'Geolocation is not supported by this browser', 'error');
            return;
        }

        this.showLoading();

        try {
            const position = await this.getCurrentPosition();
            await this.loadWeatherData(position.coords.latitude, position.coords.longitude);
        } catch (error) {
            console.error('Error getting location:', error);
            this.showToast(
                'Location Access Denied',
                'Please search for a city manually or enable location access.',
                'error'
            );
        } finally {
            this.hideLoading();
        }
    }

    getCurrentPosition() {
        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
                resolve,
                reject,
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 300000
                }
            );
        });
    }

    async loadWeatherData(lat, lon) {
        try {
            const [weatherData, forecastData] = await Promise.all([
                this.fetchCurrentWeather(lat, lon),
                this.fetchForecast(lat, lon)
            ]);

            this.currentWeather = weatherData;
            this.forecast = forecastData;

            this.updateWeatherDisplay();
            this.updateForecastDisplay();
            this.updateTravelAdvisory();
            this.updateBackground();

            this.showToast(
                'Weather Updated',
                `Showing weather for ${weatherData.name}, ${weatherData.country}`,
                'success'
            );
        } catch (error) {
            console.error('Error loading weather data:', error);
            this.showToast(
                'Error',
                'Failed to load weather data. Please try again.',
                'error'
            );
        }
    }

    async searchWeatherByCity(city) {
        this.showLoading();

        try {
            const [weatherData, forecastData] = await Promise.all([
                this.fetchWeatherByCity(city),
                this.fetchForecastByCity(city)
            ]);

            this.currentWeather = weatherData;
            this.forecast = forecastData;

            this.updateWeatherDisplay();
            this.updateForecastDisplay();
            this.updateTravelAdvisory();
            this.updateBackground();

            this.showToast(
                'Weather Updated',
                `Showing weather for ${weatherData.name}, ${weatherData.country}`,
                'success'
            );
        } catch (error) {
            console.error('Error searching city:', error);
            this.showToast(
                'City Not Found',
                'Please check the city name and try again.',
                'error'
            );
        } finally {
            this.hideLoading();
        }
    }

    async fetchCurrentWeather(lat, lon) {
        const response = await fetch(
            `${this.BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${this.API_KEY}&units=metric`
        );

        if (!response.ok) {
            throw new Error('Failed to fetch weather data');
        }

        const data = await response.json();
        return this.transformWeatherData(data);
    }

    async fetchWeatherByCity(city) {
        const response = await fetch(
            `${this.BASE_URL}/weather?q=${encodeURIComponent(city)}&appid=${this.API_KEY}&units=metric`
        );

        if (!response.ok) {
            throw new Error('Failed to fetch weather data');
        }

        const data = await response.json();
        return this.transformWeatherData(data);
    }

    async fetchForecast(lat, lon) {
        const response = await fetch(
            `${this.BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${this.API_KEY}&units=metric`
        );

        if (!response.ok) {
            throw new Error('Failed to fetch forecast data');
        }

        const data = await response.json();
        return this.transformForecastData(data);
    }

    async fetchForecastByCity(city) {
        const response = await fetch(
            `${this.BASE_URL}/forecast?q=${encodeURIComponent(city)}&appid=${this.API_KEY}&units=metric`
        );

        if (!response.ok) {
            throw new Error('Failed to fetch forecast data');
        }

        const data = await response.json();
        return this.transformForecastData(data);
    }

    transformWeatherData(data) {
        return {
            name: data.name,
            country: data.sys.country,
            temperature: Math.round(data.main.temp),
            condition: data.weather[0].main,
            description: data.weather[0].description,
            humidity: data.main.humidity,
            windSpeed: Math.round(data.wind.speed * 3.6),
            windDirection: data.wind.deg,
            pressure: data.main.pressure,
            visibility: data.visibility / 1000,
            sunrise: data.sys.sunrise,
            sunset: data.sys.sunset,
            icon: data.weather[0].icon
        };
    }

    transformForecastData(data) {
        const dailyData = new Map();

        data.list.forEach(item => {
            const date = new Date(item.dt * 1000);
            const dayKey = date.toDateString();

            if (!dailyData.has(dayKey)) {
                dailyData.set(dayKey, {
                    date: item.dt_txt.split(' ')[0],
                    temperatures: [],
                    conditions: [],
                    humidity: [],
                    windSpeeds: [],
                    icons: []
                });
            }

            const dayData = dailyData.get(dayKey);
            dayData.temperatures.push(item.main.temp_min, item.main.temp_max);
            dayData.conditions.push(item.weather[0].main);
            dayData.humidity.push(item.main.humidity);
            dayData.windSpeeds.push(item.wind.speed);
            dayData.icons.push(item.weather[0].icon);
        });

        return Array.from(dailyData.entries())
            .slice(0, 5)
            .map(([dayKey, dayData]) => {
                const date = new Date(dayKey);
                const temperatures = dayData.temperatures;
                const mostCommonCondition = this.getMostCommon(dayData.conditions);
                const mostCommonIcon = this.getMostCommon(dayData.icons);

                return {
                    date: dayData.date,
                    day: date.toLocaleDateString('en-US', { weekday: 'short' }),
                    temperature: {
                        min: Math.round(Math.min(...temperatures)),
                        max: Math.round(Math.max(...temperatures))
                    },
                    condition: mostCommonCondition,
                    icon: mostCommonIcon,
                    humidity: Math.round(dayData.humidity.reduce((a, b) => a + b, 0) / dayData.humidity.length),
                    windSpeed: Math.round((dayData.windSpeeds.reduce((a, b) => a + b, 0) / dayData.windSpeeds.length) * 3.6)
                };
            });
    }

    getMostCommon(arr) {
        const counts = arr.reduce((acc, val) => {
            acc[val] = (acc[val] || 0) + 1;
            return acc;
        }, {});

        return Object.entries(counts).reduce((a, b) =>
            counts[a[0]] > counts[b[0]] ? a : b
        )[0];
    }

    generateTravelAdvisory(weatherData) {
        const { condition, temperature, windSpeed, visibility, humidity } = weatherData;
        const conditionLower = condition.toLowerCase();
        
        let safetyLevel = 'safe';
        let message = '';
        let recommendations = [];
        
        // Analyze weather conditions
        const isClear = conditionLower.includes('clear') || conditionLower.includes('sunny');
        const isCloudy = conditionLower.includes('cloud');
        const isRainy = conditionLower.includes('rain') || conditionLower.includes('drizzle');
        const isStormy = conditionLower.includes('thunder') || conditionLower.includes('storm');
        const isSnowy = conditionLower.includes('snow');
        const isFoggy = conditionLower.includes('mist') || conditionLower.includes('fog');
        
        const isExtremeHeat = temperature > 35;
        const isExtremeCold = temperature < -10;
        const isHighWind = windSpeed > 50;
        const isLowVisibility = visibility < 1;
        
        // Determine safety level and message
        if (isStormy || isHighWind || isLowVisibility) {
            safetyLevel = 'warning';
            message = '⚠️ Travel is not recommended. Hazardous weather conditions present significant risks.';
            recommendations = [
                'Postpone travel if possible',
                'If you must travel, check road conditions frequently',
                'Keep emergency supplies in your vehicle',
                'Share your travel plans with someone',
                'Stay updated with weather alerts'
            ];
        } else if (isSnowy || isExtremeHeat || isExtremeCold || (isRainy && windSpeed > 30)) {
            safetyLevel = 'caution';
            message = '⚡ Travel with caution. Weather conditions require extra attention and preparation.';
            
            if (isSnowy) {
                recommendations = [
                    'Drive slowly and maintain safe distance',
                    'Use winter tires or chains if available',
                    'Clear all windows and lights before driving',
                    'Bring warm clothing and blankets',
                    'Keep your fuel tank at least half full'
                ];
            } else if (isExtremeHeat) {
                recommendations = [
                    'Stay hydrated - carry extra water',
                    'Use sunscreen and wear light-colored clothing',
                    'Plan indoor activities during peak heat hours',
                    'Check vehicle cooling system',
                    'Never leave children or pets in vehicles'
                ];
            } else if (isExtremeCold) {
                recommendations = [
                    'Dress in layers with warm clothing',
                    'Protect extremities from frostbite',
                    'Limit time outdoors',
                    'Keep emergency supplies and blankets',
                    'Check vehicle battery and antifreeze levels'
                ];
            } else {
                recommendations = [
                    'Drive carefully on wet roads',
                    'Use headlights for better visibility',
                    'Allow extra travel time',
                    'Keep windshield wipers in good condition',
                    'Watch for standing water on roads'
                ];
            }
        } else if (isRainy || isFoggy || isCloudy) {
            safetyLevel = 'caution';
            message = '🌤️ Fair travel conditions, but stay alert. Minor weather factors may affect your journey.';
            
            if (isFoggy) {
                recommendations = [
                    'Use fog lights and reduce speed',
                    'Increase following distance',
                    'Use road markings as a guide',
                    'Avoid overtaking',
                    'Turn on hazard lights if visibility is very poor'
                ];
            } else {
                recommendations = [
                    'Carry an umbrella or rain jacket',
                    'Drive with headlights on',
                    'Watch for slippery surfaces',
                    'Plan for potential delays',
                    'Keep a safe distance from other vehicles'
                ];
            }
        } else {
            safetyLevel = 'safe';
            message = '✅ Excellent conditions for travel! The weather is favorable for all outdoor activities.';
            recommendations = [
                'Perfect weather for sightseeing',
                'Great time for outdoor activities',
                'Comfortable for walking and exploring',
                'Ideal for photography and nature walks',
                'Pack light - minimal weather gear needed'
            ];
        }
        
        return {
            safetyLevel,
            message,
            recommendations
        };
    }

    updateWeatherDisplay() {
        if (!this.currentWeather) return;

        const { currentWeather } = this;

        // Update weather icon
        this.weatherIcon.innerHTML = this.getWeatherIcon(currentWeather.condition, true);

        // Update main info
        this.temperature.textContent = `${currentWeather.temperature}°`;
        this.description.textContent = currentWeather.description;
        this.location.textContent = `${currentWeather.name}, ${currentWeather.country}`;

        // Update stats
        this.humidity.textContent = `${currentWeather.humidity}%`;
        this.wind.textContent = `${currentWeather.windSpeed} km/h`;
        this.visibility.textContent = `${currentWeather.visibility} km`;
        this.pressure.textContent = `${currentWeather.pressure} hPa`;
        this.sunrise.textContent = this.formatTime(currentWeather.sunrise);
        this.sunset.textContent = this.formatTime(currentWeather.sunset);

        // Show current weather
        this.currentWeatherEl.classList.remove('hidden');
        this.initialStateEl.classList.add('hidden');
    }

    updateForecastDisplay() {
        if (!this.forecast || this.forecast.length === 0) return;

        this.forecastList.innerHTML = '';

        this.forecast.forEach((day, index) => {
            const forecastItem = document.createElement('div');
            forecastItem.className = 'forecast-item';

            forecastItem.innerHTML = `
                <div class="forecast-day-info">
                    <div class="forecast-day">${index === 0 ? 'Today' : day.day}</div>
                    <div class="forecast-weather">
                        <div class="forecast-icon">${this.getWeatherIcon(day.condition, false)}</div>
                        <div class="forecast-condition">${day.condition}</div>
                    </div>
                </div>
                <div class="forecast-details">
                    <div class="forecast-stats">
                        <div>💧 ${day.humidity}%</div>
                        <div>💨 ${day.windSpeed} km/h</div>
                    </div>
                    <div class="forecast-temp">
                        <span class="temp-high">${day.temperature.max}°</span>
                        <span class="temp-low">${day.temperature.min}°</span>
                    </div>
                </div>
            `;

            this.forecastList.appendChild(forecastItem);
        });

        this.forecastEl.classList.remove('hidden');
    }

    updateTravelAdvisory() {
        if (!this.currentWeather) return;
        
        const advisory = this.generateTravelAdvisory(this.currentWeather);
        
        // Update safety badge
        const safetyBadge = document.getElementById('safety-badge');
        const badgeIcons = {
            safe: '✓',
            caution: '⚡',
            warning: '⚠️'
        };
        const badgeTexts = {
            safe: 'Safe to Travel',
            caution: 'Travel with Caution',
            warning: 'Travel Not Recommended'
        };
        
        safetyBadge.className = `safety-badge ${advisory.safetyLevel}`;
        safetyBadge.innerHTML = `<span>${badgeIcons[advisory.safetyLevel]}</span><span>${badgeTexts[advisory.safetyLevel]}</span>`;
        
        // Update message
        const advisoryMessage = document.getElementById('advisory-message');
        advisoryMessage.textContent = advisory.message;
        
        // Update recommendations
        const recommendationsList = document.getElementById('recommendations-list');
        recommendationsList.innerHTML = '';
        
        advisory.recommendations.forEach(recommendation => {
            const li = document.createElement('li');
            li.textContent = recommendation;
            recommendationsList.appendChild(li);
        });
        
        // Show the advisory section
        document.getElementById('travel-advisory').classList.remove('hidden');
    }

    updateBackground() {
        if (!this.currentWeather) return;

        const now = new Date().getTime() / 1000;
        const isNight = now < this.currentWeather.sunrise || now > this.currentWeather.sunset;
        const backgroundClass = this.getWeatherBackground(this.currentWeather.condition, isNight);

        // Remove all weather background classes
        this.app.className = 'app';
        // Add new background class
        this.app.classList.add(backgroundClass);
    }

    getWeatherBackground(condition, isNight) {
        const conditionLower = condition.toLowerCase();

        if (isNight) return 'bg-weather-night';

        if (conditionLower.includes('clear') || conditionLower.includes('sunny')) {
            return 'bg-weather-sunny';
        }
        if (conditionLower.includes('cloud')) {
            return 'bg-weather-cloudy';
        }
        if (conditionLower.includes('rain') || conditionLower.includes('drizzle')) {
            return 'bg-weather-rainy';
        }
        if (conditionLower.includes('thunder') || conditionLower.includes('storm')) {
            return 'bg-weather-stormy';
        }

        return 'bg-weather-default';
    }

    getWeatherIcon(condition, large = false) {
        const conditionLower = condition.toLowerCase();
        const size = large ? '5rem' : '2rem';
        const animationClass = large ? 'animate-pulse' : '';

        if (conditionLower.includes('clear') || conditionLower.includes('sunny')) {
            return `<svg class="icon-sun ${animationClass}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
            </svg>`;
        }
        if (conditionLower.includes('cloud') && !conditionLower.includes('rain')) {
            return `<svg class="icon-cloud" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"></path>
            </svg>`;
        }
        if (conditionLower.includes('rain') || conditionLower.includes('shower')) {
            return `<svg class="icon-rain" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="16" y1="13" x2="16" y2="21"></line>
                <line x1="8" y1="13" x2="8" y2="21"></line>
                <line x1="12" y1="15" x2="12" y2="23"></line>
                <path d="M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25"></path>
            </svg>`;
        }
        if (conditionLower.includes('drizzle')) {
            return `<svg class="icon-rain" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="8" y1="19" x2="8" y2="21"></line>
                <line x1="8" y1="13" x2="8" y2="15"></line>
                <line x1="16" y1="19" x2="16" y2="21"></line>
                <line x1="16" y1="13" x2="16" y2="15"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="12" y1="15" x2="12" y2="17"></line>
                <path d="M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25"></path>
            </svg>`;
        }
        if (conditionLower.includes('snow')) {
            return `<svg class="icon-snow" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 17.58A5 5 0 0 0 18 8h-1.26A8 8 0 1 0 4 16.25"></path>
                <line x1="8" y1="16" x2="8.01" y2="16"></line>
                <line x1="8" y1="20" x2="8.01" y2="20"></line>
                <line x1="12" y1="18" x2="12.01" y2="18"></line>
                <line x1="12" y1="22" x2="12.01" y2="22"></line>
                <line x1="16" y1="16" x2="16.01" y2="16"></line>
                <line x1="16" y1="20" x2="16.01" y2="20"></line>
            </svg>`;
        }
        if (conditionLower.includes('thunder') || conditionLower.includes('storm')) {
            return `<svg class="icon-storm" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 16.9A5 5 0 0 0 18 7h-1.26a8 8 0 1 0-11.62 9"></path>
                <polyline points="13 11 9 17 11 17 7 23"></polyline>
            </svg>`;
        }
        if (conditionLower.includes('mist') || conditionLower.includes('fog') || conditionLower.includes('haze')) {
            return `<svg class="icon-mist" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
            </svg>`;
        }
        if (conditionLower.includes('wind')) {
            return `<svg class="icon-wind" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2"></path>
                <path d="M9.6 4.6A2 2 0 1 1 11 8H2"></path>
                <path d="M12.6 19.4A2 2 0 1 0 14 16H2"></path>
            </svg>`;
        }

        // Default fallback
        return `<svg class="icon-cloud" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"></path>
        </svg>`;
    }

    formatTime(timestamp) {
        return new Date(timestamp * 1000).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    }

    showToast(title, message, type = 'success') {
        const toast = document.getElementById('toast');
        const titleEl = document.getElementById('toast-title');
        const messageEl = document.getElementById('toast-message');
        const closeBtn = document.getElementById('toast-close');

        titleEl.textContent = title;
        messageEl.textContent = message;

        // Remove existing type classes
        toast.classList.remove('success', 'error');
        // Add new type class
        toast.classList.add(type);

        toast.classList.remove('hidden');

        // Auto hide after 5 seconds
        setTimeout(() => {
            toast.classList.add('hidden');
        }, 5000);

        // Close button
        closeBtn.onclick = () => {
            toast.classList.add('hidden');
        };
    }
}

// Initialize the weather dashboard when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new WeatherDashboard();
});