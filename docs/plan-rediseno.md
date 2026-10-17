# Plan de rediseño UX/UI · 4 fases (R1–R4)

Pedido de Ignacio (12/10/2026): la demo funciona, pero **se parece mucho a Velmar**. El objetivo:
- que todo sea distinto, más gimnasio y más suplementos;
- que se vea "de miles de dólares";
- que el dueño de una tienda de suplementos diga **"esto es lo que necesitaba para mi negocio"**;
- una fase solo para temáticas;
- regalos mucho mejores.

Este plan se apoya en un **análisis completo** de toda la web: 50 rutas en celular y escritorio, estados
interactivos, las 12 temáticas, los 13 regalos, las 30 pantallas del panel y un benchmark del mercado. Los informes
están en [`analisis-ux/`](analisis-ux/README.md).

Se suma a `plan-por-fases.md`: las Fases 0–8 quedan como base funcional y R1–R4 rehacen la experiencia. Las reglas no
cambian: demo estática, lógica en el engine, AA, 375 px, "reducir movimiento" y arte SVG propio.

---

## 1. Qué encontró el análisis

### Cuánto de Velmar queda (medido contra el commit de Fase 0, `8ba9dd0`)
- **Estructura y descubrimiento de la tienda:** casi todo el código es el mismo con otros textos. Sin un solo
  cambio: `CategoriesGrid`, `CategoryTile`, `PageHeader` y `FaqList`. Con 1 a 8 líneas cambiadas: `CategoryCircles`,
  `HeroCarousel`, `SearchModal`, `ShopMenu`, `ClubBand` y `ProductStories`.
- **Del carrito al seguimiento:** el checkout tiene 12 líneas cambiadas de 453. El carrito, la confirmación, el
  seguimiento, la cuenta, los cupones y el club son Velmar con colores nuevos.
- **Textos de Velmar palabra por palabra:**
  - "Comprás, sumás, ganás.";
  - "Cada compra suma. Cada misión, un regalo.";
  - "Todo lo tuyo, en un lugar.";
  - "Camino de premios";
  - "Detalles y medidas" en cm;
  - "Hecho a pedido";
  - los cupones FERIA2000 e INVIERNO.
- **Panel:** `docs/referencia-velmar/panel-demo.md` lo describe casi línea por línea. Tiene el mismo menú de 21
  entradas, el inicio de KPIs sueltos (el componente todavía se llama `WorkshopStrip`) y la "cola de producción" con
  otras etiquetas. Costos e insumos siguen siendo recetas y materiales de taller, y el producto sigue con precio base
  más recargo.
- **Temáticas:**
  - la fecha **decora y repinta** la tienda: guirnaldas, adorno sobre el logo, todos los colores pisados (el Día de la
    Madre deja la tienda rosa);
  - las 12 fechas usan la misma plantilla: texto, ícono en un aro y 4 stickers;
  - el arte está en nivel *sticker* de app, sin escena, sin producto, sin atleta y sin luz de estudio.
- **Regalos:**
  - `/regalo/` es un formulario centrado con un ícono;
  - la bolsa es chica y achatada y cuelga en un vacío negro;
  - las 13 variantes son stickers sobre el mismo cilindro;
  - el regalo no genera ninguna pieza para compartir.

### Lo que hoy rompe una demo (urgente)
- **Comprar desde la tarjeta no anda:** el "+ Agregar" lleva a la ficha en lugar de agregar. El link del nombre queda
  por encima del botón por un `transform` en `motion.css:29-30`, y ningún e2e lo cubre.
- **"Recomendados" y "Más vendidos" muestran los mismos 4 productos** (`recommend.ts:37`).
- **Fechas contradictorias:**
  - la ficha promete "lunes 5 de octubre, día hábil siguiente" y el inicio "cadete en el día";
  - el seguimiento tiene una entrega escrita a mano para el 8–9 de octubre;
  - la confirmación del regalo da una fecha pasada.
- **Insignias engañosas en las campañas grandes:** "30 % OFF" sin el mínimo de compra ni el precio con descuento.
- **Errores del panel:**
  - en la vista Excel, las celdas de marca y lote se corren en las filas de Cookies & cream;
  - el total del pedido queda cortado a 1440 px;
  - "Stock bajo · 139";
  - dos plantillas de email con el número 6;
  - el menú esconde Marketing y Ajustes detrás de un scroll sin barra.
- **Errores chicos:** "1 productos", el link "Por objetivo" que lleva solo a Masa muscular y el inicio sin `h1`.

