# T1 · "El problema y la diferencia": storyboard definitivo

> **Estado: para aprobar (Ignacio).** Con esto, T1.2 hace la música y T1.3 construye sin decidir nada.

| Documento | Qué tiene |
|---|---|
| [`escenas.md`](escenas.md) y [`escenas-2.md`](escenas-2.md) | Cada escena: coordenadas, coreografía y efectos |
| [`sonido.md`](sonido.md) | Partitura por compás y lista completa de efectos |
| [`veredicto.md`](veredicto.md) | Puntajes del panel, injertos, descartes y prerrequisitos |
| [`storyboard.jpg`](storyboard.jpg) | Lámina con un cuadro de referencia por escena |

## 1. Ficha
| Campo | Valor |
|---|---|
| Pieza | `t1`, en `/trailer/t1/` |
| Duración | **45,0 s = 96 tiempos = 24 compases a 128 BPM** (1 tiempo dura 0,46875 s y 1 compás, 1,875 s) |
| Para quién | Dueño de una tienda de suplementos. Lo ve en redes y email (arranca **sin sonido**) y en la demo |
| Una frase | "Todas las tiendas son iguales. La tuya, no: Eclipse la hace distinta y la hace vender más." |
| Formatos | 16:9 ahora; 9:16 en T1.5, sobre la misma línea de tiempo |
| Cierre | `eclipse-cta`, después un guiño de precio y al final `eclipse-outro` |

## 2. Dirección: "Calcado vs. trazado" (Precisión, con injertos de las otras dos)
**El concepto:**
- La pieza la cuenta una línea de 1 px.
- Las tiendas de suplementos están **calcadas**: fotocopias grises de un mismo template, que encima no respetan la grilla.
- Después de comprar, la relación con el cliente es una **línea plana**.
- Esa línea **late** y se vuelve volt. Desde ahí **traza** cada pieza de Tu tienda medio tiempo antes de que aparezca, con cada corte clavado en el tiempo.
- Al final la línea se vuelve corona, el color de Eclipse, y se apaga mientras amanece "Probalo en vivo".

**Gramática de color:**
| Color | Significa |
|---|---|
| Gris | Las copias |
| Volt `#c8ff2e` | Tu tienda |
| Corona `#f5b942` | Eclipse y su asesoría |
| Amanecer `#f4efe6` | La decisión |

**Sin sonido** se entiende igual: un super por vez, rótulos numerados del 01 al 07 y cifras reales enormes.

**Con sonido** suman:
- el "anti-drop": un click seco donde se esperaba el golpe;
- el tono plano;
- el latido;
- el 3, 2, 1 real de la pantalla de carga;
- dos drops;
- la tienda que "toca" su propio estribillo.

