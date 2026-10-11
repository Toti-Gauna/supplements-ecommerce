# Plan por fases · Tienda de suplementos (base Velmar)

Demo frontend **clickeable de punta a punta** de una tienda de suplementos deportivos, con panel de administración,
gamificación (ruleta + juego) y regalos. Parte de la estructura completa de Velmar (`Toti-Gauna/velmar-ecommerce-`) y la
transforma en una marca de suplementos con identidad propia: **eléctrica, premium y de gimnasio**, sin parecerse a ninguna
tienda de suplementos existente.

- Marca de demo: **VOLTA · Suplementos** (Mar del Plata). Es una marca inventada para la demo: nombre, logo, colores,
  WhatsApp y textos salen de `src/config/brand.ts`, así cada cliente ve **su** marca cambiando un archivo (Fase 8).
- Mismo stack que Velmar: Next.js 16 (export estático) · React 19 · TypeScript estricto · Tailwind 4 · Zustand ·
  `motion/react` · React Hook Form + Zod. Sin backend: todo vive en el navegador (localStorage) y se reinicia con
  "Reiniciar demo".
- Todo el arte es **SVG propio** (potes, shaker, scoop, cápsulas, gomitas, barras, discos, mancuernas, rayos, moléculas):
  ninguna foto de stock, ninguna marca real.

## Por qué partir de Velmar
Velmar ya resuelve lo difícil y probado (tienda, carrito, checkout, seguimiento, club, ruleta, regalos, temáticas, panel
con tablas tipo Excel, calendario, emails, estudio de contenido, tests). Rehacerlo desde cero costaría semanas y daría
menos. La estrategia es **fork + transformación**: se copia la arquitectura y el panel tal cual (como pediste) y cada
fase cambia un área completa a "suplementos": datos, reglas, pantallas, arte y motion.

## Dirección visual: "Laboratorio eléctrico"
Lo que hacen las tiendas de suplementos hoy: negro + rojo agresivo (ENA, Star, Gentech) o blanco clínico (importadas).
VOLTA va por un tercer camino: **grafito profundo + verde voltio + violeta plasma**, con lenguaje de laboratorio.

| Elemento | Decisión |
|---|---|
| Fondo | Grafito casi negro con tinte azul (`#0A0C10`), superficies en capas y filetes finos. Modo claro "Tiza" (blanco magnesio) |
| Acento | **Voltio** `#C8FF2E` para acciones (16:1 sobre grafito) · **Plasma** `#7C5CFF` para brillos y energía · **Ion** `#2EE6D6` para datos |
| Tipografía | Archivo **expandida** y pesada para titulares (look atlético-tech), Archivo normal para texto y **JetBrains Mono** para datos (tabla nutricional, lote, vencimiento, precio por servicio) |
| Motivos propios | Etiqueta de laboratorio (`LOTE V-2611 · VTO 11/2027`), **barras de progreso como batería que se carga** (envío gratis, misiones, niveles), línea de pulso/osciloscopio como separador, arcos eléctricos sutiles, polvo de tiza, grilla de puntos |
| Producto | Cada pote es un SVG con iluminación de estudio: filo de luz eléctrica, pedestal iluminado y vista "abierta" con scoop y polvo |
| Motion | Entradas cortas con resorte, carga eléctrica al agregar al carrito, nada en bucle salvo lo pedido. Todo respeta "reducir movimiento" |

## Resumen de fases

