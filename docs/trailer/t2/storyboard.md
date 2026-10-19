# T2 · "La experiencia de compra": storyboard definitivo

> **Estado: para aprobar (Ignacio).** Con esto, T2.2 hace la música y T2.3 construye sin decidir nada. Decisiones abiertas: `veredicto.md` §6.

| Documento | Qué tiene |
|---|---|
| [`escenas.md`](escenas.md) y [`escenas-2.md`](escenas-2.md) | Cada escena: coordenadas, coreografía, curvas y cues |
| [`sonido.md`](sonido.md) | Partitura por compás, silencios, drops y cue sheet |
| [`veredicto.md`](veredicto.md) | Puntajes, injertos, descartes, verificación y preguntas |
| [`storyboard.jpg`](storyboard.jpg) | Lámina con un cuadro de referencia por escena |

## 1. Ficha
| Campo | Valor |
|---|---|
| Pieza | `t2`, en `/trailer/t2/` (16:9 y `?ratio=9x16`) |
| Duración | **90,0 s = 192 tiempos = 48 compases a 128 BPM** (1 tiempo = 0,46875 s; 1 compás = 1,875 s) |
| Para quién | Dueño de una tienda de suplementos; se ve en redes y email (**mudo** al arrancar) y en la demo |
| Una frase | "Tu tienda tiene una compra que ninguna otra tiene, y hace que el cliente vuelva." |
| Cierre | `stack` (promesa) → `eclipse-cta` → 4 páginas de `eclipse-prices` → `eclipse-outro` |

## 2. Dirección: "Carga completa sobre el carril" (Precisión + injertos)
- **Hilo:** la batería `Carga` (10 celdas, forma de `BatteryMeter`) vive abajo a la derecha desde el DROP 1 y suma una celda por
  capítulo (02 a 10). En la recompra deja su lugar, se vuelve el pote de Nicolás, se vacía hasta "Se te termina hoy" y, cuando él toca
  el link, se vuelve a llenar. La compra no es una línea: es una vuelta.
- **Actos:** I · cada fecha, otra tienda (oscuro) · II · se compra de día (claro) · DROP 2: un toque y es de noche · III · se juega y se
  regala (oscuro) · IV · se termina y vuelve (protagonista) · promesa y firma.
- **Gramática de color (de T1):** volt = Tu tienda · corona = Eclipse (solo en la firma) · amanecer = la decisión. En claro los trazos van en `voltInk` y los supers en tinta `#060707`.
- **Sin sonido:** un texto grande por vez, capítulos numerados con la batería, cifras reales enormes y el link en tres filas.
- **Con sonido:** campanas que tocan el estribillo en cada fecha, tres drops tras silencio real, el tono plano de T1 en el pote vacío y el estribillo que vuelve con el bolso.

