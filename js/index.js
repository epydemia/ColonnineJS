import { getAree } from './dataloader.js';
import { getUserCoordinates, getUserHeading, getUserPosition, initGeolocation } from './geolocalizzazione.js';
import { initColonnine, updateColonnine, setColonnineData } from './colonnine.js';

let map;

window.addEventListener("load", async () => {
  const aree = await getAree();
  setColonnineData(aree);

  const debugEnabled = localStorage.getItem('debugPosizione') === '1';
  document.querySelector('#toggleDebug').checked = debugEnabled;

  // Inizializza mappa se necessario
  if (window.leafletMap) {
    console.warn("⚠️ La mappa è già stata inizializzata. Salto la creazione.");
    map = window.leafletMap;
  } else {
    console.log("🗺️ Inizializzo Leaflet map...");
    map = L.map('map').setView([41.9, 12.5], 15);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);
    window.leafletMap = map;
    console.log("✅ Mappa inizializzata");
  }

  // Avvia geolocalizzazione e callback
  const debug = debugEnabled;
  initGeolocation((lat, lon) => {
    const heading = getUserHeading();
    if (lat != null && lon != null) {
        console.log("updateColonnine", lat, lon);
      updateColonnine(map, aree, lat, lon, heading);
    }
  }, debug);
  const coords = await getUserPosition();
if (coords) {
    console.log("initColonnine", coords.lat, coords.lon);
  initColonnine(map, aree, coords);
}

  document.querySelector('#toggleNearest')?.addEventListener('change', async () => {
    const coords = getUserCoordinates();
    const heading = getUserHeading();
    if (coords) {
      updateColonnine(map, aree, coords.lat, coords.lon, heading);
    }
  });

  document.querySelector('#toggleDebug')?.addEventListener('change', (e) => {
    localStorage.setItem('debugPosizione', e.target.checked ? '1' : '0');
    window.location.reload();
  });

  // Event listener per il pannello delle opzioni
  document.querySelector('#options-toggle')?.addEventListener('click', () => {
    document.getElementById('options-panel')?.classList.toggle('open');
  });
});