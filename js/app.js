// Caravana — mapa de áreas y parkings para autocaravanas en España
'use strict';

// ── Configuración ──────────────────────────────────────────────
const KINDS = {
  area:    { label: 'Área de autocaravanas', short: 'Áreas',    color: 'var(--k-area)' },
  parking: { label: 'Parking autorizado',    short: 'Parkings', color: 'var(--k-parking)' },
  camping: { label: 'Camping',               short: 'Campings', color: 'var(--k-camping)' },
  vaciado: { label: 'Punto de vaciado',      short: 'Vaciado',  color: 'var(--k-vaciado)' },
};
// [clave, etiqueta, ¿cumple el filtro?, campo con el dato para la ficha]
const SERVICES = [
  ['gratis', 'Gratis',       s => s.fee === false, 'fee'],
  ['agua',   'Agua',         s => s.w === true,    'w'],
  ['luz',    'Electricidad', s => s.e === true,    'e'],
  ['vaciado','Vaciado',      s => s.d === true,    'd'],
  ['aseos',  'Aseos',        s => s.toi === true,  'toi'],
  ['duchas', 'Duchas',       s => s.sh === true,   'sh'],
  ['wifi',   'Wifi',         s => s.wifi === true, 'wifi'],
];
const SPAIN = { center: [40.2, -3.6], zoom: 6 };
const LIST_LIMIT = 60;
const PHOTON = 'https://photon.komoot.io/api/';
const SPAIN_BBOX = '-18.6,27.4,4.6,44.0';  // península, Baleares y Canarias

const ICONS = {
  back:  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 18l-6-6 6-6"/></svg>',
  yes:   '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12l5 5L20 7"/></svg>',
  no:    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  maybe: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="1"/></svg>',
  route: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 11 19-9-9 19-2-8-8-2z"/></svg>',
  web:   '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20 15 15 0 0 1 0-20"/></svg>',
  phone: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/></svg>',
  edit:  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>',
};

// ── Estado ─────────────────────────────────────────────────────
const state = {
  sites: [],
  byId: new Map(),
  kinds: new Set(Object.keys(KINDS)),
  services: new Set(),
  selected: null,
  user: null,          // { la, lo } si el usuario ha compartido su ubicación
};
let map, cluster, userMarker;
const markers = new Map();

// ── Utilidades ─────────────────────────────────────────────────
const $ = id => document.getElementById(id);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
function km(a, b) {
  const R = 6371, r = x => x * Math.PI / 180;
  const h = Math.sin(r(b.la - a.la) / 2) ** 2 + Math.cos(r(a.la)) * Math.cos(r(b.la)) * Math.sin(r(b.lo - a.lo) / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
const fmtKm = d => d < 1 ? `${Math.round(d * 1000)} m` : d < 10 ? `${d.toFixed(1).replace('.', ',')} km` : `${Math.round(d)} km`;
// Horario y estancia de OpenStreetMap en español
const MONTHS = { Jan: "ene", Feb: "feb", Mar: "mar", Apr: "abr", May: "may", Jun: "jun", Jul: "jul", Aug: "ago", Sep: "sep", Oct: "oct", Nov: "nov", Dec: "dic" };
const DAYS = { Mo: "L", Tu: "M", We: "X", Th: "J", Fr: "V", Sa: "S", Su: "D", PH: "festivos" };
function fmtHours(oh) {
  if (!oh) return null;
  if (oh.trim() === "24/7") return "24 horas, todos los días";
  return oh.replace(/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\b/g, m => MONTHS[m])
    .replace(/\b(Mo|Tu|We|Th|Fr|Sa|Su|PH)\b/g, d => DAYS[d])
    .replace(/\boff\b/g, "cerrado")
    .replace(/;\s*/g, " · ");
}
function fmtStay(ms) {
  if (!ms) return null;
  if (/^(no|none|unlimited)$/i.test(ms.trim())) return "Sin límite";
  return ms.replace(/\bdays?\b/i, "días").replace(/\bhours?\b/i, "horas").replace(/\bnights?\b/i, "noches");
}
const siteName = s => s.n || `${KINDS[s.k].label}${s.c ? ' en ' + s.c : ''}`;
function debounce(fn, ms) { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; }
function toast(msg) {
  const el = document.createElement('div');
  el.className = 'toast'; el.setAttribute('role', 'status'); el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3500);
}
const matches = s => state.kinds.has(s.k) && SERVICES.every(([key, , test]) => !state.services.has(key) || test(s));
const isMobile = () => window.matchMedia('(max-width: 820px)').matches;

// ── Mapa ───────────────────────────────────────────────────────
function initMap() {
  map = L.map('map', { zoomControl: true, worldCopyJump: false }).setView(SPAIN.center, SPAIN.zoom);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map);
  cluster = L.markerClusterGroup({
    maxClusterRadius: 50,
    showCoverageOnHover: false,
    iconCreateFunction: c => {
      const n = c.getChildCount();
      const size = n < 10 ? 34 : n < 100 ? 40 : 48;
      return L.divIcon({ html: `<div class="cluster" style="width:${size}px;height:${size}px">${n}</div>`, className: '', iconSize: [size, size] });
    },
  });
  map.addLayer(cluster);
  map.on('moveend', debounce(() => { renderList(); saveView(); }, 150));
}

