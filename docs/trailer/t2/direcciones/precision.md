# T2 · Dirección de precisión: "El carril" (una compra, medida de punta a punta)

> 128 BPM · **192 tiempos = 48 compases = 90,0 s** · 1 t = 0,46875 s · tiempos absolutos · escenario 1920×1080 con la grilla de `core/grid.ts` (col *k*: x = 96 + (k−1)·146;
> fila *r*: y = 60 + (r−1)·164). "Real" = componente o captura de la app; "maqueta" = dibujo del trailer con datos reales.

## 1. Idea e hilo conductor
En T1 la relación después de comprar era **una línea plana** que latía. En T2 esa línea es **el carril**: la pista de 1 px y 7 marcas que la app ya dibuja en el
seguimiento (`RouteMap.tsx:10-12`, "del local a tu casa", `TICKS` = 7). Vive en una **banda fija de 120 px al pie** (y 960–1080) de los actos II a V, se llena
capítulo a capítulo (02 Buscar … 07 Recomprar), se **vacía** como batería cuando el pote se termina, **se vuelve a llenar** con el link de recompra y al final se
cierra en una **pista de atletismo**: la compra da la vuelta. Misma gramática que T1 (grilla, 1 px, cortes en el tiempo, cifras despegadas de su caja); otra historia.
**Diferencias con T1:** la compra va en **claro** (T1 es todo oscuro); el claro→oscuro es **corte seco**, como en la app (`ThemeToggle.tsx:19-22` cambia `data-theme`
sin animación; T1 usó un círculo); y el acto I abre con la fecha **del día de la demo**, Día de la Madre (1–18/10, `themes.ts:11`), cuyo mecanismo es **un monitor
que late** (`splash-scenes.ts:40`): el latido de T1, dicho por la app. Sin sonido se entiende: un super por vez, rótulo en la banda, cifras reales enormes.
## 2. Actos
| Acto | Tiempos | Segundos | Qué cuenta |
|---|---|---|---|
| Firma | 0–12 | 0–5,625 | `eclipse-intro` tal cual |
| I · La fecha (protagonista) | 12–40 | 5,625–18,75 | Un año de pantallas de carga sobre un eje de calendario real; 17 fechas + la original |
| II · La compra (claro) | 40–72 | 18,75–33,75 | DROP 1. Buscar mal, sabor, comparar, stack, pack, checkout 01/03→03/03 |
| III · La entrega | 72–84 | 33,75–39,375 | El carril real llega a casa; el lote se despega. Silencio |
| IV · La vuelta (oscuro) | 84–108 | 39,375–50,625 | DROP 2 = corte a oscuro. Club, ruleta, Shaker Rush, misión; regalos |
| V · La recompra (protagonista) | 108–152 | 50,625–71,25 | 20 servicios → 0; el panel ya escribió el mensaje; el link; DROP 3: bolso cargado; la pista |
| Cierre Eclipse | 152–192 | 71,25–90,0 | `eclipse-cta` (12) → precios campaña (8) → pack de lanzamiento (10) → `eclipse-outro` (10) |
**Por qué 90 s:** 40 t de cierre fijo y 12 de firma dejan 140 t (65,6 s) de producto: 2 protagonistas (13 y 21 s), 2 ráfagas y un puente.
## 3. Tabla de escenas
| # | id | Tiempos | Segundos | Receta / pieza real | Super o rótulo | Cue clave |
|---|---|---|---|---|---|---|
| 1 | `apertura` | 0–12 | 0,000–5,625 | `eclipse-intro` | (firma) | subida corta en 11,5 |
| 2 | `madre` | 12–18 | 5,625–8,438 | **nueva** `splash-chain` (parte `hero`) + `SplashStage` dia-de-la-madre | "Una pantalla por fecha." (14–18) | 12 click seco; 15·16·17 `sub` 33 (latidos) |
| 3 | `fechas` | 18–34 | 8,438–15,938 | `splash-chain` (parte `chain`), 16 fechas en vivo | rótulo de fecha en el eje ("19 OCT · HALLOWEEN") | 1 `bell` por corte = estribillo en negras |
| 4 | `diecisiete` | 34–40 | 15,938–18,750 | `splash-chain` (parte `sheet`) + placa atlas | "17 fechas. 17 pantallas." (35–39,5) | 34 `whoosh`; **silencio 39,5–40** |
| 5 | `buscar` | 40–44 | 18,750–20,625 | `plate` (modo `typo`): `buscar-vacio` → `buscar-typo` (claro) | "Aunque lo escribas mal." (41–44) | **DROP 1**; 7 `tick` (letras) |
| 6 | `sabor` | 44–48 | 20,625–22,500 | `plate` (modo `sabor`): ficha Ionic Whey ×4 tintes | "La foto cambia con el sabor." | 44,5–46 `tick` 76·79·81·84 |
| 7 | `comparar` | 48–50 | 22,500–23,438 | `plate`: `comparar-tabla` claro, trazo en `[data-best=true]` | rótulo "03 · Elegir" | 48,5 `tick` |
| 8 | `stack` | 50–56 | 23,438–26,250 | `plate` (modo `cifra`): `stack-armador` → `stack-resumen` | cifra "$ 3.202 por día" | 52,5 `impact` |
| 9 | `pack` | 56–64 | 26,250–30,000 | `plate` (modo `cifra`): `packs-detalle` claro | "O todos los meses." (59–64) | 58 `click`; 58,5 `impact` |
| 10 | `checkout` | 64–72 | 30,000–33,750 | `plate`: pasos 1, 2, 3 y confirmación (claro) | "Tres pasos." (64–71,5) | 64·66·68 `impact` (01/03…03/03) |
| 11 | `entrega` | 72–84 | 33,750–39,375 | `plate` (modo `carril`): `seguimiento-entregado` claro | "Con lote y vencimiento." (76–83,5) | 7 `tick` (etapas); **silencio 83,5–84** |
| 12 | `noche` | 84–86 | 39,375–40,313 | la misma placa en oscuro (corte seco) | — | **DROP 2** |
| 13 | `club` | 86–90 | 40,313–42,188 | `plate`: `club-niveles` oscuro + regla de niveles | "Cada compra suma." | 87 `tick` ×4 |
| 14 | `ruleta` | 90–94 | 42,188–44,063 | `wheel-live` (13 pasos en 3 t, velo) | "Y se juega." (90–98) | 93 `impact` |
| 15 | `shaker` | 94–96 | 44,063–45,000 | `device` + `shaker-replay` (único canvas) | ídem | 95,5 `impact` "¡Tiempo!" |
| 16 | `mision` | 96–98 | 45,000–45,938 | `plate`: `club-misiones` ("Jugá Shaker Rush esta semana") | ídem | 96,5 `tick` |
| 17 | `giftcard` | 98–100 | 45,938–46,875 | `plate` (modo `cifra`): `regalo-giftcard` | "Y se regala." (98–108) | 98,5 `impact` |
| 18 | `bolsa` | 100–102 | 46,875–47,813 | `gift-live` desde 4 golpes | ídem | 100 `kick`; 101 `shimmer` |
| 19 | `locker` | 102–108 | 47,813–50,625 | **nueva** `locker-live` (o placas de estado) | ídem | 0·3·1·0 en 102–103,5 (notas); 104 `click` |
| 20 | `servicios` | 108–116 | 50,625–54,375 | **nueva** `countdown` (maqueta con datos reales) | "Sabe cuándo se termina." (109–115,5) | 20 `tick` descendentes; **silencio 115,5–116** |
| 21 | `escribirle` | 116–124 | 54,375–58,125 | `plate`: `clientes-recompra` (panel, oscuro) | "El mensaje ya está escrito." (117–124) | 118 `click` |
| 22 | `whatsapp` | 124–132 | 58,125–61,875 | `device` (celular CSS 3D) con chat en vivo; placa `recompra-carrito-390` | "El link trae tu bolso." (124–127,5) | 124 `ding`; **silencio 127,5–128**; **DROP 3** |
| 23 | `bolso` | 132–140 | 61,875–65,625 | `device` + cifra (texto real del aviso) | "Tu bolso está armado." (texto de la app) | 133 `impact` |
| 24 | `vuelta` | 140–152 | 65,625–71,250 | `trace` (parte nueva `pista`) | "La próxima compra, ya armada." (142–147,5) | 145 `shimmer`; **silencio 151,5–152** |
| 25 | `en-vivo` | 152–164 | 71,250–76,875 | `eclipse-cta` (`axis: true`) | (firma) | de la receta |
| 26 | `precio-campana` | 164–172 | 76,875–80,625 | `eclipse-prices` `base-campaign`, n "11" | (libro) | `tick` por fila |
| 27 | `precio-pack` | 172–182 | 80,625–85,313 | `eclipse-prices` `launch-pack-draft`, n "12" (dice "sujeto a disponibilidad", `pricing.ts:40`) | (libro) | ídem |
| 28 | `cierre` | 182–192 | 85,313–90,000 | `eclipse-outro` | (firma) | corte en el tiempo 3 del c. 46, como T1 |
Cortes fuertes en el tiempo 1: 12, 40, 44, 48, 56, 64, 72, 84 (en el tiempo 1 del c. 22), 108, 116, 124, 128, 132, 140, 152, 164, 172.

