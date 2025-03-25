function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    const R = 6371; // Raggio della Terra in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
  
  async function loadStations(userLat, userLon, map) {
    const res = await fetch('https://viabilita.autostrade.it/json/colonnine.json?1742906702332');
    const data = await res.json();
    const aree = data.listaAree || [];
  
    const results = aree.map(area => {
      const lat = parseFloat(area.lat);
      const lon = parseFloat(area.lon);

      console.log("📍 User position:", userLat, userLon);
      console.log("📌 Area:", area.nome, "Lat:", area.lat, "Lon:", area.lon);

      const distanzaRaw = getDistanceFromLatLonInKm(userLat, userLon, lat, lon);
      console.log("📏 Distanza calcolata:", distanzaRaw);

      const distanza = typeof distanzaRaw === 'number' && !isNaN(distanzaRaw) ? distanzaRaw.toFixed(2) : 'N/A';
      return {
        nome: area.nome,
        strada: area.strada,
        lat,
        lon,
        distanza
      };
    });
  
    results.sort((a, b) => a.distanza - b.distanza);
  
    const tbody = document.querySelector("#stations-table tbody");
    tbody.innerHTML = "";
    results.forEach(station => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${station.nome}</td>
        <td>${station.strada}</td>
        <td>${station.distanza}</td>
        <td>${station.lat}</td>
        <td>${station.lon}</td>
      `;
      tbody.appendChild(row);
  
      L.marker([station.lat, station.lon]).addTo(map)
        .bindPopup(`<strong>${station.nome}</strong><br>${station.strada}<br>${station.distanza} km`);
    });
  }
  
  // Aspetta che l'utente venga localizzato da geolocalizzazione.js
  window.addEventListener("load", () => {
    const interval = setInterval(() => {
      const map = window.leafletMap;
      const userPos = window.userCoordinates;
      if (map && userPos) {
        clearInterval(interval);
        loadStations(userPos.lat, userPos.lon, map);
      }
    }, 500);
  });