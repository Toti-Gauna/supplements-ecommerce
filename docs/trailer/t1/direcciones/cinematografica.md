# T1 · Dirección cinematográfica: "Una sola luz"

128 BPM · 1 tiempo = 0,46875 s · 96 tiempos = 45,0 s. Ángulo: la luz cuenta la historia (un lanzamiento de Apple, pero para vender).

## 1. Tesis y concepto visual
**Tesis.** Las tiendas de suplementos viven en el mismo apagón: mismo template, mismo 20 % OFF, misma grilla y, después de comprar, nada.
Eclipse es la única luz en ese mundo: encuentra tu tienda, la prende y la mantiene encendida.
Lo hace con software que la diferencia y con asesoría de growth y fidelización que la hace vender más.

**Concepto: una sola luz.** El destello del anillo de diamante sobrevive a la apertura y es la única fuente de luz de toda la
pieza. Como linterna, muestra que las tiendas son copias. Como chispa, prende el cartel de Tu tienda. En la ráfaga, cada
función es algo que se enciende. En la tesis sube detrás del software como corona (la asesoría) y termina siendo el
amanecer de "Probalo en vivo". El eclipse que se cierra la apaga.

**Gramática de luz (vale para todos los planos)**
- Ámbar `#f5b942` = Eclipse y su asesoría · volt `#c8ff2e` = Tu tienda · gris sin luz = las copias · amanecer `#f4efe6` =
  la decisión (cta y precio). Nada se ilumina sin una fuente que se vea.
- Los supers no se deslizan: **se encienden** (solo opacidad, 0,15 s). Van en Geist 500 color amanecer, que es la voz de
  Eclipse; la tienda habla con su propia interfaz. Tamaños en el escenario de 1920: problema 104 px abajo al centro ·
  "¿Y la tuya?" 160 px al centro · rótulos de la ráfaga 52 px abajo a la izquierda · tesis 104 px en el tercio izquierdo.
- Cámara: curva `rampa` (`M0,0 C0.7,0 0.12,1 1,1`), que arranca lenta, acelera y llega justo al golpe. Contención: en
  cada plano se mueven, como mucho, la cámara y una cosa más.

## 2. Arco
| Acto | Tiempos | Segundos | Qué pasa |
|---|---|---|---|
| 1 · Presenta | 0–12 | 0–5,625 | La firma. Al fundirse, queda el destello. |
| 2 · Apagón | 12–24 | 5,625–11,25 | La linterna recorre tiendas clonadas, se apagan, "¿Y la tuya?" y silencio. |
| 3 · Encendido | 24–56 | 11,25–26,25 | Drop: se prende el cartel de Tu tienda. Ráfaga de 7 luces, con un segundo drop en el claro → oscuro. |
| 4 · Dos luces | 56–68 | 26,25–31,875 | Las pantallas (software) y la corona que sube detrás (asesoría) llevan a la promesa de vender más. |
| 5 · Amanecer y noche | 68–96 | 31,875–45,0 | "Probalo en vivo", el precio a plena luz y el eclipse que se cierra. |