## 4. Escenas protagonistas (coordenadas)
**A · `madre` + `fechas` + `diecisiete` (12–40): el año en un eje.**
- **Eje:** línea volt de 2 px en y = 1000, de x 96 (1 oct 2026) a 1824 (30 sep 2027); **x = 96 + 1728·d/364** (d = días desde el 1/10). 17 marcas de 24 px
  en el `startsOn` real de `themes.ts:11-30`: Madre 96 · Halloween 181 · Cyber 248 · Black Friday 348 · Navidad 386 · Año Nuevo 504 · San Valentín 680 ·
  CrossFit 761 · Vuelta al gym 851 · Act. Física 970 · Hot Sale 1145 · Running 1245 · Padre 1273 · Futbolista 1345 · Amigo 1449 · Boxeador 1734 ·
  Op. verano 1758. Rótulo mono 22 px sobre la marca activa (y = 962). 12,0: corte seco y se traza el eje (½ t, `trl.expo`); 12,5–13,5 las marcas, en orden.
- **Marco:** 1144 × 858 en x 388–1532, y 80–938 (columnas 3–10). 13–14: desde la marca del 1 OCT sube un filete en L hasta la esquina (388, 938) y el marco
  se traza en dos tramos (dos trazos a la vez, máximo). Adentro, como `splash-live`: la marca real arriba y `SplashStage` dia-de-la-madre.
