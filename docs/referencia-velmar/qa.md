# QA de la demo y riesgos conocidos

## Checklist (automatizado en `tests/`)
| Verificación | Cómo | Estado |
|---|---|---|
| Build limpio (lint, tipos, unit, export) | `pages.yml` / `npm run check && npm run build` | ✅ |
| Rutas directas y refresh bajo subpath, 16 rutas | `tests/e2e/routes.spec.ts` con servidor que imita Pages | ✅ |
| Sin barra final → 301; ruta inexistente → 404 | idem | ✅ |
| Assets, sitemap y `og.png` (image/png) bajo basePath | idem | ✅ |
| Sin scroll horizontal a 375 px en todas las rutas | idem | ✅ |
| Viewports 375 / 768 / 1440 (capturas en `test-results/`) | `motion-viewports.spec.ts` | ✅ |
| Flujo móvil completo: búsqueda con error → ficha → texto (rechaza emoji) → aprobar → carrito → cupón vencido/válido → checkout invitado → cadete por CP → transferencia → términos obligatorios → confirmación demo → comprobante → seguimiento → reiniciar | `purchase-flow.spec.ts` | ✅ |
| Cuenta demo + retiro + Mercado Pago simulado + misión completada con celebración | idem | ✅ |
| Foto: PDF falso y 11 MB rechazados; encuadre/zoom; vista previa JPEG local; llega al carrito | `personalize-photo.spec.ts` | ✅ |
| **La foto no sale del navegador**: ningún request no-GET/HEAD ni a otro origen en todo el flujo | `guardNetwork()` en los e2e | ✅ |
| Ningún CTA aparenta cobrar: rótulos "demo/muestra", QR no escaneable, CBU ficticio, sin "acreditado" | asserts en e2e + revisión | ✅ |
| Movimiento reducido: sin splash, animaciones a 1 ms | `motion-viewports.spec.ts` | ✅ |
| Pantalla de carga en cada recarga, Escape la cierra y se va sola a los 5 s | idem | ✅ |
| Contraste AA de los tokens | cálculo WCAG (ver `tono-visual.md`) | ✅ |
| Reglas: precio, cupones, envío gratis, total ≥ 0, misiones, stock, validaciones, recomendaciones, ruleta | `tests/unit` (Vitest) | ✅ |
| Ruleta con movimiento reducido → cupón `RULETA…` → se aplica en el carrito → aparece en el panel | `gamification.spec.ts` | ✅ |
| Ficha todo en uno: "Comprar ahora" sin texto lleva el foco al campo; con aprobación va al checkout con la cantidad elegida | idem | ✅ |
| Carrito: elegir cupón de "Mis cupones" sin escribir el código; ruleta al ir a pagar con "Guardar para más tarde"; ya girada va directo | idem | ✅ |
| Buscador superpuesto: foco en el campo, resultados en vivo con error de tipeo, búsqueda reciente, Escape cierra | idem | ✅ |
| Seguimiento: pedido arriba, "Ver 1 producto más" abre el modal, comprobante al elegir el estado pendiente | idem | ✅ |
| Panel en el celular: menú hamburguesa y paginado de pedidos (se reinicia al filtrar) | `admin-flows.spec.ts` | ✅ |
| Guía del panel: aparece una vez, Siguiente / Anterior, no reaparece, se reabre con "?" | idem | ✅ |
| Ficha: cantidad desplegable, diseño requerido antes de agregar, favoritos en su pantalla `/favoritos/` | `gamification.spec.ts` | ✅ |
| Barra inferior de la tienda (Inicio, Categorías, Favoritos, Cupones, Mi cuenta) y botón de pausa del carrusel | idem | ✅ |
| Temáticas: "Probar temáticas" cambia cinta, sombrero del logo, primera diapositiva y ofertas; "Usar código" lo deja en el carrito; se recuerda al recargar y se sale desde la cinta | `themes.spec.ts`, `tests/unit/themes.test.ts` | ✅ |
| Temáticas premium: paleta de temporada en `data-season`, pausa de animaciones, opción "Original" | `themes.spec.ts`, `tests/unit/palettes.test.ts` (AA de las 13 paletas en claro y oscuro) | ✅ |
| Temáticas en el panel: editar titular, modo fija/ninguna y ocultar el botón se refleja en la tienda | idem | ✅ |
| Modo oscuro: se activa desde el menú, se recuerda al recargar y llega al panel | idem | ✅ |
| Menú móvil y drawer del carrito: abren, atrapan el foco y cierran con Escape | idem | ✅ |
| Sin desborde a 375 px con el carrito lleno (recomendaciones desplazables) | idem | ✅ |

## Tienda · Fase 4 (`tests/e2e/shop-fase4.spec.ts`, `tests/unit/collar.test.ts`)
| Verificación | Estado |
|---|---|
| Collar: letras sueltas una por pieza, de corrido en una, cordón, material y talle por cuello cambian vista previa y precio; fuera de talle avisa; la configuración llega al carrito | ✅ |
| Combinación lista carga nombre, cordón y vista previa | ✅ |
| Ruleta arrastrada con el mouse/dedo da premio con clic de gajos, giro y fanfarria; también con Enter | ✅ |
| Sonidos al agregar y en favoritos; silencio recordado al recargar | ✅ |
| Recargos del collar en pesos enteros, talle por cm, descripción, piezas y combinaciones válidas | ✅ unit |

## Temáticas y motion · Fase 5 (`tests/e2e/shop-fase5.spec.ts`, `tests/unit/themes.test.ts`, `tests/unit/palettes.test.ts`)
| Verificación | Estado |
|---|---|
| Orgullo, 25 de Mayo, Día de la Bandera y 9 de Julio: pantalla de carga con su escena, paleta, banner y cinta | ✅ |
| Día del Amigo y del Padre: los personajes aparecen en la escena y en el banner | ✅ |
| Con movimiento reducido no queda ninguna animación CSS corriendo (personajes, fondo, partículas) | ✅ |
| Navegar usa View Transitions y solo la tarjeta tocada lleva el nombre de la imagen que vuela a la ficha | ✅ |
| La cantidad rueda sin duplicar el número (lector de pantalla y tests leen un solo valor); favoritos destella | ✅ |
| Contraste AA de las paletas nuevas en claro y oscuro (texto, apagado, primario, dorado, acento) | ✅ unit |
| Fechas: Orgullo el 7/11, 25 de Mayo, Padre hasta el 17/6, Bandera el 20/6, 9 de Julio; ninguna superposición en el año | ✅ unit |

**Rendimiento medido** (Chromium sin GPU, Pixel 7 emulado a 390 px, después de las optimizaciones): sin frenar la CPU, la
tienda Original va a 52–53 cuadros por segundo y las temáticas nuevas a 39–50 (la del 9 de Julio pasó de 28 a 45 al sacar
los fuegos del fondo). Con la CPU frenada 4× todo cae a 10–25, también la tienda sin temática: el dibujo por software de
este entorno no representa a un iPhone, que compone `transform` y `opacity` en la GPU. **Falta la prueba en un iPhone real**
(Safari, 60 fps y sin saltos): pantalla de carga de cada temática nueva, scroll del inicio con temática y tocar una tarjeta.

## Estudio de contenido · Fase 6 (`tests/e2e/admin-studio.spec.ts`, `tests/unit/studio.test.ts`)
| Verificación | Estado |
|---|---|
| Elegir la fecha muestra post, historia y carrusel con los textos, 3 productos y el cupón de la temática; cambiar de fecha los reemplaza | ✅ |
| El texto sugerido trae el gancho del producto, la oferta, una palabra para comentar y el hashtag de la fecha; "Otra idea" cambia el gancho | ✅ |
| PNG del post con el titular editado y una foto propia (archivo PNG válido) | ✅ |
| Carrusel: una imagen por diapositiva (6 con 3 productos) | ✅ |
| Video de la historia de 6 s con música (MP4 o WebM según el navegador) | ✅ |
| Precio y precio con cupón del engine en pesos enteros; ganchos por producto; duración 6–15 s; formato de video y nombres de archivo | ✅ unit |

