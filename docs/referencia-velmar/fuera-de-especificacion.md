# Lo agregado fuera de la especificación técnica

Pedido de Ignacio, Fase 7 (VEL-73). La especificación técnica de Notion es la fuente de verdad; todo lo de esta lista
se construyó en la demo **a pedido de Ignacio** y no está en ella. Sirve para decidir **qué entra en producción y a qué
precio**. Esta página es la copia del repo; la misma lista está en Notion, dentro de la especificación.

**Cómo leerla**
- **Tamaño** es criterio nuestro, relativo y sin precio: **S** (pantalla o ajuste, sin datos nuevos), **M** (datos nuevos
  y reglas en el servidor) y **L** (varios modelos, reglas y pantallas). No es una cotización.
- **En producción necesita** dice qué pasa de ser del navegador a ser del servidor. En la demo todo vive en el navegador
  (`localStorage`); en producción precio, stock, pagos y misiones los decide solo `src/server/services`.
- **Decisión** la completa Ignacio con el cliente: entra · después · no.

## Primero: lo que la spec dejó afuera de forma expresa
La sección 18 de la especificación ("Fuera de alcance", marcada 💡 fuera del alcance vendido) excluye cosas que la demo
**sí tiene**. Son las que más conviene hablar antes con el cliente, porque no estaban en lo acordado:

| La spec dice (sección 18) | Lo que hay en la demo | Fase |
|---|---|---|
| "Cola de producción con cupos" y "planificación de capacidad de fabricación"; "la tienda no calcula capacidad de fabricación ni limita pedidos por cupo" | Cola de producción, capacidad de pedidos por día en el calendario, y "¿Cuándo llega?" en la ficha que usa esa capacidad | 2 |
| "Embudo de métricas" | Inicio del panel con variación contra la semana anterior, gráficos y rendimiento del club (la spec pide contadores y ventas del día, semana y mes) | previa |
| "Mascota en la cuenta y premios por fecha" | Mascotas con cumpleaños en la ficha del cliente, recordatorios y email de cumpleaños | 2 y 3 |
| "Regalá uno" | Regalos: comprar para otra persona, link y código para abrirlo a golpes con una escena por festividad, y Mis regalos en la cuenta | 8 |

## Tienda

| Agregado | Fase | En producción necesita | Tamaño | Decisión |
|---|---|---|---|---|
| Ruleta de cupones (física, con gajos, sonido y confeti; desde la Fase 8 a pantalla completa con cupón de la festividad; desde Polish 8.2 el premio conserva su estado: ganado, guardado, aplicado, quitado o usado; desde Polish 8.3.25 un catálogo de premios con plantillas que se elige en cada gajo) | previa, 4, 8 y Polish 8.2/8.3 | Sorteo ponderado y cupón `RULETA…` de un uso, con vencimiento y un giro por cuenta, decididos en el servidor | M | |
| Mis cupones (pantalla y selector en el carrito) | previa | Cupones por cuenta, estados (vencido, mínimo, solo con cuenta) | S | |
| Buscador superpuesto con recientes y lo más buscado (la búsqueda tolerante a errores **ya está en la spec**) | previa | Búsqueda en Postgres (spec); recientes por dispositivo | S | |
| Favoritos y su pantalla | previa | Tabla de favoritos por cuenta (hoy por navegador) | S | |
| "Comprar ahora", barra inferior de vidrio, carrusel con pausa, historias de producto | previa y 0 | Solo contenido editable | S | |
| Ficha todo en uno y **aprobación al agregar al carrito** | previa | **Cambio a la spec:** "Así lo quiero" ya no es una casilla; se guarda `approvedAt` al agregar | S | |
| Regalos: "Regalar ahora" en la ficha y "¿Es para regalo?" en el checkout (desde Polish 8.2, en un modal con vista previa), código `REGALO-XXXX-XXXX` y link, apertura a golpes con 17 escenas, Mis regalos (**excluido en la sección 18**: "regalá uno") | 8 y Polish 8.2 | Regalos como modelo con clave al azar (link y código), email a quien lo recibe, vista sin precio y canje una sola vez, validados en el servidor | L | |
| ¿Cuándo llega? (usa el calendario del taller) | 2 | Plazos y capacidad del taller en el servidor | M | |
| Configurador del collar (letras, cordón, material, dije, talle por cuello); desde Polish 8.2, estilos de letras (sueltas, en línea, de corrido, chapita), adorno, patrón del cordón con segundo color y probador completo en el inicio. Solo lo visto en el Instagram (letras sueltas, paracord liso, patita) va como confirmado; el resto se muestra como **ejemplo de la demo** | 4 y Polish 8.2 | Opciones y recargos como datos; precio calculado en el servidor; Velmar confirma qué estilos y patrones fabrica | L | |
| Seguimiento con el viajero de cada temática (trineo, bruja, Pancho y Lola…), estallido al entregar y zona para probar los estados del pedido | Polish 8.2 | Nada: los estados reales salen del pedido en el servidor; la zona de prueba es solo de la demo | S | |
| Mi cuenta con ingreso y registro de demostración, "Continuar con Google" **simulado** y panel por tarjetas (pedido de Ignacio) | Polish 8.2 | Autenticación real según la spec; Google solo si se decide integrarlo (OAuth en el servidor); la contraseña nunca en el cliente | M | |
| Sonidos sintetizados con botón de silencio | 4 | Nada (navegador) | S | |
| Pantalla de carga de 5 s y confeti de compra | previa | Nada (navegador) | S | |
| Temáticas (16 fechas con paleta, fondo, pantalla de carga, cinta, cupón y ofertas) | previa, 5 | Tabla de temporadas con fechas y cupón; vigencia validada en el servidor | M | |
| Personajes Pancho y Lola, transiciones entre páginas y microinteracciones | 5 | Nada (navegador) | S | |

