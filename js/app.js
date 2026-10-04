// Caravana — mapa de áreas y parkings para autocaravanas en España
'use strict';

// ── Iconos (trazo, 24×24) ──────────────────────────────────────
const svg = inner => `<svg viewBox="0 0 24 24" aria-hidden="true">${inner}</svg>`;
const ICON = {
  // Tipos de sitio
  area:    svg('<path d="M2 16V8a2 2 0 0 1 2-2h11l5 4.5V16z"/><path d="M15 6v4.5h5"/><circle cx="7" cy="17" r="2"/><circle cx="16" cy="17" r="2"/>'),
  parking: svg('<rect x="3" y="3" width="18" height="18" rx="4"/><path d="M9.5 17V7h3.5a3 3 0 0 1 0 6H9.5"/>'),
  camping: svg('<path d="M3 20 12 4l9 16z"/><path d="M12 20l-3-6h6z"/>'),
  vaciado: svg('<path d="M12 3s6 6.6 6 11a6 6 0 0 1-12 0c0-4.4 6-11 6-11z"/><path d="M12 11v5M9.5 13.5 12 16l2.5-2.5"/>'),
  // Servicios
  agua:    svg('<path d="M12 3s6 6.6 6 11a6 6 0 0 1-12 0c0-4.4 6-11 6-11z"/>'),
  luz:     svg('<path d="M9 2v5M15 2v5M6 7h12v4a6 6 0 0 1-12 0z"/><path d="M12 17v5"/>'),
  vaciadoS: svg('<path d="M12 3v11M7.5 9.5 12 14l4.5-4.5"/><path d="M4 18h16v3H4z"/>'),
  aseos:   svg('<path d="M7 3h10v7H7zM5 10h14a7 7 0 0 1-14 0zM9 17l-1 4M15 17l1 4"/>'),
  duchas:  svg('<path d="M4 21V7a4 4 0 0 1 8 0"/><path d="M8 7h8"/><path d="M10 11v1M14 11v1M12 14v1M16 14v1M10 17v1M14 17v1"/>'),
  wifi:    svg('<path d="M2 9a15 15 0 0 1 20 0M5.5 12.5a10 10 0 0 1 13 0M9 16a5 5 0 0 1 6 0"/><circle cx="12" cy="19.5" r="0.5"/>'),
  // Interfaz
  back:    svg('<path d="M15 18l-6-6 6-6"/>'),
  route:   svg('<path d="m3 11 19-9-9 19-2-8-8-2z"/>'),
  web:     svg('<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20 15 15 0 0 1 0-20"/>'),
  phone:   svg('<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/>'),
  edit:    svg('<path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>'),
  euro:    svg('<path d="M18 7a6 6 0 1 0 0 10M4 10h9M4 14h9"/>'),
  check:   svg('<path d="M5 12l5 5L20 7"/>'),
  info:    svg('<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>'),
  badge:   svg('<path d="M12 2l2.4 2.2 3.2-.4.8 3.1 2.8 1.6-1.2 3 1.2 3-2.8 1.6-.8 3.1-3.2-.4L12 22l-2.4-2.2-3.2.4-.8-3.1-2.8-1.6 1.2-3-1.2-3 2.8-1.6.8-3.1 3.2.4z"/><path d="M8.5 12l2.5 2.5 4.5-5"/>'),
};