### Problemas de experiencia más grandes
- **El celular no respira:**
  - las barras de arriba ocupan 228 px de 844, y 288 px con Black Friday;
  - la guirnalda y los dos botones flotantes ("Probar temáticas" y WhatsApp) tapan títulos, "Siguiente" en el quiz,
    el estante del armador y las líneas del carrito;
  - en la ficha, el nombre del producto aparece recién después del primer pantallazo.
- **El dato que vende no está donde se elige:**
  - las tarjetas no muestran precio por servicio, sellos ni stock;
  - el listado no tiene filtros ni orden por rendimiento;
  - la búsqueda da cero resultados con frases reales ("proteina vegana sin tacc").
- **La campaña se ve 4 segundos:** es la primera diapositiva de un carrusel que avanza solo.
- **El armador y el quiz no tienen barra fija de compra:** el botón aparece después de unos 2.000 px. El checkout
  tiene 4 pasos en una columna, el resumen abajo y el cupón repetido en cada paso.
- **El panel no conoce el rubro:**
  - no se puede cargar una venta del mostrador ni un pedido cerrado por WhatsApp o Instagram;
  - el editor de producto no deja cargar la tabla nutricional, el modo de uso ni un precio propio por presentación;
  - el inicio repite los comprobantes 4 veces y lo accionable aparece en el 5.º bloque.
- **Probar las 12 fechas lleva más de un minuto:** cada cambio recarga con 5 s de pantalla de carga, y esa pantalla
  aparece en cada recarga.

### Qué dice el mercado (benchmark)
- **Las marcas premium ganan porque el dato de compra manda:** precio por servicio o por comida, el lote con su
  certificado, el rótulo en la galería y reseñas por atributo (sabor, mezcla, efecto). No ganan por decoración.
- **Dos lenguajes:**
  - **performance:** oscuro, condensada, drops (Ghost, Raw, Gymshark);
  - **laboratorio limpio:** AG1, Transparent Labs, Momentous.

  La mezcla de los dos es justo la dirección "BOX".
- **La vara local es baja:** las marcas argentinas venden por Mercado Libre y revendedores, y las tiendas de Mar del
  Plata con Tiendanube o una web simple más WhatsApp, envío en el día y descuento por transferencia.
- **Las fechas pesan:** en el CyberMonday 2025 los suplementos fueron el 2.º producto más vendido por unidades en
  Mercado Libre.
- **El público desconfía de los descuentos.** Un rastreador de precios reporta que en el Hot Sale 2026 el 96 % de los
  descuentos de Mercado Libre eran engañosos. *Dato de fuente secundaria: verificar antes de usarlo en el guion.*
- **Ninguna herramienta que usa hoy una tienda chica** une el lote y el vencimiento con la tienda online, lee la lista
  del proveedor con margen por marca ni arma la recompra por WhatsApp. **Ese es el argumento de los USD 2.000.**

---

## 2. Dirección visual "BOX": gimnasio de alto rendimiento + laboratorio
**La tienda es un box de entrenamiento con un laboratorio adentro:** duro, preciso y con datos.

- **Forma:** esquinas rectas o casi (2–6 px), cortes en diagonal y biseles de placa metálica. Grilla visible (líneas
  de piso, marcas de carril) y módulos que encastran como un rack. Nada de pastillas ni burbujas.
- **Tipografía:**
  - display condensada y muy pesada, de póster de competencia, con fuente variable para tipografía cinética;
  - mono para datos de laboratorio;
  - **números de marcador o cronómetro LED** para precios, precio por servicio, contadores y puntajes.
- **Materia:**
  - carbono y caucho de piso;
  - acero cepillado;
  - tiza;
  - cinta de seguridad solo para avisos;
  - el voltio como **luz de señal**, no como relleno.
- **Escena:** potes, racks, barras, discos y siluetas de atletas (sin caras) con luz de estudio (contraluz, humo,
  borde de luz). **El producto es el héroe.** SVG, no WebGL ni video pesado.
- **Movimiento mecánico:** golpe seco, encastre, flip de marcador, carga de barra y luz que se enciende, más View
  Transitions de la tarjeta a la ficha si Next 16 lo permite sin costo. Con "reducir movimiento" todo queda quieto.
- **Ritmo:** pocos bloques, densos y con propósito. El inicio tiene como máximo unos 8 bloques.
- **Regla de marca:** la fecha nunca pinta el primario, los botones de compra ni el fondo. Solo existe un
  `--season-accent` (y quizá `--season-glow`) para filos, halos y la franja. Se valida con Nitro, la marca blanca.