## 3. Escenas
| # | id | Tiempos | Segundos | Receta (✱ = nueva o modo nuevo) | Props clave | Super o rótulo |
|---|---|---|---|---|---|---|
| 1 | `apertura` | 0–12 | 0,000–5,625 | `eclipse-intro` | — | (ECLIPSE · "Presenta…") |
| 2 | `madre` | 12–20 | 5,625–9,375 | ✱ `splash-chain` `part: "hero"` | `dia-de-la-madre`, reloj de latidos | "Una pantalla de carga por fecha." |
| 3 | `fechas` | 20–36 | 9,375–16,875 | ✱ `splash-chain` `part: "chain"` | 16 fechas, una por tiempo, eje | rótulo del eje ("19 OCT · HALLOWEEN") |
| 4 | `diecisiete` | 36–40 | 16,875–18,750 | ✱ `splash-chain` `part: "sheet"` | atlas de 18 | "17 fechas. Ninguna igual." |
| 5 | `buscar` | 40–44 | 18,750–20,625 | ✱ `plate` `mode: "pasos"` | `type: "creatna"`, 4 resultados | 02 · Encuentra aunque escribas mal |
| 6 | `sabor` | 44–48 | 20,625–22,500 | ✱ `plate` `pasos` | ficha Mass Gainer ×3 sabores | 03 · La imagen cambia con el sabor |
| 7 | `comparar` | 48–52 | 22,500–24,375 | ✱ `plate` `pasos` | 4 trazos en `[data-best=true]` | 04 · Compará lado a lado |
| 8 | `stack` | 52–56 | 24,375–26,250 | ✱ `plate` `pasos` | armador → resumen, trazo en −$ 12.170 | 05 · Armá tu stack |
| 9 | `pack` | 56–60 | 26,250–28,125 | ✱ `plate` `pasos` (cifra) | "Cada mes: $ 122.145" | 06 · Un pack, todos los meses |
| 10 | `checkout` | 60–64 | 28,125–30,000 | ✱ `plate` `pasos` | 01/03 · 02/03 · 03/03 · confirmación | 07 · Checkout en 3 pasos |
| 11 | `entrega` | 64–72 | 30,000–33,750 | ✱ `plate` `pasos` (carril + cifra) | 7 marcas, "LOTE VL-2606-W", anillo en la luna | 08 · Seguimiento con lote |
| 12 | `noche` | 72–76 | 33,750–35,625 | `plate` `mode: "tema"` + ✱ `seco: true` | misma placa en oscuro | "Y de noche, se juega." |
| 13 | `club` | 76–80 | 35,625–37,500 | ✱ `plate` `pasos` | club-inicio → misiones | 09 · Club, ruleta y Shaker Rush |
| 14 | `ruleta` | 80–84 | 37,500–39,375 | `wheel-live` | `prize: 1` ("Envío gratis") | (09 sigue) |
| 15 | `shaker` | 84–88 | 39,375–41,250 | `shaker-replay` | el único canvas | (09 sigue) |
| 16 | `giftcard` | 88–90 | 41,250–42,188 | ✱ `plate` `pasos` (cifra) | "$ 60.000" | 10 · Regalos que se abren |
| 17 | `locker` | 90–96 | 42,188–45,000 | `gift-live` + ✱ `opening: "locker"` | 0301 ✗ → 0310 ✓, luz adentro | (10 sigue) |
| 18 | `pote` | 96–104 | 45,000–48,750 | ✱ `recompra` `part: "pote"` | 20 → 0 servicios, batería grande | "La tienda calcula cuándo se termina." |
| 19 | `escribirle` | 104–112 | 48,750–52,500 | ✱ `plate` `pasos` (foco) | tarjeta de Nicolás, velo de foco, click | "El mensaje ya está escrito." → "Lo mandás vos, con un toque." |
| 20 | `chat` | 112–120 | 52,500–56,250 | ✱ `recompra` `part: "chat"` | celular, burbuja, link en 3 filas | "Le llega a tu cliente." → "Con el link a su bolso." |
| 21 | `bolso` | 120–132 | 56,250–61,875 | ✱ `recompra` `part: "bolso"` | carrito 390 + toast, batería llena | "Un toque y vuelve a cargar." → "Solo falta confirmar." |
| 22 | `promesa` | 132–136 | 61,875–63,750 | `stack` | "Para que" / "vuelvan" / "a comprar." | (la promesa) |
| 23 | `en-vivo` | 136–148 | 63,750–69,375 | `eclipse-cta` | `axis: true` | "Probalo en vivo." · 223-446 7881 |
| 24 | `precio-campana` | 148–156 | 69,375–73,125 | `eclipse-prices` | `base-campaign`, n "11" | (libro) |
| 25 | `precio-pack` | 156–164 | 73,125–76,875 | `eclipse-prices` | `launch-pack-draft`, n "12" (sujeto a disponibilidad) | (libro) |
| 26 | `precio-planes` | 164–172 | 76,875–80,625 | `eclipse-prices` | `planes`, n "13" | (libro) |
| 27 | `precio-extras` | 172–182 | 80,625–85,313 | `eclipse-prices` | `extras`, n "14" | (libro) |
| 28 | `cierre` | 182–192 | 85,313–90,000 | `eclipse-outro` | — | (ECLIPSE) |

