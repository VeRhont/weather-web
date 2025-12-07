class WeatherAPI {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.baseUrl = 'https://api.openweathermap.org/data/2.5';
    }

    async getWeatherByCity(cityName) {
        console.log(`Запрашиваю погоду для: ${cityName}`);
        try {
            const response = await fetch(
                `${this.baseUrl}/forecast?q=${encodeURIComponent(cityName)}&appid=${this.apiKey}&units=metric&lang=ru`
            );
            const data = await response.json();
            console.log('Ответ от API:', data);
            return data;
        } catch (error) {
            console.error('Ошибка:', error);
            return null;
        }
    }

    async getWeatherByCoords(lat, lon) {
        console.log(`Запрашиваю погоду для координат: ${lat}, ${lon}`);
        try {
            const response = await fetch(
                `${this.baseUrl}/forecast?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric&lang=ru`
            );
            const data = await response.json();
            console.log('Ответ от API:', data);
            return data;
        } catch (error) {
            console.error('Ошибка:', error);
            return null;
        }
    }
}

const weatherAPI = new WeatherAPI(API_KEY);

document.getElementById('getLocationBtn').addEventListener('click', () => {
    console.log('Запрашиваю геолокацию...');
    
    if (!navigator.geolocation) {
        console.error('Геолокация не поддерживается браузером');
        return;
    }
    
    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const { latitude, longitude } = position.coords;
            console.log(`Координаты получены: ${latitude}, ${longitude}`);
            
            const weatherData = await weatherAPI.getWeatherByCoords(latitude, longitude);
            if (weatherData) {
                console.log('Погода по геолокации:');
                console.log(`Город: ${weatherData.city.name}`);
                console.log(`Температура (ближайшие 3 часа): ${weatherData.list[0].main.temp}°C`);
                console.log(`Условия: ${weatherData.list[0].weather[0].description}`);
            }
        },
        (error) => {
            console.error('Ошибка геолокации:', error.message);
        }
    );
});

document.getElementById('searchCityBtn').addEventListener('click', async () => {
    const city = document.getElementById('cityInput').value.trim();
    
    console.log(`Ищу погоду для города: ${city}`);
    const weatherData = await weatherAPI.getWeatherByCity(city);
    
    if (weatherData) {
        console.log('Погода для города:');
        console.log(`Город: ${weatherData.city.name}`);
        console.log(`Температура (ближайшие 3 часа): ${weatherData.list[0].main.temp}°C`);
        console.log(`Ощущается как: ${weatherData.list[0].main.feels_like}°C`);
        console.log(`Влажность: ${weatherData.list[0].main.humidity}%`);
        console.log(`Условия: ${weatherData.list[0].weather[0].description}`);
    } else {
        console.error('Ошибка в getWeatherByCity');
    }
    
    document.getElementById('cityInput').value = '';
});