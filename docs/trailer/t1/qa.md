# T1 · QA adversarial (T1.4)

Revisión de `/trailer/t1/` (16:9) con la skill `trailer-qa`.

**Proceso:**
- Seis revisores independientes, uno por lente, y después dos verificadores que intentaron refutar cada hallazgo alto o bloqueante.
- Se corrigieron solo los altos que sobrevivieron a la verificación. Lo medio y bajo queda listado para que Ignacio decida.
- La severidad de cada fila es la final, después de la verificación.
- Las evidencias (scripts, cuadros, trazas) quedaron en la carpeta de trabajo de la sesión y no se versionan.

**Estados:** `corregido`, `pendiente` (medio o bajo, a decidir), `refutado`, `gusto` (pide cambiar el storyboard aprobado), `T1.5`/`T1.6` (lo resuelve ese paso).

## Corregido en este paso

| # | Hallazgo | Sev. | Evidencia | Cambio |
|---|---|---|---|---|
| 1 | **Destellos en la ruleta** (WCAG 2.3.1, nivel A). Entre 20,4 y 21,9 s, los gajos amarillos contra azules y rojos pasaban por cada punto unas 20 veces por segundo, y el peor campo de 640 × 360 llegaba a 51,8 % del área marcada (umbral: 25 %). | alto | Medición de campo local a 60 fps sobre 4,5 s | Velo de desenfoque de movimiento del color promedio de los discos al 90 % mientras el disco gira rápido; se va desde la última frontera (`recipes/wheel-live.tsx`). Después: peor campo **7,1 %**, ninguna ventana sobre el umbral. |
| 2 | **Sin alternativa textual.** El escenario se exponía a los lectores de pantalla ("20 % OFF" unas 100 veces, los dígitos del splash) y no había resumen de la pieza (WCAG 1.2.1). | alto | `ariaSnapshot` y axe | Escenario `aria-hidden` (`engine/Stage.tsx`) y resumen `sr-only` (`TrailerSpec.summary`). El resumen de T1 se arma con los mismos datos de las escenas y del libro de precios (`pieces/t1-resumen.ts`). Tiene test unitario y e2e. |
| 3 | **Escena 15: el celular quedaba cortado por el borde izquierdo** durante todo el sostenido. El par se corría −790 px dentro de una perspectiva fija en x = 1240 y se veía en oblicuo. | alto | Cuadros 61, 63,9 | El achique y el corrimiento van en un envoltorio 2D (`[data-t="shift"]`), fuera de la perspectiva (`recipes/device.tsx`, `rules.tsx`). El celular entra completo desde la columna 1. |

## Lente 1 · Correctitud y ciclo de vida

Reproducción en vivo de punta a punta, sin errores de consola, con limpieza al desmontar, con storage roto y con `?t` inválidos: todo bien.

| Hallazgo | Sev. | Estado |
|---|---|---|
| Si el cursor cae **exactamente** en el inicio de una escena, GSAP no aplica sus `set` de tiempo 0. Efectos: el **cuadro 675 del MP4** (11,25 s) sale con el estado previo de `plano` durante 16,7 ms; `?t=0` y `?t=40.313` dan negro. Arreglo verificado sobre los 2700 cuadros: un pre-recorrido del maestro tras armarlo (`master.progress(1, true).progress(0, true)`), que solo cambia los cuadros 0 y 675 y además resuelve el punto de rendimiento de la "primera pasada". | medio | pendiente: **recomendado antes de exportar (T1.6)** |
| Con movimiento reducido, `eclipse-intro`, `eclipse-cta` y `eclipse-outro` se animan completos (no leen `reduced`). | medio | pendiente (receta compartida con la firma) |
| Falta `public/trailer/t1.m4a`: "Reproducir con sonido" tarda 25–50 s mientras se sintetiza la pista (en el hilo de audio, no en el principal). | medio | T1.6 (`trailer-export.mjs t1 --only audio`) |
| La pestaña dice "Trailer · Volta" (plantilla de título del layout). No aparece en el escenario ni en el MP4. Arreglo: `title: { absolute: "Trailer · Tu tienda" }`. | bajo | pendiente |
| Con `?reduced=1` (no con la preferencia del sistema), `w1-carga` muestra el contador sin resolver. | bajo | pendiente |
| HEAD a los MP4 que todavía no existen: 2 o 3 `console.error` 404. | bajo | T1.6 |
| 0,25 ms con dos escenas visibles en 17,344 y 20,625 (redondeo de `sequence`). No cae en ningún cuadro a 60 fps. | bajo | pendiente |

## Lente 2 · Rendimiento