## 3. Tabla de escenas
| # | id | tiempos | inicio→fin (s) | receta | imagen | super exacto | entrada y cámara |
|---|---|---|---|---|---|---|---|
| 1 | `apertura` | 0–12 (12) | 0,000→5,625 | `eclipse-intro` (existente) | EclipseMark | (ECLIPSE · "Presenta…") | Fija. Su fundido final deja el negro `#05050a`. |
| 2 | `linterna` | 12–21 (9) | 5,625→9,844 | `lightwall` (nueva) | 7 tiendas clon dibujadas: SVG gris sin marcas (header con un logo-mancha, banner "20 % OFF", 4 potes lisos, botón COMPRAR) | 12–15 "Mismo template, mismo 20 % OFF." · 15–18 "Misma grilla de potes." · 18–21 "Y después de comprar, nada." | El destello reaparece donde estaba el anillo. Tres rampas (retroceso, travelling, acercamiento); cada una llega al golpe del super siguiente. Apagón 19,5–21 (firma 1). |
| 3 | `y-la-tuya` | 21–24 (3) | 9,844→11,250 | `lightwall` (apagada) | tipografía + destello | "¿Y la tuya?" | Sin corte. Cámara quieta; el destello sube y late. 23,5–24 silencio y cuadro quieto. |
| 4 | `encendido` | 24–32 (8) | 11,250→15,000 | `device3d` (nueva: notebook CSS 3D) | marca real de la ficha `tutienda` → `HeroCarousel` en vivo (`home-carrusel`, slide 1 pausado) | — (habla la interfaz: "CARGÁ TU MEJOR VERSIÓN") | DROP 1: se prende el cartel y la lámpara ilumina el hero. Retroceso con rampa hasta la notebook flotando (firma 2). |
| 5 | `w1-carga` | 32–36 (4) | 15,000→16,875 | `montage` (a portar) | `SplashStage`, escena de Halloween (`splash-scenes.ts`), en vivo | "Una pantalla de carga por fecha." | Corte seco en el 1. Panel flotante con empuje 1,00→1,04. La pesa rusa se prende como calabaza en 33. |
| 6 | `w2-regalo` | 36–40 (4) | 16,875→18,750 | `montage` | `regalo-bolsa` en vivo ("Juli, te llegó un regalo de Caro"), `[data-hits]` 3→5 | "Regalos que se abren a golpes." | Corte en el 1. Golpes en 36 y 37; cada costura se abre con luz adentro. En 37 se rompe el paño y sube el pote iluminado. |
| 7 | `w3-ruleta` | 40–44 (4) | 18,750→20,625 | `montage` | `ruleta` (`WheelHub`) con el giro manejado por el timeline y premio fijo "muestra de regalo" (`Math.random = () => 0.5`) | "Ruleta de premios." | Corte en el 1. Giro rápido → lento (`power3.out`); para en 43 y se prende el premio. 43,5–44 silencio y cuadro quieto. |
| 8 | `w4-claro-oscuro` | 44–47 (3) | 20,625→22,031 | `themeflip` (existente) | `ficha-completa` de claro a oscuro (`ThemeToggle`) | "Claro u oscuro." | DROP 2: corte a la pantalla clara entera, el único cuadro claro del medio. Click en 44,5 y el oscuro se abre en círculo desde el botón. |
| 9 | `w5-shaker` | 47–50 (3) | 22,031→23,438 | `montage` + el único canvas | Shaker Rush en vivo (piloto automático, semilla 11) | "Un juego propio." | Corte. Los últimos segundos de la partida; en 49 cae "¡Tiempo!" con el puntaje. |
| 10 | `w6-mostrador` | 50–53 (3) | 23,438→24,844 | `uiflow` (a portar) | `mostrador-cuotas` en vivo (diálogo "Cobrar…") | "Cuotas en el mostrador." | Corte. Click en "3 cuotas" (50,5); en 51 aparece "3 cuotas de $ 40.892". El velo de luz se cierra sobre el número, con empuje 1,00→1,06. |
| 11 | `w7-proveedor` | 53–56 (3) | 24,844→26,250 | `uiflow` | `proveedor-diferencias` en vivo (`SupplierListPage`) | "Lista del proveedor." | Corte. Click en "Cargar la lista de muestra" (53,5); una banda de luz baja por las filas; en 54,5 se prende "48 suben, 3 bajan, 2 sin coincidencia". |
| 12 | `dos-luces` | 56–68 (12) | 26,250→31,875 | `device3d` (pareja) | notebook con `hoy` 1440 + celular con `club-inicio` 390, en oscuro (capturas 2×) | 56–60 "Software que te diferencia." · 60–64 "Asesoría de growth y fidelización." · 64–68 "Para que vendas más." | Corte en el 1. Órbita lenta; la corona sube detrás (firma 3). |
| 13 | `en-vivo` | 68–80 (12) | 31,875→37,500 | `eclipse-cta` (existente) | estética Eclipse | "Probalo en vivo." (+ link de la demo, "Contactanos", 223-446 7881) | Corte por luz: la franja tibia de la corona sigue como el amanecer que sube. |
| 14 | `guino` | 80–86 (6) | 37,500→40,313 | `eclipse-guino` (nueva: una sola fila de `eclipse-prices`) | tipografía; libro `tu-tienda`, sección `base-campaign` | "Arrancá con 3 meses bonificados." | Corte en el 1 a amanecer pleno: el precio a plena luz. De 85 a 86 cae la noche (velo `#05050a` 0→1). |
| 15 | `cierre` | 86–96 (10) | 40,313→45,000 | `eclipse-outro` (existente) | EclipseMark | (ECLIPSE y su línea) | Entra desde la noche del guiño y el eclipse se cierra. |

