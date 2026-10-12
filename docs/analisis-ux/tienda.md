# Tienda · estructura y descubrimiento (análisis UX/UI)

Área: shell (barras superiores, header, menú de escritorio y celular, barra inferior, pie, flotantes, pantalla de carga,
claro/oscuro), inicio, categorías, listado de categoría, búsqueda (página y buscador superpuesto), tarjeta de producto,
ficha completa, favoritos, FAQ y legales.

Material propio en `analisis/tienda/`:
- `cap/`: capturas de pantalla por pantalla (viewport real, no full-page). Los prefijos son `homeD/homeM` (inicio
  escritorio/celular con Día de la Madre), `*orig` (sin temática), `*light` (modo claro), `pD/pM` (ficha Ionic Whey),
  `catD/catM`, `catsD/catsM`, `searchD/searchM`, `favM`, `faqM`, `termsD`, `megaD`, `menuM`, `searchModal*`,
  `picker*`, `splash*` (en tiempo real), `cardHoverD`, `pGalleryD-*`, `pOvervoltD`, `pCreatinaM`, `homeT` (tablet) y
  `notFoundM`.
- `mont/`: tiras de 4 capturas de celular una al lado de la otra (por ejemplo `mont/homeM-a.png` … `homeM-d.png`,
  `mont/pM-a.png` … `pM-c.png`, `mont/splashM.png`, `mont/menusearchM.png`).
- `scripts/`: los scripts de Playwright (`cap1.cjs` … `cap6.cjs`).

> Ojo con las capturas full-page de `shots/`: del inicio y del pie salen negras porque esas secciones usan
> `content-visibility:auto` (`HomeSections.tsx:24-26`, `Footer.tsx:16`). No es un bug de la tienda: para ver el inicio
> entero usá `tienda/cap/homeD-*.png` y `homeM-*.png`.

---

## 1. Inventario

### Shell (`app/(shop)/layout.tsx:17-28`)
Lo que se apila en cada pantalla de la tienda:

| Pieza | Archivo | Qué hace |
|---|---|---|
| Aviso de demo | `DemoBanner.tsx` | Franja negra: "Demo de venta · No se cobra nada… · Reiniciar demo". En el celular ocupa 3 líneas (~90 px). |
| Cinta de la temática | `ThemeRibbon.tsx` | Promo de la fecha + cupón para copiar + "Ver ofertas" + pausa de animaciones. En el celular, 2 líneas (~65 px). |
| Header | `Header.tsx` | Logo con adorno de la fecha, nav (Tienda ▾, Armá tu stack, Club, Shaker Rush, Ayuda) e íconos (sonido, tema, buscar, favoritos, cuenta, bolsa). Es sticky y se achica al scrollear. En el celular quedan hamburguesa, logo, sonido, buscar y bolsa. |
| Guirnalda | `ThemeGarland.tsx` | Banderines, lamparitas o discos colgando bajo el header (`absolute z-30`). |
| Mega menú | `ShopMenu.tsx` | 10 categorías con miniatura y cantidad, más una tarjeta "Por objetivo". |
| Menú del celular | `MobileMenu.tsx` | Hoja a pantalla completa con las categorías en tipografía display, 7 accesos, el modo claro y la ayuda. |
| Barra inferior | `ShopBottomNav.tsx` | Cápsula de vidrio flotante con Inicio, Categorías, Favoritos, Cupones y Mi cuenta (`bottomBars.ts` decide dónde se muestra). |
| Flotantes | `WhatsAppFab.tsx`, `ThemeTryButton.tsx` | WhatsApp abajo a la derecha y "Probar temáticas" abajo a la izquierda, en todas las pantallas. |
| Pie | `Footer.tsx` | Logo, lema, Instagram, 3 columnas de links, el botón de arrepentimiento, razón social a confirmar y "Ver panel demo". |
| Pantalla de carga | `Splash.tsx`, `app/splash.css` | "Cargando energía": pulso, la V que se arma, batería del 0 al 100 % y envases en órbita, unos 5 s **en cada recarga**. Con temática, cambia el color y suma una escena ("Carga de amor"). |
| Claro/oscuro | `ThemeToggle.tsx` | Arranca en oscuro. El claro es "Tiza", con las bandas noche que siguen oscuras. |

### Inicio (`HomeSections.tsx:39-55`), en orden
1. Carrusel hero: diapositiva de la temática + 3 del panel, flechas, puntos, pausa y avance cada 4 s.
2. Fila de beneficios: cadete en el día, originales, envío gratis, 10 % off.
3. Riel "Ofertas de {temática}".
4. "Comprá por categoría": 10 círculos.
5. "¿Cuál es tu objetivo?": 7 tarjetas de color.
6. "Tu estante, según tu objetivo": mini armador en vivo.
7. Recomendados (riel).
8. Más vendidos "de la semana" (riel).
9. "Ciencia simple": 4 notas.
10. Novedades (riel).
11. Banda del Club: misiones y ruleta.
12. Teaser de Shaker Rush.
13. 4 valores.
14. Pie.