function markerFor(site) {
  if (markers.has(site.id)) return markers.get(site.id);
  const m = L.marker([site.la, site.lo], {
    icon: L.divIcon({ html: `<div class="pin" style="background:${KINDS[site.k].color}"></div>`, className: '', iconSize: [26, 26], iconAnchor: [13, 26] }),
    title: siteName(site),
    keyboard: true,
  });
  m.on('click', () => openSite(site.id));
  // Los marcadores dentro de un grupo no existen en el DOM hasta que se muestran
  m.on('add', () => m.getElement()?.firstElementChild?.classList.toggle('is-active', state.selected === site.id));
  markers.set(site.id, m);
  return m;
}

function renderMarkers() {
  cluster.clearLayers();
  cluster.addLayers(state.sites.filter(matches).map(markerFor));
}

// ── Filtros ────────────────────────────────────────────────────
function renderFilters() {
  const counts = state.sites.reduce((acc, s) => ((acc[s.k] = (acc[s.k] || 0) + 1), acc), {});
  $('kindFilters').innerHTML = Object.entries(KINDS).map(([k, v]) => `
    <button type="button" class="chip" data-action="kind" data-kind="${k}" aria-pressed="${state.kinds.has(k)}">
      <span class="dot" style="background:${v.color}"></span>${v.short} <span class="n">${(counts[k] || 0).toLocaleString('es-ES')}</span>
    </button>`).join('');
  $('serviceFilters').innerHTML = SERVICES.map(([key, label]) => `
    <button type="button" class="chip" data-action="service" data-service="${key}" aria-pressed="${state.services.has(key)}">${label}</button>`).join('');
}

function applyFilters() {
  renderFilters();
  renderMarkers();
  renderList();
}

// ── Lista de resultados ────────────────────────────────────────
function referencePoint() {
  if (state.user) return state.user;
  const c = map.getCenter();
  return { la: c.lat, lo: c.lng };
}

