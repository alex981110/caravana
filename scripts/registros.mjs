// Registros oficiales de campings (y áreas de autocaravanas) de las comunidades autónomas.
// Se cruzan con OpenStreetMap: si el sitio ya está en OSM se completa con los datos del
// registro (plazas, categoría, teléfono, web) y queda marcado como autorizado; si no está y el
// registro trae coordenadas, se añade como sitio nuevo.
//
// Reutilización de información del sector público (Ley 37/2007, RD 1495/2011): se permite
// citando la fuente. Cada registro guarda su fuente y la web la muestra en la ficha.

import { readFile, writeFile } from 'node:fs/promises';

const UA = { 'User-Agent': 'caravana-data-build/1.0 (https://github.com/alex981110/caravana)' };
const CACHE_FILE = new URL('../data/registros.json', import.meta.url);      // últimos datos buenos de cada fuente
const GEO_FILE = new URL('../data/municipios.json', import.meta.url);       // coordenadas de municipios (Nominatim)

export const SOURCES = {
  cyl:  { nombre: 'Junta de Castilla y León',                 url: 'https://datosabiertos.jcyl.es/web/jcyl/risp/es/turismo/campings/1284211835498.csv' },
  eus:  { nombre: 'Gobierno Vasco · Open Data Euskadi',        url: 'https://opendata.euskadi.eus/contenidos/ds_recursos_turisticos/campings_de_euskadi/opendata/alojamientos.geojson' },
  cas:  { nombre: 'Diputación de Castellón',                  url: 'https://dipcas.opendatasoft.com/api/v2/catalog/datasets/campings/exports/geojson' },
  vigo: { nombre: 'Concello de Vigo',                         url: 'https://datos.vigo.org/data/turismo/poi-campings-es.geojson' },
  mur:  { nombre: 'Región de Murcia',                          url: 'https://nexo.carm.es/nexo/archivos/recursos/opendata/json/Campings.json' },
  val:  { nombre: 'Generalitat Valenciana',                   url: 'https://dadesobertes.gva.es/dataset/aef08ab5-c480-46aa-a99b-8d4ab7a1e49e/resource/287db5a6-2f1c-4f36-9791-8fc0679f0ffc/download/lista-de-campings.json' },
  ara:  { nombre: 'Gobierno de Aragón',                       url: 'https://opendata.aragon.es/GA_OD_Core/download?resource_id=68&formato=json' },
  clm:  { nombre: 'Junta de Comunidades de Castilla-La Mancha', url: 'https://datosabiertos.castillalamancha.es/sites/datosabiertos.castillalamancha.es/files/Camping%20y%20%C3%81reas%20de%20autocaravanas.csv' },
  ext:  { nombre: 'Junta de Extremadura',                     url: 'https://www.juntaex.es/documents/77055/5801338/Campamentos.csv' },
};

