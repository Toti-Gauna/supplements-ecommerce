# T2 · Dirección lúdica: «Carga completa»

Director lúdico · la marca como personaje, con contención · 128 BPM · **192 tiempos = 48 compases = 90,0 s**.
Todo lo de abajo está verificado contra el código (archivo citado). Real = app tal cual · placa = captura 2× real · maqueta = armado para el trailer · condicional = la app lo hace solo en cierto estado.

## 1. Idea e hilo conductor
- **La marca ya tiene personaje y no hay que inventarlo: la batería.** `BatteryMeter.tsx` se define como "barra de progreso con forma de batería (el motivo de la marca)", y la tienda habla en carga: "Sumá carga. Subí de nivel." (`ClubHero.tsx:46`), "Cargá la barra y girá" (`WheelChargeBar.tsx:36`), "Cargá tu mejor versión" (`studio.ts:72`), la carga del bolso (`BagLoad.tsx`).
- **El hilo:** un medidor de 10 celdas vive pegado al rótulo (posición fija) y suma una celda por capítulo (01 a 10). Cuando se llena pasa a ser el **pote de Nicolás**: se descarga día por día hasta cero ("Se te termina hoy"). La tienda le escribe, él toca el link y **vuelve a cargar**. La compra no es una línea: es una vuelta.
- **Familia con T1 sin copiarla:** T1 terminaba en "Y después de comprar, nada." con una línea plana. En T2, la batería en cero suena con **el mismo tono plano (La5)**, y la respuesta es el WhatsApp. Se mantienen la grilla, el rótulo numerado y "la tienda toca su estribillo".
- **Personajes, sin persecuciones:** (1) la batería y (2) el **cadete de Tu tienda** en bici, real (`tracking/Courier.tsx`, lleva el rayo en la caja; su ropa cambia con la fecha, `Travelers.tsx:18`). Los dos se mueven en coordenadas fijas del escenario, en función del tiempo. Los toques son el anillo de impacto de la app sobre cajas **medidas al sacar la placa** (JSON), nunca sobre DOM vivo.
- **Humor con contención:** el chiste es la situación ("creatna", el locker que no abre al primer intento, "se la juega"), nunca el cliente ni su cuerpo. No hay ojos, caras ni onomatopeyas; no se habla de peso ni de resultados (Mass Gainer tiene la pregunta "¿Engorda?": no se toca).

## 2. Duración y actos (1 tiempo = 0,46875 s)
**Por qué 90 s:** el cierre ocupa 56 tiempos fijos (cta 12 + 4 páginas de precios 34 + outro 10, por la decisión de Ignacio de mostrar campaña, pack, planes y extras). Para el contenido quedan 124 tiempos (58 s): 10 capítulos de 1 compás y un protagonista de 8 compases. Con 100 s sobraría texto; con menos, el WhatsApp no respira. 192 es múltiplo de 4 y la versión para email entra en los 10 MB.

| Acto | Tiempos | Segundos | Tema de la app | Qué cuenta |
|---|---|---|---|---|
| I · Fechas | 0–32 | 0–15,0 | oscuro | Eclipse presenta → la barra se carga → **9 fechas se dan vuelta** |
| II · De día se compra | 32–64 | 15,0–30,0 | **claro** | buscar, ficha, comparar, stack, packs, checkout, envío con lote |
| III · De noche se juega | 64–88 | 30,0–41,25 | oscuro (DROP 2) | club, ruleta, Shaker Rush, regalos |
| IV · Se termina, se recarga | 88–120 | 41,25–56,25 | oscuro | **recompra por WhatsApp** (protagonista) |
| V · Firma | 120–192 | 56,25–90,0 | Eclipse | verbos, asesoría, en vivo, precios, cierre |

