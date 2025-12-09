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
            console.log(data);
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
            console.log(data);
            return data;
        } catch (error) {
            console.error('Ошибка:', error);
            return null;
        }
    }
}
