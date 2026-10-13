# Temáticas y regalos · análisis UX/UI (área R3)

Recorrido del 12/10/2026 sobre `http://localhost:4199/supplements-ecommerce/`. Probé las 12 temáticas con la vista
previa de "Probar temáticas" (y "Original"), en 1440 y 390, en oscuro y claro, con movimiento y con "reducir
movimiento". Abrí los 13 regalos de prueba de `docs/estado.md` (Fase 5) golpe a golpe y regalé de punta a punta: ficha →
modal → checkout → confirmación → Mi cuenta.

Las capturas están en `scratchpad/analisis/fechas-regalos/` (en adelante `fr/`). Abajo van las rutas relativas a esa carpeta.

| Qué | Dónde |
|---|---|
| 12 temáticas: pantalla de carga, inicio, ofertas, club, seguimiento, cupones y ficha | `s/<id>-<pantalla>-<ancho>.png` |
| Hojas de contacto | `sheet-*.png` |
| Regalos: golpes 0, 2, 4 y 5 y la revelación | `g/<ocasión>-<ancho>-<paso>.png` |
| Regalar desde la ficha | `g/give-*.png` |
| Checkout y confirmación | `g/co-*.png` |
| Mi cuenta | `g/acct-*.png` |

Los scripts de Playwright (`themes.cjs`, `banners.cjs`, `gifts.cjs`, `give*.cjs`, `misc.cjs` y `measure.cjs`) quedan
ahí para repetir todo.

**Veredicto corto:**
- **Ingeniería:** muy sólida. AA, "reducir movimiento", la escena se carga solo al abrir el regalo, una variante por
  fecha, sonido y vibración.
- **Arte:** nivel "stickers prolijos". El molde de dirección es el de Velmar: la fecha decora la tienda, no la vende.
- **Ninguna temática muestra producto en su pieza principal**, y ninguna pantalla de regalo genera algo que se pueda
  compartir.
- Hoy el dueño no subiría nada de esto a Instagram. Lo único "subible" es la pieza del Estudio, que sí lleva potes.

---

## 1. Inventario

### 1.1 Temáticas en la tienda
| Pieza | Qué hace | Archivo | Captura |
|---|---|---|---|
| Script del `<head>` | Decide la fecha antes de pintar (vista previa → modo del panel → fecha) y marca `data-season` | `src/features/themes/seasonScript.ts` | — |
| Paleta de temporada | Pisa **todos** los tokens (fondo, superficie, primario, estudio de producto) con `html[data-season]`. 6 fechas son "inmersivas" (oscuras también en claro) | `palettes.ts:1-8` | `sheet-light.png`, `sheet-lightcat.png` |
| Cinta superior | Texto de la promo, código copiable, "Ver ofertas", pausa de animaciones y "Vista previa · Salir" | `ThemeRibbon.tsx` | todas las `*-home-*` |
| Adorno sobre el logo (*topper*) | Flor, cuernitos, chip, etiqueta, gorro, gorro de fiesta, corazón, pesa rusa, llama, medalla, shaker o sol | `ThemeLogo.tsx`, `skins.ts:16` | header de cada captura |
| Guirnalda bajo el header | 4 estilos: lamparitas, LED, discos o banderines | `ThemeGarland.tsx:13-26` | `sheet-home-1440-*.png` |
| Fondo con FX | Aurora, FX propio (flor gigante, niebla, constelación…), grano y partículas, con pausa | `ThemeStage.tsx`, `backdrop/`, `ambient.ts` | `sheet-pedido.png` |
| Banner de la fecha | **Primera diapositiva del carrusel del inicio**: titular, bajada, oferta, "Usar CÓDIGO" y 5 decoraciones | `ThemeBanner.tsx:13-27` | `sheet-banners-1440.png`, `sheet-banners-390.png` |
| Riel "Ofertas de …" | 5 productos con su insignia y el precio con cupón | `ThemeOffersRail.tsx` | `sheet-home2-a.png` |
| Pantalla de carga por fecha | Escena CSS alrededor del logo compacto, más "Especial <fecha>" | `ThemeSplashScene.tsx`, `splash/*.tsx` | `sheet-splash-1440-a/b.png`, `zoom-splash.png` |
| Teñido de club, cupones y ficha | Solo paleta y FX, más un *sticker* en la tarjeta "Tu próximo premio" del club | — | `sheet-club.png`, `sheet-cupones.png`, `sheet-ficha.png` |
| Seguimiento | El cadete en bici con el gorro de la fecha, de unos 20 px | `TrackingView` | `cadete.png`, `pedido-v.png` |
| "Probar temáticas" | Botón flotante abajo a la izquierda → hoja con Automática, Original y 12 tarjetas. **Cada elección recarga la página** y vuelve a salir la pantalla de carga de 5 s | `ThemeTryButton.tsx:23`, `ThemePicker.tsx:21` | `picker.png` |