- **Latidos re-cronometrados:** `dm-beat` prende a los 20/49/78 % de 900 ms + 260 (`dia-de-la-madre.css:19,31`) → ms 440, 701, 962. Reloj CSS: 260 en 14, 440 en 15, 701 en 16, 962 en 17, 1500 en 18.
- **Cadena 18–33 (16 fechas, una por tiempo):** en cada tiempo *b*, un **barrido de 1 px** cruza el marco de x 388 a 1532 en ¼ t (`clip-path: inset`
  sobre la entrante, `trl.expo`) y el cabezal del eje salta a la marca siguiente (½ t, `trl.expo`: la distancia es la del calendario real, Dic→Feb salta 176 px).
  La entrante corre su mecánica de ms 1000 a 1500 entre *b* y *b*+1 (`css-clock`): cada pantalla **termina de transformarse** justo en el corte siguiente.
- **34–40:** el marco se achica (escala 0,234, ½ t, `trl.expo`) a su celda; en 34,5 aparece la **hoja de 18** (atlas: la original + 17, en su clímax),
  6 × 3 celdas de 268 × 201 en x = 96 + k·292, y = 120 / 345 / 570 (cada celda = 2 columnas). 35–35,5: un solo `<path>` traza 17 filetes de cada celda a su
  marca del eje. Super display 96 px en columnas 1–12, línea base y = 900. 39,5: cuadro quieto y silencio. 40: corte a claro (DROP 1).
**B · `entrega` + `noche` (72–86): el carril es real.**
- Placa `seguimiento-entregado-1440-light` a 1706 × 960 (x 107, y 0); la banda abajo. 72,0–75,0: las 7 etapas se tildan en corcheas (72 … 75) y el relleno
  del `RouteMap` real (caja medida) avanza con ellas (una sola línea); la banda llega a la marca 05. 75,5: "Llegó a tu casa" (chip real).
- 76–77: trazo en la etiqueta `LOTE · VL-2606-W · VTO 06/2027` (`LotTag.tsx`, `tracking.ts:44`); 77,0 se despega a columnas 1–9 (y 360–560, display de 180 px
  de altura de mayúscula, escala 0,2 → 1) y "VTO 06/2027" en mono 48 debajo; la placa baja al 20 %. 83,5: la cifra se va, la placa vuelve entera; silencio.
  **84,0 (DROP 2):** corte seco a la misma placa en oscuro, como hace la app; la banda pasa de papel a noche en el mismo cuadro.
