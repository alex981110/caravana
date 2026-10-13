---
name: Caravana
description: Mapa gratis y sin registro de dónde dormir, cargar agua y vaciar en autocaravana por toda España.
colors:
  petrol: "#16303A"
  petrol-2: "#23495A"
  petrol-ink: "#EEF3F1"
  petrol-ink-2: "#B9C9CC"
  paper: "#EBF0EE"
  paper-2: "#DDE5E2"
  sheet: "#FFFFFF"
  line: "#C8D3D0"
  ink: "#15232A"
  ink-2: "#435258"
  ink-3: "#5B676B"
  k-area: "#E04A2F"
  k-camping: "#1E7A5C"
  k-parking: "#2E5FC4"
  k-vaciado: "#EDB215"
  ok-bg: "#DCEFE5"
  ok-ink: "#12503B"
  warn-bg: "#FBEECB"
  warn-ink: "#674A00"
  stamp: "#B0361F"
  focus: "#2E5FC4"
typography:
  display:
    fontFamily: "Bricolage Grotesque, ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "1.65rem"
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "Bricolage Grotesque, ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: "-0.025em"
  brand:
    fontFamily: "Bricolage Grotesque, ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "1.45rem"
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: "-0.03em"
  title:
    fontFamily: "Bricolage Grotesque, ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "1rem"
    fontWeight: 750
    lineHeight: 1.1
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Bricolage Grotesque, ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Bricolage Grotesque, ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "0.92rem"
    fontWeight: 700
    lineHeight: 1
  numeric:
    fontFamily: "Bricolage Grotesque, ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "0.95rem"
    fontWeight: 700
    fontFeature: "tnum"
  stamp:
    fontFamily: "Bricolage Grotesque, ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "0.74rem"
    fontWeight: 800
    letterSpacing: "0.09em"
rounded:
  stamp: "6px"
  glyph: "7px"
  sm: "8px"
  control: "10px"
  md: "12px"
  sheet: "20px"
  pill: "999px"
spacing:
  xs: "4px"
  chip-gap: "6px"
  sm: "8px"
  md: "12px"
  gutter-mobile: "16px"
  gutter: "20px"
  panel-w: "400px"
components:
  button-primary:
    backgroundColor: "{colors.petrol}"
    textColor: "{colors.petrol-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "0 18px"
    height: "44px"
  button-primary-hover:
    backgroundColor: "{colors.petrol-2}"
  button-locate:
    backgroundColor: "{colors.k-vaciado}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "0 18px"
    height: "44px"
  button-line:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "0 18px"
    height: "44px"
  button-line-hover:
    backgroundColor: "{colors.paper-2}"
  search-input:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "0 16px 0 44px"
    height: "44px"
  chip-kind:
    backgroundColor: "transparent"
    textColor: "{colors.ink-3}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "0 12px 0 8px"
    height: "46px"
  chip-kind-active:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.ink}"
  chip-service:
    backgroundColor: "transparent"
    textColor: "{colors.ink-2}"
    rounded: "{rounded.pill}"
    padding: "0 12px"
    height: "34px"
  chip-service-active:
    backgroundColor: "{colors.petrol}"
    textColor: "{colors.petrol-ink}"
  result-row:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    padding: "13px 20px"
  result-row-active:
    backgroundColor: "{colors.sheet}"
  price-free:
    backgroundColor: "{colors.ok-bg}"
    textColor: "{colors.ok-ink}"
    rounded: "{rounded.pill}"
    padding: "0 9px"
    height: "24px"
  service-yes:
    backgroundColor: "{colors.petrol}"
    textColor: "{colors.petrol-ink}"
    rounded: "{rounded.md}"
  stamp:
    backgroundColor: "transparent"
    textColor: "{colors.stamp}"
    typography: "{typography.stamp}"
    rounded: "{rounded.stamp}"
    padding: "5px 10px"
  toast:
    backgroundColor: "{colors.petrol}"
    textColor: "{colors.petrol-ink}"
    rounded: "{rounded.md}"
    padding: "12px 18px"
---

