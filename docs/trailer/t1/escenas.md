# T1 · Escena por escena (16:9), escenas 1 a 9

**Convenciones:**
- Tiempos absolutos en **tiempos** desde 0. Un tiempo dura 0,46875 s; un compás son 4 tiempos.
- Coordenadas en el escenario de 1920 × 1080, con la grilla de `storyboard.md` §5.
- "Cue" es `t · voz · nota · ganancia` (la nota en MIDI). La lista completa está en `sonido.md`.

## 1 · `apertura` · 0–12 · `eclipse-intro`
- Sin cambios. Su disolución termina en 11,8.
- La subida de `tension` corta seco en 11,5 y deja medio tiempo de silencio real.
- **Salida en 12:** corte seco **sin golpe** (el anti-drop): lo cósmico de Eclipse contra un click de plantilla.

## 2 · `calcadas` · 12–16 · `clones`
- **Objetivo:** todas las tiendas son la misma tienda, copiada.
- **Tienda genérica** (un `<symbol>` SVG de 1440 × 900, todo en grises `#24282c`, `#2a2e32`, `#3a3f44` y `#5b6066`):
  - barra con un logo-mancha (120 × 28) y 4 pastillas de menú;
  - banner con "20 % OFF" en sans gris de 140 px;
  - 4 potes lisos iguales (sin etiqueta ni rayo) con el precio como una barra gris;
  - botón "COMPRAR".
- **12,0:** corte. La tienda a escala 1,2 (1728 × 1080), centrada, sobre el fondo `#0b0d0e` con la grilla gris.
- **13,0, 14,0 y 15,0:** se "pega" la tanda siguiente.
  - Cada tanda aparece en un cuadro: 4 → 16 → 64 copias, en grilla de 2 × 2, 4 × 4 y 8 × 8 con paso de 1488 px.
  - Cada copia va corrida ±6 px y girada ±1,5° con una semilla fija: fotocopias que pisan la grilla.
  - La cámara salta a la mitad (escala 1 → 0,5 → 0,25 → 0,125) en ¼ de tiempo, `trl.expo`.
- **Super** (plantilla, aparece en un cuadro): "Mismo template.", de 12 a 16.
- **Cues:** en 12, 13, 14 y 15 suena `click · — · 0,7` junto con `tick · 69 · 0,35` (el "bip" de copiar y pegar).

## 3 · `veinte` · 16–20 · `ticker` (port de kinetic-studio)
- **16,0:** corte a 7 filas de "20 % OFF · 20 % OFF · …".
  - Sans de la tienda, 150 px, gris `#3a3f44`, una fila cada 160 px.
  - El grupo va girado −8° (fijo). Las filas pares van a la izquierda y las impares a la derecha.
- **Velocidad:**
  - de 16 a 18, constante (120 px por tiempo);
  - de 18 a 19,5, acelera ×4 (`power2.in`);
  - en 19,5 se congela en un cuadro.
- **Super:** "Mismo 20 % OFF.", de 16 a 20.
- **Cues:**
  - 16 · `click` · — · 0,5
  - 18 a 19,5 · `riser` · — · 0,4 (corta seco)
  - 19,5 · `tick` · 74 · 0,6

## 4 · `potes` · 20–24 · `clones` (variante catálogo)
- **20,0:** corte a un catálogo de potes grises iguales.
  - 6 columnas de potes de 180 × 240, con el precio como barra gris (sin cifras).
  - El patrón se repite hacia abajo.
- **Movimiento:**
  - de 20 a 22,75 sube a 900 px por tiempo (lineal);
  - de 22,75 a 23 frena (`power4.out`) y en 23,0 queda clavado.
- **23,5:** todo se va (opacidad a 0 en ⅛ de tiempo) menos el pote central, que queda solo en (960, 540).
- **Super:** "Misma grilla de potes.", de 20 a 24.
- **Cues:**
  - 20 · `whoosh` · — · 0,35 (dura 2,75 tiempos)
  - 23 · `tick` · 74 · 0,6
  - 23,5 · `tick` · 64 · 0,3

## 5 · `plano` · 24–28 · `trace`
- **24,0:** debajo del pote aparece el botón gris "COMPRAR" (sans, 40 px). Un cursor genérico (flecha gris, 48 px) entra desde (1300, 900) entre 24 y 24,5.
- **24,5:** click. El botón se hunde 2 px.
- **25,0:** el pote cae en una caja que se cierra (tapas en ¼ de tiempo).
- **25,5:** la caja sale por la derecha (x hasta 2200, en ½ tiempo, `expo.in`). Deja su base como una **línea gris de 1 px**, que de 25,5 a 26 se estira desde la caja hasta los dos bordes, en y = 540.
- **26 a 27,5:** solo la línea plana gris, con el tono plano.
- **27,5 a 28:** silencio, con el cuadro quieto.
- **Super:** "Y después de comprar, nada.", de 24 a 28.
- **Cues:**
  - 24,5 · `click` · — · 0,6
  - 25 · `tick` · 62 · 0,4
  - 25,5 · `whoosh` · — · 0,4
  - 26 a 27,5 · **tono plano**: seno puro en La5 (81), −24 dBFS, que corta seco

## 6 · `latido` · 28–30 · `trace`
- **28,0: el latido.** En x = 960 la línea dibuja un pico de electrocardiograma en ¼ de tiempo: sube 120 px, baja a 40 px por debajo y vuelve (`points` del SVG, `trl.whip`). En el mismo cuadro:
  - la línea se vuelve volt desde el pico hacia los dos bordes (dos tramos con `scaleX` de 0 a 1 desde 960; llegan en 28,5);
  - la grilla pasa a volt al 14 % (fundido entre dos capas);
  - el fondo pasa a `#060707`.