// ── Configuración ──────────────────────────────────────────────
const KINDS = {
  area:    { label: 'Área de autocaravanas', short: 'Áreas',    color: 'var(--k-area)' },
  parking: { label: 'Parking autorizado',    short: 'Parkings', color: 'var(--k-parking)' },
  camping: { label: 'Camping',               short: 'Campings', color: 'var(--k-camping)' },
  vaciado: { label: 'Punto de vaciado',      short: 'Vaciado',  color: 'var(--k-vaciado)' },
};
// [clave, etiqueta, ¿cumple el filtro?, campo del dato, icono]
const SERVICES = [
  ['gratis', 'Gratis',       s => s.fee === false, 'fee',  'euro'],
  ['conf',   'Confirmado para autocaravanas', s => s.k !== 'camping' || s.ok >= 1, null, 'check'],
  ['agua',   'Agua',         s => s.w === true,    'w',    'agua'],
  ['luz',    'Electricidad', s => s.e === true,    'e',    'luz'],
  ['vaciado','Vaciado',      s => s.d === true,    'd',    'vaciadoS'],
  ['aseos',  'Aseos',        s => s.toi === true,  'toi',  'aseos'],
  ['duchas', 'Duchas',       s => s.sh === true,   'sh',   'duchas'],
  ['wifi',   'Wifi',         s => s.wifi === true, 'wifi', 'wifi'],
];
const AMENITIES = SERVICES.filter(([key]) => key !== 'gratis' && key !== 'conf');

