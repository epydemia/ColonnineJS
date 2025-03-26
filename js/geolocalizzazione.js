const DEBUG_POS = false;

document.addEventListener("DOMContentLoaded", () => {
    const coordsDiv = document.getElementById("coords");
    const toggleNearest = document.getElementById("toggleNearest");
    let userMarker = null;

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

            if (!window.leafletMap) {
                const map = L.map('map').setView([lat, lon], 15);
                window.leafletMap = map;

                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '&copy; OpenStreetMap contributors'
                }).addTo(map);

                userMarker = L.marker([lat, lon]).addTo(map).bindPopup('📍 Sei qui').openPopup();
            } else {
                if (userMarker) {
                    userMarker.setLatLng([lat, lon]);
                } else {
                    userMarker = L.marker([lat, lon]).addTo(window.leafletMap).bindPopup('📍 Sei qui');
                }
            }

        }, 3000);
    } else if ("geolocation" in navigator) {
        navigator.geolocation.watchPosition(
            (position) => {
                const lat = parseFloat(position.coords.latitude.toFixed(6));
                const lon = parseFloat(position.coords.longitude.toFixed(6));

                coordsDiv.innerText = `Latitudine: ${lat}\nLongitudine: ${lon}`;
                window.userCoordinates = { lat, lon };

                // Se la mappa non è ancora inizializzata
                if (!window.leafletMap) {
                    const map = L.map('map').setView([lat, lon], 15);
                    window.leafletMap = map;

                    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                        attribution: '&copy; OpenStreetMap contributors'
                    }).addTo(map);

                    userMarker = L.marker([lat, lon]).addTo(map).bindPopup('📍 Sei qui').openPopup();
                } else {
                    // aggiorna la posizione del marker
                    if (userMarker) {
                        userMarker.setLatLng([lat, lon]);
                    } else {
                        userMarker = L.marker([lat, lon]).addTo(window.leafletMap).bindPopup('📍 Sei qui');
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