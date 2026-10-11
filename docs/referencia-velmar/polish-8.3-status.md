# Polish 8.3 · Panel admin — estado por ID

Rama `claude/polish-8-3-admin`, un commit por lote y un PR al final (pedido de Ignacio, fuera de la especificación). Plan de
8 lotes consolidado; los números de lote de las fichas de Notion son históricos. Cierre solo al final del Lote 8 con los 30
IDs verificados.

Estados: **hecho** (criterio cumplido y con evidencia) · **parcial** (existe algo, falta parte) · **pendiente** (no
implementado) · **no verificable** (no se puede probar acá).

| ID | Lote | Ruta / componente | Estado | Evidencia | Pendiente |
|---|---|---|---|---|---|
| 8.3.1 Gráfico de ventas interactivo | 1 | `/admin-demo/` · `SalesByDay`, `SalesChart`, `salesSummary` | hecho | `admin-polish-dashboard.spec.ts`, `admin.test.ts` (barras, tabla y KPI concilian) | — |
| 8.3.2 Sidebar responsive | 1 | `AdminShell`, `AdminSidebar`, `AdminTabBar`, variante `desk:` | hecho (emulado) | `admin-polish-shell.spec.ts` (1440, 1280, 1024 con mouse; 1024, 768, 390, 360 táctil) | Probar en iPad real |
| 8.3.3 Cards verticales en home | 1 | `Dashboard`, `OrderCard`, `DashboardInsights` | hecho (emulado) | `admin-polish-dashboard.spec.ts` (1440, 1024, 390, 360) | Probar en iPad real |
| 8.3.4 Filtros universales y vista Excel | 2 | `data-table/*`, `useTableState`, `sheet/*`, las 6 tablas | hecho (emulado) | `admin-polish-tables.spec.ts`, `admin-tables-83.test.ts` | Fichas completas de pago y reclamo (Lote 3); iPad real |
| 8.3.5 Detalles full-page y estados | 3 | `detail/DetailHeader`, `OrderDetail`, `payments/PaymentDetail`, `claims/ClaimDetail`, `order-tracks` | hecho (emulado) | `admin-polish-details.spec.ts`, `admin-details-83.test.ts` | — |
| 8.3.6 Organización premium de detalles | 3 | `OrderDetail`, `detail/Panel` | hecho (emulado) | `admin-polish-details.spec.ts` (1280, 768, 390) | Probar en iPad real |
| 8.3.7 Comprobantes: layout y estados | 3 | `payments/PaymentCard`, `PaymentDetail`, `ProofActions` | hecho (emulado) | `admin-polish-details.spec.ts`, `admin-flows.spec.ts` | Probar en iPad real |
| 8.3.8 Quitar Auditoría de muestra | 3 | `payments/PaymentsQueue` | hecho | `admin-polish-details.spec.ts`, `admin-flows.spec.ts` | — |
| 8.3.9 Clientes sin "Para escribirles" | 3 | `CustomersTable`, `WorkshopStrip` | hecho | `admin-polish-customers.spec.ts`, `admin-workshop.spec.ts` | QA global provisional: cierre en el Lote 8 |
| 8.3.10 Explicar estados y segmentos | 3 | `Help`, `help.ts`, filtros de Clientes, Pedidos, Insumos, Costos y Pagos | hecho | `admin-polish-customers.spec.ts`, `admin-details-83.test.ts`; calendario y producción: `admin-polish-workshop.spec.ts`, `admin-workshop-83.test.ts` | — |
| 8.3.11 Quitar guía inicial | 1 | `AdminShell` (sin `tour/`) | hecho | `admin-flows.spec.ts` (sin guía la primera vez ni después de reiniciar) | — |
| 8.3.12 Fila Cliente → ficha completa | 3 | `CustomersTable`, `CustomerProfile`, `listReturn` | hecho | `admin-polish-customers.spec.ts` | — |
| 8.3.13 Composición de ficha Cliente | 3 | `CustomerProfile`, `PetsCard`, `ClubCard`, `Reminders` | hecho (emulado) | `admin-polish-customers.spec.ts` (1280, 768, 390) | Probar en iPad real |
| 8.3.14 Modal de capacidad y feriados | 5 | `calendar/WorkshopSettingsDialog`, `CapacitySection`, `ClosuresSection`, `ImpactConfirm`, `workshop/schedule.ts` | hecho (emulado) | `admin-polish-workshop.spec.ts` (1440, 1280 y 1024 con mouse; 768 y 390 táctil), `admin-workshop.spec.ts`, `admin-workshop-83.test.ts` | Probar en iPad real |
| 8.3.15 Calendario editable y DnD | 5 | `calendar/DayDialog`, `EventForm`, `EventChip`, `dnd.ts`, `useCalendarMoves`, `MoveConfirm`, `ScheduleSheet`, `checkDrop` | hecho (emulado) | `admin-polish-workshop.spec.ts`, `admin-workshop.spec.ts`, `admin-workshop-83.test.ts` | Arrastrar con el dedo no está (en táctil se usa Reprogramar); probar en iPad real |
| 8.3.16 Kanban responsive | 5 | `production/ProductionBoard`, `ProductionCard` | hecho (emulado) | `admin-polish-workshop.spec.ts` (con y sin menú fijo), `admin-workshop-83.test.ts` | Probar deslizar carriles en iPhone y iPad reales |
| 8.3.17 Modales Costos e Insumos | 3 | `detail/EditDialog`, `RecipeSheet`, `MaterialDialog`, `edit-forms` | hecho (emulado) | `admin-polish-customers.spec.ts`, `admin-workshop.spec.ts`, `admin-details-83.test.ts` | — |
| 8.3.18 Insumos con tabla universal | 2 | `MaterialsTable`, `materialSheetSpec` | hecho (emulado) | `admin-polish-catalog.spec.ts`, `admin-tables-83.test.ts` | — (la fila abre el modal de 8.3.17) |
| 8.3.19 Productos y stock; sin Planilla | 2 | `nav.ts`, `ProductsTable`, `catalogTable`, `ModuleMoved` | hecho (emulado) | `admin-polish-tables.spec.ts`, `admin-crm.spec.ts`, `admin-routes.spec.ts` | — |
| 8.3.20 Editor con imagen primero y stepper | 4 | `ProductEditor`, `products/EditorSections`, `EditorStepper`, `EditorBar`, `useEditorNav`, `product-steps` | hecho (emulado) | `admin-polish-editor.spec.ts` (1440, 1024 con mouse; 768, 390 táctil), `admin-editor-83.test.ts` | Probar en iPad e iPhone reales (teclado en pantalla con la barra fija) |
| 8.3.21 Vista previa con regreso | 4 | `/vista-previa/` · `ProductPreview`, `ProductDetail` (`preview`), `products/editorDrafts` | hecho (emulado) | `admin-polish-editor.spec.ts`, `admin-editor-83.test.ts` | Probar Atrás con gesto en iPhone real |
| 8.3.22 Categorías: tabla y modal | 2 | `categories/*` (tabla, modal, detalle) | hecho (emulado) | `admin-polish-catalog.spec.ts`, `admin-tables-83.test.ts` | — |
| 8.3.23 Nueva misión en modal | 6 | `missions/MissionsAdmin`, `MissionDialog`, `missionDraft`, `mission-form.ts` | hecho (emulado) | `admin-polish-marketing.spec.ts`, `admin-flows.spec.ts`, `admin-marketing-83.test.ts` | — |
| 8.3.24 Marketing por cards | 6 | `/admin-demo/marketing/`, `marketing/HubCard`, `SubpageHeader`, `coupons/*`, `missions/*`, `emails/EmailsAdmin`, `EmailOutbox`, `EmailEditor`, `useSessionDraft` | hecho (emulado) | `admin-polish-marketing.spec.ts` (1280, 1024 con mouse; 768, 390 táctil), `admin-emails.spec.ts` | Probar en iPad real |
| 8.3.25 Ruleta arriba y premios | 6 | `coupons/WheelAdmin`, `PrizeDialog`, `PrizesAdmin`, `wheel-prizes.ts` | hecho (emulado) | `admin-polish-marketing.spec.ts`, `admin-marketing-83.test.ts`, `shop-polish-wheel.spec.ts`, `gamification.spec.ts` | — |
| 8.3.26 Header de Temáticas | 7 | `themes/ThemesAdmin`, `ThemeMode`, `marketing/SubpageHeader` | hecho (emulado) | `admin-polish-content.spec.ts` (1280 con mouse; 1180, 820 y 375 táctil), `themes.spec.ts` | Probar en iPad real (horizontal y vertical) |
| 8.3.27 Oferta en Estudio | 7 | `studio/render/offer.ts`, `templates.ts`, `carousel.ts`, `demo/admin/studio/offer.ts` | hecho | `admin-content-83.test.ts` (ubicación sin tapar producto ni precio), `admin-studio.spec.ts` (exportación), capturas 1:1, 9:16 y 4:5 con porcentaje, monto fijo, envío gratis, código de 15 y 16 letras y textos largos | — |
| 8.3.28 Contenido por cards y carrusel | 7 | `/admin-demo/contenido/` y subpáginas · `content/*`, `home/HeroSlide`, `content-slides.ts`, `SaveBar`, `savedInBrowser` | hecho (emulado) | `admin-polish-content.spec.ts` (imagen inválida, chica y válida, encuadre, texto largo, crear/ordenar/quitar, almacenamiento lleno), `admin-content-83.test.ts`, `shop-polish.spec.ts` (flechas del carrusel) | Probar la subida de foto desde la cámara de un iPhone real |
| 8.3.29 Ajustes por cards; sin Marca | 8 | `/admin-demo/ajustes/` y subpáginas · `settings/*`, `settings-form.ts`, `payments/CollectionEditor` (sin `BrandSync` ni editor de marca) | hecho (emulado) | `admin-polish-settings.spec.ts` (1280 con mouse; 1180, 820 y 375 táctil), `admin-settings-83.test.ts`, `admin-polish-details.spec.ts`, `cross-device.spec.ts` | — |
| 8.3.30 Datos de cobro desde Pagos | 3 | `payments/CollectionEditor`, `CollectionDialog`, `CollectionSettings` | hecho | `admin-polish-details.spec.ts`, `admin-details-83.test.ts`, `admin-polish-settings.spec.ts` | — |

