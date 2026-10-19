# T2 · Dirección cinematográfica: "La luz que vuelve"

128 BPM · 1 tiempo = 0,46875 s · **176 tiempos = 44 compases = 82,5 s**. Ángulo: profundidad, luz, silencio y rampas. La luz del eclipse es el hilo.

## 1. Idea e hilo conductor
**Tesis.** Un eclipse es una noche corta que siempre termina: la luz vuelve. Tu tienda también: cada fecha la prende distinta, se compra a plena luz, la fidelidad
sigue de noche y, cuando al cliente se le termina el pote, la tienda lo hace volver con el bolso armado. **La pieza es un día:** fechas (oscuro) → compra (todo en
**modo claro**) → **el eclipse es el golpe de claro a oscuro** (DROP 2) → noche (club, juegos, regalos) → recompra (la única luz es una pantalla) → amanecer y cierre.
**Gramática de luz** (de T1): volt = la tienda · corona `#f5b942` y destello `#ffe8b0` = Eclipse · amanecer = la decisión. Nada se ilumina sin una fuente que se vea
(el `--lit-at` real de cada pantalla de carga, la luz del locker, el celular). **Familia con T1, no copia:** misma grilla, display, chips y firma sonora; T1 cortaba
con una línea, T2 corta con una **sombra** (la luna) y entra **por la luz** (empujes de cámara a través de una fuente de luz).

## 2. Duración y actos
**82,5 s** porque: los dos protagonistas necesitan aire (fechas 13,1 s, recompra 15 s); cada plano de compra dura 4 tiempos (1,875 s), el mínimo para
leer un super de ≤ 6 palabras ≥ 1,17 s y ver la pieza; el cierre (22,5 s) es más corto que la firma (66 tiempos) pero muestra tres páginas de precios.
Deja a T4 el desarrollo largo. Actos (cortes en el tiempo 1): **0** Presenta 0–12 (0–5,625 s) · **I** Cada fecha 12–40 (5,625–18,75; DROP 1 en 36) ·
**II** Comprar de día 40–64 (18,75–30,0) · **III** Noche 64–96 (30,0–45,0; DROP 2 en 64) · **IV** La luz que vuelve 96–128 (45,0–60,0; DROP 3 en 120) ·
**V** Amanecer 128–176 (60,0–82,5). **Hilo de producto:** el Mass Gainer 3 kg es el 4.º resultado de "creatna", su foto cambia con el sabor, va en el
Pack Hipertrofia (`packs.ts:14`) y es el pote que se le termina a Nicolás: siembra en el acto II, cosecha en el IV (sin decir que es la misma persona).