## 3. Tabla de escenas
| # | id | tiempos | s | receta / pieza | rótulo (R) o super (S) | cue clave |
|---|---|---|---|---|---|---|
| 1 | apertura | 0–12 | 0–5,625 | `eclipse-intro` | (firma) | corta seco en 11,5 |
| 2 | barra | 12–16 | 5,625–7,5 | `splash-live` (escena `original`) | R 01 · Una pantalla de carga por fecha | discos de a pares en 12–15 (clanc + tick); **silencio 15,5–16** |
| 3 | **fechas** | 16–32 | 7,5–15,0 | `splash-flip` (nueva) | S 28–31,5 "Cambia sola con cada fecha." | **DROP 1** en 16; cada vuelta, una nota del estribillo |
| 4 | buscar | 32–36 | 15,0–16,875 | `plate` (claro) + máscara por letra | R 02 · Encuentra aunque escribas mal | 7 letras en semicorcheas 32–33,5; tick en 34 |
| 5 | sabor | 36–40 | 16,875–18,75 | `testbench-live` (nueva) + placa de sabores | R 03 · El sabor cambia la foto | toques en 37, 38, 39 (Mi, Sol, La) |
| 6 | comparar | 40–44 | 18,75–20,625 | `plate` (2 placas, por renglón) | R 04 · Lo mejor de cada renglón | 6 "MEJOR" en corcheas, 40,5–43 |
| 7 | stack | 44–48 | 20,625–22,5 | `plate` + cifra que se despega | R 05 · Armá tu stack | impacto en 45 ("$ 109.530") |
| 8 | pack | 48–52 | 22,5–24,375 | `plate` | R 06 · El pack, todos los meses | click en 49 |
| 9 | checkout | 52–56 | 24,375–26,25 | `plate` ×4 (pasos y confirmación) | R 07 · Checkout en 3 pasos | ticks en 52, 53, 54; impacto en 55 |
| 10 | **envío** | 56–64 | 26,25–30,0 | `route-live` (nueva) + placa con cabecera | R 08 · Seguimiento con lote | pedaleo a medio tiempo; **silencio 63,5–64** |
| 11 | **noche** | 64–68 | 30,0–31,875 | `plate` modo `tema` (seguimiento) | S 64,5–68 "Y de noche, se juega." | **DROP 2**: click en 64 |
| 12 | club | 68–72 | 31,875–33,75 | `plate` (misiones, oscuro, antes y después) | R 09 · Club, misiones y juegos | toque en 69 |
| 13 | ruleta | 72–76 | 33,75–35,625 | `wheel-live` + barra de carga | (R 09 sigue) | carga 72–73; ticks; impacto en 75 sobre el La |
| 14 | shaker | 76–80 | 35,625–37,5 | `shaker-replay` sin celular | (R 09 sigue) | atrapadas = notas; "¡Tiempo!" en 79 |
| 15 | gift-card | 80–82 | 37,5–38,438 | `plate` + cifra | R 10 · Regalos con sorpresa | impacto en 80,5 ("$ 60.000") |
| 16 | **locker** | 82–88 | 38,438–41,25 | `locker-live` (nueva) | (R 10 sigue) | dígitos = hat; error en 83; "¡Abierto!" en 85; **silencio 87,5–88** |
| 17 | **se-termina** | 88–100 | 41,25–46,875 | HUD → batería grande | S 96–99,5 "A Nicolás se le termina hoy." | 10 ticks que bajan; **tono plano** 96–98 |
| 18 | escribirle | 100–104 | 46,875–48,75 | `plate` (tarjeta de Nicolás) | S "Ya está escrito. Solo tocás." | toque en 102 |
| 19 | mensaje | 104–108 | 48,75–50,625 | `device` (Phone) + chat (maqueta) | S "Con el link a su bolso." | ding en 104; toque en 107; **silencio 107,5–108** |
| 20 | **bolso** | 108–114 | 50,625–53,438 | Phone + placa del carrito 390 | S 109–113 "Un toque y vuelve a cargar." | **DROP 3**: 10 celdas que suben en corcheas |
| 21 | vuelta | 114–120 | 53,438–56,25 | `route-live` (cameo) | S 116–119,5 "Otra vuelta." | pedaleo; campana en 119 |
| 22 | verbos | 120–128 | 56,25–60,0 | `slam` (firma) | Comprá. · Jugá. · Regalá. · Volvé. | un golpe cada 2 tiempos |
| 23 | promesa | 128–136 | 60,0–63,75 | `stack` + `rules` ("+" corona) | S "La tienda que se la juega." → S "+ Asesoría de growth marketing y fidelización." | **silencio 135,5–136** |
| 24 | en-vivo | 136–148 | 63,75–69,375 | `eclipse-cta` | Probalo en vivo · 223-446 7881 | `calm` |
| 25–28 | precios | 148–182 | 69,375–85,313 | `eclipse-prices` ×4: campaña 8, pack 8 (sujeto a disponibilidad), planes 8, extras 10 | (libro) | tick por fila |
| 29 | cierre | 182–192 | 85,313–90,0 | `eclipse-outro` | (firma) | `final` |

