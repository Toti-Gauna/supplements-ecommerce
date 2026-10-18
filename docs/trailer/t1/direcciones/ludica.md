# T1 · Dirección lúdica: «El toque del rayo»

Director lúdico · la marca como personaje (lanzamiento tipo Google / Anthropic) · 128 BPM · 96 tiempos = 45,0 s.

## 1. Tesis y concepto visual
1. Todas las tiendas de suplementos suenan igual: mismo template, mismo 20 % OFF y, después de la compra, silencio.
2. "Tu tienda" es la única que se toca: su rayo toca cada pieza y la tienda responde (abre, juega, regala, cobra, se actualiza).
3. Eclipse la hace distinta y la hace vender: software que se juega + asesoría de growth y fidelización.

**Concepto: el toque del rayo.** Todo es gris y mudo hasta que el rayo del logo lo toca; donde toca, la pieza se enciende, se
mueve y suena una nota del estribillo. Es el único personaje: sale de su placa en el quiebre, enciende siete piezas y vuelve a
encastrar en su placa antes de la firma de Eclipse. En la ráfaga el estribillo no lo toca la banda: lo toca la tienda.

**Reglas del personaje (juega sin deformarse):**
- Es `LOGO_BOLT` (`src/components/atoms/Logo.tsx`) en volt `#c8ff2e`, siempre derecho (0°). Solo traslación y escala uniforme
  (120 px como personaje; en la placa, el tamaño del logo). Nunca squash, estiramiento, morph, ojos ni disfraz de fecha.
- Viaja en rectas: **golpe** (¼ de tiempo, expo.in) o **salto** en zigzag de tres tramos rectos (¼ de tiempo, eco de su propia
  forma). Estela = 3 copias del mismo rayo al 45/25/10 % de opacidad, 1/32 de tiempo atrás.
- **Contacto** = el anillo de impacto de la app (`gift-impact`: borde volt que crece y se apaga en ½ tiempo) + su nota.
- La personalidad está en el tiempo, no en la forma: anticipa con medio tiempo de quietud y 12–16 px de subida; cuando espera,
  su halo (gradiente radial aparte, sin blur) respira.
- Sobre claro (solo en B2, antes del golpe) lleva sombra: el mismo rayo en `#0b0c0d` al 35 %, 6 px abajo. Nunca un contorno.

## 2. Arco
- **I · Firma (0–12 · 0–5,63 s):** Eclipse presenta… y sale con un anti-drop: el riser corta en 11,5 y en 12, en lugar del
  golpe, suena un click seco y aparece una tienda gris. El salto de lo cósmico al template es el primer chiste.
- **II · Las tiendas mudas (12–24 · 5,63–11,25 s):** esa tienda se copia y pega hasta ser pared; todo suena al mismo click.
- **III · El primer toque (24–28 · 11,25–13,13 s):** cae el rayo, una sola tienda se da vuelta y es "TU TIENDA". "La tuya, no."
- **IV · La tienda que se toca (28–56 · 13,13–26,25 s):** siete compases, siete piezas que el rayo enciende; la bolsa es el clímax.
- **V · Vuelta a casa (56–68 · 26,25–31,88 s):** celular + notebook, software + asesoría; el rayo encastra en su placa.
- **VI · Eclipse (68–96 · 31,88–45,0 s):** Probalo en vivo · guiño de precio · el eclipse se cierra.

