const DEBUG_GPX = false;

document.addEventListener("DOMContentLoaded", () => {
    const coordsDiv = document.getElementById("coords");
    const toggleNearest = document.getElementById("toggleNearest");
    const gpxInput = document.getElementById("gpxFile");
    let userMarker = null;

    if (gpxInput) {
        gpxInput.addEventListener("change", async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const text = await file.text();
            const parser = new DOMParser();
            const xml = parser.parseFromString(text, "application/xml");
            const trkpts = Array.from(xml.getElementsByTagName("trkpt"));

            const debugCoords = trkpts.map(pt => ({
                lat: parseFloat(pt.getAttribute("lat")),
                lon: parseFloat(pt.getAttribute("lon"))
            })).filter(p => !isNaN(p.lat) && !isNaN(p.lon));

            if (debugCoords.length === 0) {
                coordsDiv.innerText = "⚠️ Nessuna coordinata valida trovata nel GPX.";
                return;
            }

            let index = 0;
            let userMarker = null;

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
        });
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