**Antes de construir R1, Ignacio elige entre 2 o 3 propuestas.** Cada una muestra el hero del inicio, una tarjeta de
producto, el primer pantallazo de la ficha y "Hoy en tu tienda" del panel, en celular y escritorio, prototipadas en la
app con capturas. Hasta elegir, no se construye nada más.

---

### Dirección elegida (13/10/2026)
Ignacio delegó la elección. Se hicieron 3 propuestas en la app (capturas en [`img/rediseno/`](img/rediseno/)):

| | Propuesta | Qué aporta |
|---|---|---|
| A | **BOX Industrial** ([1440](img/rediseno/propuesta-a-1440.jpg) · [390](img/rediseno/propuesta-a-390.jpg)) | Box de powerlifting de noche: carbono, acero, tiza, rack con reflector, **marcador LED de 7 segmentos**, esquinas rectas, Big Shoulders Display |
| B | **Performance Lab** ([1440](img/rediseno/propuesta-b-1440.jpg) · [390](img/rediseno/propuesta-b-390.jpg)) | Hoja técnica clara: papel milimetrado, cotas reales del envase, etiqueta de lote, tablas de laboratorio, Space Grotesk |
| C | **Arena** ([1440](img/rediseno/propuesta-c-1440.jpg) · [390](img/rediseno/propuesta-c-390.jpg)) | Noche de competencia: reflectores, humo, titulares gigantes en itálica, dorsales con el puesto en ventas |

**Decisión: una síntesis con A como columna vertebral.**
- **Modo oscuro (el de la marca) = A "BOX Industrial"** para toda la tienda y el panel. Es la que más se siente gimnasio
  y la que más se aleja de Velmar. El marcador LED es la firma: precio por servicio, contadores y el panel.
- **Modo claro "Tiza" = el laboratorio de B.** Papel, grilla milimétrica, cotas y etiquetas de lote, con la misma
  estructura y componentes de A. Así la dirección "gimnasio + laboratorio" queda literal: de noche es el box y de día
  es el laboratorio.
- **Piezas de B en ambos modos:** el banco de pruebas con cotas reales en la ficha, la etiqueta de lote con aviso FEFO
  y el "Readout" de datos de la ficha.
- **Campañas y regalos (R3) = el lenguaje de C:** titulares gigantes en itálica, luz de escenario, dorsales y cortes en
  diagonal. Así las fechas se viven como una campaña sin romper la tienda.
- **Tipografías:** Big Shoulders Display para los titulares, Archivo para el texto (y su itálica comprimida para las
  campañas), JetBrains Mono para los datos y los dígitos LED en SVG propio. Space Grotesk queda solo si el modo claro
  la necesita.

---

## 3. R0 · Arreglos urgentes (antes de R1, un PR chico)
Son cosas que hoy restan en cualquier demo y no conviene esperar al rediseño. El esfuerzo total es S.

- **Tarjeta:** "+ Agregar" agrega de verdad, con e2e en escritorio y celular.
- **Inicio:** "Recomendados" sin repetir los más vendidos; `h1`; "1 productos"; el link "Por objetivo".
- **Una sola fecha de demo en toda la app:** la ficha, el checkout, el seguimiento (sin fechas escritas a mano) y el
  regalo. **La demo pasa del domingo 4/10 al lunes 5/10** (aprobado) para que "Hoy", "Sale hoy" y el cadete tengan sentido.
- **Insignia de campaña honesta:** "−30 % desde $ 40.000", o el precio con la condición.
- **Panel:** celdas corridas en la vista Excel, total cortado, "Stock bajo · 139" por "1 variante baja", el número de
  email repetido, el menú con scroll oculto y el riel que se abre solo.
- **Cupones de prueba de Velmar:** FERIA2000 pasa a ENTRENA2000; INVIERNO queda solo en el panel como ejemplo de vencido
  (el cliente no lo ve); fuera las pistas de cupones en el carrito.

---

## 4. R1 · Sistema "BOX", estructura de la tienda, inicio, tarjeta y búsqueda
**Objetivo:** que en los primeros 5 segundos nadie piense en Velmar, y que el dato que vende se vea sin buscarlo.

