# Biblia de referencias del trailer (P0.1)

Qué se reutiliza, de dónde y para qué escena. Los pasos siguientes leen **solo este archivo** y no vuelven a explorar los repos.

Fuentes (solo lectura, en `/home/user/toti-gauna/`): `kinetic-studio` (KS), `eclipse-web` (EW), `eclipse-email-kit` (EK).

## 1. Hallazgos que cambian el plan
1. **EW ya tiene un sistema de trailers en React + GSAP** (`components/trailers/`: `scenes.tsx`, `timeline.ts`, `TrailerPlayer.tsx`, `VerticalTrailer.tsx`, `ShopTrailer.tsx`). Su escena final `SceneLogo` (eclipse + wordmark + frase de cierre) y su `loader` son exactamente la firma que pedimos. **La firma Eclipse (P0.4) se porta de ahí**, no se inventa.
2. **El exportador de KS no está en el repo** (`capture.mjs` llama a `~/.claude/trailer-kit/tools/export.mjs`, que no existe acá). Hay que escribirlo (P0.6), como ya decía el plan.
3. **El kit de KS es JS global (`window.Trailer`, `window.SFX`) con GSAP del CDN**: se porta a TypeScript con módulos (P0.3). Cada receta cumple `(D, T, o) => duración`, con todos los tweens puestos en `D.tl` (el timeline maestro): por eso se puede saltar a cualquier cuadro.
4. **No existe receta de dispositivo 3D (celular/notebook)** en KS. Hay que escribirla en P0.3 (Three.js, textura = captura o componente real).
5. **No hay receta para pantallas de carga ni para juegos**: esas escenas montan componentes reales de esta app (ver §4).
6. **Contacto y condiciones sin confirmar en EK** (`brand.json`: contacto "pendiente de confirmar", `conditionsVerified: false`, asesor económico `confirmed: false`). El teléfono **223-446 7881** lo dio Ignacio y va en pantalla; ver pendientes en §7.

## 2. Kit de KS: contrato y piezas del motor
Base: `trailers/ecommerce-remix/js/` (la más completa; 13 archivos de recetas).

| Pieza | Archivo | Qué da |
|---|---|---|
| Motor | `engine.js` | Escenario fijo 1920×1080 escalado, timeline maestro `D.tl`, `?t=` (línea 176), `window.trailer = {tl, map, D}`, cámara con `keys` (`s, rx, ry, x, y, ease`), `whipIn/whipOut`, `D.setBg`, `D.ink`, `D.hit`, `D.split` (SplitText), `D.fit`, `D.call`, `D.barsTo` (barras de cine), `D.label` |
| Configuración | `trailer.js` | Arreglo de escenas `{type, label, fit/duration, camera, whipIn, whipOut, ...}` pasado a `Trailer.run` |
| Audio | `audio.js`, `recipes-music.js` | `window.SFX` (WebAudio puro: compresor, reverb, ruido, pads). Música `music:{bpm, anchor, chords, riff, parts:[{from,to,style}]}` con estilos `groove, drive, half, soft, build, hit, tension, house, stutter`; presets `MINOR` (Am-F-C-G) y `RIFF_MINOR` |
| Estados | todo | Todo es función del tiempo: se puede congelar en cualquier segundo |

Contrato de receta: `recipe('nombre', (D, T, o) => duración)`; `T` = inicio de la escena; todo va en `D.tl` en tiempo absoluto. Las recetas "shop" aceptan `fit` (duración final; la escena se acelera o frena para encajar).