**Video**: se graba en tiempo real con `MediaRecorder` desde el canvas a 1080 × 1080 o 1080 × 1920. Para que cada cuadro
sea liviano, ilustraciones, tarjetas con sombra, fondo, auroras y sello se pasan a mapa de bits una sola vez y la vista
previa se pausa mientras graba. En el Chromium de pruebas (sin GPU) el post graba a ~19 cuadros por segundo y la historia a
~12; en un navegador con GPU (Chrome o Safari en el teléfono) se espera más. **Falta probar en Safari de iPhone** que el
video salga en MP4 (H.264) y que "Compartir" guarde en Fotos.

## QA cruzado · Fase 7 (`tests/e2e/cross-device.spec.ts`)
| Verificación | Estado |
|---|---|
| Las 20 rutas de la tienda y las 22 del panel abren en iPhone SE (375), iPhone 15 (393), Android (412) y escritorio (1440) sin error de página ni de consola, con su título, sin scroll horizontal, sin «acreditado» y con la señal de demo en el panel | ✅ |
| Con «reducir movimiento» activado la portada no falla al hidratar (el botón del carrusel mostraba otro ícono en el servidor y en el cliente) | ✅ corregido |

Es emulación en Chromium: **no reemplaza** la prueba en un iPhone y un Android reales. Checklist y registro en
`docs/qa-dispositivos.md`.

## Regalos, ruleta y rendimiento · Fase 8 (`tests/e2e/gifts.spec.ts`, `shop-fase4.spec.ts`, `gamification.spec.ts`, `tests/unit/gifts.test.ts`)
| Verificación | Estado |
|---|---|
| Regalar desde la ficha: sin "para quién" no sigue y lleva el foco; la ocasión dice cómo se abre; el carrito marca "Regalo para…" | ✅ |
| Al confirmar: código `REGALO-XXXX-XXXX`, WhatsApp con el código y el link, "Ver cómo lo recibe" | ✅ |
| Otro navegador abre el link: escenario oscuro, "Golpeá el regalo para abrirlo", cinco golpes, producto y mensaje **sin precio**, guardar en mis regalos, sin scroll horizontal | ✅ |
| Cuenta demo: el regalo de muestra aparece sin abrir, se abre ("Abrirlo de una vez" con movimiento reducido) y queda "Abierto" | ✅ |
| Código escrito a mano (minúsculas, sin guiones) abre; uno inventado avisa; un link cortado o editado no abre nada | ✅ |
| Código con dígito verificador, link sin email ni precio, límites de texto, regalos por cuenta y por pedido | ✅ unit |
| Ruleta a pantalla completa: el disco entra entero en la pantalla, el fondo no scrollea, gira con el centro, con toque, arrastre o teclado; al ganar, cupón de la festividad con "Aplicar ahora", "Guardar para después" y "Salir" a la vista | ✅ |
| Las 17 escenas de regalo: cada golpe deja huella, la apertura termina y el estado final queda armado (capturas golpe a golpe y con movimiento reducido) | ✅ revisión visual |

**Rendimiento medido** (Chromium sin GPU, Pixel 7 emulado a 390 px, CPU frenada 4×, promedio de 2 cargas; antes → después):

| Página | Bloqueo del hilo (TBT) | Tarea más larga | Nodos | Scroll |
|---|---|---|---|---|
| Inicio (Original) | 3474 → 1727 ms | 624 → 450 ms | 3243 → 2588 | 54 → 60 fps, saltos 2% → 0% |
| Ficha del collar | 2424 → 1888 ms | 487 → 417 ms | 1544 → 1428 | 22 → 36 fps, saltos 52% → 15% |
| Inicio (Navidad) | 2901 → 2350 ms | 569 → 398 ms | 4002 → 3228 | sin frenar la CPU: 53–56 fps (en la Fase 5, 39–50) |

JavaScript del inicio: 341 → 322 KB comprimido y HTML 449 → 398 KB, con regalos y ruleta nueva incluidos. Con la CPU
frenada, el scroll de las temáticas varía mucho entre corridas (lo domina el dibujo por software de este entorno); la
prueba que vale es la del teléfono real (`docs/qa-dispositivos.md`).

## Pantallas de carga · Polish 8.1 (`tests/e2e/splash-polish.spec.ts`, `motion-viewports.spec.ts`, `shop-fase5.spec.ts`)
| Verificación | Estado |
|---|---|
| Original: un solo aro, concéntrico con la pantalla y con el logo (±2 px), y las cinco piezas montadas sobre él (±3 px) | ✅ |
| Mientras se ve el splash el lienzo es oscuro (no asoma la tienda clara en el primer cuadro) y vuelve a la normalidad al cerrarse | ✅ |
| Día de la Madre: 20 pétalos; las esquinas del logo quedan dentro de la ronda de estambres (ningún pétalo lo pisa) | ✅ |
| San Valentín: Lola y Pancho en la cena; corazón y cena centrados, el logo dentro del corazón y arriba de la cena, todo dentro de la pantalla | ✅ |
| Con «reducir movimiento» no hay splash ni animaciones corriendo | ✅ |
| Cuadro a cuadro en 390 × 844, 820 × 1180, 1440 × 900 y 844 × 390; video en tiempo real (el logo y el aro se animan aunque la página esté cargando) y cuadros reales del compositor alrededor del telón (sin cuadros oscuros sueltos) | ✅ revisión visual |

Qué se hizo:
- Las escenas de la pantalla de carga (16 temáticas) se descargan de a una: solo la de la fecha.
- La ruleta, los cupones y el buscador se descargan al abrirlos (el carrito no: es lo que más se abre y tiene que responder al instante).
- Las escenas de regalo, de a una, al abrir un regalo.
- La segunda vista de cada tarjeta (al pasar el mouse) se dibuja recién cuando entra el mouse: en el celular era un SVG
  entero de más por tarjeta.
- Las secciones de más abajo del inicio, las recomendaciones de la ficha y el pie usan `content-visibility: auto`.
- Las letras del collar se balancean tres veces y quedan quietas (un balanceo sin fin redibujaba el SVG en cada cuadro).
- Se probó pausar el fondo de la temática durante el scroll: no mejoró nada medible y se descartó.

## Tienda del usuario · Polish 8.2 (`tests/e2e/shop-polish.spec.ts`, `tests/unit/grid.test.ts`)
Lote 1: carrusel principal, categorías y riel de Recomendados.

| Verificación | Estado |
|---|---|
| Carrusel principal a 640 × 900, 820 × 1180, 1080 × 810, 1180 × 820 y 1440 × 900: se recorren todas las diapositivas (temática + 3) con las flechas y ninguna flecha pisa texto ni la imagen del producto; flechas de 44 px o más | ✅ |
| Categorías del inicio en una sola fila a 375, 640, 820, 1080, 1180 y 1440 px; si no entran, Tab hasta la última la trae a la vista y los controles laterales llegan al final (el de atrás aparece, el de adelante se va) | ✅ |
| `/categorias/`: filas parejas sin ninguna categoría sola en su fila; en escritorio, una sola fila | ✅ |
| Recomendados a 1080 × 810 y 820 × 1180 con movimiento: 10 idas y vueltas con las flechas, sin tarjetas en blanco a mitad de camino, cada parada en el borde de una tarjeta y sin reacomodo 300 ms después; deslizón rápido al final y vuelta sin huecos | ✅ |
| Reparto de columnas parejas (ninguna sola en la última fila hasta 12 categorías) | ✅ unit |

Causas y arreglos:
- **Flechas del carrusel**: estaban a 16 px del borde y el texto arrancaba a 48 px; la flecha de la izquierda tapaba
  el título. Ahora hay una franja lateral reservada (`--hero-safe`: margen + flecha + 1 rem) y el texto y la imagen
  empiezan después; en el celular no hay flechas (se desliza y están los puntos, ahora con 24 px de toque).
- **Categorías**: la grilla de 4 y 8 columnas dejaba la novena sola abajo. Ahora es una fila que se desliza; en
  escritorio los círculos se reparten el ancho y los controles laterales aparecen solo hacia donde hay más.
