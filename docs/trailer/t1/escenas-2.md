# T1 · Escena por escena (16:9), escenas 10 a 19

Sigue de [`escenas.md`](escenas.md), que tiene las convenciones y las escenas 1 a 9.

## 10 · `w4-shaker` · 41–44 · `device` + `shaker-replay`
- **41,0:** corte a un celular en CSS 3D.
  - Cuerpo de 430 × 900 px, filo volt de 1 px y bisel `#121416`.
  - Centrado en (1000, 540), entre las columnas 6 y 9, con perspectiva de 1600 px.
  - Gira en Y de −10° a −4° entre 41 y 44 (`sine.inOut`).
- **Pantalla:** Shaker Rush jugándose, con el HUD del juego (canvas, semilla 11, piloto automático, paso fijo de 1/60 s).
  - Se elige la ventana de la partida para que las atrapadas caigan en 41,0, 41,5 y 42,0: son el Mi, el Sol y el La del estribillo.
  - En 43,0 aparece "¡Tiempo!" con el puntaje (`GameResult`, sin su `backdrop-blur`).
  - Solo se re-cronometra el reloj: lo que pasa en la partida es lo que da la semilla.
- **Rótulo:** "04 · Un juego propio", de 41 a 44. Las columnas 1 a 4 quedan libres.
- **Cues:**
  - 41 · `tick` · 88 · 0,3
  - Las atrapadas son las notas del estribillo: no llevan sonido aparte
  - 43 · `impact` · — · 0,6

## 11 · `w5-ruleta` · 44–48 · `wheel-live`
- **44,0:** corte fuerte (compás 12) al disco olímpico real (`WheelDial` con su collar), de 860 px de diámetro y centro en (960, 560), con "CARGÁ LA BARRA" arriba. La barra y el botón quedan afuera del cuadro.
- **44 a 44,5:** un anillo volt de 1 px recorre el borde del disco en sentido horario, desde el puntero.
- **44,5 a 47:** el timeline maneja el giro. Las fronteras entre gajos pasan por el puntero en 13 pasos:
  - 44,5 + k/8, con k de 0 a 7 (8 pasos: una vuelta);
  - 45,5 + k/4, con k de 0 a 3;
  - 46,5.
  - La rotación es monótona y pasa exacta por esos instantes (lineal entre pasos y suavizada en el último).
  - En cada paso, el collar cabecea (`kick` de −12° a 0 en ⅛ de tiempo).
- **47,0:** se detiene en el centro de "5 %" y el gajo se enciende (es el estado real de premio). De 47 a 48, quieto.
- **Rótulo:** "05 · Ruleta de cupones", de 44 a 48.
- **Cues:**
  - 44 · `whoosh` · — · 0,35 (inverso, dura ½ tiempo)
  - 13 `tick` · 93 en los pasos, con ganancia que baja de 0,5 a 0,3
  - 47 · `impact` · — · 0,7 (cae con el La final del estribillo)

## 12 · `w6-mostrador` · 48–52 · `plate`
- **48,0:** corte fuerte (compás 13) a la placa `mostrador-cobrar`.
  - Encuadra el diálogo: "Cobrar $ 109.530", "Con el descuento stack de $ 12.170." y las formas de pago.
  - El diálogo ocupa las columnas 7 a 12.
- **48 a 48,5:** trazo volt de 1 px alrededor de la tarjeta "3 cuotas · 3 × $ 40.892 · +12 %".
- **48,5:** click. La placa pasa a `mostrador-cuotas` en ⅛ de tiempo: la tarjeta queda elegida, con su borde volt real.
- **48,5 a 49:** "3 cuotas de $ 40.892" se despega del resumen.
  - Sale desde su caja medida en la placa y aterriza en las columnas 1 a 10, con y de 300 a 620.
  - Display, altura de mayúscula de 220 px; "$ 40.892" en volt.
  - Se maqueta a su tamaño final y se anima con escala de 0,18 a 1. Nunca se agranda una imagen.
  - La placa baja al 20 %.