## 3. Recetas elegidas de KS (18)
| # | Receta | Archivo | Qué hace | Se usa en |
|---|---|---|---|---|
| 1 | `clickopen` | `recipes-shop.js` | Una pregunta se escribe, el cursor hace click en un botón: anillos, flash y el color inunda el cuadro (4 s) | T1 apertura; click que dispara la apertura del regalo |
| 2 | `remixtitle` | `recipes-shop.js` | La marca golpea con división cromática, fondo que cambia en cada pulso, sello (4 s) | T1 el quiebre ("Tu tienda") |
| 3 | `slam` | `recipes-shop.js` | Una palabra por pulso, a pantalla completa, con corte de color y forma detrás | Frases grandes en T1, T2, T3 |
| 4 | `statpunch` | `recipes-shop.js` | Una cifra por paso: corte de color, la cifra golpea y cuenta; chips y nota de fuente. **Solo cifras reales** | "48 suben", cuotas, puntos del club, pricing |
| 5 | `typewriter` | `recipes-type.js` | Texto escrito con ritmo humano, selecciona una palabra y la vuelve el cuadro siguiente | Apertura de pregunta ("¿tu tienda se parece a las demás?") |
| 6 | `stack` | `recipes-type.js` | Pilas de palabras tipo cartel suizo, justificadas con el eje de ancho variable | T1 cierre de mensaje, T4 capítulos |
| 7 | `rules` | `recipes-type.js` | Puntos numerados con odómetro gigante y barra de progreso | T3: las secciones del panel, una por punto |
| 8 | `ticker` | `recipes-type.js` | Filas inclinadas de una frase, en sentidos alternos, aceleran hasta congelarse | T1 "todas las tiendas dicen lo mismo" |
| 9 | `corrupt` | `recipes-glitch.js` | Palabra descifrada y luego rasgada en tiras, con fantasmas RGB y código de error | T1 el problema (tiendas clonadas) |
| 10 | `datamosh` | `recipes-glitch.js` | Una composición se derrite como un video sin cuadro clave y se reconstruye limpia | T1 paso de "igual a todas" a "diferente" |
| 11 | `uitheme` / `shoptheme` | `recipes-ui.js`, `recipes-shop.js` | Click en el interruptor: la interfaz oscura se abre como un círculo desde el botón | T2 y T3: claro ↔ oscuro |
| 12 | `uiflow` | `recipes-ui.js` | Tarea con guion: click, modal (la cámara se acerca), tipeo, chip, interruptor, barra de progreso | T3: Mostrador (cobro en cuotas), Lista del proveedor |
| 13 | `uinotify` | `recipes-ui.js` | Aparecen avisos apilados, entra una fila nueva, sube un KPI | T2 WhatsApp automático, T3 venta registrada |
| 14 | `uibuild` | `recipes-ui.js` | El panel se arma solo al ritmo: marco, barra lateral, tarjetas, filas; llega el cursor | T3 apertura de "Hoy" |
| 15 | `uiexplode` | `recipes-ui.js` | La app oscura se inclina en 3D y se separa en capas | T3 pase al cierre; T4 puente |
| 16 | `globeship` | `recipes-globe.js:815` | Del planeta a un país, sus puntos se encienden y salen arcos desde un hub a cada destino con contador | T2 el envío (hub Mar del Plata → capitales) |
| 17 | `databars` / `datahero` | `recipes-data.js` | Columnas que crecen desde una base con una resaltada; una cifra enorme en odómetro | T3 "48 suben, 3 bajan", margen por marca |
| 18 | `gate` / `corridor` / `hypertunnel` | `recipes-3d.js` | Portal de luz por el que la cámara atraviesa (Three.js r147, bloom) | Pase de mundo: tienda → panel (T4), "drop" visual |

Suplentes por si una no encaja: `montage` (`recipes.js`, cortes rápidos en el pulso), `flood` (`recipes-liquid.js`, el color sube y cubre), `mesh` (fondo degradado vivo), `uititle` (logotipo + botón al que llega el cursor), `shopfinale` (`recipes-shop.js`, cierre).