Suman 192 tiempos. Cortes fuertes en el tiempo 1: 12, 20, 36, 40 (DROP 1), 44, 48, 52, 56, 60, 64, 72 (DROP 2), 76, 80, 84, 88, 96, 104, 112,
120 (DROP 3), 132, 136, 148, 156, 164, 172. Cortes menores: 90 y 182 (tiempo 3, como el cierre de T1); los barridos de 21 a 35 son internos de `splash-chain`.
Supers: ≤ 6 palabras, ≥ 2,5 tiempos (1,17 s), uno a la vez; los rótulos 02–10 duran 4 tiempos o más.

## 4. Música (detalle en `sonido.md`)
| Tiempos | Estilo | Qué pasa |
|---|---|---|
| 0–12 | `tension` (silencio 11,5–12) | Apertura |
| 12–20 | `clon` + 3 latidos | Día de la Madre: los latidos del monitor |
| 20–36 | ✱ `campanas` | Cada fecha, una nota del estribillo en negras |
| 36–40 | `tension` (subida, silencio 39,5–40) | La hoja de 18 |
| 40–60 · 60–64 | **DROP 1** `drop` · `stutter` | La compra; los eventos caen en notas |
| 64–72 | `half` (silencio 71,5–72) | Entrega, lote y el anillo en la luna |
| 72–96 | **DROP 2** `drop` (sin bombo ni bajo 90–93) | Noche, club, juegos y regalos; los números del locker son la batería |
| 96–101 · 101–104 | `clon` · `plano` (silencio 103,5–104) | El pote baja; tono plano de T1 en cero |
| 104–120 | `half` (silencio 119,5–120) | Panel, chat y el "ding" |
| 120–136 | **DROP 3** `drop` (silencio 135,5–136) | El bolso armado y la promesa |
| 136–182 · 182–192 | `calm` · `final` | En vivo y precios · el eclipse se cierra |

## 5. Reglas visuales
- **Grilla** `core/grid.ts`: columna *k* en x = 96 + (k−1)·146 (ancho 122); fila *r* en y = 60 + (r−1)·164 (alto 140). `FRAME` 4:3 = x 680, y 111, 1144 × 858.
  Grilla volt al 14 % en escenas de fondo propio (1–4, 18, 22); las placas van sin grilla.
- **Capas:** fondo · grilla · contenido (placa, arte vivo, equipo) · trazos y velo · cifra · super o rótulo · `Carga` · `flash`/`grano` del motor.
- **Tipografía:** display de la tienda en mayúsculas para supers (96 px; 150–220 en cifras), mono de la tienda para rótulos (34 px, tracking
  0,12 em) y para datos (22–44 px). Super estándar: columnas 1–8, línea base y = 1000, sobre un degradé fijo de 300 px al pie (`TR.night` →
  transparente; en claro, `TR.paper`). Rótulo: `Chip` de T1 en (96, 60), claro sobre placas claras; abajo, (96, 960), si la pantalla trae título arriba.
- **`Carga`:** chip `#060707` al 94 % de 284 × 48 en (1540, 972); "05/10" en mono 22 a x 1556; 10 celdas de 14 × 24 desde x 1632, calle 4,
  borne 4 × 10 en x 1812. Celda prendida = `TR.volt` (en claro `voltInk`); en ≤ 20 %, el tono `danger` de `BatteryMeter`. Prende con `set`.
  Aparece en 40 con 2 celdas; 3 en 44, 4 en 48, 5 en 52, 6 en 56, 7 en 60, 8 en 64, 9 en 76, 10 en 88. Si una caja medida cae debajo, sube a y = 900.
- **Curvas:** `trl.expo` (interfaz, trazos, texto), `trl.rampa` (cámara y llegadas en golpe), `trl.whip` solo en el barrido del eje. Nada de `trl.punch` en la marca.
- **Movimiento:** cámara + un grupo como máximo; ≤ 3 elementos en foco. Solo `transform` y `opacity`, con excepciones enumeradas:
  `clip-path: inset()` del barrido de fechas (20–36, uno a la vez), `strokeDashoffset` de los trazos (dos a la vez) y el `backgroundColor` de las celdas.