function renderList() {
  const bounds = map.getBounds();
  const filtered = state.sites.filter(matches);
  const visible = filtered.filter(s => bounds.contains([s.la, s.lo]));
  const ref = referencePoint();
  visible.forEach(s => { s._d = km(ref, s); });
  visible.sort((a, b) => a._d - b._d);

  $('resultsTitle').textContent = state.user ? 'Más cerca de ti' : 'Sitios en el mapa';
  $('resultsCount').textContent = `${visible.length.toLocaleString('es-ES')} de ${filtered.length.toLocaleString('es-ES')}`;
  const list = $('resultsList');
  if (!visible.length) {
    list.innerHTML = `<li class="results-empty">No hay sitios con estos filtros en esta zona. Aleja el mapa o quita algún filtro.</li>`;
    return;
  }
  const shown = visible.slice(0, LIST_LIMIT);
  list.innerHTML = shown.map(s => {
    const tags = [];
    if (s.fee === false) tags.push('Gratis');
    if (s.fee === true) tags.push('De pago');
    if (s.w) tags.push('Agua');
    if (s.e) tags.push('Luz');
    if (s.d && s.k !== 'vaciado') tags.push('Vaciado');
    return `<li class="result${state.selected === s.id ? ' is-active' : ''}" data-action="open" data-id="${s.id}" tabindex="0">
      <span class="kind-dot" style="background:${KINDS[s.k].color}" aria-hidden="true"></span>
      <strong>${esc(siteName(s))}</strong>
      <span class="dist">${fmtKm(s._d)}</span>
      <span class="meta">${esc(KINDS[s.k].label)}${tags.length ? ' · ' + tags.join(' · ') : ''}</span>
    </li>`;
  }).join('') + (visible.length > LIST_LIMIT
    ? `<li class="results-empty">Y ${(visible.length - LIST_LIMIT).toLocaleString('es-ES')} más: acerca el mapa para verlos.</li>` : '');
}

// ── Ficha ──────────────────────────────────────────────────────
function serviceItem(label, value) {
  const cls = value === true ? 'yes' : value === false ? 'no' : 'unknown';
  const icon = value === true ? ICONS.yes : value === false ? ICONS.no : ICONS.maybe;
  const note = value == null ? ' <span class="muted">(sin dato)</span>' : '';
  return `<li class="${cls}">${icon}${label}${note}</li>`;
}

function renderDetail(s) {
  const k = KINDS[s.k];
  const price = s.fee === false ? '<span class="price free">Gratis</span>'
    : s.fee === true ? `<span class="price paid">De pago${s.ch ? ' · ' + esc(s.ch) : ''}</span>`
    : '<span class="price unknown">Precio sin datos</span>';
  const services = SERVICES.filter(([key]) => key !== 'gratis')
    .map(([, label, , field]) => serviceItem(label, s[field])).join('');
  const facts = [
    ['Horario', fmtHours(s.oh)], ['Estancia máxima', fmtStay(s.ms)], ['Plazas', s.cap],
    ['Coordenadas', `${s.la.toFixed(5)}, ${s.lo.toFixed(5)}`],
  ].filter(([, v]) => v).map(([t, v]) => `<dt>${t}</dt><dd>${esc(v)}</dd>`).join('');
  const osmType = { n: 'node', w: 'way', r: 'relation' }[s.id[0]];
  const webUrl = s.web && /^https?:\/\//i.test(s.web) ? s.web : s.web ? 'https://' + s.web : null;

  $('detail').innerHTML = `
    <button type="button" class="detail-back" data-action="close">${ICONS.back} Volver a la lista</button>
    <span class="kind"><span class="kind-dot" style="background:${k.color}"></span>${k.label}</span>
    <h2>${esc(siteName(s))}</h2>
    <p class="where">${s.c ? esc(s.c) : ''}${state.user ? `${s.c ? ' · ' : ''}a ${fmtKm(km(state.user, s))} de ti` : ''}</p>
    ${price}
    <ul class="services">${services}</ul>
    ${facts ? `<dl class="facts">${facts}</dl>` : ''}
    ${s.ds ? `<p class="desc">${esc(s.ds)}</p>` : ''}
    <div class="actions">
      <a class="btn btn-primary" href="https://www.google.com/maps/dir/?api=1&destination=${s.la},${s.lo}" target="_blank" rel="noopener">${ICONS.route}Cómo llegar</a>
      ${webUrl ? `<a class="btn btn-line" href="${esc(webUrl)}" target="_blank" rel="noopener">${ICONS.web}Web</a>` : ''}
      ${s.tel ? `<a class="btn btn-line" href="tel:${esc(s.tel.replace(/\s+/g, ''))}">${ICONS.phone}${esc(s.tel)}</a>` : ''}
    </div>
    <p class="source">¿Falta algo o hay un error? <a href="https://www.openstreetmap.org/${osmType}/${s.id.slice(1)}" target="_blank" rel="noopener">${ICONS.edit} Corrígelo en OpenStreetMap</a> y aparecerá aquí en la siguiente actualización.</p>`;
}