- **Hueco en Recomendados**: cada tarjeta aparecía sola al entrar en pantalla (opacidad 0 hasta que el navegador
  avisaba que se veía un 15 %). En un riel horizontal, al deslizar rápido hasta el final las del medio nunca llegaban a
  "verse" y la que quedaba asomada tampoco: al volver aparecían en blanco (en Safari, que avisa más tarde mientras se
  desliza, el hueco duraba más). Además las flechas movían el 80 % del ancho, que no cae en el borde de una tarjeta, y
  el navegador corregía la posición al terminar. Ahora el riel aparece entero una sola vez, las flechas pasan de a
  tarjetas enteras (siempre a un punto de snap), se apagan en los extremos y respetan "reducir movimiento".

Lote 2: collar y volver arriba al navegar (`tests/e2e/shop-polish-collar.spec.ts`, `shop-polish-scroll.spec.ts`,
`tests/unit/collar-styles.test.ts`).

| Verificación | Estado |
|---|---|
| Inicio: escribir el nombre y cambiar estilo de letras (sueltas, en línea, de corrido, chapita), patrón y colores cambia la vista previa al instante; con "A" y "Bartolom" ningún texto se sale del dibujo en los cuatro estilos | ✅ |
| Patrones de dos colores: aparece "Segundo color" y el cordón lo usa; volviendo a letras sueltas y liso desaparece el aviso de demo | ✅ |
| Ficha: estilo, adorno y patrón llegan al carrito con su descripción y "ejemplo de la demo"; con chapita el adorno no corresponde y se oculta; otro producto personalizable (comedero) no muestra opciones de collar | ✅ |
| Solo letras sueltas, paracord liso y dije patita (lo visto en el Instagram) van sin sello de demo; configuración vieja guardada en el navegador toma la vigente | ✅ unit |
| Con movimiento: inicio → categoría → producto → relacionado, recomendados → producto → carrito → checkout, header y pie: cada página abre arriba, con el título debajo del header, y sigue arriba después de la transición | ✅ |
| Link con ancla (`#personalizar`) abre en la sección, debajo del header; Atrás vuelve a donde estaba; ordenar productos no mueve la página | ✅ |
| Sin el arreglo de scroll fallan los 3 recorridos (se probó sacándolo y volviendo a armar) | ✅ |
| Sin desborde a lo ancho en la ficha del collar a 375, 393 y 412 px (`cross-device.spec.ts`) | ✅ |

Causas y arreglos:
- **Collar del inicio**: el probador dibujaba una ilustración genérica con una sola chapita, no el configurador real.
  Ahora usa la misma vista previa y las mismas opciones que la ficha (salen de la configuración del producto):
  letras sueltas que cuelgan, letras en línea que pasan por el cordón, de corrido o chapita; adorno a los costados;
  cinco patrones del cordón con segundo color. Los nombres largos achican la letra en vez de salirse.
- **Opciones sin confirmar**: lo único visto en el Instagram de Velmar es el collar de paracord de un color con letras
  sueltas y patita. El resto (letras en línea, de corrido, chapita, adornos, patrones, biothane, nylon y los otros
  dijes) lleva el sello "Demo", un aviso y "ejemplo de la demo" en el carrito y el pedido; la aprobación avisa que el
  taller lo confirma antes por WhatsApp.
- **Scroll al navegar**: el router de Next lleva a la vista el primer elemento de la página nueva, que quedaba debajo
  del header fijo; con la transición entre páginas la posición se movía un cuadro después (la categoría abría a
  141 px y el Club a 580 px). `useRouteScroll` (en `ClientShell`) lleva al inicio o al ancla en cada cambio de ruta y
  lo sostiene durante la transición, salvo que la persona ya se esté moviendo; Atrás/Adelante y los cambios sin
  cambio de ruta no se tocan.
- **Desborde en el celular**: las filas de opciones que se deslizan estiraban la página a 909 px: los `fieldset` no se
  achican por debajo de su contenido y los radios ocultos (absolutos) no los recortaba la fila. `min-w-0` y `relative`.

Lotes 3 y 4: ficha del producto (`tests/e2e/shop-polish-product.spec.ts`).

| Verificación | Estado |
|---|---|
| A 1180 × 740, 1440 × 900 y 1080 × 700, bajando de a 150 px: la galería queda fija debajo del header y entera en la pantalla mientras se recorre la compra, y nunca pasa del final de esa sección (no acompaña a los detalles ni a las recomendaciones) | ✅ |
| En el celular la galería va en el flujo normal | ✅ |
| Agregar al carrito, Comprar ahora y Regalar ahora en columna, mismo ancho y en ese orden, sin texto cortado; favoritos aparte, junto al título; Regalar ahora abre el regalo | ✅ |
| Celular: Comprar y Regalar en la tarjeta y Agregar en la barra de abajo (uno solo a la vista) | ✅ |
| Cuatro saltos seguidos de un producto a otro por las tarjetas: título del producto nuevo, arriba de todo, sin diálogos abiertos, cantidad de vuelta en 1, carrito intacto y sin capturas de la transición flotando | ✅ |

Causas y arreglos:
- **Galería "rota" al bajar (imagen 9)**: la galería tenía siempre el nombre de la transición del producto, así que
  entraba en cada transición entre páginas como una captura aparte; en Safari esa captura podía quedar corrida y
  borrosa encima de la ficha. Ahora el nombre se pone solo al llegar desde una tarjeta (para que la imagen vuele) y
  se suelta enseguida.
- **Galería fija**: acompañaba a toda la columna derecha (detalles y preguntas incluidos) y en una pantalla baja no
  entraba entera. Ahora la ficha tiene dos partes: la compra (galería fija, alto limitado al espacio bajo el header)
  y los detalles en flujo normal.
- **Botones**: "Agregar al carrito" y "Comprar ahora" iban lado a lado y se partían en dos renglones; ahora van en
  columna con "Regalar ahora" (reemplaza la tarjeta "Es para regalar").

Pantalla de carga al recargar a mitad de página (pedido de Ignacio, `splash-polish.spec.ts`):
- **Causa**: en Safari del iPad, al recargar con la página bajada, el contenido se dibujaba por encima del splash (se
  veían las tarjetas sobre su fondo, con el logo y los corazones detrás). No era un z-index bajo: tenía 100, el más
  alto de la app; Safari ordenaba mal las capas fijas al restaurar el scroll.
- **Arreglo**: el splash se abre en la capa superior del navegador (popover, abierto por un script en línea apenas
  se lee la etiqueta), donde nada de la página puede dibujarse encima. Sin soporte de popover queda como antes.
- **Verificado**: recargando a 700 px el splash está abierto en la capa superior y ocupa la pantalla entera; Escape lo
  cierra. En Chromium (no hay WebKit acá); falta confirmarlo en el iPad.

Lote 5: checkout (`tests/e2e/shop-polish-checkout.spec.ts`, `tests/unit/checkout-discounts.test.ts`).

| Verificación | Estado |
|---|---|
| A 1180 y 390 px: el resumen (subtotal, cupón, descuento por transferencia/QR, envío, total y productos) va debajo de las opciones y de los botones de cada paso; Atrás y Siguiente siguen primero y en el mismo orden | ✅ |
| El total se actualiza al elegir la entrega y al cambiar entre tarjeta y transferencia; volver a tarjeta lo deja igual que antes | ✅ |
| "Tarjetas de débito, crédito y prepagas" con la descripción pedida y "vía Mercado Pago"; siguen transferencia y QR con aprobación manual y el aviso de que nada cobra; la revisión del pedido lo nombra igual | ✅ |
| Con tarjeta no hay descuento por transferencia; cupón + transferencia se aplican una sola vez; ida y vuelta entre medios no acumula | ✅ unit |

- **Resumen**: estaba en un panel al costado (y en el celular, al final de todo). Ahora el checkout es una columna
  centrada: paso, botones y resumen. La cuenta sale del mismo engine que antes (sin cambios de precio).
- **Tarjetas**: es el mismo medio de pago de siempre (Mercado Pago Checkout Pro, simulado), nombrado como lo busca el
  cliente. No hay integración nueva ni se piden datos de tarjeta.

Lote 6: seguimiento, Mi cuenta y Club (`shop-polish-tracking.spec.ts`, `shop-polish-account.spec.ts`, `shop-polish-club.spec.ts`).

