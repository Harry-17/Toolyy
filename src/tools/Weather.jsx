import React, { useState, useEffect, useCallback } from 'react';

// --- Helper Functions & Data ---

// Maps WMO weather codes to icons, day/night descriptions, and Tailwind CSS classes
const getWeatherInfo = (code, isDay = 1) => {
    const weatherMap = {
        0: { desc: "Clear sky", icon: "☀️", bg: 'bg-blue-400', text: 'text-yellow-300' },
        1: { desc: "Mainly clear", icon: "🌤️", bg: 'bg-blue-500', text: 'text-white' },
        2: { desc: "Partly cloudy", icon: "⛅", bg: 'bg-blue-500', text: 'text-white' },
        3: { desc: "Overcast", icon: "☁️", bg: 'bg-gray-500', text: 'text-white' },
        45: { desc: "Fog", icon: "🌫️", bg: 'bg-gray-600', text: 'text-white' },
        48: { desc: "Depositing rime fog", icon: "🌫️", bg: 'bg-gray-600', text: 'text-white' },
        51: { desc: "Light drizzle", icon: "🌦️", bg: 'bg-sky-600', text: 'text-white' },
        53: { desc: "Moderate drizzle", icon: "🌦️", bg: 'bg-sky-700', text: 'text-white' },
        55: { desc: "Dense drizzle", icon: "🌧️", bg: 'bg-sky-800', text: 'text-white' },
        61: { desc: "Slight rain", icon: "🌧️", bg: 'bg-blue-700', text: 'text-white' },
        63: { desc: "Moderate rain", icon: "🌧️", bg: 'bg-blue-800', text: 'text-white' },
        65: { desc: "Heavy rain", icon: "⛈️", bg: 'bg-blue-900', text: 'text-white' },
        71: { desc: "Slight snow fall", icon: "🌨️", bg: 'bg-indigo-400', text: 'text-white' },
        73: { desc: "Moderate snow fall", icon: "🌨️", bg: 'bg-indigo-500', text: 'text-white' },
        75: { desc: "Heavy snow fall", icon: "❄️", bg: 'bg-indigo-600', text: 'text-white' },
        80: { desc: "Slight rain showers", icon: "🌦️", bg: 'bg-sky-700', text: 'text-white' },
        81: { desc: "Moderate rain showers", icon: "🌧️", bg: 'bg-sky-800', text: 'text-white' },
        82: { desc: "Violent rain showers", icon: "⛈️", bg: 'bg-sky-900', text: 'text-white' },
        95: { desc: "Thunderstorm", icon: "⚡", bg: 'bg-slate-700', text: 'text-white' },
        96: { desc: "Thunderstorm with slight hail", icon: "⛈️", bg: 'bg-slate-800', text: 'text-white' },
        99: { desc: "Thunderstorm with heavy hail", icon: "⛈️", bg: 'bg-slate-900', text: 'text-white' },
    };
    const info = weatherMap[code] || { desc: "Unknown", icon: "🤷", bg: 'bg-gray-400', text: 'text-black' };
    
    // Adjust for night time
    if (!isDay) {
        if (code <= 1) { // Clear or mainly clear
            return { ...info, icon: "🌙", bg: 'bg-gray-800', text: 'text-yellow-200' };
        }
    }
    return info;
};

// Formats the day of the week
const formatDay = (dateString) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[new Date(dateString).getDay()];
};

