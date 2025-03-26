document.addEventListener("DOMContentLoaded", () => {
    const coordsDiv = document.getElementById("coords");
    let userMarker = null;

    if ("geolocation" in navigator) {
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
  });