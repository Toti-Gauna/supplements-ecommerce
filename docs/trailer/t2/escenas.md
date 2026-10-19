# T2 · Escena por escena (16:9), escenas 1 a 12

**Convenciones:**
- Tiempos absolutos en **tiempos** desde 0 (1 tiempo = 0,46875 s); segundos entre paréntesis cuando ayudan.
- Coordenadas en el escenario de 1920 × 1080 con la grilla de `core/grid.ts` (columna *k*: x = 96 + (k−1)·146, ancho 122; fila *r*: y = 60 + (r−1)·164, alto 140).
- "Cue" es `t · voz · nota · ganancia` (nota en MIDI). Lo que ya toca el estilo no se repite (ver `sonido.md`).
- `B` = un tiempo en segundos (lo da `SceneCtx.beat`). Placas: ids de `escenas-2.md` §Placas; "caja" = caja medida en `t2-plates.json`.
- Super estándar: display de la tienda, mayúsculas, columnas 1–8, línea base y = 1000, sobre el degradé del pie; entra con máscara por letra
  (¼ de tiempo, `trl.expo`) y sale hacia arriba (0,3 s, `power3.in`) justo antes de su fin.

## 1 · `apertura` · 0–12 · `eclipse-intro`
- Sin cambios. La subida de `tension` corta seco en 11,5 y hay medio tiempo de silencio real.
- **Salida en 12:** corte seco al negro con grilla; el primer sonido es el dron de `clon` (sin golpe: el golpe se guarda para el DROP 1).

## 2 · `madre` · 12–20 · `splash-chain` `part: "hero"`
- **Objetivo:** una pantalla de carga real, la de hoy (Día de la Madre está activo el 5/10, `themes.ts:11`), y la idea de "una por fecha".
- **Composición:** fondo `TR.night`, grilla volt al 14 %. Marco `FRAME` (x 680, y 111, 1144 × 858; columnas 5–12) con filo volt de 2 px.
  Adentro, como `splash-live`: rayo de 52 px + "TU TIENDA" 46 px arriba y `SplashStage` `dia-de-la-madre` de 891 × 668 centrada.
  **Eje del año:** línea volt de 2 px en y = 1000, de x 96 (1/10/2026) a 1824 (30/9/2027); x = 96 + 1728·d/364 (d = días desde el 1/10).
  17 marcas de 2 × 24 px centradas en el eje (tabla en §3). Cabezal: triángulo volt de 12 px sobre la marca activa. Rótulo mono 22,
  tracking 0,12 em, `TR.muted`, debajo del eje (y 1018–1042), alineado a la marca (con tope a la derecha en x 1600).
- **Coreografía:**
  - 12,0–12,5 se traza el eje (`scaleX` 0 → 1 desde la izquierda, `trl.expo`).
  - 12,5–13,0 aparecen las 17 marcas en orden (`set` de `autoAlpha` cada 1/17 de ½ tiempo); las futuras quedan al 35 %.
  - 13,0–13,5 se traza el marco en dos tramos a la vez (arriba + derecha, abajo + izquierda; `strokeDashoffset`, `power2.inOut`).
  - 13,5 la pantalla se prende (`autoAlpha` ¼ de tiempo). Cabezal y rótulo "1 OCT · DÍA DE LA MADRE".
  - **Reloj CSS** (`css-clock`, ms): 13,5 → 0 · 14 → 260 · 15 → 440 · 16 → 701 · 17 → 962 · 18 → 1750 (lineal entre puntos) y quieto en 1750 hasta 20.
    Así los tres latidos de `dm-beat` (20, 49 y 78 % de 900 ms + 260, `dia-de-la-madre.css:19,31`) caen en 15, 16 y 17, y el frasco llega lleno en 18; de 18 a 20 la fecha queda en su clímax.
  - Cámara: el marco empuja 1,00 → 1,02 (14–20, `sine.out`).
- **Super:** "Una pantalla de carga por fecha." en display de 96 px, tres renglones ("UNA PANTALLA" / "DE CARGA" / "POR FECHA.", el último en volt),
  columnas 1–4 (x 96–656), desde y = 388. Entra en 13,0, sale en 19,75. Es la excepción al super estándar: el marco ocupa el resto.
- **Cues:** 12 · `tick` · 69 · 0,3 (eje) · 13 · `tick` · 76 · 0,25 (marco) · 15, 16, 17 · `sub` · 33 · 0,6 (los latidos).