**Medidor (HUD).** Va en (96, 118), debajo de la raya del rótulo: 10 celdas de 16 × 18 px, calle de 3 px, borne de 1 px a la derecha (la forma de `BatteryMeter`). Cada celda se prende con un `set` (no cuenta como movimiento) en 16, 32, 36, 40, 44, 48, 52, 56, 68 y 80. Cada escena lo dibuja en el mismo lugar (como `Grid` en T1). En el acto II va en sus colores de modo claro.

## 4. Escenas protagonistas (1920 × 1080; columna k en x = 96 + (k−1)·146, fila r en y = 60 + (r−1)·164)
**3 · `fechas` (16–32): «el tablero de fechas».** El dar vuelta las placas sale de la app: Año Nuevo es "un tablero que pasa de 2026 a 2027 con flip de placas" (`splash-scenes.ts`).
- **Composición:** el marco 4:3 de T1 (`FRAME`: x 680–1824, y 111–969) con la `SplashStage` real, partido en dos por una bisagra en y = 540 (una raya volt de 1 px). A la izquierda, en las columnas 1 a 4, el tablero: día y mes en display de 220 px (x 96, y 388–640, "23 NOV") con su propia bisagra. Fondo `#060707` y grilla volt al 14 %.
- **La vuelta (receta nueva `splash-flip`):** la mitad de arriba de la fecha que sale gira de 0 a −90° (`trl.whip`, ⅛ de tiempo) y la mitad de abajo de la que entra gira de 90 a 0° (`trl.punch`, ⅛ de tiempo: pasa un poco y vuelve; es el rebote del juego). Encima de la placa que gira, una sombra (solo opacidad, de 0 a 0,5). El tablero se da vuelta con el mismo gesto. Son 2 movimientos: el marco y el tablero.
- **Fechas, en orden de calendario** (`themes.ts`), cada una congelada en su clímax con `css-clock`, y su golpe propio medio tiempo después de la vuelta:
  - de a 2 tiempos: Día de la Madre (16, la fecha que está activa el 5/10; su latido le contesta a T1), Halloween (18), Black Friday (20), Navidad (22), Año Nuevo (24, sus placas se dan vuelta adentro de las nuestras);
  - de a 1 tiempo: CrossFit Open (25), Hot Sale (26), Día del Futbolista (27);
  - **Día del Boxeador (28–32):** el martillo pega en 29 y 29,5 (los golpes reales de 640 y 840 ms, estirados) y "arranca el round" con el número en 30. El corte a la compra en 32 es el round.
- **Ritmo y super:** como mucho una vuelta por tiempo (2,13/s). "Cambia sola con cada fecha." (28–31,5, columna 1, fila 5): el script del `<head>` elige la escena por la fecha activa.
- **Capas:** fondo y grilla, marco, 4 medias placas, 2 del tablero, rótulo con el HUD y super = 10. La que queda quieta va **en vivo**; las mitades que giran son JPEG del clímax (`scripts/capture-splash-frames.mjs`, 1590 ms).

**10–11 · `envío` → `noche` (56–68): el cadete y el golpe de luz.**
- **Placa:** seguimiento entregado en claro, con la cabecera (prerrequisito). La pista **en vivo** se redibuja con las constantes de `RouteMap.tsx` (camino `M40 96 H560` y 7 marcas) a escala 3, de x 96 a 1824 y en y 600–760, dentro de su tarjeta `night-2` (en la app es oscura también en modo claro).
- **56–60:** el cadete (`Courier`, 240 px de ancho, con la flor del Día de la Madre) avanza de marca en marca, una cada medio tiempo (`trl.expo`). En cada marca se prende la etapa real: Pedido recibido, Pago en revisión, Pagado, Armando tu pedido, Listo, Enviado, Entregado (`tracking-states.ts:12-18`).
- **60:** "Llegó a tu casa" y el estallido de adornos de la app (8 piezas chicas). En 60,5 se despega la etiqueta real "LOTE VL-2606-W · VTO 06/2027" (Ionic Whey Chocolate 2 lb del pedido de muestra) hasta las columnas 1 a 6, en mono de 96 px.
- **62–63,5:** la cámara se aleja 1,1 → 1 (`trl.rampa`) hasta que se ve la cabecera, y se traza un anillo de 1 px alrededor de la luna. **63,5–64: silencio.**
- **64 · DROP 2:** click. El oscuro se abre en círculo desde el botón (`themeflip`/`plate` modo `tema`, `clip-path`, 1 tiempo, `trl.rampa`, para que llegue en el golpe). Es **un solo cambio de luz** en todo el acto. Super: "Y de noche, se juega." En 68 corta al Club.