| Fase | Nombre | Resultado visible |
|---|---|---|
| 0 | Base técnica | El repo compila, pasa los checks y publica. Invisible para el cliente |
| 1 | Identidad eléctrica + catálogo | La tienda ya es VOLTA: logo, colores, pantalla de carga, potes SVG, catálogo de suplementos, panel con la piel nueva |
| 2 | Ficha de suplemento premium | Sabor y tamaño, precio por servicio, tabla nutricional, cómo tomarlo, calculadora de dosis, lote y vencimiento, combos |
| 3 | Armá tu stack + Quiz de objetivos | El "configurador" de suplementos: armado visual del stack con descuento y quiz que recomienda |
| 4 | Gamificación | Club con niveles y misiones, **Ruleta "disco olímpico"**, **juego Shaker Rush** (tipo egg catcher) y billetera de cupones |
| 5 | Regalos + temáticas fitness | Regalar un suplemento, abrirlo **a golpes contra una bolsa de boxeo**, temáticas por fecha con su pantalla de carga |
| 6 | Panel I · Ventas y catálogo | Inicio, pedidos, pagos, clientes con **recompra**, reclamos, productos con **lotes y vencimientos**, **aumento masivo de precios**, importar Excel |
| 7 | Panel II · Operaciones y marketing | Calendario de despachos, preparación de pedidos, costos y margen, proveedores, cupones/ruleta/juego, emails, temáticas, estudio de contenido |
| 8 | Pulido premium + kit de venta | Sonido, rendimiento, accesibilidad, QA en celulares, guion de demo, manual del dueño y **marca blanca por cliente** |

Cada fase termina con: `lint + typecheck + tests + build`, e2e móvil, capturas a 390 px y escritorio, push de la rama y
la lista de "qué mostrar" de esa fase. La fase siguiente arranca con tu OK.

---

## Fase 0 · Base técnica
**Qué:** traer el código de Velmar a este repo y dejarlo como proyecto propio.
**Cómo:**
- Copiar `app/`, `src/`, `tests/`, configuración y workflow de Pages. Renombrar claves de almacenamiento
  (`velmar-demo:*` → `volta-demo:*`), token de seguimiento (`demo-velmar` → `demo-volta`), textos de README y reglas de
  agentes (`AGENTS.md`, `CLAUDE.md`).
- Dejar las temáticas en "Original" mientras se rehacen (Fase 5) para que no aparezca nada de Velmar.
**Demo:** no hay demo visible; se verifica que compile, pasen lint/tipos/tests y el export estático.

## Fase 1 · Identidad eléctrica y catálogo de suplementos
**Qué:**
- **Marca VOLTA**: logo (una "V" cuyo trazo derecho es un rayo), wordmark expandido, favicon e imagen para compartir.
- **Sistema de diseño**: tokens oscuro (por defecto) y claro "Tiza", tipografías, radios más técnicos, botones con
  destello eléctrico, grano y grilla de puntos de fondo. El panel admin toma la misma piel automáticamente.
- **Librería SVG de suplementos** (`src/components/illustrations/supplements/`): pote ancho, pote alto, doypack, frasco
  chico, frasco de cápsulas, gomitas, barra, caja, botella líquida, sobres, gel, mantequilla, shaker, scoop y tiza.
  Parametrizados por color de marca, color de sabor y rótulo: un producto creado en el panel tiene su ilustración sin
  diseñar nada. Tres vistas por producto: estudio con pedestal iluminado, pote abierto con scoop y escena de gimnasio.
- **Íconos nativos**: mancuerna, pesa rusa, disco, rayo, llama, molécula, pulso, hoja (vegano), espiga tachada (sin
  TACC), gota (hidratación), luna (descanso), cerebro (foco), escudo (defensas), bíceps.
- **Catálogo de muestra** (~30 productos, marcas inventadas): proteínas, creatinas, pre-entrenos, aminoácidos,
  ganadores, quemadores, vitaminas y salud, barras y snacks (con **alfajor proteico**), hidratación y accesorios.
  Variantes por **sabor × tamaño**, objetivos (masa muscular, fuerza, energía, recuperación, definición, salud).
- **Pantalla de carga "Cargando energía"**: el rayo de la V se traza, una batería se carga, chispa y telón (CSS puro).
- **Inicio**: carrusel con potes y arcos eléctricos, barra de beneficios, círculos de **objetivos** y categorías,
  rieles, más vendidos, novedades y banda del club. Header, menú, pie y barra inferior con la marca nueva.
**Cómo:** tokens en `src/config/brand.ts` + `app/globals.css`; renombre mecánico de tokens (`brass` → `volt`);
fixtures nuevos en `src/demo/fixtures/`; el arte reemplaza `ProductArt` por `SupplementArt`. Se quita lo que es solo
de Velmar en la tienda (collar, foto personalizada, mascotas) sin romper carrito, pedidos ni panel.
**Demo:** abrir en el celular → pantalla de carga → inicio → categoría → ficha → carrito → checkout. Panel con la piel nueva.

