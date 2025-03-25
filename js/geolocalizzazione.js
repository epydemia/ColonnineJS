document.addEventListener("DOMContentLoaded", () => {
    const coordsDiv = document.getElementById("coords");
  
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude.toFixed(6);
          const lon = position.coords.longitude.toFixed(6);

          coordsDiv.innerText = `Latitudine: ${lat}\nLongitudine: ${lon}`;

          // Visualizza mappa centrata sulla posizione attuale
          const map = L.map('map').setView([lat, lon], 15);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
          }).addTo(map);

          L.marker([lat, lon]).addTo(map)
            .bindPopup('📍 Sei qui')
            .openPopup();

          // Reverse geocoding con Nominatim (OpenStreetMap)
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&zoom=18&addressdetails=1`,
              {
                headers: {
                  "User-Agent": "FreetoX-App-Daniele"
                }
              }
            );

            if (!response.ok) throw new Error("Errore nella richiesta di reverse geocoding");

            const data = await response.json();
            const strada = data.address.road || data.address.motorway || "Strada non trovata";

            coordsDiv.innerText += `\nStrada corrente: ${strada}`;
          } catch (err) {
            coordsDiv.innerText += `\n(Impossibile determinare la strada: ${err.message})`;
          }
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