### Catálogo y descubrimiento
- **`/categorias/`**: título enorme, buscador y 10 círculos (`CategoriesGrid.tsx`, `CategoryTile.tsx`). No hay nada más.
- **`/c/[slug]/`**: migas, título, bajada, "N productos", un `select` de orden (relevancia, precio, nuevos) y la
  grilla de tarjetas. No tiene filtros.
- **`/buscar/?q=`**: input, resultados en grilla y, si no hay resultados, un estado vacío con chips de categoría y
  "Lo más elegido".
- **`/buscar/?objetivo=`**: chips de los 7 objetivos y la grilla del objetivo.
- **Buscador superpuesto** (`SearchModal.tsx`): "Lo más buscado", 4 recomendados y resultados en vivo (hasta 6) con
  "Ver los N resultados".
- **Tarjeta** (`ProductCard.tsx`): envase sobre pedestal, sello "Imagen ilustrativa", "Nuevo", oferta de la temática,
  "+ Agregar" (en escritorio aparece al pasar el mouse), marca, nombre, precio "desde", una línea de texto y puntos de
  sabor. Al pasar el mouse muestra una segunda vista (el scoop).
- **Favoritos** (`FavoritesView.tsx`): grilla de tarjetas o un estado vacío.

### Ficha de producto (`ProductDetail.tsx`)
- **Primera parte** (2 columnas en escritorio): galería sticky (estudio, detalle y gimnasio, zoom con el cursor), stock
  con barra, eyebrow de categoría y marca, título, bajada, "+412 vendidos (muestra)", sellos, precio grande, precio con
  transferencia, pastilla de precio por servicio, precio sin impuestos, y la tarjeta para elegir (sabor en muestras,
  tamaño en tarjetas con servicios y $/servicio y la marca "Mejor precio por servicio", cantidad en un `select`). Después,
  tres botones apilados (Agregar, Comprar ahora, Regalar ahora) y la línea de lote y vencimiento.
- **Debajo**:
  - a la izquierda: "Tu día con este suplemento", el rótulo nutricional y 4 acordeones (Descripción, Detalles y medidas,
    Envíos, Preguntas);
  - a la derecha: "Armá tu stack" (3 potes y "Agregar 3"), la calculadora "¿Cuánto te dura?", el chip de misión,
    "¿Cuándo llega?" y 3 sellos de confianza.
- **Al final**: "Sumalo a tu stack", un riel de 4 recomendados.
- **En el celular**: barra flotante con corazón y "Agregar al carrito · $".

### Ayuda y legales
- `/preguntas/`: 6 preguntas en acordeón, "Ver productos" y "Botón de arrepentimiento".
- `/terminos/` y `/privacidad/`: texto plano con un aviso de "Texto de muestra".
- `/arrepentimiento/`: formulario (código, nombre, email, motivo).

---

## 2. Herencia Velmar (con evidencia)

**Dato duro:** casi todo el código de mi área es el de Velmar con cambios de texto y tokens. Medido con
`git diff --numstat 8ba9dd0 HEAD`, donde `8ba9dd0` es "Fase 0: base técnica desde Velmar":

| Archivo | Líneas en Velmar | Cambio hasta hoy |
|---|---|---|
| `CategoryCircles.tsx` | 52 | +1 −1 |
| `CategoriesGrid.tsx`, `CategoryTile.tsx`, `PageHeader.tsx`, `FaqList.tsx` | — | **sin un solo cambio** |
| `HeroCarousel.tsx` | 80 | +4 −3 |
| `SearchModal.tsx` | 99 | +6 −6 |
| `ShopMenu.tsx` | 58 | +5 −5 |
| `MobileMenu.tsx` | 50 | +5 −3 |
| `ClubBand.tsx` | 36 | +6 −5 |
| `Values.tsx` | 23 | +6 −6 |
| `BenefitsBar.tsx` | 27 | +7 −6 |
| `ProductStories.tsx` | 45 | +8 −8 |
| `ProductAccordions.tsx` | 35 | +4 −3 |
| `ShopBottomNav.tsx` | 42 | +7 −4 |
| `Footer.tsx` | 51 | +13 −12 |
| `ProductCard.tsx` | 99 | +18 −12 |
| `Header.tsx` | 80 | +22 −19 |
| `Button.tsx` | 36 | +3 −3 |

Lo que se hizo nuevo, y por eso no se ve Velmar: la ficha de suplemento (`ConfigureCard`, `NutritionFacts`,
`ServingCalculator`, `UsageTimeline`, `StackOffer`, `SupplementFacts`), `GoalRail`, `HomeStackBlock`, `GameTeaser` y la
librería de envases.