**C · `servicios` (108–116): el calendario llega a cero.** Datos: Nicolás Romero, `TUT-000108`, Mass Gainer 3 kg Dulce de leche ×1, entregado el 15/9
(`admin-orders.ts:55-56`); 20 servicios (`products-protein.ts:77`), ganadores 7 por semana (`customers.ts:56`) → se termina el 5/10, **el día de la demo**.
- Mono 28 a (96, 180): "MASS GAINER 3 KG · 20 SERV · 1 POR DÍA"; cifra display 360 px en columnas 1–4 (base y 700) con "SERVICIOS" debajo. Calendario: 20 celdas
  de 100 × 100 (10 por fila, calle 16) en columnas 5–12 (x 680–1824), filas y 300 y 416, fecha en mono 20 ("15/9" … "4/10"), y una celda 21 "5/10 · HOY" con
  filete volt en la fila y 532. 108: se trazan (½ t). 109–113: cada celda se tacha con una diagonal de 1 px (5 por tiempo, en semicorcheas); la cifra cambia **solo en los
  tiempos**: 20 → 15 (110) → 10 (111) → 5 (112) → 0 (113); la banda se vacía de 07 a 0 a la par (la batería de `PotBattery`). 113,5: "Se te termina hoy"
  (`runOutLineForBuyer`). Nota mono 22 bajo el super: "Calculado por los servicios del envase. Orientativo." (como dice la app).
**D · `escribirle` + `whatsapp` + `bolso` (116–140): la recompra, sin prometer de más.**
- 116: placa `clientes-recompra` (panel). Trazo en la tarjeta `[data-write="nico.r@ejemplo.com"]` (116–116,5): "Mass Gainer 3 kg: se le termina hoy" y el mensaje
  ya escrito; 117 trazo en "Escribirle por WhatsApp"; 118 click (el botón se hunde 2 px). Nota mono: "Lo mandás vos, con un toque." (honestidad, ver §7).
- 124: celular CSS 3D 380 × 780 con centro (1240, 540), perspectiva 1600, gira en Y de −8° a −3° (124–132, `sine.inOut`). Pantalla **en vivo** (DOM): barra
  "Tu tienda" y una burbuja de 300 px con el texto exacto de `writeMessage` (`repurchase-today.ts:57-60`): "¡Hola Nicolás! Te escribimos de Tu tienda.
  Calculamos que hoy se te termina tu Mass Gainer 3 kg. ¿Te preparamos otro? En Mar del Plata te lo llevamos con cadete al día hábil siguiente. Te dejé el
  bolso armado con lo mismo, para que confirmes cuando quieras: …/recompra/?bolso=mass-gainer.mg-dulce-de-leche-3kg.1" (el formato es el de `cart-link.ts:17-20`).
- 125–126: subrayado de 1 px en el link; 126, 126,5 y 127: a la izquierda (x 96) se descompone en tres filas mono (etiqueta 22 px `#a6abb0`, valor 44 px): PRODUCTO
  `mass-gainer` (y 440) · VARIANTE `mg-dulce-de-leche-3kg` (y 540) · CANTIDAD `1` (y 640). 127,5: toque (anillo de 1 px) y silencio.
- **128 (DROP 3):** la pantalla corta a la placa `recompra-carrito-390-dark` con el aviso real "Tu bolso está armado · 1 producto de tu compra anterior. Confirmá
  cuando quieras." (`RepurchaseLanding.tsx:34`); la banda se llena de 0 a 07 en 1 t (`trl.rampa`, llega en 129).
- 132–133: el celular se corre a columnas 1–4 (envoltorio 2D `[data-t="shift"]`, `trl.expo`); "TU BOLSO / ESTÁ ARMADO." se despega del aviso a columnas 6–12
  (display 150 px, y 300–640); 133,5 la descripción en mono 30 (y 720); 134,5 "Mass Gainer 3 kg · Dulce de leche · $ 58.900" (precio de `products-protein.ts:75`; verificar contra la placa).
- **`vuelta` (140–152):** negro con grilla. 140–142: la línea de la banda sube a y 700 y se cierra en una **pista** (rectas de x 384 a 1536, curvas de r 160, y 380–700)
  con `strokeDashoffset` (`trl.rampa`). Super adentro, display 120. 145: la marca real de Tu tienda (rayo + nombre, 64 px) en (960, 900). 148–149,5: la pista
  se aplasta a la línea del eje `AXIS_Y` = 860; 151,5 queda sola; 152 la cta la pasa a corona y la apaga (prop `axis`, ya existe).