## 3. Tabla de escenas
| # | id | Tiempos | Segundos | Receta / pieza real | Super o rótulo (uno a la vez) | Cue principal |
|---|---|---|---|---|---|---|
| 1 | `apertura` | 0–12 | 0–5,625 | `eclipse-intro` | (ECLIPSE · "Presenta…") | silencio 11,5–12 |
| 2 | `fechas` | 12–36 | 5,625–16,875 | **`splash-eclipse`** (nueva, sobre `splash-live`): 13 `SplashStage` reales | 16–24 "Cada fecha, otra tienda." · 24–31,5 "17 fechas, 17 pantallas de carga." | campana del estribillo en cada tránsito; riser 32–35,5 |
| 3 | `abre` | 36–40 | 16,875–18,75 | `splash-eclipse` (parte `abre`) → placa `campana-black-friday` (oscura) | — (habla la página: "Negro total, precios en volt") | **DROP 1** en 36 (`bf-lights`) |
| 4 | `buscar` | 40–44 | 18,75–20,625 | `plate` modo `luz` (nuevo): `buscar-typo` claro | "Escribís mal. Te entiende igual." | click 40; tick al aterrizar en Mass Gainer (43,5) |
| 5 | `sabor` | 44–48 | 20,625–22,5 | `SpecGallery`/`TestBench` en vivo con `tint` (o 3 placas): Mass Gainer 3 kg | "La foto cambia con el sabor." | pluck en 44, 45,5 y 47 (notas del estribillo) |
| 6 | `comparar` | 48–52 | 22,5–24,375 | `plate` `luz`: `comparar-tabla` claro, celdas `[data-best]` | "Compará lado a lado." | ticks por fila |
| 7 | `stack` | 52–56 | 24,375–26,25 | `plate`: `quiz-inicio` (52–54) → `stack-resumen` (54–56) claro | "Llegá a una mejor compra." | click 54; tick en "$ 109.530" |
| 8 | `pack` | 56–60 | 26,25–28,125 | `plate`: `packs-detalle` (Pack Hipertrofia) claro | "Un pack, todos los meses." | click en "Quiero este pack todos los meses" (58) |
| 9 | `checkout` | 60–64 | 28,125–30,0 | `plate` modo `eclipse-tema` (nuevo): pasos 01/03 → 03/03 claro | 60–62,5 "Tres pasos y listo." | click 62,5 en la luna; stutter + riser; silencio 63,5–64 |
| 10 | `noche` | 64–66 | 30,0–30,938 | ídem, ya oscuro | 64–66,5 "Modo oscuro, con un toque." | **DROP 2** en 64 + shimmer (anillo de diamante) |
| 11 | `llega` | 66–72 | 30,938–33,75 | `plate` modo `ruta` (nuevo): `seguimiento` oscuro | 66,5–69 "Lo seguís hasta tu casa." · 69–72 "Con lote y vencimiento." | whoosh del carril; tick en "Llegó a tu casa" (68) |
| 12 | `club` | 72–76 | 33,75–35,625 | `plate`: `club-inicio` (72–74) → `club-misiones` (74–76) oscuro | 74–76 "Misiones con premio." | bell 72 |
| 13 | `ruleta` | 76–80 | 35,625–37,5 | `wheel-live`, `prize: 1` ("Envío gratis") | "Girá el disco olímpico." | sus 13 ticks; impact en 79 |
| 14 | `shaker` | 80–84 | 37,5–39,375 | `shaker-replay` (el único canvas) | "Y jugá a Shaker Rush." | atrapadas en notas; "¡Tiempo!" 83 |
| 15 | `giftcard` | 84–88 | 39,375–41,25 | `gift-live` con revelación de gift card (prerrequisito) | 86–88 "Regalá una gift card." | golpes en corcheas 84–86 |
| 16 | `locker` | 88–96 | 41,25–45,0 | **`locker-live`** (nueva): `LockerArt` real | 93,5–96 "Que elija el sabor." | 4 números = la batería (88–89,5); pestillo 90; shimmer 92 |
| 17 | `bateria` | 96–100 | 45,0–46,875 | **`recompra`** (nueva) parte `bateria`: `PotBattery` real | 96,5–99,5 "La tienda calcula cuándo se termina." | entra `half`; tono bajo a 99,5 |
| 18 | `mensaje` | 100–106 | 46,875–49,688 | `plate`: tarjeta real de "A quién escribirle hoy" (Nicolás Romero) | 100,5–103 "Te arma el mensaje." · 103,5–106 "Lo mandás desde tu WhatsApp." | click 104,5 |
| 19 | `celular` | 106–120 | 49,688–56,25 | `recompra` parte `celular`: `Phone` CSS 3D con pantalla DOM | 108–112 "Le llega a tu cliente." · 112–116 "Con el bolso ya armado." | **ding** propio 107 y 107,25; toque 116; riser; silencio 119,5–120 |
| 20 | `bolso` | 120–128 | 56,25–60,0 | `recompra` parte `bolso`: carrito real 390 + toast real | 120,5–123,5 "Solo falta confirmar." · 124–127,5 "Para que vuelvan." | **DROP 3** en 120; silencio 127,5–128 |
| 21 | `en-vivo` | 128–140 | 60,0–65,625 | `eclipse-cta` | "Probalo en vivo." · Contactanos · 223-446 7881 | resuelve en Do |
| 22 | `precio-campana` | 140–148 | 65,625–69,375 | `eclipse-prices` `base-campaign` n 11 | (libro) | tick por fila |
| 23 | `precio-pack` | 148–156 | 69,375–73,125 | `eclipse-prices` `launch-pack-draft` n 12 (sale "sujeto a disponibilidad") | (libro) | ídem |
| 24 | `precio-planes` | 156–164 | 73,125–76,875 | `eclipse-prices` `planes` n 13 | (libro) | ídem |
| 25 | `cierre` | 164–176 | 76,875–82,5 | `eclipse-outro` (+ 2 tiempos de noche quieta) | (ECLIPSE) | `final` |
Suma: 12+24+4+4+4+4+4+4+4+2+6+4+4+4+4+8+4+6+14+8+12+8+8+8+12 = **176**. Supers: ≤ 6 palabras y ≥ 1,17 s cada uno; nunca dos a la vez.

