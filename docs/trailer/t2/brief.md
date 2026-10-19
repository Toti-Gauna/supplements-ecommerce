# T2 · Brief para la dirección creativa ("La experiencia de compra")

Lo leen los tres directores y el juez. Fuente de verdad: `docs/trailer/PROMPT-trailer-volta.md` (§0 a §7), `docs/trailer/PLAN.md` y este archivo.

## 1. Qué es
- **Pieza 2 del plan:** "La experiencia de compra", del lado del **cliente final** de la tienda ("Tu tienda", suplementos y deporte).
- **Quién firma:** Eclipse (desarrollo, IA y automatización). Se vende a **dueños de tiendas de suplementos**: el mensaje es que Eclipse entrega
  una experiencia de compra que no tiene ninguna otra tienda, más asesoría de growth marketing y fidelización.
- **Dónde se ve:** `/trailer/t2/` (16:9 y 9:16, `?ratio=9x16`), MP4 para redes y email (se ve **mudo** muchas veces: el relato tiene que viajar
  en pantalla) y con música (la misma firma sonora que T1 y la firma).
- **Duración:** entre **75 y 100 s**, en la grilla de la música (128 BPM, un tiempo = 0,46875 s, un compás = 4 tiempos; cortes en el tiempo 1).
  Proponé la duración exacta y justificala.
- **Tono:** premium y contenido (Apple, Linear, Anthropic), no un video de "features". Cada plano muestra la app **real** con una idea por plano.

## 2. Lo que T2 tiene que contar (de `PROMPT-trailer-volta.md` §6 y §7)
1. **Inicio y temáticas:** las **pantallas de carga únicas por fecha** que se transforman una en otra (protagonista; hay 12 fechas y días del deporte).
2. **Comprar:** búsqueda tolerante a errores de tipeo, ficha con foto que cambia con el sabor, comparador, **Armá tu stack** y **Quiz**, **packs mensuales**.
3. **Checkout en 3 pasos** y **seguimiento del envío**: el pedido viaja por el país hasta la puerta en Mar del Plata y muestra el lote.
4. **Modo claro y oscuro** como golpe visual, sincronizado con un drop.
5. **Fidelidad con gamificación:** Club (niveles y puntos), misiones, **ruleta disco olímpico**, **Shaker Rush** unos segundos, cupones y recordatorios.
6. **Regalos:** gift card con monto, sabor abierto, apertura de la **bolsa de boxeo** y del **locker** con su revelación.
7. **WhatsApp de recompra (protagonista):** al cliente se le termina el pack, le llega el mensaje con el link y la tienda se abre **con el bolso ya cargado**.
   **Ojo con la honestidad:** averiguá en el código qué hace de verdad la demo (el panel arma el mensaje y el link de recompra; no hay envío real) y
   proponé una redacción que no prometa lo que la app no hace.
8. **Cierre:** "Probalo en vivo", contacto (223-446 7881) y pricing, y el eclipse que se cierra. Ya existen las recetas `eclipse-cta`, `eclipse-prices`
   (libro de precios genérico, pesos con el dólar debajo, dólar a $ 1.500) y `eclipse-outro`; no se rediseñan, se encadenan.
   El pack de lanzamiento (borrador) se muestra con "sujeto a disponibilidad" por decisión de Ignacio.
No entran todas las cosas con la misma duración: elegí qué es protagonista, qué es ráfaga y qué se corta. Justificalo.