# Design System: Caravana

## Overview

**Creative North Star: "Pegatinas de la luna trasera"**

Cada sitio es una pegatina troquelada de las que se coleccionan en la luna trasera de una autocaravana. La herramienta que las rodea es limpia, estándar y silenciosa: barra de cristal ahumado verde petróleo, hoja de trabajo en cristal claro verdoso, filas regladas y cifras tabulares. La pegatina es la única voz del sistema, y por eso aparece igual en todas partes: en el mapa, en los filtros, en la lista, en la ficha y en la marca.

La superficie está pensada para operar, no para explorar: densidad de herramienta en el panel, mapa a pantalla completa en el móvil con una hoja inferior y una sola familia tipográfica. Todo el color es plano (vinilo), sin degradados; la profundidad es la de un adhesivo sobre el cristal: un filo blanco de troquel y una sombra corta, desplazada y poco difuminada. Se rechazan de forma expresa el panel blanco con botón azul genérico y el «road trip» de atardecer que sustituye este mundo.

**Key Characteristics:**
- Cuatro tintas de vinilo, una por tipo de sitio, cada una con su propio troquel (silueta).
- Filo blanco de troquel y sombra corta de pegatina como única profundidad en reposo.
- Inclinación de «pegada a mano» fija por sitio (entre −7° y 7°), derivada del identificador.
- Una sola familia (Bricolage Grotesque) en pesos altos para titulares y cifras tabulares.
- Filas regladas con columnas fijas, como un tablero de salidas.
- Movimiento con firma: la pegatina se pega en la ficha y el marcador activo se despega del mapa.

## Colors

Cristal ahumado y cristal claro como soporte, cuatro vinilos saturados encima; el color fuerte solo vive en las pegatinas y en sus acciones directas.

### Primary
- **Petróleo ahumado** (petrol): la barra superior, el botón principal «Cómo llegar», el servicio presente, la cápsula de servicio activa y el aviso flotante. Es el cristal oscuro sobre el que todo se lee.
- **Petróleo claro** (petrol-2): hover del botón principal y color de los enlaces del texto.
- **Tinta de cristal** (petrol-ink) y **Tinta de cristal suave** (petrol-ink-2): texto sobre petróleo; la suave, para la promesa de la barra.

### Secondary
- **Vinilo bermellón** (k-area): áreas de autocaravanas y la marca-pegatina.
- **Vinilo verde pino** (k-camping): campings.
- **Vinilo azul parking** (k-parking): parkings y el punto «estás aquí».
- **Vinilo mostaza** (k-vaciado): puntos de vaciado y el botón «Cerca de mí». Es el único vinilo que lleva tinta oscura (ink) encima en lugar de blanco.

### Tertiary
- **Tinta de sello** (stamp): el sello estampado de «Registro oficial». No se usa para nada más.
- **Verde confirmado** (ok-bg / ok-ink): «Gratis» y «apto para autocaravanas».
- **Mostaza aviso** (warn-bg / warn-ink): «probablemente apto».
- **Anillo de foco** (focus): contorno de foco de teclado de 3px con 2px de separación.

### Neutral
- **Cristal claro** (paper): suelo del panel, del buscador y de los controles del mapa. Verdoso, nunca crema.
- **Cristal claro hundido** (paper-2): hover y presión de filas, casillas de servicio, precio de pago, dato desconocido.
- **Hoja** (sheet): blanco puro reservado a lo «pegado»: fila activa, chip de tipo activo, desplegable de búsqueda.
- **Reglado** (line): filetes de 1px de las filas, bordes discontinuos de huecos y contornos de cápsula.
- **Tinta** (ink), **Tinta media** (ink-2), **Tinta tenue** (ink-3): texto principal, secundario y metadatos.

### Named Rules
**The Vinilo por tipo Rule.** Cada tipo de sitio tiene un color y un troquel propios, y esa pareja es inseparable: el mismo par aparece en marcador, clúster, chip, fila y ficha. Ningún otro elemento usa las tintas de vinilo salvo el botón «Cerca de mí» (mostaza) y el punto de ubicación (azul).

