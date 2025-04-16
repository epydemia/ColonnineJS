# ⚡ ColonnineJS

**ColonnineJS** is a lightweight web app that shows your real-time GPS position, direction of travel, and nearby EV charging stations along the same highway, filtered based on your heading.

---

## 🚀 Objective

Build a location-aware app that:

- Detects your current GPS position and heading
- Determines which highway you're on using reverse geocoding
- Shows your position on an interactive map
- Filters and displays compatible EV chargers along the same highway and in the same direction
- Offers a simulation mode for testing predefined GPS paths

---

## 🛠️ Technologies Used

- **HTML5 + CSS3**
- **Vanilla JavaScript (ES Modules)**
- [Leaflet.js](https://leafletjs.com/) — interactive map rendering
- [OpenStreetMap Nominatim API](https://nominatim.org/) — reverse geocoding
- Optional GPX input — for advanced simulation

---

## 📂 Project Structure

```
ColonnineJS/
├── index.html                 # Main HTML layout
├── styles.css                 # Styles for layout, map and markers
├── js/
│   ├── index.js               # App entry point and controller
│   ├── dataloader.js          # Loads and caches EV charger data
│   ├── geoutils.js            # Utilities: distance, direction, angle
│   ├── geolocalizzazione.js   # Manages GPS, heading, reverse geocoding
│   ├── colonnine.js           # Map rendering, filtering and station updates
└── data/
    ├── free_to_x_reverse.json # Preprocessed charger dataset
    └── test.json              # Local test dataset
```

---

## 🌐 Usage

1. Open `index.html` in a browser that supports geolocation (recommended: served via `localhost`)
2. Allow location access when prompted
3. Watch your position update on the map with a blue ▲ icon
4. View the current road name and direction of travel
5. Compatible stations will appear in red, others in gray

---

## ✅ Features

- Real or simulated GPS tracking (toggle debug mode)
- Heading indicator (compass + rotating marker)
- Reverse geocoding to identify current road
- Interactive map with Leaflet.js
- Red markers for stations in same direction
- Gray markers for all detected stations
- Table and visual bar sorted by proximity
- Checkbox toggle to enable/disable all filtering
- Auto-updates as the user moves
- Simulated movement with predefined path

---

## 🧭 Roadmap

- Add support for other operators (Ionity, Enel X, etc.)
- Track user movement history
- Add basic navigation instructions
- Optional voice feedback when approaching a station
- Improve mobile UX (touch + responsiveness)
- GPX file import for advanced simulations

---

## 📘 Notes

⚠️ Currently, data is sourced from `Freeto-x`. Additional sources will be integrated in future versions.