## 3. Material y reglas que ya están decididos (no se discuten)
- **Marca en pantalla:** siempre "Tu tienda" (ficha `tutienda`); nunca "VOLTA". Eclipse con sus tokens (`src/trailer/eclipse/tokens.ts`). Pedidos `TUT-000123`.
- **Datos:** pesos enteros; ninguna cifra inventada: todo número, nombre y texto sale de la app (fixtures y engine) o del libro de precios. Nombres de personas: los de los fixtures.
- **Fidelidad:** nada que la app no haga. Distinguí en cada plano qué es real, qué es maqueta y qué es condicional (`docs/trailer/biblia/ui.md` lo detalla).
- **Sin dependencias nuevas** (no hay three.js; los equipos 3D son CSS 3D) y sin Server Actions. Todo corre como DOM + GSAP + SVG, con un solo canvas posible (Shaker Rush).
- **Grilla suiza** (`src/trailer/core/grid.ts`): 16:9 de 12 columnas × 6 filas; 9:16 de 6 × 12. Trazo de 1 px (2 en el escenario). Dos acentos: volt (la tienda) y corona (Eclipse).
- **Reglas de T1 que se mantienen:** máximo dos movimientos simultáneos; un super a la vez (≤ 6 palabras, ≥ 1 s en pantalla); silencio real antes de cada drop;
  una familia de curvas (`trl.expo`, `trl.rampa`, `trl.whip`, `trl.punch`; ver `src/trailer/engine/gsap.ts`); llegadas que terminan en un golpe usan `trl.rampa`;
  el super nunca tapa el componente; movimiento reducido diseñado (láminas con el estado final).
- **Accesibilidad (lecciones del QA de T1, `docs/trailer/t1/qa.md`):** nada que cambie de luminancia más de 3 veces por segundo en un área grande (sobre todo giros y cortes
  rápidos); contraste AA en supers y letra chica; el escenario es imagen y el resumen para lectores de pantalla se arma con los textos de las escenas.
- **Presupuesto (storyboard de T1 §9):** hasta 12 capas compuestas por escena; un solo canvas; CSS 3D solo en 2 o 3 escenas; sin `backdrop-filter`; placas JPEG ≤ 2880 px.
- **9:16:** misma línea de tiempo y misma música; el layout cambia por escena (placas de celular a todo el ancho, supers en el tercio superior, cifras en dos renglones).

## 4. Lo que ya existe y se puede reutilizar (lista en `docs/trailer/biblia/motor.md` y `src/trailer/recipes/`)
- Motor: línea de tiempo maestra y determinista, reloj de audio, `css-clock` (anima las animaciones CSS reales de la app con el reloj del trailer), exportador a MP4 a 60 fps.
- Recetas de T1: `splash-live` (pantalla de carga real por fecha), `gift-live` (bolsa real), `wheel-live` (ruleta real), `shaker-replay` (Shaker Rush con piloto automático y semilla),
  `plate` (pantallas reales como placas con trazos y cifras que se despegan), `device`/`rules` (equipos CSS 3D y el "+"), `stack`, `clones`, `ticker`, `trace`,
  `eclipse-intro`, `eclipse-cta`, `eclipse-prices`, `eclipse-guino`, `eclipse-outro`.
- Placas: `scripts/trailer-plates.mjs` captura pantallas reales de la app (build con `NEXT_PUBLIC_BRAND=tutienda`) con cajas medidas; `scripts/trailer-capture.mjs` y
  `docs/trailer/capturas/` tienen 31 piezas de la tienda y 34 del panel ya capturadas a 2× en 1440 y 390, claro y oscuro.
- Lo que **no** existe y habría que construir se marca como **prerrequisito** (p. ej. un recorrido del envío por el país: va en SVG/CSS, no en three.js).

## 5. Qué entrega cada director
Un archivo `docs/trailer/t2/direcciones/<angulo>.md` (≤ 160 líneas, español rioplatense) con: idea y hilo conductor, duración y estructura en tiempos (tabla de escenas con
id, inicio y fin en tiempos y segundos, receta o pieza real, super o rótulo y cue), el detalle de las 3 o 4 escenas más importantes con coordenadas del escenario, transiciones
firma, música y silencios (tramos, drops), qué es real/maqueta de cada plano, riesgos (60 fps, honestidad, accesibilidad) y prerrequisitos en el código.
No escribas código ni toques otros archivos. Verificá en el código cada texto y dato antes de proponerlo (`src/demo/fixtures`, `src/demo/engine`, componentes).