**The Color plano Rule.** Todo el color es plano. Sin degradados, sin transparencias decorativas; las teselas del mapa se desaturan (saturate 0.55) para que los vinilos sean lo único saturado de la pantalla.

**The Hoja blanca Rule.** El blanco (sheet) significa «pegado» o «encima»: solo lo llevan el estado activo y lo que flota. El reposo es cristal claro.

## Typography

**Display Font:** Bricolage Grotesque (autoalojada, woff2 latin, pesos 400–800, OFL), con ui-sans-serif y system-ui de reserva
**Body Font:** Bricolage Grotesque

**Character:** Una grotesca redondeada y pesada que suena a rótulo de pegatina en los titulares y se vuelve neutra en el texto; una sola familia para todo, con tamaño óptico automático.

### Hierarchy
- **Display** (800, 1.65rem, 1.1, −0.03em): la pregunta del panel en escritorio. Desaparece en el móvil.
- **Headline** (800, 1.5rem, 1.1, −0.025em): nombre del sitio en la ficha.
- **Brand** (800, 1.45rem; 1.25rem en móvil): el nombre «Caravana» junto a la marca-pegatina.
- **Title** (750, 1rem, −0.01em): cabecera fija de la lista de resultados.
- **Body** (400, 15px, 1.5): texto corrido; la descripción se limita a 65ch. Los campos usan 16px para evitar el zoom de iOS.
- **Label** (700, 0.92–0.95rem, 1): botones y chips de tipo; las cápsulas de servicio bajan a 600 y 0.84rem.
- **Numeric** (700, 0.95rem, tabular): distancias, recuentos, coordenadas y cifras del clúster.
- **Stamp** (800, 0.74rem, +0.09em, mayúsculas): solo dentro del sello de registro oficial.

### Named Rules
**The Cifras tabulares Rule.** Toda cifra que se compara (distancia, recuento, coordenadas, número del clúster) usa cifras tabulares y se alinea en su columna.

**The Una familia Rule.** Una sola familia tipográfica; la jerarquía se hace con peso (400 a 800) y tamaño, nunca con una segunda fuente.

## Layout

Escritorio: barra superior petróleo (rejilla marca / buscador de hasta 560px / «Cerca de mí» / promesa a la derecha, 20px de hueco y margen) sobre una rejilla de dos columnas: panel izquierdo fijo de 400px (panel-w) y mapa al resto. El ancho de la marca se alinea con el del panel. La promesa «Gratis · sin registro · datos oficiales» se oculta por debajo de 1100px.

El panel apila introducción, filtros (tipos en rejilla de 2 columnas, servicios en fila que se ajusta), cabecera de resultados fija con filetes arriba y abajo, y la lista de filas regladas: columnas fijas de 40px de pegatina, nombre (hasta dos líneas) y distancia alineada a la derecha, con tipo y servicios debajo. Margen lateral de 20px en escritorio y 16px en móvil; huecos de 6, 8 y 12px.

Móvil (≤820px): la barra se compacta en dos filas (marca + «Cerca de mí», buscador debajo), el mapa ocupa toda la pantalla y el panel se convierte en hoja inferior con tirador: 46% de alto recogida y 88% al expandirse (al abrir una ficha se expande sola), con transición de 360ms en curva cubic-bezier(0.32, 0.72, 0, 1). Los filtros pasan a filas deslizables en horizontal para que la hoja recogida llegue a mostrar sitios, y los controles del mapa suben por encima de la hoja. Se respetan las zonas seguras del dispositivo arriba y abajo.

## Elevation & Depth

Sistema plano con profundidad de adhesivo: nada flota en reposo salvo las pegatinas. Cada pegatina proyecta, siguiendo su silueta, una sombra doble corta y poco difuminada; lo que de verdad flota (desplegable de búsqueda, aviso, marcador despegado) usa una sombra más larga. La hoja inferior del móvil tiene su propia sombra hacia arriba.