| Verificación | Estado |
|---|---|
| Seguimiento: zona "Probá los estados del pedido — Demostración" con Esperando comprobante, En producción, Listo, En camino y Entregado; cada uno cambia título, nota, recorrido y etapas, y aclara que no toca pedidos ni pagos | ✅ |
| Entregado se entiende: el rótulo de la casa pasa a "Llegó a tu casa", todas las etapas quedan hechas y, con movimiento, estalla la decoración de la temática junto a la casa | ✅ |
| Viajero por temática (motor de temáticas): trineo en Navidad, bruja en Halloween, Pancho en Día del Padre, carta con corazones en San Valentín, huevo en Pascuas, bandera en las fechas patrias; Original conserva el punto dorado | ✅ |
| Con movimiento el viajero recorre el camino; con movimiento reducido queda en su lugar al instante y sin estallido | ✅ |
| En el celular los rótulos del taller y la casa van debajo del recorrido (no tapan al viajero) | ✅ captura |
| Mi cuenta sin sesión: Iniciar sesión / Crear cuenta con estado claro, errores por campo (vacío, email inválido, nombre, largo de contraseña), mostrar/ocultar contraseña y "Entrando…" | ✅ |
| La contraseña no queda en localStorage ni en sessionStorage, no se ofrece guardarla (sin autocompletar) y no sale ningún pedido externo | ✅ |
| "Continuar con Google" rotulado **Simulado**: no hay OAuth ni pedidos a Google; muestra una cuenta de ejemplo y entra con la cuenta demo | ✅ |
| Mi cuenta con sesión (pedido de Ignacio): tarjeta de perfil y cinco tarjetas (pedidos, regalos, misiones, premios, direcciones) con resumen; una sola sección a la vista; el hash (`/cuenta/#regalos`) abre la que corresponde y sobrevive a la recarga; a 1180, 820 y 390 px sin desbordes | ✅ |
| En el celular, al elegir una tarjeta la sección se acerca sola si quedó abajo | ✅ |
| Club: portada con métricas en tarjetas, "Tu próximo premio" con el progreso del motor de misiones, accesos "Ver mi progreso" e "Ir a la ruleta"; la ruleta mantiene su único botón y la lógica de premios no cambia | ✅ |
| La portada del Club toma el acento y el adorno de la temática vigente (Halloween: naranja y sombrero) | ✅ |
| Misiones: estado corto (Por empezar, En curso, ¡Completada!) y avance debajo del título; a 1280, 820 y 390 px el estado entra en una línea y el título en dos renglones como máximo | ✅ |
| Banda del Club en el inicio (pedido de Ignacio): a 1280, 820 y 390 px deja aire a los dos costados y tiene las puntas redondeadas | ✅ |

- **Mi cuenta**: antes eran cinco secciones una debajo de la otra (en el iPad había que bajar mucho). Ahora es un panel
  de tarjetas: en el celular en grilla, en tablet en una fila y en escritorio como menú a la izquierda.
- **Ingreso**: es de demostración. La contraseña se valida en el momento y se descarta; el nombre y el email quedan en la
  cuenta demo de este navegador, como antes.
- **Banda del Club**: ocupaba de borde a borde (márgenes negativos). Ahora respeta el margen de la página en todos los
  tamaños; la portada del Club también pasó a ser una tarjeta con margen.

Lote 7: premios de la ruleta, Día del Animal y regalo en modal (`shop-polish-wheel.spec.ts`, `shop-polish-gifts.spec.ts`, `tests/unit/wheel-prize.test.ts`).

| Verificación | Estado |
|---|---|
| Estados del premio: ganado, guardado, aplicado, desactivado desde el checkout y utilizado; uno solo a la vez, calculado en el engine (`prizeStatus`) | ✅ unit |
| Aplicado: sigue aplicado al ir del Club al carrito y al checkout, y después de recargar en cada uno | ✅ |
| Reabrir la ruleta con el premio aplicado no da otro giro ni repite el aviso: dice "Aplicado a tu carrito" y ofrece seguir | ✅ |
| En el checkout el cupón se ve, se quita (el total sube y la fila "Cupón" desaparece) y queda como "Quitado del pedido" en Mis cupones; se vuelve a aplicar desde "Elegir de mis cupones" sin salir del checkout | ✅ |
| Guardado: queda en Mis cupones como "Guardado"; la ruleta reabierta ofrece aplicarlo pero no guardarlo de nuevo | ✅ |
| Utilizado: al confirmar el pedido con el premio suma un uso; queda "Ya lo usaste en un pedido", la ruleta no ofrece aplicarlo y escribirlo a mano avisa que llegó a su límite | ✅ |
| Un solo cupón emitido por premio (panel de cupones) y el mismo aviso no se apila dos veces | ✅ |
| Un cupón elegido que no cumple las condiciones se puede quitar desde el carrito o el checkout | ✅ |
| Día del Animal: el cachorro asoma por la puerta un poco más con cada golpe (orejas, ojos con brillo, parpadeo y cabeza que se ladea), apoya las patitas y se pone contento antes de abrir; ya no está la cola. Las otras 16 escenas no cambian | ✅ + capturas |
| Modal de regalo centrado (en el celular sube desde abajo y ocupa el ancho), con vista previa en vivo (escena cerrada, para quién, mensaje, de parte de quién, sin precio) | ✅ |
| Escape y el botón Cerrar lo cierran; el foco entra en "Para" y vuelve a "Regalar ahora"; el fondo no se scrollea; al reabrir sigue lo escrito | ✅ |
| Validación y límites: para quién, de parte de quién, email opcional válido y mensaje de hasta 240 caracteres (avisa cuántos sobran) | ✅ |
| El mismo modal y el mismo borrador desde "Regalar ahora" y desde "¿Es para regalo?" en el último paso del checkout; ahí se elige cuál producto es el regalo, se edita o se quita, y "Regalar y pagar ahora" pide los términos y confirma | ✅ |
| Ningún pedido externo en el flujo del regalo (no se manda ningún email) | ✅ |

- **Premio de la ruleta**: antes solo se sabía si había premio; ahora el premio guarda qué se eligió (ganado, guardado o
  quitado) y lo demás sale del carrito y del cupón. Los premios guardados con la versión anterior se leen como guardados.
- **Avisos**: el mismo aviso que ya está a la vista se reemplaza en lugar de apilarse.
- **Regalo**: la barra lateral "Es para regalar" se reemplazó por el modal. El borrador vive en memoria: sobrevive a cerrar
  y reabrir y a navegar dentro de la tienda, no a recargar.

QA global de Polish 8.2 (`shop-polish-journeys.spec.ts`; emulado en Chromium, **no** en equipos reales).

| Recorrido | 1600 | 1366 | 1180 (tablet horizontal) | 820 (tablet vertical) | 390 | 320 |
|---|---|---|---|---|---|---|
| A · Compra: inicio → categoría → producto → personalización → carrito → checkout → entrega → pago simulado → confirmación | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| B · Regalo desde la ficha (modal → carrito → checkout → revisar el regalo, sin perder la personalización) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| B · Regalo desde "¿Es para regalo?" en el checkout | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| C · Club: misiones → ruleta → premio → aplicar → checkout → quitar el cupón (el total sube) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| D · Navegación: inicio → recomendado → otro recomendado → volver → categoría → carrito (scroll arriba, flechas del riel) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| E · Seguimiento: en producción → en camino → entregado → cambio de temática (Navidad) → repetir | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

En cada pantalla de cada recorrido se controla que no haya scroll horizontal, errores de consola ni pedidos externos.

- **Encontrado y corregido en el QA**: a 320 px el selector "Ordenar por" de la categoría desbordaba 6 px (ahora pasa
  abajo del contador) y en el checkout los importes del resumen se partían en dos renglones ("−$" arriba y el número
  abajo). El bloque "¿Es para regalo?" deja el botón debajo del texto en el celular.
- **Barrido extra**: 19 rutas de la tienda a 320 y 360 px, con sesión y carrito con cupón: sin desbordes.
- **Seguridad**: el diff no agrega endpoints, Server Actions, dependencias ni pedidos de red; la contraseña del ingreso
  solo vive en el estado del formulario (no va a localStorage ni a sessionStorage, comprobado en el e2e); Google es una
  simulación rotulada, sin OAuth; no se manda ningún email.