### Estructura y patrones heredados tal cual
| Qué | Evidencia | Por qué delata a Velmar |
|---|---|---|
| Esqueleto del inicio: carrusel, beneficios, círculos, rieles, historias, novedades, banda del club y valores | `docs/referencia-velmar/rutas-y-flujo.md:189` contra `HomeSections.tsx:39-55` | Es el mismo orden. Solo se cambió el probador "LiveCustomizer" por objetivos y stack (diff de `HomeSections`). |
| Carrusel centrado con flechas redondas, puntos, pausa y avance cada 4 s | `HeroCarousel.tsx:13,64-76`; `cap/homeDorig-00.png` | Velmar: "carrusel del inicio, que avanza cada 4 s… botón de pausa" (`referencia-velmar/tono-visual.md:104-105`). |
| Categorías como círculos con la pieza más vendida | `CategoryCircles.tsx:36` (`rounded-full`); `cap/homeDlight-01.png` | El comentario del código dice "como en cualquier tienda". En `/categorias/` (`cap/catsD-00.png`) es lo único que hay. |
| "Ciencia simple" es "Productos que cuentan historias" | `ProductStories.tsx` (+8 −8); `cap/homeD-05.png`, `homeD-06.png` | Mismo componente: tarjeta redonda `rounded-[2rem]`, kicker en pastilla y flecha en círculo que gira 45°. |
| Banda del club con el **mismo titular** | `ClubBand.tsx:24` contra `git show 8ba9dd0:src/features/home/ClubBand.tsx:23` | "Cada compra suma. *Cada misión, un regalo.*" está textual de Velmar; solo cambió `text-brass` por `text-volt`. |
| "Más vendidos *de la semana*" | `HomeSections.tsx:50` | En Velmar era "Más vendidos *del taller*": mismo formato de titular con acento en itálica. |
| Valores en 4 celdas con ícono | `Values.tsx`; `cap/homeD-08.png` | Misma grilla con divisores de 1 px y `rounded-[2rem]`. |
| Mega menú: grilla de categorías + tarjeta noche a la derecha | `ShopMenu.tsx:35-51`; `cap/megaD.png` | En Velmar la tarjeta era "Personalizador · Mirá tu pieza antes de pagar". Ahora es "Por objetivo", pero vacía (ver problemas). |
| Menú del celular a pantalla completa con categorías en display y entrada escalonada | `MobileMenu.tsx`; `mont/splashMorig.png` (4.º panel) | Idéntico al de Velmar. |
| Barra inferior "cápsula flotante de vidrio" | `ShopBottomNav.tsx:18,25`; `bottomBars.ts:16-21` | Velmar: "Cápsula flotante de vidrio con Inicio, Categorías, Favoritos, Cupones y Mi cuenta" (`rutas-y-flujo.md:201`). Mismas 5 pestañas. |
| Buscador superpuesto con recientes, "Lo más buscado" y recomendados | `SearchModal.tsx`; `cap/searchModalD-whey.png` | Patrón y layout de Velmar (`rutas-y-flujo.md:190`). |
| Header de vidrio que se compacta, sonido y sol/luna en el header | `Header.tsx:55-77` | Velmar (`tono-visual.md:97`). Un botón de sonido en el header de una tienda es una decisión heredada. |
| WhatsApp flotante y "Probar temáticas" flotante | `WhatsAppFab.tsx:24`; `ThemeTryButton.tsx:23` | Velmar: "botón flotante a la izquierda; WhatsApp queda a la derecha" (`tono-visual.md:44`). |
| Pantalla de carga de 5 s en **cada recarga**, sin botón "Saltar" | `Splash.tsx:27`; `mont/splashM.png` | Pedido de Ignacio para Velmar (`referencia-velmar/tono-visual.md:93-96`). Cambió el dibujo, no el concepto ni la duración. |
| Tarjeta: segunda vista al pasar el mouse, "agregar rápido" al pasar el mouse, puntos de color y "desde $" | `ProductCard.tsx:52-90`; `cap/cardHoverD.png` | Tarjeta de producto decorativo: los puntos de **color** ahora son sabores. No aparece ningún dato de suplemento. |
| Sello "Imagen ilustrativa" en cada tarjeta y en la galería | `ProductArt.tsx:55`; todas las grillas | Velmar no tenía fotos (`referencia-velmar/tono-visual.md:21-22`). En una grilla de 4 se repite 4 veces. |
| Ficha: galería con miniaturas a la izquierda, zoom con el cursor y la imagen que "vuela" desde la tarjeta | `ProductGallery.tsx`; `referencia-velmar/tono-visual.md:125-127` | Igual que Velmar. |
| Ficha: "Comprar ahora" + "Regalar ahora" debajo del agregar y la barra flotante con corazón y "Agregar · total" | `ProductDetail.tsx:69-77,135-141` | `rutas-y-flujo.md:193` y 8.2.7 de Velmar. |
| Ficha: acordeón "**Detalles y medidas**" con cm × cm × cm y gramos "con caja" | `ProductAccordions.tsx:22-25` | Medidas de una pieza de madera. Para un pote de whey no tiene sentido. |
| Ficha: "¿Cuándo llega?" con el calendario | `DeliveryEstimate.tsx` | Era el plazo del **taller** de Velmar. |
| Ficha: confianza con "Botón de arrepentimiento" como argumento de venta | `ProductDetail.tsx:30` | Fila heredada. Un dueño de suplementería no vende con "botón de arrepentimiento". |
| "Hecho a pedido · N días" como nota de stock | `catalog/mappers.ts:8`; `ProductAccordions.tsx:24` ("Por encargo: llega al local…") | Lenguaje de producción artesanal. |
| `PageHeader`: migas + título gigante + bajada gris en todas las páginas internas | `PageHeader.tsx` (sin cambios) | Mismo encabezado en categorías, buscar, favoritos, FAQ y legales. Ninguna página interna tiene identidad propia. |
| FAQ en una tarjeta con acordeones | `FaqList.tsx` (sin cambios); `cap/faqM-00.png` | Igual que Velmar. |
| Pie: lema en display + 3 columnas + arrepentimiento en pastilla | `Footer.tsx` | Mismo layout, con "Energía de verdad, con lote y vencimiento" en lugar del lema de Velmar. |