### Shadow Vocabulary
- **Sombra de pegatina** (`box-shadow: 0 1px 1.5px rgba(21, 35, 42, 0.24), 0 3px 7px rgba(21, 35, 42, 0.14)`): chip de tipo activo, pegatinas del clúster y controles de zoom.
- **Sombra de troquel** (`filter: drop-shadow(0 1px 0.75px rgba(21, 35, 42, 0.3)) drop-shadow(0 3px 3px rgba(21, 35, 42, 0.16))`): la misma sombra aplicada a la silueta SVG de cada pegatina y marcador.
- **Sombra levantada** (`box-shadow: 0 4px 6px rgba(21, 35, 42, 0.18), 0 12px 22px rgba(21, 35, 42, 0.26)`): desplegable de búsqueda y aviso flotante.
- **Sombra despegada** (`filter: drop-shadow(0 6px 4px rgba(21, 35, 42, 0.22)) drop-shadow(0 14px 12px rgba(21, 35, 42, 0.28))`): marcador activo y comienzo de la animación de pegado.
- **Sombra de hoja** (`box-shadow: 0 -6px 24px rgba(21, 35, 42, 0.22)`): solo la hoja inferior del móvil.

### Named Rules
**The Sombra corta Rule.** En reposo, la única sombra es la de pegatina: corta, desplazada hacia abajo y suave, teñida con la tinta (21, 35, 42), nunca negra pura ni de bloque duro.

## Shapes

Esquinas suaves de 12px (rounded.md) para botones, buscador, chips de tipo, casillas de servicio y avisos; 8px para opciones del desplegable y el contorno de foco; 7px para los glifos de servicio en las filas; cápsula completa para servicios y precios; 20px en las esquinas superiores de la hoja inferior. El clúster es un montón de pegatinas cuadradas de esquina del 30% con borde blanco de 3px.

Las pegatinas no son formas geométricas genéricas sino troqueles: cada tipo tiene su silueta (autocaravana para área, tienda triangular para camping, cuadrado redondeado con P para parking, gota con flecha para vaciado) dibujada en SVG (viewBox −3 −3 30 30), rellena con su vinilo y rodeada por un trazo blanco exterior (paint-order: stroke) cuyo grosor (--die) escala con el tamaño: 5px en el chip, 6px en lista y mapa, 7px en la marca, 10px en la ficha.

Los huecos y estados sin dato se dibujan con borde discontinuo de 1.5px en color reglado: es el «hueco troquelado vacío» donde iría una pegatina.

## Components

### Buttons
Táctiles y directos, con altura de 44px y peso 700.
- **Shape:** esquina suave (12px), sin borde.
- **Primary:** petróleo sobre texto de cristal, 0 18px; «Cómo llegar». Hover: petróleo claro.
- **Cerca de mí:** vinilo mostaza con tinta oscura, la única acción de la barra; en móvil baja a 38px de alto.
- **Line:** transparente con contorno interior de 1.5px en reglado; para web y teléfono. Hover: cristal hundido.
- **Hover / Focus:** los hovers solo existen con ratón (hover: hover y pointer: fine). Al pulsar, escala 0.97 en 120ms. Foco: contorno de 3px en el color de foco con 2px de separación.
- **Volver:** botón fantasma de 44px, tinta media, hover cristal hundido.

### Chips
- **Tipo (apagado):** hueco troquelado vacío: borde discontinuo de 1.5px, fondo transparente, pegatina en gris al 55% de opacidad y recuento tabular a la derecha.
- **Tipo (activo):** pegatina pegada: fondo blanco, sombra de pegatina, pegatina a todo color y texto en tinta.
- **Servicio:** cápsula de 34px con contorno interior de 1.5px; activa, rellena de petróleo con texto de cristal.

### Inputs / Fields
- **Style:** buscador sobre la barra petróleo, relleno de cristal claro, 44px de alto, esquina de 12px, lupa en tinta tenue a la izquierda y cursor petróleo.
- **Focus:** contorno interior de 2px en amarillo claro, transición de 140ms.
- **Desplegable:** hoja blanca con sombra levantada; la opción seleccionada se marca con cristal hundido.