- **Super:** "La tuya, no.", de 28 a 31.
  - Display de 150 px en dos renglones, "LA TUYA," y "NO." (con "NO." en volt).
  - Ocupa las columnas 1 a 4 (x de 96 a 656) y las filas 3 y 4.
  - Entra con máscara: las letras suben en ¼ de tiempo.
- **28,5 a 29,5: diafragma** (`trl.expo`).
  - El tramo sobre las columnas 5 a 12 (x de 680 a 1824) se parte en dos rayas que viajan a y = 111 y a y = 969.
  - Mientras tanto se trazan los laterales en x = 680 y x = 1824.
  - Lo que queda a la izquierda de 680 se retrae hacia ese punto.
  - Queda un marco volt de 1144 × 858 (4:3).
- **Cues:**
  - 28 · `boom` · 33 · 0,7, junto con `sub` · 33 · 0,6
  - 28,5 a 31,5 · `riser` · — · 0,45

## 7 · `w1-carga` · 30–34 · `splash-live`
- **Composición:** dentro del marco va la pantalla de carga real de la tienda (marca arriba, escenario `crossfit-open` y rótulo), escalada a 1144 × 858.
- **Reloj del CSS de la escena** (milisegundos, manejados con `getAnimations().currentTime`):
  - desde 30 hasta 31,4: `ms = 260 + (t − 30) · 440`;
  - de 31,4 a 32: queda en `ms = 880`, con el "1" encendido;
  - desde 32: `ms = 920 + (t − 32) · 440`.
  - Así el 3 cae en 30,0, el 2 en 30,5 y el 1 en 31,0, todos en corcheas, y el "ya" en 32,0.
- **32,0:** el "ya": el reloj arranca de cero en volt. Es el **DROP 1**. La cámara empuja de 1,00 a 1,02 entre 32 y 34 (`sine.out`).
- **33,0 y 33,5:** corte dentro del marco, primero a Black Friday (`ms = 1500`: persiana arriba y marcador encendido) y después a Navidad (`ms = 1500`: el árbol de discos cargado). Cada una queda quieta en su clímax, con su rótulo al pie.
- **Rótulo:** "01 · Pantallas de carga por fecha", de 31 a 34.
- **Cues:**
  - 30, 30,5 y 31 · `tick` · 81 · 0,5 (los pitidos)
  - **31,5 a 32: silencio**
  - 32 · `impact` · — · 0,9, junto con `boom` · 33 · 0,8
  - 33 y 33,5 · `tick` · 88 · 0,3

## 8 · `w2-tema` · 34–37 · `themeflip` con placas
- **34,0:** corte a la placa `ficha-completa-1440-light` a todo el ancho: la cabecera y el hero de Ionic Whey. Entre 34,5 y 35 se traza un anillo volt de 1 px alrededor del botón de tema de la cabecera.
- **35,0:** click. Desde el centro del botón se abre un círculo con la placa `ficha-completa-1440-dark` (`clip-path: circle()`, 1 tiempo, `trl.expo`). En 36,0 ya cubre todo (radio ≥ 2200).
- **36 a 37:** la cámara empuja de 1,00 a 1,06 sobre el pote bajo la lámpara (`trl.rampa`).
- **Rótulo:** "02 · Modo claro y oscuro", de 34 a 37. Existe en las dos capas: en la clara, el chip es `#f2f0ea` con tinta `#060707`.
- **Cues:**
  - 34 · `tick` · 88 · 0,3
  - 34,5 · `tick` · 93 · 0,25
  - 35 · `click` · — · 0,7, junto con `whoosh` · — · 0,5 (dura 1 tiempo)
  - 36 · `impact` · — · 0,7

## 9 · `w3-regalo` · 37–41 · `gift-live`
- **37,0:** corte a la escena real del regalo `REGALO-VE1M-AR7X`: "Juli, te llegó un regalo de Caro", la bolsa colgando al centro y el medidor de 5 golpes vacío.
- **Golpes en 37,0, 37,5, 38,0, 38,5 y 39,0:** en cada uno pasa todo esto:
  - la bolsa se balancea como un péndulo: rotación de ±6° alternando lados y ±24 px en x, con vuelta en ¼ de tiempo y **sin escala**;
  - aparece el anillo de impacto de la app y se llena una celda del medidor;
  - el texto cambia como en la app ("¡Otra vez!", "¡Más fuerte!", "¡Ya casi!", "¡El último, con todo!").
- **39 a 40:** la cámara lenta de la app (bandas de cine y viñeta), con un empuje de 1,00 a 1,25 sobre la bolsa (`trl.rampa`).
- **40,0:** "¡La rompiste!". Sale el regalo con su halo: Ionic Whey 100 % Chocolate, en el pote de la ficha `tutienda`. De 40 a 41, quieto.
- **Rótulo:** "03 · Regalos que se abren a golpes", de 37 a 41. Va **abajo**, en (96, 960), para no tapar el título del regalo.
- **Dato:** la bolsa tiene impresa una línea de pulso bajo el rayo. Hace eco del latido de la escena 6 sin forzarlo.
- **Cues:** el groove pierde el bombo y el bajo entre 37 y 39.
  - 37, 37,5, 38, 38,5 y 39 · `kick` · — · 0,9, junto con `impact` · — · 0,5 y `bass` · 41, 45, 48, 52 y 53 · 0,7
  - 39 · `whoosh` · — · 0,4 (inverso, dura 1 tiempo)
  - 40 · `shimmer` · 88 · 0,7


Sigue en [`escenas-2.md`](escenas-2.md) (escenas 10 a 19).