**16 · `locker` (82–88): el chiste del acto III.**
- **Pieza:** `LockerArt` real (`locker/LockerArt.tsx`, SVG puro con `digits`, `status`, `misses` y `swing`) con 820 px de alto, centrado en (1180, 540). El regalo REGALO-SAB0-R01D: "Fran, te llegó un regalo de Mili" y la combinación 0310 (`gifts.ts`).
- **82–83:** se marca 0·3·0·1 en corcheas (los números al revés). En 83 la app hace lo suyo: `lk-shake` y "Esa combinación no abre. Probá de nuevo." Es real (`LockerOpening.tsx:69`).
- **84–85:** 0·3·1·0. En 85, "¡Abierto!" (`gift-openings.ts:133`): corre el pestillo y la puerta gira con `swing` de 0 a 1 en 1 tiempo.
- **86:** se prende la luz de adentro y aparece "Mili dejó el sabor para que lo elijas vos. Ya está pago." y "Elegí tu sabor" (`RevealExtras.tsx`). Así el sabor abierto y el locker caen en una sola revelación.

**17–21 · Recompra por WhatsApp (88–120), la protagonista.** Qué hace la demo de verdad:
"A quién escribirle hoy" (`WriteTodayPanel.tsx`) calcula a quién se le termina el pote ("Orientativo") y **deja el mensaje escrito**; el dueño toca "Escribirle por WhatsApp", se abre `wa.me` con el texto y el toast dice "WhatsApp listo para mandar". **Nada sale solo; la demo no envía nada.** El link `/recompra/?bolso=…` carga lo mismo que compró (si hay stock) y lleva al carrito con "Tu bolso está armado" (`RepurchaseLanding.tsx`). Por eso **no se dice "automático"**.

El cliente es **Nicolás Romero** (TUT-000108, Mass Gainer 3 kg Dulce de leche ×1, recibido el 15/9, 20 servicios a 1 por día): se le termina el 5/10, el día de la demo. Es la tarjeta real de "A quién escribirle hoy".

- **88–89:** el HUD lleno viaja de (96, 118) a la columna 3, a lo ancho de las columnas 3 a 10 (x 388–1532, y 470–610), con escala uniforme (`trl.expo`). Arriba, en mono de 34 px en y = 400: "MASS GAINER 3 KG · DULCE DE LECHE".
- **89–96:** se apaga una celda cada 0,7 tiempos, con `remainingPct`. Abajo, un contador en display de 160 px (y 660) pasa de "15 SEP" a "5 OCT". Cuando queda en 20 % o menos, las celdas pasan a `danger`, como hace `BatteryMeter`.
- **96:** cero. "Se te termina hoy" (`runOutLineForBuyer`) y el **tono plano de T1**. Super: "A Nicolás se le termina hoy."
- **100–104:** corte a la placa de su tarjeta (columnas 6 a 12, x 826–1824), con el mensaje real a la vista. En 101,5 se traza un anillo sobre "ESCRIBIRLE POR WHATSAPP"; en 102, el toque: el botón se hunde 2 px y aparece el toast real. Super a la izquierda, en las columnas 1 a 5: "Ya está escrito. Solo tocás."
- **104–108:** un celular (`device-kit` `Phone`, 380 × 780, centro en (1240, 540), rotateY −8°) con un chat **maqueta**:
  - cabecera "Tu tienda" con el rayo; la palabra "WhatsApp" en mono, sin logo, sin verde de marca y sin su sonido;
  - en 104 llega la burbuja con el texto exacto de `writeMessage`: "¡Hola Nicolás! Te escribimos de Tu tienda. Calculamos que hoy se te termina tu Mass Gainer 3 kg. ¿Te preparamos otro? En Mar del Plata te lo llevamos con cadete al día hábil siguiente. Te dejé el bolso armado con lo mismo, para que confirmes cuando quieras: …/recompra/?bolso=mass-gainer.mg-dulce-de-leche-3kg.1";
  - en 107, el toque sobre el link;
  - de 107,5 a 108 (el silencio), "Armando tu bolso" (`HeroSkeleton`, texto real).
  - Super: "Con el link a su bolso."