## 4. Escenas protagonistas (escenario 1920×1080; columnas en x = 96 + (k−1)·146, ancho 122; filas en y = 60 + (r−1)·164, alto 140)
**A · `fechas` + `abre` (12–40): el tránsito.** Capas (7): fondo `#060707` · grilla volt 14 % · **abertura** columnas 4–9 × filas 2–5
(x 534→1386, y 224→856; `overflow: hidden`; filo de 2 px en el `--season-accent` de la fecha, al 35 %) · `SplashStage` de 843×632 centrado (solo la
saliente y la entrante visibles) · **luna** (disco de 1180 px, `#05050a`, penumbra radial de 24 px) · destello (28 px `#ffe8b0` + halo corona) · super.
- **12,0** Del negro de la apertura se abre la abertura con **Día de la Madre** (la fecha vigente en la demo, 5/10) a velocidad real: 1850 ms ≈ 4 tiempos; su `--lit-at` (980 ms) cae en 14.
- **Tránsito centrado en T:** la luna cruza de x +1100 a −1100 respecto del centro (960, 540) con `trl.moon`; en T tapa toda la abertura y en ese cuadro se cambia
  de fecha (`autoAlpha`); el filo toma el acento nuevo y el destello aparece en el punto de último contacto (¼ de tiempo). Cada fecha entra con su reloj CSS
  puesto para que **su luz se prenda en T + ½** (css-clock). Cruces de 2 tiempos en 16 (Halloween) y 20 (CyberMonday); de 1 tiempo en 22 (Navidad);
  de ½ tiempo, alternando el sentido, en 24 Año Nuevo · 25 San Valentín · 26 CrossFit Open · 27 Running · 28 Hot Sale · 29 Día del Padre · 30 Futbolista · 31 Boxeador · 32 **Black Friday**. **Nunca más de un tránsito por tiempo (2,13/s).**
- **Super** en la fila 6, x 534 (alineado a la abertura), línea base y = 1000, 72 px. "17" = `SPLASH_SCENES` sin la original (17 escenas `ready`).
- **32–35,5** La persiana de Black Friday (`bf-shutter`, 280–1000 ms) estirada a 3,5 tiempos; la abertura empuja 1→1,06 (`trl.rampa`). **35,5** congelada en "ya entra luz". Silencio.
- **36 · DROP 1** `bf-lights` (`steps(1)`): se prende la luz adentro del local; el marcador rueda a 30 % (1050–1590 ms a 1×).
- **36–38,5 · "por la luz"** La abertura escala 1,06→3,4 con origen en la boca del local (≈ 960, 557); `trl.rampa`, 94 % en 38,5. **38,5–39** fundido a la placa `campana-black-friday` (oscura) que asienta 1,08→1 (`trl.expo`) hasta 40.

**B · `checkout` + `noche` (60–66): la totalidad (claro → oscuro en el DROP 2).** Capas (6): placa clara · máscara circular (div `border-radius: 50%`,
`overflow: hidden`, trasladada) con la placa oscura adentro **contra-trasladada** (solo transform) · anillo del click · destello · halo corona · super en chip.
- **60, 61, 62** Cortes en el lugar a 01/03 "Datos y entrega", 02/03 "Pago", 03/03 "Revisar" (`STEPS`, `CheckoutView.tsx:29`), placas 1440 claras a 1,333×.
- **62,5** Anillo de 1 px en el ícono de luna real del encabezado ("Activar modo oscuro", caja medida ≈ 1550, 84). La luna del ícono se suelta y crece
  (disco de 2600 px, escala 0,008→1) mientras su centro viaja a (1250, 540) con `trl.rampa`: adentro del disco se ve **la misma página en oscuro**.
- **63,5** Queda una medialuna de luz a la izquierda (x < 130) y el **anillo de diamante** en su punta (130, 540). Silencio, cuadro quieto.
- **64 · DROP 2** El disco termina en (960, 540) en ⅛ de tiempo (`trl.expo`); el destello estalla 1→1,6 y se apaga en ½ tiempo. Todo oscuro, una sola vez.
- **65** "Confirmar pedido" (`ConfirmStep.tsx:71`) se hunde 0,97; corte en 66 al seguimiento oscuro. El super va en el chip `#060707` al 92 % en (96, 940).