### 1.2 Panel → Temáticas (`/admin-demo/tematicas/`)
- **Modo:** automática por fecha, fija o apagada; interruptor de "Probar temáticas"; "Hoy ve el cliente" y "Próxima por
  fecha".
- **Lista de 12 tarjetas:** gradiente con el *sticker*, rango de fechas, oferta, cantidad de productos, interruptor
  "Habilitada", **Ver** (abre la tienda con la fecha) y **Editar**.
- **Editor (Sheet):**
  - mini vista previa del banner;
  - desde/hasta;
  - titular, bajada y texto de la cinta;
  - cupón (un `select` con los cupones; las condiciones se editan en otra pantalla);
  - productos.
- **No hay:**
  - calendario anual;
  - vista previa en celular y escritorio;
  - resultados (el `usedCount` del cupón existe en los datos y no se muestra);
  - elegir arte o key visual;
  - crear una fecha nueva (lo visual está fijo en código por `SeasonId`);
  - enlace al Estudio para sacar las piezas.

  Captura: `shots/admin-demo_tematicas-1440.png`. Archivos: `src/features/admin/themes/*`.

### 1.3 Regalos
| Paso | Qué hay | Archivo | Captura |
|---|---|---|---|
| Regalar desde la ficha | Botón secundario **"Regalar ahora"**, debajo del primario (en el celular no está en la barra fija) | `ProductDetail.tsx:73` | `g/give-ficha-*.png` |
| Modal "Es para regalar" | Para, De parte de, email opcional, mensaje, **Ocasión** (`select` nativo con 13 opciones) y la vista previa con la bolsa quieta. Dos CTA: "Agregar regalo al carrito" y "Regalar y pagar ahora" | `GiftModal.tsx:94`, `GiftPreview.tsx` | `g/give-modal-filled-1440.png`, `give-390.png` |
| Checkout | "¿Es para regalo?" en el último paso abre el mismo modal. En el resumen: "regalo para Martín" | `CheckoutGift.tsx` | `co-entrega-v.png` |
| Confirmación | "Tu regalo, listo para mandar": código, WhatsApp (solo texto con 🥊), Copiar link o Compartir y "Ver cómo lo recibe" | `GiftShare.tsx:25` | `co-done-v.png` |
| `/regalo/` sin código | Ícono de regalo en un círculo, "¿Te hicieron un regalo?" y un formulario centrado con "Abrir regalo" | `GiftView.tsx:42-53`, `RedeemForm.tsx` | `v-regalo.png` |
| Apertura | Escenario oscuro a pantalla completa (`ImmersiveStage`), titular, consigna ("¡Pegale a la bolsa!"…), bolsa colgando, batería de 5 celdas y "Abrirlo de una vez" después de 6 s. Cada golpe: sacudón, tiza, costura con luz, sonido y vibración. En el 5.º se rompe el paño y sale el pote "Edición regalo" | `GiftOpener.tsx`, `scenes/BoxingBag.tsx` | `gs-a.png`, `gs-1440.png`, `zoom-bags.png` |
| Variantes de bolsa | 13: VOLTA, Madre (flores), Halloween (calabaza musculosa), Cyber (glitch y etiqueta "72 h"), BF ("precio secreto"), Navidad (moño y gorro), Año Nuevo ("2027"), San Valentín (corazón bordado), Vuelta al gym (toalla y "Día 1"), Hot Sale (llamas), Padre (guantes y cinta "PAPÁ"), Amigo ("x2 / spot me"), Verano (sol y anteojos) | `scenes/variants.ts`, `details-*.tsx` | `zoom-bags.png` |
| Revelación | Tarjeta del producto (con la etiqueta "IMAGEN ILUSTRATIVA"), nombre y variante, mensaje en Caveat sobre una tarjeta blanca inclinada, "Sale del local el…", "Guardar en mis regalos", "Conocer VOLTA" y "Abrirlo otra vez" | `GiftCard.tsx` | `gs-reveal.png` |
| Mi cuenta → Mis regalos | Tarjeta con gradiente de la fecha y el ícono de Lucide: "SIN ABRIR · DE LUCÍA / Bolsa con flores bordadas / Tocá y abrilo a golpes". Debajo, "Regalos que hice" con su GiftShare compacto | `AccountGifts.tsx:29` | `g/acct-1440-regalos.png`, `g/acct-390-regalos.png` |

