# Plan maestro: trailer comercial de "Tu tienda" (Eclipse)

## Context
Ignacio quiere 4 trailers comerciales (T1 teaser, T2 la compra, T3 el panel del dueño, T4 el largo), más premium que cualquier ecommerce, para venderle el sistema a dueños de tiendas de suplementos. Cada uno sale en MP4, en 16:9 y en 9:16.

El objetivo del plan es que ninguna sesión tenga que **decidir qué hacer**: todo lo decidible se decide una vez, en la pre-fase, y queda escrito en una "biblia". Los pasos siguientes la ejecutan. El razonamiento caro (Opus a fondo) se gasta solo en dirección creativa y música. Lo mecánico va con Sonnet.

El plan reemplaza las secciones "Fases" y "Proceso" de `docs/trailer/PROMPT-trailer-volta.md` (rama `trailer-prompt`). El prompt queda como brief, y el plan pasa a `docs/trailer/PLAN.md`.

## Hechos ya verificados (no re-auditar)
- **kinetic-studio** (`trailers/ecommerce-remix/js/`):
  - Archivos: `engine.js` (escenario de 1920×1080, timeline maestro, `?t=` en `engine.js:176`), `recipes*.js` con el contrato `(D,T,o)=>dur`, `audio.js` (`window.SFX`, WebAudio) y `recipes-music.js` (`music:{bpm,anchor,chords,riff,parts}`).
  - Envíos: la receta `globeship` está en `recipes-globe.js:815`; en el config del trailer se usa así: `trailer.js:165`.
  - Three.js r147 con bloom, en `recipes-3d.js`.
  - **El exportador real (`~/.claude/trailer-kit/tools/export.mjs`) no está en el repo**: hay que escribir uno propio.
- **Eclipse-Web:**
  - Hero en `components/hero/` (`Eclipse.tsx`, `corona/`, `Starfield.tsx`, `useHeroMotion.ts`).
  - Amanecer en `components/sections/SkyTransition.tsx` y `agent/Dawn.tsx`.
  - Tokens en `app/globals.css`: `--void #05050a`, `--corona #f5b942`, `--flare #ffe8b0`, `--dawn #f4efe6`, `--ink #111114`.
  - Fuentes en `app/fonts.ts`: Geist, Instrument y Geist Mono.
- **Eclipse-email-kit:**
  - `prices.v2026-10-16.json` está **aprobado** y en USD:
    - adaptación 500, pack 700, seña 50 %;
    - planes por mes: Esencial 30, Conectado 75, Automatización/IA 150;
    - extras: landing 200, growth 150 y economics 150.
  - `launch-pack-draft.json` es un borrador (3 meses de Esencial con landing incluida). Se muestra solo si Ignacio lo confirma.
- **Esta app:**
  - Sin gsap ni three en `package.json`: hay que agregarlos en el chunk del trailer.
  - Las pantallas de carga son reutilizables: `src/demo/engine/splash-scenes.ts`, `src/components/organisms/splash/SplashStage.tsx` y `src/components/illustrations/splash/kit.tsx`.
- **Skills del repo:** `gsap-trailer-engine`, `creative-direction`, `sound-design`, `trailer-qa`, `ui-inventory`, `component-crops` y `prompt-pack` en `.claude/skills/`, y el agente `.claude/agents/trailer-arquitect.md`.

## Arquitectura decidida (no se vuelve a discutir)
- **Ruta y chunk:** `app/trailer/[pieza]/page.tsx` (`t1`, `t2`, `t3`, `t4`). El trailer va en su propio chunk dinámico, con `?t=`, `?ratio=9x16` y `?export=1` (sin controles).
- **Núcleo puro y testeable** en `src/trailer/core/`:
  - `timeline.ts`: escenas como datos `{id, start, dur, ratio, recipe, props}`;
  - `clock.ts`: el audio manda;
  - `seek.ts`.
- **Recetas** en `src/trailer/recipes/`: portadas a TypeScript de kinetic-studio (tipografía cinética, luces, whip, glitch, `globeship`, bloom 3D). Cada una cumple el contrato `(tl, el, props) => dur`, es determinista y se puede saltar a cualquier punto.
- **Escenas** en `src/trailer/scenes/<pieza>/`, una por archivo de 150 líneas o menos. Montan **componentes reales** de la app con fixtures dentro de un lienzo de 1920×1080 o 1080×1920. Se usan capturas solo para texturas 3D y para cosas con azar o tiempo propio (Shaker Rush).
- **Firma Eclipse compartida** (`src/trailer/eclipse/`):
  - `EclipseIntro`: "Presenta…" y el iluminar;
  - `EclipseOutro`: el eclipse se cierra;
  - `FinalBlock`: "Probalo en vivo", "Contactanos · 223-446 7881" y el pricing con la estética Efemérides.