## 3. Tabla de escenas
| # | id | tiempos | inicio→fin (s) | receta | imagen | super exacto | entrada · cámara · qué se mueve y suena |
|---|---|---|---|---|---|---|---|
| 1 | apertura | 12 | 0,000→5,625 | `eclipse-intro` (existente) | firma Eclipse | (los de la firma) | Sin cambios; el riser corta seco en 11,5. |
| 2 | clones | 4 | 5,625→7,500 | `clones` (nueva) + `title` | tipografía + tienda gris dibujada: cabecera sin marca, banner "20 % OFF", 4 potes iguales (un `<symbol>` SVG) | Todas las tiendas se parecen. | Corte seco en 12 con un click: UNA tienda a pantalla llena. En 13, 14 y 15 se copia y pega (1→4→16→64) y la cámara se aleja en escalones 1→0,5→0,25→0,125; cada copia, el mismo click + bip. |
| 3 | iguales | 4 | 7,500→9,375 | `clones` + `title` | la pared, encuadre 4×4 (potes y banners legibles) | Mismo 20 % OFF, mismos potes. | Corte en 16 a escala 0,25. Todos los banners titilan juntos en cada tiempo (una sola opacidad dentro del `<symbol>`), mismo bip. Paneo lineal −60 px desde 17. |
| 4 | silencio | 4 | 9,375→11,250 | `clones` + `title` | una tienda gris: "¡Gracias por tu compra!" con un tilde gris | Y después de comprar, silencio. | Corte en 20. En 21 la pantalla se vacía (1 tiempo). 22→23,5 la cámara vuelve a 0,125: las 64 quedaron vacías. 23,5: se corta todo el sonido. |
| 5 | primer-toque | 4 | 11,250→13,125 | `rayo-entrada` (nueva: tarjeta CSS 3D) | pared gris + `Logo` real (placa + rayo + "TU TIENDA") sobre `#060707` | La tuya, no. | Firma 1. |
| 6 | **b1-persiana** (carga temática) | 4 | 13,125→15,000 | `splash-beat` (nueva: las 4 capas SVG reales de `public/splash/black-friday/`, re-armadas en GSAP sobre la grilla) | pantalla de carga Black Friday; el marcador gira al 30 % (cupón BLACK30) | — | DROP en 28, corte en acción. El rayo toca el candado de la persiana (Mi5); destraba (Mi5, 29), tirón (Sol5, 29,5), sube del todo (La5, 30); se prende la luz (Sol5, 31); el marcador gira al 30 (Mi5, 31,5). Empuje 1→1,04. |
| 7 | **b2-noche** (claro → oscuro) | 4 | 15,000→16,875 | `themeflip` (existente, con las dos capturas) | `ficha-completa-1440-light` → `ficha-completa-1440-dark` (con cabecera; `home-carrusel` no sirve: su banda es oscura también en claro) | — | Corte en 32 sobre la ficha en claro: el rayo cae sobre el interruptor del tema de la cabecera (Do6 + golpe); el oscuro se abre en círculo desde ahí y cubre en 33 (La5). Empujes de cámara 1→1,06→1,12 en 34 (Sol5) y 35 (Mi5) sobre el pote de Ionic Whey iluminado. |
| 8 | **b3-ruleta** | 4 | 16,875→18,750 | `uiflow` (a portar) + `WheelDial` y barra de carga en vivo (rotación y carga del reloj) | modal "Cargá la barra" (`ruleta-1440-dark`), premio fijado 5 % OFF | — | Corte en 36: el rayo aprieta y mantiene "Cargá la barra y girá" (Mi5); se encienden los discos de la barra a pares (Mi5, 37; Sol5, 37,5); suelta en 38 (La5): el disco gira con tick por gajo; frena en "5 %" (Do6, 39); brilla el gajo (Re6, 39,5). |
| 9 | **b4-shaker** | 4 | 18,750→20,625 | `arcade` (nueva: Shaker Rush en vivo, el único canvas) | partida con piloto automático y semilla elegida; `GameResult` | — | Corte en 40: el rayo baja en picada y toca el shaker justo cuando atrapa un "Rayo ×2" (Re6): el shaker se enciende (estado boost del juego) y aparece el chip "×2" del HUD; atrapadas en 41 (Si5) y 42 (Sol5); "¡Tiempo!" y gira el puntaje LED (La5, 43). |
| 10 | **b5-regalo** | 4 | 20,625→22,500 | `gift-hit` (nueva: `OpeningStage` en vivo con `reduce`, golpes y fase del reloj; cámara y sacudón en GSAP) | bolsa de boxeo "Juli, te llegó un regalo de Caro" (`regalo-bolsa`) | — | Firma 2. |
| 11 | **b6-mostrador** (cuotas) | 4 | 22,500→24,375 | `uiflow` sobre el diálogo "Cobrar" de `CounterSell` (respaldo `mostrador-cuotas`) | "Cobrar $ 109.530" | — | Corte en 48: el rayo toca "3 cuotas" (Do6); entra "3 cuotas de $ 40.892" (La5, 49); toca "Registrar venta (simulada) · $ 122.676" (Sol5, 50); "Venta registrada (simulada)" (Mi5, 51). Encuadre del diálogo a todo el alto. |
| 12 | **b7-proveedor** (48 suben) | 4 | 24,375→26,250 | `uiflow` + `SupplierListPage` en vivo (respaldo `proveedor-diferencias`) | lista de muestra → "2. Qué cambió" | — | Corte en 52: el rayo toca "Cargar la lista de muestra" (Mi5); la cámara baja y entran tres filas (Mi5 53, Sol5 53,5, La5 54); golpea "48 suben, 3 bajan, 2 sin coincidencia" (Do6, 55); empuje sobre "48 suben" (Re6, 55,5). |
| 13 | tesis-software | 4 | 26,250→28,125 | `devices` (nueva, CSS 3D) | notebook (proveedor → `campanas-calendario-1440-dark`) + celular (`club-inicio-390-dark`) | No es solo software. | Firma 3. |
| 14 | tesis-asesoria | 4 | 28,125→30,000 | `devices` + `title` | los mismos equipos, atrás y al 50 % | También asesoría de growth y fidelización. | Firma 3. |
| 15 | tesis-ventas | 4 | 30,000→31,875 | `rayo-entrada` (cierre) + `title` | `Logo` real "TU TIENDA" | Para que vendas más. | Firma 3; silencio en 67,5. |
| 16 | en-vivo | 12 | 31,875→37,500 | `eclipse-cta` (existente) | firma Eclipse | Probalo *en vivo.* (+ link de la demo, "Contactanos", 223-446 7881) | Corte seco al negro `#05050a` en 68 tras el medio tiempo de silencio; amanecer de la firma. |
| 17 | guino | 6 | 37,500→40,313 | `eclipse-guino` (nueva, estética Eclipse: Instrument + Geist Mono) | tipografía | 3 meses del plan Esencial *bonificados.* | Entra por máscara en 80; el subrayado corona se dibuja en 1 tiempo con una campana. Nota mono en dos renglones: "Con la campaña de lanzamiento · adaptación $ 750.000" / "USD 500 · sujeto a disponibilidad". |
| 18 | cierre | 10 | 40,313→45,000 | `eclipse-outro` (existente) | firma Eclipse | — | El eclipse se cierra y queda la noche. |