- **Falta**: probar en un iPad, un iPhone y un Android reales (filas 20 a 22 de `qa-dispositivos.md`).

## Panel admin · Polish 8.3 (`tests/e2e/admin-polish-*.spec.ts`; matriz completa en `docs/polish-8.3-status.md`)

Lote 1: base responsive, navegación e inicio.

| Verificación | Estado |
|---|---|
| 8.3.1 Cada barra de "Ventas por día" es un botón (clic, toque, Enter): muestra fecha, cantidad, total y los pedidos del día con acceso a su ficha; un día sin ventas muestra su estado vacío | ✅ |
| 8.3.1 La suma de los pedidos del detalle es la de la barra; "Ver como tabla" usa los mismos días y su total es el KPI "Ventas últimos 7 días"; elegir un día desde la tabla también lo marca | ✅ + unit |
| 8.3.1 Recorrido: barra → pedido del día → ficha → Atrás vuelve al inicio | ✅ |
| 8.3.2 Escritorio con mouse (1440, 1280, 1024): riel de íconos de 72 px; con el mouse o el teclado se despliega a 280 px encima del contenido, que no se corre; "Fijar el menú abierto" lo deja abierto y se recuerda al recargar; un clic en un ícono navega y el riel se vuelve a cerrar | ✅ emulado |
| 8.3.2 Táctil (1024 horizontal, 768 vertical, 390, 360): sin riel; hamburguesa con los grupos y la sección actual marcada; pestañas Inicio, Pedidos, Pagos, Productos y Más; la barra no tapa el final del contenido; sin desborde | ✅ emulado |
| 8.3.3 Últimos pedidos, Club Velmar y Actividad reciente, una debajo de la otra a todo el ancho (1440, 1024, 390); cada pedido en una fila con código en una línea, cliente, estado e importe | ✅ emulado |
| 8.3.11 Sin guía de bienvenida la primera vez ni después de "Reiniciar demo"; sin botón "Ver guía"; la señal de demo sigue | ✅ |

- **Sidebar:** el corte es "1024 px **y** mouse" (variante `desk:` en `globals.css`). Un iPad en horizontal (1024 o 1180 px,
  táctil) usa hamburguesa y pestañas, como pide la ficha. Falta confirmarlo en un iPad real con Safari.
- **Guía:** se quitaron el componente, sus pasos y las marcas `data-tour`. La clave vieja `velmar-tour:admin` queda donde
  esté (no se borra nada del navegador) y ya no se lee.

Lote 2: tablas universales, vista Excel y catálogo unificado (`admin-polish-tables.spec.ts`, `admin-polish-catalog.spec.ts`,
`tests/unit/admin-tables-83.test.ts`).

| Verificación | Estado |
|---|---|
| 8.3.4 Pedidos, Clientes, Productos, Variantes, Costos, Insumos y Categorías a 1440 (mouse), 1024 y 390 (táctil): buscar, "Buscar", "Reiniciar filtros" y todos los filtros a mano (los que no entran, en "Más filtros"); sin desborde | ✅ emulado |
| 8.3.4 Diez por página con "página N de M"; filtrar estando en la página 2 deja una página válida; Reiniciar limpia búsqueda, filtros y URL | ✅ + unit |
| 8.3.4 Toda la fila abre la entidad correcta (pedido, cliente, producto desde producto o variante, costo, insumo, categoría); checkbox, switch de visibilidad y botones de stock no navegan | ✅ |
| 8.3.4 Vista Excel con los mismos filtros y filas; pedidos de solo lectura (nada se edita, sin "Guardar"); Atrás vuelve a la tabla con el filtro; el `.xlsx` lleva las 17 filas sin filtro (la página muestra 10) y las filtradas con filtro | ✅ |
| 8.3.18 Insumos: buscar pasa a la vista Excel; "Piden los pedidos" no se edita; −3 marca error; 4.200 se guarda una vez, la tabla muestra 4200 y sigue al recargar; filtro de estado y Reiniciar | ✅ |
| 8.3.18 Salir con cambios pide confirmar; recargar recupera el borrador; "Descartar y volver" lo limpia | ✅ |
| 8.3.19 Menú con "Productos y stock" y sin Stock, Planilla ni Importar; el aviso de reposición filtra la misma pantalla; `/admin-demo/stock/?vista=reponer` y `/admin-demo/planilla/` llegan a la vista correcta; "Importar Excel" sigue en el módulo | ✅ |
| 8.3.19 "A pedido": mismas variantes en la tabla y en la vista Excel, que las muestra como "a pedido" | ✅ + unit |
| 8.3.22 Modal "Nueva categoría": foco en el nombre, Escape cierra y devuelve el foco, el borrador sigue al reabrir, nombre vacío da error, el repetido avisa, crear suma exactamente una, se limpia y aparece en el editor de productos | ✅ |
| 8.3.22 Con filtros no hay Subir/Bajar (aviso); en el orden de la tienda, Subir mueve y se guarda; el switch de la fila no navega; la fila abre el detalle con productos y destacada | ✅ |
| 8.3.22 Vista Excel: renombrar se guarda y el lugar en la tienda no cambia | ✅ + unit |

- **Filtros que entran:** container queries sobre el ancho real de la tabla (no del viewport): el primero desde 50rem, el
  segundo desde 62rem y el tercero desde 73rem; del cuarto en adelante, siempre en "Más filtros". Con la barra lateral fijada
  entra uno menos.
- **Buscar:** filtra mientras escribís (como antes); "Buscar" confirma y cierra el teclado del celular.
- **Reclamos, cupones y pagos** son listas de tarjetas, no tablas: siguen con su paginado y se revisan en los Lotes 3 y 6.

Lote 3: fichas completas, comprobantes, Clientes, modales y datos de cobro (`admin-polish-details.spec.ts`,
`admin-polish-customers.spec.ts`, `tests/unit/admin-details-83.test.ts`).

| Verificación | Estado |
|---|---|
| 8.3.5/8.3.6 Pedido: desde la fila con filtro, migas de pan, ID, "Pago" y "Producción y entrega" por separado, próxima acción; cambiar a "En producción" con confirmación; recargar mantiene el pedido; Volver vuelve a la lista con el filtro y el pedido ya no está en "Para producir" | ✅ + unit |
| 8.3.6 Ficha de pedido y de pago a 768 y 390: apiladas y sin desborde | ✅ emulado |
| 8.3.7 Pago: comprobante a la izquierda de los datos (1280) y arriba (768, 390); aprobar desde la ficha pasa a "Pagado · aprobado a mano" y los contadores bajan de 2 a 1 (resueltos de 6 a 7) | ✅ emulado |
| 8.3.8 Sin "Auditoría de muestra"; el registro de aprobación sigue en el historial del pedido | ✅ |
| 8.3.30 "Configurar datos de cobro": cancelar no cambia nada; CBU inválido da error al lado del campo; guardar muestra los mismos valores en Ajustes, deja la cola en el mismo filtro, no aprueba pagos y el checkout demo con transferencia muestra el alias nuevo | ✅ |
| 8.3.5 Reclamos: la lista abre la ficha; "Marcar en curso" con confirmación; Volver a la lista con el estado actualizado | ✅ |
| 8.3.9 Clientes sin "Para escribirles"; el filtro "Para escribir" (esta semana) muestra a Diego Álvarez | ✅ |
| 8.3.10 Ayuda de segmentos con teclado (Enter abre, Escape cierra), texto con el umbral VIP real y debajo de los filtros (no los tapa) | ✅ + unit |
| 8.3.12 La fila abre la ficha arriba de todo; el checkbox no navega; Volver conserva `?segmento=VIP` | ✅ |
| 8.3.13 Ficha a 1280 (dos columnas), 768 y 390 (apilada): botones de recordatorio sin pisar el título, títulos en una línea, sin desborde | ✅ emulado |
| 8.3.17 Costos en modal: frase inicial, minutos negativos dan error, cancelar con cambios pide confirmar y no guarda, guardar recalcula | ✅ + unit |
| 8.3.17 Insumos en modal: crear sin nombre da error, crea exactamente uno, Escape sin cambios cierra, editar guarda una vez | ✅ + unit |

