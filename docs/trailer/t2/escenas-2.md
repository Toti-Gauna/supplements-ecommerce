# T2 · Escena por escena (16:9), escenas 13 a 28

Sigue de [`escenas.md`](escenas.md), que tiene las convenciones y las escenas 1 a 12.

## 13 · `club` · 76–80 · `plate` `pasos`
- **76,0:** placa `club-inicio-dark`: "Sumá carga. Subí de nivel." (`ClubHero.tsx:46`) con la batería de nivel del club. `Carga` prende la celda 9
  en el mismo cuadro: la batería del trailer y la de la app se reconocen. Rótulo "09 · Club, ruleta y Shaker Rush" (sigue hasta 88).
- **76,5:** trazo en el titular (caja `hero`). **78,0:** corte a `club-misiones-dark`; 78,5 trazo en la tarjeta "Jugá Shaker Rush esta
  semana" (caja `mission`, `club.ts:61`). 79–80: cámara 1,00 → 1,04 sobre la tarjeta (`trl.rampa`).
- Nada de puntos canjeables: el club sube de nivel por gasto en pesos (`club.ts:21-26`); no se dice nada de canje.
- **Cues:** 76 · `bell` · 84 · 0,3 · 78,5 · `tick` · 79 · 0,25.

## 14 · `ruleta` · 80–84 · `wheel-live`
- Props: `eyebrow: "Disco olímpico"`, `title: "Cargá la barra y girá"`, `prize: 1` ("Envío gratis", `wheel.ts:49,67`), `chip: ["09", "Club, ruleta y Shaker Rush"]`.
- Tal cual T1: anillo 80,0–80,5; 13 pasos entre 80,5 y 82,5 (`WHEEL_STEPS`); para en 83,0 con el gajo encendido; velo de desenfoque de movimiento
  mientras gira rápido (QA de T1). 83–84 quieto.
- **Cues:** 80 · `whoosh` inverso · — · 0,35 (½ tiempo) · 13 `tick` · 93 · de 0,5 a 0,3 · 83 · `impact` · — · 0,7 (cae en Do).

## 15 · `shaker` · 84–88 · `shaker-replay`
- Tal cual T1 (celular CSS 3D propio, canvas, semilla y piloto automático, el único canvas de la pieza): atrapadas en 84,0, 84,5 y 85,0; "¡Tiempo!"
  en 86,0 (`GameResult` sin `backdrop-blur`). La receta dura 3 tiempos: 87–88 queda quieta.
- **Cues:** 84 · `tick` · 88 · 0,3 · 86 · `impact` · — · 0,6 (cae en Sol).

## 16 · `giftcard` · 88–90 · `plate` `pasos` (cifra)
- **88,0:** placa `giftcard-dark` (`regalo/?c=REGALO-GC0S-0F1D`, ya abierto): "Agus, te llegó un regalo de Gaby" y "Saldo para usar $ 60.000"
  (`GiftCardInside.tsx:27`). `Carga` se llena: celda 10. Rótulo **abajo**, (96, 960): "10 · Regalos que se abren" (sigue hasta 96).
- **88,25:** trazo en el monto (caja `amount`). **88,5–89,0:** se despega "$ 60.000" a columnas 1–7 en display de 250 px (desde y = 360) con
  "Saldo para usar" en mono 30 arriba (y = 320). La placa baja al 20 %. Quieto hasta 90.
- **Cues:** 89 · `impact` · — · 0,8 (cae en Mi).

## 17 · `locker` · 90–96 · `gift-live` `opening: "locker"`
- **Composición:** fondo de `gift-live` (escenario de la app). Título real "Fran, te llegó un regalo de Mili" (display 64 px, centrado, y 70);
  debajo, mono volt "Abrí el locker" (`LockerOpening.tsx:88`). `LockerArt` (SVG puro con `digits`, `status`, `misses`, `swing`) a 520 × 709,
  x 700–1220, y 170–879; las ruedas del candado muestran los números. Línea de texto en y 900 (centrada). Rótulo abajo (96, 960).
- **90,0 · 90,25 · 90,5 · 90,75:** `digits` 0 · 03 · 030 · 0301 (al revés).
- **91,0:** `status: "wrong"`, `misses: 1`: sacudida `lk-shake` con `css-clock`; aparece "Esa combinación no abre. Probá de nuevo." (`LockerOpening.tsx:71`).
- **92,0 · 92,25 · 92,5 · 92,75:** `digits` 0 · 03 · 031 · 0310 (`gifts.ts:84`); el error se va en 92,0.
- **93,0:** `status: "unlocking"` (el pestillo; en la app dura 480 ms ≈ 1 tiempo); el rótulo de arriba pasa a "¡Abierto!" (`gift-openings.ts:133`).
- **93,5–95,0:** `swing` 0 → 1 (la app tarda 1100 ms; acá 1,5 tiempos = 0,70 s), `trl.expo`; atada al progreso se prende la luz de adentro:
  radial blanco-volt en (960, 520) de 0 a 0,9 y un abanico en el piso (trapecio fijo, `scaleX` 0 → 1 desde la bisagra).
