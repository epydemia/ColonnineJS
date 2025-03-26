const DEBUG_POS = false;

document.addEventListener("DOMContentLoaded", () => {
    const coordsDiv = document.getElementById("coords");
    const toggleNearest = document.getElementById("toggleNearest");
    let userMarker = null;

    function calcolaAngoloTraDuePunti(lat1, lon1, lat2, lon2) {
        const dLon = (lon2 - lon1);
        const y = Math.sin(dLon) * Math.cos(lat2);
        const x = Math.cos(lat1) * Math.sin(lat2) -
                  Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
        let brng = Math.atan2(y, x);
        brng = brng * (180 / Math.PI);
        return (brng + 360) % 360;
    }

    if (DEBUG_POS) {
        const debugCoords = [
            { lat: 41.638756, lon: 15.453696 },
            { lat: 41.64647, lon: 15.446288 },
            { lat: 41.653435, lon: 15.437314 },
            { lat: 41.660397, lon: 15.428341 },
            { lat: 41.67748, lon: 15.416491 },
            { lat: 41.686028, lon: 15.411482 },
            { lat: 41.693935, lon: 15.406848 },
            { lat: 41.70322, lon: 15.405508 },
            { lat: 41.712616, lon: 15.40863 },
            { lat: 41.72199, lon: 15.411748 },
            { lat: 41.731388, lon: 15.414878 },
            { lat: 41.740856, lon: 15.413155 },
            { lat: 41.750206, lon: 15.409768 },
            { lat: 41.759563, lon: 15.406426 },
            { lat: 41.768913, lon: 15.403055 },
            { lat: 41.776222, lon: 15.395455 },
            { lat: 41.78121, lon: 15.384373 },
            { lat: 41.78624, lon: 15.373314 },
            { lat: 41.79402, lon: 15.366764 },
            { lat: 41.8113, lon: 15.356159 },
            { lat: 41.820763, lon: 15.354108 },
            { lat: 41.829433, lon: 15.348706 },
            { lat: 41.836887, lon: 15.340441 }
        ];

        let index = 0;

        setInterval(() => {
            const { lat, lon } = debugCoords[index];
            index = (index + 1) % debugCoords.length;

            coordsDiv.innerText = `Latitudine: ${lat}\nLongitudine: ${lon}`;
            window.userCoordinates = { lat, lon };

            const angle = window.lastUserCoordinates
                ? (calcolaAngoloTraDuePunti(window.lastUserCoordinates.lat, window.lastUserCoordinates.lon, lat, lon) - 90)
                : -90;

            window.lastUserCoordinates = { lat, lon };

            const userIcon = L.divIcon({
                className: 'navigation-arrow-icon',
                html: `<div style="transform: rotate(${angle}deg); width: 0; height: 0;
                              border-left: 10px solid transparent;
                              border-right: 10px solid transparent;
                              border-bottom: 20px solid blue;"></div>`,
                iconSize: [20, 20],
                iconAnchor: [10, 10]
            });

            if (!window.leafletMap) {
              const map = L.map('map').setView([lat, lon], 15);
              window.leafletMap = map;
          
              L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                  attribution: '&copy; OpenStreetMap contributors'
              }).addTo(map);
          }
          
          if (!userMarker) {
              userMarker = L.marker([lat, lon], { icon: userIcon }).addTo(window.leafletMap).bindPopup('📍 Sei qui');
          } else {
              userMarker.setLatLng([lat, lon]);
              userMarker.setIcon(userIcon);
          }

        }, 3000);
    } else if ("geolocation" in navigator) {
        navigator.geolocation.watchPosition(
            (position) => {
                const lat = parseFloat(position.coords.latitude.toFixed(6));
                const lon = parseFloat(position.coords.longitude.toFixed(6));

                coordsDiv.innerText = `Latitudine: ${lat}\nLongitudine: ${lon}`;
                window.userCoordinates = { lat, lon };

                const angle = window.lastUserCoordinates
                    ? (calcolaAngoloTraDuePunti(window.lastUserCoordinates.lat, window.lastUserCoordinates.lon, lat, lon) - 90)
                    : -90;

                window.lastUserCoordinates = { lat, lon };

                const userIcon = L.divIcon({
                    className: 'navigation-arrow-icon',
                    html: `<div style="transform: rotate(${angle}deg); width: 0; height: 0;
                                  border-left: 10px solid transparent;
                                  border-right: 10px solid transparent;
                                  border-bottom: 20px solid blue;"></div>`,
                    iconSize: [20, 20],
                    iconAnchor: [10, 10]
                });

                if (!window.leafletMap) {
                    const map = L.map('map').setView([lat, lon], 15);
                    window.leafletMap = map;

                    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                        attribution: '&copy; OpenStreetMap contributors'
                    }).addTo(map);

                    userMarker = L.marker([lat, lon], { icon: userIcon }).addTo(map).bindPopup('📍 Sei qui').openPopup();
                } else {
                    if (userMarker) {
                        userMarker.setLatLng([lat, lon]);
                        userMarker.setIcon(userIcon);
                    } else {
                        userMarker = L.marker([lat, lon], { icon: userIcon }).addTo(window.leafletMap).bindPopup('📍 Sei qui');
                    }
                }

                // (facoltativo: centra la mappa)
                // window.leafletMap.setView([lat, lon]);
            },
            (error) => {
                coordsDiv.innerText = `Errore: ${error.message}`;
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    } else {
        coordsDiv.innerText = "⚠️ Geolocalizzazione non supportata dal browser.";
    }

    toggleNearest.addEventListener('change', () => {
        // Logica per filtrare le colonnine in base allo stato della checkbox
        if (toggleNearest.checked) {
            // Mostra solo le 5 più vicine
        } else {
            // Mostra tutte le colonnine
        }
    });
});