**Suma:** 12 + 14 × 4 + 12 + 6 + 10 = **96 tiempos**. La ráfaga "wow" son las filas 6–12: un compás (1,875 s) cada una, siempre
sobre el tiempo 1. Entre apertura y cierre: 56 tiempos. Cierre: 28 (cta 12 + guiño 6 + outro 10).
- **Dispositivos: CSS 3D** (`preserve-3d`) con la interfaz real adentro, no Three.js: el único canvas permitido es el de Shaker
  Rush, el texto queda nítido a cualquier escala y el rayo toca botones reales (sus coordenadas salen del DOM, no de una
  textura). Van en dos momentos clave: la tarjeta del quiebre y el par celular + notebook de la tesis. La ráfaga va plana y a
  pantalla llena, para leerse en 1,9 s.
- **Supers:** en el acto gris, sans neutra gris (`#9aa0a6`) en minúscula de oración: la tipografía también es de template. Desde
  "La tuya, no." pasan a la display condensada de la tienda en tinta `#f2f0ea`, con el remate en volt. Sin supers en la ráfaga.
- **Capa `rayo` (nueva):** el personaje por encima de las escenas 6–15: una lista de toques {t, x, y, tipo: golpe | salto |
  encastre} que declara cada escena. En el último cuarto de tiempo de cada plano el rayo sale hacia donde estará el próximo
  blanco, y el corte cae justo en el contacto (llega con su estela).

## 4. Los 3 momentos firma
**Firma 1 · El primer toque (23,5→28 · 11,02→13,13 s)**
- 23,5: se corta todo el sonido. La pared de 64 tiendas vacías y "Y después de comprar, silencio." quedan quietos.
- 23,75→24: el rayo cae recto desde arriba del cuadro a la tienda central (translateY −700→0 px, ¼ de tiempo, expo.in, con
  estela) sin sonido: el destello llega antes que el trueno.
- 24: contacto. Mi5 solo (pluck + campana, cola de reverb larga) + anillo. El super se corta.
- 24→24,5: esa tienda gira 180° en Y (tarjeta CSS 3D, perspectiva 1400 px, expo.inOut); al dorso, el `Logo` real. El rayo gira
  con la tarjeta y encastra en la placa (escala uniforme hasta su tamaño); desde ahí viaja con la cámara.
- 24,5→25,5: la cámara se acerca 0,125→0,5 sobre la marca (expo.out) y entra "La tuya, no." (máscara, ¼ de tiempo).
  25,5→26: las otras 63 tiendas bajan al 15 %. Riser 24,5→27,5 que corta seco.
