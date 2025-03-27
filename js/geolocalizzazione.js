// Inizializza lo script solo dopo che il DOM è stato completamente caricato
document.addEventListener("DOMContentLoaded", () => {
    const toggleDebug = document.getElementById("toggleDebug");
    let debugIntervalId = null;
    const coordsDiv = document.getElementById("coords");
    const toggleNearest = document.getElementById("toggleNearest");
    let userMarker = null;

    // Converte un angolo in gradi in una direzione cardinale testuale (es. "Nord", "Est", ...)
    function getCardinalDirection(angle) {
        const directions = ["Nord", "Nord-Est", "Est", "Sud-Est", "Sud", "Sud-Ovest", "Ovest", "Nord-Ovest"];
        const index = Math.round(((angle % 360) / 45)) % 8;
        return directions[index];
    }

    // Calcola il bearing (angolo) tra due coordinate GPS in gradi, secondo lo standard geografico:
    // 0° = Nord, 90° = Est, 180° = Sud, 270° = Ovest
    function calcolaAngoloTraDuePunti(lat1, lon1, lat2, lon2) {
        const toRad = deg => deg * Math.PI / 180;
        const toDeg = rad => rad * 180 / Math.PI;

        lat1 = toRad(lat1);
        lon1 = toRad(lon1);
        lat2 = toRad(lat2);
        lon2 = toRad(lon2);

        const dLon = lon2 - lon1;
        const y = Math.sin(dLon) * Math.cos(lat2);
        const x = Math.cos(lat1) * Math.sin(lat2) -
                  Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
        let brng = Math.atan2(y, x);
        brng = toDeg(brng);
        return (brng + 360) % 360;
    }

    // Esegue una richiesta reverse geocoding a Nominatim (OpenStreetMap) per ottenere il nome della strada attuale
    function reverseGeocode(lat, lon) {
        fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`)
            .then(response => response.json())
            .then(data => {
                const strada = data.address?.road || data.display_name || "Strada non trovata";
                const stradaDiv = document.getElementById("strada");
                if (stradaDiv) {
                    stradaDiv.innerText = `🛣️ ${strada}`;
                }
            })
            .catch(err => {
                console.warn("Reverse geocoding fallito:", err);
            });
    }

    function initGeolocation(debug) {
        if (debugIntervalId) {
            clearInterval(debugIntervalId);
            debugIntervalId = null;
        }

        if (debug) {
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

            debugIntervalId = setInterval(() => {
                const { lat, lon } = debugCoords[index];
                index = (index + 1) % debugCoords.length;

                // Aggiorna il testo dell'interfaccia con le coordinate attuali
                coordsDiv.innerText = `Latitudine: ${lat}\nLongitudine: ${lon}`;
                // Salva le coordinate GPS correnti come globali
                window.userCoordinates = { lat, lon };
                reverseGeocode(lat, lon);

                // Prepara variabili per calcolare la direzione di marcia (heading) e controllare se aggiornarla
                let angle = -90;
                let aggiornaHeading = true;

                // Ottiene e visualizza il nome della strada attuale tramite reverse geocoding
                // Aggiorna la direzione di marcia solo se lo spostamento è superiore a 10 metri
                // Questo evita cambi di direzione dovuti a rumore GPS o piccoli movimenti
                if (window.lastUserCoordinates) {
                    const distanza = getDistanceFromLatLonInKm(window.lastUserCoordinates.lat, window.lastUserCoordinates.lon, lat, lon);
                    if (distanza * 1000 < 10) {
                        aggiornaHeading = false;
                    } else {
                        angle = calcolaAngoloTraDuePunti(window.lastUserCoordinates.lat, window.lastUserCoordinates.lon, lat, lon) - 90;
                    }
                }

                // Se il movimento è sufficiente, aggiorna la direzione di marcia e memorizza la nuova posizione
                if (aggiornaHeading) {
                    window.userHeading = (angle + 90 + 360) % 360;
                    window.lastUserCoordinates = { lat, lon };
                }

                // Mostra nella UI l'heading in gradi e come direzione testuale (es. "Sud-Ovest")
                const direzioneDiv = document.getElementById("direzione");
                if (direzioneDiv) {
                    direzioneDiv.innerText = `🧭 Heading: ${window.userHeading.toFixed(0)}° (${getCardinalDirection(window.userHeading)})`;
                }

                // Definisce un'icona triangolare orientata secondo la direzione di marcia per rappresentare l'utente sulla mappa
                const userIcon = L.divIcon({
                    className: 'navigation-arrow-icon',
                    html: `<div style="transform: rotate(${angle}deg); width: 0; height: 0;
                                  border-left: 10px solid transparent;
                                  border-right: 10px solid transparent;
                                  border-bottom: 20px solid blue;"></div>`,
                    iconSize: [20, 20],
                    iconAnchor: [10, 10]
                });

                // Se la mappa non è ancora inizializzata, la crea e la centra sulla posizione attuale
                if (!window.leafletMap) {
                    const map = L.map('map').setView([lat, lon], 15);
                    window.leafletMap = map;

                    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                        attribution: '&copy; OpenStreetMap contributors'
                    }).addTo(map);
                }

                // Crea o aggiorna il marker dell'utente sulla mappa con la nuova posizione e direzione
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

                    // Aggiorna il testo dell'interfaccia con le coordinate attuali
                    coordsDiv.innerText = `Latitudine: ${lat}\nLongitudine: ${lon}`;
                    // Salva le coordinate GPS correnti come globali
                    window.userCoordinates = { lat, lon };
                    reverseGeocode(lat, lon);

                    // Prepara variabili per calcolare la direzione di marcia (heading) e controllare se aggiornarla
                    let angle = -90;
                    let aggiornaHeading = true;

                    // Ottiene e visualizza il nome della strada attuale tramite reverse geocoding
                    // Aggiorna la direzione di marcia solo se lo spostamento è superiore a 10 metri
                    // Questo evita cambi di direzione dovuti a rumore GPS o piccoli movimenti
                    if (window.lastUserCoordinates) {
                        const distanza = getDistanceFromLatLonInKm(window.lastUserCoordinates.lat, window.lastUserCoordinates.lon, lat, lon);
                        if (distanza * 1000 < 10) {
                            aggiornaHeading = false;
                        } else {
                            angle = calcolaAngoloTraDuePunti(window.lastUserCoordinates.lat, window.lastUserCoordinates.lon, lat, lon) - 90;
                        }
                    }

                    // Se il movimento è sufficiente, aggiorna la direzione di marcia e memorizza la nuova posizione
                    if (aggiornaHeading) {
                        window.userHeading = (angle + 90 + 360) % 360;
                        window.lastUserCoordinates = { lat, lon };
                    }

                    // Mostra nella UI l'heading in gradi e come direzione testuale (es. "Sud-Ovest")
                    const direzioneDiv = document.getElementById("direzione");
                    if (direzioneDiv) {
                        direzioneDiv.innerText = `🧭 Heading: ${window.userHeading.toFixed(0)}° (${getCardinalDirection(window.userHeading)})`;
                    }

                    // Definisce un'icona triangolare orientata secondo la direzione di marcia per rappresentare l'utente sulla mappa
                    const userIcon = L.divIcon({
                        className: 'navigation-arrow-icon',
                        html: `<div style="transform: rotate(${angle}deg); width: 0; height: 0;
                                      border-left: 10px solid transparent;
                                      border-right: 10px solid transparent;
                                      border-bottom: 20px solid blue;"></div>`,
                        iconSize: [20, 20],
                        iconAnchor: [10, 10]
                    });

                    // Se la mappa non è ancora inizializzata, la crea e la centra sulla posizione attuale
                    if (!window.leafletMap) {
                        const map = L.map('map').setView([lat, lon], 15);
                        window.leafletMap = map;

                        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                            attribution: '&copy; OpenStreetMap contributors'
                        }).addTo(map);

                        userMarker = L.marker([lat, lon], { icon: userIcon }).addTo(map).bindPopup('📍 Sei qui').openPopup();
                    } else {
                        // Crea o aggiorna il marker dell'utente sulla mappa con la nuova posizione e direzione
                        if (userMarker) {
                            userMarker.setLatLng([lat, lon]);
                            userMarker.setIcon(userIcon);
                        } else {
                            userMarker = L.marker([lat, lon], { icon: userIcon }).addTo(window.leafletMap).bindPopup('📍 Sei qui');
                        }
                    }

                    // Centra la vista della mappa sulla nuova posizione dell'utente
                    window.leafletMap.setView([lat, lon]);
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
    }

    initGeolocation(toggleDebug?.checked);

    toggleDebug?.addEventListener('change', () => {
        initGeolocation(toggleDebug.checked);
    });

    toggleNearest.addEventListener('change', () => {
        // Logica per filtrare le colonnine in base allo stato della checkbox
        if (toggleNearest.checked) {
            // Mostra solo le 5 più vicine
        } else {
            // Mostra tutte le colonnine
        }
    });
});