| Qué | Detalle | Esfuerzo |
|---|---|---|
| **Sistema de diseño** | Tokens de forma, sombras de estudio, grilla, tipografías y escala de marcador. Componentes base rehechos con variante tienda y panel: botón, chip, tarjeta, `DataTable`, input, `Sheet`, toasts, estados vacíos, `StepIndicator`, `OrderSummary`, `CouponTicket` y `ProgressRing`. `KpiTile` pasa a **marcador LED**, que se reutiliza en la tienda. Íconos propios de gimnasio para lo de marca | L |
| **Estructura** | Header de una línea con **ticker ocultable** (aviso de demo, cupón de la fecha y "cadete hoy hasta las 18 h"). Su fondo cubre hasta el borde superior y el área segura del celular. Sin flotantes: "Probar temáticas" va al menú y el WhatsApp al dock o al pie. Dock opaco del celular con Buscar al centro, siempre por encima del contenido y margen real hasta el área segura inferior. Pie como "ficha técnica del local". Pantalla de carga de ~1,2 s, solo la primera vez de la sesión | M |
| **Temáticas, regla de marca** | Se borran guirnaldas y adornos del logo. La fecha solo tiñe acentos con `--season-accent` y `--season-glow` (el arte de cada fecha llega en R3), nunca el fondo ni los botones de compra. Si hay campaña vigente, su diapositiva va primera y también rota, con cupón "Usar CÓDIGO" | M |
| **Inicio** | **Carrusel de imágenes BOX** con producto en el rack y tira de datos LED (precio por servicio, stock, cadete). Debajo: **Comprá por categoría**, con categorías como estantes (también en `/categorias/`); después **Entrená por objetivo**, con siluetas y su producto asignado. Las ofertas de campaña van después de objetivos. El resto conserva su orden: stack en vivo, "El más elegido del box", recomendados, reseñas por atributo (sabor, mezcla, efecto) y club. Fuera "Valores" y la "Ciencia simple" redonda | L |
| **Tarjeta "ficha de rack"** | Precio por servicio grande, servicios, sellos, luces de stock y hoja de sabor al agregar. Un solo aviso de "imagen ilustrativa" | M |
| **Búsqueda protagonista** | Barra en el header y buscador superpuesto con chips de objetivo, sello y sabor. Motor que entiende el rubro: sellos, sinónimos, palabras vacías y coincidencia parcial | M |
| **Panel, la parte que hereda** | Las 30 rutas con el sistema nuevo y capturas antes/después. Contenido → **Carrusel del inicio** edita los destacados existentes: vista previa con la misma diapositiva de la tienda, imagen propia, encuadre, texto alternativo, lista, orden, visibilidad y borrador recuperable | M |
| **Copia** | Fuera los textos de Velmar (club, cuenta, "Detalles y medidas", "Hecho a pedido") y "demo" repetido en todos lados: queda la franja y un pie legal | S |

**"Wow" esperado:** parece la tienda de una marca deportiva grande, y el precio por servicio, el stock y cuándo llega
se ven en la tarjeta y en el hero.

### Carrusel con imágenes (pedido del 13/10/2026)

- Conserva `content.hero` y extiende `HeroFeature` con imagen opcional `{ src, alt, frame }`; sin imagen usa el
  envase SVG de `HeroStage`. Reutiliza la escena, `rackFacts` y el flujo para agregar al carrito.
- Avanza cada 4–5 segundos; se pausa al pasar el mouse, enfocar o tocar, y tiene botón de pausa. Con
  "reducir movimiento" no avanza solo. Flechas como placas cuadradas, indicadores como marcas de carril y deslizamiento
  con el dedo mediante scroll-snap; controles nativos, foco visible y anuncio accesible del carrusel y las diapositivas.
- Titulares en Big Shoulders Display, bajada, datos del rack, **Agregar · $precio** y **Ver ficha**. La campaña vigente
  va primera con `data-theme-banner` y su cupón. Un `h1` oculto mantiene la marca mientras cambia el titular.
- El dueño puede subir JPG, PNG o WebP de hasta 10 MB y al menos 400 px en el lado más chico. Se optimiza a 900 px
  en el lado más largo y queda en el navegador; el encuadre admite posición 0–100 % y zoom 1–2. Texto alternativo:
  hasta 120 caracteres; titular: 40; bajada: 120; hasta 4 destacados. Se avisa si no queda espacio para guardar.
- Migración del panel sin perder lo editado; validación y encuadre puros y testeados en `src/demo/admin`. A 375 px el
  carrusel ocupa todo el ancho, sin desborde ni saltos de layout. Se actualizan los e2e y se mide LCP en celular con
  CPU ×4 antes y después, sin empeorar. Capturas de inicio y editor en ambos modos: [evidencia](img/rediseno/carrusel/README.md).

---