## 3. Escenas
| # | id | Tiempos | Segundos | Receta | Imagen | Super o rótulo | Entrada y cámara |
|---|---|---|---|---|---|---|---|
| 1 | `apertura` | 0–12 | 0,000–5,625 | `eclipse-intro` | Firma de Eclipse | (ECLIPSE · "Presenta…") | Tal cual. La subida corta seco en 11,5 |
| 2 | `calcadas` | 12–16 | 5,625–7,500 | `clones` (nueva) | Tienda genérica gris (SVG propio, sin marcas) | "Mismo template." | Corte seco con un click (anti-drop). 1 → 4 → 16 → 64 copias y la cámara retrocede a saltos |
| 3 | `veinte` | 16–20 | 7,500–9,375 | `ticker` (port) | "20 % OFF" gris en filas a −8° | "Mismo 20 % OFF." | Corte. Las filas aceleran y se congelan en 19,5 |
| 4 | `potes` | 20–24 | 9,375–11,250 | `clones` (catálogo) | Potes grises idénticos | "Misma grilla de potes." | Corte. El catálogo sube sin fin, frena en 23 y queda uno |
| 5 | `plano` | 24–28 | 11,250–13,125 | `trace` (nueva) | Pote → caja → línea | "Y después de comprar, nada." | Click en COMPRAR, la caja se va y queda la línea plana. Silencio en 27,5 |
| 6 | `latido` | 28–30 | 13,125–14,063 | `trace` | La línea | "La tuya, no." (28–31) | La línea late y se vuelve volt, y se abre en un marco 4:3 |
| 7 | `w1-carga` | 30–34 | 14,063–15,938 | `splash-live` (nueva) | Pantalla de carga real de CrossFit Open; después Black Friday y Navidad | 01 · Pantallas de carga por fecha (31–34) | 3 · 2 · 1 en corcheas; el "1" se congela en 31,5 y el "ya" de 32 es el **DROP 1** |
| 8 | `w2-tema` | 34–37 | 15,938–17,344 | `themeflip` con placas | Ficha de Ionic Whey, de claro a oscuro | 02 · Modo claro y oscuro | Corte a la ficha clara; click en 35; el oscuro cubre todo en 36 |
| 9 | `w3-regalo` | 37–41 | 17,344–19,219 | `gift-live` (nueva) | Bolsa: "Juli, te llegó un regalo de Caro" | 03 · Regalos que se abren a golpes | 5 golpes en corcheas (37–39), cámara lenta y en 40 "¡La rompiste!" |
| 10 | `w4-shaker` | 41–44 | 19,219–20,625 | `device` + `shaker-replay` | Celular CSS 3D con Shaker Rush jugándose | 04 · Un juego propio | Atrapadas en 41, 41,5 y 42 sobre el estribillo; en 43 "¡Tiempo!" |
| 11 | `w5-ruleta` | 44–48 | 20,625–22,500 | `wheel-live` (nueva) | Disco olímpico real | 05 · Ruleta de cupones | Anillo de 1 px, frenada escrita en 13 pasos; en 47 cae en 5 % |
| 12 | `w6-mostrador` | 48–52 | 22,500–24,375 | `plate` (nueva) | Diálogo "Cobrar $ 109.530" | 06 · Mostrador en cuotas | Trazo en "3 cuotas"; en 49 "3 cuotas de $ 40.892" se despega enorme |
| 13 | `w7-proveedor` | 52–56 | 24,375–26,250 | `plate` | Lista del proveedor | 07 · Lista del proveedor | Se pega la lista y "48 suben" cuenta con 48 rayas. Negro y silencio en 55,5 |
| 14 | `software` | 56–60 | 26,250–28,125 | `device` ×2 | Notebook con "Hoy en tu tienda" y celular con el inicio | "No es solo software." | **DROP 2**: se trazan los equipos y se prenden las pantallas; la cámara gira alrededor |
| 15 | `asesoria` | 60–64 | 28,125–30,000 | `rules` (port) + `device` | Los equipos a un costado y un "+" en corona | "+ Asesoría de growth marketing y fidelización." | El "+" se traza y engorda en corona; la corona sube detrás de los equipos |
| 16 | `promesa` | 64–68 | 30,000–31,875 | `stack` (port) | Tipografía y la marca de Tu tienda | "Para que la tuya venda más." | Tres renglones en semicorcheas; la marca en 65; en 67,5 queda solo el eje |
| 17 | `en-vivo` | 68–80 | 31,875–37,500 | `eclipse-cta` | Firma | "Probalo en vivo." · Contactanos · 223-446 7881 | El eje pasa a corona y se apaga mientras amanece |
| 18 | `guino` | 80–86 | 37,500–40,313 | `eclipse-guino` (nueva) | Libro `tu-tienda`, campaña base | "Arrancá con 3 meses bonificados." | Corte en el tiempo 1 a pleno amanecer; entre 85 y 86 cae la noche |
| 19 | `cierre` | 86–96 | 40,313–45,000 | `eclipse-outro` | Firma | (ECLIPSE y su frase) | El eclipse se cierra |

Las escenas suman exactamente 96 tiempos. Los cortes fuertes caen en el tiempo 1 de cada compás: 12, 16, 20, 24, 28, 32 (drop), 44, 48, 52, 56 (drop), 60, 64, 68 y 80.

**Los siete "wow" del brief** están en las escenas 7 a 13 y duran entre 1,4 y 1,9 s cada uno: pantalla de carga, claro y oscuro, regalo, Shaker Rush, ruleta, cuotas y "48 suben".