## 4. Escenas "wow" ↔ receta o escena propia
| Escena (§7 del prompt) | Resolución | Notas |
|---|---|---|
| Pantallas de carga que se transforman entre fechas | **Propia:** `SplashStage` + `src/demo/engine/splash-scenes.ts` (18 escenas) montadas reales; transición con `whip`/`wipe`/`flash` del motor y cortes `montage` | Cada fecha ya es una pantalla de carga única; mostrar 6–8 en una ráfaga |
| Apertura del regalo (bolsa y locker) | **Propia:** componentes reales de regalos (`gift-opening.ts`, `gift-openings.ts`) + `clickopen` para el click | Estado determinista con fixtures |
| Shaker Rush | **Propia:** componente del juego con **partida automática** (`src/demo/engine/game-autopilot.ts`), reproducida con el tiempo del timeline | El resultado debe ser igual en cada exportación |
| Ruleta disco olímpico | **Propia:** componente real con premio fijado (`wheel-prize.ts`); `gate` para el destello | Sin azar en el trailer |
| Claro / oscuro | `uitheme` / `shoptheme` | Sincronizar el círculo con un drop |
| Mostrador cobrando en cuotas | `uiflow` sobre el Mostrador real + `statpunch` (cuota y recargo) | Datos del fixture, sin inventar |
| Lista del proveedor "48 suben" | Panel real + `databars` + `statpunch` | La cifra sale del cálculo real de la lista de muestra |
| WhatsApp automático de recompra | `uinotify` + **dispositivo 3D nuevo** (celular con el mensaje) + componente real de "A quién escribirle hoy" | El mensaje es el texto real armado por la app |
| Envío viajando por el país | `globeship` (hub Mar del Plata, destinos = ciudades de `data/land.js`) | Es la escena de `ecommerce-remix` que mencionó Ignacio |
| Recorrido del panel | `uibuild` → `uiflow` → `rules` (una sección por punto) | |
| Problema: tiendas clonadas | `ticker` + `corrupt` + `datamosh` | Grilla de tiendas grises genéricas (SVG propios, sin marcas reales) |
| Pase tienda → panel | `gate` o `hypertunnel` | Solo en T4 y T3 |

## 5. Música
Base de KS: `recipes-music.js` (programa notas en el timeline al construir). Se porta la **idea** (patrones por compás y por tramo) y se escribe un hook propio (P0.5).
- Grilla: 128–136 BPM, un compás = 4 tiempos, los cortes caen en el tiempo.
- Estilos a portar: `tension` (aperturas), `build` y `stutter` (antes del drop), `house`/`groove` (drops), `half` y `soft` (pricing tranquilo), `hit` (golpes).
- Presets de KS en La menor (Am-F-C-G) y un riff pentatónico: sirven de punto de partida del hook.
- Todo sintetizado con WebAudio y renderizado sin conexión a WAV (sin licencias).

## 6. Firma Eclipse (EW)
**Línea de tiempo del loader** (`components/loader/`, CSS puro, `constants.ts`; los tiempos en ms desde el inicio):
| t | Qué pasa |
|---|---|
| 0 → 0,45 s | aparece el sol |
| 0,02 → 0,80 s | la luna se desliza sobre el sol (curva `cubic-bezier(.45,0,.25,1)`) |
| 0,38 s | las letras de ECLIPSE suben, una cada 45 ms |
| 0,62 s | se abren el brillo y la corona; 0,66 s sube la frase de cierre |
| 0,74 s | destello "anillo de diamante" |
| 1,18 → 1,79 s | todo se disuelve (cielo, eclipse y marca se desenfocan) |

Capas del eclipse: `glow`, `corona`, `sun`, `moon`, `glint` (`loader.css`, `hero/Eclipse.tsx`: variantes `phase='total'` y `phase='sun'`). La corona del hero es WebGL (`hero/corona/`). Easing: `--ease-expo: cubic-bezier(.16,1,.3,1)`. Amanecer de cierre: `sections/agent/Dawn.tsx` y `SkyTransition.tsx` (halo, rayos, disco, horizonte).

**Interpretación a confirmar con Ignacio en P0.4:**
- **Intro** ("Presenta…", iluminar): secuencia del loader — la luna cruza el sol y la corona se abre con el destello; la marca aparece letra por letra y debajo "Presenta…".
- **Outro** ("cómo se cierra el eclipse"): la secuencia de `SceneLogo` (eclipse + marca + frase), con la luna volviendo a cubrir el sol y la corona apagándose; sin cortes bruscos.