## 5. R2 · Comprar: ficha, catálogo, comparador, stack, checkout, seguimiento, club y cuenta
**Objetivo:** que comprar suplementos sea más claro que en cualquier tienda de la ciudad, y que el dueño vea que la
herramienta responde las preguntas que hoy le hacen por WhatsApp.

| Qué | Detalle | Esfuerzo |
|---|---|---|
| **Ficha "hoja técnica"** | Marcador arriba del pliegue en el celular: precio por servicio, proteína por servicio, servicios y "te dura N días". Sabor y tamaño como placas. Rótulo nutricional en la galería. Lote, vencimiento y RNPA como etiqueta de laboratorio. Dos precios explicados (transferencia y cuotas). Un solo bloque de stack, riel "Comparalo con…" y barra de compra fija con "Regalar". Fuera "Detalles y medidas" y la confianza heredada | L |
| **Editor de producto (panel)** | Precio propio por presentación (adiós base + recargo), servicios por presentación, tabla nutricional y modo de uso editables, sellos y RNPA. Sin esto, la hoja técnica y el comparador muestran datos que el dueño no puede cargar | L |
| **Catálogo** | Filtros de máquina (objetivo, marca, sabor, sellos, precio por servicio) y orden "Más rendidor" o "Más proteína por $". En el panel, columna de precio por servicio y margen | M |
| **Comparador** *(aprobado)* | 2 o 3 productos lado a lado: proteína y precio por servicio, servicios, sellos y vencimiento. Es la respuesta que el dueño escribe 20 veces por día | L |
| **Armá tu stack y quiz** | El stack como rack de gimnasio con marcadores y "te dura". **Barra fija de total y compra en el celular.** Quiz a pantalla completa, una placa por pregunta con avance automático, y resultado "Tu programa" con el protocolo del día | M |
| **Carrito y checkout** | Carrito "bolso" con un solo medidor de carga, "te dura N días" por línea y la cuenta regresiva del cadete. **Checkout en 3 pasos** (Datos y entrega, Pago, Revisar) con el resumen como ticket fijo, el cupón una sola vez y **la fecha real del calendario del cadete**. Confirmación como "ficha de entrega" que activa los avisos de recompra | L |
| **Seguimiento** | Estados y fechas reales del pedido. **El cliente ve el lote y el vencimiento después del control en el panel** | M |
| **Mi cuenta → "Mi box"** | Potes en uso como baterías calculadas solas a partir de los pedidos, "Recomprar" y "Repetir pedido", y el nivel con su barra | M |
| **Club, ruleta y Shaker Rush** | Club como tabla de niveles con medallas de metal, misiones del rubro y beneficios coherentes. El anillo no dice "¡Desbloqueás!" a un invitado. Disco olímpico "cargá la barra", fuera del medio del checkout. Inicio y resultado del juego estilo arcade con "Usar cupón ahora" | M |
| **Favoritos y ayuda** | Favoritos → "Mi rack" (total, agregar todo, armar stack). Ayuda del box con FAQ agrupada y buscador, y legales y 404 con el sistema nuevo | S–M |

**Estado:** R2a hecho (PR de R2a): ficha "hoja técnica" con el precio total primero (decisión de L1), editor con
precio por presentación, rótulo y RNPA validados, catálogo con filtros y orden, y comparador. **R2b hecho** (PR de
R2b, capturas en [`img/rediseno/r2b/`](img/rediseno/r2b/)): bolso con un solo medidor de carga, "te dura N días" por
línea y la cuenta regresiva del cadete; checkout en 3 pasos con ticket fijo (plegable en el celular), el cupón una
vez y la fecha real del calendario; confirmación como ficha de entrega que activa los avisos de recompra; seguimiento
con estados y fechas reales y el lote y vencimiento después del control del panel; "Mi box" con potes como baterías,
Recomprar, Repetir pedido y el nivel con su barra. Los packs y "Tu programa" siguen agrupados con su descuento y su
día del mes, y la ruleta se ofrece en el bolso sin cortar el pago.
**R2c hecho** (PR de R2c, capturas en [`img/rediseno/r2c/`](img/rediseno/r2c/)). Stack: rack con tableros "te dura N
días", cantidad por lugar, "Igualar duración" y total fijo con "Agregar el stack" en el celular. Quiz a pantalla
completa con avance solo y "El protocolo del día" en "Tu programa". Club: tabla de niveles con medallas de metal,
misiones de entrenamiento (entrenos de la semana, día del deporte, Shaker Rush) con premios que se reclaman una sola
vez, el anillo que al invitado lo invita a crear la cuenta demo y la liga de gimnasios (`/club/liga/` y, en el panel,
Misiones → Liga de gimnasios en solo lectura). Disco con "Cargá la barra" fuera del checkout (placa opcional en el
carrito). Shaker Rush arcade con ranking semanal, "Usar cupón ahora" y tarjeta 9:16. Favoritos → "Mi rack" con total,
agregar todo, armar stack y avisos simulados de baja de precio o vuelta de stock. Ayuda del box con temas y buscador
(el tema se elige en el panel), y legales y 404 con el sistema nuevo. **R2 cerrado.**