- **Marca:** el rayo y "TU TIENDA" nunca se trazan ni deforman; aparecen en la pantalla de carga, las placas y la promesa. El eclipse solo en 1 y 23–28.
- **Tema:** I oscuro · II claro · un solo corte a oscuro en 72 · III y IV oscuro. Las bandas `night-2` de la app (la tarjeta del carril) quedan oscuras en los dos modos.
- **Fotosensibilidad:** < 3 cambios de luminancia por segundo en área grande. Fechas: un barrido por tiempo (2,13/s); sabores: 1 por tiempo sobre ≈ 30 % del cuadro;
  un solo claro ↔ oscuro en 40 y en 72. Se mide a 60 fps en 20–36, 44–47 y 80–83 antes de cerrar (QA de T1).

## 6. Placa o en vivo
- **Placas** (capturas 2× de la app, ficha `tutienda`, sin el banner de demo): búsqueda, ficha, comparador, stack, pack, checkout, seguimiento,
  club, gift card, panel de Clientes y carrito de recompra. Encima, en vivo, solo trazos, velo, cifra que se despega y `Carga`.
- **En vivo con el reloj del trailer:** `SplashStage` de 17 fechas (`css-clock`), ruleta, Shaker Rush (canvas, semilla y piloto automático),
  `LockerArt` (SVG con `digits`, `status`, `misses`, `swing`), `BatteryMeter` del pote.
- **Maqueta con datos reales:** eje de calendario (`themes.ts`), batería de Nicolás (cálculo real de `remainingPct`; "Mi box" la muestra a quien
  tiene cuenta), el chat del celular (sin logo, verde ni sonido de WhatsApp; texto exacto de `writeMessage`) y las tres filas del link.
- **Estilización declarada:** el paso de una fecha a otra (en la app cada fecha sale sola, sin transición).

## 7. Datos reales que se muestran
| Dato | De dónde sale |
|---|---|
| 17 fechas + la original, fechas de inicio, Día de la Madre activo el 5/10 | `splash-scenes.ts:35-54`, `themes.ts:11-30` |
| "creatna" → 4 resultados, el 4.º Mass Gainer 3 kg | `search.ts:98`, `buscar/?q=creatna` |
| Mass Gainer 3 kg $ 58.900, 20 servicios, Chocolate · Banana · Dulce de leche, "Imagen ilustrativa" | `products-protein.ts:73-77`, `ProductArt.tsx:55` |
| Stack "Fuerza": $ 121.700 − $ 12.170 = $ 109.530 | `stack-builder.ts:104`, captura `stack-resumen` |
| Pack Hipertrofia: "Cada mes: $ 122.145", "Demo: no se cobra ni se debita nada." | `packs.ts:11-14`, `PackBuyPanel.tsx:59,69` |
| 01/03 "Datos y entrega" · 02/03 "Pago" · 03/03 "Revisar" · `TUT-DEMO-0001` "Pendiente de pago" | `CheckoutView.tsx:29`, `commerce.ts:84`, `orders.ts:12` |
| Carril "Local Tu tienda · Mar del Plata → Tu casa" (ilustrativo), `TUT-DEMO-0000`, LOTE VL-2606-W · VTO 06/2027 | `RouteMap.tsx:10-12,82-84`, `tracking.ts:25,44` |
| Niveles Novato $ 0 · Atleta $ 50.000 · Élite $ 150.000 · Bestia $ 300.000 (los puntos no se canjean) | `fixtures/club.ts:21-26` |
| Gift card $ 60.000 Gaby → Agus; locker 0310 Mili → Fran | `gifts.ts:82-87` |
| Nicolás Romero, TUT-000108, Mass Gainer Dulce de leche ×1, se le termina el 5/10 | `admin-orders.ts:55-56` |
| Mensaje y link `recompra/?bolso=mass-gainer.mg-dulce-de-leche-3kg.1` | `repurchase-today.ts:56-60`, `cart-link.ts:26-29` |
| Libro de precios, dólar a $ 1.500, 223-446 7881 | `eclipse/book.ts`, `eclipse/tokens.ts` |

