# T1 · Dirección de precisión: "Calcado vs. trazado"

128 BPM · 96 tiempos = 45,0 s · 1 t = 0,46875 s. Tiempos en negras contadas desde 0; "c." = compás (el c. 1 empieza en 0).

## 1. Tesis y concepto visual
1. Las tiendas de suplementos están calcadas: mismo template, mismo 20 % OFF, misma grilla de potes y, después de la compra, nada.
2. Tu tienda está trazada a medida: piezas que existen y funcionan, y números que le hablan al bolsillo ("3 cuotas de $ 40.892", "48 suben").
3. No es solo software: Eclipse suma asesoría de growth y fidelización para que la tuya venda más.

**Concepto: una sola línea de 1 px.** En el problema, sobre una grilla suiza gris, caen tiendas calcadas: fotocopias corridas que
ni siquiera respetan la grilla. En el quiebre esa línea late, se vuelve volt y desde ahí **traza cada pieza de Tu tienda medio
tiempo antes de que aparezca**, exacta en la grilla, con cada corte clavado en el tiempo. Lo genérico se calca; lo tuyo se traza.

Especificación de la idea:
- **Grilla:** 12 columnas de 122 px, calles de 24, márgenes de 96 (lados) y 60 (arriba y abajo), 6 filas de 140 px. Gris #1c1f22
  antes del quiebre; volt #c8ff2e al 14 % después; el trazo activo, volt al 100 %.
- **Tipografía:** supers en la display condensada de la tienda, enormes y alineados a la columna 1; rótulos "01–07" en la mono de
  la tienda (28 px), arriba a la izquierda. Las cifras salen de la interfaz real viva: no se reescriben.
- **Dispositivos 3D: CSS 3D (`preserve-3d`)** con la interfaz real viva adentro, dibujados como contorno de 1 px (nada
  fotorrealista). Por qué: texto nítido en cada cuadro, determinista y seekable como el resto del DOM, sin segundo canvas (el único
  es Shaker Rush) y barato en GPU integrada. Van en los dos momentos clave: el juego en el celular (10) y la tesis (14–15).

## 2. Arco
| Acto | Tiempos | Segundos | Qué pasa |
|---|---|---|---|
| I · Firma | 0–12 | 0,000–5,625 | `eclipse-intro` tal cual; sale por corte seco con match de centro |
| II · Calcadas | 12–28 | 5,625–13,125 | Cuatro compases, cuatro "mismo"; la relación con el cliente termina en una línea plana |
| III · Latido | 28–32 | 13,125–15,000 | La línea late, se vuelve volt, traza un marco y la pantalla de carga real cuenta 3-2-1 hacia el drop |
| IV · Siete trazos | 32–56 | 15,000–26,250 | La ráfaga numerada 01–07: de lo que vive el cliente a los números del dueño |
| V · La cuenta | 56–68 | 26,250–31,875 | Software (tienda + panel) + asesoría = la tuya vende más |
| VI · Amanecer | 68–96 | 31,875–45,000 | `eclipse-cta` (12) → guiño de precio (6) → `eclipse-outro` (10): cierre de 28 |