## 4. Música (resumen; el detalle está en `sonido.md`)
| Tiempos | Estilo | Qué pasa |
|---|---|---|
| 0–11,5 | `tension` (firma) | La apertura; la subida corta seco |
| 11,5–12 | silencio | — |
| 12–26 | `clon` (nuevo) | Dron cerrado, **sin pulso**: un click en cada copia y subidas cortas |
| 26–27,5 | tono plano | Un seno en La5, bajito |
| 27,5–28 | silencio | — |
| 28–31,5 | `tension` | Latido en 28, subida y pitidos en 30, 30,5 y 31 |
| 31,5–32 | silencio | El "1" congelado |
| 32–48 | `drop` (**DROP 1**) | Am–F–C–G con el estribillo entero; entre 37 y 39 los golpes de la bolsa son la batería |
| 48–55,5 | `drop` + `stutter` | Am–F con compuerta en semicorcheas |
| 55,5–56 | silencio | Negro |
| 56–67,5 | `half` (**DROP 2**) | Bombo a medio tiempo y estribillo en campana (Am–F–G) |
| 67,5–68 | silencio | Queda suspendido en Sol |
| 68–86 | `calm` | Do mayor: "Probalo en vivo" y el guiño |
| 86–96 | `final` | El eclipse se cierra |

## 5. Reglas visuales de la pieza
**Grilla** (escenas 2 a 16):
- 12 columnas de 122 px (calle de 24, márgenes de 96). La columna *k* empieza en x = 96 + (k − 1) · 146.
- 6 filas de 140 px (calle de 24, márgenes de 60). La fila *r* empieza en y = 60 + (r − 1) · 164.
- Color: gris `#1c1f22` hasta el tiempo 28; desde ahí, volt al 14 %.
- Trazos activos: volt al 100 %, de 1 px en el escenario (2 px en el MP4 1080p) y alineados al medio píxel.
- Cada escena dibuja la grilla en el mismo lugar, así cruza los cortes.

**Capas, de atrás hacia adelante:**
1. Fondo: `#0b0d0e` en el problema, `#060707` desde el tiempo 28.
2. Grilla.
3. Contenido: placas, arte vivo y equipos.
4. Trazos.
5. Rótulo o super.
6. `flash` y `grano` del motor.

**Tipografía:**
| Tramo | Letra y estilo |
|---|---|
| Problema | Sans de la tienda en gris `#9aa0a6`, 64 px, minúscula de oración. Columna 1, línea base en y = 1000, sobre un degradé fijo al pie. Es letra de plantilla |
| Desde "La tuya, no." | Display de la tienda (Big Shoulders) en mayúsculas, tinta `#f2f0ea` y la palabra clave en volt |
| Rótulos 01 a 07 | Mono de la tienda: 34 px, mayúsculas, tracking 0,12 em y el número en volt. Van en un chip `#060707` al 92 % en (96, 60), con una raya de 1 px que se traza debajo en ¼ de tiempo. Si la pantalla tiene un título arriba (el regalo), el chip baja a (96, 960) |

**Curvas:**
- `trl.expo` para interfaz, tipografía y trazos.
- `trl.rampa` para la cámara: es nueva, `M0,0 C0.7,0 0.12,1 1,1`, y llega al 94 % justo en el golpe.
- `trl.whip` solo en el latido.

**Movimiento:**
- Como mucho se mueven a la vez la cámara y un grupo, con tres elementos en foco.
- Solo `transform` y `opacity`, con tres excepciones:
  - el `clip-path` del círculo del tema (escena 8);
  - el `stroke-dashoffset` de los trazos, con dos a la vez como máximo;
  - los `points` del latido (un SVG chico).

**Marca:**
- El rayo y "TU TIENDA" nunca se trazan, deforman ni recolorean.
- Aparecen enteros: en la pantalla de carga real, en las placas y en la firma del tiempo 65.
- El eclipse solo está en las firmas. Antes, la corona aparece solo como color: el "+" y el contraluz.

**Tema:** la pieza es oscura. El único cuadro claro es la ficha antes del golpe a oscuro (escena 8). Desde el tiempo 68, la estética es la de Eclipse.

**Fotosensibilidad:** menos de 3 destellos por segundo en cualquier tramo.

