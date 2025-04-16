import { getDistanceFromLatLonInKm, calcolaAngoloTraDuePunti } from './geoutils.js';

let userCoordinates = null;
let userHeading = 0;
let lastUserCoordinates = null;

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
      updateHeading(lat, lon);
      callback(lat, lon);
    }, 3000);
  } else if ("geolocation" in navigator) {
    navigator.geolocation.watchPosition(
      (position) => {
        const lat = parseFloat(position.coords.latitude.toFixed(6));
        const lon = parseFloat(position.coords.longitude.toFixed(6));

        userCoordinates = { lat, lon };
        updateHeading(lat, lon);
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

function updateHeading(lat, lon) {
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
  }
}

export async function getUserPosition() {
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