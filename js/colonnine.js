import { getDistanceFromLatLonInKm, calcolaAngoloTraDuePunti, getDirezioneUtente } from './geoutils.js';

let colonnineAree = [];

// Salva in memoria l'elenco completo delle colonnine
export function setColonnineData(aree) {
  colonnineAree = aree;
}

// Inizializza la mappa, la tabella e i marker grigi.
// Calcola le distanze tra l'utente e le colonnine e aggiorna l'interfaccia.
export function initColonnine(map, aree, userCoordinates) {
  console.log("📥 Inizio visualizzazione iniziale colonnine");
  document.body.style.cursor = "wait";
  //document.getElementById("coords").innerText = "⏳ Caricamento colonnine...";

  if (!userCoordinates) return null;
  const results = aree.map(area => {
    const lat = parseFloat(area.lat);
    const lon = parseFloat(area.lon);
    const distanzaRaw = getDistanceFromLatLonInKm(userCoordinates.lat, userCoordinates.lon, lat, lon);
    const distanza = typeof distanzaRaw === 'number' && !isNaN(distanzaRaw) ? distanzaRaw : Number.POSITIVE_INFINITY;

    return {
      nome: area.nome,
      strada: area.strada,
      lat,
      lon,
      distanza,
      colonnine: area.colonnine
    };
  });

  if (window.stationMarkers) {
    window.stationMarkers.forEach(m => map.removeLayer(m));
  }
  window.stationMarkers = [];

  aggiornaTabellaColonnine(results);

  results.forEach(station => {
    const markerIcon = L.divIcon({
      className: 'custom-marker',
      html: '<div class="marker-grigio"></div>',
      iconSize: [14, 14],
      iconAnchor: [7, 7]
    });

    const marker = L.marker([station.lat, station.lon], { icon: markerIcon }).addTo(map)
      .bindPopup(`<strong>${station.nome}</strong><br>${station.strada}<br>${station.distanza} km`);
    window.stationMarkers.push(marker);
  });

  document.body.style.cursor = "default";
  //document.getElementById("coords").innerText = "";
  // NB: Non toccare #strada e #direzione – sono gestiti da geolocalizzazione.js
}

// Aggiorna le colonnine: normalizza gli indirizzi, applica filtri opzionali,
// calcola le distanze, verifica la compatibilità degli indirizzi e delle direzioni,
// crea marker sulla mappa e aggiorna l'interfaccia utente.
export function updateColonnine(map, aree, userLat, userLon, heading) {
  const normalizeFull = s => s?.toLowerCase().trim();
  const results = [];

  const disattivaFiltri = document.querySelector("#toggleNearest")?.checked;
  const stradaUtente = window.stradaUtenteReverse ?? "";
  const stradaUtenteNorm = normalizeFull(stradaUtente);
  const direzioneUtente = getDirezioneUtente(heading);

  const preResults = aree.map(area => {
    const lat = parseFloat(area.lat);
    const lon = parseFloat(area.lon);
    const distanza = getDistanceFromLatLonInKm(userLat, userLon, lat, lon);

    const stradaAreaNorm = normalizeFull(area.stradaReverse);
    const stradaCompatibile =
      stradaUtenteNorm &&
      stradaAreaNorm &&
      (stradaAreaNorm.includes(stradaUtenteNorm) || stradaUtenteNorm.includes(stradaAreaNorm));

    if(stradaCompatibile) {
      console.log("Strada compatibile:", stradaUtenteNorm, stradaAreaNorm,area.nome);
    }

    const direzioneAngolareCompatibile = area.direzione?.toUpperCase() === direzioneUtente;

    if (disattivaFiltri || distanza <= 100) {
      const isAvanti = disattivaFiltri || (stradaCompatibile && direzioneAngolareCompatibile);

      return {
        nome: area.nome,
        strada: area.strada || area.stradaReverse || "Strada sconosciuta",
        lat,
        lon,
        distanza,
        colonnine: area.colonnine,
        isAvanti
      };
    }
    return null;
  }).filter(Boolean);

  preResults.sort((a, b) => a.distanza - b.distanza);
  const filtered = preResults;

  if (window.stationMarkers) {
    window.stationMarkers.forEach(m => map.removeLayer(m));
  }
  window.stationMarkers = [];

  aggiornaTabellaColonnine(filtered);

  filtered.forEach(station => {
    const markerIcon = L.divIcon({
      className: 'custom-marker',
      html: `<div class="${station.isAvanti ? 'marker-rosso' : 'marker-grigio'}"></div>`,
      iconSize: [14, 14],
      iconAnchor: [7, 7]
    });

    const marker = L.marker([station.lat, station.lon], { icon: markerIcon }).addTo(map)
      .bindPopup(`<strong>${station.nome}</strong><br>${station.strada}<br>${station.distanza.toFixed(2)} km`);
    window.stationMarkers.push(marker);
  });

  updateDistanceBar(filtered);
}

// Calcola la posizione delle icone sulla barra delle distanze in base alla distanza
// e aggiorna dinamicamente l'interfaccia con le informazioni delle colonnine.
function updateDistanceBar(stations) {
  const bar = document.getElementById("distance-bar");
  if (!bar) return;

  bar.innerHTML = "";

  stations.forEach(station => {
    const distanza = parseFloat(station.distanza);
    if (isNaN(distanza) || distanza > 100) return;

    const barWidth = bar.clientWidth;
    const maxDistance = 100;
    const positionPx = (distanza / maxDistance) * barWidth;
    const marker = document.createElement("div");
    marker.innerHTML = `<span title="${station.nome}\n${station.strada}\n${station.distanza.toFixed(2)} km\nStalli: ${station.colonnine?.length ?? "?"}">🔌</span>`;
    marker.style.position = "absolute";
    marker.style.left = `${positionPx}px`;
    marker.style.top = "-6px";
    marker.style.transform = "translateX(-50%)";
    marker.style.fontSize = "18px";
    bar.appendChild(marker);
  });
}

// Costruisce la tabella HTML con le informazioni delle colonnine filtrate,
// aggiornando i dati visualizzati nell'interfaccia utente.
function aggiornaTabellaColonnine(colonnine) {
  const tbody = document.querySelector("#stations-table tbody");
  if (!tbody) return;

  tbody.innerHTML = "";

  colonnine.forEach(station => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${station.nome}</td>
      <td>${station.strada}</td>
      <td>${station.distanza.toFixed(2)}</td>
      <td>${station.lat}</td>
      <td>${station.lon}</td>
    `;
    tbody.appendChild(row);
  });
}