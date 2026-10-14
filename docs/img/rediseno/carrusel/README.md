# Carrusel BOX · evidencia visual y rendimiento

Pedido del 13/10/2026: carrusel de imágenes con la estética BOX, editor del dueño y correcciones del header y dock
del celular. Las capturas comparan el mismo viewport y modo antes y después del cambio.

| Pantalla | Tamaño | Modo | Antes | Después |
|---|---|---|---|---|
| Inicio | 1440 × 900 | Oscuro | [Captura](antes-inicio-1440-oscuro.png) | [Captura](despues-inicio-1440-oscuro.png) |
| Inicio | 1440 × 900 | Claro | [Captura](antes-inicio-1440-claro.png) | [Captura](despues-inicio-1440-claro.png) |
| Inicio | 390 × 844 | Oscuro | [Captura](antes-inicio-390-oscuro.png) | [Captura](despues-inicio-390-oscuro.png) |
| Inicio | 390 × 844 | Claro | [Captura](antes-inicio-390-claro.png) | [Captura](despues-inicio-390-claro.png) |
| Editor | 1440 × 900 | Oscuro | [Captura](antes-editor-1440-oscuro.png) | [Captura](despues-editor-1440-oscuro.png) |
| Editor | 1440 × 900 | Claro | [Captura](antes-editor-1440-claro.png) | [Captura](despues-editor-1440-claro.png) |
| Editor | 390 × 844 | Oscuro | [Captura](antes-editor-390-oscuro.png) | [Captura](despues-editor-390-oscuro.png) |
| Editor | 390 × 844 | Claro | [Captura](antes-editor-390-claro.png) | [Captura](despues-editor-390-claro.png) |

## Imagen propia y encuadre

| Tamaño / modo | Inicio con imagen subida | Vista previa | Encuadre |
|---|---|---|---|
| 1440 / oscuro | [Captura](despues-imagen-propia-inicio-1440-oscuro.png) | [Captura](despues-imagen-propia-editor-1440-oscuro.png) | [Controles](despues-encuadre-1440-oscuro.png) |
| 1440 / claro | [Captura](despues-imagen-propia-inicio-1440-claro.png) | [Captura](despues-imagen-propia-editor-1440-claro.png) | [Controles](despues-encuadre-1440-claro.png) |
| 390 / oscuro | [Captura](despues-imagen-propia-inicio-390-oscuro.png) | [Captura](despues-imagen-propia-editor-390-oscuro.png) | [Controles](despues-encuadre-390-oscuro.png) |
| 390 / claro | [Captura](despues-imagen-propia-inicio-390-claro.png) | [Captura](despues-imagen-propia-editor-390-claro.png) | [Controles](despues-encuadre-390-claro.png) |

La imagen de ejemplo es una captura del arte SVG propio de la demo, subida desde el mismo campo del dueño.

## Rendimiento del inicio en celular

Chromium 154.0.8037.57, viewport 390 × 844, CPU ×4, caché de red desactivada, export estático local bajo
`/supplements-ecommerce`, sin limitar la red. Movimiento habilitado, temática Original y splash ya visto.

Comparación final: quince pares alternados de `main` (`ae0b07c`) y `rediseno-carrusel` en el mismo navegador, con una
visita de calentamiento a cada versión y un contexto nuevo por visita. Se registra LCP/CLS con PerformanceObserver
hasta 2,5 s después de `load`; la tabla muestra medianas. [Datos completos](rendimiento-pareado.json).

| Métrica | Main | Carrusel | Cambio |
|---|---|---|---|
| LCP | 1780 ms | 1720 ms | -3.4 % |
| FCP | 588 ms | 616 ms | +4.8 % |
| CLS | 0.0044 | 0.0044 | Sin cambio |

La medición inicial previa a editar fue **2272 ms de LCP**, **668 ms de FCP** y **0,0044 de CLS** (siete visitas,
[datos](rendimiento-antes.json)). Los lotes intermedios se conservan en los JSON `rendimiento-intermedio-*`; mostraron
variación de carga y motivaron la comparación alternada final. El LCP final también queda por debajo de esa medición
inicial. Las pruebas verifican que rotar o preparar las escenas conserva la altura del carrusel.

Se difieren el dibujo de las escenas fuera de pantalla y los envases de los estantes; sus medidas se reservan. La
entrega y el flujo de compra se calculan una vez para el carrusel. El titular se lee desde el primer cuadro y conserva
el golpe mecánico. Se precarga localmente la misma fuente Big Shoulders para disponer del póster antes. Las escenas
reutilizan su render con acciones que siempre compran la diapositiva actual.

Para reproducir las capturas en cada versión, con su export servido en 4173:

```sh
node scripts/capture-carousel.mjs antes --capture-only
node scripts/capture-carousel.mjs despues --capture-only
```

Para la comparación, servir `main` en 4174 y la rama en 4173, con el mismo basePath:

```sh
CAROUSEL_BASE_SHA=ae0b07c node scripts/measure-carousel-pair.mjs
```

## WebKit en celular

WebKit 26.0 con iPhone 13 emulado (390 × 844), claro y oscuro: navegación circular, altura estable al preparar las
diapositivas, imagen local guardada con encuadre, navegación desde la cuenta y apertura de la búsqueda desde el dock.
[Resultados](webkit-26.json). Esta comprobación usa el motor WebKit en Linux; no es una captura de un iPhone físico.

```sh
npx playwright install --with-deps webkit
node scripts/check-carousel-webkit.mjs
```

`PLAYWRIGHT_WEBKIT_PATH` permite indicar un ejecutable propio cuando el entorno lo requiere.

## Verificación de entrega

- `npm run lint && npm run typecheck && npm test && npm run check:marca`: verde; 55 archivos y **447 tests unitarios**, incluidos los **30 tests de marca**.
- `PAGES_BASE_PATH=/supplements-ecommerce npm run build`: export estático en verde.
- `PAGES_BASE_PATH=/supplements-ecommerce npx playwright test --workers=2`: **417 de 417**, sin reintentos ni omitidos. [Reporte completo](playwright-417.txt).
- Chromium 154.0.8037.57 del entorno, seleccionado con `PLAYWRIGHT_CHROMIUM_PATH=/usr/bin/chromium`; WebKit 26.0 también comprobado como se detalla arriba.

[Registro de verificación](verificacion.json). Las capturas y la medición corresponden al mismo código de la tienda; los ajustes finales afectan solo las pruebas.