**Modelo de datos:** el regalo es un producto con variante fija (`src/demo/engine/gifts.ts:26-36`). No hay gift card
con monto ni elección de sabor al canjear, las dos aprobadas para R3.

---

## 2. Herencia Velmar (con evidencia)

| Lo heredado | Evidencia en VOLTA | Evidencia en Velmar |
|---|---|---|
| **El sistema completo de temáticas:** piel por fecha con *topper*, 5 decoraciones, cinta, primera diapositiva del carrusel y riel "Ofertas de …" | `skins.ts:6-19`, `ThemeBanner.tsx:24`, `ThemeOffersRail.tsx:15` | `docs/referencia-velmar/tono-visual.md:33-43` |
| **Sombrerito sobre el logo** (gorro, cuernitos, flor) | `ThemeLogo.tsx:6-9`; header de todas las `*-home-*` | idem, "un sombrero para el logo" |
| **Guirnalda** de lamparitas o banderines | `ThemeGarland.tsx` (los "discos" de Padre y Vuelta al gym se leen como luces de Navidad, `sheet-home-1440-b.png`) | `tono-visual.md:78` |
| **La paleta pisa todos los tokens** (la tienda entera rosa, naranja o violeta) | `palettes.ts:4-8`; `sheet-light.png` (Madre en claro: todo rosa pastel; Hot Sale: todo durazno) | `tono-visual.md:47-50` |
| **Aurora + FX + partículas** de fondo, con la excepción a "sin animaciones permanentes" | `ThemeStage.tsx`; en Madre, la flor gigante detrás de la ficha y los cupones (`sheet-cupones.png`, `sheet-ficha.png`) | `tono-visual.md:51-52, 70-77` |
| **Pantalla de carga = escena alrededor del logo**, coreografía por fecha | Amigo: "dos shakers llegan desde los costados y brindan" (`splash/crew.tsx:59-61`) = Velmar "Pancho y Lola llegan desde los costados, chocan la pata". Madre: "aro de batería y florecen flores" = Velmar "una flor que se abre alrededor del logo". Hot Sale: llamas y el descuento, igual que Velmar. Navidad: corona = Velmar "aro dorado" | `tono-visual.md:53-69` |
| **"Probar temáticas" flotante a la izquierda, con Automática/Original, que recarga** | `ThemeTryButton.tsx:9,23`, `ThemePicker.tsx:21` | `tono-visual.md:44-46` |
| **Regalo = escenario oscuro + objeto que se abre a golpes, con progreso, "Abrirlo de una vez" y mensaje en manuscrita sobre papel inclinado** | `GiftOpener.tsx`, `GiftCard.tsx:36` (Caveat, `--tilt:-1.5deg`). Las 5 celdas de batería son los "cinco puntos" de Velmar | `tono-visual.md:137-149`; `regalos-de-prueba.md` (17 escenas; la "caja fuerte" de BF pasó a "bolsa negra") |
| **`/regalo/` como formulario centrado con ícono** | `GiftView.tsx:42-53`, `v-regalo.png` | mismo flujo "Tengo un regalo" en el pie y en el menú |
| **Modal de regalo con "Ocasión" en un `select`** y numeración de Velmar en los comentarios | `GiftModal.tsx:31` y `GiftPreview.tsx:10` ("8.2.16"); `occasion.ts:11` ("una fecha de Velmar") | — |
| **Personaje en el seguimiento** (Lola y Pancho → cadete) | `cadete.png` | `tono-visual.md:116` |
| **Ticket de cupón de la ruleta con el degradé de la fecha** | Club y ruleta | `tono-visual.md:145-147` |
| **Datos de demo "con fecha"** (los mensajes, los pares De → Para y la tabla de códigos tienen la misma forma que Velmar) | `src/demo/fixtures/gifts.ts` | `regalos-de-prueba.md` |

Conclusión: en temáticas y regalos **cambió el dibujo, no la idea**. Cada pieza cumple el mismo rol que en Velmar:
decoración de fiesta sobre una tienda que se repinta.

---

## 3. Problemas de UX/UI