**Tokens** (`eclipse-email-kit/data/brand.json` = `eclipse-web/app/globals.css`): `void #05050a`, `night #0c0c14`, `ash #1a1a24`, `corona #f5b942`, `flare #ffe8b0`, `dawn #f4efe6`, `day #fbf9f6`, `ink #111114`, `mist #9a97a6`, `muted #5b5866`, `deep #8a5a00`, `dim #c9c4bc`, `soft #f3efe8`, `paper #fff`, `hairdark #1f1f28`, `ruledark #34333b`, `hairlight #ddd7cd`, `rulelight #c4beb4`. Fuentes (`app/fonts.ts`): Geist, Instrument (serif display) y Geist Mono. Estética «Efemérides»: marcas de sección en mono, serif display, libros de precios, amanecer al cierre.

## 7. Pricing (EK)
Fuente: `data/offers/prices.v2026-10-16.json` — versión **`2026-10-16.aprobado`**, moneda **USD**.
| Concepto | Valor |
|---|---|
| Adaptación (única) | 500 |
| Pack (único) | 700 |
| Seña | 50 % |
| Plan **Esencial** (mensual) | 30 — presupuesto de terceros 5 — mantenimiento del producto y configuración priorizada |
| Plan **Conectado** | 75 — terceros 15 — una integración estándar, sujeta a factibilidad |
| Plan **Automatización/IA** | 150 — terceros 40 — hasta dos flujos estándar; uno puede usar IA |
| Landing premium adicional | 200 |
| Asesoría growth, marketing y marca | 150 |
| Asesoría de gestión económica | 150 (las dos juntas: 250) |
| WhatsApp estándar (sin IA) | 100 |
| Chatbot IA | 250 |
| Agente de voz con IA | 250 |
| Migración | 100 a 300 |
| Módulo operativo | desde 750 |
| Horas mensuales incluidas / aviso | 2 h / 80 % |

Producto de tiendas (`data/products/volta.json`): hoy se llama "Volta" y **no trae precios**; incluye catálogo de hasta 25 productos, consulta desde cada ficha, club y misiones estándar. **En el trailer se nombra "Tu tienda"** (`check:marca`). Pack de lanzamiento (`launch-pack-draft.json`): **borrador** (3 meses de Esencial con landing incluida, "sujeto a capacidad confirmada de asesoría económica").

**Decisiones de Ignacio (confirmadas):**
1. Intro y cierre de Eclipse: como en §6 (se verifican contra la web publicada y el código de EW en P0.4).
2. **Moneda: pesos como precio principal y el precio en dólares debajo**, a **$1.500 por dólar**. Se calcula del JSON aprobado, no se escribe a mano.
3. Las dos asesorías (growth y gestión económica) **se muestran** como extras.
4. El teléfono **223-446 7881** reemplaza al "contacto pendiente" de EK.
5. Pack de lanzamiento: **pendiente de decisión** (ver el mensaje del paso P0.1).

**Precios en pesos (USD × 1.500), para el bloque final:**
| Concepto | USD | Pesos |
|---|---|---|
| Adaptación | 500 | $ 750.000 |
| Pack | 700 | $ 1.050.000 |
| Plan Esencial / mes | 30 | $ 45.000 |
| Plan Conectado / mes | 75 | $ 112.500 |
| Plan Automatización/IA / mes | 150 | $ 225.000 |
| Landing premium adicional | 200 | $ 300.000 |
| Asesoría growth, marketing y marca | 150 | $ 225.000 |
| Asesoría de gestión económica | 150 | $ 225.000 |
| Las dos asesorías | 250 | $ 375.000 |
| WhatsApp estándar (sin IA) | 100 | $ 150.000 |
| Chatbot IA | 250 | $ 375.000 |
| Agente de voz con IA | 250 | $ 375.000 |
| Migración | 100–300 | $ 150.000–450.000 |
| Módulo operativo (desde) | 750 | $ 1.125.000 |
| Presupuesto de terceros (Esencial / Conectado / IA) | 5 / 15 / 40 | $ 7.500 / 22.500 / 60.000 |

## 8. Qué NO se reutiliza
- `velmar*`, `handy*`, `noir`, `synthwave`, `paper-city` y `bauhaus`: estilos y marcas ajenas.
- Los PNG de `handy-png` y `handy-especialistas-png`.
- La música de los otros trailers: se escribe una firma propia.