- **Ayudas:** el texto sale de las mismas reglas del engine (`VIP_FROM`, `ORDER_TABS`, `materialState`, `marginState`).
- **Volver:** cada tabla anota su URL por sección en `sessionStorage` (`velmar-ui:list:*`); sin nada anotado, vuelve a la lista limpia.
- **Datos de cobro:** el checkout de las compras nuevas usa los datos guardados; los pedidos no guardan una copia, así que no se reescriben históricos.

Lote 4: editor de producto por pasos y vista previa en la tienda (`admin-polish-editor.spec.ts`,
`tests/unit/admin-editor-83.test.ts`).

| Verificación | Estado |
|---|---|
| 8.3.20 Edición a 1440: foto y alt primero, pasos a la derecha; "Datos" completo y "Medidas" por completar según los datos; tocar "Variantes" lleva al bloque justo debajo de la barra del panel, lo marca como actual y enfoca su título; lo escrito sigue | ✅ + unit |
| 8.3.20 Sin texto alternativo: guardar marca el error en su bloque, el paso en rojo y "Faltan datos en 1 paso" en la barra; al completarlo, el paso queda completo y guarda | ✅ + unit |
| 8.3.20 Al final de la página la barra de guardado queda debajo del último bloque (no lo tapa) | ✅ |
| 8.3.20 A 1024 con mouse, 768 y 390 táctil: pasos compactos arriba ("Paso N de 7"), el bloque elegido queda debajo de ellos, un campo enfocado no queda debajo de la barra ni de los pasos, sin desborde | ✅ emulado |
| 8.3.21 Vista previa de una edición: muestra el nombre sin guardar, comprar y regalar apagados, carrito en 0; "Volver al editor" recupera el borrador, el paso (Personalización) y el scroll sin aviso; Atrás del navegador también | ✅ |
| 8.3.21 Nada se publica: la ficha real sigue con el nombre guardado; al entrar de nuevo al editor se recupera el borrador con aviso y se puede descartar con confirmación | ✅ |
| 8.3.21 Alta: borrador con id temporal, foto primero; dos idas y vueltas a la vista previa (botón y Atrás) no lo agregan al catálogo; guardar crea exactamente uno (pausado); el acceso viejo `?nuevo=1` abre un alta limpia | ✅ + unit |
| 8.3.21 Vista previa a 1024, 768 y 390: franja "Volver al editor" visible y sin desborde | ✅ emulado |
| Borrador guardado roto o de otra versión: se ignora sin romper | unit |

- **Pasos:** el estado sale de validar (`checkSteps`): errores bloquean (alt, nombre, precio, categoría, variantes), las medidas solo avisan.
- **Borrador:** `velmar-ui:product-draft:editar:<slug>` o `:nuevo` en `sessionStorage`, solo mientras hay cambios; `velmar-ui:preview-return` marca que la vista previa se abrió desde el editor.

Lote 5: capacidad y feriados, calendario editable y tablero de producción (`admin-polish-workshop.spec.ts`,
`admin-workshop.spec.ts`, `tests/unit/admin-workshop-83.test.ts`).

| Verificación | Estado |
|---|---|
| 8.3.14 Modal con dos tarjetas: el foco arranca en la primera, Escape cierra y devuelve el foco al botón | ✅ |
| 8.3.14 Bajar la capacidad a 2 avisa "El jue, 8 oct queda sobrecargado (3 de 2 pedidos)"; "Seguir editando" no guarda; "Guardar igual" guarda y los pedidos siguen en su fecha | ✅ + unit |
| 8.3.14 Feriados de a 10: "Todos" da 35 en 4 páginas (1–10, 11–20 … 31–35), siguiente se apaga en la última; los cierres propios van en su pestaña | ✅ + unit |
| 8.3.14 Cerrar el 14/10 avisa que VEL-000123 queda en un día cerrado; confirmado, el pedido no se mueve y el calendario lo marca para reprogramar; editar el motivo y quitar con confirmación (el aviso desaparece) | ✅ + unit |
| 8.3.15 Tocar un día: ver entregas y entradas; crear (con validación), nota vinculada a un pedido, persistir al recargar, editar | ✅ + unit |
| 8.3.15 Arrastrar una entrada la mueve; arrastrar un pedido a un sábado lo rechaza con el motivo; a un día válido pide confirmar (Cancelar no mueve, Mover sí, una sola vez) | ✅ + unit |
| 8.3.15 Reprogramar sin arrastrar a un día completo pide confirmar la sobrecarga; la fecha nueva se ve en la ficha del pedido | ✅ |
| 8.3.15 Teclado: Enter sobre un día abre su modal y Escape lo cierra | ✅ |
| 8.3.16 "Mover etapa" lista solo etapas permitidas; contadores al día; volver a En máquina no descuenta insumos otra vez (cera 5000 → 3920 una sola vez) | ✅ + unit |
| 8.3.16 Arrastrar a A fabricar se rechaza con "Un pedido en producción no vuelve a la cola."; a Terminación se acepta | ✅ |
| 8.3.16 Tablero a 1440 y 1280 con menú fijo, 1024 con mouse, 768 y 390 táctil: cada etapa de 250 px o más, títulos en una línea, sin desborde de página; los atajos llevan al carril | ✅ emulado |
| 8.3.10 Ayuda "i" del calendario y de producción, armada con las reglas del engine | ✅ + unit |
| Datos guardados antes de 8.3 sin entradas del calendario (o rotas): quedan las de muestra y el resto no cambia | unit |

- **Arrastrar con el dedo:** no está. En tablet y celular se reprograma desde la ficha de entrega y las etapas con "Mover etapa".

Lote 6: misiones, Marketing por tarjetas, ruleta y premios (`admin-polish-marketing.spec.ts`,
`tests/unit/admin-marketing-83.test.ts`; al día `admin-flows`, `gamification` y `shop-polish-wheel`).

| Verificación | Estado |
|---|---|
| 8.3.23 "Nueva misión" con teclado abre el modal; la página no tiene campos; guardar vacío marca título y premio junto a cada campo | ✅ + unit |
| 8.3.23 Escape no guarda y devuelve el foco; reabrir recupera el borrador con aviso; guardar crea exactamente una misión y el próximo alta arranca vacío | ✅ |
| 8.3.23 La misión creada se ve en el Club de la tienda demo | ✅ (`admin-flows`) |
| 8.3.24 Marketing con 6 tarjetas; "Cupones y ruleta" muestra solo sus tres tarjetas; cada subpágina con migas y "Volver a…"; Atrás y links directos andan | ✅ |
| 8.3.24 Bandeja de salida como subpágina; el enlace viejo `?vista=enviados` lleva ahí; volver a Emails no muestra la bandeja debajo | ✅ |
| 8.3.24 Editor de email a 1024: título en una línea y acciones debajo; "Ir a: Bloques" lleva y enfoca; los cambios sin guardar vuelven al reabrir y se descartan con confirmación; la vista previa sigue reemplazando las fichas | ✅ |
| 8.3.25 Ruleta: vista previa arriba; gajo 1 elige "5% OFF" por ID con 26%; premio "$4.500 OFF" desde la plantilla (0 da error), elegido en el gajo 2 y guardado; el catálogo lo muestra en 1 gajo | ✅ + unit |
| 8.3.25 Todos los pesos en 0 con la ruleta visible: probabilidad "—" y no se guarda; salir y volver recupera el borrador y se descarta | ✅ + unit |
| 8.3.24/8.3.25 A 1024 con mouse, 768 y 390 táctil: entradas sin desborde, ruleta arriba, acciones del email debajo del título, modal de misión dentro de la pantalla | ✅ emulado |
| Ruleta guardada antes de 8.3.25: el catálogo se arma desde los gajos sin cambiar IDs; el cupón del premio sale igual | unit |
| Ruleta en la tienda, cupones ganados y checkout de 8.2 sin cambios | ✅ (`shop-polish-wheel`, `gamification`, `purchase-flow`) |