- 27,5→28: silencio real; el rayo sube 16 px fuera de su placa (½ tiempo, power2.out): anticipación por quietud.
- 28: impacto del drop y corte en acción: el rayo ya está sobre el candado de la persiana, con su estela.

**Firma 2 · Cinco golpes (44→48 · 20,63→22,50 s)**
- 44: corte a la bolsa en vivo ("Juli, te llegó un regalo de Caro" · "¡Pegale a la bolsa!"), medidor de 5 celdas vacío.
- Golpes en 44 · 44,5 · 45 · 45,5 · 46 (corcheas), alternando izquierda y derecha: el rayo entra 60 px contra la bolsa en ⅛ de
  tiempo, sale en ⅛ y cruza al otro lado en ¼ con estela. La bolsa responde con su sacudón y su anillo de impacto; el medidor
  se llena 1→5. El rótulo queda en "¡Pegale a la bolsa!" (los intermedios no llegan a leerse).
- Sonido: break (mismo tramo del drop: se apagan pluck, hats y el bombo del groove; queda el pad); cada golpe = bombo + bajo
  corto que sube el acorde: La–Do–Mi–Sol–La. El rayo es la batería.
- 46→46,5: la cámara lenta de la app (encuadre 1→1,36 sobre el último golpe).
- 46,5: se abre (fase `open`): el rótulo pasa a "¡La rompiste!"; impacto + brillo en Mi5; el rayo retrocede 80 px (expo.out)
  para dejar ver lo de adentro. 47,75: sale hacia la derecha; en 48 vuelve el estribillo con Do6, ya en el Mostrador.