// ── Lectura de formatos ────────────────────────────────────────
async function fetchText(url, encoding = 'utf-8') {
  const res = await fetch(url, { headers: UA, signal: AbortSignal.timeout(90000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return new TextDecoder(encoding).decode(await res.arrayBuffer()).replace(/^﻿/, '');
}
const fetchJson = async url => JSON.parse(await fetchText(url));
const arrayOf = j => Array.isArray(j) ? j : Object.values(j).find(Array.isArray) || [];

function parseCsv(text, sep) {
  const rows = [];
  let row = [], field = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') q = false;
      else field += c;
    } else if (c === '"') q = true;
    else if (c === sep) { row.push(field); field = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(field); field = '';
      if (row.some(x => x.trim())) rows.push(row);
      row = [];
    } else field += c;
  }
  if (field || row.length) { row.push(field); if (row.some(x => x.trim())) rows.push(row); }
  const head = rows.shift().map(h => h.trim());
  return rows.map(r => Object.fromEntries(head.map((h, i) => [h, (r[i] ?? '').trim()])));
}

// UTM (ETRS89) a latitud/longitud
function utmToLatLon(easting, northing, zone) {
  const a = 6378137, f = 1 / 298.257222101, k0 = 0.9996;
  const e2 = f * (2 - f), ep2 = e2 / (1 - e2);
  const x = easting - 500000, y = northing;
  const m = y / k0, mu = m / (a * (1 - e2 / 4 - 3 * e2 ** 2 / 64 - 5 * e2 ** 3 / 256));
  const e1 = (1 - Math.sqrt(1 - e2)) / (1 + Math.sqrt(1 - e2));
  const p = mu + (3 * e1 / 2 - 27 * e1 ** 3 / 32) * Math.sin(2 * mu) + (21 * e1 ** 2 / 16 - 55 * e1 ** 4 / 32) * Math.sin(4 * mu)
    + (151 * e1 ** 3 / 96) * Math.sin(6 * mu) + (1097 * e1 ** 4 / 512) * Math.sin(8 * mu);
  const n = a / Math.sqrt(1 - e2 * Math.sin(p) ** 2), t = Math.tan(p) ** 2, c = ep2 * Math.cos(p) ** 2;
  const r = a * (1 - e2) / (1 - e2 * Math.sin(p) ** 2) ** 1.5, d = x / (n * k0);
  const lat = p - (n * Math.tan(p) / r) * (d ** 2 / 2 - (5 + 3 * t + 10 * c - 4 * c ** 2 - 9 * ep2) * d ** 4 / 24
    + (61 + 90 * t + 298 * c + 45 * t ** 2 - 252 * ep2 - 3 * c ** 2) * d ** 6 / 720);
  const lon = (d - (1 + 2 * t + c) * d ** 3 / 6 + (5 - 2 * c + 28 * t - 3 * c ** 2 + 8 * ep2 + 24 * t ** 2) * d ** 5 / 120) / Math.cos(p);
  return [lat * 180 / Math.PI, (zone * 6 - 183) + lon * 180 / Math.PI];
}

// ── Normalización de cada fuente ───────────────────────────────
// Registro común: { ref, n, mun, prov, tel, web, email, pl, cat, la, lo, k }
const num = v => { const x = parseFloat(String(v ?? '').replace(',', '.')); return Number.isFinite(x) ? x : null; };
const clean = v => { const s = String(v ?? '').trim(); return s && s !== '-' && s.toUpperCase() !== 'SÍ' ? s : null; };
const ARA_PROV = { '22': 'Huesca', '44': 'Teruel', '50': 'Zaragoza' };
const EUS_CAT = { P: 'Primera', S: 'Segunda', T: 'Tercera' };

const PARSERS = {
  async cyl(url) {
    return parseCsv(await fetchText(url, 'latin1'), ';').map(r => ({
      ref: r['N.Registro'], n: r['Nombre'], mun: r['Municipio'], prov: r['Provincia'],
      tel: clean(r['Teléfono 1']), web: clean(r['web']), email: clean(r['Email']),
      pl: num(r['Plazas']), cat: clean(r['Categoría']), la: num(r['GPS.Latitud']), lo: num(r['GPS.Longitud']),
    }));
  },
  async eus(url) {
    return (await fetchJson(url)).features.map(f => ({
      ref: f.properties.signatura, n: f.properties.documentname, mun: f.properties.municipality, prov: f.properties.territory,
      web: clean(f.properties.web), email: clean(f.properties.tourismemail), pl: num(f.properties.capacity),
      cat: EUS_CAT[f.properties.category] ? EUS_CAT[f.properties.category] + ' categoría' : null,
      la: f.geometry?.coordinates?.[1], lo: f.geometry?.coordinates?.[0],
    }));
  },
  async cas(url) {
    return (await fetchJson(url)).features.map((f, i) => ({
      ref: f.properties.codmun + '-' + i, n: f.properties.nombre, mun: f.properties.localidad, prov: 'Castellón',
      tel: clean(f.properties.telefono), email: clean(f.properties.email), pl: num(f.properties.no_de_plazas),
      cat: clean(f.properties.cat), la: f.geometry?.coordinates?.[1], lo: f.geometry?.coordinates?.[0],
    }));
  },
  async vigo(url) {
    return (await fetchJson(url)).features.map(f => ({
      ref: String(f.properties.idpoi), n: f.properties.title, mun: 'Vigo', prov: 'Pontevedra',
      tel: clean(f.properties.phone), web: clean(f.properties.web), cat: clean(f.properties.subcategoria),
      la: f.geometry?.coordinates?.[1], lo: f.geometry?.coordinates?.[0],
    }));
  },
  async mur(url) {
    return arrayOf(await fetchJson(url)).map(r => {
      const [la, lo] = num(r['Latitud']) && num(r['Longitud']) ? utmToLatLon(num(r['Longitud']), num(r['Latitud']), 30) : [null, null];
      return { ref: r['Código'], n: r['Nombre'], mun: r['Municipio'], prov: 'Murcia', tel: clean(r['Teléfono']),
               web: clean(r['URL Real']) || clean(r['URL Corta']), email: clean(r['Email']), la, lo };
    });
  },
  async val(url) {
    return arrayOf(await fetchJson(url)).filter(r => r.estado === 'ACTIVO').map(r => ({
      ref: r.signatura, n: r.nombre, mun: r.municipio, prov: (r.provincia || '').split('/')[0],
      tel: clean(r.telefono), web: clean(r.web), email: clean(r.email), pl: num(r.plazas), cat: clean(r.categoria),
    }));
  },
  async ara(url) {
    return arrayOf(await fetchJson(url)).filter(r => r.estado === 'A').map(r => ({
      ref: r.signatura, n: r.nombre_establecimiento, mun: r.localidad_establecimiento, prov: ARA_PROV[r.provincia_establecimiento] || '',
      tel: clean(r.telefono_establecimiento), web: clean(r.direccion_web), email: clean(r.e_mail),
      pl: num(r.numero_de_plazas_parcelas), cat: clean(r.categoria_camping),
    }));
  },
  async clm(url) {
    return parseCsv(await fetchText(url, 'latin1'), ';').map(r => ({
      ref: r['Campaña'], n: r['Nombre Establecimiento'], mun: r['Municipio'], prov: r['Provincia'],
      tel: clean(r['Teléfono Establecimiento']), email: clean(r['email Establecimiento']), pl: num(r['Total Plazas']),
      cat: clean(r['Categoría']), k: /autocaravanas/i.test(r['Modalidad']) ? 'area' : 'camping',
    }));
  },
  async ext(url) {
    return parseCsv(await fetchText(url, 'latin1'), ',').map((r, i) => ({
      ref: String(i), n: r['Nombre establecimiento'], mun: r['Municipio'], prov: r['Provincia'],
      pl: num(r['Total Nº Plazas']), cat: clean(r['Categoría']),
    }));
  },
};

// ── Utilidades de cruce ────────────────────────────────────────
function meters(a, b) {
  const R = 6371000, r = x => x * Math.PI / 180;
  const h = Math.sin(r(b.la - a.la) / 2) ** 2 + Math.cos(r(a.la)) * Math.cos(r(b.la)) * Math.sin(r(b.lo - a.lo) / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
const STOP = new Set(['camping', 'campings', 'campamento', 'turismo', 'area', 'autocaravanas', 'caravaning', 'municipal',
  'de', 'del', 'la', 'las', 'el', 'los', 'y', 'en', 'a', 'al', 'l', 'd', 's', 'resort', 'park', 'parque', 'club']);
const tokens = s => new Set(String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  .split(/[^a-z0-9]+/).filter(w => w.length > 1 && !STOP.has(w)));
function nameSim(a, b) {
  const A = tokens(a), B = tokens(b);
  if (!A.size || !B.size) return 0;
  let common = 0;
  A.forEach(w => { if (B.has(w)) common++; });
  return common / Math.min(A.size, B.size);
}
// «Alberca (La)» → «La Alberca»; «OSSA DE MONTIEL» → «Ossa De Montiel»
function prettyPlace(s) {
  let x = String(s || '').trim();
  const m = x.match(/^(.*)\s*\((el|la|los|las|l'|o|a|os|as)\)$/i);
  if (m) x = `${m[2]} ${m[1]}`.replace(/' /, "'");
  return x.toLowerCase().replace(/(^|[\s(-])\p{L}/gu, c => c.toUpperCase());
}

async function geocodeMunicipality(mun, prov, cache) {
  const key = `${mun}|${prov}`;
  if (key in cache) return cache[key];
  const q = `${prettyPlace(mun)}, ${prov}, España`;
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=es&q=${encodeURIComponent(q)}`, { headers: UA });
    const hit = (await res.json())[0];
    cache[key] = hit ? [+(+hit.lat).toFixed(4), +(+hit.lon).toFixed(4)] : null;
  } catch { return null; }
  await new Promise(r => setTimeout(r, 1100));   // política de uso de Nominatim: 1 petición/s
  return cache[key];
}

// ── Proceso principal ──────────────────────────────────────────
// sites: sitios de OSM ya normalizados (se modifican); excluded: campings de OSM no aptos [{la, lo}]
export async function applyRegistries(sites, excluded) {
  let cache = {}, geo = {};
  try { cache = JSON.parse(await readFile(CACHE_FILE, 'utf8')); } catch {}
  try { geo = JSON.parse(await readFile(GEO_FILE, 'utf8')); } catch {}

  const stats = {};
  const added = [];
  for (const [src, cfg] of Object.entries(SOURCES)) {
    let records;
    try {
      records = (await PARSERS[src](cfg.url)).filter(r => r.n);
      cache[src] = records;
    } catch (e) {
      records = cache[src] || [];
      console.warn(`Registro ${src}: fallo al descargar (${e.message}); se usan los ${records.length} registros guardados`);
    }
    const st = stats[src] = { total: records.length, cruzados: 0, nuevos: 0, sinUbicar: 0 };
    records = records.filter(r => !/cierre|cerrad/i.test(r.n));
    // Coordenadas repetidas en la misma fuente = centro del municipio, no la ubicación real
    const seen = {};
    records.forEach(r => { const k = `${r.la},${r.lo}`; seen[k] = (seen[k] || 0) + 1; });
    records.forEach(r => { if (seen[`${r.la},${r.lo}`] > 1) { r.la = r.lo = null; } });

    for (const r of records) {
      const kind = r.k || 'camping';
      const hasCoords = Number.isFinite(r.la) && Number.isFinite(r.lo) && r.la > 27 && r.la < 44.5 && r.lo > -19 && r.lo < 5;
      const center = hasCoords ? { la: r.la, lo: r.lo } : await geocodeMunicipality(r.mun, r.prov, geo).then(c => c && { la: c[0], lo: c[1] });
      if (!center) { st.sinUbicar++; continue; }

      // Candidatos de OSM del mismo tipo (las áreas también pueden estar como camping y viceversa)
      // Con coordenadas: el mismo nombre hasta 10 km (algunas coordenadas oficiales están desplazadas)
      // o cualquier camping a menos de 250 m; sin coordenadas: el mismo nombre en el municipio (12 km)
      const radius = hasCoords ? 10000 : 12000;
      const near = sites.filter(s => (s.k === 'camping' || s.k === 'area') && Math.abs(s.la - center.la) < 0.15 && Math.abs(s.lo - center.lo) < 0.2)
        .map(s => ({ s, d: meters(center, s), sim: nameSim(r.n, s.n) }))
        .filter(x => x.d <= radius && (x.sim >= 0.5 || (hasCoords && x.d <= 250)))
        .sort((a, b) => (b.sim - a.sim) || (a.d - b.d));
      const match = near[0]?.s;

      if (match) {
        if (match.rg) continue;   // ya cruzado con otro registro
        match.rg = src;
        if (r.pl && !match.cap) match.cap = String(r.pl);
        if (r.cat) match.cat = prettyCat(r.cat);
        if (r.tel && !match.tel) match.tel = r.tel;
        if (r.web && !match.web) match.web = r.web;
        if (!match.n) match.n = prettyName(r.n);
        if (!match.c && r.mun) match.c = prettyPlace(r.mun);
        st.cruzados++;
      } else if (hasCoords) {
        if (excluded.some(x => meters(x, center) < 300)) continue;   // OSM dice que no es apto
        const site = {
          id: `x${src}-${String(r.ref).replace(/[^\w-]+/g, '')}`,
          k: kind, n: prettyName(r.n), la: +r.la.toFixed(5), lo: +r.lo.toFixed(5),
          c: r.mun ? prettyPlace(r.mun) : undefined, cap: r.pl ? String(r.pl) : undefined,
          tel: r.tel || undefined, web: r.web || undefined, rg: src, cat: r.cat ? prettyCat(r.cat) : undefined,
        };
        for (const k of Object.keys(site)) if (site[k] == null) delete site[k];
        added.push(site);
        st.nuevos++;
      } else {
        st.sinUbicar++;   // sin coordenadas y sin equivalente en OSM: no se pinta en un sitio inventado
      }
    }
  }

  await writeFile(CACHE_FILE, JSON.stringify(cache));
  await writeFile(GEO_FILE, JSON.stringify(Object.fromEntries(Object.entries(geo).sort())));
  return { added, stats };
}

function prettyName(n) {
  const s = String(n).trim();
  return s === s.toUpperCase() ? prettyPlace(s.replace(/,\s*(LA|EL|LOS|LAS)$/i, '')) : s;
}
function prettyCat(c) {
  const s = String(c).trim();
  // «3e», «2a» → «3ª categoría»; «Camping de 2ª Categoria» → «2ª categoría»
  const ord = s.match(/^(?:camping de )?(\d)\s*[eaª](?:\s*categor[ií]a)?$/i);
  if (ord) return `${ord[1]}ª categoría`;
  const lower = s === s.toUpperCase() ? s.charAt(0) + s.slice(1).toLowerCase() : s;
  return lower.replace(/Categor[ií]a$/, 'categoría');
}