// Estilos de la web: cada uno con sus teselas de mapa y color de la barra del navegador
const THEMES = {
  roadtrip: { color: '#E2603A', tiles: 'osm' },
  nav:      { color: '#0E1116', tiles: 'osm' },
  nature:   { color: '#2F7D5B', tiles: 'topo' },
};
const TILES = {
  osm:  { url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png', maxZoom: 19,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' },
  topo: { url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', maxZoom: 17, subdomains: 'abc',
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>, SRTM · estilo &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (CC-BY-SA)' },
};

const SPAIN = { center: [40.2, -3.6], zoom: 6 };
const LIST_LIMIT = 60;
const PHOTON = 'https://photon.komoot.io/api/';
const SPAIN_BBOX = '-18.6,27.4,4.6,44.0';  // península, Baleares y Canarias

// ── Estado ─────────────────────────────────────────────────────
const state = {
  sites: [],
  byId: new Map(),
  kinds: new Set(Object.keys(KINDS)),
  services: new Set(),
  selected: null,
  user: null,          // { la, lo } si el usuario ha compartido su ubicación
  theme: 'roadtrip',
  registros: {},       // fuente → organismo, para citar el registro oficial
};
let map, cluster, userMarker, tileLayer, tileKey;
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
const MONTHS = { Jan: 'ene', Feb: 'feb', Mar: 'mar', Apr: 'abr', May: 'may', Jun: 'jun', Jul: 'jul', Aug: 'ago', Sep: 'sep', Oct: 'oct', Nov: 'nov', Dec: 'dic' };
const DAYS = { Mo: 'L', Tu: 'M', We: 'X', Th: 'J', Fr: 'V', Sa: 'S', Su: 'D', PH: 'festivos' };
function fmtHours(oh) {
  if (!oh) return null;
  if (oh.trim() === '24/7') return '24 horas, todos los días';
  return oh.replace(/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\b/g, m => MONTHS[m])
    .replace(/\b(Mo|Tu|We|Th|Fr|Sa|Su|PH)\b/g, d => DAYS[d])
    .replace(/\boff\b/g, 'cerrado')
    .replace(/;\s*/g, ' · ');
}
function fmtStay(ms) {
  if (!ms) return null;
  if (/^(no|none|unlimited)$/i.test(ms.trim())) return 'Sin límite';
  return ms.replace(/\bdays?\b/i, 'días').replace(/\bhours?\b/i, 'horas').replace(/\bnights?\b/i, 'noches');
}
// Qué se sabe de si un camping admite autocaravanas
function campingFit(s) {
  if (s.k !== 'camping') return null;
  if (s.ok === 2) return { short: 'admite autocaravanas', long: 'Admite autocaravanas', cls: 'yes' };
  if (s.ok === 1) return { short: 'admite caravanas', long: 'Admite caravanas (casi siempre también autocaravanas; confírmalo)', cls: 'likely' };
  return { short: 'sin confirmar', long: 'Sin confirmar si admite autocaravanas: llama antes de ir', cls: 'unknown' };
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
const kindIcon = k => `<span class="kind-icon" style="--kc:${KINDS[k].color}">${ICON[k]}</span>`;
function priceTag(s) {
  if (s.fee === false) return '<span class="price free">Gratis</span>';
  if (s.fee === true) return `<span class="price paid">De pago${s.ch ? ' · ' + esc(s.ch) : ''}</span>`;
  return '';
}

// ── Estilo de la web ───────────────────────────────────────────
function initialTheme() {
  const fromUrl = new URLSearchParams(location.search).get('tema');
  if (THEMES[fromUrl]) return fromUrl;
  try { const saved = localStorage.getItem('caravana-tema'); if (THEMES[saved]) return saved; } catch (e) {}
  return 'roadtrip';
}
function setTheme(theme) {
  state.theme = theme;
  document.body.dataset.theme = theme;
  document.querySelectorAll('[data-action="theme"]').forEach(b => b.setAttribute('aria-checked', String(b.dataset.theme === theme)));
  document.querySelector('meta[name="theme-color"]').content = THEMES[theme].color;
  try { localStorage.setItem('caravana-tema', theme); } catch (e) {}
  if (map) {
    setTiles(THEMES[theme].tiles);
    setTimeout(() => map.invalidateSize(), 50);   // el estilo «navegación» cambia el tamaño del mapa
  }
}
function setTiles(key) {
  if (key === tileKey) return;
  if (tileLayer) map.removeLayer(tileLayer);
  const t = TILES[key];
  tileLayer = L.tileLayer(t.url, { maxZoom: t.maxZoom, subdomains: t.subdomains || 'abc', attribution: t.attribution }).addTo(map);
  map.setMaxZoom(t.maxZoom);
  tileKey = key;
}

// ── Mapa ───────────────────────────────────────────────────────
function initMap() {
  map = L.map('map', { zoomControl: true }).setView(SPAIN.center, SPAIN.zoom);
  setTiles(THEMES[state.theme].tiles);
  cluster = L.markerClusterGroup({
    maxClusterRadius: 50,
    showCoverageOnHover: false,
    iconCreateFunction: c => {
      const n = c.getChildCount();
      const size = n < 10 ? 36 : n < 100 ? 42 : 50;
      return L.divIcon({ html: `<div class="cluster" style="width:${size}px;height:${size}px">${n}</div>`, className: '', iconSize: [size, size] });
    },
  });
  map.addLayer(cluster);
  map.on('moveend', debounce(() => { renderList(); saveView(); }, 150));
}

function markerFor(site) {
  if (markers.has(site.id)) return markers.get(site.id);
  const m = L.marker([site.la, site.lo], {
    icon: L.divIcon({ html: `<div class="pin" style="--kc:${KINDS[site.k].color}">${ICON[site.k]}</div>`, className: '', iconSize: [34, 41], iconAnchor: [17, 41] }),
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
    <button type="button" class="chip chip-kind" data-action="kind" data-kind="${k}" aria-pressed="${state.kinds.has(k)}">
      ${kindIcon(k)}${v.short} <span class="n">${(counts[k] || 0).toLocaleString('es-ES')}</span>
    </button>`).join('');
  $('serviceFilters').innerHTML = SERVICES.map(([key, label, , , icon]) => `
    <button type="button" class="chip" data-action="service" data-service="${key}" aria-pressed="${state.services.has(key)}">${ICON[icon]}${label}</button>`).join('');
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

function serviceIcons(s) {
  return AMENITIES.filter(([, , test]) => test(s))
    .map(([, label, , , icon]) => `<span class="svc on" title="${label}">${ICON[icon]}</span>`).join('');
}

function renderList() {
  const bounds = map.getBounds();
  const filtered = state.sites.filter(matches);
  const visible = filtered.filter(s => bounds.contains([s.la, s.lo]));
  const ref = referencePoint();
  visible.forEach(s => { s._d = km(ref, s); });
  visible.sort((a, b) => a._d - b._d);

  $('resultsTitle').textContent = state.user ? 'Más cerca de ti' : 'En esta zona del mapa';
  $('resultsCount').textContent = `${visible.length.toLocaleString('es-ES')} de ${filtered.length.toLocaleString('es-ES')}`;
  const list = $('resultsList');
  if (!visible.length) {
    list.innerHTML = `<li class="results-empty">No hay sitios con estos filtros en esta zona. Aleja el mapa o quita algún filtro.</li>`;
    return;
  }
  list.innerHTML = visible.slice(0, LIST_LIMIT).map(s => `
    <li class="result${state.selected === s.id ? ' is-active' : ''}" data-action="open" data-id="${s.id}" tabindex="0">
      ${kindIcon(s.k)}
      <strong>${esc(siteName(s))}</strong>
      <span class="dist">${fmtKm(s._d)}</span>
      <span class="kind-label">${esc(KINDS[s.k].label)}${campingFit(s) ? ' · ' + campingFit(s).short : ''}${s.c && s.n ? ' · ' + esc(s.c) : ''}</span>
      <span class="svc-row">${serviceIcons(s)}${priceTag(s)}</span>
    </li>`).join('') + (visible.length > LIST_LIMIT
    ? `<li class="results-empty">Y ${(visible.length - LIST_LIMIT).toLocaleString('es-ES')} más: acerca el mapa para verlos.</li>` : '');
}

// ── Ficha ──────────────────────────────────────────────────────
function serviceItem(label, value, icon) {
  const cls = value === true ? 'yes' : value === false ? 'no' : 'unknown';
  return `<li class="${cls}">${ICON[icon]}${label}${value == null ? '<small>sin dato</small>' : ''}</li>`;
}

function renderDetail(s) {
  const k = KINDS[s.k];
  const facts = [
    ['Horario', fmtHours(s.oh)], ['Estancia máxima', fmtStay(s.ms)], ['Plazas', s.cap],
    ['Coordenadas', `${s.la.toFixed(5)}, ${s.lo.toFixed(5)}`, 'num'],
  ].filter(([, v]) => v).map(([t, v, cls]) => `<dt>${t}</dt><dd${cls ? ` class="${cls}"` : ''}>${esc(v)}</dd>`).join('');
  const osmType = { n: 'node', w: 'way', r: 'relation' }[s.id[0]];   // undefined en sitios que solo están en un registro
  const fit = campingFit(s);
  const official = s.rg ? `<p class="official">${ICON.badge}<span>Inscrito en el registro oficial de campings${state.registros[s.rg] ? ' · ' + esc(state.registros[s.rg]) : ''}${s.cat ? ` · <strong>${esc(s.cat)}</strong>` : ''}</span></p>` : '';
  const webUrl = s.web && /^https?:\/\//i.test(s.web) ? s.web : s.web ? 'https://' + s.web : null;
  const where = [s.c && esc(s.c), state.user && `a ${fmtKm(km(state.user, s))} de ti`].filter(Boolean).join(' · ');

  $('detail').innerHTML = `
    <button type="button" class="detail-back" data-action="close">${ICON.back} Volver a la lista</button>
    <div class="detail-head">
      ${kindIcon(s.k)}
      <span class="kind">${k.label}</span>
      <h2>${esc(siteName(s))}</h2>
    </div>
    <p class="where">${where ? `<span>${where}</span>` : ''}${priceTag(s) || '<span class="price unknown">Precio sin datos</span>'}</p>
    ${fit ? `<p class="fit fit-${fit.cls}">${fit.cls === 'yes' ? ICON.check : ICON.info}<span>${fit.long}</span></p>` : ''}
    ${official}
    <ul class="services">${AMENITIES.map(([, label, , field, icon]) => serviceItem(label, s[field], icon)).join('')}</ul>
    ${facts ? `<dl class="facts">${facts}</dl>` : ''}
    ${s.ds ? `<p class="desc">${esc(s.ds)}</p>` : ''}
    <div class="actions">
      <a class="btn btn-primary" href="https://www.google.com/maps/dir/?api=1&destination=${s.la},${s.lo}" target="_blank" rel="noopener">${ICON.route}Cómo llegar</a>
      ${webUrl ? `<a class="btn btn-line" href="${esc(webUrl)}" target="_blank" rel="noopener">${ICON.web}Web</a>` : ''}
      ${s.tel ? `<a class="btn btn-line" href="tel:${esc(s.tel.replace(/\s+/g, ''))}">${ICON.phone}${esc(s.tel)}</a>` : ''}
    </div>
    <p class="source">${osmType
      ? `¿Falta algo o hay un error? <a href="https://www.openstreetmap.org/${osmType}/${s.id.slice(1)}" target="_blank" rel="noopener">Corrígelo en OpenStreetMap</a> y aparecerá aquí en la siguiente actualización.`
      : `Este sitio aún no está en OpenStreetMap: sale del registro oficial. Si lo conoces, <a href="https://www.openstreetmap.org/edit#map=17/${s.la}/${s.lo}" target="_blank" rel="noopener">añádelo a OpenStreetMap</a>.`}</p>`;
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
  history.replaceState(null, '', location.pathname + location.search + '#s=' + id);
  // Con teclado, el foco pasa a la ficha; con ratón o dedo no se muestra el recuadro de foco
  if (lastInputWasKeyboard) $('detail').querySelector('.detail-back').focus({ preventScroll: true });
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
  history.replaceState(null, '', `${location.pathname}${location.search}#@${c.lat.toFixed(4)},${c.lng.toFixed(4)},${map.getZoom()}`);
}
function restoreView() {
  const h = decodeURIComponent(location.hash.slice(1));
  const site = h.match(/^s=([nwr]\d+|x[\w-]+)$/);
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
let lastInputWasKeyboard = false;
document.addEventListener('keydown', () => { lastInputWasKeyboard = true; }, true);
document.addEventListener('pointerdown', () => { lastInputWasKeyboard = false; }, true);
const ACTIONS = {
  kind:           d => { state.kinds.has(d.kind) ? state.kinds.delete(d.kind) : state.kinds.add(d.kind); applyFilters(); },
  service:        d => { state.services.has(d.service) ? state.services.delete(d.service) : state.services.add(d.service); applyFilters(); },
  open:           d => openSite(d.id),
  close:          () => closeSite(),
  locate:         () => locate(),
  theme:          d => setTheme(d.theme),
  'pick-place':   d => pickPlace(+d.i),
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
// Enlaces a otro sitio dentro de la web (cambio de #)
window.addEventListener('hashchange', () => restoreView());
$('searchInput').addEventListener('input', debounce(e => searchPlaces(e.target.value), 300));
$('searchInput').addEventListener('keydown', e => {
  if (e.key === 'ArrowDown') { e.preventDefault(); moveSearchSelection(1); }
  if (e.key === 'ArrowUp') { e.preventDefault(); moveSearchSelection(-1); }
});
$('searchForm').addEventListener('submit', e => { e.preventDefault(); pickPlace(searchIndex >= 0 ? searchIndex : 0); });

// ── Arranque ───────────────────────────────────────────────────
(async function start() {
  setTheme(initialTheme());
  initMap();
  try {
    const data = await (await fetch('data/sitios.json')).json();
    state.sites = data.sitios;
    state.sites.forEach(s => state.byId.set(s.id, s));
    state.registros = data.registros || {};
    $('statTotal').textContent = state.sites.length.toLocaleString('es-ES');
    $('dataDate').textContent = new Date(data.generado + 'T00:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch (e) {
    $('resultsList').innerHTML = '<li class="results-empty">No se pudieron cargar los datos. Recarga la página.</li>';
    return;
  }
  applyFilters();
  restoreView();
})();