### Formas y decoración
- **Redondez:** `rounded-full` aparece 261 veces y `rounded-[2rem]`/`[2.5rem]`/`[1.75rem]`/`2xl`/`3xl` 383 veces en `src` y
  `app`. Hero `rounded-[2rem]`, `--radius-card: 1.25rem`, botones pastilla (`Button.tsx:9`), chips pastilla y flechas
  circulares. Es el lenguaje "suave" de Velmar que señala `plan-rediseno.md`.
- **Guirnalda + adorno sobre el logo + pintar toda la tienda** con la fecha: `ThemeGarland.tsx`, `ThemeLogo.tsx` y
  `palettes.ts`. En la ficha del Día de la Madre el **"Agregar al carrito" sale rosa** (`cap/pD-01.png`, `mont/pM-a.png`).
- **Itálica de acento en los titulares** ("de la semana", "tu stack", "Cada misión, un regalo"): recurso editorial de
  Velmar (Fraunces itálica), trasladado a Archivo.

---

## 3. Problemas de UX/UI

### Alta
1. **El botón "+ Agregar" de la tarjeta no agrega: lleva a la ficha.** En la tarjeta, el link del nombre se estira con
   `after:absolute after:inset-0` (`ProductCard.tsx:72`). El botón tiene `z-10` (`ProductCard.tsx:62-66`), pero al pasar
   el mouse `motion.css:29` le pone `transform: translateY(-4px)` a la caja de la imagen, y al tocar `motion.css:30` le
   pone `scale(.985)`. Esos `transform` crean un contexto de apilamiento, el `z-10` queda encerrado ahí y el `::after`
   del link queda arriba.
   - Lo verifiqué con `scripts/cap5.cjs`:
     - en 1440, el punto central del botón es el link y el clic navega a `/p/ionic-whey/`;
     - en 390, el toque también termina en la ficha, sin carrito abierto.
   - Pasa en el inicio, las categorías, la búsqueda y favoritos. Ningún e2e lo cubre: los tests usan "Agregar al
     carrito" de la ficha.
   - Es conversión pura y en una demo frente al dueño se ve "roto".
2. **En el celular, la tienda no respira.**
   - Arriba: aviso de demo (3 líneas), cinta de la temática (2 líneas), header y guirnalda. El header termina en
     **228 px de 844 (27 %)**, medido con `cap3.cjs`.
   - Abajo: la barra inferior desde 768 px, con "Probar temáticas" y WhatsApp encima.
   - Queda ~**64 % de pantalla** para el contenido (`mont/homeM-a.png`, 1.er panel).
3. **En la ficha del celular, el nombre del producto no se ve en la primera pantalla.** El `h1` arranca en **880 px**
   con un viewport de 844 (`cap3.cjs`; `mont/pM-a.png`; también sin temática en `cap/pCreatinaM.png`). El primer
   pantallazo es solo la imagen, sin nombre, precio ni precio por servicio.
4. **La guirnalda pisa los títulos y las migas.** Es `absolute z-30` bajo el header (`ThemeGarland.tsx:37`) y tapa:
   - "Inicio > Proteínas" (`mont/pM-a.png`, `catM.png`);
   - los `h1` "Todas las categorías", "Buscar", "Favoritos" y "Preguntas frecuentes" (`mont/pM-c.png` 3.er panel,
     `searchM.png`, `favfaqM.png`);
   - "Términos y condiciones" (`mont/desk-misc.png`).