## 3. Tabla de escenas
| # | id | tiempos | inicio→fin (s) | receta | imagen | super exacto | entrada, cámara y sonido |
|---|---|---|---|---|---|---|---|
| 1 | `intro` | 12 (0–12) | 0,000→5,625 | existente `eclipse-intro` | firma Eclipse | (los de la firma) | Sin cambios. Salida: corte seco en 12,0; el primer clon cae en el centro exacto (960, 540) donde estaba el eclipse; la cola del intro se corta seco |
| 2 | `calcadas` | 4 (12–16) | 5,625→7,500 | nueva `clones`: un `<symbol>` SVG + `<use>`, desalineado por semilla | tienda genérica dibujada en grises: barra, banner "20 % OFF", 4 potes sin rayo, sin marcas | "Mismo template." | Grilla gris ya puesta. 1 → 4 → 16 → 64 copias en 12 · 13 · 14 · 15, corridas ±6 px y giradas ±1,5° como fotocopias que pisan la grilla. Cámara fija. Un click por tanda |
| 3 | `veinte` | 4 (16–20) | 7,500→9,375 | a portar `ticker` | "20 % OFF" gris en filas a −8° | "Mismo 20 % OFF." | Corte en 16,0. Filas alternadas que aceleran (subida 18,0–19,5) y se congelan en 19,5 (tick) |
| 4 | `potes` | 4 (20–24) | 9,375→11,250 | `clones` (variante catálogo) | potes grises idénticos, 4 por fila | "Misma grilla de potes." | Corte en 20,0. El catálogo sube sin fin (whoosh) y frena seco en 23,0 (tick); en 23,5 queda solo el pote del centro |
| 5 | `plano` | 4 (24–28) | 11,250→13,125 | nueva `trace` | el pote → una caja → una línea | "Cero relación después de comprar." | 24,0 click en un botón gris sin texto; 24,5 el pote cae en una caja; 25,0 la caja sale por derecha (whoosh) y queda una línea plana gris de 1 px a lo ancho (y = 540). 27,5 silencio |
| 6 | `latido` | 2 (28–30) | 13,125→14,063 | `trace` | la línea | "La tuya, no." (28,0–31,0, columnas 1–4) | 28,0 un latido: pico y la línea pasa a volt; 28,5–29,5 se abre en un marco 4:3 de 1144 × 858 en las columnas 5–12. Ver M1 |
| 7 | `w1-carga` | 4 (30–34) | 14,063→15,938 | nueva `live`: componente real con su reloj atado al timeline | `SplashStage` `crossfit-open` en vivo + la marca real arriba, como en la tienda (sin la línea de ciudad) | "01 · Pantalla de carga por fecha" (31,0–34,0) | Entra dentro del marco con el "3"; 3 · 2 · 1 en corcheas; 31,5 congelado y silencio; 32,0 "YA" = drop 1; empuje 1,00 → 1,02 |
| 8 | `w2-tema` | 3 (34–37) | 15,938→17,344 | existente `themeflip` sobre `live` | ficha de Ionic Whey 100 % en vivo (`ProductDetail`, respaldo `ficha-completa`), claro → oscuro con `ThemeToggle` | "02 · Claro u oscuro" | Corte seco a la ficha en claro. 35,0 click en el botón; sale un círculo de 1 px y, medio tiempo detrás, el oscuro, que cubre todo en 36,0 (whoosh → impact) |
| 9 | `w3-regalo` | 4 (37–41) | 17,344→19,219 | `live`: `OpeningStage`/`BoxingBag` con golpes del timeline | `regalo-bolsa`: "Juli, te llegó un regalo de Caro" | "03 · Regalos que se abren" | Corte en 37,0. 5 golpes en corcheas 37,0–39,0 (impact cada uno; péndulo sin escala) y se llenan las 5 celdas del medidor; 39,0–40,0 cámara lenta; 40,0 se abre (shimmer) y aparece la tarjeta real |
| 10 | `w4-shaker` | 3 (41–44) | 19,219→20,625 | nueva `device` (celular CSS 3D) + `live` | Shaker Rush en vivo (canvas; semilla 11, piloto automático; `juego-inicio` no sirve: es la portada) | "04 · Shaker Rush, arcade propio" | Corte en 41,0. El celular gira rotateY −10° → −4°. Se elige la ventana de la partida con atrapadas seguidas (±5 % de velocidad) para que cada una caiga en una nota del pluck |
| 11 | `w5-ruleta` | 4 (44–48) | 20,625→22,500 | `live`: `WheelDisc` con `rotate` del timeline | ruleta "disco olímpico" en vivo (`ruleta`), premio fijado 5 % | "05 · Ruleta de premios" | Corte fuerte (c. 12). Anillo de 1 px, giro cuantizado y frenada en "5%" en 47,0. Ver M2 |
| 12 | `w6-mostrador` | 4 (48–52) | 22,500→24,375 | `live` + existente `statpunch` | diálogo "Cobrar $ 109.530" del Mostrador en vivo (`mostrador-cuotas`) | "06 · Mostrador" + "3 cuotas de $ 40.892" (un bloque) | Corte fuerte (c. 13). Trazo en la tarjeta "3 cuotas", se elige en 48,5 y la cifra se despega en 49,0. Ver M3 |
| 13 | `w7-proveedor` | 4 (52–56) | 24,375→26,250 | `live` + `statpunch` con capa nueva de 48 rayas | `SupplierListPage` en vivo con la lista de muestra y `[data-diff-summary]` (la captura `proveedor-diferencias` no llega al resumen) | "07 · Lista del proveedor" + "48 suben" (un bloque) | Corte fuerte (c. 14). Se pega la lista y cuenta 12 · 24 · 36 · 48; 55,5 negro y silencio. Ver M3 |
| 14 | `software` | 4 (56–60) | 26,250→28,125 | `device` ×2 + `live` | notebook: `TodayHome` ("Hoy en tu tienda", por cobrar $ 171.150, para armar 08); celular: inicio en oscuro (`HeroCarousel` pausado) | "No es solo software." | Drop 2 en 56,0 (boom): se dibujan los contornos de 1 px de los dos aparatos; 56,5 se encienden las pantallas (impact); órbita rotateY −12° → −6° hasta 60,0 |
| 15 | `asesoria` | 4 (60–64) | 28,125→30,000 | a portar `rules` | los aparatos, chicos, en columnas 1–6 + un "+" | "+ Asesoría de growth y fidelización." (60,5–64,0) | 60,0 los aparatos bajan a 0,6 y se corren; 60,5 raya horizontal (tick), 61,0 vertical (tick), 61,5 las dos engordan a 16 px en corona #f5b942: la asesoría la pone Eclipse (impact) |
| 16 | `promesa` | 4 (64–68) | 30,000→31,875 | a portar `stack` | tipografía | "Para que la tuya venda más." | Corte en 64,0: tres renglones en semicorcheas (64,0 · 64,25 · 64,5, impact cada uno), "MÁS" en volt; la grilla destella 1/8 de tiempo en 64,5. 67,5 negro salvo el eje de 1 px (y = 540); silencio |
| 17 | `cta` | 12 (68–80) | 31,875→37,500 | existente `eclipse-cta` | firma Eclipse | "Probalo en vivo." (de la firma) | En 68,0 el eje de 1 px pasa a corona y se apaga en un tiempo como horizonte del amanecer; la receta no se toca |
| 18 | `guiño` | 6 (80–86) | 37,500→40,313 | `statpunch` con piel Eclipse | Geist Mono + Instrument sobre el amanecer #f4efe6 que deja la cta | "Tu tienda, adaptada: $ 750.000" (80–83) → "+ asesoría y 3 meses bonificados." (83–86) | 80,0 raya corona de 1 px (shimmer); 83,0 cambio (campana). Letra chica: "Campaña base · USD 500 · dólar a $ 1.500" / "Asesoría inicial de growth · 3 meses de plan Esencial ($ 45.000/mes) · sujeto a disponibilidad" |
| 19 | `outro` | 10 (86–96) | 40,313→45,000 | existente `eclipse-outro` | firma Eclipse | — | Corte en 86,0 (tiempo 3 del c. 22) |