- **95,0:** en la línea de texto, "Mili dejó el sabor para que lo elijas vos. Ya está pago." (`RevealExtras.tsx:34`). No se muestra el producto:
  su nombre ("Overvolt pre-entreno") se lee como marca y no va en primer plano.
- **Cámara:** 90–95, 1,00 → 1,10 hacia el candado (`trl.rampa`); 95–96 quieto.
- **Cues** (sin bombo ni bajo de 90 a 93: los números son la batería): 90,0–90,75 y 92,0–92,75 · `click` · — · 0,5 + `tick` · 76, 79, 81, 84 · 0,35 ·
  91 · `tick` · 62 · 0,5 (el error) · 93 · `click` · — · 0,7 · 94 · `shimmer` · 88 · 0,6 (la luz).

## 18 · `pote` · 96–104 · `recompra` `part: "pote"`
- **Objetivo:** la tienda calcula cuándo se termina el pote, y hoy se termina.
- **96,0–96,5:** `Carga` (llena, en (1540, 972)) viaja al centro y crece (`trl.expo`); al llegar se cambia por su versión grande, maquetada a su
  tamaño (primer plano = layout nuevo, no escala): 10 celdas de 100 × 150, calle 16, x 388–1532 (columnas 3–10), y 430–580; borne 14 × 60 en x 1540.
- **96,5:** arriba, mono 30 en (388, 380): "NICOLÁS · MASS GAINER 3 KG · DULCE DE LECHE"; a la derecha (alineado a 1532), mono 22 `TR.muted` "ORIENTATIVO".
  Abajo, cifra display de 220 px en (388, 640): "20", y a su derecha mono 30 "SERVICIOS · 1 POR DÍA" (20 servicios, `products-protein.ts:77`).
- **97 · 98 · 99 · 100 · 101:** la cifra pasa a 16, 12, 8, 4 y 0 y se apagan dos celdas por vez (el valor sale del progreso del tween). En 100
  (≤ 20 %) las celdas que quedan pasan a `danger`, como `BatteryMeter`. Solo cambia en los tiempos.
- **101,0:** queda en 0; el rótulo de la cifra pasa a "SE TE TERMINA HOY" (`runOutLineForBuyer`, `repurchase-text.ts:40`) en `danger`. Tono plano.
- **103,5–104:** cuadro quieto, silencio.
- **Super:** "La tienda calcula cuándo se termina." en display de 80 px, una línea, 96,5–103,5.
- **Maqueta:** el cálculo es el real (`remainingPct`, 20 servicios desde el 15/9 llegan a cero el 5/10); Nicolás no tiene cuenta en la demo.
- **Cues:** 96 · `whoosh` · — · 0,3 (½ tiempo) · 97, 98, 99, 100, 101 · `tick` · 88, 84, 81, 79, 76 · 0,4. El tono plano es el estilo `plano`.

## 19 · `escribirle` · 104–112 · `plate` `pasos` (foco)
- **104,0:** placa `clientes-recompra-dark` (panel, `admin-demo/usuarios/`): "A quién escribirle hoy", "5 personas … Orientativo." y tres tarjetas;
  la de **Nicolás Romero** es la tercera. Se ve la banda "Panel de demostración · datos ficticios". `Carga` vuelve a su lugar, vacía (borde `danger`).
- **104–105:** velo `#060707` al 70 % con agujero radial (div grande con `radial-gradient` transparente al centro; solo `transform`) que llega a la
  caja `card` (`[data-write='nico.r@ejemplo.com']`), `trl.rampa`. Cámara 1,00 → 1,25 hacia la tarjeta (104–106, `trl.rampa`; la placa es 2×).
- **105,0:** trazo en "Mass Gainer 3 kg: se le termina hoy" (caja `line`). **106,0–106,5:** trazo en el mensaje armado (caja `message`), que en la
  tarjeta dice "(link a su bolso)" (el link entero vive en el `href`).
- **108,0:** trazo en "Escribirle por WhatsApp" (caja `wa`). **109,0:** toque (anillo 0 → 56 px, ¼ de tiempo). No se muestra el aviso: al tocarlo,
  la app saca a Nicolás de la lista; el resultado se ve en la escena siguiente.
