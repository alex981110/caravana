# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Autocaravanistas y furgoneteros que viajan por España (península, Baleares y Canarias). Dos situaciones con el mismo peso:

- **En ruta**, con el móvil: buscan dónde dormir, cargar agua o vaciar hoy, a veces con mala cobertura y poca paciencia.
- **Planificando en casa**, en ordenador: preparan la ruta, comparan sitios y servicios con calma.

## Product Purpose

Mapa de áreas de autocaravanas, campings aptos, parkings autorizados y puntos de vaciado de toda España, con servicios, horario, estancia máxima, plazas, precio, contacto y «Cómo llegar». Éxito: encontrar en segundos un sitio fiable donde parar, sin registrarse.

## Positioning

Gratis, sin registro y sin anuncios, con datos abiertos de OpenStreetMap contrastados con registros oficiales autonómicos de campings. Frente a Park4Night y similares no compite en reseñas ni fotos: compite en acceso libre y en procedencia verificable del dato.

## Operating Context

- Uso en móvil en carretera y en escritorio en casa; ambos son de primera clase.
- Los datos se regeneran solos cada lunes (GitHub Actions) desde Overpass y nueve registros autonómicos; la fecha de actualización se muestra.
- Las correcciones se hacen en OpenStreetMap; cada ficha enlaza al sitio en OSM.

## Capabilities and Constraints

- Web estática en GitHub Pages: HTML, CSS y JS vanilla, sin build ni dependencias; Leaflet 1.9 + MarkerCluster desde CDN.
- Funciones a conservar: mapa con agrupación y color por tipo; buscador de localidades (Photon); «Cerca de mí»; filtros por tipo (área, camping, parking, vaciado) y servicio (gratis, agua, electricidad, vaciado, aseos, duchas, wifi, confirmado para autocaravanas); lista de resultados; ficha de cada sitio; enlaces compartibles con estado en la URL.
- `data/sitios.json` (~3.440 sitios, ~518 KB) se carga entero.
- Teselas de OpenStreetMap / OpenTopoMap con atribución obligatoria (ODbL, CC-BY-SA).
- Un único estilo visual (decidido 2026-10-13: se retiran los tres estilos y el selector).

## Brand Commitments

- Nombre: **Caravana**. Idioma: español.
- Atribución visible a OpenStreetMap y a los registros oficiales.

## Evidence on Hand

- Datos reales: `data/sitios.json`, `data/registros.json`. Recuento actual: 1.643 áreas, 1.628 campings, 121 puntos de vaciado, 48 parkings.
- No existen reseñas, fotos de sitios, testimonios ni cifras de uso: no inventarlos.

## Product Principles

1. Encontrar antes que explorar: el siguiente sitio útil debe estar a uno o dos gestos.
2. Decir de dónde sale cada dato y cuándo se actualizó; nunca prometer lo que el dato no garantiza.
3. Libre y sin fricción: sin registro, sin muros, sin ruido comercial.
4. Igual de bueno en el móvil en una cuneta que en el escritorio en casa.

## Accessibility & Inclusion

Legible a pleno sol y de noche; objetivos táctiles amplios; contraste AA como mínimo.