### Temáticas
| # | Problema | Sev. | Evidencia |
|---|---|---|---|
| T1 | **La pieza principal de la campaña dura 4 s.** El banner es la diapositiva 1 de un carrusel que avanza solo. A los 6,5 s de carga, en las 12 fechas, el hero ya muestra "Cargá tu mejor versión" (VOLTA genérico) y la campaña desaparece | **alta** | `sheet-home-1440-a/b.png` (sin reducir movimiento) vs. `sheet-banners-1440.png` (quieto) |
| T2 | **Ninguna campaña muestra producto ni precio en su hero.** Black Friday es una bolsa de compras; Hot Sale, una llama; Padre, un trofeo. El "drop" (los 5 productos) está recién en el segundo pantallazo | **alta** | `sheet-banners-1440.png`, `ThemeBanner.tsx` |
| T3 | **Las 12 fechas son la misma plantilla:** texto a la izquierda, ícono en un aro a la derecha y 4 *stickers* dispersos. Cambian el color y el ícono. Black Friday y el Día de la Madre pesan igual | **alta** | `sheet-banners-1440.png` |
| T4 | **La marca desaparece.** El primario pasa a rosa, naranja o celeste y el voltio queda solo en el logo. En claro, Madre pinta la tienda de rosa pastel y Hot Sale de durazno. El estudio de cada pote toma el color de la fecha (potes sobre fondo rosa) | **alta** | `sheet-light.png`, `sheet-lightcat.png`, `sheet-ficha.png` |
| T5 | **Colores repetidos entre fechas:** Madre ≈ San Valentín (magenta), Halloween ≈ Año Nuevo ≈ Vuelta al gym (violeta), Navidad ≈ Amigo (verde), Cyber ≈ Verano (petróleo). Doce fechas con unas siete familias | media | `sheet-home-1440-*.png`, `palettes.ts` |
| T6 | **Barras arriba en el celular:** demo (3 líneas) + cinta (2–3 líneas) + header + guirnalda = **288 px de 844 (34 %)** en Black Friday. Sin temática son 164 px. La cinta mide 90 px porque se parte en 3 renglones | **alta** | `measure.cjs` → `black-friday {headerBottom:254, ribbonH:90, garlandBottom:288}`; `sheet-home-390-*.png` |
| T7 | **La guirnalda pisa contenido:** los banderines tapan el eyebrow del banner en el celular (Madre, San Valentín, Amigo y Verano) y los títulos "Checkout de demostración", "Mi cuenta" y "Seguimiento". En Padre, la constelación del fondo cruza el H1 | media | `sheet-banners-390.png`, `co-entrega-v.png`, `g/acct-1440-regalos.png`, `sheet-pedido.png` |
| T8 | **Los flotantes tapan contenido:** "Probar temáticas" + WhatsApp tapan el título "Ofertas de…", una opción de entrega del checkout ("Envío al resto del país"), el nombre del primer producto de la categoría y la tarjeta "Mis regalos" en Mi cuenta | media | `v-home390-top.png`, `co-entrega-v.png`, `sheet-lightcat.png`, `cuenta-v.png` |
| T9 | **Insignia que miente en las campañas grandes:** con un cupón con mínimo (BLACK30, HOTSALE30, CYBER25, COMPA5000), la tarjeta del riel muestra "30% OFF" y el precio **sin descuento**, sin la condición. Es justo en Black Friday y Hot Sale | **alta** (conversión y confianza) | `sheet-home2-a.png` (Isolate Zero $72.500 con "30% OFF"); `engine/themes.ts:62-63` + `ThemeOffersRail.tsx:13` |
| T10 | **Las pantallas de carga se ven chicas en escritorio:** la escena ocupa unos 300 px en una pantalla de 1440 × 900, con el resto vacío. "Especial <fecha>" va en mono de unos 9 px. Los textos animados quedan cortados a mitad ("NUEV", "FELICES F") | media | `sheet-splash-1440-*.png`, `zoom-splash.png` |
| T11 | **Probar 12 fechas = 12 recargas con 5 s de pantalla de carga** cada una (más de un minuto solo esperando en una demo de venta). No hay forma de comparar ni recorrerlas solas | media | `ThemePicker.tsx:21` |
| T12 | **Fuera del inicio la fecha solo pinta.** Club, cupones, ficha y seguimiento cambian de color y suman un *sticker* o un gorrito de 20 px. No hay "producto de la campaña" en la ficha, ni cuenta regresiva, ni cupón como ticket | media | `sheet-club.png`, `sheet-cupones.png`, `cadete.png` |
| T13 | **Costo de rendimiento:** la temática suma unos 800–1000 nodos al DOM (4320 → 5137 en BF; 5315 en Navidad, +23 %), además de la aurora, el FX y las partículas en todas las páginas | media | `measure.cjs` |
| T14 | **La pausa de animaciones mide 24 × 24 px** en la cinta (debajo de 44 px para tocar) y su único rótulo es un ícono | baja | `ThemeRibbon.tsx:32` |
| T15 | **El panel es una lista de textos:** no hay calendario, ni vista previa real (celular/escritorio), ni resultados (usos del cupón y ventas), ni piezas para redes. Para el dueño, "Temáticas" = cambiar un titular | **alta** (es la pantalla que vende R3) | `shots/admin-demo_tematicas-1440.png`, `ThemeEditor.tsx` |
| T16 | **El Estudio no usa el arte de la fecha:** el post del Día de la Madre es un fondo rosa con papelitos, sin key visual. Al revés que el banner, sí muestra potes | media | `estudio.png` |

