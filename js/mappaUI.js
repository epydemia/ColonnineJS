import { getDirezioneUtente } from './geoutils.js';

let userMarker = null;

export function aggiornaUserMarker(lat, lon, heading) {
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
      arrow.style.transform = `rotate(${heading}deg)`;
    }

    const currentZoom = window.leafletMap.getZoom();
    window.leafletMap.setView([lat, lon], currentZoom);
  }
}

export function aggiornaIndicatoreDirezione(heading, isStimato) {
  const direzioneDiv = document.getElementById("direzione");
  if (direzioneDiv) {
    direzioneDiv.innerText = `🧭 ${heading.toFixed(0)}°${isStimato ? '*' : ''} (${getDirezioneUtente(heading)})`;
  }
}