## 5. Transiciones firma
(1) **Barrido de 1 px**: una raya vertical cruza el marco y deja la fecha nueva detrás; 16 veces, solo en el acto I. (2) **La banda**: el carril cruza todos los
cortes de II a V en el mismo lugar y el rótulo de capítulo viaja sobre la marca activa. (3) **El dato se despega** (caja medida, escala ≤ 1), solo 5 veces:
"$ 3.202", "$ 122.145", "LOTE VL-2606-W", "$ 60.000", "Tu bolso está armado". (4) **Corte seco de tema** en 84, silencio antes. (5) **Línea → pista → eje** de Eclipse.

## 6. Música y silencios
| Tiempos | Estilo | Qué pasa |
|---|---|---|
| 0–12 · 12–18 | `tension` (silencio 11,5–12) · `pulso` (nuevo: dron + sub en 15, 16, 17) | firma · los tres latidos del monitor de la Madre |
| 18–34 | `campanas` (nuevo: pad Am–F–C–G sin bombo) | cada corte de fecha es una nota del estribillo en negras (16 notas = 4 compases) |
| 34–39,5 / 39,5–40 | subida / **silencio** | la hoja de 18 |
| 40–64 · 64–72 | **DROP 1** `drop` · `stutter` | letras de "CREATNA" y tintes sobre el estribillo · 01/03, 02/03, 03/03 en 64, 66, 68 |
| 72–83,5 / 83,5–84 | `half` / **silencio** | entrega; 7 ticks en corcheas (las etapas) |
| 84–108 | **DROP 2** `drop` | oscuro; 0·3·1·0 del locker = Mi · Sol · La · Mi |
| 108–115,5 / 115,5–116 | `cuenta` (nuevo: dron + 20 ticks que bajan de La6 a La4) / **silencio** | el pote se vacía |
| 116–127,5 / 127,5–128 | `tension` sin subida / **silencio** | panel y chat; `ding` en 124 (`bell` 88 + `tick` 93) |
| 128–140 · 140–152 | **DROP 3** `drop` · `half` en campana (**silencio** 151,5–152) | el estribillo vuelve entero con el bolso · la pista; queda en Sol |
| 152–182 · 182–192 | `calm` · `final` | resuelve en Do en "Probalo en vivo"; precios; cierre |
Seis silencios reales, tres drops. Regla de T1: ningún toque sin sonido ni sonido sin toque; si se mueve una nota, se mueve el evento.

## 7. Real / maqueta / condicional y honestidad
- **Real en vivo:** `SplashStage` de las 17 fechas, ruleta, bolsa, Shaker Rush (semilla y piloto automático). **Real en placa:** búsqueda, ficha, comparador, stack,
  pack, checkout, seguimiento, club, misiones, gift card, locker, panel de Clientes, carrito de recompra. **Maqueta con datos reales:** eje de calendario
  (fechas de `themes.ts`), calendario de servicios, descomposición del link, pista final. **Maqueta de terceros:** la burbuja de chat (sin logo ni colores
  de WhatsApp; la app nombra "WhatsApp" y abre `wa.me`, no tiene interfaz de chat). **Condicional:** el toque al link abre la tienda solo si hay stock (`decodeCartLink`).
- **WhatsApp de recompra, qué hace de verdad la demo:** el panel calcula "A quién escribirle hoy" (5 personas, "Orientativo", `WriteTodayPanel.tsx:49-66`), deja el mensaje
  escrito y el link; **"Escribirle por WhatsApp" abre wa.me con el texto: lo manda el dueño** (`customerWhatsappLink`). El email "Tu pote se está por terminar" va a la
  bandeja de salida ("La demo no envía nada", `NotifyActions.tsx:25`). Por eso **nunca** "mensaje automático": los supers dicen "Sabe cuándo se termina." y "El mensaje
  ya está escrito.", con la nota "Lo mandás vos, con un toque.". El envío automático existe solo como extra de Eclipse en el libro: "WhatsApp estándar (sin IA)",
  USD 100 = $ 150.000 (`prices.v2026-10-16.json:30`): si el juez lo quiere, va como nota en `escribirle`, no como promesa del producto.
- **Pack mensual:** la suscripción es simulada; la placa muestra "Demo: no se cobra ni se debita nada". **Pedidos:** el checkout de la demo confirma `TUT-DEMO-0001`
  (`commerce.ts:84`) y el seguimiento es `TUT-DEMO-0000`; no se inventa `TUT-000123` (es un pedido de Diego en el panel). Las compras de II–III y la recompra de V no son
  "la misma persona": no se nombra a nadie hasta el panel.