- **Supers:** "El mensaje ya está escrito." (104,5–108,0) · "Lo mandás vos, con un toque." (108,5–111,5).
- **Cues:** 105 · `tick` · 81 · 0,3 · 106 · `tick` · 84 · 0,25 · 108 · `tick` · 88 · 0,3 · 109 · `click` · — · 0,7 + `whoosh` · — · 0,3.

## 20 · `chat` · 112–120 · `recompra` `part: "chat"`
- **Celular** (`Phone` de `device-kit`, 380 × 780 a 1,15×, 3 capas de canto): centro (1240, 540), perspectiva 1600, rotY −8° → −3° y rotX 4° (112–120, `sine.inOut`).
- **Pantalla DOM (maqueta de chat):** fondo `#0b0d0e`; cabecera `night-2` de 64 px con un círculo de 36 px con el rayo volt y "Tu tienda"
  (sans 20, negrita). Nada de logo, verde ni sonido de WhatsApp. Burbuja de 300 px, sans 17, interlínea 1,35, con el texto exacto de
  `writeMessage` (`repurchase-today.ts:59`): "¡Hola Nicolás! Te escribimos de Tu tienda. Calculamos que hoy se te termina tu Mass Gainer 3 kg.
  ¿Te preparamos otro? En Mar del Plata te lo llevamos con cadete al día hábil siguiente. Te dejé el bolso armado con lo mismo, para que confirmes
  cuando quieras: https://toti-gauna.github.io/supplements-ecommerce/recompra/?bolso=mass-gainer.mg-dulce-de-leche-3kg.1" (link en volt).
  Texto y link salen de `writeToday` + `writeMessage` + `CONTACT.demoUrl` + `cartLinkPath`, nunca escritos a mano.
- **112,0:** se traza el contorno (½ tiempo) y en 112,5 se prende la pantalla (¼ de tiempo). **113,0:** entra la burbuja (y +24 → 0, `trl.expo`, ¼ de tiempo).
- **114,5:** subrayado del link (`scaleX`, ¼ de tiempo). **115 · 115,5 · 116:** a la izquierda (x 96) el link se lee en tres filas: etiqueta mono 22
  `TR.muted` y valor mono 44 `TR.onNight`: PRODUCTO `mass-gainer` (y 400) · VARIANTE `mg-dulce-de-leche-3kg` (y 520) · CANTIDAD `1` (y 640).
- **117,5:** toque sobre el link (anillo). **118,0:** la pantalla pasa a "Armando tu bolso" (`RepurchaseLanding.tsx:36`; esqueleto simple). 119,5–120 quieto, silencio.
- **Supers** (columnas 1–6, debajo de las filas): "Le llega a tu cliente." (112,5–115,5) · "Con el link a su bolso." (116,0–119,5).
- **Cues:** 112 · `whoosh` · — · 0,3 · 113 · `bell` · 88 · 0,5 y 113,25 · `bell` · 93 · 0,35 (el "ding": síntesis propia) · 115, 115,5, 116 ·
  `tick` · 76, 79, 81 · 0,4 · 117,5 · `click` · — · 0,6 · 116–119,5 · `riser` · — · 0,4.

## 21 · `bolso` · 120–132 · `recompra` `part: "bolso"` — **DROP 3**
- **120,0:** la pantalla del celular es la placa `carrito-recompra-390-dark` (abierta desde `recompra/?bolso=mass-gainer.mg-dulce-de-leche-3kg.1`): Mass
  Gainer 3 kg · Dulce de leche ×1 · $ 58.900 y el aviso real "Tu bolso está armado · 1 producto de tu compra anterior. Confirmá cuando quieras."
  El celular se endereza (rotY −3° → 0°) y pasa a 1,2× (120–122, `trl.expo`).
- **120,0–122,25:** `Carga` (vacía, en su lugar) se llena celda por celda cada ¼ de tiempo.
- **Super 1:** "Un toque y vuelve a cargar." (120,5–123,5), columnas 1–6.
- **124,0–124,5:** "TU BOLSO" / "ESTÁ ARMADO." se despega del aviso (caja `toast` dentro de la pantalla) a columnas 1–6, display de 150 px desde y = 300.
  **125,0:** mono 30 debajo (y 560, dos renglones): "1 producto de tu compra anterior. Confirmá cuando quieras." **126,0:** mono 34 (y 680):
  "Mass Gainer 3 kg · Dulce de leche · $ 58.900" ($ 58.900 en volt; `products-protein.ts:75`).