**C · `locker` (88–96): la luz de adentro.** Fondo como `gift-live` (radial `#1d2230` → `#0a0c11`). Título real "Fran, te llegó un regalo de Mili" (64 px, y 70);
debajo, mono volt "Abrí el locker" → "¡Abierto!" (`LockerOpening.tsx:88`, `LOCKER.done`). `LockerArt` 520×709 en x 700→1220, y 170→879; campo con la combinación en (760→1160, 900→990).
- **88, 88,5, 89, 89,5** Entran 0 · 3 · 1 · 0 (`lockerCode` "0310", el día y mes del regalo); cada número es un golpe de la batería (se cae el bombo, como la bolsa en T1).
- **90** Pestillo (estado `unlocking`, 480 ms ≈ 1 tiempo). **91–93** La puerta gira (1100 ms estirados a 2 tiempos, `trl.rampa`) y, atada a su progreso,
  se prende la luz de adentro: radial blanco-volt en (960, 520) 0→0,9 y un abanico de luz en el piso (trapecio fijo, `scaleX` 0→1 desde la bisagra). Cámara 1→1,1 (88–92,5).
- **93** Sube el Overvolt pre-entreno ("300 g · sabor a elección") a la luz; **93,5** "Elegí tu sabor" con Frutos rojos, Limón y Mango (`GiftChoice`).

**D · `bateria` → `mensaje` → `celular` → `bolso` (96–128): la luz que vuelve (protagonista).**
- **96–100** Noche. `PotBattery` real re-renderizado con `zoom` 2 en columnas 4–9 (x 534→1386, y 400→680): Mass Gainer 3 kg · Dulce de leche · del pedido TUT-000108.
  El medidor baja de 100 a 0 (`ease: none`, el tiempo pasa) y pasa de volt a peligro en 20 % (tono real). Arriba, en la fila 2, un contador mono de fechas que sale
  del progreso (`startsOn` → `runsOutOn` de `potsInUse`, termina en "lun 5 oct"). **99,5** "Se te termina hoy" (`runOutLineForBuyer`). Es la única luz del cuadro.
- **100–106** Tarjeta real del panel (`WriteTodayPanel.tsx`, `[data-write='nico.r@ejemplo.com']`) a 1,6× en columnas 3–10: "Nicolás Romero · 223 555-0108",
  "**Mass Gainer 3 kg**: se le termina hoy" y el mensaje armado por `writeMessage`. Un velo con agujero radial (solo transform) recorre nombre → potes → mensaje (101–103,5, `trl.rampa`).
  **104,5** se hunde "Escribirle por WhatsApp". Los supers van en el chip de abajo (96, 940): la tarjeta queda entera.
- **106–120** `Phone` (380×780 a 1,15×, centro en (1190, 560), rotY −12°, rotX 6°, 3 capas de espesor, no 8). Super a la izquierda, columnas 1–5, filas 3–4.
  **106** Pantalla apagada (filo de 1 px). **107** se prende: pantalla de bloqueo `#0b0d0e` con "lunes 5 de octubre"; su luz cae en la mesa (radial 0→0,5).
  **107 y 107,25** ding (campana propia). Baja una notificación (`trl.expo`, ¼ de tiempo): ícono `MessageCircle` (el mismo del botón del panel), "Tu tienda",
  "¡Hola Nicolás! Te escribimos de Tu tienda. Calculamos que hoy se te termina tu Mass Gainer 3 kg…". Cámara z 0→220 (`trl.rampa`, 106–112).
  **110** Se abre el chat genérico: el mensaje entero de `writeMessage` con el link real `toti-gauna.github.io/supplements-ecommerce/recompra/?bolso=mass-gainer.mg-dulce-de-leche-3kg.1`
  subrayado en volt. **116** toque (anillo 0→56 px, ¼ de tiempo) y la pantalla pasa a `HeroSkeleton` "Armando tu bolso" (`RepurchaseLanding.tsx`).
  **116–119,5 · "por la luz"** El celular escala 1→3,1 y se endereza (rotY y rotX a 0), 94 % en 119,5. **119,5** silencio en "Armando tu bolso".
- **120 · DROP 3** La pantalla ya es el cuadro: carrito real 390 (640×1138 → 607×1080 al centro) con Mass Gainer 3 kg · Dulce de leche ×1 · $ 58.900;
  a los costados, la luz volt que se derrama (0→0,6). **120,5** entra el toast real "Tu bolso está armado · 1 producto de tu compra anterior. Confirmá cuando quieras."
  Cámara 1,08→1 (`trl.expo`, 120–124). **125–127,5** la luz baja y queda como una franja a la altura del horizonte de `eclipse/sky.tsx`: es el amanecer que sube en 128.

