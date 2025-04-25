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
  const bar = document.getElementById('visual-bar');
  bar.innerHTML = '';
  const container = document.getElementById('visual-bar-container');
  container.querySelectorAll('.label-inizio, .label-fine').forEach(el => el.remove());
  const filtered = aree.filter(a => a.strada === autostrada && typeof a.km === 'number');
  if (filtered.length === 0) return;
  const minKm = Math.min(...filtered.map(a => a.km));
  const maxKm = Math.max(...filtered.map(a => a.km));
  const areaInizio = filtered.find(a => a.km === minKm);
  const areaFine = filtered.find(a => a.km === maxKm);
  if (areaInizio && areaFine) {
    const labelLeft = document.createElement('div');
    labelLeft.className = 'label-inizio';
    labelLeft.innerText = areaFine.direzione || 'Fine';
    labelLeft.style.position = 'absolute';
    labelLeft.style.left = '0';
    labelLeft.style.top = '30px';
    container.appendChild(labelLeft);

    const labelRight = document.createElement('div');
    labelRight.className = 'label-fine';
    labelRight.innerText = areaInizio.direzione || 'Inizio';
    labelRight.style.position = 'absolute';
    labelRight.style.right = '0';
    labelRight.style.top = '30px';
    container.appendChild(labelRight);
  }
  const range = maxKm - minKm || 1;
  filtered.forEach(a => {
    const pos = ((a.km - minKm) / range) * 100;
    const marker = document.createElement('div');
    marker.className = 'marker-icon';
    marker.style.left = `calc(${pos}% - 8px)`;
    marker.title = `${a.nome} (km ${a.km})`;
    bar.appendChild(marker);
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