### Regalos
| # | Problema | Sev. | Evidencia |
|---|---|---|---|
| G1 | **`/regalo/` es un formulario centrado con un ícono de Lucide**, con la guirnalda arriba y los flotantes cerca del botón. Es la puerta de entrada de quien recibe y parece un login | **alta** | `v-regalo.png` |
| G2 | **La bolsa es chica y está sola en el vacío.** En 1440 ocupa cerca del 15 % del alto, en un negro sin piso, sin gimnasio y sin luz de estudio. No hay cámara que acompañe, ni zoom, ni cámara lenta en el último golpe. Las proporciones (achatada, unos 1,6:1) la hacen parecer una lata o un farol más que una bolsa pesada (unos 3:1) | **alta** | `gs-1440.png`, `zoom-bags.png` |
| G3 | **Las 13 variantes son *stickers* sobre el mismo cilindro.** El remate es igual en todas: sale el mismo pote "Edición regalo" con rayos | media | `zoom-bags.png`, `gs-reveal.png` |
| G4 | **Revelación incoherente:** el regalo de Black Friday, de Hot Sale o de Navidad se revela sobre el **estudio rosa** del Día de la Madre, porque `ProductArt` toma la paleta de la temática vigente y no la de la ocasión | media | `gs-reveal.png`, `GiftCard.tsx:30` |
| G5 | **La revelación es un "fin", no un momento:** no está "cómo tomarlo", ni "te dura N días", ni "Compartí en tu historia". Aparece la etiqueta "IMAGEN ILUSTRATIVA" en el regalo. El CTA "Conocer VOLTA" lleva al inicio genérico | media | `gs-reveal.png`, `GiftCard.tsx:53-58` |
| G6 | **Lo que se manda por WhatsApp es texto con 🥊 y un link largo en base64.** No hay tarjeta-imagen, ni vista enriquecida (OG) por regalo, ni el diseño de la fecha. Lo más viral del flujo no tiene arte | **alta** | `GiftShare.tsx:25` |
| G7 | **La ocasión se elige en un `select` nativo de 13 opciones.** Es la decisión más emocional y no muestra ni la bolsa ni la tarjeta hasta elegir. En el celular, la vista previa queda debajo del formulario, fuera de la pantalla | media | `give-390.png`, `GiftModal.tsx:94` |
| G8 | **"Regalar ahora" no está en la barra fija de la ficha en el celular.** Hay que bajar para encontrarlo | media | `give-390.png` (1.ª columna) |
| G9 | **Fecha de entrega del pasado:** la confirmación dice "Listo para entregar el lun, 5 oct" (hoy es 12/10) porque usa `DEMO_TODAY`. Los regalos de muestra dicen "23 de octubre" | media (demo) | `co-done-v.png`, `CheckoutView.tsx:64` |
| G10 | **Texto raro cuando se regala a uno mismo:** "Vale, te llegó un regalo de Vale" | baja | `gs-1440.png` |
| G11 | **"Mis regalos" muestra un ícono genérico** en vez de la bolsa o la tarjeta de la ocasión. Lo enviado repite el bloque de compartir, sin estado ("abierto / sin abrir") para quien regaló | media | `g/acct-1440-regalos.png`, `AccountGifts.tsx:29` |
| G12 | **No están las funciones aprobadas:** gift card con monto, elegir sabor o tamaño al canjear y el locker con combinación | (alcance R3) | `engine/gifts.ts:26-36` |
| G13 | **El titular de la apertura queda a la izquierda en 1440 y es chico** frente al vacío. Faltan "De / Para" con peso y la ocasión con nombre de campaña | baja | `gs-1440.png` |

### Calidad del arte SVG (pedido explícito)
- **Lo mejor:**
  - las bolsas, que están bien construidas: cadenas de acero, cuero con degradé, costuras, bordado y etiqueta colgante
    (`zoom-bags.png`);
  - el chip de CyberMonday;
  - el ícono "v2027" de Año Nuevo.

  Están limpios, con buena paleta y coherentes entre sí.