- **49,5:** debajo aparece "Total con recargo $ 122.676 · recargo 12 %" (mono de 32 px, `#a6abb0`). Queda quieto hasta 52.
- **Rótulo:** "06 · Mostrador en cuotas", de 48 a 52.
- **Cues:**
  - 48 · `tick` · 88 · 0,3
  - 48,5 · `click` · — · 0,7, junto con `whoosh` · — · 0,4 (corto)
  - 49 · `impact` · — · 0,8
  - 49,5 · `tick` · 81 · 0,3

## 13 · `w7-proveedor` · 52–56 · `plate`
- **52,0:** corte fuerte (compás 14) a la placa `proveedor-pegar`. Click en "Cargar la lista de muestra".
- **52,125:** la lista cae entera, con un corte a la placa `proveedor-resumen`: se pega, no se tipea. Arriba se lee "MAYORISTA DEL PUERTO · Lista de costos octubre 2026…".
- **52,5:** la placa baja al 20 %.
  - El "48" cuenta 12, 24, 36 y 48 en 52,5, 52,75, 53,0 y 53,25 (display de 360 px en volt, columnas 1 a 5).
  - Mientras tanto se trazan 48 rayas volt de 1 × 160 px, de a 12, sobre una línea base en y = 820 (columnas 6 a 12).
  - "SUBEN" va a la derecha del 48, en display de 120 px.
- **53,5:** debajo aparece "3 bajan · 2 sin coincidencia" (mono de 34 px). El resumen completo, sin recortar.
- **55,5:** corte a negro (solo queda la grilla) y silencio.
- **Rótulo:** "07 · Lista del proveedor", de 52 a 55,5.
- **Cues:**
  - 52 · `click` · — · 0,6
  - 52,125 · `tick` · 74 · 0,4
  - 52,5, 52,75 y 53 · `tick` · 76, 79 y 81 · 0,45
  - 53,25 · `impact` · — · 0,8
  - 53,5 · `tick` · 69 · 0,3
  - **55,5 a 56: silencio**

## 14 · `software` · 56–60 · `device` ×2
- **56,0: DROP 2.** Sobre negro con la grilla, en ½ tiempo se trazan los contornos volt de 1 px de dos equipos en CSS 3D:
  - una notebook con pantalla de 1040 × 650, centrada en (1290, 520), entre las columnas 6 y 12, girada −12° en Y y 6° en X;
  - un celular de 380 × 780, adelante de la notebook y a su izquierda, centrado en (860, 600), girado 14° en Y.
- **56,5:** se prenden las pantallas (opacidad de 0 a 1 en ⅛ de tiempo).
  - Notebook: placa `hoy-1440-dark`, con "Hoy en tu tienda", por cobrar $ 171.150 y para armar 08. La banda "Panel de demostración · datos ficticios" queda a la vista.
  - Celular: `home-carrusel-390-dark`, con "CARGÁ TU MEJOR VERSIÓN".
- **56,5 a 60:** el par gira en Y de −12° a −6° (`sine.inOut`).
- **Super:** "No es solo software.", de 56 a 60.
  - Display de 130 px en tres renglones ("NO ES", "SOLO", "SOFTWARE."), en las columnas 1 a 4.
  - "SOFTWARE." va en volt.
- **Cues:**
  - 56 · `boom` · 33 · 0,9, junto con `whoosh` · — · 0,4
  - 56,5 · `impact` · — · 0,6

## 15 · `asesoria` · 60–64 · `rules` + `device`
- **60,0:** sale el super (las letras suben). Los equipos se achican a escala 0,6 y se corren a las columnas 1 a 5, con centro en x = 450 (1 tiempo, `trl.expo`).
- **60,5:** se traza una raya horizontal de 1 px y 160 px de largo, centrada en (887, 540).
- **61,0:** se traza la raya vertical. Queda el "+".
- **61,5:** las dos rayas engordan a 16 px y pasan a corona `#f5b942`. Al mismo tiempo:
  - la corona sube detrás de los equipos: un radial `#f5b942` al 35 %, de 1600 px, que va de y + 900 a y + 600 en 2 tiempos (`trl.rampa`);
  - los filos de los equipos pasan de volt a corona, a contraluz.
  - La asesoría la pone Eclipse.