- **Audio:**
  - `src/trailer/audio/` sintetiza con WebAudio (`OfflineAudioContext`) y pre-renderiza el WAV por pieza en `public/trailer/<pieza>.wav`.
  - En vivo suena el WAV y el timeline lo sigue.
- **Exportador** (`scripts/trailer-export.mjs`):
  1. Playwright con `?export=1&t=`, cuadro a cuadro a 60 fps, guarda un PNG por cuadro;
  2. ffmpeg une los PNG con el WAV y genera `public/trailer/<pieza>-16x9.mp4`, `-9x16.mp4`, `-email.mp4` (720p, menos de 10 MB) y `-poster.jpg`;
  3. un hash de cuadros comprueba que la exportación sea determinista.
- **Página:** botón "Descargar MP4", más `prefers-reduced-motion` (versión con cortes).

## Plan paso a paso
Cada paso es **un PR o commit propio en la rama `trailer`**. Al terminar cada paso hay que **frenar, resumir y recomendar el modelo del paso siguiente**. Las columnas "Entrada" y "Salida" son archivos: cada paso lee solo su entrada y no vuelve a explorar el repo.

### Pre-fase (una sola vez)

| # | Paso | Modelo · esfuerzo | Entrada → Salida | Listo cuando |
|---|---|---|---|---|
| P0.1 | **Biblia de referencias.** Elegir de kinetic-studio las 15–20 recetas útiles: qué hace cada una, su archivo y en qué escena de T1–T3 va. Sumar los tokens y la animación de Eclipse y los precios. | Sonnet · medium | Hechos de arriba → `docs/trailer/biblia/referencias.md` | Cada escena de §7 del prompt tiene receta asignada |
| P0.2 | **Inventario de interfaz y capturas.** Las piezas de la app que aparecen en cada trailer, con `archivo:línea`, estado y fixture; las capturas por componente a 2×, en claro y oscuro. | Sonnet · medium | Prompt §6 → `docs/trailer/biblia/ui.md`, `scripts/trailer-capture.mjs`, `docs/trailer/capturas/` | Cada plano de §6 tiene su componente o captura |
| P0.3 | **Motor.** Núcleo, clock, seek, escenario 16:9 y 9:16, ruta y chunk, ports de las recetas de P0.1, y tests unitarios del núcleo. | Opus · high | Arquitectura decidida y biblia | `?t=` congela igual en tres seeks: el hash coincide |
| P0.4 | **Firma Eclipse.** Intro, outro y `FinalBlock` con pricing, en 16:9 y 9:16. | Opus · high | Eclipse-Web y precios | Ignacio aprueba la captura de la intro, el cierre y el pricing |
| P0.5 | **Firma sonora.** El hook de 4 compases (128–136 BPM), el kit de efectos, el "outro" tranquilo y la mezcla a −14 LUFS. Escribirlo como partitura en `docs/trailer/biblia/musica.md` y en código. | Opus · high | `sound-design` | Ignacio aprueba un WAV de 30 s con el hook, un drop y el outro |
| P0.6 | **Exportador.** Script, botón de descarga y prueba con la intro y el outro. | Sonnet · high | Arquitectura | Sale un MP4 16:9 y uno 9:16 sin cuadros perdidos, con audio sincronizado |
| P0.7 | **Plantillas.** `docs/trailer/plantillas/storyboard.md` (formato de escena, segundo, plano, componente, receta, super, SFX y compás) y `escena.tsx.tpl`. | Sonnet · low | Lo anterior | Con las plantillas, un storyboard se convierte en código sin decidir nada | **Hecho:** [`plantillas/`](plantillas/README.md).

### Por trailer (T1, después T2, después T3)

| # | Paso | Modelo · esfuerzo | Salida | Listo cuando |
|---|---|---|---|---|
| Tn.1 | **Dirección.** Panel de 3 direcciones, juez con rúbrica y storyboard al segundo en la plantilla, con cada escena atada a una receta de la biblia y a un compás. | **Opus · max** (el único max) | `docs/trailer/<pieza>/storyboard.md` | Ignacio lo aprueba |
| Tn.2 | **Música de la pieza.** El arreglo del hook sobre el storyboard (builds, drops en los cortes fuertes) y el WAV. | Sonnet · high | `public/trailer/<pieza>.wav` y el cue sheet | Los drops caen en los cortes del storyboard (±1 cuadro) |
| Tn.3 | **Construcción 16:9.** Escena por escena según el storyboard, en lotes de 3–4 escenas por sesión. | Opus · high (las escenas "wow"); Sonnet · high (las de interfaz con receta existente) | `src/trailer/scenes/<pieza>/` | Cada escena congelada en 3 tiempos coincide con el storyboard |
| Tn.4 | **QA adversarial.** `trailer-qa` con las 6 lentes, más el control de honestidad (nada que la app no haga). Se corrige solo lo bloqueante o alto. | Opus · high | `docs/trailer/<pieza>/qa.md` | Sin bloqueantes; 60 fps en un perfil de gama media |
| Tn.5 | **Versión 9:16.** Re-encuadre con un layout por escena, sobre el mismo timeline y audio. | Sonnet · high | Las escenas con `ratio` | Capturas de 9:16 sin cortes de texto |
| Tn.6 | **Exportación y PR.** Los MP4, el póster, e2e (carga, `?t=` y descarga), CI en verde y el link. | Sonnet · medium | El PR | CI en verde e Ignacio aprueba |