Suma: 12 + 16 + 2 + 26 + 12 + 12 + 6 + 10 = **96**. Los 7 "wow" son 7–13: de 1,41 a 1,88 s cada uno (el 13 se ve 1,64 s + medio
tiempo de negro). Los cortes fuertes caen en el tiempo 1: 12, 16, 20, 24, 28, 44, 48, 52, 56, 60, 64, 68, 80.

## 4. Momentos firma
**M1 · "Un latido y 3, 2, 1"** (27,5–32,0 · 12,891–15,000 s)
- 27,5: silencio real. En pantalla, solo la línea plana gris de 1 px a lo ancho; el super "Cero relación después de comprar." sigue.
- 28,0: un latido. El tramo central dibuja un pico (sube 120 px, baja 40, vuelve) en 1/4 de tiempo, power4; el volt corre desde el
  pico hasta los dos bordes y llega en 28,5. Suena el latido de `tension` (bombo + sub), el primero de la pieza. Corte de super a
  "LA TUYA, / NO." (150 px, columnas 1–4).
- 28,5→29,5: la línea se abre como un diafragma: el tramo de las columnas 5–12 se parte en dos rayas que viajan a y = 111 y y = 969
  mientras se dibujan los laterales (marco 4:3 de 1144 × 858); lo que sobra a la izquierda se retrae. power3.inOut, sobre la subida.
- 30,0 · 30,5 · 31,0: dentro del marco, la pantalla de carga real `crossfit-open` con la marca arriba: "3", "2", "1" en rojo, cada
  uno con su fogonazo y un pitido (tick en La 5). La escena corre a ×1,065: sus números cada 220 ms caen en corcheas exactas. En
  31,0 el super pasa a "01 · Pantalla de carga por fecha".