**Suma:** 12+9+3+8+4+4+4+3+3+3+3+12+12+6+10 = **96 tiempos**. El cierre ocupa 12+6+10 = 28 y el medio, 56. Los cortes fuertes (12, 24, 32, 36, 40,
44, 56, 68 y 80) caen en el tiempo 1; los de 47, 50 y 53, en tiempo entero. El de 86 lo fuerza el outro de 10: es un fundido a noche, no un golpe.
**Guiño, textos exactos:** título serif con *3 meses bonificados* en itálica · fila "Campaña base" → "$ 750.000" (mono 64 px) con "USD 500" debajo ·
nota mono: "Incluye asesoría inicial de growth y 3 meses de plan Esencial · sujeto a disponibilidad · dólar a $ 1.500". El único super es el título;
la fila y la nota son el dato, como en `eclipse-prices`.
**Dispositivos: CSS 3D (`preserve-3d`), no Three.js.** (1) El único canvas permitido ya lo usa Shaker Rush. (2) La interfaz sigue siendo DOM: el texto
se ve nítido y no hay texturas remuestreadas. (3) Se posiciona en cualquier segundo con transforms de GSAP, sin estado. (4) Un equipo son 6–8 caras con
degradés fijos y la "iluminación" está pintada (filos de 1 px y halos radiales), no calculada. En `encendido` la pantalla es el hero en vivo, que solo
se achica y por eso queda nítido; en `dos-luces` son capturas 2×, el uso que ui.md les reserva a los dispositivos.
**Ráfaga:** cada pieza real flota en el vacío en su propio panel (fondo `#060707`, filo de luz de 1 px, derrame de su color en el piso), girada ±5° en Y
y re-renderizada en primer plano con CSS `zoom`, no con escala. Corte seco en el pulso. El claro → oscuro va a pantalla completa porque es el golpe.
**Foco selectivo con luz, no con blur:** un velo oscuro con un agujero radial, que se mueve solo con transform, elige qué se mira (cuotas, filas). Los 4
clones del fondo usan una versión con el desenfoque horneado en PNG: hay profundidad de campo sin ningún filtro en vivo.

## 4. Momentos firma
**1 · La linterna (12–24 · 5,625–11,25 s)**
- **12,0** Negro `#05050a`, el mismo del final de la apertura. Se enciende el destello (punto de 28 px, núcleo `#ffe8b0`,
  halo `#f5b942`) donde estaba el `glint` de `EclipseMark` (opacidad 0→1 en 0,1 s) con un shimmer suave (nota 88, vel
  0,35), eco del de la apertura. A la vez se enciende el super 1.
- **12,0–12,5** El destello baja al banner del clon más cercano y se abre en un óvalo de luz de 1100×700 (escala 0,04→1,
  `expo.out`). El clon pasa de opacidad 0,2 a 1 y se lee "20 % OFF".
- **12,5–15 · rampa 1** Retroceso de cámara (z +600→0). Aparecen 7 clones idénticos en fila hacia el fondo (pared girada
  −34° en Y). El óvalo crece (1→1,8) y cada clon que toca se prende con opacidad agendada (0,2→0,7).
- **15–18 · rampa 2** Travelling a la altura de las grillas (x −1400): el óvalo corre sobre potes que son todos iguales.
- **18–21 · rampa 3** Acercamiento al botón COMPRAR del clon cercano. **18,5:** un cursor genérico lo aprieta (click).
  **19,5–20,75:** los clones se apagan del más cercano al más lejano (opacidad →0,04, escalonado que acelera), con 7 ticks
  que bajan de nota. **20,75–21:** el óvalo vuelve a cerrarse en destello.
- **21–23,5** Negro. El destello sube de y 600 a y 330 (`rampa`) y late con el latido (opacidad 0,7↔1). "¿Y la tuya?" a
  160 px, centrado y con aire. **23,5–24: silencio real** con el cuadro congelado.

