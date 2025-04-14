// Calcola la distanza in km tra due coordinate geografiche usando la formula dell'haversine
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

function calcolaAngoloTraDuePunti(lat1, lon1, lat2, lon2) {
  const toRad = deg => deg * Math.PI / 180;
  const toDeg = rad => rad * 180 / Math.PI;

  const dLon = toRad(lon2 - lon1);
  lat1 = toRad(lat1);
  lat2 = toRad(lat2);

  const y = Math.sin(dLon) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) -
            Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);

  let brng = Math.atan2(y, x);
  brng = toDeg(brng);
  return (brng + 360) % 360;
}

let cachedAree = null;

// Esegue una richiesta reverse geocoding a Nominatim per ottenere il nome della strada da latitudine e longitudine
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

// Carica la lista delle colonnine da due file JSON locali, calcola la distanza da ciascuna rispetto alla posizione dell'utente,
// ordina per distanza, mostra sulla mappa e nella tabella, e aggiorna la barra di distanza
async function loadStations(userLat, userLon, map) {
  if (!cachedAree) {
    let dataFreeToX = { listaAree: [] };
    let dataTest = { listaAree: [] };

    try {
      const resFreeToX = await fetch('./data/free_to_x.json');
      if (!resFreeToX.ok) throw new Error("Errore nel caricamento del file free_to_x.json");
      dataFreeToX = await resFreeToX.json();
    } catch (err) {
      console.error("❌ Errore nel caricamento del file free_to_x.json:", err);
    }

    try {
      const resTest = await fetch('./data/test.json');
      if (!resTest.ok) throw new Error("Errore nel caricamento del file test.json");
      dataTest = await resTest.json();
    } catch (err) {
      console.error("❌ Errore nel caricamento del file test.json:", err);
    }

    cachedAree = [...dataFreeToX.listaAree, ...dataTest.listaAree];
  }

  const aree = cachedAree;

  // Crea un array preliminare di colonnine con distanza calcolata
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
      distanza,
      colonnine: area.colonnine // Aggiunto per estrarre colonnine
    };
  });

  // Ordina le colonnine per distanza crescente
  preResults.sort((a, b) => a.distanza - b.distanza);
  const showOnlyNearest = document.querySelector("#toggleNearest")?.checked;

  // Applica il filtro per mostrare solo le 5 colonnine più vicine se la checkbox è attiva
  const filteredResults = showOnlyNearest ? preResults.slice(0, 5) : preResults;

  const results = [];

  // Rimuove eventuali marker precedenti dalla mappa
  if (window.stationMarkers) {
    window.stationMarkers.forEach(m => map.removeLayer(m));
  }
  window.stationMarkers = [];

  // Elabora ogni area di servizio e prepara i dati per la tabella e la mappa
  for (const area of filteredResults) {
    let strada = area.strada;

    // Se il campo 'strada' è mancante, effettua una chiamata di reverse geocoding per ottenerlo
    if (typeof strada !== 'string' || strada.trim().length === 0) {
      const stradaReverse = await getStradaFromLatLon(area.lat, area.lon);
      strada = `${stradaReverse} *`;
    }

    const numStalli = area.colonnine?.length ?? "?";
    const potenza = area.colonnine?.[0]?.modello ?? "?";

    // Salva i dati finali per questa stazione, includendo distanza formattata e informazioni utili
    results.push({
      ...area,
      distanza: area.distanza.toFixed(2),
      strada,
      numStalli,
      potenza
    });
  }

  const tbody = document.querySelector("#stations-table tbody");
  tbody.innerHTML = "";
  // Popola la tabella HTML e crea i marker sulla mappa per ogni colonnina
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

    const angolo = calcolaAngoloTraDuePunti(userLat, userLon, station.lat, station.lon);
    const differenza = Math.abs((angolo - window.userHeading + 360) % 360);
    const isAvanti = differenza < 60 || differenza > 300;

    const markerIcon = L.divIcon({
      className: 'custom-marker',
      html: `<div style="
        width: 14px;
        height: 14px;
        border-radius: 50%;
        background-color: ${isAvanti ? 'red' : 'gray'};
        border: 2px solid white;"></div>`,
      iconSize: [14, 14],
      iconAnchor: [7, 7]
    });

    const marker = L.marker([station.lat, station.lon], { icon: markerIcon }).addTo(map)
      .bindPopup(`<strong>${station.nome}</strong><br>${station.strada}<br>${station.distanza} km`);
    window.stationMarkers.push(marker);
  });

  // Aggiorna la barra di distanza con i risultati finali
  updateDistanceBar(results);
}

// Aggiorna la barra orizzontale con i marker delle colonnine, in posizione proporzionale alla distanza (0–100 km)
function updateDistanceBar(stations) {
  const bar = document.getElementById("distance-bar");
  if (!bar) return;

  bar.innerHTML = ""; // Pulisce i vecchi marker

  const filteredStations = stations.filter(station => {
    const angolo = calcolaAngoloTraDuePunti(window.userCoordinates.lat, window.userCoordinates.lon, station.lat, station.lon);
    const differenza = Math.abs((angolo - window.userHeading + 360) % 360);
    return differenza < 60 || differenza > 300;
  });

  // Aggiunge un'emoji 🔌 per ogni colonnina entro 100 km con tooltip informativo
  filteredStations.forEach(station => {
    const distanza = parseFloat(station.distanza);
    if (isNaN(distanza) || distanza > 100) return;

    const positionPercent = (distanza / 100) * 100;
    const marker = document.createElement("div");
    marker.innerHTML = `<span title="${station.nome}\n${station.strada}\n${station.distanza} km\nStalli: ${station.numStalli}\nPotenza: ${station.potenza}">🔌</span>`;
    marker.style.position = "absolute";
    marker.style.left = `${positionPercent}%`;
    marker.style.top = "-6px";
    marker.style.transform = "translateX(-50%)";
    marker.style.fontSize = "18px";
    bar.appendChild(marker);
  });
}

// Attende che la mappa e la posizione utente siano pronte prima di caricare le colonnine
window.addEventListener("load", () => {
  const interval = setInterval(() => {
    const map = window.leafletMap;
    const userPos = window.userCoordinates;
    if (map && userPos) {
      clearInterval(interval);
      loadStations(userPos.lat, userPos.lon, map);
    }
  }, 500);

  // Ricarica le colonnine se viene modificata l'opzione "Mostra solo le 5 più vicine"
  const toggle = document.querySelector("#toggleNearest");
  if (toggle) {
    toggle.addEventListener("change", () => {
      loadStations(window.userCoordinates.lat, window.userCoordinates.lon, window.leafletMap);
    });
  }

  if ("geolocation" in navigator) {
    navigator.geolocation.watchPosition(
      (position) => {
        const lat = parseFloat(position.coords.latitude.toFixed(6));
        const lon = parseFloat(position.coords.longitude.toFixed(6));
        if (!window.userCoordinates || lat !== window.userCoordinates.lat || lon !== window.userCoordinates.lon) {
          window.userCoordinates = { lat, lon };
          loadStations(lat, lon, window.leafletMap);
        }
      },
      (error) => {
        console.warn("Errore nella geolocalizzazione continua:", error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  }
});