## 5. Transiciones firma
**Tránsito** (la luna cruza y cambia la fecha; solo en `fechas`) · **Totalidad** (claro → oscuro con anillo de diamante; una vez, DROP 2) · **Por la luz** (empuje
`trl.rampa` a través de una fuente de luz, 94 % en el golpe: persiana 36–40 y celular 116–120) · **La luz baja al horizonte** (125–128, el resplandor del celular
se vuelve el amanecer de `eclipse-cta`). El resto: cortes secos en el tiempo. Curvas: solo `trl.*` (`moon` para la luna, `rampa` para cámara y llegadas, `expo` para interfaz).

## 6. Música y silencios
| Tiempos | Estilo | Qué pasa |
|---|---|---|
| 0–12 | `tension` (firma) | Apertura; silencio 11,5–12 |
| 12–35,5 | `tension` 2.ª vuelta | Dron La + latido (cada 2 tiempos hasta 24, cada tiempo después). **Cada tránsito toca una nota del estribillo en campana** (16, 20, 22, 24–32: compases 1–3). Riser 32–35,5 |
| 36–60 | silencio 35,5–36 → `drop` (**DROP 1**) | Am–F–C–G ×1,5. Los cambios de sabor (44, 45,5, 47) y los clicks caen en notas |
| 60–64 | `stutter` + riser → silencio 63,5–64 | La luna cruza la página (click 62,5); la medialuna, quieta |
| 64–96 | `drop` pleno (**DROP 2**) | 8 compases; `breaks` 88–90 (bombo y bajo): los 4 números del locker son la batería; shimmer en 92 (la luz de adentro) |
| 96–116 | `half` | Noche: bombo en 1 y 3, estribillo en campana; de 106 a 116 solo pad: el ding (107, 107,25) suena solo |
| 116–120 | riser → silencio 119,5–120 | El empuje dentro de la pantalla; "Armando tu bolso" quieto |
| 120–128 | `drop` (**DROP 3**) → silencio 127,5–128 | 2 compases: estribillo compás 1 y 4; pluck en el toast (120,5) |
| 128–164 · 164–176 | `calm` · `final` | Do mayor, amanecer y precios · el eclipse se cierra; los últimos 2 tiempos, noche quieta y la cola del acorde |
El ding es síntesis propia (campana 88 + 93), no el sonido de WhatsApp. Ningún sonido sin toque ni toque sin sonido.

## 7. Real, maqueta o condicional, plano por plano
- **Real en vivo:** fechas (`SplashStage` + `app/splash-scenes/*.css` con el reloj del trailer), ficha que se tiñe con el sabor (`SpecGallery`, `ProductDetail.tsx:88`),
  ruleta, Shaker Rush, bolsa, locker y "Elegí tu sabor" (`LockerArt`, `GiftChoice`), "Armando tu bolso", carrito y toast (`RepurchaseLanding` + `decodeCartLink` cargan el bolso de verdad).
- **Placas reales** (ficha `tutienda`): Black Friday, buscar, comparar, quiz, stack, pack, checkout, seguimiento (pista "Local Tu tienda · Mar del Plata → Tu casa",
  "ilustrativo"; LOTE VL-2606-W · VTO 06/2027 del pedido de muestra TUT-DEMO-0000), club y la tarjeta del panel. Velos, anillos, luna y filos son del trailer.
- **Estilización:** la luna del claro → oscuro (la app cambia de tema al instante, `ThemeToggle.tsx`; las dos placas son el mismo paso real).
- **Maqueta:** la batería de Nicolás (`PotBattery` real con el pote de TUT-000108; él no tiene cuenta en la demo) y la notificación y el chat (burbuja genérica,
  sin logo ni colores de WhatsApp, con el texto exacto de `writeMessage`).