## Fase 2 · Ficha de suplemento premium
**Qué:**
- Selector de **sabor** (muestra de color + ilustración del sabor) y **tamaño** (1 lb / 2 lb / 5 lb) con **servicios** y
  **precio por servicio**, y la etiqueta "Mejor precio por servicio".
- **Tabla nutricional** con formato de rótulo argentino (porción y 100 g, %VD) en tipografía mono.
- **Cómo tomarlo**: línea del día (mañana, pre, post, antes de dormir) con scoops dibujados.
- **Calculadora de dosis**: peso y objetivo → gramos por día y **cuántos días te dura el pote**; botón "Avisame cuando
  se esté por terminar" (recordatorio de recompra en la cuenta demo).
- **Sellos**: sin TACC, vegano, sin azúcar agregada, RNPA de muestra. **Lote y vencimiento** visibles (confianza).
- **Combos**: "Llevalo con…" con descuento por stack. Stock debajo de la imagen y **¿Cuándo llega?** (cadete en el día en
  Mar del Plata, envío nacional) como en Velmar.
- Carrito, checkout, confirmación y seguimiento adaptados (sin personalización; regalo sigue).
**Cómo:** reglas puras y testeadas en `src/demo/engine/` (`servings.ts`, `dose.ts`, `bundles.ts`); componentes en
`src/features/product/`. Precio, descuentos y stock solo en el engine, como en Velmar.
**Demo:** ficha de la whey: cambiar sabor y tamaño (cambia el precio por servicio), calcular dosis, agregar el combo.

## Fase 3 · Armá tu stack + Quiz de objetivos
**Qué:**
- **Armá tu stack** (reemplaza a "Crear"): elegís objetivo y vas sumando base (proteína), creatina, pre-entreno y
  extras; los potes **se apilan en un estante iluminado** en vivo, se ve el ahorro del stack y se agrega todo al carrito.
- **Quiz "¿Qué necesitás?"**: 4 preguntas (objetivo, días de entrenamiento, horario, restricciones) → stack recomendado
  con el porqué de cada producto.
- Bloque en vivo en el inicio (el equivalente al probador de Velmar).
**Demo:** hacer el quiz en el celular, ajustar el stack recomendado y mandarlo al carrito con el descuento aplicado.

## Fase 4 · Gamificación
**Qué:**
- **Club VOLTA** con niveles (Novato → Atleta → Élite → Bestia) que se cargan como batería, misiones encadenadas y
  billetera de premios.
- **Ruleta "Disco olímpico"**: la ruleta es un disco de pesas con los colores reglamentarios (rojo, azul, amarillo,
  verde), se gira tocando, arrastrando con fuerza o con Enter, luces LED en el aro, clic por gajo, confeti y el cupón de
  la fecha. Pantalla completa y oscura, como en Velmar.
- **Juego "Shaker Rush"** (tipo egg catcher): movés un shaker (dedo, mouse o flechas) y atrapás scoops, cápsulas y rayos
  que caen; esquivás la comida chatarra. Potenciadores (rayo x2, scoop dorado), velocidad que sube, 3 vidas, 45 segundos.
  El puntaje desbloquea niveles de premio (5 %, 10 %, envío gratis). **Se juega todas las veces que quieras, el cupón se
  gana una vez por día** por navegador. Canvas 2D a 60 fps, sonidos sintetizados y vibración en Android.
**Cómo:** sorteo y premios en funciones puras (`wheel.ts`, `game-prize.ts`); el juego en `src/features/game/` con un
loop de `requestAnimationFrame`, colisiones simples y el arte de la librería SVG convertido a `Path2D`.
**Demo:** girar la ruleta al ir a pagar, jugar una partida en el celular y aplicar el cupón ganado.

## Fase 5 · Regalos y temáticas fitness
**Qué:**
- **Regalar** un suplemento (para quién, de parte de quién, mensaje, ocasión) con código `REGALO-XXXX-XXXX` y link; quien
  lo recibe nunca ve el precio.