## 3 · `fechas` · 20–36 · `splash-chain` `part: "chain"`
- **Objetivo:** "otra tienda en cada fecha", en orden de calendario, sin que nadie lo explique.
- **Mecánica por tiempo *b* (de 20 a 35):**
  - **Barrido:** una raya volt de 2 × 858 px cruza el marco de x 680 a 1824 en ¼ de tiempo (`translateX`, `trl.whip`). La fecha entrante
    está encima con `clip-path: inset(0 X 0 0)` atado al mismo progreso (es la única excepción de recorte de la pieza; uno a la vez).
    En *b* + ¼ la saliente queda oculta (`autoAlpha: 0`).
  - **Reloj de la entrante:** ms 1100 en *b* → 1750 en *b* + ¾ (`none`), quieta en 1750 hasta *b* + 1: termina de transformarse y queda en
    su clímax estable (1650–1850 ms) justo cuando entra la siguiente.
  - **Eje:** el cabezal salta a la marca siguiente en ½ tiempo (`trl.expo`; la distancia es la del calendario real: Año Nuevo → San Valentín salta 176 px);
    la marca pasa de 35 % a 100 %; el rótulo cambia con `set` en *b*.
- **Fechas** (tiempo · rótulo · x de la marca), de `themes.ts:11-30`:

| *b* | Rótulo | x | *b* | Rótulo | x |
|---|---|---|---|---|---|
| 20 | 19 OCT · HALLOWEEN | 181 | 28 | 3 ABR · DÍA DE LA ACTIVIDAD FÍSICA | 969 |
| 21 | 2 NOV · CYBERMONDAY | 248 | 29 | 10 MAY · HOT SALE | 1145 |
| 22 | 23 NOV · BLACK FRIDAY | 348 | 30 | 31 MAY · DÍA DEL RUNNING | 1245 |
| 23 | 1 DIC · NAVIDAD | 386 | 31 | 6 JUN · DÍA DEL PADRE | 1273 |
| 24 | 26 DIC · AÑO NUEVO | 504 | 32 | 21 JUN · DÍA DEL FUTBOLISTA | 1345 |
| 25 | 1 FEB · SAN VALENTÍN | 680 | 33 | 13 JUL · DÍA DEL AMIGO | 1449 |
| 26 | 18 FEB · CROSSFIT OPEN | 761 | 34 | 11 SEP · DÍA DEL BOXEADOR | 1734 |
| 27 | 9 MAR · VUELTA AL GYM | 851 | 35 | 16 SEP · OPERACIÓN VERANO | 1758 |

  (Día de la Madre está en x 96.) Los nombres son los de `seasonalThemes[].name`, en mayúsculas.
- **Cámara:** el marco empuja 1,02 → 1,05 (20–36, `trl.rampa`, llega al 94 % en 35,5).
- **Ritmo y destellos:** un barrido por tiempo (2,13 por segundo). Cada punto del marco cambia una vez por tiempo. Se mide a 60 fps.
- **Super:** ninguno; el texto es el rótulo del eje.
- **Cues:** ninguno aparte: cada barrido es una nota del estilo `campanas` (ver `sonido.md`).

## 4 · `diecisiete` · 36–40 · `splash-chain` `part: "sheet"`
- **36,0:** el marco (con Operación verano en su clímax) se achica a su celda de la hoja, la última: escala 0,234 hacia (1556, 570), ½ tiempo, `trl.expo`.
- **36,5:** aparece la **hoja de 18** (atlas: la original + las 17 fechas en su clímax, a 1750 ms): 6 × 3 celdas de 268 × 201 en
  x = 96 + k·292 (k = 0…5), y = 120 / 345 / 570 (ocupa x 96–1824, y 120–771). Fundido de la imagen en ¼ de tiempo. Debajo de la
  primera celda, mono 18 "ORIGINAL". El marco vivo se oculta en 36,75 (la celda del atlas lo reemplaza).
- **37,0–37,5:** el eje se llena: una línea volt encima del eje va de x 96 a 1824 (`scaleX`, `trl.expo`) y deja las 17 marcas al 100 %.
- **Super:** "17 fechas. Ninguna igual." en display de 110 px, una línea, columna 1, línea base y = 900 ("NINGUNA IGUAL." en volt). 37,0–39,5.
- **39,5–40:** cuadro quieto, silencio real.
- **Cues:** 36 · `whoosh` · — · 0,3 (½ tiempo) · 37 · `tick` · 81 · 0,3. La subida (36,5–39,5) es del estilo `tension`.