- **108 · DROP 3:** la pantalla pasa a la placa del carrito 390 con el toast "Tu bolso está armado · 1 producto de tu compra anterior. Confirmá cuando quieras." y Mass Gainer a $ 58.900. La batería, ya chica en las columnas 1 a 4, se llena celda por celda en corcheas (108–109,25), con el estribillo subiendo. La cámara empuja el celular de 1 a 1,05 (`trl.rampa`). Super: "Un toque y vuelve a cargar."
- **114–120:** a todo el ancho de la fila 6 (y 880–1020), la pista con "Local Tu tienda · Mar del Plata" y "Tu casa" (rótulos reales). El cadete sale de nuevo. Super: "Otra vuelta." El "al día hábil siguiente" sale de `DISPATCH_PROMISE`.

## 5. Transiciones firma
1. **La vuelta de placa** (`fechas`; un eco en el paso del checkout, 52–55, que da vuelta "01/03" en 2D con `scaleY`).
2. **El HUD se vuelve personaje** (88): la única vez que el medidor deja su lugar.
3. **El círculo de la luna** (64): el cambio de tema separa compra de juego. Es un solo cambio de luz.
4. **La pista del cadete** como corte entre actos (56 y 114).
5. **Toque = anillo + nota:** cada toque es el anillo de impacto de la app sobre una caja medida, y suena una nota del estribillo.

## 6. Música y silencios (partitura de la firma: Am–F–C–G; calma en Do)
| Tiempos | Estilo | Qué pasa |
|---|---|---|
| 0–12 | `tension` | Apertura; corta en 11,5 |
| 12–15,5 | `cuenta` (nuevo) | Clanc de discos en cada tiempo y subida. **Silencio 15,5–16** |
| 16–56 | `drop` (**DROP 1**) | Estribillo; en 16–28 las vueltas son las notas; en el acto II, cada toque es una nota |
| 56–62 | `half` | Pedaleo a medio tiempo; subida 62–63,5. **Silencio 63,5–64** |
| 64–87,5 | `drop` (**DROP 2**) | En 82–85 se van el bombo y el bajo: los dígitos del locker son la percusión. **Silencio 87,5–88** |
| 88–96 | `clon` | Dron sin pulso y un tick por celda, cada uno más grave |
| 96–98 | `plano` | Seno en La5, el de T1 |
| 98–107,5 | `half` | Pad; ding (dos notas sintéticas, Mi6 y La6) en 104. **Silencio 107,5–108** |
| 108–135,5 | `drop` (**DROP 3**) | El estribillo completo; los verbos en 120, 122, 124 y 126. **Silencio 135,5–136** |
| 136–182 | `calm` | En vivo y precios |
| 182–192 | `final` | El eclipse se cierra |

## 7. Real, placa, maqueta y condicional
| Pieza | Qué es |
|---|---|
| Pantallas de carga, ruleta, Shaker Rush, locker, `TestBench`, cadete | Real y en vivo (SVG o CSS de la app, con el reloj del trailer) |
| Buscar, comparar, stack, pack, checkout, seguimiento, club, gift card, tarjeta de Nicolás y carrito | Placas 2× con la ficha `tutienda` |
| HUD, tablero de fechas, chat del celular | Maqueta (el HUD imita a `BatteryMeter`; el texto del chat es el de `writeMessage`) |
| Viajero con ropa de la fecha | Condicional: solo con una temática activa (en la captura sin temática, la pista muestra el punto) |
| Batería de Nicolás | Condicional: es el cálculo real (`potsInUse`/`remainingPct`), pero "Mi box" lo muestra al cliente con cuenta (en la demo, a Sofía) |