**Honestidad de la recompra:** el panel calcula a quién se le termina, arma el mensaje y el link; **el dueño lo manda** desde su WhatsApp ("WhatsApp listo
para mandar · Se abrió con el mensaje escrito…"). No hay envío automático: por eso ningún super dice "automático", y uno dice "Lo mandás desde tu WhatsApp".

## 8. Qué corto del brief y por qué
- **El envío "por el país" (`globeship`).** Sería falso: la tienda despacha desde su local de Mar del Plata (cadete al día hábil siguiente, o correo) y el seguimiento
  real es una pista local → casa. Un mapa que termina en Mar del Plata invierte el recorrido. Queda la pista real con el lote (`llega`).
- **"Mensaje automático"** como palabra (ver §7). **"Calendario de servicios"**: la app no tiene calendario; tiene la batería por servicios (`PotBattery`).
- **La bolsa como protagonista:** fue el "wow" de T1. Acá abre la gift card en 4 tiempos y la luz se la lleva el locker.
- **Cupones y recordatorios** como planos propios (el cupón es el premio de la ruleta; el recordatorio es toda la recompra) · **carrusel y franja de próxima campaña**
  (los reemplaza la página de Black Friday, a donde lleva la persiana) · **quiz** reducido a 2 tiempos · **página de extras** (queda en la firma y en T4).

## 9. Riesgos
- **60 fps.** Hasta 11 capas por escena; un solo canvas (80–84); CSS 3D solo en `shaker` y `celular`; sin `backdrop-filter` ni blur. La luna y la máscara del tema
  son transform puro (contra-traslado, no `clip-path`). El celular con 3 capas de espesor (QA de T1: 8 capas costaban). Las 13 fechas montadas pero ocultas; arte decodificado antes de armar.
- **Destellos (WCAG 2.3.1).** El tramo 24–32 es el más riesgoso: un tránsito por tiempo (2,13/s) con un disco oscuro sobre el 26 % del cuadro. Sobre arte oscuro el salto
  de luminancia es chico, pero **se mide a 60 fps antes de cerrar**; si un campo supera el 25 %, se baja a un tránsito cada 2 tiempos (quedan 9 fechas).
  Claro → oscuro, la luz de Black Friday y el DROP 3 son cambios únicos, no repetidos. Ruleta con su velo de T1.
- **Honestidad.** El link de recompra apunta a la demo publicada, que hoy sale con la marca VOLTA (QA de T1, lente 4): decisión de Ignacio antes de exportar.
  La batería de Nicolás es maqueta. "17" sale de `SPLASH_SCENES`. "$ 58.900" y "$ 60.000" salen de los fixtures. Nada de logo ni sonido de WhatsApp.
  Ojo: `fixtures/gift-cards.ts:18,37` trae `orderCode: "VOL-000121"` escrito a mano; ninguna placa de T2 lo muestra, pero T3 sí podría.
- **Accesibilidad.** Supers sobre placas claras van en el chip oscuro (AA); el resumen para lectores de pantalla se arma con los supers y los textos de §4.
  **Movimiento reducido:** sin luna, sin cámara, sin 3D: cada escena es una lámina con su estado final (la fecha prendida, la página oscura, el locker abierto,
  el carrito con el toast) que entra con un fundido de ¼ de tiempo en el mismo tiempo; supers, cortes y sonido iguales. **9:16:** la abertura pasa a `FRAME 9x16`
  (960×720 arriba), supers en el tercio superior, placas 390/640 a todo el ancho y el celular a todo el alto (en vertical el DROP 3 es natural).

## 10. Prerrequisitos en el código
1. `plate-kit` y `device-kit` leen la carpeta de placas de la pieza (`shots/t2/`), hoy fija en `shots/t1/` (QA de T1, lente 6). `Phone` acepta pantalla DOM (children).
2. Recetas nuevas: `splash-eclipse` (fechas con hora de luz por fecha, luna, abertura en la grilla, parte `abre`), `locker-live` (`LockerArt` + `css-clock`),
   `recompra` (`bateria`, `celular`, `bolso`); modos de `plate`: `luz` (velo con agujero), `eclipse-tema` (luna desde la caja del interruptor), `ruta` (pista + lote).
   `gift-live` con título y revelación de gift card (`GiftCardInside`, Gaby → Agus, $ 60.000). Ficha en vivo con `tint` o 3 placas.
3. Placas nuevas (build con `NEXT_PUBLIC_BRAND=tutienda`): buscar, comparar, quiz, stack, pack y checkout 01–03 en **claro** (con la caja del interruptor), checkout 03 oscuro,
   seguimiento oscuro en camino y entregado (cajas de la pista y de cada LOTE), ficha de `mass-gainer` por sabor, tarjeta `[data-write='nico.r@ejemplo.com']`, carrito 390 oscuro
   abierto desde `recompra/?bolso=mass-gainer.mg-dulce-de-leche-3kg.1` con su toast.
4. Sonido: cue `ding` (dos campanas), `breaks` 88–90, tres drops y cinco silencios. Tests: cada nota atada a su evento; cifras de pantalla ($ 58.900, $ 60.000,
   17, "0310") contra fixtures y engine; ningún cuadro con "VOLTA".