5. **Los flotantes tapan contenido en todas las pantallas** (`WhatsAppFab.tsx:24`, `ThemeTryButton.tsx:23`). Ejemplos:
   - el título de "Originales, con lote" en escritorio (`cap/homeD-08.png`, se lee "ales, con lote");
   - los "+" de las tarjetas y los chips de objetivo en el celular (`mont/homeM-a.png`, `homeM-b.png`);
   - el botón "Agregar 3 al carrito" del stack (`mont/pM-a.png`, 3.er panel).
6. **"Recomendados" y "Más vendidos" muestran exactamente los mismos productos** (Creatina, Ionic Whey, Barra,
   Overvolt; `cap/homeD-03.png` y `homeD-04.png`).
   - Con el carrito vacío, `recommendForCart` ordena por `soldCount` (`src/demo/engine/recommend.ts:37`), igual que
     `bestSellers`.
   - El comentario de `HomeSections.tsx:36` dice que excluye los más vendidos, pero no lo hace.
   - Dos rieles iguales seguidos son la prueba de catálogo "de relleno".
7. **El dato que vende un suplemento no aparece donde se elige.**
   - La tarjeta no muestra precio por servicio, servicios, proteína por servicio, sellos (vegano, sin TACC) ni stock
     (`ProductCard.tsx:69-90`).
   - En la ficha, el $/servicio es una pastilla mono de 12 px (`SupplementFacts.tsx:31`) y el "te dura N días" está a
     3 pantallas de distancia (calculadora).
   - El listado no ordena por $/servicio (`CategoryProducts.tsx:11-16`) ni tiene filtros.
8. **La ficha se contradice con el inicio y la FAQ sobre la entrega.**
   - Beneficios (`BenefitsBar.tsx:10`) y FAQ (`content.ts:10`) dicen "Cadete en el día antes de las 14 h".
   - La ficha dice "Lo despachamos el lunes, 5 de octubre · sale al día hábil siguiente" (`cap/pD-02.png`).
   - Además usa `DEMO_TODAY = "2026-10-04"` (`admin-orders.ts:6`), mientras la temática se elige con la fecha real. Hoy
     (12/10) la ficha promete una fecha **pasada**.

### Media
9. **Pantalla de carga de 5 s en cada recarga** (`mont/splashM.png`). Rinde para el primer "wow", pero en la demo
   Ignacio va a recargar muchas veces y el dueño lo vive como lentitud. En el Día de la Madre dice "Carga de amor", con
   flores y corazones: decoración de fiesta, no de box.
10. **La ficha de escritorio es larga, despareja y repetida** (`cap/pD-01.png` … `pD-05.png`).
    - Tres CTA del mismo ancho apilados: Agregar, Comprar ahora y Regalar ahora (`ProductDetail.tsx:69-77`).
    - El stack aparece dos veces: la tarjeta "Armá tu stack" y el riel "Sumalo a tu stack".
    - La columna izquierda termina mucho antes que la derecha y deja un hueco grande junto a "¿Cuándo llega?".
    - El link "Ver Creatina monohidrato micronizada" cuelga suelto bajo el stack (`StackOffer.tsx:72`).
11. **El inicio es largo y sin jerarquía:** 13 bloques, 7665 px en el celular y 5131 nodos en escritorio.
    - Hay 4 rieles de tarjetas iguales (ofertas, recomendados, más vendidos, novedades).
    - El dato fuerte (stack en vivo) recién aparece en el 6.º bloque.
    - El inicio **no tiene `h1`** (`cap6.cjs`): accesibilidad y SEO.
12. **Las categorías y objetivos se ven todos iguales.**
    - Los círculos y el mega menú muestran casi siempre el mismo pote negro de VOLTA Lab (`cap/megaD.png`,
      `homeDlight-01.png`).
    - Algunos objetivos muestran un producto que no los representa: "Salud" con una barra proteica y "Recuperación"
      con la whey.
    - Con 7 objetivos en 4 columnas queda un hueco (`GoalRail.tsx:26`, `cap/homeDlight-01.png`).
13. **`/categorias/` es una página casi vacía:** 10 círculos de ~100 px en una fila y después nada (`cap/catsD-00.png`).
    No sirve para descubrir: no hay subtipos ni marcas, tampoco "desde $/servicio" ni objetivos.
14. **El listado de categoría no tiene filtros** (objetivo, marca, sabor, sellos, sin cafeína) y el orden no incluye "más
    rendidor" (`CategoryProducts.tsx`). Con 25 productos no se nota. Con el catálogo real de una suplementería (200–600
    SKU) es inusable, y el dueño lo va a preguntar.
