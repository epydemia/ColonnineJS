import { getAree } from './dataloader.js';

function getAutostrade(aree) {
  const set = new Set(aree.map(a => a.strada).filter(Boolean));
  return Array.from(set).sort();
}

function creaSelect(options) {
  const select = document.getElementById('autostradaSelect');
  options.forEach(opt => {
    const o = document.createElement('option');
    o.value = o.textContent = opt;
    select.appendChild(o);
  });
}

function aggiornaVisualBar(aree, autostrada) {
  function getAsse(autostrada) {
    const direzioni_autostrade = {
      "A1": "NORD-SUD", "A2": "NORD-SUD", "A3": "NORD-SUD", "A4": "EST-OVEST",
      "A5": "NORD-SUD", "A6": "NORD-SUD", "A7": "NORD-SUD", "A8": "NORDOVEST-SUDEST",
      "A9": "NORDOVEST-SUDEST", "A10": "EST-OVEST", "A11": "EST-OVEST", "A12": "NORDOVEST-SUDEST",
      "A13": "NORD-SUD", "A14": "NORD-SUD", "A15": "NORD-SUD", "A16": "EST-OVEST",
      "A17": "EST-OVEST", "A18": "NORD-SUD", "A19": "NORD-SUD", "A20": "EST-OVEST",
      "A21": "EST-OVEST", "A22": "NORD-SUD", "A23": "NORD-SUD", "A24": "EST-OVEST",
      "A25": "EST-OVEST", "A26": "NORD-SUD", "A27": "NORD-SUD", "A28": "EST-OVEST",
      "A29": "EST-OVEST"
    };
    const codice = autostrada.match(/A\d+/)?.[0];
    return direzioni_autostrade[codice] || "ND";
  }

  const container = document.getElementById('visual-bar-container');
  if (!container) return;
  const labelStart = document.getElementById("label-inizio");
  const labelEnd = document.getElementById("label-fine");
  if (labelStart) labelStart.textContent = '';
  if (labelEnd) labelEnd.textContent = '';
  const barTop = container.querySelector('#visual-bar-top');
  const barBottom = container.querySelector('#visual-bar-bottom');
  if (!barTop || !barBottom) return;

  barTop.innerHTML = '';
  barBottom.innerHTML = '';
  const filtered = aree.filter(a => a.strada === autostrada && typeof a.km === 'number');
  if (filtered.length === 0) return;
  const minKm = Math.min(...filtered.map(a => a.km));
  const maxKm = Math.max(...filtered.map(a => a.km));
  const areaInizio = filtered.find(a => a.km === minKm);
  const areaFine = filtered.find(a => a.km === maxKm);
  // Estrai le città di inizio e fine dal nome dell'autostrada (es. "A14 BOLOGNA-TARANTO")
  const autostradaLabel = autostrada.replace(/^A\d+\s*/, ''); // es. "BOLOGNA-TARANTO"
  const [inizio, fine] = autostradaLabel.split('-').map(s => s.trim());
  if (labelStart) labelStart.textContent = inizio || 'Inizio';
  if (labelEnd) labelEnd.textContent = fine || 'Fine';
  const range = maxKm - minKm || 1;

  const asse = getAsse(autostrada);
  let direzioniTop, direzioniBottom;

  switch (asse) {
    case "EST-OVEST":
      direzioniTop = ["EST"];
      direzioniBottom = ["OVEST"];
      break;
    case "NORD-SUD":
      direzioniTop = ["NORD"];
      direzioniBottom = ["SUD"];
      break;
    case "NORDOVEST-SUDEST":
      direzioniTop = ["NORDOVEST"];
      direzioniBottom = ["SUDEST"];
      break;
    case "NORDEST-SUDOVEST":
      direzioniTop = ["NORDEST"];
      direzioniBottom = ["SUDOVEST"];
      break;
    default:
      direzioniTop = [];
      direzioniBottom = [];
  }

  filtered.forEach(a => {
    const pos = ((a.km - minKm) / range) * 100;
    const marker = document.createElement('div');
    marker.className = 'marker-icon';
    marker.style.left = `calc(${pos}% - 8px)`;
    marker.title = `${a.nome} (km ${a.km})`;

    if (direzioniTop.includes(a.direzione_geografica)) {
      barTop.appendChild(marker);
    } else if (direzioniBottom.includes(a.direzione_geografica)) {
      barBottom.appendChild(marker);
    }
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  const aree = await getAree();
  const autostrade = getAutostrade(aree);
  creaSelect(autostrade);
  aggiornaVisualBar(aree, autostrade[0]);
  document.getElementById('autostradaSelect').addEventListener('change', e => {
    aggiornaVisualBar(aree, e.target.value);
  });
});