- 31,5: congelado con el "1" encendido; silencio total (la subida corta seco). Sin congelar, el "YA" caía en 31,5: el medio tiempo
  de silencio que pide el drop es exactamente el que se inserta.
- 32,0: "YA". El reloj arranca de cero en volt (la capa real "reloj en marcha") = drop 1: impact + boom + groove + estribillo.
  Empuje 1,00 → 1,02 hasta 34,0.

**M2 · "La ruleta en la grilla"** (44,0–48,0 · 20,625–22,500 s)
- 44,0: corte fuerte (c. 12) al disco olímpico real, encuadrado al disco y a "CARGÁ LA BARRA" (quedan afuera la barra y el botón).
- 44,0→44,5: un anillo volt de 1 px recorre el borde del disco en sentido horario desde el puntero; whoosh inverso.
- 44,5→47,0: el giro lo maneja el timeline (el `rotate` del componente). Las fronteras de los 8 gajos pasan por el puntero en fusas
  (44,5–45,5: 8 pasos, una vuelta), en semicorcheas (45,5–46,5: 4) y en una corchea (46,5): 13 pasos. La curva es suave y monótona
  pero pasa exacta por esos 13 instantes; el puntero patea en cada paso (su `kick` real, también atado al timeline) y cada patada es un tick: la frenada suena
  como un ritardando escrito.
- 47,0: frena en el centro de "5%" (premio fijado con `Math.random = () => 0.1`); el gajo se enciende (estado real de aterrizaje);
  impact sobre el Sol, último acorde del estribillo. 47,0–48,0: nada se mueve.

**M3 · "El dato se despega"** (48,0–56,0 · 22,500–26,250 s)
- 48,0: corte fuerte (c. 13) al diálogo real "Cobrar $ 109.530 · Con el descuento stack de $ 12.170", en las columnas 7–12.
  48,0→48,5: trazo volt de 1 px alrededor de la tarjeta "3 cuotas · 3 × $ 40.892 · +12 %"; 48,5 se elige (click) y el trazo queda
  como su borde volt real.
- 48,5→49,0: "3 cuotas de $ 40.892" se despega del resumen (FLIP desde su caja exacta) y aterriza en las columnas 1–10 con 220 px
  de altura de mayúscula; el diálogo baja a 20 %. Whoosh corto e impact en 49,0. Arriba, "06 · MOSTRADOR". Quieto hasta 52,0.