15. **La búsqueda falla con lo que la gente escribe de verdad.** "proteina vegana sin tacc" da **cero resultados**
    (`mont/menusearchM.png`, 4.º panel), aunque existe "Proteína vegana arveja + arroz" con los sellos vegano y sin TACC.
    - `searchProducts` exige que **todos** los términos coincidan (`search.ts:64-70`);
    - no indexa `badges` (`search.ts:58-61`);
    - no ignora palabras vacías ("sin", "de").
    - "Lo más buscado" incluye "alfajor proteico" (`SearchModal.tsx:18`).
16. **El mega menú tiene errores chicos que se notan** (`cap/megaD.png`):
    - dice "**1 productos**" (`ShopMenu.tsx:41`);
    - la tarjeta "Por objetivo" es un bloque negro grande con un solo link, que encima lleva a "Masa muscular" y no a
      los objetivos (`ShopMenu.tsx:47`).
17. **"+ Agregar" agrega en silencio la primera variante con stock** (`useQuickAdd.ts:11`), por ejemplo chocolate 2 lb.
    En suplementos el sabor importa: sin preguntar genera devoluciones y fricción.
18. **El pie no tiene lo que busca un comprador local:** dirección, horarios, zona del cadete, medios de pago y WhatsApp.
    "Botón de arrepentimiento" aparece dos veces en el pie y otra vez en la ficha (`Footer.tsx:11,41`).
19. **El header del celular** gasta un lugar en el botón de **sonido** (`Header.tsx:69`), mientras favoritos, cuenta y
    tema quedan escondidos. La búsqueda es un ícono más: no es protagonista, como pide el plan.
20. **La temática repinta el primario.** Los CTA de compra, los "+" y los acentos de los titulares pasan a rosa
    (`cap/pD-01.png`, `mont/homeM-b.png`): se pierde la marca justo en el botón que vende.

### Baja
21. En el celular, "Ver todas" / "Ver todo" se parten en dos líneas junto al título (`mont/homeM-a.png`, 2.º panel;
    `homeM-c.png`).
22. Los resultados del buscador cortan los nombres ("Creatina monohidra…") y no muestran $/servicio ni sabores
    (`mont/menusearchM.png`).
23. El 404 no tiene header ni pie y es la única pantalla rosa sin contexto (`cap/notFoundM.png`). Le falta una búsqueda.
24. FAQ: 6 preguntas genéricas, sin buscar ni agrupar, con mucho espacio vacío en escritorio (`shots/preguntas-1440.png`).
    Las legales son texto plano correcto: no molestan, pero no suman.
25. "+412 vendidos (muestra)" en la ficha: el "(muestra)" le baja el precio de percepción. Alcanza con el aviso global
    de demo.
26. Favoritos es una grilla igual a la de categoría (`mont/favfaqM.png`). No hay total, ni "agregar todo", ni "armar
    stack con estos".
27. Modo claro "Tiza": correcto y AA. Mezcla tarjetas blancas con bandas noche en casi todas las secciones
    (`cap/homeDlight-*.png`) y se siente como dos sitios. El hero queda negro en los dos modos, y está bien.

---

## 4. Oportunidades "wow" (rubro suplementos/gym y dueño)
[R] = rediseño de algo que existe · [N] = funcionalidad nueva (la marco si necesita el OK de Ignacio).

### Shell
- **[R] Header de una línea + ticker**: la franja de arriba rota tres mensajes como un marcador LED: "DEMO",
  "MAMA15 −15 %" y "Cadete hoy: pedí en 2 h 14 min y llega hoy". Se oculta con una ✕. En el celular ocupa 28 px en lugar
  de 155.
  - El reloj del cadete sale de `delivery.ts` + `workshop.settings`, que ya existen.
  - Hay que unificar la fecha: real o `DEMO_TODAY`, pero la misma en toda la tienda.
- **[R] Búsqueda protagonista**:
  - en escritorio, una barra ancha en el header ("¿Qué entrenás hoy? whey, creatina, pre…");
  - en el celular, un botón grande en el centro del dock;
  - al abrir: chips de objetivo, de sello (vegano, sin TACC, sin cafeína) y de sabor, más resultados con **$/servicio**
    y "+".
- **[R] Dock del celular**: Inicio · Tienda · **Buscar** (centro, elevado) · Stack · Bolsa con el total. WhatsApp pasa al
  menú, a la ficha ("Preguntale al local") y al pie, y "Probar temáticas" va al menú. Sin flotantes.
- **[R] Pie como "ficha técnica del local"**: tabla mono con dirección, horario, zona y horario del cadete, medios de
  pago, CUIT y WhatsApp, más un mapa SVG de Mar del Plata con la zona del cadete. Así se ve que la herramienta es para un
  **local real**.
- **[R] Pantalla de carga de ~1,2 s** ("la placa encastra y se prende la luz"), solo la primera vez de la sesión. Las
  recargas entran directo y el wow queda en el hero.