## Lote 1 · registro

- **Base:** `main` en `9e9f828` (merge de Polish 8.2). Baseline: lint ✅, tipos ✅, 185 unit ✅; build y 218 e2e ✅ sobre el
  mismo árbol (corrida del cierre de 8.2).
- **Notion leído:** Contexto Eclipse, Eclipse Agency, Ficha Velmar, Roadmap demo v2, Polish 8.3, Prompt maestro 8.3, las
  30 fichas, Especificación técnica, Pagos y conciliación, Agentes. No existe una página "Referencia Notion": el estándar de
  tablas es el de 8.3.4.
- **Agentes:** `.claude/agents/velmar.md` y `frontend-architect` (local y en `Toti-Gauna/agents`); `cybersecurity-arquitect`
  disponible para el cierre. No existen en el repo de agentes Design-Architect, Documentador ni Ecommerce-Agent.
- **Decisión 8.3.2:** "escritorio" = desde 1024 px **y** mouse (puntero fino con hover). Así el iPad (táctil) usa
  hamburguesa y pestañas aunque mida 1024 o 1180 px, y nada depende del hover en pantallas táctiles. El riel se despliega
  encima del contenido (no lo corre); fijarlo sí lo corre, porque lo pide la persona.
- **Tiempo observado (automatizado):** lectura e inventario ~25 min; Lote 1 implementación y verificación ~70 min (incluye
  el arreglo del CI del PR #22). No incluye la revisión de Ignacio.

## Lote 2 · registro

- **Base:** commit del Lote 1 (`5306a8c`).
- **Tabla común (8.3.4):** filtros declarativos (`FilterSpec`) con el conteo de cada opción; el estado es un filtro más (sin
  filas de pestañas). Los que entran en el ancho real de la tabla quedan en la barra y el resto en "Más filtros" (container
  queries, sin medir con JS). Buscar, "Reiniciar filtros", 10 por página con número de página y total. Búsqueda, filtros,
  página y vista viven en la URL, así Atrás desde una ficha vuelve con el filtro puesto. Toda la fila abre su entidad; lo que
  tiene acción propia (checkbox, switch, stock, enlaces, botones) no navega. Pedidos y clientes abren su página completa y se
  retiraron sus paneles laterales (el patrón de navegación que pide el Lote 2; el resto de 8.3.5 y 8.3.12 sigue en el Lote 3).
- **Vista Excel:** la grilla de la ex Planilla se generalizó (`SheetGrid`, `useSheetGrid`, `SheetSpec`) y se abre al pie de
  las 6 tablas con los mismos filtros. Editan Productos y stock, Insumos y Categorías, con validación y un solo guardado por
  el engine (`updateProducts`, `updateMaterials`, `updateCategories`). Pedidos, Clientes y Costos son de solo lectura: estados y
  pagos no se tocan desde celdas. El borrador queda en `sessionStorage` hasta guardar o descartar. El `.xlsx` lleva todo lo
  filtrado, no solo la página, y lo dice al lado del botón.
- **Productos y stock (8.3.19):** una entrada en el menú; vista Productos | Variantes con los mismos filtros; Stock, Planilla e
  Importar salen del menú (Importar queda como acción del módulo y en ⌘K). `/admin-demo/stock/` y `/admin-demo/planilla/`
  redirigen conservando `?vista=reponer` y la búsqueda. Sin cambios en el formato guardado: lo de antes de 8.3 sigue igual.
- **Decisión a confirmar:** "Importar desde Excel" también salió del menú, porque la ficha pide que el menú tenga
  únicamente "Productos y stock" para este módulo. La ruta y el botón del módulo siguen.
- **Categorías (8.3.22):** tabla común, modal de alta (nombre, descripción, destacada; el nombre repetido se permite como
  antes y se avisa), detalle en `/admin-demo/categorias/detalle/?slug=`. El orden de la tienda es global: Subir/Bajar solo con
  la tabla en ese orden y sin filtros.
- **Fuera de las tablas:** Pagos, Reclamos y Cupones son listas de tarjetas; se revisan en los Lotes 3 y 6.
- **Tiempo observado (automatizado):** ~2 h 40 min de implementación y verificación. No incluye la revisión de Ignacio.

## Lote 3 · registro

- **Base:** commit del Lote 2 (`bb26d8e`).
- **Fichas completas (8.3.5, 8.3.6):** encabezado común (`DetailHeader`) con migas de pan, Volver a la lista con sus filtros
  y página, ID, estados y dato destacado. El estado de pago y el de producción y entrega se muestran por separado; los dos
  salen del estado único del engine (`order-tracks.ts`). Pedido reorganizado: próxima acción con los botones permitidos
  (con confirmación); después cliente, productos, pago y entrega; a la derecha historial, notas y emails. Pagos y reclamos
  tienen su ficha propia (`/admin-demo/pagos/detalle/`, `/admin-demo/reclamos/detalle/`).
- **Comprobantes (8.3.7, 8.3.8):** cola con filtro por estado en la URL, diez por página y tarjetas con el comprobante a la
  izquierda y los datos a la derecha. Sin "Auditoría de muestra" en pantalla: el store y el historial la conservan.
- **Clientes (8.3.9, 8.3.10, 8.3.12, 8.3.13):** sin el bloque "Para escribirles"; para no perder lo que avisaba hay un filtro
  "Para escribir" y el inicio enlaza a él. Botón "i" con las definiciones del engine (también en Pedidos, Insumos, Costos y
  Pagos). La ficha suma Club (misiones y premios que ya guardaba el usuario) y se arma con columnas solo cuando entran.
- **Modales (8.3.17):** Costos e Insumos se editan en un modal con frase inicial, bloques, validación y un solo guardado;
  cerrar con cambios pide confirmar. "Nuevo insumo" ya no crea uno vacío antes de guardar.
- **Datos de cobro (8.3.30):** un editor (`CollectionEditor`) con una sola fuente, usado en Ajustes y en el modal de Pagos.
- **Tiempo observado (automatizado):** ~2 h 30 min de implementación y verificación. No incluye la revisión de Ignacio.

## Lote 4 · registro

- **Base:** commit del Lote 3 (`41354f5`).
- **Editor por pasos (8.3.20):** alta y edición usan los mismos bloques, en este orden: foto y texto alternativo, datos
  generales, categoría/precio/plazo/visibilidad, variantes, medidas de envío, personalización y revisión. Nada del formulario
  anterior se perdió. Los pasos van en una columna a la derecha cuando el editor tiene lugar (container query, desde ~900 px
  de ancho útil) y en una fila compacta fija arriba en tablet y celular. El estado de cada paso sale de validar
  (`product-steps.ts`), no de haberlo visitado: los errores se marcan después de intentar guardar; las medidas faltantes
  avisan pero no bloquean. Tocar un paso lleva al bloque debajo de lo fijo y enfoca su título, sin guardar ni descartar.
  La barra de guardado flota encima de las pestañas del celular y, al final, ocupa su propio lugar; lo fijo de arriba y de
  abajo se mide y pasa a `scroll-padding`, así un campo enfocado con Tab no queda tapado.
- **Texto alternativo obligatorio:** pasa a ser requisito para guardar (lo pide el bloque de foto). Todos los productos de
  la demo ya tienen uno (el nombre), así que lo guardado antes de 8.3 sigue guardándose igual.
- **Vista previa (8.3.21):** "Ver en tienda" guarda un borrador de la pestaña (campos, foto, variantes, personalización,
  paso y scroll) y abre `/vista-previa/?borrador=…`, que usa la misma ficha de la tienda con ese borrador: sin comprar,
  regalar ni favoritos, sin recomendaciones, sin WhatsApp ni "Probar temáticas", y una franja fija con "Volver al editor" o
  "Volver a la creación". Volver usa Atrás cuando se llegó desde el editor (y Atrás del navegador hace lo mismo); si no,
  navega al editor y al paso. La ruta no se indexa y no se agregó ningún endpoint.
- **Alta sin productos fantasma:** "Nuevo producto" (y el atajo de ⌘K) abre `/admin-demo/productos/editar/?nuevo=1` con un
  borrador de id temporal (`producto-nuevo-…`) que no existe en el catálogo hasta "Guardar" (antes se creaba un "Producto
  nuevo de ejemplo" pausado al tocar el botón). Ir y volver de la vista previa no crea nada; guardar crea uno solo, pausado
  salvo que se active.
- **Borrador:** vive en memoria y en `sessionStorage` (`velmar-ui:product-draft:<clave>`), solo mientras hay cambios; si se
  sale del editor sin guardar, al volver se recupera con aviso y opción de descartar (con confirmación). Un borrador roto o
  de otra versión se ignora. No se toca `localStorage` ni el formato de los datos guardados.
- **Verificación:** lint ✅, tipos ✅, 233 unit ✅, build ✅, e2e 293/294. El que falló fue el recorrido D de
  `shop-polish-journeys` a 1180 × 820 (clic en la miga de pan justo después de "Atrás": el router todavía terminaba la
  navegación y el clic se perdía; no tiene que ver con este lote). Repetido 24/24 sin cambios; el test ahora espera la
  URL del "Atrás" y reintenta el clic si se pierde, y la spec completa pasa 36/36. `admin-polish-content` pasó 16/16
  en dos vueltas.
- **Tiempo observado (automatizado):** ~3 h de implementación y verificación. No incluye la revisión de Ignacio.

## Lote 5 · registro

- **Base:** commit del Lote 4 (`955f17c`).
- **Capacidad y feriados (8.3.14):** el panel lateral pasa a un modal centrado (pantalla completa en el celular) con dos
  tarjetas: "Capacidad y horarios" y "Días cerrados y feriados"; la elegida se abre debajo, en el mismo modal. Capacidad,
  sábados y domingos son un borrador hasta "Guardar", con las reglas que usa el calendario a la vista. Los feriados
  nacionales cargados van separados de los cierres del taller, por año ("Próximos", 2026, 2027, "Todos") y de a 10 por
  página. Un feriado se puede trabajar y volver a cerrar; los cierres propios se agregan, editan y quitan (quitar pide
  confirmación). Si un cambio deja entregas en un día cerrado o sobrecargado, primero se lista y se confirma
  (`scheduleImpact`); los pedidos nunca se mueven solos y quedan marcados en el calendario ("Día cerrado: reprogramar").
- **Calendario editable (8.3.15):** tocar cualquier parte de un día abre un modal con sus entregas, sus entradas y si el
  taller trabaja. Las entradas propias (tarea o nota de un pedido, con título, fecha, notas y vínculo al pedido) se
  crean, editan, quitan y arrastran; persisten en el store de la demo (`workshop.events`, con las de muestra si faltan o
  vienen rotas). Desde el mismo modal se cierra el día. Arrastrar un pedido pide confirmar antes de cambiar su fecha; un
  día pasado, cerrado o completo no lo acepta: se marca "No se puede: …" mientras se arrastra y, si se suelta, se explica
  por qué (`checkDrop`). Sobrecargar un día solo desde "Reprogramar", confirmándolo. La ficha de entrega sigue siendo la
  alternativa sin arrastrar (teclado, iPad y celular). Con movimiento reducido, sin animación al pasar el mouse.
- **Decisión:** un día completo ahora rechaza el pedido arrastrado (antes lo aceptaba y avisaba), porque la ficha pide
  que un destino lleno "informe por qué no puede soltarse"; sobrecargar sigue siendo posible desde Reprogramar.
- **Cola de producción (8.3.16):** cada etapa tiene un ancho mínimo legible (16 rem en escritorio, 17 en tablet, casi
  todo el ancho en el celular) y el tablero se desliza de costado dentro de su caja: la página no se corre, con el menú
  fijo o no. En tablet y celular, carriles con encastre y atajos por etapa que se marcan solos al deslizar. Cada tarjeta:
  pedido, cliente, vencimiento, productos con variante y lo aprobado; abajo "Mover etapa" (solo las etapas permitidas) y
  la etapa siguiente. Arrastrar a una etapa inválida se atenúa, no se acepta y explica por qué. Los insumos se descuentan
  una sola vez (ir y volver entre En máquina y Terminación no descuenta de nuevo).
- **8.3.10 completo:** botón "i" en el calendario (qué ocupa lugar, completo, sobrecargado, atrasado, cerrado, entradas)
  y en producción (etapas y reglas), armados con las reglas del engine.
- **Verificación:** lint ✅, tipos ✅, 233 unit ✅, build ✅, e2e 293/294. El que falló fue el recorrido D de
  `shop-polish-journeys` a 1180 × 820 (clic en la miga de pan justo después de "Atrás": el router todavía terminaba la
  navegación y el clic se perdía; no tiene que ver con este lote). Repetido 24/24 sin cambios; el test ahora espera la
  URL del "Atrás" y reintenta el clic si se pierde, y la spec completa pasa 36/36. `admin-polish-content` pasó 16/16
  en dos vueltas.
- **Tiempo observado (automatizado):** ~3 h de implementación y verificación. No incluye la revisión de Ignacio.

## Lote 6 · registro

- **Base:** commit del Lote 5 (`841af7b`).
- **Nueva misión en modal (8.3.23):** "Nueva misión" y "Editar" abren un modal centrado con los mismos campos (título,
  premio, tipo, umbral, descripción, encadenar, activa) y una frase de qué se completa y qué produce guardar. Los
  errores van junto a cada campo con las mismas reglas de antes (`mission-form.ts`). Cerrar, Escape o Cancelar no guardan
  y el borrador queda en la pestaña: al reabrir se recupera con aviso ("Empezar de nuevo" lo descarta); guardar lo
  borra. La misión nueva tiene su ID desde que se abre el modal, así que guardar crea una sola.
- **Marketing por tarjetas (8.3.24):** entrada nueva `/admin-demo/marketing/` ("Resumen" en el menú) con una tarjeta por
  herramienta del grupo; las entradas del menú siguen. "Cupones y ruleta" pasa a tres tarjetas con su subpágina:
  Cupones (`/cupones/lista/`), Configuración de ruleta (`/cupones/ruleta/`) y Premios disponibles (`/cupones/premios/`).
  Misiones muestra sus tarjetas y el simulador pasa a `/misiones/simular/`. Emails muestra una tarjeta por plantilla
  (abre su editor) y la bandeja pasa a `/emails/enviados/` (el enlace viejo `?vista=enviados` lleva ahí). Cada subpágina
  tiene migas de pan y "Volver a [sección]". En el editor de email el título usa todo el ancho, las acciones van en su
  propia fila y hay accesos a cada parte (asunto, fichas, bloques, vista previa) sin cortar el flujo. Los cambios sin
  guardar del editor de email y de la ruleta quedan en la pestaña al salir y volver, con aviso y "Descartar cambios"
  (con confirmación).
- **Decisión:** las tarjetas de entrada se armaron con los módulos que ya existen (no se inventaron secciones). En
  Misiones y Emails la lista principal sigue a la vista y solo la tarea aparte (simular, bandeja) pasó a otra página.
- **Ruleta y premios (8.3.25):** la vista previa va arriba y centrada en todos los tamaños; debajo, visibilidad,
  vigencia y los gajos. Cada gajo elige su premio de una lista del catálogo (ID estable), con la condición a la vista;
  ya no hay texto libre. "Agregar premio" abre un modal con las plantillas que el engine ya convierte en cupón
  (porcentaje, monto fijo, envío gratis, grabado gratis y producto de regalo, que se descuentan como monto fijo); el
  premio queda en el catálogo y se puede elegir. No se guarda una ruleta visible sin peso positivo, con vigencia fuera
  de 1–90 días o con un gajo sin premio. Las ruletas guardadas antes arman su catálogo desde sus gajos, sin cambiar IDs;
  los cupones ya entregados no cambian.
- **Tiempo observado (automatizado):** ~2 h 30 min de implementación y verificación. No incluye la revisión de Ignacio.

## Lote 7 · registro

- **Base:** commit del Lote 6 (`4277a5c`).
- **Temáticas (8.3.26):** el encabezado usa el mismo de las subpáginas de Marketing (migas, "Volver a Marketing",
  título y texto). "Cómo se elige" se acomoda por ancho del bloque: el selector de modo tiene un ancho mínimo legible
  (sin cortar "Automática según la fecha") y las tarjetas "Hoy ve el cliente" / "Próxima por fecha" se apilan cuando no
  entran. La temática fija solo aparece en modo fijo, así no se confunde con la que sale por fecha; cada modo trae una
  línea que explica qué hace. "Próxima por fecha" aclara que en modo fijo no cambia sola. Estudio de contenido usa el
  mismo encabezado. Modos, fechas, previews y el botón "Probar temáticas" no cambian.
- **Oferta en el Estudio (8.3.27):** el sello circular (que cortaba el código con "…" y dejaba la condición en una
  píldora diminuta, en el post incluso fuera de la pieza) pasa a un cupón: valor grande con "OFF" al lado, línea
  punteada con muescas, "CÓDIGO" y el código, y la condición de compra en una franja propia. Sombra suave, giro leve y
  colores de la temática. El texto se achica antes de cortarse y se acomoda en dos líneas parejas; solo un código de más
  de ~18 letras (el máximo del formulario es 20) llevaría "…" en el post. En el post la tarjeta baja lo justo para que el
  cupón solo se apoye en su borde y la decoración se corre a su izquierda; en la historia va al costado de la tarjeta;
  en la última diapositiva del carrusel es el protagonista. Sin oferta, la pieza queda igual que antes. Todo sale del
  cupón de la temática (`themeOffer`); la animación de entrada y la exportación no cambian.
- **Contenido (8.3.28):** `/admin-demo/contenido/` muestra tres tarjetas (Carrusel, Textos de inicio, Preguntas
  frecuentes) y cada una abre su página (`/contenido/carrusel/`, `/textos/`, `/preguntas/`) con migas, "Volver a
  Contenido", borrador en la pestaña y barra de guardar/descartar. Guardar una no toca las otras.
- **Carrusel:** vista previa arriba con la diapositiva elegida, usando la misma diapositiva del inicio (`HeroSlide`,
  extraída del carrusel de la tienda) al ancho que tiene en la tienda y achicada para entrar entera. Debajo, lista
  compacta y el editor de una diapositiva: imagen (ilustración de la demo o imagen propia), texto alternativo, encuadre
  (horizontal, vertical y acercar), título, bajada y botón con contador, destino y visibilidad; subir, bajar, quitar y
  agregar. La imagen propia se valida (JPG, PNG o WEBP, hasta 10 MB, al menos 400 px de lado), se achica a 900 px en
  JPEG y se guarda solo en este navegador. Si el navegador no tiene lugar, se avisa y el borrador sigue en el editor
  (lo guardado no cambia). Datos guardados antes: sin cambios; una imagen rota se descarta y queda la ilustración.
- **Decisión:** la vista previa no tiene selector celular/computadora: muestra la diapositiva como la ve la tienda en
  la pantalla actual (en celular, el diseño de celular). Los textos largos se marcan con contador y error al guardar en
  vez de cortarse sin aviso.
- **Verificación:** lint ✅, tipos ✅, 233 unit ✅, build ✅, e2e 293/294. El que falló fue el recorrido D de
  `shop-polish-journeys` a 1180 × 820 (clic en la miga de pan justo después de "Atrás": el router todavía terminaba la
  navegación y el clic se perdía; no tiene que ver con este lote). Repetido 24/24 sin cambios; el test ahora espera la
  URL del "Atrás" y reintenta el clic si se pierde, y la spec completa pasa 36/36. `admin-polish-content` pasó 16/16
  en dos vueltas.
- **Tiempo observado (automatizado):** ~3 h de implementación y verificación. No incluye la revisión de Ignacio.

## Lote 8 · registro

- **Base:** commit del Lote 7 (`967b129`).
- **Ajustes por tarjetas (8.3.29):** `/admin-demo/ajustes/` muestra cuatro tarjetas con su estado (Contacto y WhatsApp,
  Medios de pago, Datos de cobro, Envíos y retiro) y cada una abre su página (`/ajustes/contacto/`, `/pagos/`,
  `/cobro/`, `/envios/`) con migas, "Volver a Ajustes", borrador en la pestaña y barra de guardar/descartar. Guardar
  una sección solo cambia sus campos. Reglas de antes (WhatsApp de 10 a 15 dígitos, al menos un medio, descuento hasta
  50 %, reserva de 1 a 168 h); nuevo: un código postal mal escrito se avisa en vez de descartarse en silencio y el
  plazo de cada forma de entrega no puede quedar vacío. Datos de cobro usa el mismo editor que el modal de Pagos
  (ahora separado en campos + formulario: el modal sigue igual y cancelar no guarda).
- **Sin Marca:** se retiró el bloque "Marca (paleta provisional)", sus selectores de color y la mención en el texto de
  entrada. La tienda usa siempre la paleta de Velmar (`brand.ts`) y las temáticas siguen cambiándola en sus fechas.
  Se quitó `BrandSync`, que aplicaba los colores guardados desde el panel: si alguien había probado otra paleta, ese
  dato queda guardado pero ya no se aplica (migración no destructiva). Los emails usan el color de Velmar.
- **Migas del encabezado:** en Ajustes ya no dice "Ajustes › Ajustes".
- **QA integral:** el barrido de `cross-device` (rutas sin errores de consola ni desborde, señal de demo a la vista)
  suma las 13 subpáginas nuevas de 8.3 (Marketing, Cupones, Misiones, Emails, Contenido y Ajustes). Matriz de los 30 IDs
  revisada: todos en "hecho", la mayoría "(emulado)" porque se probaron con emulación, no en equipos reales.
- **Verificación:** lint ✅, tipos ✅, 237 unit ✅, build ✅, e2e 301/301 ✅ (incluye `admin-polish-settings` y el barrido de
  `cross-device` con las 35 rutas del panel en cuatro equipos emulados).
- **Tiempo observado (automatizado):** ~1 h 30 min de implementación y verificación. No incluye la revisión de Ignacio.

## Cierre de Polish 8.3

- **30 de 30 IDs hechos**: 8 "hecho" y 22 "hecho (emulado)" (verificados con emulación de mouse y táctil, de 1440 a 320 px).
- **Para probar en equipos reales antes de dar por cerrado en Notion:** iPad horizontal y vertical (riel, tablas,
  Temáticas, calendario y tablero), iPhone (barra de guardar del editor con el teclado abierto, Atrás con gesto en la
  vista previa, subir foto desde la cámara al carrusel) y Android de gama media (fluidez del tablero y del Estudio).
- **Sin cambios de alcance:** sin backend, OAuth, SMTP, APIs externas ni cobros reales; datos ficticios y aviso de demo
  en todas las pantallas.