**2 · El cartel se prende (24–32 · 11,25–15,0 s)**
- **24,0 · DROP 1** Click + impact + boom. El destello se apaga (0,05 s) y en el mismo cuadro se prende la marca real de
  Tu tienda (rayo + TU TIENDA, 200 px de alto, al centro) como un cartel de neón: opacidad 0→0,85→0,2→1 en 0,12 s, con un
  halo volt radial detrás (0→0,6). No hay escala ni deformación. Es la respuesta a "¿Y la tuya?".
- **24–26** La marca queda quieta y el halo respira con el bombo (0,6↔0,5). Entra el estribillo.
- **26–27,5** Detrás se prende la lámpara del hero: un velo negro con un agujero radial centrado en la lámpara escala de
  0,1 a 3,5 (`expo.out`) y descubre el pote bajo el cono y "CARGÁ TU MEJOR VERSIÓN". A la vez la marca viaja
  (traslación + escala uniforme 1→0,16) a su lugar en el header y en 27,5 se funde con el logo real. Suenan un shimmer
  en 26 y un whoosh corto en 26,5.
- **28–32** Retroceso con `rampa`: la pantalla era una notebook CSS 3D que flota en el vacío (escala 1→0,5, rotY 0→−16°,
  rotX 0→7°; llega al 94 % en 31,5). De 30 a 32 aparece el derrame volt en el piso (0→0,45). Un whoosh ascendente entrega
  a la ráfaga en 32.

**3 · Dos luces (56–68 · 26,25–31,875 s)**
- **56,0** Corte en el 1 a negro con dos equipos encendidos. La notebook (`hoy`, "HOY EN TU TIENDA") va al centro-derecha,
  atrás (z −650, rotY −14°); el celular (`club-inicio` 390, "SUMÁ CARGA. SUBÍ DE NIVEL.") va adelante a la derecha (z 0,
  rotY 12°). Solo sus pantallas dan luz (derrame volt en el piso). El conjunto orbita (rotY 5°→−5°, z 0→120) en 8
  tiempos con `sine.inOut`. Entra el bombo de `half` con una campana.
- **60,0** Sube la corona: un radial ámbar de 1800 px detrás de los equipos (z −1200) va de y +1100 a +700 con `rampa` en
  4 tiempos. En **61,5** los filos de 1 px de los equipos se prenden en ámbar (0→1, 0,3 s) y quedan a contraluz: la
  asesoría es la luz que está atrás. Suena un shimmer y crece el pad.
- **64,0** Termina la órbita, entra el super 3 y suena la campana. **65–67,5:** los equipos se apagan (opacidad 1→0) y
  queda abajo la franja tibia de la corona. En **68** `eclipse-cta` arranca igual (noche con el amanecer todavía abajo) y
  lo hace salir: la promesa se cumple en "Probalo en vivo". La música resuelve en Do.

## 5. Plan musical
| Tiempos | Estilo | Qué suena y con qué toque (ningún toque sin sonido) |
|---|---|---|
| 0–12 | `tension` (firma) | La apertura, sin cambios. |
| 12–23,5 | `tension`, 2.ª vuelta | Dron en La y latido cada 2 tiempos; desde 21 el latido se acerca (cada tiempo y después cada medio) y arranca la subida, que corta seco en 23,5. Toques: shimmer 12 · tick 12, 15 y 18 (supers) · click 18,5 (COMPRAR) · 7 ticks que bajan 19,5–20,75 (apagón) · el destello late con el latido 21–23,5. |
| **23,5–24** | `silence` | **Nada.** Cuadro congelado en "¿Y la tuya?". |
| **24** | **DROP 1** | Click + impact + boom: se prende el cartel. |
| 24–40 | `drop` | Bombo, bajo y estribillo en pluck: Am–F–C–G, una vuelta exacta. Shimmer 26 (lámpara) · whoosh 28–32 · impact 36 y 37 (golpes) · shimmer 37,25 (sale el pote). |
| 40–43,5 | `stutter` sobre G | Se cae el bombo; quedan los hats y los ticks de la ruleta, que se espacian. Campana en 43 (premio). |
| **43,5–44** | `silence` | **Nada.** La ruleta queda congelada. |
| **44** | **DROP 2** | Vuelve a Am con click + impact (claro → oscuro) y el whoosh del círculo. |
| 44–56 | `drop` pleno | Estribillo en pluck + campana a la octava (Am–F–C). Ticks de atrapadas 47–48,5 · impact 49 ("¡Tiempo!") · click 50,5 + tick 51 (cuotas) · click 53,5 (lista) · pluck 54,5 ("48 suben"). |
| 56–68 | `half` (bombo a mitad de velocidad) | Pad y campana sobre G (56) – F (60) – Gsus4 (64). Shimmer 60 (sube la corona) · campana 64. |
| 68–86 | `calm` | Resuelve en Do: pad cálido y estribillo lento en campanas. Cues de `eclipse-cta`; ticks del guiño en 80,5 y 81,5. |
| 86–96 | `final` | Acorde final y el destello del outro. |

