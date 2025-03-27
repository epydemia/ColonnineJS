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

async function getStradaFromLatLon(lat, lon) {
  const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&zoom=18&addressdetails=1`;
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'ColonnineJS-ReverseGeocoder'
      }
    });
    if (!res.ok) throw new Error("Reverse geocoding failed");
    const data = await res.json();
    const addr = data.address;
    return addr.road || addr.motorway || addr.cycleway || addr.footway || "Strada sconosciuta";
  } catch (err) {
    console.error(`❌ Errore reverse geocoding ${lat},${lon}:`, err);
    return "Errore";
  }
}

async function loadStations(userLat, userLon, map) {
  const res = await fetch('https://viabilita.autostrade.it/json/colonnine.json?1742906702332');
  const data = await res.json();
  const aree = data.listaAree || [];

  const preResults = aree.map(area => {
    const lat = parseFloat(area.lat);
    const lon = parseFloat(area.lon);
    const distanzaRaw = getDistanceFromLatLonInKm(userLat, userLon, lat, lon);
    const distanza = typeof distanzaRaw === 'number' && !isNaN(distanzaRaw) ? distanzaRaw : Number.POSITIVE_INFINITY;
    return {
      nome: area.nome,
      strada: area.strada,
      lat,
      lon,
      distanza
    };
  });

  preResults.sort((a, b) => a.distanza - b.distanza);
  const showOnlyNearest = document.querySelector("#toggleNearest")?.checked;
  const filteredResults = showOnlyNearest ? preResults.slice(0, 5) : preResults;

  const results = [];

  // Rimuove i vecchi marker dalla mappa
  if (window.stationMarkers) {
    window.stationMarkers.forEach(m => map.removeLayer(m));
  }
  window.stationMarkers = [];

  for (const area of filteredResults) {
    let strada = area.strada;

    if (typeof strada !== 'string' || strada.trim().length === 0) {
      const stradaReverse = await getStradaFromLatLon(area.lat, area.lon);
      strada = `${stradaReverse} *`;
    }

    results.push({
      ...area,
      distanza: area.distanza.toFixed(2),
      strada
    });
  }

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

    const marker = L.marker([station.lat, station.lon]).addTo(map)
      .bindPopup(`<strong>${station.nome}</strong><br>${station.strada}<br>${station.distanza} km`);
    window.stationMarkers.push(marker);
  });

  updateDistanceBar(results);
}

function updateDistanceBar(stations) {
  const bar = document.getElementById("distance-bar");
  if (!bar) return;

  bar.innerHTML = ""; // Pulisce i vecchi marker

  stations.forEach(station => {
    const distanza = parseFloat(station.distanza);
    if (isNaN(distanza) || distanza > 100) return;

    const positionPercent = (distanza / 100) * 100;
    const marker = document.createElement("div");
    marker.innerHTML = `<span title="${station.nome}\nStalli: ${station.colonnine?.length ?? "?"}\nPotenza: ${station.colonnine?.[0]?.modello ?? "?"}">🔌</span>`;
    marker.style.position = "absolute";
    marker.style.left = `${positionPercent}%`;
    marker.style.top = "-6px";
    marker.style.transform = "translateX(-50%)";
    marker.style.fontSize = "18px";
    bar.appendChild(marker);
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

  const toggle = document.querySelector("#toggleNearest");
  if (toggle) {
    toggle.addEventListener("change", () => {
      loadStations(window.userCoordinates.lat, window.userCoordinates.lon, window.leafletMap);
    });
  }
});