- **Super:** "+ Asesoría de growth marketing y fidelización.", de 60,5 a 64.
  - Display de 110 px en tres renglones ("ASESORÍA DE", "GROWTH MARKETING", "Y FIDELIZACIÓN."), en las columnas 7 a 12.
  - El "+" corona queda a su izquierda.
- **Cues:**
  - 60 · `whoosh` · — · 0,3
  - 60,5 y 61 · `tick` · 81 · 0,4
  - 61,5 · `impact` · — · 0,6, junto con `shimmer` · 84 · 0,5

## 16 · `promesa` · 64–68 · `stack`
- **64,0:** corte a negro con la grilla volt al 14 %.
  - Display de 200 px en tres renglones, "PARA QUE", "LA TUYA" y "VENDA MÁS.", en las columnas 1 a 10.
  - Cada renglón entra con máscara en ⅛ de tiempo: en 64,0, 64,25 y 64,5.
  - "MÁS." va en volt.
  - El eje (una línea volt de 1 px a lo ancho) queda en y = 860, debajo del texto.
- **64,5 a 67,5:** la cámara empuja de 1,00 a 1,03 (`trl.rampa`).
- **65,0:** aparece la marca real de Tu tienda (el rayo y "TU TIENDA", 64 px de alto), en las columnas 11 y 12, a y = 900 (opacidad en ½ tiempo).
- **67,5:** corte. Queda solo el eje y suena el silencio.
- **Super:** de 64 a 67,5.
- **Cues:**
  - 64, 64,25 y 64,5 · `impact` · — · 0,7, 0,6 y 0,8
  - 65 · `shimmer` · 88 · 0,35
  - **67,5 a 68: silencio**

## 17 · `en-vivo` · 68–80 · `eclipse-cta`
- La receta va tal cual (12 tiempos).
- En 68,0 el eje pasa a corona en ⅛ de tiempo y se apaga en 1 tiempo, mientras la noche empieza a amanecer: la línea que nació plana se va con el amanecer.
- Los cues son los de la receta.

## 18 · `guino` · 80–86 · `eclipse-guino` (nueva)
- **Datos:** salen del libro `tu-tienda`, sección `base-campaign`, como en `eclipse-prices`. Si al libro le falta una frase, se agrega al JSON, no al código.
- **Fondo:** el amanecer pleno en el que termina la cta.
- **Composición:**
  - Marca de sección en mono: "11 · Campaña de lanzamiento".
  - Título en serif Instrument de 150 px, tinta `#111114`: "Arrancá con 3 meses *bonificados.*" ("bonificados." en itálica).
  - Una fila del libro, con filete `#c4beb4`: "Adaptación de Tu tienda + asesoría inicial de growth" y "$ 750.000" (mono de 64 px), con "USD 500" debajo (mono de 28 px, `#5b5866`).
  - Letra chica (mono de 22 px, `#5b5866`): "Incluye 3 meses del plan Esencial ($ 45.000/mes) · sujeto a disponibilidad · dólar a $ 1.500".
  - Pie (mono de 26 px): "223-446 7881 · WhatsApp o llamada".
- **Coreografía:**
  - 80,0: la marca y el título (las letras suben con máscara, 1 s);
  - 80,5: se traza el filete (1 tiempo);
  - 81,0: el precio sube;
  - 81,5: el precio en dólares;
  - 82,0: la letra chica y el pie;
  - 85 a 86: cae la noche (velo `#05050a` de 0 a 1).
- **Cues:**
  - 80 · `whoosh` · — · 0,25 (suave)
  - 80,5 · `tick` · 81 · 0,2
  - 81 · `bell` · 81 · 0,4
  - 82 · `tick` · 76 · 0,2

## 19 · `cierre` · 86–96 · `eclipse-outro`
- Sin cambios. Entra desde la noche del guiño y el eclipse se cierra.