**"Wow" esperado:** checkout con la fecha real, seguimiento con lote y "Mi box" con recompras solas. Los tres usan
datos que el motor ya tiene.

---

## 6. R3 · Temáticas y regalos: las 12 fechas como campañas y el regalo como momento
**Objetivo:** que cada fecha se vea como la campaña de una marca deportiva grande y se suba a Instagram ese día, y
que regalar un suplemento traiga clientes nuevos.

### Campañas: las 12 fechas al máximo (decisión de Ignacio)
- **Hero "Drop":**
  - plantilla única de alto nivel: el rack con los potes reales de la campaña;
  - el descuento como número de marcador;
  - cuenta regresiva y cupón como **ticket de acceso**;
  - página de espera antes del inicio, para Black Friday y las fechas CACE.
- **Key visual de escena por fecha** (lo caro: 12 SVG con luz, siluetas y producto):
  - primero 4 de referencia que aprueba Ignacio (Black Friday, Hot Sale, Vuelta al gym y Navidad);
  - después las otras 8 con el mismo nivel.
  - **Criterio de aceptación:** cada key visual funciona recortado como post 4:5 sin texto de la interfaz encima. Si no
    lo subirías a la cuenta de la tienda, no está terminado.
  - Ningún elemento de cotillón (banderines, gorros, lamparitas): todo sale del mundo gym o suplemento.
- **Pantallas de carga por fecha:** de 1,5 a 2 s, mecánicas y sin tapar el logo.
- **La fecha en la ficha, el carrito, el seguimiento y el club** tiñe solo filos y tickets, nunca la compra.
- **"Modo vitrina"** para mostrar las 12 fechas en la demo sin recargar la página (hoy cuesta más de un minuto).
- **Panel → "Campañas":**
  - calendario anual con las fechas CACE y Black Friday;
  - editor con vista previa doble (celular y escritorio), productos, cupón y titular;
  - resultados del cupón;
  - **"Sacar las piezas"**: el Estudio genera post 1:1, historia 9:16 con la cuenta regresiva y la tarjeta de regalo
    de esa fecha, todo con el key visual de la campaña.

**Estado:** campañas (R3a) hechas (PR de R3a): 17 fechas con key visual propio (las 12 comerciales y 5 días del
deporte: CrossFit Open, Actividad Física, Futbolista, Running y Boxeador, punto 9 de Ignacio), Drop en el carrusel,
sala de espera, pantalla de carga por fecha, modo vitrina, franja "Próxima campaña", panel Campañas con calendario,
editor con vista previa doble, resultados del cupón, "Sacar las piezas" y "Descuento real". Sigue R3b (regalos).

### Regalos: de formulario a momento
- **"Regalá energía", quien regala:**
  - elige el producto, el stack o una **gift card con monto** *(aprobada)*;
  - deja sabor y tamaño **abiertos para que elija quien recibe** *(aprobado)*;
  - escribe el mensaje y elige el diseño de tarjeta y la apertura (**bolsa o locker**, ambas aprobadas), con la vista
    previa grande;
  - manda por WhatsApp **una imagen de tarjeta**, no un link pelado.
- **`/regalo/` como taquilla de entrada** con arte propio. Nunca más un formulario centrado.
- **Bolsa de boxeo rehecha:** escenario de gimnasio, luz, polvo de tiza, cámara que acompaña cada golpe, vibración,
  sonido y cámara lenta en el último.
- **Locker:** se abre con una combinación (la fecha del regalo o un código), con luz que se enciende adentro.
- **Revelación "tarjeta de atleta":** sobre un estudio neutro (nunca el color de otra fecha), con el producto, "cómo
  tomarlo", el mensaje y quién lo manda. Si quedó abierto, se elige sabor o tamaño. Cierra con "Guardá tu regalo" y
  **"Compartí en tu historia"** (pieza 9:16 o un video corto generado).
- **"Mis regalos"** en "Mi box", con el estado del regalo para quien lo mandó.
- **Panel:** gift cards emitidas y canjeadas con saldo y vencimiento, y el sabor elegido de cada regalo abierto.