**Firma 3 · Vuelta a la placa (56→68 · 26,25→31,88 s)**
- 56 (Re6): el rayo toca "48 suben" y esa pantalla se aleja 1→0,42 (1 tiempo, expo.inOut) hasta quedar dentro de una notebook
  CSS 3D (rotateY −14°, rotateX 6°); a la vez entra desde la izquierda un celular CSS 3D (x −600→0) con el Club ("Sumá carga.
  Subí de nivel.").
- 57 (Si5) salto al celular · 58 (Sol5) salto a la notebook, que pasa a "Campañas · Calendario del año" · 59 (La5) salto al
  centro: el estribillo resuelve. Cada salto es un zigzag de ¼ de tiempo; la pantalla tocada se enciende (velo negro 30 %→0).
  Super "No es solo software." (57→60).
- 60: los equipos se abren y retroceden (x ∓120 px, escala 1→0,8, opacidad →50 %, 1 tiempo) y entra "También asesoría de growth
  y fidelización." (60→64): calendario de campañas (growth) a un lado, Club (fidelización) al otro. El rayo queda quieto en el
  centro, con el halo respirando (40↔70 % cada 2 tiempos): no toca nada y no suena nada. La pausa del personaje marca el cambio
  de registro, de juego a consejo.
- 63→64: los equipos se apagan (→10 %).
- 64: aparece el `Logo` (placa + "TU TIENDA") y el rayo encastra: traslación + escala uniforme hasta su placa en ½ tiempo (expo.out,
  8 px de pasada solo en la posición). La5 en campana + brillo; el bisel de la placa destella volt (0→80→0 %).
- 64,5→67,5: "Para que vendas más." 67,5: silencio. 68: corte al negro de Eclipse y "Probalo en vivo."

## 5. Plan musical
- **0–12 `tension` (firma):** dron, latido y riser que corta seco. **Silencio 11,5–12.**
- **12–23,5 `clon` (nuevo, el anti-drop):** en 12, en vez del impacto, un click seco. Debajo, el dron de la intro cerrado; en cada
  copia y en cada titileo el mismo click + un bip cuadrado en La4 (voz nueva). Sin acordes ni melodía: todas suenan igual. En el
  acto del silencio el click va en 20, 21 y 22 y falta en 23. **Silencio real 23,5–24.**
- **24–27,5 (solo cues):** Mi5 solo en el contacto de 24; riser 24,5→27,5 que corta seco. **Silencio 27,5–28.**
- **28–60 `drop` (existente), el único drop:** impacto en 28, Am–F–C–G. El pluck del estribillo se apaga y cada nota la dispara
  un evento en su corchea: toque del rayo = campana + click; reacción de la pieza = pluck (la persiana, los discos de la barra,
  las filas del proveedor). Donde una pieza no da evento, esa nota no suena. **44–48 break** dentro del mismo tramo (sin pluck ni
  hats): los cinco golpes son la batería. 56–60: el compás 4 (Re·Si·Sol·La) lo tocan los saltos y resuelve en La.
- **60–67,5 `half` (nuevo):** medio tiempo (bombo en 1 y 3), pad La menor → Fa, sin estribillo: aire para leer. En 64 el
  encastre (La5 + brillo). **Silencio 67,5–68.**
- **68–86 `calm` (existente):** Do mayor, estribillo lento en campanas; los cues de la cta; en el guiño, una campana con el
  subrayado corona.
- **86–96 `final` (existente):** boom + Am(add9) en 86 (tiempo 3 del compás 22: lo fija el outro de 10) y el brillo del anillo.

## 6. 9:16 y movimiento reducido
**9:16:** se re-encuadra con la versión real de 390 px de cada pieza (tienda y panel existen en celular): pared 4×8, cada plano de la ráfaga llena el alto con su componente de celular, la tesis apila celular arriba y notebook abajo y los supers van al tercio superior.
El rayo cae siempre en vertical (en 9:16 recorre más: más rayo) y los toques caen en los mismos tiempos: la partitura no cambia.
**Movimiento reducido:** el rayo no viaja: aparece por fundido de ¼ de tiempo en cada contacto y su nota suena igual; tarjeta, círculo y empujes pasan a fundidos de ½ tiempo; la bolsa llena el medidor y se abre sin sacudón, como la app.

## 7. Riesgos
- **Deformar la marca** → reglas del personaje (§1): traslación y escala uniforme, 0°, sin disfraz ("la fecha no toca el logo",
  regla de `Logo.tsx`). La placa vacía nunca se ve sola (el `Logo` aparece con el rayo llegando). La bolsa lleva el rayo
  impreso: en el trailer se sacude solo con traslación y una rotación leve, sin la escala no uniforme del sacudón de la app.
- **Humor fuera de tono** → el chiste es el template (anti-drop, "silencio"), nunca el dueño ni su cliente. Nada de caras,
  onomatopeyas ni efectos de dibujito. El rayo juega como un profesional, rápido y exacto, y cada toque termina en negocio:
  abre el local, da un cupón, cobra en cuotas, abre un regalo (un cliente nuevo), actualiza 48 precios.
- **GPU** → un solo canvas (Shaker Rush, montado un tiempo antes de B4 y desmontado en el corte); componentes vivos solo en su
  plano, con su captura a 2× de respaldo; CSS 3D en dos momentos; `clip-path` solo en B2 (la técnica ya aprobada de
  `themeflip`); `GameResult` sin su `backdrop-blur`; la pared es un `<symbol>` con 64 `<use>`; el rayo = 1 SVG + 3 copias + 1
  halo, solo transform y opacity. Seekable: bolsa con `reduce` y sacudón en GSAP, ruleta y barra con el reloj, persiana
  re-armada en GSAP, Shaker Rush con semilla.
- **Honestidad** → todo sale de la app con datos de muestra: 30 % (BLACK30), 5 % OFF (sorteo fijado), puntaje = el que dé la
  semilla, $ 109.530 / $ 40.892 / $ 122.676 y "(simulada)" a la vista, "48 suben, 3 bajan, 2 sin coincidencia". "Rayo ×2" es
  un ítem real del juego (si ninguna semilla da las atrapadas en 41 y 42, esas notas no suenan). Juli y Caro son de fixtures.
  "Para que vendas más" es promesa, sin cifras ni testimonios; los clones son dibujados, grises y genéricos; el guiño muestra
  el precio de la adaptación y "sujeto a disponibilidad".
- **Legibilidad** → en la ráfaga la letra de cada plano es la frase de la app, encuadrada a ≥ 60 px de alto ("30 %", "IONIC
  WHEY 100%", "5 %", "¡Tiempo!", "¡La rompiste!", "3 cuotas de $ 40.892", "48 suben"). Máximo tres en foco: rayo + pieza + su
  frase (en la tesis, celular + notebook se arman como un solo par). Supers de a uno, ≥ 1,41 s, entrando en el medio tiempo
  libre entre movimientos. Mudo: todo lo que suena se ve (anillo + reacción) y "silencio" también se lee. Fotosensibilidad: la
  luz de la persiana y el claro→oscuro son un cambio cada uno (menos de 3 destellos por segundo).
