import { getDistanceFromLatLonInKm, calcolaAngoloTraDuePunti, getDirezioneUtente } from './geoutils.js';

let userCoordinates = null;
let userHeading = 0;
let isHeadingStimato = true;
let lastUserCoordinates = null;
let userMarker = null;


const autostradeMap = {
  "A1": ["Milano Napoli", "Autostrada del Sole"],
  "A4": ["Torino Trieste", "Serenissima"],
  "A7": ["Milano Genova", "Autostrada dei Giovi"],
  "A8": ["Milano Varese", "Autostrada dei Laghi"],
  "A9": ["Lainate Chiasso", "Autostrada dei Laghi"],
  "A10": ["Genova Ventimiglia", "Autostrada dei Fiori"],
  "A11": ["Firenze Pisa", "Firenze Mare"],
  "A12": ["Genova Roma", "Autostrada Tirrenica"],
  "A13": ["Bologna Padova"],
  "A14": ["Bologna Taranto", "Autostrada Adriatica"],
  "A15": ["Parma La Spezia", "Autostrada della Cisa"],
  "A16": ["Napoli Canosa", "Autostrada dei Due Mari"],
  "A18": ["Messina Catania", "Siracusa Rosolini"],
  "A19": ["Palermo Catania"],
  "A20": ["Messina Palermo"],
  "A21": ["Torino Brescia", "Autostrada dei Vini"],
  "A22": ["Modena Brennero", "Autostrada del Brennero"],
  "A23": ["Palmanova Tarvisio"],
  "A24": ["Roma Teramo", "Autostrada dei Parchi"],
  "A25": ["Torano Pescara", "Autostrada dei Parchi"],
  "A26": ["Voltri Gravellona Toce", "Autostrada dei Trafori"],
  "A27": ["Mestre Belluno"],
  "A28": ["Portogruaro Conegliano"],
  "A29": ["Palermo Mazara del Vallo", "Autostrada del Sale"]
};

function trovaCodiceAutostrada(nomeStrada) {
  const normalized = nomeStrada.toLowerCase();
  for (const [codice, nomi] of Object.entries(autostradeMap)) {
    if (nomi.some(n => normalized.includes(n.toLowerCase()))) {
      return codice;
    }
  }
  return null;
}

export function getUserCoordinates() {
  return userCoordinates;
}

export function getUserHeading() {
  return userHeading;
}