### Navigation
La barra superior petróleo es la única navegación: marca-pegatina (44px, inclinada −6°, troquel de 7px) con el nombre, buscador central, «Cerca de mí» y la promesa en tinta de cristal suave.

### Filas de resultados
Filas regladas con filete inferior de 1px, como un tablero de salidas: pegatina de 36px en su inclinación, nombre en 700, distancia tabular a la derecha, tipo en tinta tenue y una fila de glifos de servicio (24px, esquina de 7px, cristal hundido) con la cápsula de precio. Hover: cristal hundido y la pegatina se endereza y crece 1.06. Activa: hoja blanca.

### Pegatina (componente firma)
El átomo del mundo. Un SVG troquelado por tipo (--kc vinilo, --kc-ink tinta de la marca interior, --rot inclinación de tipo) envuelto en un contenedor con sombra de troquel. Tamaños usados: 30px (chip), 36px (lista, marca móvil), 38px (marcador), 44px (marca), 88px (ficha).
- **En el mapa:** marcador de 38px inclinado según el sitio. Hover: se endereza y escala 1.15. Activo: se despega del mapa (perspectiva, sube 8px, escala 1.32, giro en X e Y) con sombra despegada, en 300ms con la curva de salida, y se pone por encima de todo.
- **En la ficha:** pegatina de 88px que se «pega» al abrirse: entra grande, girada y elevada, y se asienta en su inclinación en 560ms (animación stick).
- **Clúster:** un montón de tres pegatinas del tipo más abundante, giradas −12°, 9° y la del tipo, con la cifra tabular en 800; 38, 44 o 52px según el número.

### Sello de registro oficial
Sello estampado para los campings inscritos en un registro autonómico: doble filete (borde de 2px y contorno exterior de 1px a 2px de distancia) en tinta de sello, texto en mayúsculas espaciadas, girado −2°. Solo marca la procedencia oficial del dato.

### Servicios de la ficha
Rejilla de tres columnas con tres glifos distintos para tres estados: **presente** relleno de petróleo con texto de cristal; **ausente** con contorno de 1.5px, texto tachado e icono al 55%; **sin dato** con borde discontinuo. Los servicios sin dato se resumen además en una línea con borde discontinuo.

### Avisos
Aviso de aptitud en cápsula de 12px (verde confirmado, mostaza aviso o cristal hundido) con icono; aviso flotante (toast) en petróleo con sombra levantada, entra desde 10px abajo en 280ms.

## Do's and Don'ts

### Do:
- **Do** dar a cada tipo de sitio su pareja fija de vinilo y troquel, y repetirla en marcador, clúster, chip, fila y ficha.
- **Do** rodear toda pegatina con su filo blanco de troquel (--die de 5 a 10px según tamaño) y la sombra corta de pegatina.
- **Do** derivar la inclinación de cada sitio de su identificador (−7° a 7°) para que sea estable entre visitas.
- **Do** usar cifras tabulares en distancias, recuentos, coordenadas y clústeres.
- **Do** distinguir presente, ausente y sin dato con tres glifos distintos; «sin dato» siempre en borde discontinuo.
- **Do** mantener objetivos táctiles de 44px (42px en chips de tipo en móvil) y limitar los hovers a dispositivos con ratón.
- **Do** respetar prefers-reduced-motion: todas las transiciones y animaciones se reducen a 0.01ms.

### Don't:
- **Don't** usar degradados ni color no plano; el vinilo es plano.
- **Don't** usar las tintas de vinilo para decorar elementos que no sean un tipo de sitio (salvo «Cerca de mí» y el punto de ubicación).
- **Don't** usar fondos crema o cálidos para la hoja de trabajo; el cristal claro es verdoso (paper).
- **Don't** usar sombras negras puras ni de bloque duro; la sombra de pegatina es corta, suave y teñida con la tinta.
- **Don't** añadir una segunda familia tipográfica.
- **Don't** volver al panel blanco con botón azul genérico ni a la estética de atardecer de «road trip».
- **Don't** usar el sello para nada que no sea la procedencia de un registro oficial.