// --- Main App Component ---
export default function App() {
    // State management
    const [location, setLocation] = useState('Noida');
    const [weatherData, setWeatherData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetches weather data from Open-Meteo API
    const fetchWeather = useCallback(async (city) => {
        setLoading(true);
        setError(null);
        setWeatherData(null);

        try {
            // 1. Geocoding: Convert city name to latitude and longitude
            const geoResponse = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1&language=en&format=json`);
            if (!geoResponse.ok) throw new Error("Failed to fetch location data.");
            const geoData = await geoResponse.json();
            if (!geoData.results || geoData.results.length === 0) {
                throw new Error(`Could not find location: ${city}. Please try another city.`);
            }
            const { latitude, longitude, name, country } = geoData.results[0];

            // 2. Weather Forecast: Fetch detailed weather data
            const weatherResponse = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m&hourly=temperature_2m,precipitation_probability,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,uv_index_max&timezone=auto`);
            if (!weatherResponse.ok) throw new Error("Failed to fetch weather data.");
            const weather = await weatherResponse.json();

            setWeatherData({ ...weather, name, country });

        } catch (err) {
            setError(err.message);
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);
    
    // Initial data fetch for the default location
    useEffect(() => {
        fetchWeather(location);
    }, [fetchWeather]);

    // Handler for the search form submission
    const handleSearch = (e) => {
        e.preventDefault();
        if (location.trim()) {
            fetchWeather(location);
        }
    };
    
    // --- UI Rendering ---
    const { current, daily, hourly, name, country } = weatherData || {};
    const weatherInfo = current ? getWeatherInfo(current.weather_code, current.is_day) : getWeatherInfo(0);

    return (
        <div className={`min-h-screen font-sans transition-colors duration-500 ${weatherInfo.bg}`}>
            <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-6xl text-white">
                
                {/* Search Bar */}
                <form onSubmit={handleSearch} className="mb-6 flex gap-2">
                    <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="Enter a city name..."
                        className="flex-grow bg-white/20 border border-white/30 rounded-full py-3 px-6 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-300 transition"
                    />
                    <button type="submit" className="bg-white/30 hover:bg-white/50 text-white font-bold py-3 px-6 rounded-full transition-transform active:scale-95">
                        Search
                    </button>
                </form>

                {/* Main Content Area */}
                {loading && <div className="text-center text-2xl p-10">Loading weather data...</div>}
                {error && <div className="text-center bg-red-500/50 p-4 rounded-lg text-xl">{error}</div>}

                {weatherData && !loading && !error && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        
                        {/* Current Weather Card (Left) */}
                        <div className="lg:col-span-1 bg-white/20 p-6 rounded-2xl shadow-lg backdrop-blur-sm">
                            <h2 className="text-2xl font-bold">{name}</h2>
                            <p className="text-lg text-gray-200">{country}</p>
                            <div className={`text-7xl my-4 ${weatherInfo.text}`}>{weatherInfo.icon}</div>
                            <p className="text-6xl font-bold">{Math.round(current.temperature_2m)}°C</p>
                            <p className="text-xl mt-2">{weatherInfo.desc}</p>
                            <p className="text-md text-gray-300">Feels like {Math.round(current.apparent_temperature)}°C</p>
                            
                            <div className="mt-6 border-t border-white/20 pt-4 space-y-2 text-lg">
                                <p>💨 Wind: {current.wind_speed_10m} km/h</p>
                                <p>💧 Precipitation: {current.precipitation} mm</p>
                                <p>☀️ UV Index: {daily.uv_index_max[0]}</p>
                            </div>
                        </div>

                        {/* Forecast Details (Right) */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Hourly Forecast */}
                            <div className="bg-white/20 p-6 rounded-2xl shadow-lg backdrop-blur-sm">
                                <h3 className="text-xl font-bold mb-4">Hourly Forecast</h3>
                                <div className="flex overflow-x-auto space-x-4 pb-2">
                                    {hourly.time.slice(0, 24).map((time, index) => (
                                        <div key={time} className="flex-shrink-0 text-center bg-white/10 p-3 rounded-lg w-24">
                                            <p className="font-semibold">{new Date(time).getHours()}:00</p>
                                            <p className={`text-3xl my-1 ${getWeatherInfo(hourly.weather_code[index]).text}`}>{getWeatherInfo(hourly.weather_code[index]).icon}</p>
                                            <p className="font-bold">{Math.round(hourly.temperature_2m[index])}°C</p>
                                            <p className="text-xs text-cyan-200">{hourly.precipitation_probability[index]}%</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* 7-Day Forecast */}
                            <div className="bg-white/20 p-6 rounded-2xl shadow-lg backdrop-blur-sm">
                                <h3 className="text-xl font-bold mb-4">7-Day Forecast</h3>
                                <div className="space-y-2">
                                    {daily.time.map((date, index) => (
                                        <div key={date} className="grid grid-cols-4 items-center gap-4 p-2 rounded-lg hover:bg-white/10 transition">
                                            <p className="font-semibold">{index === 0 ? 'Today' : formatDay(date)}</p>
                                            <div className="flex items-center gap-2">
                                                <span className={`text-2xl ${getWeatherInfo(daily.weather_code[index]).text}`}>{getWeatherInfo(daily.weather_code[index]).icon}</span>
                                                <span className="hidden sm:inline">{getWeatherInfo(daily.weather_code[index]).desc}</span>
                                            </div>
                                            <p className="text-right">{Math.round(daily.temperature_2m_min[index])}°</p>
                                            <p className="text-right font-bold">{Math.round(daily.temperature_2m_max[index])}°</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
