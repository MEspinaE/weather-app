import React, { useState, useEffect } from 'react';
import './App.css';


function App() {
  const [query, setQuery] = useState('');
  const [weather, setWeather] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const API_KEY = '530476bc2a5b4c0984c165744242510';
  
  // Funcion para traducir condiciones climáticas
  const translateCondition = (condition) => {
    const translations = {
      'Sunny': 'Soleado',
      'Clear': 'Despejado',
      'Partly cloudy': 'Parcialmente nublado',
      'Cloudy': 'Nublado',
      'Overcast': 'Cielo cubierto',
      'Mist': 'Neblina',
      'Fog': 'Niebla',
      'Patchy rain possible': 'Posibilidad de lluvia dispersa',
      'Light rain': 'Lluvia ligera',
      'Moderate rain': 'Lluvia moderada',
      'Heavy rain': 'Lluvia intensa',
      'Light snow': 'Nieve ligera',
      'Moderate snow': 'Nieve moderada',
      'Heavy snow': 'Nieve intensa',
      'Thundery outbreaks possible': 'Posibilidad de tormentas eléctricas',
      'Blizzard': 'Ventisca',
      'Freezing fog': 'Niebla helada',
      'Light rain shower': 'Chubasco de lluvia ligera',
      'Moderate or heavy rain shower': 'Chubasco de lluvia moderada o intensa',
      'Patchy light rain with thunder': 'Lluvia ligera dispersa con truenos',
      'Moderate or heavy rain with thunder': 'Lluvia moderada o intensa con truenos'
    };
    
    return translations[condition] || condition;
  };
  
  // Funcion para obtener nivel de alerta por UV
  const getUVAlert = (uvIndex) => {
    if (uvIndex >= 11) {
      return {
        level: "Extremo",
        message: "¡PELIGRO EXTREMO! Evita salir al exterior durante las horas centrales del día.",
        color: "#9e2cb1"
      };
    } else if (uvIndex >= 8) {
      return {
        level: "Muy Alto",
        message: "¡PELIGRO! Usa protección solar alta, sombrero y gafas de sol. Busca sombra.",
        color: "#ff0000"
      };
    } else if (uvIndex >= 6) {
      return {
        level: "Alto",
        message: "Protección necesaria. Usa protector solar, sombrero y gafas de sol.",
        color: "#ff8c00"
      };
    } else if (uvIndex >= 3) {
      return {
        level: "Moderado",
        message: "Se recomienda protección solar, especialmente durante periodos prolongados al aire libre.",
        color: "#ffcc00"
      };
    } else {
      return {
        level: "Bajo",
        message: "No se requiere protección especial para la mayoría de las personas.",
        color: "#299438"
      };
    }
  };
  
  // Funcion para buscar sugerencias de autocompletado
  const handleInputChange = async (e) => {
    const value = e.target.value;
    setQuery(value);
    
    if (value.length > 2) {
      try {
        const response = await fetch(`https://api.weatherapi.com/v1/search.json?key=${API_KEY}&q=${value}`);
        if (!response.ok) throw new Error('Error en la búsqueda');
        
        const data = await response.json();
        setSuggestions(data);
      } catch (err) {
        console.error('Error al buscar sugerencias:', err);
        setSuggestions([]);
      }
    } else {
      setSuggestions([]);
    }
  };
  
  // Funcion para buscar el clima
  const searchWeather = async (location = query) => {
    if (!location) return;
    
    setLoading(true);
    setError(null);
    setSuggestions([]);
    
    try {
      // Obtener pronstico actual y de los proximos dias 
      const forecastResponse = await fetch(`https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${location}&days=3&aqi=no&alerts=no`);
      
      if (!forecastResponse.ok) {
        throw new Error('No se encontró la ubicación');
      }
      
      const forecastData = await forecastResponse.json();
      
      setWeather(forecastData);
      setQuery('');
    } catch (err) {
      setError('No se pudo obtener la información del clima. Por favor, intenta con otra ubicación.');
      setWeather(null);
    } finally {
      setLoading(false);
    }
  };
  
  // Manejar envio del formulario
  const handleSubmit = (e) => {
    e.preventDefault();
    searchWeather();
  };
  
  // Manejar selección de sugrencia
  const handleSuggestionClick = (location) => {
    setQuery(location.name);
    searchWeather(location.name);
  };
  
  // Formatear la fecha
  const formatDate = (dateStr) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateStr).toLocaleDateString('es-ES', options);
  };
  
  const getWeatherAnimation = (code) => {
    if (code >= 1000 && code <= 1003) return 'sunny-animation'; // 
    if (code >= 1004 && code <= 1009) return 'cloudy-animation'; 
    if (code >= 1030 && code <= 1035) return 'foggy-animation'; 
    if (code >= 1063 && code <= 1171) return 'rainy-animation'; 
    if (code >= 1180 && code <= 1201) return 'rainy-animation'; 
    if (code >= 1204 && code <= 1237) return 'snowy-animation'; 
    if (code >= 1240 && code <= 1246) return 'shower-animation'; 
    if (code >= 1273 && code <= 1282) return 'thunder-animation'; 
    return '';
  };
  
  const isToday = (dateStr) => {
    const today = new Date();
    const date = new Date(dateStr);
    return date.toDateString() === today.toDateString();
  };
  

  const isTomorrow = (dateStr) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const date = new Date(dateStr);
    return date.toDateString() === tomorrow.toDateString();
  };
  
  return (
    <div className="App">
      <div className="container">
        <h1>Consulta del Clima</h1>
        
        <form onSubmit={handleSubmit} className="search-form">
          <div className="search-container">
            <input
              type="text"
              value={query}
              onChange={handleInputChange}
              placeholder="Buscar ciudad..."
              className="search-input"
            />
            {suggestions.length > 0 && (
              <ul className="suggestions">
                {suggestions.map((item) => (
                  <li 
                    key={`${item.id}`} 
                    onClick={() => handleSuggestionClick(item)}
                  >
                    {item.name}, {item.country}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <button type="submit" className="search-button">Buscar</button>
        </form>
        
        {loading && <div className="loading">Cargando...</div>}
        
        {error && <div className="error">{error}</div>}
        
        {weather && (
          <div className="weather-container">
            <div className="location-info">
              <h2>{weather.location.name}, {weather.location.country}</h2>
              <p>Fecha y hora local: {weather.location.localtime}</p>
            </div>
            
            <div className="forecast">
              {/* Días de pronóstico */}
              {weather.forecast.forecastday.map((day, index) => {
                const uvAlert = getUVAlert(day.day.uv);
                const isTodayDate = isToday(day.date);
                const isTomorrowDate = isTomorrow(day.date);
                
                return (
                  <div key={day.date} className={`day-card ${isTodayDate ? 'today-card' : ''}`}>
                    <div className="day-label">
                    </div>
                    <h3>{formatDate(day.date)}</h3>
                    <div className="weather-icon">
                      <div className={`icon-wrapper ${getWeatherAnimation(day.day.condition.code)}`}>
                        <img src={day.day.condition.icon} alt={day.day.condition.text} />
                      </div>
                      <p>{translateCondition(day.day.condition.text)}</p>
                    </div>
                    <div className="temp-info">
                      <p>Temperatura máxima: {day.day.maxtemp_c}°C</p>
                      <p>Temperatura mínima: {day.day.mintemp_c}°C</p>
                      <p>Humedad: {day.day.avghumidity}%</p>
                      <p>Probabilidad de lluvia: {day.day.daily_chance_of_rain}%</p>
                    </div>
                    <div className="uv-info" style={{ backgroundColor: uvAlert.color + '20', borderLeft: `4px solid ${uvAlert.color}` }}>
                      <h4>Índice UV: {day.day.uv} - {uvAlert.level}</h4>
                      <p>{uvAlert.message}</p>
                    </div>
                    <div className="sun-info">
                      <div className="sun-item">
                        <span className="sun-icon sunrise-icon">🌅</span>
                        <p>Salida del sol: {day.astro.sunrise}</p>
                      </div>
                      <div className="sun-item">
                        <span className="sun-icon sunset-icon">🌇</span>
                        <p>Puesta del sol: {day.astro.sunset}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        
        <footer className="footer">
          <p>Datos proporcionados por <a href="https://www.weatherapi.com/" target="_blank" rel="noopener noreferrer">WeatherAPI.com</a></p>
          <a href="https://www.weatherapi.com/" target="_blank" rel="noopener noreferrer" className="footer-logo">
            <img src="https://cdn.weatherapi.com/v4/images/weatherapi_logo.png" alt="WeatherAPI.com" width="150" />
          </a>
          <p>
            <a href="https://portafoliomespina.netlify.app" target="_blank" rel="noopener noreferrer" className="portfolio-link">
              <span className="portfolio-icon">👨‍💻</span> Marco Espina
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;