Lote 7: Temáticas, oferta del Estudio y Contenido (`admin-polish-content.spec.ts`, `tests/unit/admin-content-83.test.ts`;
al día `themes`, `admin-studio` y `shop-polish`).

| Verificación | Estado |
|---|---|
| 8.3.26 Temáticas en automático no muestra "Temática fija"; en fijo aparece y "Hoy ve el cliente" muestra la fija con su aclaración; "Próxima por fecha" dice que en fijo no cambia sola; "Sin temática" vuelve a ocultarla; el botón "Probar temáticas" sigue | ✅ |
| 8.3.26 A 1180 y 820 táctil y 375: sin desborde; el selector de modo mide 260 px o más; las dos tarjetas no se pisan (lado a lado o apiladas) | ✅ emulado |
| 8.3.27 Cupón del Estudio en post, historia y carrusel con 30% OFF, $3.000 OFF, envío gratis, condición en dos líneas, códigos de 15 y 16 letras y titular largo: nada cortado ni fuera de la pieza; no pisa la columna de texto ni el precio; sobre la tarjeta solo apoya su borde | ✅ capturas + unit |
| 8.3.27 Exportar PNG, las diapositivas del carrusel y el video siguen andando | ✅ (`admin-studio`) |
| 8.3.28 Contenido con tres tarjetas; cada subpágina tiene solo su guardar y "Volver a Contenido"; Atrás anda | ✅ |
| 8.3.28 Carrusel: elegir la 2 la muestra arriba (fondo y número de la tienda); editar el título se ve en la vista previa; salir y volver recupera el borrador | ✅ |
| 8.3.28 Imagen: un .txt y una de 200 × 150 px se rechazan con su mensaje; una válida se ve en la vista previa; el encuadre mueve el punto visible; sin texto alternativo no se guarda | ✅ + unit |
| 8.3.28 Guardar actualiza el carrusel de la tienda (imagen con su alt y título) y no cambia preguntas ni textos de inicio | ✅ |
| 8.3.28 Agregar, subir y quitar no mezclan datos entre diapositivas; título de más de 60 caracteres marca la diapositiva y no se guarda | ✅ + unit |
| 8.3.28 Almacenamiento lleno (simulado): aviso claro, lo guardado no cambia y el borrador sigue al recargar | ✅ |
| 8.3.28 Vista previa a 1180, 820 y 375: entra entera, sin desborde, con título, bajada y botón dentro | ✅ emulado |
| Diapositivas guardadas antes de 8.3.28: sin cambios; una imagen rota se descarta y queda la ilustración | unit |
| Carrusel de la tienda: las flechas no pisan texto ni imagen (8.2.1) | ✅ (`shop-polish`) |

Lote 8: Ajustes por tarjetas y QA integral (`admin-polish-settings.spec.ts`, `tests/unit/admin-settings-83.test.ts`; al
día `admin-polish-details` y `cross-device`).

| Verificación | Estado |
|---|---|
| 8.3.29 Ajustes con cuatro tarjetas; sin "Marca", "paleta" ni selectores de color en la entrada ni en las subpáginas; cada subpágina con un solo guardar y "Volver a Ajustes" | ✅ |
| 8.3.29 WhatsApp "123" da error; el borrador sigue al salir, editar Medios de pago (60 % da error, 15 % se guarda) y volver; guardar el contacto no cambia el descuento y la entrada muestra los dos valores | ✅ + unit |
| 8.3.29 Envíos: "76OO" se avisa; guardar cambia umbral y códigos del cadete sin tocar el envío nacional; descartar pide confirmación y vuelve a lo guardado | ✅ + unit |
| 8.3.29/8.3.30 Datos de cobro guardados en Ajustes aparecen en el modal de Pagos (misma fuente); el modal sigue guardando y cancelando como antes | ✅ (`admin-polish-details`) |
| 8.3.29 La tienda mantiene la paleta Velmar (`--brand-primary` `#3a4527`) y las temáticas siguen funcionando | ✅ (`themes`) |
| 8.3.29 A 1180, 820 y 375: entrada y subpáginas sin desborde | ✅ emulado |
| QA integral: 35 rutas del panel (incluidas las 13 subpáginas de 8.3) sin errores ni desborde en los equipos emulados de `cross-device` | ✅ emulado |

## Panel demo (`tests/e2e/admin-*.spec.ts`, `tests/unit/admin*.test.ts`)
| Verificación | Estado |
|---|---|
| 16 rutas del panel abren directo y al refrescar bajo subpath, con la señal de demo y sin "acreditado" | ✅ |
| Sin desborde horizontal a 375 px (el chequeo compara contra el ancho del viewport configurado) | ✅ |
| Cambiar stock a 0 → la ficha muestra "Sin stock" y bloquea el agregado; pausar productos oculta la categoría vacía | ✅ |
| Aprobar comprobante pide confirmación y deja auditoría; rechazar exige motivo; nada dice "pago acreditado" | ✅ |
| Comprobante subido en la tienda → "Comprobante en revisión" en el panel, nunca "Pagado" | ✅ |
| Cupón creado en el panel funciona en el carrito; misión creada aparece en la cuenta demo | ✅ |
| Reiniciar demo vuelve a los fixtures | ✅ |
| Teclado: diálogo de confirmación abre con Enter, cierra con Escape, se opera con Tab | ✅ |
| Movimiento reducido en el panel | ✅ |
| Transiciones de pedido válidas/ inválidas (spec 5.2) y acciones del store | ✅ unit |
| Importar Excel: columnas con otros nombres se reconocen, vista previa marca errores (centavos), importa, la categoría nueva abre en la tienda y se deshace con aviso | ✅ |
| Importar CSV con `;` y montos con `$` actualiza precio y stock | ✅ |
| Pedidos: filtro de etapa, cambio de estado en lote (solo transiciones válidas), ficha completa desde la fila, Atrás con el filtro puesto y exportar `.xlsx` | ✅ |
| Stock: sumar en la tabla se refleja en la ficha de la tienda | ✅ |
| ⌘K / Ctrl+K abre un pedido por código | ✅ |
| Vista Excel de Productos y stock (escritorio, entrando por la ruta vieja de la Planilla): validar al escribir, pegar celdas de Excel, Ctrl+Z / Ctrl+Y, guardar y ver en la tienda | ✅ |
| Lectura de celdas (montos, stock, sí/no, CSV), mapeo de columnas, plan de importación, orden, búsqueda, stock en lote, clientes y TSV | ✅ unit |
| 21 rutas del panel (con calendario, producción, costos, insumos y ficha de cliente) abren directo y al refrescar | ✅ |
| Calendario (escritorio): arrastrar un pedido a un feriado no se aplica; a un día hábil sí; a un día completo avisa "sobrecargado"; el .ics se descarga | ✅ |
| Reprogramar sin arrastrar (agenda → ficha de entrega → primera fecha libre) saca al pedido de atrasados | ✅ |
| Capacidad: con 8 y 9/10 completos y el 12/10 feriado, la placa NFC muestra el 13/10; con capacidad 4, el 8/10 | ✅ |
| Cola de producción: pasar a máquina descuenta insumos (cera 5000 → 3920 g), terminación → Listo | ✅ |
| Costos: margen de la receta y "Usar precio sugerido" cambia el precio en la tienda | ✅ |
| Ficha de cliente: mascota con cumpleaños crea recordatorio; notas persisten al recargar | ✅ |
| Días hábiles y feriados, plazos por variante/producto, capacidad, reprogramación, costos en pesos enteros, insumos comprometidos, tablero, recordatorios, .ics | ✅ unit |
| Compra en la tienda → "Gracias por tu compra" y "Recibimos tu diseño" en la bandeja, con productos y personalización | ✅ |
| Pasar a producción manda su email; una plantilla pausada no sale | ✅ |
| Editor (escritorio): insertar ficha con un toque, vista previa con datos reales sin llaves, guardar, recargar y enviar prueba | ✅ |
| Cumpleaños de mascota: "Enviar email" desde los recordatorios de Clientes | ✅ |
| Fichas resueltas, montos y fechas, datos faltantes con texto natural, bloques sin pedido omitidos, disparadores, pausa, límite de la bandeja, prueba, restaurar | ✅ unit |