## 6. Versión 9:16 y movimiento reducido
**9:16 (1080×1920), re-encuadre:** la fila de clones se vuelve una columna que se hunde hacia arriba y la cámara baja en grúa en vez de ir de costado; los supers suben al tercio superior a 96 px y la ráfaga re-renderiza cada pieza a 390 de ancho (versión de celular, no un recorte) en un panel vertical.
En `encendido` y `dos-luces` el celular pasa a ser el protagonista (hero y club a 390), con la notebook detrás y más alta; el cierre usa las variantes `9x16` que ya tienen las recetas `eclipse-*`.
**Movimiento reducido:** sin cámara, sin Z y sin órbitas; cada plano es una lámina quieta con la luz ya puesta, y apagón, encendido, claro → oscuro y supers pasan a ser fundidos de 0,3 s, en los mismos tiempos y con el mismo sonido.

## 7. Riesgos y cómo los evito
- **GPU (el riesgo de este ángulo).** La pared son 7 planos (3 nítidos + 4 con desenfoque horneado), no 48 clones ni una textura gigante. La luz son
  1 o 2 divs con un degradé radial fijo, movidos con transform. El encendido de cada clon es opacidad agendada: nada se mide cuadro a cuadro. No hay
  `backdrop-filter` ni blur en vivo (el único blur es el de la salida de la apertura, que ya existe y termina antes de 12). Hay un solo canvas (Shaker
  Rush), montado solo de 46 a 50, y como mucho 2 equipos CSS 3D con capturas 2× como pantalla. `will-change` va solo durante cada movimiento, con un
  tope de 12 capas compuestas por plano. Modo liviano: 3 clones, sin derrames ni filos.
- **Honestidad.** Los clones son genéricos y dibujados: potes lisos sin rayo, un logo-mancha y ningún nombre. "20 % OFF" es el cliché del brief, no una
  marca. Todo texto o cifra sale de la interfaz real o del libro de precios (versión 2026-10-16, aprobada). "Para que vendas más" es una promesa sin
  número. El guiño lleva "sujeto a disponibilidad" y el dólar. La ruleta para en un premio real con semilla fija. El "(simulada)" del mostrador queda
  fuera de cuadro, pero nada dice que la venta sea real. **Hay que verificar** que la revelación de la bolsa saque el pote con la ficha `tutienda`,
  porque el comentario de `bag-reveal.tsx` dice "VOLTA Lab", y encuadrar `hoy` sin el logo del riel, que se ve como un cuadrado liso (ui.md §0.4).
- **Legibilidad.** Cada super dura 3 tiempos o más (≥ 1,41 s), tiene ≤ 6 palabras, va en amanecer sobre negro y mide ≥ 52 px. Los planos de 3 tiempos
  llevan rótulos de 3 o 4 palabras. Los textos clave de la interfaz ("3 cuotas de $ 40.892", "48 suben, 3 bajan, 2 sin coincidencia") se re-renderizan
  con `zoom` a ≥ 90 px. En el claro → oscuro el rótulo existe en las dos capas y cambia de color con el círculo. Prueba muda: la historia se entiende
  solo con los supers.
- **Determinismo y marca.** `SplashStage`, los golpes de la bolsa (`[data-hits]`), el giro de la ruleta y Shaker Rush los maneja el tiempo del
  timeline, así que se pueden posicionar en cualquier segundo; si alguno no se puede, el respaldo son cuadros congelados o capturas, nunca video. El
  rayo y el eclipse solo cambian de opacidad o se trasladan con escala uniforme; el destello es una luz, no la marca.
