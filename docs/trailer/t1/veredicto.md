# T1 · Veredicto del juez (T1.1)

Panel de tres direcciones independientes, mismo brief, mismo material:
- [`direcciones/cinematografica.md`](direcciones/cinematografica.md): "Una sola luz".
- [`direcciones/ludica.md`](direcciones/ludica.md): "El toque del rayo".
- [`direcciones/precision.md`](direcciones/precision.md): "Calcado vs. trazado".

El juez verificó contra el código cada texto y dato que proponen (ver §4). El resultado es [`storyboard.md`](storyboard.md).

## 1. Puntajes (rúbrica de `creative-direction`, 1 a 10)
| Criterio | Cinematográfica | Lúdica | Precisión |
|---|---|---|---|
| Impacto premium | 9 | 7 | 9 |
| Claridad del producto | 8 | 6 | 9 |
| Fidelidad a la UI real | 8 | 9 | 9 |
| Construible a 60 fps | 6 | 6 | 8 |
| Coherencia con las dos marcas (Tu tienda y Eclipse) | 9 | 7 | 8 |
| Audiencia A: dueño de una tienda de suplementos | 7 | 8 | 9 |
| Audiencia B: Eclipse vendiendo por email y redes (se ve **mudo**) | 8 | 5 | 9 |
| **Total** | **55** | **48** | **61** |

**Justificación por criterio:**
- **Impacto premium.**
  - Cinematográfica: la luz del eclipse como hilo es lo más elegante del panel.
  - Lúdica: el rayo personaje es simpático, pero tiende a juguete.
  - Precisión: el "línea plana → latido → 3, 2, 1 → drop" es el mejor momento de los tres.
- **Claridad del producto.**
  - Cinematográfica: rótulos claros, pero la ráfaga son paneles flotando todos iguales.
  - Lúdica: la ráfaga no tiene rótulos y depende del texto de cada pantalla.
  - Precisión: cada plano va numerado y con su nombre, y las cifras se leen enormes.
- **Fidelidad a la UI real.**
  - Cinematográfica: real, salvo el cartel de neón inventado.
  - Lúdica: cada toque cae sobre un botón real.
  - Precisión: las cifras salen de la interfaz y el despegue arranca desde su caja exacta.
- **Construible a 60 fps.**
  - Cinematográfica: linterna sobre 7 planos en Z, velos de luz, desenfoque horneado y la lámpara del hero: mucho.
  - Lúdica: un personaje que persigue coordenadas del DOM sobre componentes vivos, más la música disparada por eventos: lo más caro.
  - Precisión: líneas SVG y placas, lo más barato.
- **Coherencia de marca.**
  - Cinematográfica: une volt y corona en una gramática de luz.
  - Lúdica: buena para la tienda, débil para Eclipse.
  - Precisión: la grilla y la mono ya son el lenguaje "lab" de la tienda (reglas de 19 cm, "TU TIENDA LAB"); la corona entra con el "+".
- **Audiencia A (el dueño de una tienda).**
  - Cinematográfica: pocas cifras.
  - Lúdica: cada toque termina en negocio.
  - Precisión: le habla al bolsillo con "3 cuotas de $ 40.892" y "48 suben".
- **Audiencia B (Eclipse, visto sin sonido).**
  - Cinematográfica: se entiende con los supers.
  - Lúdica: el concepto (la tienda toca el estribillo) se pierde sin sonido y la ráfaga va sin rótulos.
  - Precisión: se entiende entera sin sonido.

## 2. Ganadora y síntesis
**Columna vertebral: Precisión.** Es la estructura, la ráfaga numerada 01–07, el latido con la cuenta regresiva real, las cifras y la tesis con el "+".