El headless de este ambiente compone por software (SwiftShader): los fps absolutos no sirven para medir "60 fps en gama media", que **hay que comprobar en un equipo real**. Bundle de la tienda limpio (gsap y el trailer solo en su chunk, 61 KB gz) y ningún audio en la tienda.

| Hallazgo | Sev. | Estado |
|---|---|---|
| Equipos 3D: 8 capas de extrusión por equipo, unas 30 capas compuestas. Con 2–3 capas casi se duplican los fps en este ambiente, pero con 0 la escena sigue siendo 3–4 veces más lenta: el grueso es la perspectiva con pantallas grandes. | medio | pendiente: medir en hardware real; opcional, 4 caras laterales en vez de capas |
| Primera pasada: unas 900 lecturas de estilo forzadas cuando arrancan las animaciones. El impacto en fps (alrededor de 1 fps) quedó dentro del ruido al verificarlo. Lo resuelve el mismo pre-recorrido de la lente 1. | medio | pendiente (ídem lente 1) |
| La barra de control escribe `value` y `textContent` en cada cuadro: layout de todo el documento y `backdrop-blur` sobre contenido animado. | medio | pendiente |
| Regalo: cada golpe cambia `visibility` en las 7 bolsas SVG y las vuelve a maquetar (unos 29 ms a CPU 4×). | medio | pendiente |
| Shaker: el HUD escribe texto aunque no cambie; ticker con filas de 10.400 px; `filter: blur` en la salida de la apertura. | bajo | pendiente |

## Lente 3 · Accesibilidad

Nada suena sin pedirlo, el foco es visible y el contraste de los supers, de la letra chica del guiño (6,05:1) y de los rótulos pasa AA. Los destellos y la alternativa textual quedaron corregidos (arriba).

| Hallazgo | Sev. | Estado |
|---|---|---|
| Puerta de sonido sin `role="dialog"`/`aria-modal`. El `autoFocus` cae en un botón deshabilitado y el foco queda en `BODY`; con Tab se llega antes a los controles de atrás, que reproducen detrás de la puerta. Esc no hace nada. | medio | pendiente |
| El foco cae a `BODY` al cerrar la puerta; no hay atajos (Espacio/K). | medio | pendiente |
| Contraste de "WhatsApp o llamada · Eclipse" en la cta: de 3,65 a 4,5:1 sobre el amanecer. | medio | pendiente (firma) |
| Contraste del "5%" ganador de la ruleta: 2,61:1 (componente real de la app, `WheelDisc`). | medio | pendiente (app) |
| La letra chica del guiño está a opacidad plena unos 0,8 s antes de que caiga la noche; "3 bajan · 2 sin coincidencia" se ve 0,9 s. | medio | pendiente |
| Control de recorrido sin `aria-valuetext`; "Saltar al contenido" apunta a `#contenido`, que no existe en esta página. | bajo | pendiente |

## Lente 4 · Fidelidad y honestidad

**Cada afirmación en pantalla corresponde a algo que la app hace y cada cifra coincide hoy con la app en vivo:**
- cuotas: $ 40.892, $ 122.676 y recargo del 12 %;
- proveedor: 48 suben, 3 bajan, 2 sin coincidencia;
- placas: $ 54.900, $ 171.150, 08;
- descuentos de las fechas;
- textos de la bolsa;
- partida de 855 puntos con semilla;
- precios del guiño, contra el tarifario aprobado.

No aparece "VOLTA" en ningún cuadro ni en las placas.

| Hallazgo | Sev. | Estado |
|---|---|---|
| "El pack de lanzamiento en borrador está publicado en la firma". Hay una decisión documentada de Ignacio (`biblia/referencias.md:120`, commit `091fa99`): se muestran las dos ofertas, con "sujeto a disponibilidad". T1 no lo muestra. | — | refutado |
| Las cifras de cuotas y del proveedor están escritas a mano en `t1.ts` y el e2e compara contra el mismo literal. Derivarlas en la pieza no conviene: la placa es una captura fija. Arreglo: un test que las compare con el engine y avise si hay que volver a sacar las placas. | bajo | pendiente |
| El guiño no dice que el plan Esencial sigue pago desde el mes 4. | medio | **decisión de Ignacio** |
| "+ Asesoría de growth marketing y fidelización" sin "inicial" (el guiño sí lo aclara). | bajo | decisión de Ignacio |
| La cta lleva a la demo publicada, que se ve con la marca VOLTA (el build de Pages no define `NEXT_PUBLIC_BRAND`). | medio | **decisión de Ignacio** |
| En las placas del panel con la marca `tutienda`, el logo de la barra lateral queda como un cuadrado volt vacío (bug de la app con esa marca). | bajo | pendiente (app) |
| Promesa: toda la línea "VENDA MÁS." va en volt; escenas-2 pide solo "MÁS.". | bajo | pendiente |

