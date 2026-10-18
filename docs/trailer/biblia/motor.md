# Motor del trailer (P0.3)

Cómo está armado y cómo se usa. Las escenas de T1–T4 se escriben sobre esto sin tocar el motor.

## Rutas y parámetros
- `/trailer/<pieza>/` (por ahora `demo`). Fuera de la tienda y del panel; la pantalla de carga no sale ahí.
- `?t=12.5` congela ese segundo · `?ratio=9x16` vertical (por defecto 16:9) · `?export=1` sin controles, quieto, para
  grabar · `?dev=1` muestra la escena en los controles.
- `window.__trailer = { ready, duration, seek(t) }`: `seek` pausa, salta y espera a que se pinte (lo usan el
  exportador y los tests).

## Archivos
| Archivo | Qué hace |
|---|---|
| `src/trailer/core/` | Puro y con tests (`tests/unit/trailer-core.test.ts`): tipos y escenario (`types`), línea de tiempo con validador y `sequence` (`timeline`), parámetros de la URL (`params`), encaje del escenario (`fit`), reloj (`clock`) |
| `src/trailer/engine/gsap.ts` | Único lugar que registra plugins (SplitText, CustomEase) y curvas: `trl.expo` (la de Eclipse), `trl.whip`, `trl.punch` |
| `src/trailer/engine/master.ts` | Arma el timeline maestro pausado: cada escena visible en su tramo + el timeline de su receta |
| `src/trailer/engine/TrailerPlayer.tsx` | Dibuja todas las escenas ocultas, arma el maestro tras `document.fonts.ready` y lo mueve con el reloj en el ticker |
| `src/trailer/engine/Stage.tsx` | Escenario fijo 1920×1080 / 1080×1920 escalado; capas `camara`, `flash` y `grano` (fijo, sin azar) |
| `src/trailer/recipes/` | Recetas (`kit.ts` = paleta desde la ficha de marca, SplitText con máscara, formato de pesos) |
| `src/trailer/pieces/` | Cada trailer como datos (`demo.ts`); `ids.ts` sin GSAP para la ruta |
| `src/trailer/TrailerHost.tsx` + `app/trailer/[pieza]/page.tsx` | Carga el reproductor con `next/dynamic` sin SSR: GSAP queda en su propio chunk (verificado: no lo cargan ni la tienda ni el panel) |

## Contrato de una receta
`defineRecipe({ id, Component, build })`:
- `Component({ props, ratio })`: DOM estático en coordenadas del escenario, con `data-t="…"` en lo que se anima.
  Nada de prefijos responsivos de Tailwind (responden a la ventana, no al escenario).
- `build({ root, q, props, dur, ratio, stage })` devuelve un timeline **relativo** (0 = inicio de la escena):
  - estado de entrada con `set`/`fromTo`; segundo `to` de la misma propiedad con `immediateRender: false`;
  - nada de `delay`, `repeat: -1`, `delayedCall`, tweens sueltos ni `tl.call()` para sonidos;
  - textos que cuentan o se escriben salen del progreso de un tween (`onUpdate`), así el salto da el número correcto;
  - colores solo de `TR`/`TONES` (`kit.ts`), que salen de la ficha de marca.
- Se registra en `src/trailer/recipes/index.ts`.

## Una pieza
`TrailerSpec { id, title, bpm, duration, scenes }`, con `sequence([...])` y duraciones en tiempos (`beats(n)`).
`validateTrailer` exige escenas sin huecos ni encimadas, ids únicos, cortes en la grilla de medio tiempo y que la
última termine justo en `duration`.

## Firma de Eclipse (P0.4)
Carpeta `src/trailer/eclipse/`. Es de quien firma el trailer, no de la tienda: no usa la ficha de marca.
| Archivo | Qué hace |
|---|---|
| `tokens.ts` | Colores de Eclipse (`brand.json` del kit de emails = `globals.css` de eclipse-web), familias y contacto (223-446 7881) |
| `fonts.ts` + `fonts/` | Geist, Instrument Serif (con itálica) y Geist Mono, copiadas de eclipse-web con su licencia OFL; solo las carga `/trailer/` |
| `EclipseMark.tsx` | El eclipse en capas (brillo, corona, sol, luna, destello) y un cielo de estrellas fijas |
| `intro.tsx` (`eclipse-intro`) | "ECLIPSE · Presenta…": la secuencia del loader de eclipse-web en versión cine (~5,6 s) |
| `cta.tsx` (`eclipse-cta`) | La noche se vuelve amanecer: "Probalo *en vivo*.", el link de la demo, "Contactanos" y el teléfono |
| `prices.tsx` (`eclipse-prices`) | Una página del libro de precios: `book` + `section` + número de sección |
| `pricing.ts` + `book.ts` + `data/` | Libro de precios **genérico** (con tests): tarifario aprobado + ofertas del kit, en pesos (dólar a $1.500) con el dólar debajo. Orden: campaña base, pack de lanzamiento, planes, extras. Otro producto = otra entrada en `BOOKS` |
| `outro.tsx` (`eclipse-outro`) | El eclipse se cierra: la luna termina de tapar el sol, destella, se apagan corona y brillo, queda la noche |

Pieza `firma` (`/trailer/firma/`, ~50 s): apertura → escenas de prueba (donde irá cada trailer) → "Probalo en vivo" →
4 páginas de precios → cierre. Es lo que comparten T1–T4.

Aviso en la tienda (`src/features/trailer-invite/`): después de la pantalla de carga, "Tenemos algo para ti…" con
"Ver trailer" (abre la firma) y "No por ahora". Una vez por sesión; la invitación al quiz espera a la página siguiente.
Los tests y los scripts de capturas lo marcan visto (`volta-trailer-invite`). Se saca cuando el trailer esté terminado.

## Estado
- Recetas portadas: `title`, `slam`, `statpunch`, `typewriter`, `themeflip`. El resto de la biblia (§3) se porta
  cuando un storyboard la pide (Tn.3): `uiflow`, `uinotify`, `uibuild`, `uiexplode`, `globeship`, `databars`, `stack`,
  `rules`, `ticker`, `corrupt`, `datamosh`, `gate`, `clickopen`, `remixtitle`, y el **dispositivo 3D** (nuevo).
- Reloj: hoy corre con `performance.now()`. En P0.5 pasa a mandar el audio (`getOutputTimestamp`).
- Movimiento reducido: el trailer no arranca solo; queda en el primer cuadro con "Reproducir".
- Verificado: el mismo segundo da el mismo cuadro llegando por URL, desde el inicio y desde más adelante, en 16:9 y
  9:16 (`tests/e2e/trailer-engine.spec.ts`, hash de píxeles).