**Orden dentro de R3:**
1. Hero Drop con Black Friday como piloto.
2. Taquilla, bolsa nueva, revelación e historia: es el "wow" de una demo de 2 minutos.
3. Locker y gift card.
4. Las 11 campañas restantes.
5. Panel "Campañas".

---

## 7. R4 · Panel "Centro de mando" y kit de venta
**Objetivo:** que el dueño abra el panel a la mañana y en 30 segundos sepa qué hacer hoy. Que se lo imagine usándolo
mañana.

| # | Qué | Esfuerzo |
|---|---|---|
| 1 | **"Hoy en tu tienda".** Arriba, marcador con lo vendido hoy, lo que falta cobrar, lo que hay que armar, lo que sale hoy y el stock en riesgo. Debajo, la lista de acciones del día ordenada por urgencia, cada una con su botón de un toque: comprobantes, pedidos para armar, recompras para avisar, lotes que vencen con su acción propuesta, compras a proveedores, próxima campaña con su checklist y regalos para armar. Se va el inicio de Velmar (club en ceros, actividad, reclamos de ejemplo y el embudo de 7 cajas) | M |
| 2 | **Modo mostrador** *(aprobado)*: buscador grande; potes por variante con precio, stock y el lote que sale; ticket con el descuento stack; cobro con vuelto en efectivo; "Venta registrada (simulada)"; "Cerrar el día" con la caja esperada; consulta rápida de stock y precio lista para WhatsApp. Motor nuevo `engine/counter.ts` con FEFO | L |
| 3 | **Menú de 21 a 9 entradas:** Hoy, Mostrador, Pedidos, Stock, Compras, Clientes, Promos, Campañas y Ajustes. En el celular, "Mostrador" es la pestaña central. Sin pantallas puente: las secciones pasan a pestañas y las rutas viejas redirigen. Encabezados compactos con ayuda en "?" | M |
| 4 | **Pedidos unificado:** "Por cobrar" (modo revisión), "Para armar" (checklist de 2 pasos con control de lote, sin kanban de 4 columnas), "Despachos" y "Postventa". "Escribirle por WhatsApp" y el total siempre visible | L |
| 5 | **Lista del proveedor con margen por marca y vista de diferencias** ("47 suben, 3 bajan, 2 sin coincidencia") y el margen nuevo en el aumento de precios | M |
| 6 | **Lote que vence = acción armada:** combo con otro producto, cupón a los clientes que lo compraron o meterlo en el drop de la semana | M |
| 7 | **Recompra por WhatsApp:** a quién escribirle hoy, calculado por servicios, con el mensaje armado | M |
| 8 | **Mensajes:** emails y versión WhatsApp por estado, con un número ficticio cargado en la demo | M |
| 9 | **Promos** en una pantalla con pestañas (cupones, descuento stack, ruleta, premios del juego, misiones) | S–M |
| 10 | **Kit de venta:** el guion arranca en "Hoy" y sigue con "Mostrador" y los "wow" en 90 segundos; contraste con lo que el dueño ya usa ("Tiendanube te sube todo un 8 %; VOLTA lee la lista de tu distribuidor y sube cada marca con su margen"); capturas, video de 60–90 s y QA en celulares reales | M |

---

## 7 bis. Lotes pedidos por Ignacio el 16/10/2026 (antes de seguir con R2)
Orden acordado: **L1 → L2 → L3 → L4 → L5**, después R2a, R2b, R2c, R3a, R3b, R4a, R4b y R4c.

