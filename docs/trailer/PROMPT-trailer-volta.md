# Prompt: trailer comercial de "Tu tienda" (sistema de Eclipse para tiendas de suplementos)

> Pegalo en una sesión nueva sobre `Toti-Gauna/supplements-ecommerce`, **una fase por vez**: indicá en qué fase arrancar
> ("Hacé la Pre-fase", "Hacé T1-F2", etc.). Cada fase usa su propio modelo y esfuerzo (tabla de abajo); no uses `max`
> salvo donde lo dice.
> Repos de referencia, solo lectura (clonalos en `/home/user/toti-gauna/`): `Toti-Gauna/kinetic-studio`,
> `Toti-Gauna/Eclipse-Web` y `Toti-Gauna/Eclipse-email-kit`.

## Fases y modelo por fase

### Pre-fase · Auditoría y kit de trailers (una sola vez, antes de cualquier trailer)
| Paso | Qué | Modelo · esfuerzo |
|---|---|---|
| P0.1 | Auditar `kinetic-studio`: los 33 trailers, el kit (`js/` de cada uno, motor, recetas, `SFX`, `trailers/export/tools/capture.mjs`). Tabla: qué receta o escena sirve, para qué pieza y cuánto cuesta adaptarla | Sonnet · medium |
| P0.2 | Auditar `Eclipse-Web`: hero del eclipse, "iluminar" (`SkyTransition`, `Dawn`), tokens, tipografías, cierre. Auditar `Eclipse-email-kit`: `brand.json`, productos, ofertas y precios (qué es borrador) | Sonnet · medium |
| P0.3 | Relevamiento de la interfaz de esta app (`ui-inventory`) y capturas por componente con Playwright en claro y oscuro a 2× (`component-crops`, `scripts/trailer-capture.mjs` → `docs/trailer/capturas/`) | Sonnet · medium |
| P0.4 | **Kit de trailers en esta app**: ruta `/trailer/`, motor GSAP con línea de tiempo como datos, `?t=`, escenas deterministas, reloj de audio, intro y cierre de Eclipse ("Presenta…", iluminar y cerrarse), bloque final común (Probalo en vivo, Contactanos, pricing con estética Eclipse), dispositivo 3D reutilizable, exportador a MP4 (16:9 y 9:16, liviano para email, póster) y botón "Descargar MP4" | Opus · high |
| P0.5 | **Firma sonora**: el hook de 4 compases a 128–140 BPM, el kit de sonidos y el outro tranquilo para pricing, con mezcla medida (−14 LUFS) | Opus · high |
| P0.6 | Informe de la pre-fase (`docs/trailer/auditoria.md`) y PR. Ignacio aprueba el hook y la intro de Eclipse | — |

### Cada trailer (T1 teaser, T2 experiencia de compra, T3 panel del dueño, T4 largo)
| Fase | Qué | Modelo · esfuerzo |
|---|---|---|
| F1 · Dirección | Panel de 3 direcciones, juez con rúbrica y storyboard al segundo con supers, cue sheet y partitura. **Lo aprueba Ignacio** | Opus · **max** (solo acá) |
| F2 · Construcción 16:9 | Escena por escena sobre el kit, verificada cuadro por cuadro con `?t=` | Opus · xhigh |
| F3 · Música de la pieza | Arreglo del hook para esta pieza: builds, drops y sincronía con los cortes | Sonnet · high |
| F4 · QA adversarial | `trailer-qa`, las seis lentes, y corrección de lo bloqueante | Opus · high |
| F5 · Versión 9:16 | Re-encuadre (no recorte) sobre la misma línea de tiempo | Sonnet · high |
| F6 · Exportación y PR | MP4 16:9 y 9:16, versión para email, póster, capturas y PR | Sonnet · medium |

T4 (el largo) reusa escenas de T1–T3: su F1 es Opus · xhigh (no max) y su F2 Opus · high, porque lo nuevo son las
transiciones entre bloques y el desarrollo completo de la canción.

**Orden:** Pre-fase → T1 → T2 → T3 → T4. No arranques una fase sin la aprobación de la anterior.