**T4, el largo:** T4.1 es Opus · xhigh. Solo arma el puente narrativo y las transiciones entre bloques, y reusa las escenas de T1 a T3. T4.2 es Sonnet · high (la canción completa con desarrollo). T4.3 es Opus · high, T4.4 Opus · high, y T4.5 y T4.6 Sonnet.

## Por qué ahorra tokens sin perder calidad
- **Decidir una sola vez:** la biblia, la arquitectura y las plantillas se deciden en la pre-fase. Después nadie re-explora repos ni re-discute la arquitectura.
- **Opus a fondo solo donde define la calidad:** dirección creativa (`max`), firma sonora, motor, escenas "wow" y QA. Lo mecánico va con Sonnet: capturas, ports, 9:16, exportar.
- **Contexto chico por sesión:** cada paso lee solo su entrada: storyboard más biblia, sin transcripciones viejas. La construcción va en lotes chicos.
- **Reuso:** la firma Eclipse y el bloque final se hacen una vez y valen para las 4 piezas. T4 reusa T1 a T3. El exportador y las recetas son compartidos.

## Técnicas premium adoptadas (y por qué son baratas en tokens)
- **Timeline como datos:** cada storyboard aprobado se traduce casi directo a código, sin re-razonar.
- **Biblioteca de recetas:** las escenas combinan piezas que ya están probadas, en lugar de animar cada cosa desde cero.
- **Interfaz real montada con React:** queda fiel y nítida a 4K, sin generar ni corregir imágenes.
- **Cámara 2.5D:** escalas, perspectiva y profundidad de campo sobre la interfaz, con Three.js solo para los dispositivos 3D.
- **Shaders de transición** (bloom, glitch y luz de corona): pocos archivos y mucho impacto.
- **Tipografía cinética con máscaras** y animación línea por línea o letra por letra.
- **Sincronía con el pulso:** los cortes caen en los tiempos de la música, sacados de la partitura, sin ajustar a ojo.
- **Audio sintetizado y pre-renderizado sin conexión:** sin licencias y con resultado determinista.
- **Revisión con "cuadros dorados":** en cada escena se miran 3 capturas `?t=` y no el video entero. Eso abarata el QA visual.
- **Exportación cuadro a cuadro:** el MP4 sale perfecto aunque la máquina esté lenta.

## Archivos clave a crear
- `docs/trailer/PLAN.md`: este plan. Además, se actualizan las secciones 0 y 8 de `PROMPT-trailer-volta.md` para que remitan acá.
- `docs/trailer/biblia/{referencias,ui,musica}.md` y `docs/trailer/plantillas/`.
- `src/trailer/{core,recipes,scenes,eclipse,audio}/` y `app/trailer/[pieza]/page.tsx`.
- `scripts/trailer-capture.mjs` y `scripts/trailer-export.mjs`.
- Dependencias: `gsap` y `three`, cargadas solo en el chunk del trailer.

## Verificación
- **Núcleo:** unitarios de timeline, clock y seek (`vitest`).
- **Determinismo:** el hash del mismo cuadro tiene que dar igual por tres caminos distintos.
- **e2e:** `tests/e2e/trailer.spec.ts`. La ruta carga, `?t=` congela, el botón descarga el MP4 y `prefers-reduced-motion` muestra la versión con cortes.
- **MP4:** `ffprobe` para duración, 60 fps y audio presente. La versión email pesa menos de 10 MB.
- **Reglas del repo:** `npm run check:marca` ("Tu tienda", nunca VOLTA), lint, tipos y build con `PAGES_BASE_PATH`.
- **Aprobaciones de Ignacio en cuatro puntos:** la intro y el pricing, el WAV del hook, cada storyboard, y cada PR final.

## Pendientes antes de ejecutar
- Verificar en P0.6 que ffmpeg está disponible en el contenedor. Si no, usar `@ffmpeg-installer/ffmpeg` como dependencia de desarrollo.
- Pricing: mostrar el pack de lanzamiento (borrador) solo si Ignacio lo confirma en P0.4.