## 8. 9:16 y movimiento reducido
**9:16** (T2.5; misma partitura y cortes): grilla 6 × 12; `FRAME` arriba (960 × 720) y el eje **vertical** en x = 60 (las 17 marcas de
y 150 a 1770); la hoja en 3 × 6. Placas de celular (`-t`, 390 × 693 o 640 × 1138) a todo el ancho; rótulos en (60, 90); supers en el
tercio superior a 96 px; cifras en dos renglones ("LOTE" / "VL-2606-W"); `Carga` en (60, 1800). Celular del chat y del bolso a todo el alto (el DROP 3 es natural en vertical).
**Reducido** (`reduced`): sin barridos, cámara ni 3D. Cada escena es una lámina con su estado final que entra con fundido de ¼ de tiempo en
su tiempo; la cadena de fechas pasa a 4 láminas (Madre 12, Black Friday 22, CrossFit 26, hoja 36); el pote salta a 0 y la batería a llena;
el locker aparece abierto. Supers, cortes y sonido no cambian.

## 9. Presupuesto de rendimiento
- ≤ 12 capas compuestas por escena (la más cargada, `chat`: fondo, celular con 3 capas de canto, pantalla, burbuja, 3 filas, super, `Carga` = 11).
- Un solo canvas: Shaker Rush, montado de 84 a 88. CSS 3D solo en `shaker`, `chat` y `bolso` (el celular, con 3 capas de canto, no 8).
- Sin `backdrop-filter` ni blur. `GameResult` sin su `backdrop-blur`.
- Fechas: 17 `SplashStage` montadas y ocultas (`autoAlpha`), dos visibles a la vez; el arte decodificado antes de armar. **Modo liviano:**
  9 fechas en vivo y el resto como cuadros del atlas.
- Placas JPEG de 2400 px de ancho (≤ 2880). Atlas de 18 cuadros en una sola imagen.

## 10. Prerrequisitos en el código (para T2.2 y T2.3)
1. **Motor:** `plate-kit.tsx:20` y `device-kit.tsx:37` leen `shots/t1/` fijo → carpeta por pieza (prop `shots`, QA de T1 lente 6).
   `Phone` acepta pantalla DOM (`children`) y `layers` (3). Nada más cambia en el motor.
2. **Recetas nuevas (2):** `splash-chain` (`hero`, `chain`, `sheet`; reloj por fecha, barrido, eje desde `seasonalThemes`, atlas) y
   `recompra` (`pote`, `chat`, `bolso`; datos calculados con `writeToday`/`writeMessage`/`cartLinkPath` desde los fixtures, nunca a mano).
3. **Modos y opciones (3):** `plate` `mode: "pasos"` (secuencia de placas por tiempo, trazos, texto tipeado, carril, velo de foco y cifra que se
   despega; generaliza `cuotas`), `plate` `tema` con `seco: true` (corte en vez de círculo) y `gift-live` `opening: "locker"` (`LockerArt` con `swing` del timeline y `lk-shake` con `css-clock`).
4. **Pieza compartida (1):** `Carga` en `recipes/tpl.tsx` (como `Grid`), con su posición por `ratio`.
5. **Placas nuevas (21)** con `scripts/trailer-plates.mjs` (build `NEXT_PUBLIC_BRAND=tutienda`, 1600 × 900 a 2×) en `public/trailer/shots/t2/` y
   cajas en `src/trailer/pieces/t2-plates.json`; tabla en [`escenas-2.md`](escenas-2.md) §Placas. Más el atlas de 18 con `scripts/capture-splash-frames.mjs` a 1750 ms.
6. **Música:** estilo `campanas` en `score.ts`; `t2-sonido.ts` (6 silencios, 3 drops, 1 corte de voces) y `t2-resumen.ts`. El "ding" son dos `bell`: sin voz nueva.
7. **Tests:** cada cifra de pantalla ($ 58.900, $ 60.000, $ 122.145, 0310, 17) contra fixtures y engine; ninguna placa con "VOLTA" ni `VOL-000121`; cada nota atada a su evento.

## 11. Aprobación
- [ ] Ignacio aprueba el storyboard y responde `veredicto.md` §6.