- **Nivel real: íconos y *stickers* de app** (estilo "Fluent emoji"), no key visuals de campaña. Flor con centro de
  pelota, calabaza con bíceps, trofeo, guantes, sol, árbol de discos. **No hay escena, ni producto, ni atleta, ni
  gimnasio, ni luz de estudio.**
- **"Miles de dólares": no.** Una campaña de Nike, Gymshark o MyProtein para Black Friday es el producto como héroe,
  con luz dura, tipografía de póster y el número del descuento gigante. Acá el héroe es un dibujito.
- **Coherencia con el gym:** es parcial.
  - Bien: pesa rusa, discos, barra, guantes y shaker.
  - Ajeno al rubro: banderines, lamparitas de Navidad, flor, corazón, gorro de fiesta, anteojos de sol, calabaza.
    Leen "cumpleaños" o "cotillón".
  - La mitad de los 36 *decor* es de fiesta genérica.

### ¿Lo subiría a Instagram?
Hoy, no.
- **Banner:** no tiene producto ni precio, y es apaisado (no sirve para un post 1:1 ni 9:16).
- **Pantalla de carga:** es chica y dura 5 s.
- **Regalo:** no genera ninguna pieza.
- **Lo que haría que lo suba:**
  1. Un **póster de campaña 4:5 o 9:16 con los potes reales del drop**, el descuento como número de marcador y la
     cuenta regresiva, descargable en un toque desde el panel.
  2. **El video de 6 s del regalo abriéndose** (la bolsa que revienta en cámara lenta y sale *su* producto), generado
     para el que regala y para el que recibe ("Compartí en tu historia").

---

## 4. Oportunidades "wow" (rubro suplementos/gym y dueño)

Marco: **[R]** = rediseño de algo que existe · **[N]** = funcionalidad nueva (aprobada en
`docs/plan-rediseno.md` → "Decisiones", salvo donde dice "consultar").

### Temáticas → "campañas"
1. **[R] Hero de campaña "Drop" fijo, no una diapositiva.** Durante la fecha, el hero del inicio **es** la campaña. Lleva:
   - los 3 potes del drop en un rack bajo un reflector del color de la fecha;
   - un titular de póster;
   - el descuento como número LED gigante ("−30");
   - la **cuenta regresiva** al cierre ("Termina en 02:14:09", sobre todo en Cyber, Hot Sale y BF);
   - el precio por servicio del producto estrella;
   - el CTA "Ver el drop".

   El carrusel desaparece mientras dure. Con "reducir movimiento" queda quieto.
2. **[R] La marca manda y la fecha tiñe.** Se borran la guirnalda, el *topper* y el repintado completo. La fecha pinta:
   - el filo de luz de los módulos;
   - el reflector del hero;
   - la cinta;
   - el halo de la tarjeta del drop;
   - el sello del cupón.

   El fondo sigue en la paleta BOX. El estudio de producto **no cambia de color**: el pote es siempre el pote.
3. **[R] Un "kit de campaña" por fecha, con escena de gimnasio y no dibujito.** Ejemplos:
   - BF: un rack negro mate con etiquetas de precio de acero.
   - Hot Sale: discos al rojo vivo y humo.
   - Vuelta al gym: el box con la persiana subiendo y "DÍA 1" en tiza.
   - Navidad: un árbol armado con discos olímpicos y luces LED voltio.
   - Padre: una barra cargada con "PR" en marcador.
   - Madre: una atleta en silueta de contraluz (corriendo o en pilates) con colágeno y omega.
   - Amigo: dos siluetas en *spot* en el banco.
   - Verano: la costa de Mar del Plata a la madrugada, con alguien corriendo.

   Hay que pedir el arte a un nivel donde la silueta, la luz y el producto cuenten la historia.