## 5 · `buscar` · 40–44 · `plate` `mode: "pasos"` — **DROP 1**
- **40,0:** corte a claro, placa `buscar-vacio-light`. Rótulo claro "02 · Encuentra aunque escribas mal" (raya en ¼ de tiempo). Aparece `Carga` (2 celdas, colores de modo claro).
- **40,0–41,5:** se escribe "creatna" en el campo (caja `input`): 7 letras cada ¼ de tiempo (40,0 … 41,5), sans de la tienda al alto de la caja,
  cursor de 2 px. El texto sale del progreso del tween (`onUpdate`), no de `set` sueltos.
- **41,5:** corte (`set`) a la placa `buscar-typo-light`: los 4 resultados.
- **42,0 · 42,5 · 43,0 · 43,5:** trazo `voltInk` de 2 px alrededor de cada resultado (cajas `r1`…`r4`, ¼ de tiempo, `trl.expo`); el anterior
  se apaga. Queda trazado el 4.º: **Mass Gainer 3 kg** (la siembra de la recompra).
- **43,0–44,0:** cámara 1,00 → 1,04 hacia `r4` (`trl.rampa`).
- **Cues:** 40 · `click` · — · 0,5 · letras 40,0–41,5 · `tick` · 93 · 0,18 (7) · 41,5 · `click` · — · 0,45 · 42,5 · `tick` · 84 · 0,25.
  Los trazos de 42, 43 y 43,5 caen en La, Sol y Mi del estribillo.

## 6 · `sabor` · 44–48 · `plate` `pasos`
- **Placas:** `ficha-mg-chocolate-light` (44), `ficha-mg-banana-light` (45), `ficha-mg-dulce-light` (46): la ficha de Mass Gainer 3 kg con la
  ilustración teñida por el sabor (`SpecGallery` con `tint`, `ProductDetail.tsx:88`) y el sello "Imagen ilustrativa".
- **44, 45, 46:** corte de placa + anillo de 2 px sobre la placa de sabor elegida (caja `flavor`, ⅛ de tiempo). Caen en Do, La y Sol.
- **46–48:** cámara 1,00 → 1,05 sobre la ilustración (caja `hero`, `trl.rampa`); queda en **Dulce de leche** (el sabor de Nicolás).
- **47:** trazo alrededor de "Imagen ilustrativa" (caja `illus`, ¼ de tiempo): la honestidad también se ve.
- **Rótulo:** "03 · La imagen cambia con el sabor". `Carga`: 3 celdas en 44.
- **Destellos:** el cambio de tinte ocupa ≈ 30 % del cuadro, 1 por tiempo.
- **Cues:** 47 · `tick` · 88 · 0,2.

## 7 · `comparar` · 48–52 · `plate` `pasos`
- **48,0:** placa `comparar-light` (Ionic Whey 100 % contra Proteína vegana, `comparar/?p=ionic-whey,proteina-vegana`). `Carga`: 4.
- **48 · 49 · 50 · 51:** trazo de 2 px en cada celda `[data-best=true]` (cajas `best1`…`best4`, ¼ de tiempo, quedan): Mi, Mi, La, Do.
- **Rótulo:** "04 · Compará lado a lado". **Cues:** ninguno aparte (las notas son del estribillo).

## 8 · `stack` · 52–56 · `plate` `pasos`
- **52,0:** placa `stack-armador-light` con "Fuerza" tildado; 52,0–52,5 trazo en el chip "Fuerza" (caja `goal`). `Carga`: 5.
- **53,0:** corte a `stack-resumen-light`; trazo en la fila del descuento stack (−$ 12.170, caja `discount`).
- **54,0:** trazo en el total ($ 109.530, caja `total`). 54–56: cámara 1,00 → 1,04 sobre el total (`trl.rampa`).
- **Rótulo:** "05 · Armá tu stack". **Cues:** 53 · `tick` · 83 · 0,25 · 54 · `impact` · — · 0,5.

## 9 · `pack` · 56–60 · `plate` `pasos` (cifra)
- **56,0:** placa `pack-light` (`packs/?pack=hipertrofia`): Pack Hipertrofia, que trae el Mass Gainer. `Carga`: 6.
- **56,0–56,5:** trazo en "Quiero este pack todos los meses" (caja `buy`). **57,0:** toque: anillo de impacto 0 → 56 px (¼ de tiempo).
- **57,5–58,0:** se despega "Cada mes: $ 122.145" desde su caja (`monthly`) y aterriza en columnas 1–8: "CADA MES:" / "$ 122.145" en display
  de 200 px (cifra en `voltInk`), desde y = 300; escala desde la altura de la caja hasta 1 (nunca más de 1), `trl.expo`. La placa baja al 15 % sobre papel.