## 8. Qué corto y por qué
- **El recorrido por el país:** la app no tiene mapa. El seguimiento es una pista "del local a tu casa" (`RouteMap.tsx`: "Sin mapas externos") con cadete en Mar del Plata. Un mapa sería una maqueta que contradice la demo.
- **La bolsa de boxeo:** ya fue el clímax de T1. El locker y el sabor abierto son lo nuevo.
- **El Quiz:** llega al mismo lugar que el stack ("llegar a una mejor compra") y su resultado se arma en vivo, que es caro.
- **Cupones y recordatorios** como planos propios: el premio de la ruleta es un cupón, y el recordatorio que importa es el WhatsApp.
- **El carrusel y la franja de campaña:** son una idea repetida de las fechas.

## 9. Riesgos
- **60 fps:** el 3D es CSS y va solo en `fechas` y en el celular (2 escenas); un solo canvas (Shaker Rush, 76–80), con la escena 14 sin celular. Las mitades que giran son JPEG; solo la fecha quieta va en vivo. Sin `backdrop-filter`. Hay que medir las vueltas en hardware real.
- **Destellos:** como mucho una vuelta por tiempo (2,13 por segundo). Hay un solo cambio de tema (64) y un solo corte de claro a oscuro (32 → 64 claro). En `slam`, el fondo cambia cada 2 tiempos (1,07 por segundo). La ruleta lleva el velo de T1. Las celdas del HUD son chicas. Todo se mide a 60 fps (WCAG 2.3.1).
- **Honestidad:** nunca "automático" ni "le llega solo". "Solo tocás" es exacto: el dueño toca y WhatsApp se abre con el texto. El chat es maqueta, sin logo ni sonido de WhatsApp. El código del pedido de muestra es "TUT-DEMO-0000" y no TUT-000123.
- **Juguete:** dos personajes que no tienen cara ni voz y solo se trasladan. El rayo y "TU TIENDA" no se deforman. Los chistes son tres, uno por acto.
- **Contraste:** los supers del acto II van sobre claro con tinta `#060707` y van en la versión clara del rótulo.

## 10. Prerrequisitos en el código
1. **`splash-flip`** (multifecha, medias placas y `css-clock` por fecha) y **frames JPEG** del clímax de cada fecha.
2. **HUD de carga** compartido, como `Grid`.
3. **`plate` desatado de `shots/t1/`** (pendiente del QA de T1, lente 6).
4. **Placas nuevas** (build `tutienda`):
   - en claro: buscar sin texto y con "CREATNA"; comparar con y sin `[data-best]`; stack; pack; los pasos 1, 2 y 3 del checkout y la confirmación; seguimiento con cabecera (en claro y oscuro, con la caja del tema);
   - en oscuro: club misiones antes y después de "Marcar el entreno de hoy"; gift card GC0S; tarjeta de Nicolás; carrito 390 tras `/recompra/?bolso=mass-gainer.mg-dulce-de-leche-3kg.1` con el toast.
5. **Recetas nuevas:**
   - `testbench-live` (`TestBench` con `tint`; revisar si anima su lámpara);
   - `route-live` (exportar `PATH` y `TICKS` de `RouteMap`, usar `Courier` y `Decor`; no montar `motion/react`);
   - `locker-live` (`LockerArt` + `lk-shake` con `css-clock`);
   - el chat del celular, con los datos de `writeToday`/`writeMessage` y `cartLinkPath` calculados de los fixtures, nunca escritos a mano.
6. **`WheelChargeBar` tiene estado:** extraer una vista pura con la carga (`charge`) para `wheel-live`.
7. **Música:** estilo `cuenta`, voz `ding` (sintética y propia) y el corte 82–85.
8. **Revisar:** `gift-cards.ts` trae "VOL-000121" escrito a mano (no puede verse); el comentario de `Courier.tsx` dice "VOLTA" (el texto usa `brand.mark`); Mass Gainer está entre los 4 resultados de "creatna" (semilla de la recompra).

## 11. 9:16 y movimiento reducido
**9:16:** tablero arriba y marco debajo; batería a lo ancho; celular a todo el alto; pista vertical; supers en el tercio superior. **Reducido:** sin vueltas, viaje del HUD ni pedaleo; láminas con fundido de ¼ de tiempo; mismo sonido.