function openSite(id, { fly = true } = {}) {
  const s = state.byId.get(id);
  if (!s) return;
  state.selected = id;
  renderDetail(s);
  $('detail').hidden = false;
  document.querySelector('.filters').hidden = true;
  document.querySelector('.results').hidden = true;
  $('panel').scrollTop = 0;
  if (isMobile()) $('panel').classList.add('is-expanded');
  markers.forEach((m, mid) => m.getElement()?.firstElementChild?.classList.toggle('is-active', mid === id));
  if (fly) {
    const m = markerFor(s);
    if (cluster.hasLayer(m)) cluster.zoomToShowLayer(m, () => map.panTo([s.la, s.lo]));
    else map.setView([s.la, s.lo], Math.max(map.getZoom(), 14));
  }
  history.replaceState(null, '', '#s=' + id);
  $('detail').querySelector('.detail-back').focus({ preventScroll: true });
}

function closeSite() {
  state.selected = null;
  $('detail').hidden = true;
  document.querySelector('.filters').hidden = false;
  document.querySelector('.results').hidden = false;
  markers.forEach(m => m.getElement()?.firstElementChild?.classList.remove('is-active'));
  saveView();
  renderList();
}

// ── Vista compartible en la URL ────────────────────────────────
function saveView() {
  if (state.selected) return;
  const c = map.getCenter();
  history.replaceState(null, '', `#@${c.lat.toFixed(4)},${c.lng.toFixed(4)},${map.getZoom()}`);
}
function restoreView() {
  const h = decodeURIComponent(location.hash.slice(1));
  const site = h.match(/^s=([nwr]\d+)$/);
  if (site && state.byId.has(site[1])) { openSite(site[1]); return; }
  const v = h.match(/^@(-?\d+\.?\d*),(-?\d+\.?\d*),(\d+)$/);
  if (v) map.setView([+v[1], +v[2]], +v[3]);
}

// ── Búsqueda de localidades (Photon, OpenStreetMap) ────────────
let searchItems = [], searchIndex = -1, searchAbort;
async function searchPlaces(q) {
  const box = $('searchResults'), input = $('searchInput');
  if (q.trim().length < 2) { box.hidden = true; input.setAttribute('aria-expanded', 'false'); return; }
  searchAbort?.abort();
  searchAbort = new AbortController();
  try {
    const url = `${PHOTON}?q=${encodeURIComponent(q)}&lang=es&limit=6&bbox=${SPAIN_BBOX}&layer=city&layer=district&layer=locality&layer=county&layer=state`;
    const data = await (await fetch(url, { signal: searchAbort.signal })).json();
    searchItems = (data.features || []).map(f => ({
      name: f.properties.name,
      detail: [f.properties.county, f.properties.state].filter((v, i, a) => v && v !== f.properties.name && a.indexOf(v) === i).join(', '),
      lat: f.geometry.coordinates[1], lon: f.geometry.coordinates[0],
      extent: f.properties.extent,
    }));
  } catch (e) {
    if (e.name === 'AbortError') return;
    searchItems = [];
  }
  searchIndex = -1;
  box.innerHTML = searchItems.length
    ? searchItems.map((it, i) => `<li role="option" id="sr-${i}" data-action="pick-place" data-i="${i}" aria-selected="false">${esc(it.name)}${it.detail ? `<small>${esc(it.detail)}</small>` : ''}</li>`).join('')
    : '<li class="muted" aria-disabled="true">Sin resultados</li>';
  box.hidden = false;
  input.setAttribute('aria-expanded', 'true');
}
function pickPlace(i) {
  const it = searchItems[i];
  if (!it) return;
  if (it.extent) map.fitBounds([[it.extent[1], it.extent[0]], [it.extent[3], it.extent[2]]], { maxZoom: 13 });
  else map.setView([it.lat, it.lon], 12);
  $('searchInput').value = it.name;
  $('searchResults').hidden = true;
  $('searchInput').setAttribute('aria-expanded', 'false');
  if (state.selected) closeSite();
}
function moveSearchSelection(delta) {
  const items = [...$('searchResults').querySelectorAll('[data-action="pick-place"]')];
  if (!items.length) return;
  searchIndex = (searchIndex + delta + items.length) % items.length;
  items.forEach((li, i) => li.setAttribute('aria-selected', String(i === searchIndex)));
  $('searchInput').setAttribute('aria-activedescendant', items[searchIndex].id);
}

