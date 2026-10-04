# Caravana

Mapa de **áreas de autocaravanas, campings, parkings autorizados y puntos de vaciado** en toda España (península, Baleares y Canarias).

- Mapa con los sitios agrupados y un color por tipo
- Buscador de localidades y botón «Cerca de mí»
- Filtros por tipo y por servicio: gratis, agua, electricidad, vaciado, aseos, duchas y wifi
- Ficha de cada sitio con servicios, horario, estancia máxima, plazas, precio, web, teléfono y «Cómo llegar»
- Enlaces compartibles: la posición del mapa y el sitio abierto quedan en la URL
- Tres estilos a elegir (se recuerda en el navegador; también `?tema=roadtrip|nav|nature` en la URL):
  - **Road trip** (por defecto): cielo de atardecer, montañas y tipografía setentera
  - **Navegación**: oscuro, mapa a pantalla completa y paneles flotantes
  - **Naturaleza**: limpio, verde bosque y mapa con relieve (OpenTopoMap)

## Datos

Los datos salen de [OpenStreetMap](https://www.openstreetmap.org) (© colaboradores de OpenStreetMap, licencia [ODbL](https://www.openstreetmap.org/copyright)):

| Tipo | Etiquetas de OpenStreetMap |
|---|---|
| Área de autocaravanas | `tourism=caravan_site` |
| Parking autorizado | `amenity=parking` + `motorhome=yes/designated` |
| Camping | `tourism=camp_site` (se excluyen los marcados `motorhome=no`, `caravans=no`, `backcountry=yes`, `camp_site=basic`, `group_only=yes` y `scout=yes`) |
| Punto de vaciado | `amenity=sanitary_dump_station` |

Los puntos de vaciado a menos de 150 m de un área se fusionan con ella (el área queda marcada «con vaciado»).

En los campings, la ficha indica si se sabe que admiten autocaravanas (`motorhome=yes`), caravanas (`caravans=yes`) o si no hay dato. El filtro «Confirmado para autocaravanas» deja solo los que tienen dato.

### Registros oficiales

Los campings se cruzan con los registros oficiales publicados como datos abiertos (reutilización conforme a la Ley 37/2007 y el RD 1495/2011, citando la fuente):

| Fuente | Datos |
|---|---|
| Junta de Castilla y León | Registro de campings, con coordenadas |
| Gobierno Vasco · Open Data Euskadi | Campings de Euskadi, con coordenadas |
| Diputación de Castellón | Campings de la provincia, con coordenadas |
| Región de Murcia | Campings, con coordenadas (UTM) |
| Concello de Vigo | Campings de Vigo, con coordenadas |
| Generalitat Valenciana | Lista de campings |
| Gobierno de Aragón | Campings turísticos |
| Junta de Comunidades de Castilla-La Mancha | Campings y áreas de autocaravanas |
| Junta de Extremadura | Campamentos turísticos |

Si un camping del registro ya está en OpenStreetMap (mismo nombre cerca), se completa con plazas, categoría, teléfono y web, y la ficha indica que está inscrito en el registro. Si no está y el registro trae coordenadas, se añade como sitio nuevo. Los registros sin coordenadas solo se usan para completar sitios que ya existen: no se colocan en el centro del municipio. El código está en [`scripts/registros.mjs`](scripts/registros.mjs).

Faltan registros publicados con coordenadas de Andalucía, Cataluña, Galicia, Asturias, Cantabria, Navarra, La Rioja, Madrid, Baleares y Canarias.

Si falta un sitio o hay un error, se corrige en OpenStreetMap: cada ficha tiene un enlace directo y el cambio aparece aquí en la siguiente actualización.

### Actualización

La tarea [`Actualizar datos`](.github/workflows/datos.yml) se ejecuta cada lunes, descarga los datos con la API Overpass y, si hay cambios, actualiza `data/sitios.json`. También se puede lanzar a mano desde la pestaña **Actions**.

Para actualizarlos en local (Node 18 o superior):

```bash
npm run datos
```

## Desarrollo

Es una web estática, sin dependencias ni paso de compilación. Basta con servir la carpeta:

```bash
npm run dev        # o cualquier servidor estático
```

| Ruta | Contenido |
|---|---|
| `index.html` | Página |
| `css/styles.css` | Estilos |
| `js/app.js` | Mapa, filtros, lista, ficha y buscador |
| `data/sitios.json` | Datos procesados que usa la web |
| `data/registros.json` | Última copia buena de cada registro oficial (si una fuente falla, se usa esta) |
| `data/municipios.json` | Coordenadas de municipios ya consultadas a Nominatim |
| `scripts/build-data.mjs` | Descarga y procesado de OpenStreetMap |
| `scripts/registros.mjs` | Descarga y cruce de los registros oficiales |

Servicios externos: teselas de [OpenStreetMap](https://www.openstreetmap.org) y [OpenTopoMap](https://opentopomap.org) (CC-BY-SA), búsqueda de localidades con [Photon](https://photon.komoot.io) y [Leaflet](https://leafletjs.com) para el mapa.

## Publicación

Se publica con **GitHub Pages** desde la rama `main`: en el repositorio, *Settings → Pages → Build and deployment → Deploy from a branch → `main` / `(root)`*. Cada actualización de datos se publica sola.