- **128,0:** la cifra y las notas se van (¼ de tiempo); **super 2** "Solo falta confirmar." en display de 150 px ("SOLO FALTA" / "CONFIRMAR."), columnas 1–6, desde y = 388, 128,0–131,5.
- **Cámara:** 128–132, 1,00 → 1,03 (`trl.rampa`).
- **Cues:** 120 · `boom` · 33 · 0,8 · 120,0–122,25 · `tick` · 69, 72, 74, 76, 79, 81, 84, 86, 88, 93 · 0,3 · 124 · `impact` · — · 0,8 ·
  125 · `tick` · 81 · 0,3 · 126 · `tick` · 84 · 0,3 · 128 · `shimmer` · 88 · 0,4.

## 22 · `promesa` · 132–136 · `stack`
- Tal cual T1, con `lines: ["Para que", "vuelvan", "a comprar."]`: renglones en 132,0, 132,25 y 132,5 (display de 200 px, "A COMPRAR." en volt),
  la marca de Tu tienda en 133, el eje en `AXIS_Y` y en 135,5 queda solo el eje. Silencio 135,5–136. `Carga` ya no está.
- **Cues:** 132, 132,25, 132,5 · `impact` · — · 0,7, 0,6, 0,8 · 133 · `shimmer` · 88 · 0,35.

## 23 a 28 · Firma de Eclipse
- **23 `en-vivo` (136–148):** `eclipse-cta` con `axis: true`: el eje pasa a corona en ⅛ de tiempo y se apaga mientras amanece. El Sol resuelve en Do en "Probalo en vivo".
- **24–27 precios (148–182):** `eclipse-prices` del libro `tu-tienda`: `base-campaign` n "11" (8 tiempos), `launch-pack-draft` n "12" (8; dice "sujeto a disponibilidad"),
  `planes` n "13" (8) y `extras` n "14" (10; trae "WhatsApp estándar (sin IA)"). Cortes en el tiempo 1; sin cambios en la receta (ver `veredicto.md` §6.1).
- **28 `cierre` (182–192):** `eclipse-outro` tal cual.

## Placas (21, más sus versiones `-t` de 9:16 en T2.5)
Con `scripts/trailer-plates.mjs` (build `NEXT_PUBLIC_BRAND=tutienda`, 1600 × 900 a 2×, sin el banner de demo: el script lo oculta antes de capturar),
salida `public/trailer/shots/t2/<id>.jpg` y cajas en `src/trailer/pieces/t2-plates.json`. Estado sembrado como en `docs/trailer/biblia/ui.md` §0.
| id | Ruta y estado | Cajas |
|---|---|---|
| `buscar-vacio-light` | `buscar/` sin texto | `input` |
| `buscar-typo-light` | `buscar/?q=creatna` | `r1`…`r4` (el 4.º, Mass Gainer 3 kg) |
| `ficha-mg-{chocolate,banana,dulce}-light` (3) | `p/mass-gainer/`, tocar el sabor | `hero`, `flavor`, `illus` |
| `comparar-light` | `comparar/?p=ionic-whey,proteina-vegana` | `best1`…`best4` (`[data-best=true]`) |
| `stack-armador-light` / `stack-resumen-light` | `crear/`, esperar `[data-stack-ready]`, tildar "Fuerza" | `goal` / `discount`, `total` |
| `pack-light` | `packs/?pack=hipertrofia` | `buy`, `monthly` |
| `checkout-{1,2,3}-light` (3) | `checkout/` con carrito sembrado; pasos de `checkoutAsGuest` (`tests/e2e/helpers.ts`) | `step`; en el 3, `confirm` |
| `confirmacion-light` | `checkout/confirmacion/` en el mismo contexto (`TUT-DEMO-0001`) | `status` |
| `seguimiento-light` / `seguimiento-dark` | `pedido/demo-tutienda-entregado/`, carril y lote en el encuadre | `toggle`, `rail`, `home`, `lot` |
| `club-inicio-dark` / `club-misiones-dark` | `club/` con cuenta sembrada | `hero` / `mission` |
| `giftcard-dark` | `regalo/?c=REGALO-GC0S-0F1D`, abierto (5 golpes) | `amount` |
| `clientes-recompra-dark` | `admin-demo/usuarios/` | `card`, `line`, `message`, `wa` |
| `carrito-recompra-390-dark` | `recompra/?bolso=mass-gainer.mg-dulce-de-leche-3kg.1` con carrito vacío → `carrito/` con el aviso (390 × 828) | `toast` |
| `atlas-fechas` | `scripts/capture-splash-frames.mjs` a 1750 ms, 18 cuadros en 6 × 3 (1728 × 651 a 2×) | — |
**Revisar al capturar:** que ninguna placa muestre "VOLTA" ni `VOL-000121`; que "Overvolt", "Voltio" o "Electro Volt" no caigan dentro de una caja con trazo o cifra.