// ── Ubicación del usuario ──────────────────────────────────────
function locate() {
  if (!navigator.geolocation) { toast('Tu navegador no permite obtener la ubicación.'); return; }
  navigator.geolocation.getCurrentPosition(pos => {
    state.user = { la: pos.coords.latitude, lo: pos.coords.longitude };
    if (!userMarker) userMarker = L.marker([state.user.la, state.user.lo], { icon: L.divIcon({ html: '<div class="you-are-here"></div>', className: '', iconSize: [18, 18] }), interactive: false, keyboard: false }).addTo(map);
    else userMarker.setLatLng([state.user.la, state.user.lo]);
    if (state.selected) closeSite();
    map.setView([state.user.la, state.user.lo], 11);
  }, () => toast('No se pudo obtener tu ubicación. Revisa los permisos del navegador.'), { enableHighAccuracy: false, timeout: 10000 });
}

// ── Eventos ────────────────────────────────────────────────────
const ACTIONS = {
  kind:         d => { state.kinds.has(d.kind) ? state.kinds.delete(d.kind) : state.kinds.add(d.kind); applyFilters(); },
  service:      d => { state.services.has(d.service) ? state.services.delete(d.service) : state.services.add(d.service); applyFilters(); },
  open:         d => openSite(d.id),
  close:        () => closeSite(),
  locate:       () => locate(),
  'pick-place': d => pickPlace(+d.i),
  'toggle-panel': () => $('panel').classList.toggle('is-expanded'),
};
document.addEventListener('click', e => {
  const el = e.target.closest('[data-action]');
  if (el && ACTIONS[el.dataset.action]) ACTIONS[el.dataset.action](el.dataset, el, e);
  if (!e.target.closest('.search')) $('searchResults').hidden = true;
});
document.addEventListener('keydown', e => {
  if (e.key === 'Enter' && e.target.matches('.result')) openSite(e.target.dataset.id);
  if (e.key === 'Escape') {
    if (!$('searchResults').hidden) $('searchResults').hidden = true;
    else if (state.selected) closeSite();
  }
});
$('searchInput').addEventListener('input', debounce(e => searchPlaces(e.target.value), 300));
$('searchInput').addEventListener('keydown', e => {
  if (e.key === 'ArrowDown') { e.preventDefault(); moveSearchSelection(1); }
  if (e.key === 'ArrowUp') { e.preventDefault(); moveSearchSelection(-1); }
});
$('searchForm').addEventListener('submit', e => { e.preventDefault(); pickPlace(searchIndex >= 0 ? searchIndex : 0); });

// ── Arranque ───────────────────────────────────────────────────
(async function start() {
  initMap();
  try {
    const data = await (await fetch('data/sitios.json')).json();
    state.sites = data.sitios;
    state.sites.forEach(s => state.byId.set(s.id, s));
    $('dataDate').textContent = new Date(data.generado + 'T00:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch (e) {
    $('resultsList').innerHTML = '<li class="results-empty">No se pudieron cargar los datos. Recarga la página.</li>';
    return;
  }
  applyFilters();
  restoreView();
})();