**Injertos:**
| De | Qué | Por qué |
|---|---|---|
| Lúdica | **Anti-drop** en 12: tras la subida de la apertura, en lugar del golpe suena un click seco y aparece una tienda gris | Lo cósmico de Eclipse contra lo genérico del template; es el primer síntoma del problema y tiene humor sin burlarse de nadie |
| Lúdica | La pared se arma **copiando y pegando** (1 → 4 → 16 → 64) con la cámara que retrocede a saltos | Dice "todas iguales" en 4 golpes y sin texto |
| Lúdica | Supers del problema en **tipografía de plantilla** (sans gris, en minúscula de oración); desde "La tuya, no." pasan a la display de la tienda | La letra también es de template; el cambio de letra es el quiebre |
| Lúdica | **Los cinco golpes de la bolsa son la batería** (se cae el bombo del groove) y, en la ráfaga, **cada evento de la interfaz cae en una nota del estribillo** | Sonido atado a la imagen; la tienda "toca" su música |
| Lúdica | Prueba de **fotosensibilidad** (menos de 3 destellos por segundo) | Evita un riesgo real del claro → oscuro y de la persiana |
| Cinematográfica | **Gramática de color**: volt = Tu tienda · corona = Eclipse y su asesoría · gris = las copias · amanecer = la decisión | Une las dos marcas sin explicarlas |
| Cinematográfica | En la asesoría, **la corona sube detrás de los equipos** y sus filos se vuelven ámbar (contraluz) | La asesoría es "la luz que está atrás": la pone Eclipse |
| Cinematográfica | **Foco con luz, no con blur** (velo con agujero radial, solo transform) y primeros planos re-renderizados (`zoom`), no escalados | Nitidez y GPU |
| Juez | **Ráfaga de fechas** dentro del 01 (33 y 33,5): Black Friday y Navidad tras el "ya" de CrossFit | "Una por fecha" se ve, no se dice: es lo contrario de "mismo template" |
| Juez | El cierre de la tesis firma con la **marca de Tu tienda** (65–67,5) | El que mira se lleva el nombre del producto antes de la firma de Eclipse |

**Descartes:**
| De | Qué | Por qué |
|---|---|---|
| Cinematográfica | Linterna sobre 7 tiendas en Z con desenfoque horneado | Costo de GPU y de armado. La línea de Precisión cuenta lo mismo (todas iguales, apagadas) más barato |
| Cinematográfica | Cartel de neón y lámpara del hero dentro de la notebook | No entra en 45 s. El primer contacto con la marca es su pantalla de carga real |
| Cinematográfica | Paneles flotando a ±5° en cada plano de la ráfaga | Monótono: siete veces el mismo encuadre |
| Lúdica | El rayo-personaje que viaja por toda la pieza | Caro, tiende a infantil y suma un cuarto elemento en foco. Su espíritu queda en la música |
| Lúdica | Ráfaga sin rótulos | No pasa la prueba muda (redes y email arrancan sin sonido) |
| Lúdica | Pantalla de carga re-armada en GSAP | Innecesario: la animación CSS real se maneja con el reloj del trailer (ver §4) |
| Precisión | Destello de la grilla en 64,5 | Flash gratuito; fotosensibilidad |
| Precisión | Guiño que abre con el precio ("Tu tienda, adaptada: $ 750.000") | En un teaser el gancho es la promo. Se abre con "3 meses bonificados" y el precio va como dato |
| Precisión | "Cero relación después de comprar." | Se cambia por "Y después de comprar, nada.": misma idea, dicha como se habla, y cierra la regla de tres de los "mismo" |

## 3. Decisión técnica del juez: qué va en vivo y qué en placa
Las pantallas completas de la app (ficha, Mostrador, lista del proveedor, Hoy, inicio, Club) van como **placa**: la captura 2× real, con arriba en vivo solo lo que se mueve (trazos, el número que se despega, el círculo del tema).

**Motivos:**
1. Sus clases responsivas responden a la **ventana**, no al escenario: en un celular mirando el 16:9 se re-maquetarían dentro del cuadro.
2. Su estado y su azar no se pueden saltar a un segundo.

**Va en vivo el arte que se mueve:** la pantalla de carga (unidades `cqw`, ya escala con su caja), el disco de la ruleta, la bolsa y Shaker Rush (canvas).

## 4. Errores de contenido y verificación contra el código
**Verificado** (lo usa el storyboard):
- **CrossFit Open** (`app/splash-scenes/crossfit-open.css`):
  - los números 3, 2 y 1 salen a los 260, 480 y 700 ms (cada 220 ms), con pitidos;
  - el "ya" sale a los 920 ms: el reloj arranca de cero en volt.
- **Mostrador** (`ChargeSheet.tsx:52,53,59,66`): "Cobrar $ 109.530", "Con el descuento stack de $ 12.170.", "3 cuotas de $ 40.892", "Registrar venta (simulada)".
- **Lista del proveedor:**
  - "MAYORISTA DEL PUERTO · Lista de costos octubre 2026" (`supplier-paste.ts:69`);
  - "48 suben, 3 bajan, 2 sin coincidencia" (`diff.ts:56`).