- **58,5:** debajo, mono 30 `#5b6066`: "Demo: no se cobra ni se debita nada." (`PackBuyPanel.tsx:69`). Quieto hasta 60.
- **Rótulo:** "06 · Un pack, todos los meses". **Cues:** 57 · `click` · — · 0,6 · 58 · `impact` · — · 0,8 (cae en La).

## 10 · `checkout` · 60–64 · `plate` `pasos`
- **60 · 61 · 62:** cortes a `checkout-1-light`, `checkout-2-light` y `checkout-3-light`; en cada uno, trazo en el paso activo del indicador
  ("01/03 Datos y entrega", "02/03 Pago", "03/03 Revisar"; caja `step`, ⅛ de tiempo). `Carga`: 7 en 60.
- **62,5:** trazo en "Confirmar pedido" (caja `confirm`). **63,0:** toque (anillo) y corte a `confirmacion-light`.
- **63,5:** trazo en el código `TUT-DEMO-0001` y su estado "Pendiente de pago" (caja `status`). Nunca "pagado".
- **Rótulo:** "07 · Checkout en 3 pasos". **Cues:** 60, 61, 62 · `impact` · — · 0,5 · 63 · `click` · — · 0,6 · 63,5 · `tick` · 76 · 0,3.

## 11 · `entrega` · 64–72 · `plate` `pasos` (carril + cifra)
- **64,0:** placa `seguimiento-light` (`pedido/demo-tutienda-entregado/`, `TUT-DEMO-0000`): etapas, la tarjeta del carril (oscura en los dos modos)
  "Local Tu tienda · Mar del Plata" → "Llegó a tu casa" y la etiqueta de lote. `Carga`: 8. Rótulo "08 · Seguimiento con lote".
- **64,0–67,0:** sobre el carril (caja `rail`: el camino `M40 96 H560` de `RouteMap.tsx:10` escalado a la caja) un relleno volt avanza marca por
  marca: 7 pasos en corcheas (64,0 … 67,0), ⅛ de tiempo cada uno, `trl.expo`. Es una estilización: la placa es "ilustrativa", como la app.
- **67,5:** anillo sobre "Llegó a tu casa" (caja `home`).
- **68,0–68,5:** trazo en la etiqueta "LOTE · VL-2606-W · VTO 06/2027" (caja `lot`). **68,5–69,0:** se despega: "LOTE" / "VL-2606-W" en display de
  200 px (código en `voltInk`), columnas 1–9 desde y = 300; "VTO 06/2027" en mono 48 debajo (y ≈ 760). La placa baja al 15 %.
- **70,0:** la cifra se va (¼ de tiempo) y la placa vuelve entera.
- **70,0–71,5:** se traza un anillo volt de 2 px alrededor del ícono de la luna de la cabecera (caja `toggle`, ½ tiempo, `power2.inOut`).
- **71,5–72:** cuadro quieto y silencio. Nada se mueve.
- **Cues:** carril 64,0 … 67,0 · `tick` · 69, 72, 74, 76, 79, 81, 84 · 0,3 · 67,5 · `tick` · 88 · 0,3 · 69 · `impact` · — · 0,7 · 70,5 · `tick` · 93 · 0,2.

## 12 · `noche` · 72–76 · `plate` `mode: "tema"`, `seco: true` — **DROP 2**
- **72,0:** el toque: el anillo se abre 1 → 1,4 y se apaga (½ tiempo) y, **en el mismo cuadro**, la placa pasa a `seguimiento-dark`. Corte seco,
  como la app (`ThemeToggle.tsx` cambia `data-theme` sin animación). Es el único cambio de luz de la pieza. El rótulo se va; `Carga` pasa a colores de noche.
- **72–73:** la página oscura entera, quieta (el golpe se ve).
- **73,0:** la placa baja al 35 % (¼ de tiempo); entra el super "Y de noche, se juega." en display de 150 px, dos renglones ("Y DE NOCHE," /
  "SE JUEGA." en volt), columnas 1–8, desde y = 388. 73,0–76,0.
- **Cámara:** 72–76, 1,00 → 1,04 (`trl.rampa`).
- **Cues:** 72 · `click` · — · 0,7 (el impacto del DROP es del estilo) · 73 · `whoosh` · — · 0,3.

Sigue en [`escenas-2.md`](escenas-2.md) (escenas 13 a 28 y la lista de placas).