## Lente 5 · Nivel premium

**Cortes limpios en 12, 16, 20, 24, 28, 44, 48, 52, 64 y 67,5.** Los cinco silencios son reales (−180 dBFS) y los supers tienen 6 palabras o menos y duran 1 s o más.

| Hallazgo | Sev. | Estado |
|---|---|---|
| La cta arranca casi vacía, va en segundos fuera de la grilla y queda quieta 2,6 s. | — | gusto (escenas-2: "la receta va tal cual"; cambiarla cambia la firma) |
| Llegadas con `trl.expo` que aterrizan antes del golpe: "3 cuotas" unos 8 cuadros antes de 49; el círculo del tema cubre la pantalla en 6 cuadros. | bajo | decisión de Ignacio (el storyboard pide expo; `trl.rampa` llegaría en el golpe) |
| DROP 2: los cuerpos de los equipos y el canto volt de la base ya están enteros en el cuadro 0 (solo se traza el contorno). | medio | pendiente |
| La corona de la escena 15 sube centrada en x = 960, no detrás de los equipos (x ≈ 450). | medio | pendiente |
| La base de la notebook se sale del cuadro por la derecha; el celular tapa el "HOY". | bajo | gusto/pendiente (el storyboard fija la composición) |
| DROP 1 (32) casi no se ve en imagen; pausas quietas en "3 cuotas" y "48 suben"; empalmes 16→17, 17→18 y 18→19 (cambio de color de la noche, el texto de la cta que desaparece, fundido a gris). | medio | gusto: mejoras propuestas con tiempos y curvas en el informe de la lente |
| Hay `power*`/`sine*` sueltas fuera de la familia `trl.*`; `trl.whip` no se usa. | medio | pendiente |
| Audio: todos los ataques llegan de 12,5 a 14 ms tarde (menos de 1 cuadro). | bajo | T1.6 (verificar `start_time` del MP4) |

## Lente 6 · Consistencia con el repo

`tsc`, eslint y vitest limpios. Ningún archivo nuevo pasa de 150 líneas. No hay `delay`, `repeat: -1`, `tl.call` ni `Math.random` en el trailer.

| Hallazgo | Sev. | Estado |
|---|---|---|
| Dos celulares 3D (el de `shaker-replay` y el de `device-kit`). Al verificar: los dos usan `#121416` y filo volt de 1 px, y los tamaños los pide el storyboard. | bajo | refutado como defecto; mantenimiento opcional |
| El cue sheet copia los tiempos de `gift-live` y `wheel-live`: hoy coinciden; falta un test que lo ate. | bajo | pendiente |
| El test "usa recetas registradas" compara contra una lista escrita a mano, no contra `RECIPES`. | medio | pendiente |
| La marca de la tienda (`tutienda`) está importada en 4 recetas y `TR` sale de la marca del build: dos criterios. | medio | pendiente |
| Hex sueltos fuera de `TR`/`TPL`/`EC` (`device-kit`, `gift-live`, `eclipse/sky.tsx`). | medio | pendiente |
| Docs desactualizadas: `motor.md` (estado, firma de `build`), `PLAN.md` (`scenes/`, Three.js, `trailer.spec.ts`), plantillas (circuito de capturas), README; loudness −1 o −2 dBTP. | medio | pendiente |
| `gsap` y `@gsap/react` con `^` en `package.json`; `@gsap/react` no se usa. | medio | pendiente |
| `plate` y `device` atados a la carpeta `shots/t1/`: T2 a T4 no los pueden reusar sin tocar el código. | medio | pendiente (T2) |
| Exports y props sin uso, comentario huérfano en `WheelHub.tsx`, `ratio` mal tipado en `stack.tsx`, comentarios con números viejos. | bajo | pendiente |

## Verificación final (salida real)

- **`npx tsc --noEmit -p .`:** sin errores.
- **`npm run lint`** (`eslint .`): sin errores.
- **`npx vitest run`:** `Test Files 117 passed (117) · Tests 1000 passed (1000)`.
- **`npm run check:marca`:** `Tests 38 passed (38)`.
- **`PAGES_BASE_PATH=/supplements-ecommerce npm run build`:** OK.
- **e2e** (`trailer-t1`, `trailer-engine` y `trailer-invite`, proyecto `mobile`, con movimiento completo): `15 passed`.
- **Destellos de la ruleta, medidos de nuevo:** peor campo 7,1 % (umbral 25 %); 0 ventanas sobre el umbral.
