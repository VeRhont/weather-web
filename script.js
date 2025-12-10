class WeatherApp {
    constructor(apiKey) {
        this.weatherAPI = new WeatherAPI(apiKey);
        this.state = {
            cities: [],
            currentCityIndex: 0,
            geolocationDenied: false
        };
        this.storageKey = "weatherAppState";

        this.availableCities = [
            "Москва", "Санкт-Петербург", "Новосибирск", "Екатеринбург", "Казань",
            "Нижний Новгород", "Челябинск", "Самара", "Омск", "Ростов-на-Дону",
            "Уфа", "Красноярск", "Воронеж", "Пермь", "Волгоград",
            "Киев", "Минск", "Астана", "Лондон", "Париж",
            "Берлин", "Нью-Йорк", "Токио", "Пекин", "Стамбул"
        ].sort();
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.hideAddCityForm();
        
        if (this.loadState() && this.state.cities.length > 0) {
            this.showAddCityForm();
            this.updateCitiesList();
            this.displayWeather(this.state.cities[this.state.currentCityIndex].data);
        } else {
            setTimeout(() => {
                this.requestGeolocation();
            }, 500);
        }
    }
    
    saveState() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.state));
    }
    
    loadState() {
        const saved = localStorage.getItem(this.storageKey);
        if (saved) {
            try {
                this.state = JSON.parse(saved);
                return true;
            } catch (e) {
                console.error('Ошибка при чтении из localStorage:', e);
                return false;
            }
        }
        return false;
    }

    showAddCityForm() {
        document.getElementById('addCityContainer').classList.remove('hidden');
    }
    
    hideAddCityForm() {
        document.getElementById('addCityContainer').classList.add('hidden');
    }

    handleCityInput(inputValue) {
        const dropdown = document.getElementById('cityDropdown');
        const errorDiv = document.getElementById('cityError');
        
        errorDiv.style.display = 'none';
        
        if (inputValue.length < 2) {
            this.hideDropdown();
            return;
        }
        
        const searchTerm = inputValue.toLowerCase();
        const filteredCities = this.availableCities.filter(city => 
            city.toLowerCase().includes(searchTerm)
        );
        
        if (filteredCities.length === 0) {
            this.hideDropdown();
            errorDiv.textContent = `Город "${inputValue}" не найден в списке доступных городов`;
            errorDiv.style.display = 'block';
            return;
        }
        
        this.showDropdown(filteredCities);
    }

    showDropdown(cities) {
        const dropdown = document.getElementById('cityDropdown');
        const input = document.getElementById('cityInput');
        
        dropdown.innerHTML = '';
        
        cities.forEach(city => {
            const item = document.createElement('div');
            item.textContent = city;
            
            item.addEventListener('click', () => {
                input.value = city;
                this.hideDropdown();
                document.getElementById('cityError').style.display = 'none';
            });
            
            dropdown.appendChild(item);
        });
        
        dropdown.style.display = 'block';
        
        const rect = input.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        dropdown.style.position = 'absolute';
        dropdown.style.left = rect.left + 'px';
        dropdown.style.top = (rect.top + rect.height + scrollTop) + 'px';
        dropdown.style.width = rect.width + 'px';
    }
    
    hideDropdown() {
        document.getElementById('cityDropdown').style.display = 'none';
    }
    
    displayWeather(data) {
        const container = document.getElementById('weatherContainer');
        
        if (!data || data.cod !== "200") {
            container.innerHTML = '<p>Ошибка загрузки данных</p>';
            return;
        }
        
        const forecastsByDay = {};
        data.list.forEach(forecast => {
            const date = forecast.dt_txt.split(' ')[0];
            if (!forecastsByDay[date]) {
                forecastsByDay[date] = [];
            }
            forecastsByDay[date].push(forecast);
        });
        
        const days = Object.keys(forecastsByDay).slice(0, 3);
        
        let html = `<h2>${data.city.name}</h2>`;
        
        days.forEach(date => {
            const dayForecasts = forecastsByDay[date];
            const dayName = new Date(date).toLocaleDateString('ru-RU', { 
                weekday: 'long', 
                day: 'numeric', 
                month: 'short' 
            });
            
            const temps = dayForecasts.map(f => f.main.temp);
            const minTemp = Math.round(Math.min(...temps));
            const maxTemp = Math.round(Math.max(...temps));
            
            const dayForecast = dayForecasts.find(f => f.dt_txt.includes('12:00:00')) || dayForecasts[0];
            const icon = dayForecast.weather[0].icon;
            const description = dayForecast.weather[0].description;
            
            html += `
                <div class="day-forecast">
                    <div class="day-name">${dayName}</div>
                    <img src="https://openweathermap.org/img/wn/${icon}.png" alt="${description}">
                    <div class="temperature">${minTemp}°C / ${maxTemp}°C</div>
                    <div class="description">${description}</div>
                </div>
            `;
        });
        
        container.innerHTML = html;
    }
    
    updateCitiesList() {
        const list = document.getElementById('citiesList');
        list.innerHTML = '';
        
        this.state.cities.forEach((city, index) => {
            const li = document.createElement('li');
            li.textContent = city.name;
            
            if (index === this.state.currentCityIndex) {
                li.classList.add('current');
            }
            
            li.addEventListener('click', () => {
                this.switchCity(index);
            });
            
            list.appendChild(li);
        });
        
        this.saveState();
    }
    
    async addCity(cityName) {
        const normalizedCityName = cityName.trim().toLowerCase();
        const errorDiv = document.getElementById('cityError');
        
        errorDiv.style.display = 'none';
        
        const isValidCity = this.availableCities.some(city => 
            city.toLowerCase() === normalizedCityName
        );
        
        if (!isValidCity) {
            errorDiv.textContent = `Город "${cityName}" не найден в списке доступных городов`;
            errorDiv.style.display = 'block';
            return;
        }
        
        const isDuplicate = this.state.cities.some(city => 
            city.name.toLowerCase() === normalizedCityName
        );
        
        if (isDuplicate) {
            errorDiv.textContent = `Город "${cityName}" уже добавлен`;
            errorDiv.style.display = 'block';
            return;
        }
        
        try {
            const data = await this.weatherAPI.getWeatherByCity(cityName);
            
            this.state.cities.push({
                name: data.city.name,
                data: data
            });
            
            this.state.currentCityIndex = this.state.cities.length - 1;
            this.saveState();
            this.updateCitiesList();
            this.displayWeather(data);
            
            document.getElementById('cityInput').value = '';
            errorDiv.style.display = 'none';
            this.hideDropdown();
            
        } catch (error) {
            console.error('Не удалось добавить город:', error.message);
            errorDiv.textContent = `Ошибка при получении погоды для "${cityName}": ${error.message}`;
            errorDiv.style.display = 'block';
        }
    }
    
    switchCity(index) {
        this.state.currentCityIndex = index;
        this.updateCitiesList();
        
        const city = this.state.cities[index];
        if (city && city.data) {
            this.displayWeather(city.data);
        }
    }
    
    async refreshWeather() {
        const currentCity = this.state.cities[this.state.currentCityIndex];
        
        if (!currentCity) return;
        
        try {
            const newData = await this.weatherAPI.getWeatherByCity(currentCity.name);
            currentCity.data = newData;
            this.displayWeather(newData);
            this.saveState();
        } catch (error) {
            console.error('Ошибка при обновлении погоды:', error.message);
        }
    }
    
    async requestGeolocation() {
        if (!navigator.geolocation) {
            console.error('Геолокация не поддерживается');
            this.showAddCityForm();
            document.getElementById('weatherContainer').innerHTML = 
                '<p>Геолокация не поддерживается вашим браузером. Добавьте город вручную.</p>';
            return;
        }
        
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                
                try {
                    const data = await this.weatherAPI.getWeatherByCoords(latitude, longitude);
                    
                    this.state.cities = [{
                        name: "Текущее местоположение",
                        data: data
                    }];
                    
                    this.state.currentCityIndex = 0;
                    this.updateCitiesList();
                    this.displayWeather(data);
                    this.showAddCityForm();
                    
                } catch (error) {
                    console.error('Ошибка при получении погоды по геолокации:', error.message);
                    this.showAddCityForm();
                }
            },
            (error) => {
                console.log('Геолокация отклонена: ' + error.message);
                this.state.geolocationDenied = true;
                
                this.showAddCityForm();
                document.getElementById('weatherContainer').innerHTML = 
                    '<p>Добавьте город для отображения погоды</p>';
            }
        );
    }
    
    setupEventListeners() {
        document.getElementById('getLocationBtn').addEventListener('click', () => {
            this.requestGeolocation();
        });
        
        document.getElementById('refreshBtn').addEventListener('click', () => {
            this.refreshWeather();
        });

        document.getElementById('addCityBtn').addEventListener('click', () => {
            const cityName = document.getElementById('cityInput').value.trim();
            if (cityName) {
                this.addCity(cityName);
            }
        });

        document.getElementById('cityInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                document.getElementById('addCityBtn').click();
            }
        });

        document.getElementById('cityInput').addEventListener('input', (e) => {
            this.handleCityInput(e.target.value);
        });

        document.addEventListener('click', (e) => {
            const dropdown = document.getElementById('cityDropdown');
            const input = document.getElementById('cityInput');
            
            if (dropdown.style.display === 'block' && 
                e.target !== dropdown && 
                !dropdown.contains(e.target) && 
                e.target !== input) {
                this.hideDropdown();
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new WeatherApp(API_KEY);
});