- **Abrir el regalo a golpes**: pantalla oscura, una **bolsa de boxeo** colgando; cinco golpes con sacudón, polvo de tiza,
  costuras que se abren y el pote que sale. Variantes por fecha (Navidad, Día del Padre, San Valentín, Día de la Madre…).
- **Temáticas** por fecha con paleta, banner, cinta, cupón, ofertas y pantalla de carga propias: Año Nuevo ("versión
  2027"), Vuelta al gym, San Valentín, Hot Sale, Día del Padre, Día del Amigo ("compañero de gym"), Primavera /
  Operación verano, Día de la Madre, Halloween ("Monster pump"), CyberMonday, Black Friday y Navidad.
**Demo:** abrir un regalo de muestra desde el celular y cambiar de temática con "Probar temáticas".

## Fase 6 · Panel I · Ventas y catálogo
Copia de la estructura del panel de Velmar con la estética eléctrica y la lógica de una tienda de suplementos.
**Qué:**
- **Inicio**: KPIs, embudo de pedidos, ventas, más vendidos, **próximos a vencer** y **recompras de la semana**.
- **Pedidos y pagos manuales** (transferencia/QR con comprobante, aprobar y rechazar con motivo) igual que Velmar.
- **Clientes**: segmentos, ficha completa con objetivo, historial y **recordatorio de recompra** calculado por los
  servicios del pote ("a Juan se le termina la whey el jueves").
- **Productos y stock** con **lotes y vencimientos** por variante, aviso de "vence en menos de 60 días" con acción
  "Liquidar con descuento", **marca** como filtro y **aumento masivo de precios por %** (por marca o categoría, con
  vista previa y deshacer): la herramienta que más pide un comercio argentino.
- **Importar desde Excel** la lista de precios del proveedor, **categorías y objetivos**, reclamos.
**Demo:** cargar una lista de precios en Excel, subir 8 % a una marca, ver el aviso de vencimientos y liquidar un lote.

## Fase 7 · Panel II · Operaciones y marketing
**Qué:**
- **Calendario de despachos** (capacidad del cadete por día, feriados, arrastrar para reprogramar) y **preparación de
  pedidos** (Por preparar → Armando → Control de lote → Listo para despachar).
- **Costos y margen** con el costo del proveedor y precio sugerido; **proveedores y compras** sugeridas por stock mínimo.
- **Marketing**: misiones, **emails automáticos** (compra, pago aprobado, preparando, enviado, "tu pote se está por
  terminar"), cupones, **configuración de ruleta y del juego** (premios por puntaje), temáticas, contenido y ajustes.
- **Estudio de contenido** para Instagram con los potes animados (post, historia y carrusel; PNG y video).
**Demo:** mover un pedido a "Listo", ver el email que salió solo y exportar una historia de Instagram de la oferta.

## Fase 8 · Pulido premium y kit de venta
**Qué:**
- Sonidos sintetizados (carga eléctrica al agregar, clic de disco, golpe), microinteracciones, rendimiento en celulares
  de gama media, accesibilidad AA y QA en iPhone/Android reales.
- **Guion de demo de 10 minutos** pensado para el dueño de una tienda de suplementos (del dolor —WhatsApp, Excel,
  precios que cambian, vencimientos— a lo que enamora: ficha, stack, juego, regalo, Instagram).
- **Manual del dueño** sin palabras técnicas.
- **Marca blanca**: guía para cambiar nombre, logo, colores, WhatsApp y catálogo por cliente en minutos, y publicar una
  demo por prospecto de Mar del Plata.

## Cómo se publica la demo
- Export estático (`out/`) que corre en cualquier hosting gratis. El workflow de GitHub Pages queda listo; **GitHub
  Pages en un repo privado requiere plan pago**, así que hay dos caminos: hacer público el repo (como Velmar) o
  publicar en Vercel/Netlify/Cloudflare Pages conectando el repo privado (gratis).
- La demo **no cobra, no crea pedidos reales y no llama a servicios externos**. Banner "Tienda de demostración",
  panel en `/admin-demo/` sin login a propósito y "Reiniciar demo" para empezar limpio antes de cada reunión.
