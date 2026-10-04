// Descarga de OpenStreetMap (Overpass) los sitios para autocaravanas de España y genera
// data/sitios.json con un formato compacto para la web.
//
// Uso: node scripts/build-data.mjs
// Datos © colaboradores de OpenStreetMap, licencia ODbL: https://www.openstreetmap.org/copyright

import { readFile, writeFile } from 'node:fs/promises';
import { applyRegistries, SOURCES } from './registros.mjs';

const ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
];

const QUERY = `
[out:json][timeout:180];
area["ISO3166-1"="ES"][admin_level=2]->.es;
(
  nwr["tourism"="caravan_site"](area.es);
  nwr["amenity"="sanitary_dump_station"](area.es);
  nwr["amenity"="parking"]["motorhome"~"^(yes|designated)$"](area.es);
  nwr["tourism"="camp_site"](area.es);
);
out center tags;
`;

// Un punto de vaciado a menos de esta distancia de un área se fusiona con ella
const MERGE_DUMP_METERS = 150;

async function fetchOverpass() {
  let lastError;
  for (const url of ENDPOINTS) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': 'caravana-data-build/1.0' },
        body: 'data=' + encodeURIComponent(QUERY),
      });
      if (!res.ok) throw new Error(`${url} respondió ${res.status}`);
      return await res.json();
    } catch (e) {
      lastError = e;
      console.warn('Fallo en', url, '-', e.message);
    }
  }
  throw lastError;
}

const yes = v => v != null && !['no', 'none', 'false', '0'].includes(String(v).toLowerCase());
const truthy = v => v != null && ['yes', 'designated', 'customers', 'true', '1'].includes(String(v).toLowerCase());

function kindOf(t) {
  if (t.tourism === 'caravan_site') return 'area';
  if (t.amenity === 'sanitary_dump_station') return 'vaciado';
  if (t.amenity === 'parking') return 'parking';
  return 'camping';
}

// Campings: se excluyen los que no admiten vehículos (sin caravanas ni autocaravanas,
// acampada libre o solo tiendas); del resto se guarda si está confirmado
const OK_VALUES = ['yes', 'designated'];
function campingExcluded(t) {
  if (t.tourism !== 'camp_site') return false;
  const mh = (t.motorhome || '').toLowerCase(), cv = (t.caravans || '').toLowerCase();
  if (mh === 'no') return true;
  if (cv === 'no' && !OK_VALUES.includes(mh)) return true;
  if (t.backcountry === 'yes' || t.camp_site === 'basic' || t.camp_site === 'backcountry') return true;
  if (t.group_only === 'yes' || t.scout === 'yes') return true;
  return false;
}
// 2 = admite autocaravanas, 1 = admite caravanas (casi seguro también autocaravanas), sin campo = sin dato
function campingFit(t) {
  if (OK_VALUES.includes((t.motorhome || '').toLowerCase())) return 2;
  if (OK_VALUES.includes((t.caravans || '').toLowerCase())) return 1;
  return undefined;
}

const excludedCampings = [];   // posiciones de campings no aptos: los registros no los vuelven a añadir

function normalize(el) {
  const t = el.tags || {};
  if (campingExcluded(t)) {
    const la = el.lat ?? el.center?.lat, lo = el.lon ?? el.center?.lon;
    if (la != null) excludedCampings.push({ la, lo });
    return null;
  }
  const lat = el.lat ?? el.center?.lat;
  const lon = el.lon ?? el.center?.lon;
  if (lat == null || lon == null) return null;
  const kind = kindOf(t);
  const fee = t.fee == null ? null : !['no', 'free'].includes(t.fee.toLowerCase());
  const city = t['addr:city'] || t['addr:town'] || t['addr:village'] || null;
  const site = {
    id: el.type[0] + el.id,
    k: kind,
    n: t.name || t['name:es'] || null,
    la: +lat.toFixed(5),
    lo: +lon.toFixed(5),
    // Servicios (true / false / ausente = sin dato)
    fee,
    w: truthy(t.water_point) || truthy(t.drinking_water) || undefined,
    e: t.power_supply ? yes(t.power_supply) : undefined,
    d: kind === 'vaciado' || (t.sanitary_dump_station ? yes(t.sanitary_dump_station) : undefined),
    toi: t.toilets ? yes(t.toilets) : undefined,
    sh: t.shower ? yes(t.shower) : undefined,
    wifi: t.internet_access ? ['wlan', 'wifi', 'yes'].includes(t.internet_access.toLowerCase()) : undefined,
    cap: t['capacity:motorhome'] || t['capacity:caravans'] || t.capacity || undefined,
    oh: t.opening_hours || undefined,
    ms: t.maxstay || undefined,
    ch: t.charge || undefined,
    web: t.website || t['contact:website'] || t.url || undefined,
    tel: t.phone || t['contact:phone'] || undefined,
    c: city || undefined,
    ds: t['description:es'] || t.description || undefined,
    ok: kind === 'camping' ? campingFit(t) : undefined,
  };
  for (const k of Object.keys(site)) if (site[k] == null) delete site[k];
  return site;
}

function meters(a, b) {
  const R = 6371000, toRad = x => x * Math.PI / 180;
  const dLat = toRad(b.la - a.la), dLon = toRad(b.lo - a.lo);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.la)) * Math.cos(toRad(b.la)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

// Fusiona los puntos de vaciado que están dentro (o al lado) de un área, parking o camping
function mergeDumpStations(sites) {
  const places = sites.filter(s => s.k !== 'vaciado');
  const dumps = sites.filter(s => s.k === 'vaciado');
  const kept = [];
  let merged = 0;
  for (const d of dumps) {
    const host = places.find(p => Math.abs(p.la - d.la) < 0.002 && Math.abs(p.lo - d.lo) < 0.003 && meters(p, d) <= MERGE_DUMP_METERS);
    if (host) {
      host.d = true;
      if (d.w && host.w === undefined) host.w = true;
      merged++;
    } else {
      kept.push(d);
    }
  }
  return { sites: [...places, ...kept], merged };
}

const raw = await fetchOverpass();
const normalized = raw.elements.map(normalize).filter(Boolean);
const { added, stats } = await applyRegistries(normalized, excludedCampings);
const { sites, merged } = mergeDumpStations([...normalized, ...added]);
sites.sort((a, b) => a.id.localeCompare(b.id));   // orden estable: diffs pequeños entre actualizaciones

// Si los sitios no han cambiado se conserva la fecha anterior: así la tarea semanal no
// genera un commit cuando OpenStreetMap no tiene novedades
const OUT_FILE = new URL('../data/sitios.json', import.meta.url);
let previous = null;
try { previous = JSON.parse(await readFile(OUT_FILE, 'utf8')); } catch { /* primera vez */ }
const unchanged = previous && JSON.stringify(previous.sitios) === JSON.stringify(sites);

const out = {
  generado: unchanged ? previous.generado : new Date().toISOString().slice(0, 10),
  fuente: 'OpenStreetMap (ODbL) · https://www.openstreetmap.org/copyright',
  registros: Object.fromEntries(Object.entries(SOURCES).map(([k, v]) => [k, v.nombre])),
  sitios: sites,
};
await writeFile(OUT_FILE, JSON.stringify(out));

const byKind = sites.reduce((acc, s) => ((acc[s.k] = (acc[s.k] || 0) + 1), acc), {});
console.table(stats);
console.log(`${sites.length} sitios (${merged} puntos de vaciado fusionados con su área):`, byKind);

// Salida explícita: en Windows, Node a veces aborta al cerrar conexiones de red pendientes
process.exit(0);