- 52,0: corte fuerte (c. 14) a la lista del proveedor real; click en "Cargar la lista de muestra" y la lista ("MAYORISTA DEL PUERTO ·
  Lista de costos octubre 2026…") cae entera: se pega, no se tipea.
- 52,5→53,25: la página baja a 20 % y "48" cuenta 12 · 24 · 36 · 48 en semicorcheas mientras 48 rayas volt de 1 × 160 px se dibujan
  de a 12 sobre la línea de base (un tick por grupo, impact en el último). "suben" en mono al lado; "07 · LISTA DEL PROVEEDOR"
  arriba. Quieto hasta 55,5; 55,5 negro y silencio; 56,0 drop 2. Todo el momento corre sobre `stutter` en semicorcheas.

## 5. Plan musical
| Tiempos | Estilo | Qué suena y dónde |
|---|---|---|
| 0–12 | firma | El intro tal cual; su cola se corta seco en 12,0 |
| 12–24 | `tension` sin latido | Dron. Click por tanda de clones (12 · 13 · 14 · 15); subida 18,0–19,5 que corta con el congelado (tick); whoosh 20–23, tick 23,0 |
| 24–27,5 | `tension`, solo dron | Click 24,0, whoosh 25,0; después la línea plana: un seno solo |
| 27,5–28 | **silencio** | Medio tiempo antes del latido |
| 28–31,5 | `tension` | Latido único en 28,0; subida 28,5–31,5; pitidos (tick) en 30,0 · 30,5 · 31,0 |
| 31,5–32 | **silencio** | El "1" congelado |
| 32–48 | **drop 1** → `drop` | Impact + boom en 32,0; groove y estribillo entero (Am 32 · F 36 · C 40 · G 44); golpes de la bolsa en corcheas (37–39), atrapadas sobre las notas del pluck (41–43), ticks cuantizados de la ruleta (44,5–47) |
| 48–55,5 | `drop` + `stutter` | Gate en semicorcheas sobre Am–F; click 48,5, impact 49,0, click 52,0, ticks 52,5–53,25 |
| 55,5–56 | **silencio** | Negro |
| 56–67,5 | **drop 2** → `half` | Boom 56,0; bombo a la mitad y estribillo en campana (Am 56 · F 60 · G 64); impact 56,5 y 61,5; tres impacts 64,0 · 64,25 · 64,5; queda suspendido en Sol |
| 67,5–68 | **silencio** | Solo el eje de 1 px |
| 68–86 | `calm` | El Sol resuelve en Do mayor justo en "Probalo en vivo"; shimmer 80,0; campana 83,0 |
| 86–96 | `final` | Outro de la firma |

## 6. Versión 9:16 y movimiento reducido
- **9:16 (1080 × 1920), re-encuadre:** misma partitura y mismos cortes; la grilla pasa a 6 columnas de 140 px × 12 filas; los clones se apilan en dos columnas, el marco 4:3 del latido va arriba con el super abajo, la tienda se monta a 390 (la app es responsive: no se recorta el 1440) y el panel a 390 o dentro del celular CSS 3D.
- Las cifras ("$ 40.892", "48") se parten en dos renglones a todo el ancho; en la tesis el celular va adelante y la notebook atrás, girada 20°, y el "+" baja debajo de los dos.
- **Movimiento reducido:** sin trazos que se dibujan, sin 3D ni giros: cada pieza aparece ya trazada con un fundido de 1/4 de tiempo y la cuenta 3-2-1, la ruleta y los contadores saltan a su estado final en el mismo tiempo; música, cortes y supers no cambian.

## 7. Riesgos y cómo se evitan
- **GPU.** Clones: un `<symbol>` + 64 `<use>` (solo transform). Grilla: un SVG con `vector-effect: non-scaling-stroke`. Nunca más de
  dos trazos (`stroke-dashoffset`) a la vez. Un solo canvas en toda la pieza (Shaker Rush, 41–44); nada de Three.js. Aparatos CSS 3D:
  caras planas, ±12°, sombra como degradé fijo (sin blur). Las pantallas de carga ya se mueven solo con transform y opacity.
- **El 1 px en video.** En H.264 4:2:0 una raya volt de 1 px pierde color y titila: los trazos se alinean al medio píxel y en el MP4
  1080p van a 2 px (1 px en el máster 4K). Volt sobre #060707 sobra de contraste.
- **Nitidez.** Las cifras que se despegan se maquetan a su tamaño final y se animan con escala ≤ 1 (de 0,18 a 1), nunca agrandando
  un bitmap. La interfaz va viva y se exporta cuadro a cuadro.
- **Honestidad.** Clones dibujados, grises y sin marcas. Toda cifra sale de la app: 48 suben, $ 109.530, $ 12.170, 3 cuotas de
  $ 40.892, $ 171.150, 08. "Para que la tuya venda más" es promesa, sin número. El guiño lleva "sujeto a disponibilidad" y lo que
  cuesta el plan después. La notebook deja ver la banda "Panel de demostración · datos ficticios". Solo se re-cronometra el reloj de
  componentes reales (la carga ×1,065 con un congelado, el giro, la partida con semilla), no lo que hacen; el premio se fija como
  dice `ui.md`.
- **Marca.** La bolsa de boxeo de la app se aplasta en cada golpe (escala 1,035 × 0,96) y lleva el rayo: en el trailer el golpe es
  solo péndulo (rotate + translate). El rayo nunca se traza ni se escala. El eclipse queda en las firmas; antes, la corona aparece
  solo como color (el "+").
- **Legibilidad sin sonido.** Un super por vez y siempre ≥ 1,41 s; los rótulos 01–07 dicen qué es cada plano; las cifras se leen
  completas ≥ 1,05 s y vienen contadas desde antes. Rótulo + cifra son un solo bloque `statpunch` de ≤ 6 palabras (si el juez lo
  cuenta como dos, el rótulo queda en "06" y "07" solos).
- **Frío / ¿qué es?** El quiebre es un latido, no un logo; en el medio van una persona regalándole a otra (Caro a Juli) y un juego
  que toca el estribillo; la tesis muestra tienda + panel antes de nombrar la asesoría, y "la tuya" vuelve en la promesa. Si en la
  prueba con dueños "La tuya, no." no se entiende sin sonido, el respaldo es "La tuya, distinta.".