Nota: con emulación móvil, Chrome agranda el viewport de layout si algo desborda. El chequeo anterior
(`scrollWidth - innerWidth`) podía dar falso negativo; ahora se compara contra el ancho configurado.
Los e2e corren con `reducedMotion: "reduce"` por defecto (sin pantalla de carga ni autoplay) y con la guía del panel
marcada como vista; los tests de pantalla de carga y de guía lo cambian explícitamente.

Reglas aprendidas (05/10):
- Con "reducir movimiento", un `motion.span` con `layoutId` dentro de un `Sheet` trababa la animación de salida y el menú
  del panel no se cerraba. El indicador de sección activa ahora es un `span` común.
- Los `fieldset` tienen `min-width: min-content`: en grilla, usar `min-w-0` y `grid-cols-[minmax(0,1fr)]`.
- iOS (Safari 26): `viewport-fit=cover` + rellenos `env(safe-area-inset-*)`; una franja fija tapa la barra de estado y
  las barras inferiores llegan al borde real de la pantalla.
- iOS 26 (09/10): Safari no dibuja nada `fixed` por detrás de su barra de direcciones (bug reportado a Apple), así que una
  barra pegada al borde deja ver la página debajo. Las barras de compra (ficha, carrito) y las pestañas del panel son
  cápsulas flotantes (`FLOATING_BAR` en `bottomBars.ts`), como la navegación inferior de la tienda.
- Los carriles horizontales usan `overflow-y-hidden overscroll-x-contain` y aparición sin desplazamiento vertical.

Reglas aprendidas en la ronda anterior:
- Los modales (`Sheet`) se montan en `<body>` por portal: el header usa `backdrop-filter`, que convierte al ancestro en
  contenedor de los `position: fixed` y dejaba el menú móvil recortado al alto del header.
- `onClose` llega como función nueva en cada render; el efecto de foco del `Sheet` depende solo de `open` (si no, cada
  tecla devolvía el foco al botón que abrió el modal).
- La animación de entrada de página usa `animation-fill-mode: backwards`: con `both` quedaba un `transform` aplicado y las
  barras fijas de compra no se pegaban al fondo de la pantalla.

Regla aprendida antes: toda grilla que contenga un carril desplazable usa `grid-cols-[minmax(0,1fr)]` de base; sin eso
el carril estira la columna y desborda solo en el celular (lo detectó el test de carrito lleno).

## Revisión manual sugerida antes de mostrar
- Recorrer en un celular real (iOS Safari y Android Chrome), en especial arrastrar la foto en el velador.
- Lector de pantalla (VoiceOver/TalkBack) en personalizador y checkout.

## Riesgos conocidos
- **Pages no habilitado**: si Settings → Pages no está en "GitHub Actions", `configure-pages` falla con un mensaje claro. No se habilita desde el workflow.
- **Ambiente `github-pages`**: solo permite deploy desde `main`. La demo se publica cuando esta rama se mergea a `main` (o al correr el workflow a mano desde `main`).
- **Contenido no confirmado**: precios, stock, plazos, zonas de envío, textos legales, datos del vendedor, número de WhatsApp (el CTA abre WhatsApp sin destinatario) y paleta son de muestra.
- **Imágenes**: ilustraciones propias rotuladas; faltan fotos reales del cliente.
- **Personalizador de foto**: la máscara del velador es genérica; la real sale de la plantilla de cada producto.
- **localStorage**: en modo privado o con cuota llena la demo sigue funcionando en memoria, pero no recuerda entre recargas.
- **`npm audit`**: 5 avisos *high* en `braces` vía `eslint-config-next` (solo herramienta de lint en desarrollo; no llega al sitio publicado). El "fix" propuesto baja a `eslint-config-next@14` y rompe Next 16; se deja hasta que Next publique la actualización.
- **Ruleta**: el "un giro por navegador" vive en localStorage; borrarlo permite volver a girar. Es aceptable en la demo; en producción el límite es por cuenta y lo valida el servidor.
- **Peso del bundle**: `motion` agrega JavaScript a la tienda; se carga en la tienda, no bloquea el splash ni el primer render (CSS).
- **Accesibilidad**: no hay auditoría automática con axe todavía (se evitó sumar dependencia); revisión manual recomendada.
- El prefetch del router de Next hace `HEAD` al mismo origen; es lectura y no envía datos.
- **Panel demo abierto**: cualquiera con el link puede abrirlo y "editar" su propia copia local. No hay datos reales ni persistencia compartida; no es un panel seguro.
- **Temáticas**: fechas aproximadas (las móviles, como Pascuas o Día de la Madre, hay que ajustarlas cada año en el panel). El cupón de una temática se puede escribir a mano fuera de temporada; en producción el servidor validaría la vigencia.
- **Excel**: se lee y escribe en el navegador con `read-excel-file` y `write-excel-file` (MIT, carga bajo demanda). El CDN de SheetJS está bloqueado desde la sesión de desarrollo. Fórmulas y formatos de celda de la planilla del cliente no se leen: entra el valor calculado.
- **Deshacer importación**: vuelve al catálogo previo a la importación; lo cambiado después también se revierte (se avisa antes de confirmar).
- **Feriados**: 2026 según Ley 27.399 y Resolución 164/2025; 2027 sin los días turísticos (se decretan cada año). Se pueden agregar o quitar en "Capacidad y feriados". Verificar contra el calendario oficial antes de producción.
- **Arrastrar en el celular**: el arrastre es de escritorio (HTML5); en el celular se reprograma desde la ficha de entrega o con los botones del tablero.
- **Sonidos**: el primer sonido llega recién después del primer toque (regla de los navegadores). Las pruebas
  verifican qué sonido se pidió (`window.__velmarSounds`), no el audio. Probar en el iPhone que el silencio del
  sistema y el botón de la tienda se respetan.
- **Collar**: vista previa ilustrativa (SVG), no un render 3D; materiales y recargos de muestra.
- **Regalos (demo)**: el link lleva el regalo adentro (cualquiera con el link lo ve; no lleva email ni precio) y el código
  solo se resuelve en el navegador donde se compró o en la cuenta demo. En producción ambos son una clave al azar
  guardada en el servidor, que también manda el email y controla el canje.
- **Estudio de contenido**: la grabación usa el reloj real; si se cambia de pestaña, el navegador pausa la animación, así
  que la grabación se cancela con un aviso y se vuelve a grabar. La vista previa se reproduce una vez y queda en el cuadro
  final ("Ver animación" la repite). En el post y la historia, si el cupón tiene mínimo, la condición va debajo del sello.
  Los fondos se guardan solo para la temática actual (Safari de iPhone limita la memoria de canvas). El Chromium de pruebas (sin códecs propietarios) graba VP9 aunque el archivo
  diga .mp4; Chrome y Safari reales graban H.264, que es lo que acepta Instagram. Las ilustraciones son de muestra: con
  fotos reales del producto (cargadas en el panel o subidas en el estudio) las piezas rinden más.
- **Temáticas de la Fase 5**: la fecha de la Marcha del Orgullo se confirma cada año (2026: sábado 7 de noviembre). Las
  escenas de la pantalla de carga empiezan cuando hidrata la página; si el teléfono tarda más de 2,6 s, la escena arranca
  por la mitad para llegar a su final antes del telón. Las transiciones entre páginas usan View Transitions: en navegadores
  sin soporte la página entra con el fundido de antes, y el gesto de "atrás" del navegador no anima la imagen del producto.
- **Ruleta en el celular**: el disco deja pasar el scroll vertical (`pan-y`); el giro se toma del arrastre
  lateral o del toque. El premio se guarda al empezar el giro (cerrar la ruleta a mitad no da otro giro).
- **Emails**: no sale ninguno. La bandeja guarda hasta 60 en este navegador. El editor de fichas usa `contentEditable`; en producción el HTML lo arma React Email (con tablas y estilos en línea para clientes de correo).
- **Capacidad**: se mide en pedidos por día, no en horas de máquina; un pedido grande ocupa lo mismo que uno chico.
- **Datos del panel por navegador**: lo que Velmar cambie en su celular no lo ve otra persona; cada navegador arranca de los fixtures.
