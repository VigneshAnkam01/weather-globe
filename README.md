# 🌍 3D Weather Globe

An interactive, 3D WebGL weather application that allows users to explore weather conditions anywhere on Earth. Featuring a stunning visual design inspired by the Apple Weather app, this project brings atmospheric data to life with realistic 3D effects, live data, and intuitive navigation.

## ✨ Features

- **Interactive 3D Globe**: Built with `three.js` and `globe.gl`, offering smooth rotation, deep zooming, and beautiful satellite imagery.
- **Real-Time Weather Data**: Powered by the Open-Meteo API, providing current conditions, hourly forecasts, 10-day forecasts, UV Index, Air Quality, and more.
- **Apple-Inspired UI**: A frosted-glass, dynamic sliding panel that adapts its colors and gradients based on the current weather condition and time of day.
- **Realistic Sun & Shadows**: The globe features a directional light source perfectly positioned based on the current UTC time, creating accurate day/night cycles and real-time shadows.
- **Atmospheric Effects**: A dynamic, semi-transparent 3D cloud layer slowly rotates above the Earth's surface.
- **Solar System Mode**: Zoom far out to see 3D planets (Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune) orbiting the Earth on tilted rings.
- **Geocoding & Search**: Quickly find any city worldwide using the Nominatim API with debounced autocomplete.
- **Embedded Maps**: Includes a Google Maps iframe snippet for localized street-level, satellite, and hybrid views of your searched location.

## 🚀 Live Demo

[View Live Project](https://weather-globe-rho.vercel.app/)

## 🛠️ Technologies Used

- **HTML/CSS/JS**: Vanilla frontend stack for maximum performance and complete control over the UI.
- **Vite**: Ultra-fast build tool and development server.
- **Three.js**: WebGL framework powering the 3D scene.
- **Globe.gl**: Wrapper for Three.js specifically designed for rendering 3D data-driven globes.
- **Open-Meteo API**: Free, open-source weather API with no API keys required.
- **Vercel**: Platform used for lightning-fast deployments.

## 📦 Local Development

1. **Clone the repository:**
   ```bash
   git clone https://github.com/VigneshAnkam01/weather-globe.git
   cd weather-globe
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Build for production:**
   ```bash
   npm run build
   ```

## 📝 License

This project is licensed under the MIT License. Feel free to use, modify, and distribute it!