## Panel

| Agregado | Fase | En producción necesita | Tamaño | Decisión |
|---|---|---|---|---|
| Tablas de CRM (filtros, lotes, columnas, exportar `.xlsx`) y ⌘K; en Polish 8.3.4 pasan a la tabla común con "Más filtros", 10 por página, fila → ficha y filtros en la URL (la vista rápida lateral se retiró) | 1 · 8.3 | Paginado, filtros y exportación en el servidor | M | |
| Importar desde Excel y Planilla editable; en Polish 8.3.4/8.3.19 la Planilla es "Ver en formato Excel" de cada tabla (edita solo Productos y stock, Insumos y Categorías) y deja de ser una entrada del menú | 1 · 8.3 | Validación en el servidor, auditoría y deshacer | M | |
| Detalle de categoría (`/admin-demo/categorias/detalle/`) y alta en modal (8.3.22) | 8.3 | Endpoint de categorías | S | |
| Imagen propia en las diapositivas del carrusel, con vista previa, encuadre y texto alternativo (8.3.28); en la demo se achica y queda en el navegador | 8.3 | Subida y optimización de imágenes en el servidor (almacenamiento de archivos) | M | |
| Fichas completas de pago y de reclamo (`/admin-demo/pagos/detalle/`, `/admin-demo/reclamos/detalle/`), estado de pago y de producción por separado y "Volver" con filtros (8.3.5) | 8.3 | Mismos endpoints de pedidos y reclamos | S | |
| Ayudas "i" de segmentos y estados con las reglas del engine (8.3.10) y filtro "Para escribir" en Clientes (8.3.9) | 8.3 | — (texto derivado de las reglas) | S | |
| Editor de producto por pasos con la foto primero (8.3.20) y vista previa en la tienda con el borrador sin guardar (`/vista-previa/`, 8.3.21); el alta ya no crea un producto hasta guardar | 8.3 | Borrador del producto y vista previa con permiso de admin (no publicada, sin indexar) | M | |
| Calendario de entregas (capacidad por día, feriados, reprogramar, `.ics`); la spec solo prevé la fecha comprometida del pedido (**la capacidad está excluida en la sección 18**). En Polish 8.3.14–8.3.15 suma el modal de capacidad y feriados paginados y entradas propias por día (tareas y notas de un pedido) | 2 · 8.3 | Capacidad, feriados, fechas comprometidas y entradas del calendario como datos | M | |
| Cola de producción (**excluida en la sección 18**), insumos y costos con margen | 2 | Insumos, recetas y trabajos de producción como modelos | L | |
| Ficha de cliente con mascotas y recordatorios de cumpleaños (**excluido en la sección 18**) | 2 | Mascotas y recordatorios como modelos | M | |
| Emails automáticos: editor por bloques con fichas de datos, activar o pausar cada uno, cumpleaños de mascota y bandeja (los emails de cada cambio de estado **ya están en la spec**, sección 9) | 3 | Plantillas editables en la base y disparadores por estado; el envío usa React Email + Nodemailer de la spec | L | |
| Estudio de contenido para Instagram (post, historia, carrusel, PNG y video, texto sugerido); desde Polish 8.3.27 la oferta va en un cupón legible con valor, código y condición | 6 · 8.3 | Nada de servidor: se dibuja y graba en el navegador | M | |
| Inicio del panel con variación, gráficos y rendimiento del club (**"embudo de métricas" excluido en la sección 18**) | previa | Consultas agregadas en el servidor | M | |
| Buscador global y paginado (la guía de primera sesión se retiró en Polish 8.3.11) | previa, 1 | Nada de servidor (el paginado, en el servidor) | S | |

## Cambios a la spec que hay que decidir
1. **Aprobación del diseño**: ya no es una casilla; se confirma al agregar al carrito.
2. **Placas NFC**: Velmar vende placas con la imagen que elija el cliente, no chapitas identificatorias (confirmado por
   Ignacio el 09/10/2026).
3. **Panel sin login**: es a propósito y solo de la demo. En producción el panel va con autenticación y roles.
4. **Temáticas**: las fechas móviles (Día de la Madre, Pascuas, Orgullo) se ajustan cada año desde el panel.

## Lo que la demo no resuelve (aunque se vea)
- Cobros reales, webhooks de Mercado Pago, envío real de emails y datos compartidos entre dispositivos.
- Validar en el servidor: precios, stock, cupones, vigencias, límites de la ruleta y transiciones de estado.
- Fotos y productos reales del cliente (hoy son ilustraciones de muestra).
- La prueba en teléfonos reales: ver `docs/qa-dispositivos.md`.