4. **[R] Cupón = "ticket de acceso"** con troquel, número de serie y QR decorativo (no funcional). Se copia de un toque
   y se agrega al carrusel de cupones. Si tiene mínimo, la condición va en el ticket y **en cada tarjeta** ("−30 % desde
   $40.000" o "Te faltan $X"). Así se arregla T9.
5. **[R] Pantalla de carga corta y mecánica a pantalla completa:**
   - un golpe de marcador que pasa del número de la fecha al descuento;
   - una persiana de acero que sube;
   - una barra que se carga con discos del color de la fecha.

   Dura 1,5–2 s y nunca 5. El logo queda intacto.
6. **[R] La fecha en toda la compra:**
   - "Parte del drop BF" en la ficha, con la cuenta regresiva en la barra de compra;
   - en el carrito, "Te faltan $4.300 para el −30 %" como barra de carga;
   - en el seguimiento, el pedido "del drop" con su sello.

   Sin pintar todo.
7. **[R] "Probar temáticas" sin recarga → "Modo vitrina".** Desde el menú (no flotante) y desde el panel, "Recorrer las
   12 campañas" pasa las fechas en vivo cada pocos segundos, como un marcador, o con flechas. Es la herramienta de
   venta de Ignacio: el dueño ve las 12 en 40 s.
8. **[N] Panel → "Campañas"** (en R3 está previsto como parte del rediseño):
   - **calendario anual** con las 12 fechas en una línea de tiempo, los huecos sin campaña y "Faltan 41 días para
     Black Friday: armala";
   - el editor con **vista previa doble** (celular y escritorio) del hero real, los productos arrastrables al rack y el
     cupón inline (no "editalo en otra pantalla");
   - **resultados:** usos del cupón, ventas con el cupón y el producto más vendido del drop (con `usedCount` y los
     pedidos de muestra);
   - un botón **"Sacar las piezas para Instagram"** que abre el Estudio con la fecha, el drop y el ticket ya cargados
     (post 1:1, historia 9:16 y carrusel), con el key visual de la fecha.
9. **[N, consultar] "Próxima campaña" fuera de fecha:** en los huecos (por ejemplo, del 4 al 23 de noviembre) una franja
   fina "Black Friday en 12 días · Avisame". Es nuevo: necesita el OK de Ignacio.

### Regalos → "momento"
10. **[R] "Taquilla" en `/regalo/`.** Una boletería de gimnasio o un molinete con el código como **entrada física** (el
    *input* son 8 casilleros tipo display LED, se pega o se tipea) y la luz de la fecha. Al validar, el molinete gira
    y entra a la apertura. Nada de formulario centrado.
11. **[R] La bolsa con calidad de juego:**
    - un **escenario de gimnasio**: piso de caucho con marcas, rack desenfocado al fondo y luz cenital dura con polvo
      de tiza en el haz;
    - una bolsa alta (3:1) con su cadena al techo;
    - la **cámara acompaña**: un empuje leve en cada golpe y un *shake* que crece;
    - un marcador de "fuerza del golpe";
    - el último golpe en **cámara lenta** con la explosión de tiza y la costura que se abre en luz;
    - sale **el producto real** (no un pote genérico), girando bajo el reflector.

    Ocupa el 70 % del alto en el celular y en el escritorio.
12. **[N] Locker con combinación** (aprobado). Una fila de lockers de vestuario y uno con la placa "PARA MARTÍN". Quien
    regala elige la combinación (por ejemplo, la fecha del cumple o "2027") y la pista. Quien recibe gira 3 diales de
    acero con *clic* y vibración. Al abrir: vapor, la luz interior y el regalo en el estante, con una toalla doblada.
    Quien regala elige "Bolsa" o "Locker".
13. **[R] Revelación como "tarjeta de atleta":**
    - el producto real sobre el estudio neutro;
    - **"Cómo tomarlo"** (de la ficha) y **"Te dura N días"**;
    - el mensaje como **nota de tiza en una pizarra** (no papel crema);
    - De → Para con peso;
    - sin la etiqueta "imagen ilustrativa" en primer plano.

    CTA: "Guardá tu regalo", **"Compartí en tu historia"** (pieza 9:16 generada: la bolsa rota, el producto, "Me
    regalaron energía · @tienda") y "Elegí tu sabor" si quedó abierto.
14. **[N] Elegir sabor o tamaño al canjear** (aprobado). Quien regala marca "Que elija el sabor" (o el tamaño dentro del
    mismo precio). Quien recibe elige con las placas de sabor de la ficha (sin precio) y ve "Sale del local el …". El
    pedido queda con la variante elegida.
15. **[N] Gift card con monto** (aprobado):
    - una tarjeta de **placa metálica** ($20.000 / $40.000 / otro) con número tipo LED y el diseño de la campaña;
    - al abrirla, se ve el saldo como **barra de carga**;
    - "Usalo en tu stack" lleva al armador con el saldo aplicado.

    Va en una página **"Regalá energía"** con tres caminos: producto, stack o monto.
16. **[R] Quien regala elige el *diseño* y lo ve tal cual, en grande:**
    - en lugar del `select`, un carrusel de tarjetas (la clásica de la marca, la de la campaña vigente y las de cada
      fecha), con la bolsa o el locker animados;
    - "Probar la apertura" (la misma escena que verá quien recibe);
    - en el celular, la vista previa arriba y fija.
17. **[N] Tarjeta-imagen para WhatsApp:** un PNG 1:1 o 9:16 generado en el navegador con el diseño, "Para Martín ·
    de Caro" y el código. Se comparte con `navigator.share({ files })` y el link va aparte. Como la demo es estática,
    no hay OG por regalo: la imagen compensa.
18. **[R] "Mis regalos" como vestuario:**
    - los recibidos como lockers o bolsas (cerrados o abiertos) con la miniatura real;
    - los enviados con su estado ("Martín todavía no lo abrió" / "Lo abrió el 14/11"), en la demo con
      `opened` del mismo navegador.

### Para el dueño (el "lo necesitaba")
- **Calendario de campañas con números** (punto 8): "En el Hot Sale pasado vendiste 38 isolates" (datos de muestra).
  Es el argumento de venta de R3.
- **Regalos como canal:**
  - en el panel, "Regalos del mes: 12 · 9 abiertos · 4 compraron después";
  - **los regalos en el armado de pedidos**, con su tarjeta impresa (PNG) y "No incluir precio en el remito".

  Los regalos ya existen como pedidos; mostrarlos así es **[N, consultar]**.

---

## 5. Recomendación por fase

| Fase | Qué va de esta área | Esfuerzo |
|---|---|---|
| **R1** (sistema BOX) | Borrar la guirnalda, el *topper* del logo y el flotante "Probar temáticas" (pasa al menú). La cinta de la temática entra al "ticker" ocultable (de 288 a menos de 170 px en el celular, T6, T7 y T8). La paleta de temporada deja de pisar `primary`, `background`, `surface` y `studio`: solo se queda un token `--season-accent` (y quizá `--season-glow`) para filos, halos y cinta (T4). Arreglar T9 ya: la insignia con mínimo dice "−30 % desde $40.000" o muestra la condición | M |
| **R1** | Hero sin carrusel automático (ya está en el plan): en R1 alcanza con que **la campaña no rote** mientras esté vigente (T1). Arreglar la fecha pasada del regalo (G9) y el "Vale → Vale" (G10) | S |
| **R2** (comprar) | El regalo entra en la ficha: "Regalar" en la barra fija del celular (G8). El modal pasa al sistema BOX con el selector de diseño en tarjetas y la vista previa arriba (G7 y punto 16). En el checkout, "¿Es para regalo?" con las mismas placas | M |
| **R3 · campañas** | Plantilla de **hero "Drop"** con el rack de productos, el número LED, la cuenta regresiva y el ticket (puntos 1 y 4). **Key visual de escena para las 12 fechas** (punto 3): conviene hacer primero 4 de referencia (BF, Hot Sale, Vuelta al gym y Navidad), aprobarlas con Ignacio y después las otras 8 con el mismo nivel. Pantallas de carga de 1,5–2 s (punto 5). La fecha en la ficha, el carrito y el seguimiento sin pintar todo (punto 6) | **L** (el arte es lo caro: unos 12 SVG de escena con luz, siluetas y productos) |
| **R3 · panel** | "Campañas": calendario anual, editor con vista previa doble, cupón inline, resultados y "Sacar las piezas" hacia el Estudio con el key visual (puntos 8 y T16). "Modo vitrina" sin recargas (punto 7, T11) | L |
| **R3 · regalos** | La taquilla `/regalo/` (punto 10). La bolsa rehecha con escenario, cámara y cámara lenta (punto 11). El locker (punto 12). La revelación "tarjeta de atleta" con el estudio neutro (G4) y "cómo tomarlo" (punto 13). La historia 9:16 y la tarjeta-imagen para WhatsApp (puntos 13 y 17) | L |
| **R3 · nuevas aprobadas** | Elegir sabor o tamaño al canjear (punto 14: motor `gifts.ts` + UI). Gift card con monto (punto 15: motor de saldo en el engine, tarjeta de placa y aplicación en el carrito y el checkout). La página "Regalá energía" | M + M |
| **R3** | "Mis regalos" como vestuario, con estado para quien regaló (punto 18) | S |
| **R4** (panel) | Regalos y campañas en "Hoy en tu tienda" ("BF arranca en 3 días: revisá el stock del drop", "2 regalos para armar con tarjeta"). Las tarjetas de regalo en Preparación (consultar) | S–M |

**Orden dentro de R3:**
1. Plantilla del hero Drop y ticket, con BF como piloto.
2. Taquilla + bolsa nueva + revelación + historia 9:16, que es lo que hace "wow" en una demo de 2 minutos.
3. Locker y gift card.
4. Las 11 campañas restantes.
5. Panel "Campañas".

**Criterio de aceptación sugerido para el arte:** cada key visual tiene que funcionar **recortado como post 4:5 sin
texto de la UI encima**. Si no lo subirías a la cuenta de la tienda, no está terminado.