export function reverseGeocode(lat, lon) {
  return fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`)
    .then(response => response.json())
    .then(data => data.address?.road || data.display_name || "Strada non trovata")
    .catch(err => {
      console.warn("Reverse geocoding fallito:", err);
      return "Errore";
    });
}

export function initGeolocation(callback, debug = false) {
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
      { lat: 41.72199, lon: 15.411748 }
    ];
    let index = 0;

    setInterval(() => {
      const { lat, lon } = debugCoords[index];
      index = (index + 1) % debugCoords.length;

      userCoordinates = { lat, lon };
      const coordsDiv = document.getElementById("coords");
      if (coordsDiv) {
        coordsDiv.innerText = `Latitudine: ${lat}\nLongitudine: ${lon}`;
      }
      reverseGeocode(lat, lon).then(strada => {
        window.stradaUtenteReverse = strada;
        window.codiceAutostradaUtente = trovaCodiceAutostrada(strada);
        const stradaDiv = document.getElementById("strada");
        if (stradaDiv) {
          if (window.codiceAutostradaUtente)  {
            const nomi = autostradeMap[window.codiceAutostradaUtente].join(" / ");
            stradaDiv.innerText = `🛣️ ${window.codiceAutostradaUtente} – ${nomi}`;
          } else {
            stradaDiv.innerText = `🛣️ ${strada}`;
          }
          
        }

      });
      updateHeading(lat, lon, null);
      aggiornaIndicatoreDirezione();

      aggiornaUserMarker(lat, lon);

      callback(lat, lon);
    }, 3000);
  } else if ("geolocation" in navigator) {
    navigator.geolocation.watchPosition(
      (position) => {
        const lat = parseFloat(position.coords.latitude.toFixed(6));
        const lon = parseFloat(position.coords.longitude.toFixed(6));
        const deviceHeading = position.coords.heading;

        userCoordinates = { lat, lon };
        const coordsDiv = document.getElementById("coords");
        if (coordsDiv) {
          coordsDiv.innerText = `Latitudine: ${lat}\nLongitudine: ${lon}`;
        }
        reverseGeocode(lat, lon).then(strada => {
          window.stradaUtenteReverse = strada;
          window.codiceAutostradaUtente = trovaCodiceAutostrada(strada);
          const stradaDiv = document.getElementById("strada");
          if (stradaDiv) {
            stradaDiv.innerText = `🛣️ ${strada}`;
          }
          const autostradaDiv = document.getElementById("autostrada");
          if (autostradaDiv && window.codiceAutostradaUtente) {
            const nomi = autostradeMap[window.codiceAutostradaUtente].join(" / ");
            autostradaDiv.innerText = `🛣️ ${window.codiceAutostradaUtente} – ${nomi}`;
          }
        });
        updateHeading(lat, lon, deviceHeading);
        aggiornaIndicatoreDirezione();

        aggiornaUserMarker(lat, lon);

        callback(lat, lon);
      },
      (error) => {
        console.warn("Errore nella geolocalizzazione:", error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  } else {
    console.warn("⚠️ Geolocalizzazione non supportata dal browser.");
  }
}

function aggiornaIndicatoreDirezione() {
  const direzioneDiv = document.getElementById("direzione");
  if (direzioneDiv) {
    direzioneDiv.innerText = `🧭 ${userHeading.toFixed(0)}°${(typeof isHeadingStimato !== 'undefined' && isHeadingStimato) ? '*' : ''} (${getDirezioneUtente(userHeading)})`;
  }
}

function updateHeading(lat, lon, heading = null) {
  if (heading !== null && !isNaN(heading)) {
    userHeading = heading;
    lastUserCoordinates = { lat, lon };
    isHeadingStimato = false;
    return;
  }

  let angle = -90;
  let aggiorna = true;

  if (lastUserCoordinates) {
    const distanza = getDistanceFromLatLonInKm(lastUserCoordinates.lat, lastUserCoordinates.lon, lat, lon);
    if (distanza * 1000 < 10) {
      aggiorna = false;
    } else {
      angle = calcolaAngoloTraDuePunti(lastUserCoordinates.lat, lastUserCoordinates.lon, lat, lon) - 90;
    }
  }

  if (aggiorna) {
    userHeading = (angle + 90 + 360) % 360;
    lastUserCoordinates = { lat, lon };
    isHeadingStimato = true;
  }
}

export async function getUserPosition() {
    console.log("getUserPosition");
  if (userCoordinates) return userCoordinates;

  return new Promise(resolve => {
    const check = () => {
      if (userCoordinates) {
        resolve(userCoordinates);
      } else {
        setTimeout(check, 200);
      }
    };
    check();
  });
}

function aggiornaUserMarker(lat, lon) {
  if (window.leafletMap) {
    if (!userMarker) {
      const icon = L.divIcon({
        className: 'user-heading-icon',
        html: '<div class="marker-blu"><span class="freccia">▲</span></div>',
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });
      userMarker = L.marker([lat, lon], { icon }).addTo(window.leafletMap);
    } else {
      userMarker.setLatLng([lat, lon]);
    }

    const arrow = userMarker._icon?.querySelector('.freccia');
    if (arrow) {
      arrow.style.transform = `rotate(${userHeading}deg)`;
    }

    const currentZoom = window.leafletMap.getZoom();
    window.leafletMap.setView([lat, lon], currentZoom);
  }
}