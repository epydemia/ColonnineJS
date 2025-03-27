**ColonnineJS** is a lightweight web application that shows your current geographic coordinates, the road you're currently driving on, and will eventually display the distance to the next electric vehicle (EV) charging station along that road.

## 🚀 Objective

The main goal of this project is to build a location-aware web app that:

- Detects your current GPS position
- Identifies the road you're traveling on using reverse geocoding
- Shows a map with your current location
- Calculates and displays the distance to the next EV charging station on the same road

## 🛠️ Technologies Used

- HTML5
- CSS3
- JavaScript (Vanilla)
- [Leaflet.js](https://leafletjs.com/) for interactive map rendering
- [OpenStreetMap Nominatim API](https://nominatim.org/release-docs/latest/api/Reverse/) for reverse geocoding

## 📂 Project Structure

```
ColonnineJS/
├── index.html                 # Main HTML structure
├── styles.css                 # Page styling and animations
├── js/
│   ├── geolocalizzazione.js   # Geolocation logic, heading and map
│   ├── colonnine.js           # Charger data loading, sorting, rendering
```

## 🌐 Usage

To use this app:

1. Open `index.html` in a browser that supports geolocation (preferably with HTTPS or `localhost`)
2. Allow the site to access your location
3. See your current coordinates, road name, and position on the map

## ✅ Features Implemented

- Interactive map centered on your current (or simulated) position
- Real-time geolocation with fallback to debug coordinates
- Toggle for debug mode and dynamic switching
- Orientation-aware user marker showing direction of movement
- Reverse geocoding to determine current road
- Current heading display (degrees + cardinal direction)
- Charging station data fetched from Freeto-x
- Table and map view of stations, sorted by distance
- Filter to show only the 5 nearest stations
- Visual distance bar showing station icons scaled to 100 km
- Tooltip with station info on hover
- Simulated route via predefined debug coordinates

> ⚠️ Currently, charging station data is only retrieved from Freeto-x.

## 🧭 Roadmap

- Display full route polyline on the map
- Filter chargers based on current direction of travel and correct highway carriageway
- Navigation instructions toward the next reachable charger
- Add support for additional operators (e.g. Ionity)
- Fetch and cache station data in background once a day
- Improve UX on mobile (larger markers, better touch support)
- Optional voice feedback when approaching a charger
