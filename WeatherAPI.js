class WeatherAPI {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.baseUrl = 'https://api.openweathermap.org/data/2.5';
        this.timeout = 10000;
    }

    async getWeatherByCity(cityName) {
        console.log(`Запрашиваю погоду для: ${cityName}`);
        
        try {
            const controller = new AbortController();
            setTimeout(() => controller.abort(), this.timeout);
            
            const response = await fetch(
                `${this.baseUrl}/forecast?q=${encodeURIComponent(cityName)}&appid=${this.apiKey}&units=metric&lang=ru`,
                { signal: controller.signal }
            );
            
            const data = await response.json();
            
            if (data.cod !== "200") {
                throw new Error(data.message || 'Ошибка API');
            }
            
            return data;
        } catch (error) {
            console.error('Ошибка при запросе погоды:', error.message);
            throw new Error('Не удалось получить данные. Проверьте интернет или попробуйте позже.');
        }
    }

    async getWeatherByCoords(lat, lon) {
        console.log(`Запрашиваю погоду для координат: ${lat}, ${lon}`);
        
        try {
            const controller = new AbortController();
            setTimeout(() => controller.abort(), this.timeout);
            
            const response = await fetch(
                `${this.baseUrl}/forecast?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric&lang=ru`,
                { signal: controller.signal }
            );
            
            const data = await response.json();
            
            if (data.cod !== "200") {
                throw new Error(data.message || 'Ошибка API');
            }
            
            return data;
        } catch (error) {
            console.error('Ошибка при запросе погоды:', error.message);
            throw new Error('Не удалось получить данные. Проверьте интернет или попробуйте позже.');
        }
    }
}