- **Bolsa** (`gift-openings.ts:39-40`): "¡Pegale a la bolsa!", "¡Otra vez!", "¡Más fuerte!", "¡Ya casi!", "¡El último, con todo!", y al terminar "¡La rompiste!", en 5 golpes.
  - La cámara lenta con bandas de cine es de la app (`stage-css.ts:3,8,12`).
  - El regalo es de Caro para Juli: Ionic Whey 100 % Chocolate (`fixtures/gifts.ts:29-31`).
- **Ruleta:** el collar cabecea en cada gajo con su `kick` (`WheelCollar.tsx:8`). Con `Math.random = () => 0.1` el premio es 5 % OFF (`ui.md`).
- **Shaker Rush:** `stepGame` es puro (`game.ts:88`) y hay piloto automático (`game-autopilot.ts:9`). Termina en "¡Tiempo!" (`GameResult.tsx:29`).
- **Marca:** el rayo es `M33 4h19L39 28h9L17 61l9-26h-8z` en 64×64 (`config/logo.ts:15`). La pantalla de carga real lo lleva arriba (`Splash.tsx:25`).

**Errores o dudas de las direcciones:**
- **Cinematográfica:**
  - Supers en Geist, que es la voz de Eclipse, para el mensaje de la tienda: confunde las marcas.
  - Esconder "(simulada)" no hace falta: el encuadre del cobro no llega al botón.
- **Lúdica:**
  - "Registrar venta (simulada) · $ 122.676": el botón dice solo "Registrar venta (simulada)".
  - El ítem "Rayo ×2" y sus tiempos no están verificados.
  - "La bolsa se queda en '¡Pegale a la bolsa!'" contradice a la app: los textos cambian con cada golpe, y en el trailer se dejan cambiar.
- **Precisión:**
  - "YA" no es un texto de la app: es el momento en que arranca el reloj.
  - "×1,065" es estirar el tiempo: velocidad 0,9387.
  - La captura `proveedor-diferencias` no llega al resumen; hace falta una nueva.

## 5. Prerrequisitos en el código (para T1.2 y T1.3)
1. **Motor:**
   - curva `trl.rampa` (`M0,0 C0.7,0 0.12,1 1,1`) para la cámara;
   - `reduced` en `SceneCtx`, para que cada receta arme su versión con fundidos;
   - un componente `Grid` compartido. Cada escena lo dibuja en el mismo lugar, así la grilla y el eje cruzan los cortes sin capa nueva en el motor.
2. **Recetas nuevas:**
   - `clones`, `ticker` (port de KS) y `trace` (línea plana, latido, marco y eje);
   - `splash-live`: `SplashStage` con `el.getAnimations({ subtree: true })` y `currentTime` atado al timeline;
   - `plate`: placa 2× con trazo, círculo del tema y número que se despega desde una caja medida;
   - `gift-live` (bolsa con golpes del timeline, péndulo sin escala no uniforme);
   - `wheel-live` (rotación y `kick` del timeline);
   - `shaker-replay` (canvas con `stepGame` + piloto automático a paso fijo desde la semilla);
   - `device` (celular y notebook en CSS 3D, con filo de 1 px);
   - `rules` y `stack` (ports, para la tesis);
   - `eclipse-guino` (una fila del libro de precios, genérica).
3. **Capturas nuevas** (en `trailer-shots-admin.mjs`):
   - `mostrador-cobrar`: el diálogo antes de elegir;
   - `proveedor-pegar`: el cuadro vacío con "Cargar la lista de muestra";
   - `proveedor-resumen`: encuadre de `[data-diff-summary]` con las primeras filas.
4. **Revisar:**
   - Que la revelación de la bolsa saque el pote "TU TIENDA LAB" con la ficha `tutienda`. El comentario de `bag-reveal.tsx` dice "VOLTA Lab".
   - Que en `hoy` el riel no muestre el logo como cuadrado liso (`ui.md` §0.4).
   - Que la banda "Panel de demostración · datos ficticios" se vea en la notebook. Es honesto.
5. **Música (T1.2):**
   - estilos nuevos `clon` (dron cerrado, sin pulso), `stutter` (compuerta en semicorcheas) y `half` (bombo a medio tiempo, estribillo en campana);
   - el corte del groove en 37–39;
   - el tono plano de 25,5–27,5;
   - las notas del estribillo atadas a eventos (ver `sonido.md`).