### Inicio
- **[R] Hero "el rack bajo el reflector"**:
  - el producto estrella en un estante con luz;
  - un titular de póster;
  - la tira de datos en vivo en números LED: $/servicio, g de proteína por servicio, stock y "llega hoy si pedís
    antes de las 18 h";
  - los destacados cambian como un marcador (flip), sin flechas.
- **[N, chico] Calculadora de proteína en el inicio**: "Pesás 75 kg y querés ganar masa → 120–165 g por día → con 1 scoop
  de Ionic Whey cubrís el 20 %; tu stack sugerido…". Usa el motor que ya tiene `ServingCalculator` y lleva al armador. Es
  la herramienta que el dueño hoy hace a mano por WhatsApp. Pedir el OK porque es un bloque nuevo, aunque reutiliza
  lógica.
- **[R] "Entrená por objetivo" con siluetas de atleta**: 6 o 7 paneles altos, cada uno con **su** producto
  representativo, que se configura en el panel. No el más vendido genérico.
- **[R] Categorías como rack**: estantes con 3 potes reales por categoría y el rótulo "desde $ 1.230/servicio · 3
  marcas". Reemplaza los círculos del inicio y de `/categorias/`.
- **[R] "El más elegido del box"** en lugar de dos rieles iguales: una tabla de posiciones (#1–#5) con ventas de la
  semana, ▲▼ contra la semana anterior y $/servicio. "Recomendados" pasa a ser realmente para vos: lo que completa tu
  carrito o tu objetivo.
- **[R] "Ciencia simple" → "Laboratorio"**: notas como fichas de laboratorio (número de ensayo, dato mono y "lo que dice
  la evidencia"), sin tarjetas redondas.

### Tarjeta, listado y búsqueda
- **[R] Tarjeta = "ficha de rack"**:
  - pote, marca, nombre;
  - **$/servicio en grande** y precio total chico;
  - "30 serv · 24 g prot";
  - sellos en íconos;
  - el stock como 3 luces (verde, ámbar, rojo);
  - el sabor como "4 sabores";
  - "+" que abre una hoja rápida de **sabor y tamaño** antes de agregar.
  - Sin "Imagen ilustrativa" por tarjeta: un solo aviso global de demo.
- **[R] Listado con panel de filtros "de máquina"** (objetivo, marca, sabor, sellos, rango de $/servicio) y orden
  **"Más rendidor"** y "Más proteína por $". Está en el plan R2; el motor necesita `pricePerServing` en `sortProducts`.
- **[R/engine chico] Búsqueda que entiende el rubro**:
  - indexar sellos, sabores y servicios;
  - ignorar palabras vacías;
  - coincidir por mayoría de términos en lugar de todos;
  - sinónimos ("pre" → pre-entreno, "proteína" → whey/isolate/vegana, "colágeno").
  - Es solo el motor (`search.ts`) y sus tests.
- **[N, con OK] "Verificá tu lote"**: un campo en el pie y en la ficha ("Ingresá el lote de tu pote") que muestra la marca,
  el vencimiento y "Original vendido por {tienda}". En Argentina las falsificaciones de suplementos son un tema real, y
  para el dueño es su mejor argumento de "100 % originales". Los lotes ya existen en el motor (`lots.ts`).

### Ficha
- **[R] Primer pantallazo = hoja técnica** en el celular (todo antes del pliegue): imagen chica a la izquierda y nombre,
  marca y sellos a la derecha. Abajo, un **panel de marcador**:

  | $/servicio | g prot/serv | servicios | te dura |
  |---|---|---|---|
  | $ 1.830 | 24 g | 30 | 30 días |

  Después, el selector de sabor y tamaño como placas, y la barra fija con "Agregar · $ 54.900 · $ 1.830/serv".
- **[R] Un solo CTA principal.** "Comprar ahora" pasa a link secundario y "Regalar" a un ícono o chip "🎁 Es para
  regalo". Un solo bloque de stack. El riel final pasa a ser "Comparalo con…" (alternativas de la misma categoría con su
  $/servicio).
- **[R] Lote y vencimiento como etiqueta de laboratorio** junto al precio: código, vence 06/2027, FEFO "sale primero el
  que vence primero". Hoy está escondido en una línea gris.
- **[R] Sacar "Detalles y medidas"** (Velmar) y la confianza "Botón de arrepentimiento". En su lugar: "Cómo tomarlo",
  "Combina con" y "Preguntale al local" (WhatsApp con el producto, el sabor y el tamaño ya escritos).
- **[N aprobado, R2] Comparador**: botón "Comparar" en la tarjeta y en la ficha, con una bandeja abajo hasta 3 productos.

### Favoritos y ayuda
- **[R] Favoritos → "Mi rack"**: los favoritos en un estante, con el total, "Agregar todo", "Armar stack con estos" (el
  descuento se ve en vivo) y "Te dura N días" por pote.
- **[N, con OK] "Avisame si baja o si vuelve"** en favoritos y en "sin stock". Se guarda local, como los avisos de
  recompra.
- **[R] Ayuda del box**: FAQ agrupada (pagos, envíos, originales, cómo elegir) con buscador, el botón "Preguntale al
  local" y guías cortas ("¿Whey o isolate?", "¿Creatina todos los días?").

### Para el dueño
- **[N, con OK] "Modo dueño" en la tienda**, para el kit de venta: un interruptor (solo en la demo) que marca con un
  punto voltio cada cosa que se edita desde el panel. Por ejemplo: "este precio y su $/servicio salen de la lista del
  proveedor", "este lote vence en 60 días: liquidalo", "este hero lo cambiás en Contenido". Muestra en 10 segundos que
  la tienda la maneja él, y es el puente al "esto es lo que necesitaba".

---

## 5. Recomendación priorizada (R1–R4)

**Antes de R1 (arreglos que hoy restan en cualquier demo, S en total):**

| # | Qué | Esfuerzo |
|---|---|---|
| a | Arreglar el "+ Agregar" de la tarjeta: `isolation:isolate` o `z-index` en la caja de la imagen, o sacar el `transform` de `motion.css:29-30`, y sumar un e2e de agregar rápido en escritorio y celular. | S |
| b | Que "Recomendados" excluya los más vendidos (o sacar un riel). | S |
| c | Unificar la fecha de la tienda (cadete y entrega contra temática) y el mensaje "en el día" contra "día hábil siguiente". | S |
| d | Corregir "1 productos" y el link del menú "Por objetivo". | S |
| e | Agregar el `h1` del inicio. | S |

**R1 · Sistema "BOX", shell e inicio (mi área)**

| Qué | Esfuerzo |
|---|---|
| Shell: header de una línea + ticker ocultable (aviso de demo + cupón + reloj del cadete); fuera los flotantes; dock del celular con Buscar al centro; "Probar temáticas" al menú; pie "ficha técnica del local"; sacar el sonido del header del celular. | M |
| Pantalla de carga corta (~1,2 s), solo la primera vez de la sesión. La guirnalda y el adorno del logo se borran ya (lo pide R1: "Se borra"). | S |
| Inicio rehecho: hero rack con tira de datos LED, objetivos con su producto asignado, categorías como rack (también en `/categorias/`), "El más elegido del box" en tabla, el stack en vivo más arriba, y fuera Valores y "Ciencia simple" redonda (o rehecha como "Laboratorio"). Máximo ~8 bloques. | L |
| Tarjeta "ficha de rack" ($/servicio grande, servicios, sellos, luces de stock, hoja de sabor al agregar) y un solo aviso de "imagen ilustrativa". | M |
| Búsqueda protagonista (barra en el header y buscador superpuesto con chips de objetivo, sello y sabor) + motor que entiende el rubro (sellos, palabras vacías, sinónimos, coincidencia parcial). | M |
| Que la temática no repinte el primario ni los CTA: solo acentos. Va en el sistema de tokens de R1 aunque el arte de cada fecha sea de R3. | S |

**R2 · Comprar**

| Qué | Esfuerzo |
|---|---|
| Ficha "hoja técnica": marcador arriba del pliegue en el celular, un CTA, lote como etiqueta, sin "Detalles y medidas" ni confianza heredada, un solo bloque de stack y el riel "Comparalo con…". | L |
| Listado con filtros de máquina y orden "Más rendidor" / "Más proteína por $" (motor: ordenar por $/servicio). | M |
| Comparador (aprobado). | L |
| Favoritos → "Mi rack" (total, agregar todo, armar stack). | M |
| Ayuda del box (FAQ agrupada y con buscador, "Preguntale al local") y legales con el sistema nuevo. Estado vacío y 404 dentro del shell. | S |
| A confirmar con Ignacio: "Avisame si baja o vuelve" y "Verificá tu lote". | M c/u |

**R3 · Temáticas y regalos (lo que toca mi área)**

| Qué | Esfuerzo |
|---|---|
| Que la fecha tiña el ticker, el borde del hero y la luz del rack, nunca los títulos ni los botones. Pantalla de carga de la fecha corta y sin tapar el logo. | M |
| "Regalar" en la ficha como chip que lleva al flujo nuevo de regalos (lo diseña el área de regalos). | S |

**R4 · Panel + kit de venta**

| Qué | Esfuerzo |
|---|---|
| "Modo dueño" en la tienda, con puntos editables enlazados al panel (si Ignacio lo aprueba). | M |
| Capturas nuevas de la tienda para el guion y el manual. | S |

**Orden sugerido dentro de R1:**
1. Shell, porque destraba el espacio en el celular.
2. Tarjeta, porque se reutiliza en todo.
3. Búsqueda.
4. Inicio.

La ficha queda para R2, pero el "primer pantallazo" de la ficha tiene que estar en los prototipos de la dirección
visual (el plan ya lo pide).