## 6. Interfaz: qué va en placa y qué en vivo
**Placas:** son capturas 2× de la app real con la ficha `tutienda`. T1.3 las lista en `docs/trailer/t1/capturas.json` y las publica con `trailer-shots-publish`.
- Tienda: `ficha-completa-1440-light`, `ficha-completa-1440-dark` y `home-carrusel-390-dark`.
- Panel: `mostrador-cuotas-1440-dark` y `hoy-1440-dark`.
- **Faltan sacar:** `mostrador-cobrar`, `proveedor-pegar` y `proveedor-resumen` (ver `veredicto.md` §5).

**En vivo**, con el reloj del trailer:
- `SplashStage`: CrossFit Open, Black Friday y Navidad.
- El disco de la ruleta con su collar.
- La bolsa del regalo `REGALO-VE1M-AR7X`.
- Shaker Rush: canvas, semilla 11 y piloto automático.

Por qué esta división: `veredicto.md` §3.

## 7. Datos reales que se muestran
| Dato | De dónde sale |
|---|---|
| "Juli, te llegó un regalo de Caro", 5 golpes, "¡La rompiste!", Ionic Whey 100 % Chocolate | `fixtures/gifts.ts:29-31`, `gift-openings.ts:39-40` |
| 5 % OFF en la ruleta | Premio con `Math.random = () => 0.1` (`ui.md`) |
| "Cobrar $ 109.530", "Con el descuento stack de $ 12.170.", "3 cuotas de $ 40.892", "Total con recargo $ 122.676 · recargo 12 %" | `ChargeSheet.tsx` con el ticket de muestra. El recargo es de muestra y se edita en Ajustes |
| "48 suben, 3 bajan, 2 sin coincidencia" y "MAYORISTA DEL PUERTO" | `diff.ts:56`, `supplier-paste.ts:69` |
| "Hoy en tu tienda": por cobrar $ 171.150, para armar 08 | Captura `hoy` (`TodayHome`) |
| Campaña base: adaptación $ 750.000 (USD 500), asesoría inicial de growth, 3 meses del plan Esencial ($ 45.000 por mes) bonificados, sujeto a disponibilidad | `eclipse/book.ts`: tarifario `2026-10-16.aprobado` y `base-campaign.json`, con el dólar a $ 1.500 |
| 223-446 7881 | `eclipse/tokens.ts` (dato de Ignacio) |

"Para que la tuya venda más." es una promesa sin número. No hay cifras de ventas, testimonios ni marcas reales. Las tiendas del problema son dibujos genéricos.

## 8. 9:16 y movimiento reducido
**9:16** (T1.5): la misma partitura y los mismos cortes.
- Grilla de 6 columnas × 12 filas.
- Clones en columnas de a 2.
- El marco del latido va arriba (1080 × 810), con "La tuya, no." abajo.
- Placas de celular (390) a todo el ancho.
- Las cifras van en dos renglones.
- En la tesis, el celular va adelante y la notebook atrás, más alta.
- Los supers van en el tercio superior, de 96 a 140 px.

**Movimiento reducido** (`reduced`):
- Sin trazos, sin 3D y sin cámara.
- Cada escena es una lámina con su estado final que entra con un fundido de ¼ de tiempo, en el mismo tiempo.
- Las cuentas, los giros y los golpes saltan directo al resultado.
- Supers, cortes y sonido no cambian.

## 9. Presupuesto de rendimiento
- Como mucho 12 capas compuestas por escena.
- Un solo canvas: el de la escena 10, montado entre 40 y 44.
- CSS 3D solo en las escenas 10, 14 y 15.
- Sin `backdrop-filter`. El único desenfoque es el que ya trae la apertura.
- Placas en JPEG de 2880 px de ancho como máximo.
- Las 64 tiendas son un `<symbol>` con `<use>`.
- **Modo liviano:** 16 tiendas y sin derrames de luz.

## 10. Aprobación
- [x] Ignacio aprobó el storyboard el 18/10/2026, con los tres puntos de la consulta: los textos de pantalla tal cual, el guiño con el precio ($ 750.000 / USD 500) y "growth marketing" en inglés.
