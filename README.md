# Caravana

Mapa de **áreas de autocaravanas, parkings autorizados, campings y puntos de vaciado** en toda España (península, Baleares y Canarias).

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
| Camping | `tourism=camp_site` + `motorhome=yes/designated` |
| Punto de vaciado | `amenity=sanitary_dump_station` |

Los puntos de vaciado a menos de 150 m de un área se fusionan con ella (el área queda marcada «con vaciado»).

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
| `data/sitios.json` | Datos procesados |
| `scripts/build-data.mjs` | Descarga y procesado de OpenStreetMap |

Servicios externos: teselas de [OpenStreetMap](https://www.openstreetmap.org) y [OpenTopoMap](https://opentopomap.org) (CC-BY-SA), búsqueda de localidades con [Photon](https://photon.komoot.io) y [Leaflet](https://leafletjs.com) para el mapa.

## Publicación

Se publica con **GitHub Pages** desde la rama `main`: en el repositorio, *Settings → Pages → Build and deployment → Deploy from a branch → `main` / `(root)`*. Cada actualización de datos se publica sola.
