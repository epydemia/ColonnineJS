import { getDistanceFromLatLonInKm, calcolaAngoloTraDuePunti, getDirezioneUtente } from './geoutils.js';

let colonnineAree = [];

export function setColonnineData(aree) {
  colonnineAree = aree;
}

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

export function updateColonnine(map, aree, userLat, userLon, heading) {
  const normalizza = s => s?.split(",")[0].trim().toLowerCase();
  const results = [];

  const disattivaFiltri = document.querySelector("#toggleNearest")?.checked;
  const stradaUtente = aree.length ? aree[0].stradaReverse ?? "" : "";
  const stradaUtenteNorm = normalizza(stradaUtente);
  const direzioneUtente = getDirezioneUtente(heading);

  const preResults = aree.map(area => {
    const lat = parseFloat(area.lat);
    const lon = parseFloat(area.lon);
    const distanza = getDistanceFromLatLonInKm(userLat, userLon, lat, lon);

    const stradaAreaNorm = normalizza(area.stradaReverse);
    const stradaCompatibile = stradaUtenteNorm && stradaAreaNorm && stradaUtenteNorm === stradaAreaNorm;
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

function updateDistanceBar(stations) {
  const bar = document.getElementById("distance-bar");
  if (!bar) return;

  bar.innerHTML = "";

  stations.forEach(station => {
    const distanza = parseFloat(station.distanza);
    if (isNaN(distanza) || distanza > 100) return;

    const positionPercent = (distanza / 100) * 100;
    const marker = document.createElement("div");
    marker.innerHTML = `<span title="${station.nome}\n${station.strada}\n${station.distanza.toFixed(2)} km\nStalli: ${station.colonnine?.length ?? "?"}">🔌</span>`;
    marker.style.position = "absolute";
    marker.style.left = `${positionPercent}%`;
    marker.style.top = "-6px";
    marker.style.transform = "translateX(-50%)";
    marker.style.fontSize = "18px";
    bar.appendChild(marker);
  });
}

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