| Lote | Qué | Estado |
|---|---|---|
| **L1** · Inicio y navegación | Carrusel de **imágenes** automático (al estilo Velmar, con identidad BOX); inicio: carrusel → categorías → recomendados → "¿Para qué lo querés?" y el stack; **precio total primero** y el precio por servicio chico; el dock del celular siempre arriba al cambiar de página; la pantalla de carga **en cada recarga** hasta terminar su animación | Hecho (PR #11) |
| **L2** · Tienda deportiva multimarca | Textos de comercio que vende marcas de terceros; accesorios (straps, shakers, vendas, cinturones, guantes, rodilleras, sogas, bandas, magnesio, bolsos) con talle y color | Hecho (PR #12) |
| **L3** · Packs mensuales | Packs por objetivo y deporte, "Quiero este pack todos los meses" (simulado) y panel de packs y suscriptores | Hecho (PR #13) |
| **L4** · Objetivos, deportes, stack y quiz | SVG por deporte (fútbol, tenis, pádel, running, etc.), stack con varios objetivos, invitación al quiz al entrar y quiz con opción mensual | Hecho (PR #14) |
| **L5** · Cierre de L4 | Deportes editables en el panel (nombre, bajada, color y pack sugerido); el tope de 3 objetivos cuenta solo los elegidos, igual en el quiz y el armador (el deporte siempre suma); las tarjetas de objetivo del inicio muestran el total de su stack, como las de deporte | Hecho (PR de L5) |

Cambian decisiones anteriores: el precio por servicio deja de ser el número grande, la pantalla de carga sale en cada
recarga y el inicio vuelve a tener un carrusel que avanza solo. Los puntos 9 (días del deporte) y 11 (un regalo único
por fecha) entran en R3a y R3b.

---

## 8. Cómo se trabaja cada fase
1. **Dirección:** prototipos de las pantallas clave en celular y escritorio, con capturas para que Ignacio elija o
   corrija antes de construir todo.
2. **Construcción:** agentes en paralelo por área sobre el sistema de R1. El motor y los datos no cambian salvo pedido
   explícito.
3. **Calidad:**
   - lint, tipos, unitarios y build;
   - e2e adaptados en el mismo PR, sin skip;
   - axe AA en claro y oscuro;
   - medición en celular de gama media (no puede empeorar contra la Fase 8);
   - Nitro sin "Volta" a la vista;
   - la regla "la fecha no pinta la compra" con test.
4. **Entrega:** PR por fase con capturas antes/después y un recorrido corto. Al mergear se publica en Pages.

---

## 9. Decisiones de Ignacio (12/10/2026)
- **Funcionalidades nuevas aprobadas:**
  - comparador de suplementos (R2);
  - gift card con monto (R3);
  - elegir sabor o tamaño al canjear un regalo (R3);
  - "Modo mostrador" (R4).
- **Apertura del regalo:** las dos, la bolsa de boxeo rehecha y el locker. Quien regala elige cuál.
- **Temáticas:** **las 12 fechas al máximo nivel**, cada una como campaña completa.
- **Orden:** R0 → R1 → R2 → R3 → R4.
- **Fecha de la demo:** pasa del domingo 4/10 al **lunes 5/10** (R0).
- **Las 14 funcionalidades nuevas de la sección 10:** aprobadas.
- 13/10/2026: vuelve el carrusel con imágenes, pedido de Ignacio

## 10. Funcionalidades nuevas que salieron del análisis: **todas aprobadas** (12/10/2026)
Entran en la fase indicada, además de lo de cada tabla. Con esto R2 y R4 crecen bastante. Si una fase se pasa de
tamaño, se parte en dos PR (por ejemplo, R2a ficha + catálogo + comparador y R2b compra + club), sin cambiar el orden.

| Propuesta | Área | Fase | Esfuerzo |
|---|---|---|---|
| **"Descuento real":** precio más bajo de los últimos 30 días en la ficha y aviso en el panel si un descuento no es real | Tienda y Campañas | R3 | M |
| **"Verificá tu lote":** buscador de lote en la ficha (vencimiento, ingreso al local y RNPA) | Ficha | R2 | M |
| **"Mi rack" con avisos:** "avisame si baja o si vuelve" | Favoritos | R2 | M |
| **Comparación como imagen** para mandar al cliente por WhatsApp | Comparador | R2 | S |
| **Canal WhatsApp/Instagram en el mostrador**, para cargar pedidos cerrados por chat | Panel | R4 | M |
| **Despacho:** lista de armado consolidada y hoja de ruta del cadete | Panel | R4 | M |
| **Costos vivos:** fecha de cada costo, cobertura de stock en días y ganancia al liquidar | Panel | R4 | M |
| **Clientes:** link de recompra con el carrito cargado y regalo de cumpleaños | Panel | R4 | M |
| **Liga de gimnasios de Mar del Plata:** el cliente elige su gimnasio y hay ranking mensual por box | Club | R2 | M |
| **Shaker Rush social:** ranking semanal y tarjeta 9:16 del puntaje | Juego | R2 | M |
| **Misiones de entrenamiento** (no solo de compra) | Club | R2 | M |
| **"Igualar duración" del stack** (que todo te dure lo mismo) | Stack | R2 | M |
| **"Modo dueño" en la tienda:** puntos editables que llevan al panel, más "Ver este pedido en el panel" desde la confirmación | Demo de venta | R4 | M |
| **Franja "Próxima campaña"** entre fechas, y métricas de regalos en el panel | Campañas | R3 | S |