## 8. Qué corto del brief y por qué
- **Envío viajando por el país (`globeship`):** la app no lo hace. El seguimiento real es un carril recto "del local a tu casa", ilustrativo y sin mapas (`RouteMap.tsx:10,40`),
  y la tienda despacha con cadete en Mar del Plata, donde está el local ("hasta la puerta en Mar del Plata" no tiene viaje por el país). Lo reemplaza el carril real + el lote.
- **Quiz** (lo mismo que el stack, sin captura del resultado), **carrusel y franja de campaña** (el acto I ya es "fechas"), **cupones y recordatorios** como planos
  propios (la ruleta da el cupón; el recordatorio es la protagonista C), **bolsa completa** (T1 la tiene: acá el último golpe), **planes y extras** del libro (firma y T4).

## 9. Riesgos
- **60 fps:** 17 `SplashStage` montadas a la vez (hasta 7 capas SVG cada una); medir en hardware real; respaldo: modo liviano con 9 fechas y el resto en el atlas.
  CSS 3D solo en `shaker` y `whatsapp`; el celular de T2 con 2 capas de canto (no 8: con 8 la escena pasa de 12 capas, ver QA de T1). Un solo canvas (94–96).
- **Destellos (WCAG 2.3.1):** cortes de fecha 1 por tiempo (2,13/s); tintes del sabor 2/s; la cifra de servicios cambia solo en los tiempos; claro↔oscuro una vez en 40 y una en 84;
  ruleta con el velo de T1; el barrido pasa una vez por punto por tiempo. Medir el campo local a 60 fps en 18–34 y 44–46 antes de cerrar.
- **Contraste en claro:** volt sobre papel no llega a AA: en II–III los trazos van en `voltInk` `#4a6a00` (`tutienda.ts:53`) y los supers en `#060707`. **Densidad:** la ráfaga IV
  corta cada 2 t, por eso los supers van por acto (≥ 1,9 s). **Chat a 21 px:** probar que se lea en el MP4 de 720p. **Honestidad:** §7.

## 10. Prerrequisitos en el código
1. `plate`/`device` dejan de leer `shots/t1/` fijo (`plate-kit.tsx:23`, `device-kit.tsx:30`): carpeta por pieza. `plate` suma modos `typo`, `sabor`, `cifra` (genérico de T1 `cuotas`), `carril` y la opción `band` (placa a 960 px de alto).
2. **Receta `splash-chain`** (sobre `splash-live`): eje desde `seasonalThemes`, reloj re-cronometrado por fecha, barrido con `clip-path`, achique a celda y atlas.
3. **`Band`** compartido (como `Grid`/`AXIS_Y` en `core/grid.ts`): carril de 7 marcas y su relleno; `TR.voltInk` en `kit.ts` desde la ficha de marca.
4. **Capturas nuevas** (`trailer-plates.mjs`, build `tutienda`, 1600×900 a 2×): buscar vacío y con "creatna" (claro), ficha Ionic Whey en 4 sabores, comparador, stack, pack con
   el clic, checkout pasos 1–3 y confirmación, seguimiento claro y oscuro con cajas de carril y lote, club niveles y misiones, gift card, locker (cerrado/abierto/revelación),
   `clientes-recompra` con la caja de Nicolás, `recompra/?bolso=mass-gainer.mg-dulce-de-leche-3kg.1` a 390 con el aviso, y el **atlas** de 18 pantallas (`capture-splash-frames.mjs`, 1500 ms).
5. `device-kit`: `Phone` con hijos en vivo y canto de 2 capas; `gift-live` con `from: 4`; `locker-live` (o placas de estado); `countdown`; `trace` parte `pista`.
6. **Música:** estilos `pulso`, `campanas`, `cuenta`; voz `ding`; 6 silencios y 3 drops en `t2-sonido.ts`; `t2-resumen.ts`. **No mostrar** `VOL-000121` (`gift-cards.ts:18,37`).
7. **9:16:** eje vertical a la izquierda (x 60) con la hoja en 3 × 6; banda al pie (y 1800–1920); celular a todo el ancho; supers en el tercio superior; cifras en dos renglones.
   **Movimiento reducido:** láminas finales por escena con fundido de ¼ t; la cadena de fechas pasa a 4 láminas (Madre, Black Friday, CrossFit, hoja); mismos cortes y sonido.