**Regla de corte (obligatoria):** al terminar **cada paso** (cada P0.x y cada Fx de cada trailer), **pará**. Entregá
un resumen corto de lo hecho, lo verificado y lo pendiente, y **recomendá el modelo y el esfuerzo para el paso
siguiente** (confirmando el de la tabla o proponiendo otro con el motivo, por ejemplo "P0.2 salió más simple de lo
esperado: alcanza con Sonnet · low"). No sigas hasta que Ignacio diga con qué modelo continuar.

---

> **El plan vigente es [`PLAN.md`](PLAN.md):** pasos, modelo por paso, arquitectura decidida y verificación. Si algo
> de este prompt choca con el plan, manda el plan. Este archivo queda como brief creativo (secciones 1 a 7).

## 0. Rol y forma de trabajo

- Usá el agente **trailer-arquitect** (incluido en el repo) como director.
- Seguí sus skills en este orden: `trailer-discovery` (ya respondido abajo: no vuelvas a preguntar), `ui-inventory`, `creative-direction` (panel de 3 direcciones y juez), `gsap-trailer-engine`, `sound-design`, `prompt-pack`, la construcción y `trailer-qa`.
- Trabajá por fases. **Cada pieza es un PR propio**, con CI en verde, capturas y el MP4 exportado. No avances a la pieza siguiente hasta que Ignacio apruebe la anterior.
- Antes de escribir código, entregá el storyboard al segundo de la pieza en curso, con capturas de referencia, para que Ignacio lo apruebe.

## 1. Objetivo

Un trailer comercial que deje con la boca abierta a un **dueño de tienda de suplementos**. Tiene que sentirse como un lanzamiento de Gemini o Claude, pero comercial y enfocado en vender.

El mensaje: Eclipse no vende "un software" ni "una página linda". Vende una **experiencia de compra que no tiene ninguna otra tienda de suplementos**, más asesoría de growth marketing y fidelización.

## 2. Marca y nombres (reglas duras)

- En pantalla la tienda se llama **"Tu tienda"**. Nunca "VOLTA". Respetá `npm run check:marca`.
- La firma es **Eclipse**:
  - **Apertura de cada pieza:** el logo de Eclipse, abajo "Presenta…", y la animación de **"iluminar"** de Eclipse Web. Replicala fielmente desde `Eclipse-Web`: hero del eclipse, `components/sections/SkyTransition.tsx` y `agent/Dawn.tsx`. Mirá también la web publicada.
  - **Cierre de cada pieza:** el eclipse **se cierra**, la animación inversa.
- Desde "Probalo en vivo" en adelante, la estética **cambia a la de Eclipse** (dirección de arte «Efemérides»): eclipse, marcas de sección en mono, serif display, libros de precios y amanecer. Tokens y tipografías desde `Eclipse-Web` y `Eclipse-email-kit/data/brand.json`.

## 3. Referencia visual: kinetic-studio

Estudiá **los 33 trailers** de `kinetic-studio/trailers/` y su kit (`js/` de cada uno, recetas, `SFX`, motor) antes de diseñar:
- tipografía cinética;
- luces;
- 3D con Three.js;
- cambios de color;
- transiciones;
- glitch, liquid, hyperspace y big-bang.

**Reutilizá** recetas o escenas cuando sumen. Por ejemplo, la escena de envíos por el país de `ecommerce-remix` sirve para "cómo le llega el envío". Mirá en especial:
- `ecommerce`, `ecommerce-remix`, `velmar`, `velmar-comercial` y `velmar-premium`: la base de esta tienda;
- `launch`, `kinetic`, `beat`, `synthwave`, `big-bang` y `wrapped`.

El nivel mínimo de calidad es el del mejor trailer del repo, y hay que superarlo.

Para exportar a MP4 usá como base `kinetic-studio/trailers/export/tools/capture.mjs`: cuadro a cuadro, determinista, con audio WAV mezclado.

## 4. Formato técnico

- **Trailer dentro de la app con GSAP**, como ruta propia de la demo, por ejemplo `/trailer/` y `/trailer/<pieza>/`:
  - un chunk propio, sin peso para el resto del sitio;
  - una línea de tiempo maestra pausada, con `?t=SEGUNDOS` para congelar un cuadro.
- **Fidelidad:** usá la interfaz real cuando se pueda (componentes reales con datos de fixtures). Si no, usá **capturas por componente** sacadas con Playwright de la app real (skill `component-crops`): componentes sueltos y conjuntos, en claro y oscuro y a 2× de resolución. Nada inventado que la app no haga.
- **Dispositivos 3D** (Three.js, celular y notebook) en los momentos clave, con la interfaz real como textura.
- **Formatos:** primero 16:9 (1920×1080) de cada pieza. Una vez aprobado, la versión **9:16** (1080×1920) de esa misma pieza, re-encuadrada y no un recorte.
- **Exportación a MP4** (H.264, 1080p a 60 fps, AAC), descargable desde la propia página del trailer, con un botón "Descargar MP4" que baja el archivo de `public/trailer/`. Pensado para emails y redes: además, un **MP4 liviano de 720p y menos de 10 MB** para email, y un **GIF o póster** de portada.
- Respetá `prefers-reduced-motion` (versión con cortes, sin movimiento brusco), contraste AA en los textos y 60 fps en una notebook de gama media.

## 5. Música (síntesis propia con WebAudio)

- Electrónica **pegadiza**, entre 128 y 140 BPM, con **un hook melódico que se recuerde** (motivo de 4 compases que vuelve en cada pieza). Funciona como la "firma sonora" de Tu tienda.
- **Drops en cada momento fuerte**, pero sin saturar: hay que medir la loudness para web (alrededor de −14 LUFS integrado y −1 dBTP), sin graves que revienten parlantes de celular, y con sidechain suave.
- Los efectos de sonido van sincronizados al corte: click, swipe, cobro, ruleta, shaker, apertura de regalo y "ding" de WhatsApp.
- **Pricing y contacto:** la música cambia a algo **tranquilo**: pad cálido con el mismo motivo desacelerado y en tonalidad mayor, como "amanecer".
- Todo pre-renderizable a WAV para el MP4. Nada con licencia de terceros.

## 6. Contenido por pieza

### Pieza 1: teaser "El problema y la diferencia" (30–45 s)

Es la pieza rápida.
- **El problema:** todas las tiendas de suplementos repiten los mismos patrones. Mismo template, mismo banner de "20 % OFF", misma grilla de potes, cero relación después de la compra. Mostralo con una grilla de "tiendas clonadas" grises que se repiten o glitchean.
- **El quiebre:** Eclipse diferencia y **aumenta las ventas**. No solo con software, también con **asesoría de growth marketing y fidelización**.
- **Ráfaga de "wow":** un plano de 1 a 2 s de cada uno:
  - pantalla de carga temática;
  - regalo abriéndose;
  - Shaker Rush;
  - ruleta;
  - golpe de modo claro a oscuro;
  - Mostrador cobrando en cuotas;
  - "48 suben".
- Cierre con "Probalo en vivo", "Contactanos · 223-446 7881" y el eclipse que se cierra. El teaser no lleva pricing completo; queda solo un guiño.

### Pieza 2: "La experiencia de compra" (75–100 s), del lado del cliente

Cada plano muestra la app real, con textos grandes en pantalla y sin voz.
- **Inicio y temáticas:** las **pantallas de carga únicas por fecha** se transforman una en otra (juego de transiciones entre las 12 fechas y los días del deporte). También el carrusel y la franja de próxima campaña.
- **Comprar:**
  - búsqueda tolerante a errores;
  - ficha con foto grande que cambia con el sabor;
  - comparador;
  - **Armá tu stack** y el **Quiz**, para "llegar a una mejor compra";
  - **packs mensuales** y "quiero este pack todos los meses".
- **Checkout** en 3 pasos y **seguimiento del envío**: el pedido viaja por el país con la escena de `ecommerce-remix` adaptada, hasta la puerta en Mar del Plata, y muestra el lote de lo que llega.
- **Modo claro y oscuro:** el cambio de tema como golpe visual, sincronizado con el drop.
- **Fidelidad con gamificación:** Club Tu tienda (niveles y puntos), **misiones**, **ruleta disco olímpico**, **Shaker Rush** jugado unos segundos, **cupones** y **recordatorios**.
- **Regalos:**
  - gift card con monto;
  - sabor abierto;
  - apertura de la **bolsa de boxeo** y del **locker**, con su revelación.
- **Automatización por WhatsApp:** el día que se le termina el pack al cliente, le llega un **mensaje automático**. Mostralo en un celular 3D:
  1. el calendario de servicios llega a cero;
  2. aparece la notificación de WhatsApp con el mensaje armado;
  3. el cliente toca el link y se abre la tienda **con el bolso ya cargado** (link de recompra real).
- Cierre: "Probalo en vivo", contacto, pricing y el eclipse que se cierra.

### Pieza 3: "Tu panel, tu centro de mando" (90–120 s), del lado del dueño

Recorre **cada sección del panel** con clicks reales: cursor animado, hover y presión. Cada sección lleva una línea grande que diga **para qué sirve**.
1. **Hoy:** marcador del día y lista de acciones por urgencia; aprobar un comprobante con confirmación.
2. **Mostrador:**
   - buscar, ticket con descuento stack y lote que sale primero;
   - **cobro en 3 cuotas con recargo**;
   - venta registrada y cierre del día.
3. **Pedidos:**
   - Por cobrar, Para armar en 2 pasos y Despachos con la hoja de ruta del cadete;
   - Postventa y "Escribirle por WhatsApp".
4. **Stock:** lotes y vencimientos.
5. **Compras:** **lista del proveedor, "48 suben, 3 bajan"**, margen por marca y costos vivos.
6. **Clientes:** "A quién escribirle hoy", link de recompra y regalo de cumpleaños.
7. **Promos:** cupones, descuento stack, ruleta, premios del juego, misiones y regalos.
8. **Campañas:** las temáticas y el drop.
9. **Ajustes**, y el **modo dueño** sobre la tienda: placas que llevan al panel.
10. **Lote que vence:** se convierte en acción armada (combo, cupón o drop).

Cierre: "Probalo en vivo", contacto, pricing y el eclipse que se cierra.

### Pieza 4: el trailer largo (3–4 min)

- Une las tres piezas con un hilo narrativo: problema, experiencia del cliente, panel del dueño, cierre.
- Una sola apertura y un solo cierre de Eclipse.
- La misma canción con su desarrollo completo: intro, builds, drops, puente y outro tranquilo para el pricing.
- No es una concatenación: rehacé transiciones y ritmo entre bloques.

### Bloque final común: "Probalo en vivo", contacto y pricing

1. **"Probalo en vivo"** con el link a la demo.
2. **"Contactanos"** y el teléfono **223-446 7881**, con botón de WhatsApp en la versión web.
3. **Pricing** con la estética de Eclipse y la música tranquila: mostrá **todo lo que trae `Eclipse-email-kit`** para el producto de tiendas de suplementos:
   - `data/products/volta.json`;
   - `data/offers/prices.v2026-10-16.json`;
   - `data/offers/launch-pack-draft.json`;
   - `data/offers/base-campaign.json`.

   Cada uno se ve como plan o "libro de precios". Usá los datos tal cual: **no inventes precios**. En pantalla, el producto se nombra "Tu tienda" o como lo nombre el kit para el cliente, nunca "VOLTA". Si un dato está marcado como borrador, poné "precios de lanzamiento" y consultá a Ignacio antes de publicar.
4. El eclipse se cierra.

## 7. Escenas "wow" obligatorias (todas, repartidas entre las piezas)

| Escena | Pieza 1 | Pieza 2 | Pieza 3 |
|---|---|---|---|
| Pantallas de carga que se transforman entre fechas | ✓ | ✓ (protagonista) | |
| Apertura del regalo (bolsa y locker) | ✓ | ✓ | |
| Shaker Rush | ✓ | ✓ | |
| Ruleta disco olímpico | ✓ | ✓ | (premios, en Promos) |
| Claro y oscuro como golpe visual | ✓ | ✓ | ✓ (panel) |
| Mostrador cobrando en cuotas | ✓ | | ✓ (protagonista) |
| Lista del proveedor "48 suben" | ✓ | | ✓ |
| WhatsApp automático de recompra | | ✓ (protagonista) | ✓ (Clientes) |
| Envío viajando por el país | | ✓ | (Despachos) |

## 8. Proceso obligatorio (detalle de referencia; el orden, los pasos y el modelo los fija `PLAN.md`)

1. **Relevamiento de la interfaz** (`ui-inventory`): cada pieza que aparece, con `archivo:línea`, textos exactos y estados, y qué es real y qué es simulado en la demo.
2. **Capturas por componente** (`component-crops` y un script de Playwright en `scripts/trailer-capture.mjs`): de cada componente y conjunto, en claro y oscuro, 2× y fondo del color de la app. Van en `docs/trailer/capturas/`.
3. **Dirección creativa** (`creative-direction`):
   - panel de 3 direcciones (cinematográfica, lúdica y de precisión);
   - un juez con rúbrica elige y sintetiza;
   - storyboard al segundo por pieza, con supers, transiciones, cue sheet y partitura.

   **Lo aprueba Ignacio antes de construir.**
4. **Arquitectura** (`gsap-trailer-engine`): núcleo puro y testeable, la línea de tiempo como datos, escenas deterministas y seekables, y el reloj de audio que manda.
5. **Sonido** (`sound-design`): partitura por compás, el hook, la mezcla y el WAV.
6. **Construcción** escena por escena, verificada cuadro por cuadro con `?t=`.
7. **QA adversarial** (`trailer-qa`):
   - las seis lentes;
   - honestidad: nada que la app no haga;
   - nivel premium;
   - rendimiento;
   - accesibilidad;
   - consistencia con el repo.
8. **Exportación** a MP4 16:9, después a 9:16, más la versión liviana para email y el póster.
9. **Carpeta de prompts** (`prompt-pack`) en `docs/trailer/` para poder rehacer o extender cada pieza.

## 9. Reglas del repo que siguen valiendo

- Lee `CLAUDE.md`, `AGENTS.md` y `docs/demo-pages.md`.
- Archivos de 150 líneas o menos (más de 250 bloquea el commit).
- Tokens de color y `npm run check:marca`.
- Nada de Server Actions.
- Nunca saltear ni borrar tests.
- Lint, tipos, unitarios, build y e2e del trailer: carga, `?t=` y botón de descarga.
- Fecha de la demo con `demoNow()`.
- Español rioplatense en todos los textos.

## 10. Entregables por pieza

- La ruta del trailer en la demo, publicada en Pages.
- Los MP4 (16:9, 9:16 y la versión liviana para email), el WAV y el póster.
- El storyboard aprobado, las capturas usadas y el informe de QA.
- Un PR propio con capturas de cuadros clave y el link a la ruta.
