# Panel `/admin-demo/` · análisis UX/UI para el rediseño R1–R4

Área: todo el panel del dueño (shell, navegación y las 30 rutas). Miré las capturas comunes (`shots/admin-demo*`) y
saqué otras propias en `analisis/panel/shots/`:
- `d-*.png`: escritorio con el mouse fuera del riel, porque en las comunes el riel aparece abierto tapando el contenido;
- `s-*.png`: estados interactivos (⌘K, aumentar precios, liquidar, control de lote, aprobar comprobante, menú "Más"
  del celular, modo claro, importar la lista del proveedor).

Los recortes legibles están en `analisis/panel/crops/`. Fecha fija de la demo: **domingo 4/10/2026**
(`src/demo/fixtures/admin-orders.ts:6`).

**En una línea:** el panel ya hace muchísimo y casi todo funciona, pero **piensa como el taller de Velmar**:
- 21 entradas de menú;
- un tablero de producción;
- recetas e insumos;
- un inicio de KPIs sueltos.

**Le falta lo que un dueño de suplementos hace todo el día:**
- vender en el mostrador y cargar lo que cerró por WhatsApp;
- contestar "¿tenés whey de vainilla?";
- mandarle la vuelta al cadete;
- pelear con la inflación.

Lo mejor que ya tiene (recompra calculada, lotes con FEFO, importar la lista, aumento masivo, compra sugerida) está
desparramado en 6 pantallas en vez de llegarle como una lista del día.

---

## 1. Inventario

### Shell
| Pieza | Qué hay | Para qué |
|---|---|---|
| Riel de escritorio (`AdminSidebar.tsx`) | Íconos con punto de aviso; se abre encima del contenido al pasar el mouse; "Fijar el menú abierto". 5 grupos y **21 entradas** (`nav.ts:23-48`) | Navegación |
| Barra superior (`AdminTopbar`) | Franja "Panel de demostración · datos ficticios…", migas, buscador ⌘K, Ver tienda, sol/luna, Reiniciar demo | Contexto y atajos |
| Celular | Barra superior con hamburguesa, buscar, tema y reiniciar, más una cápsula flotante con Inicio, Pedidos, Pagos, Productos y Más. "Más" abre el mismo menú completo en una hoja | Navegación con el pulgar |
| ⌘K (`CommandPalette.tsx`) | Secciones, acciones, pedidos, productos y clientes | Saltar rápido (`s-cmdk-whey.png`) |
| Encabezado de página | Eyebrow, H1 display de 5xl con "(demo)" en amarillo, párrafo explicativo de 2–3 líneas y acciones | Todas las rutas |

### Pantallas
| Ruta | Qué hay | Para qué le sirve al dueño |
|---|---|---|
| `/admin-demo/` Inicio | En este orden:<br>• "Buen día, Volta (demo)" y 4 KPI (ventas 7 días con sparkline, ticket, en marcha, comprobantes)<br>• embudo de 7 estados<br>• "Operaciones" (4 tarjetas)<br>• Recompras de la semana y Próximos a vencer<br>• ventas por día y más pedidos<br>• últimos pedidos, Club, actividad y "Reclamos de ejemplo"<br>Mide 2.790 px en escritorio y **5.530 px en el celular** | "Lo abrís a la mañana con el mate" (guion) |
| `pedidos/` | Tabla común con filtros, lote, Excel y tarjetas en el celular | Ver y mover pedidos |
| `pedidos/detalle/` | Dos estados: pago y "preparación y entrega". Tarjeta **"Próxima acción"**, cliente, productos con lote, pago, entrega con fecha comprometida, historial, notas y emails enviados | Atender un pedido |
| `pagos/` y `pagos/detalle/` | Cola Por revisar, Esperando y Resueltos, con comprobante de muestra, monto esperado y Aprobar o Rechazar con motivo | Validar transferencias y QR |
| `usuarios/` y `ficha/` | Segmentos (se le termina, atrasada, VIP…), objetivo y "Se le termina". La ficha trae batería por pote, Avisarle por email o WhatsApp, objetivo, cumpleaños, club y notas | Recompra |
| `reclamos/` | Lista de tarjetas y ficha con en curso, resolver o rechazar | Postventa |
| `preparacion/` | Kanban: Por preparar → Armando → **Control de lote** → Listo. Arrastrar, "Mover etapa" o botón siguiente, y un modal para tildar lotes (`s-controlar-lotes.png`) | Armar pedidos |
| `calendario/` | Mes, semana y agenda; cupo del cadete (2 por día), feriados, arrastrar para reprogramar, .ics y una leyenda de 9 estados | Despachos |
| `proveedores/` | Compra sugerida por distribuidora con total al costo, mínimo, próxima entrega, mensaje para WhatsApp, "Marcar como pedido" y recibir. Pestañas Stock mínimo y Proveedores | Reponer |
| `costos/` | Margen objetivo, tabla de proveedor + embalaje = costo, ganancia, margen y sugerido. La receta se edita en un modal | Rentabilidad |
| `insumos/` | 9 insumos de embalaje con stock, mínimo, "piden los pedidos" y comprar | Cajas, bolsas, sachets |
| `productos/` | Avisos de vencimientos y reposición, filtros, vista por producto o por variante, pausar, "Aumentar precios" (`s-aumentar.png`), importar y "Nuevo producto" | Catálogo y stock |
| `productos/editar/` | Editor de 7 pasos:<br>1. foto y alt<br>2. datos<br>3. categoría y **precio base ilustrativo**<br>4. variantes con **recargo**<br>5. medidas de envío<br>6. marca, objetivos y sellos<br>7. revisión | Alta y edición |
| `?formato=excel` | Grilla editable tipo Excel | Edición masiva |
| `importar/` | 4 pasos con plantillas y la lista de ejemplo de una distribuidora (`s-import-1.png`) | Cargar la lista de precios |
| `categorias/` | Tabla común de 11 categorías (¡paginada, 2 páginas!) y editor de los 7 objetivos | Orden de la tienda |
| `marketing/` | Hub de 7 tarjetas "Abrir →" | Entrada |
| `misiones/` y `simular/` | 3 misiones con modal y simulador | Club |
| `emails/` y `editar/` | 10 plantillas en tarjetas grandes; editor por bloques con fichas de datos y vista previa escritorio/celular; bandeja de salida | Avisos automáticos |
| `cupones/` | Hub de 4 tarjetas: lista de cupones, ruleta (vista previa y 8 gajos con peso), premios disponibles y premios del juego (niveles con simulador de puntaje) | Promos |
| `descuento-stack/` | % y categorías mínimas con vista previa real | Regla del stack |
| `tematicas/` | Modo (automática, fija o ninguna), "Hoy ve el cliente", "Próxima" y 12 tarjetas con habilitar, ver y editar | Fechas |
| `estudio/` | Plantilla, fecha, productos (25 chips), textos, video, 3 formatos y texto sugerido con "Otra idea" | Instagram |
| `contenido/` | Hub: carrusel, textos de inicio y preguntas | Textos de la tienda |
| `ajustes/` | Hub: contacto/WhatsApp (**"Sin número"**), medios de pago, datos de cobro y envíos | Configuración |

---

## 2. Herencia Velmar (lo que delata el origen)

La documentación de Velmar (`docs/referencia-velmar/panel-demo.md`, secciones "Cómo funciona" e "Implementado")
describe este panel casi línea por línea. Cambió la piel, no el pensamiento.

| # | Qué | Evidencia | Por qué se nota |
|---|---|---|---|
| 1 | **Shell idéntico**: riel colapsado que se abre al pasar el mouse con "Fijar el menú abierto", migas, ⌘K, "Ver tienda" y "Reiniciar demo", y pestañas inferiores Inicio, Pedidos, Pagos, Productos y Más | Velmar 8.3.2 y `AdminSidebar.tsx`. Todas las capturas `d-*.png` | Es el mismo esqueleto. Hasta el guion trae un plan B: "La barra lateral del panel tapa la pantalla: corré el mouse" (`docs/guion-demo.md:235`) |
| 2 | **Grupos del menú**: Ventas, Taller → "Operaciones", Catálogo, Marketing y Ajustes | `nav.ts:4` y el comentario `nav.ts:29` "(antes, el taller de Velmar)" | Mismo orden y misma lógica de taller |
| 3 | **Inicio = el de Velmar**: KPIs con sparkline, embudo por estado, gráfico con tabla, más vendidos, rendimiento del club, actividad reciente, últimos pedidos y reclamos. El "resumen del taller" pasó a llamarse "Operaciones" | `Dashboard.tsx:22-78`; el componente se sigue llamando `WorkshopStrip` | Se agregaron recompras y vencimientos en el medio, pero el resto es un tablero genérico |
| 4 | **Preparación = "Cola de producción"** (A fabricar → En máquina → Terminación → Listo) con otras etiquetas. Mismo arrastre, mismo "Mover etapa" y mismo "se descuentan los insumos una sola vez" | `src/demo/admin/workshop/preparation.ts:12-16` y `PreparationBoard.tsx:38` (`materialRows`) | Un revendedor no "produce": arma una bolsa en 2 minutos. Cuatro columnas de kanban son de taller |
| 5 | **Costos = recetas** e **Insumos = materiales del taller** (antes filamento, MDF y cera; ahora cajas y cinta) | `features/admin/workshop/RecipeSheet.tsx`, el tipo `Recipe` en `fixtures/workshop` y `MaterialsTable.tsx`. Captura `d-insumos-0.png` | Modelo de fabricante, no de revendedor |
| 6 | **Calendario de entregas** con "capacidad por día" del taller, ahora "cupo del cadete". Mismo modal "Capacidad y feriados", mismo arrastre y mismo .ics | Velmar 8.3.14-15. Captura `d-calendario-0.png` | La capacidad era de máquina. El cadete no funciona por cupo de 2 |
| 7 | **Editor de producto de Velmar 8.3.20**:<br>• primero "Foto y texto alternativo";<br>• "Precio base ilustrativo" y "Plazo si es por encargo";<br>• variantes con **recargo**;<br>• "Medidas de envío" como paso propio | `EditorSections.tsx:74-75`, `VariantsEditor.tsx:35`. Captura `d-productos_editar_id_ionic-whey-*.png` | En suplementos cada presentación tiene su precio. El "+$62.000" de la de 5 lb es lógica de recargo por personalización |
| 8 | **Tabla común + "Ver en formato Excel" + Columnas/Cómoda + 10 por página** en todo, incluso para 11 categorías | Velmar 8.3.4 y 8.3.22. Captura `d-categorias-1.png` ("página 1 de 2") | Patrón genérico aplicado sin criterio de volumen |
| 9 | **Hubs de tarjetas "Abrir →"** en Marketing, Cupones y ruleta, Contenido y Ajustes | Velmar 8.3.24-29. Capturas `d-marketing-0`, `d-cupones-0`, `d-contenido-0`, `d-ajustes-0` | Un clic extra en cada herramienta |
| 10 | **Emails por bloques con fichas**, idéntico al de Velmar (sin el cumpleaños de mascota) | Captura `d-emails_editar*` | Bien hecho, pero el canal real del rubro es WhatsApp |
| 11 | **Misiones, ruleta, premios con plantillas, temáticas con modo automático/fijo y Estudio con 3 formatos** | Velmar 8.3.23-26 | Las 8 herramientas de marketing de Velmar siguen siendo 8 entradas |
| 12 | **Lenguaje visual**:<br>• `rounded-3xl`;<br>• botones y toggles pastilla;<br>• H1 enorme con "(demo)";<br>• párrafo instructivo en cada página;<br>• volt como relleno de casi todos los botones | `Dashboard.tsx:72` ("rounded-3xl"), `WorkshopStrip.tsx:36`. Todas las capturas | Es lo que `plan-rediseno.md` llama "lenguaje suave y hecho a mano" |
| 13 | **Modelo interno**: `s.workshop.*` (perfiles de clientes, materiales, recetas) | `useNavCounts.ts:18`, `customers/ProfileCard.tsx:17` | No se ve, pero confirma que todo cuelga del taller |

---

## 3. Problemas de UX/UI

### Alta
| # | Problema | Evidencia |
|---|---|---|
| A1 | **El inicio no dice qué hacer hoy.**<br>• **Repite la misma info 4 veces**: los comprobantes salen en el saludo, el botón, el KPI y el embudo.<br>• **Mezcla métricas de vanidad**: el Club da "0 premios de ruleta" y "0 de Shaker Rush", y la actividad es "Datos de muestra cargados".<br>• **Recién en el 5.º bloque** aparece lo accionable: recompras y vencimientos.<br>• **En el celular son 6,5 pantallas.**<br>• **El saludo y la fecha no cierran**: "Buen día, Volta" saluda a la tienda y no al dueño, y la fecha fija es un domingo, con el local y el cadete cerrados | `d-home-*.png`, `admin-demo-390.png`, `Dashboard.tsx:35,68-72` |
| A2 | **No hay forma de registrar una venta del mostrador ni un pedido cerrado por WhatsApp o Instagram.** Para el dueño que vende así, es el 50–80 % de sus ventas. Si esas ventas no están, el stock, la recompra, la compra sugerida y el "vendido hoy" mienten. Los pedidos no tienen canal | `AdminOrder` sin `channel` (`src/demo/admin/types.ts:20-43`). No existe "Nuevo pedido" |
| A3 | **21 entradas de menú.** Con 900 px de alto, **Marketing y Ajustes quedan debajo del pliegue**, en un `nav` con scroll y la barra oculta (`no-scrollbar`). En el riel cerrado solo se ve un "-". En la hoja "Más" del celular, el pie "Volta (demo)" tapa los ítems de Marketing | `AdminSidebar.tsx:41`, `s-m-mas.png`, `d-home-0.png` (el "-" en y≈745) |
| A4 | **El riel se abre solo encima del contenido** apenas el mouse pasa por el borde izquierdo (pasa en todas las capturas comunes). El guion necesita un plan B para eso | `shots/admin-demo*-1440.png`, `guion-demo.md:235` |
| A5 | **El modelo de precio es de Velmar**: "Precio base ilustrativo" más "Recargo" por variante. Además, **la tabla nutricional, el modo de uso y los servicios no se editan** ("vienen con la ficha del proveedor"). El dueño no puede dar de alta un producto nuevo completo, y eso choca con R2 (hoja técnica y comparador) | `d-productos_editar*-1.png`/`-2.png`, `VariantsEditor.tsx:35` |
| A6 | **Preparación pide 4+n toques por pedido**:<br>1. Armando<br>2. Control de lote<br>3. Controlar lotes<br>4. tildar n productos<br>5. Listo<br>En el celular el tablero es un carrusel horizontal de columnas: se ve una sola. No hay **lista de picking consolidada** ("sacá 2 barras de maní del lote VL-2604-B") ni **hoja de ruta del cadete** | `admin-demo_preparacion-390.png`, `d-preparacion-0.png` |

### Media
| # | Problema | Evidencia |
|---|---|---|
| M1 | **Densidad en el celular**: H1 de 2 líneas + "(demo)" + párrafo de 4–6 líneas + 2–3 botones apilados antes del contenido. En el Calendario, la grilla arranca a ~700 px | `admin-demo_calendario-390.png`, `admin-demo_productos-390.png` |
| M2 | **Señal de demo por triplicado**: franja + "(demo)" junto a cada H1 + "(muestra)" y "(demo)" en subtítulos + "Datos ficticios" en el menú + "ficticios" en los párrafos. La franja alcanza (AGENTS la exige); el resto ensucia la jerarquía | Todas las `d-*.png` |
| M3 | **Paginación de 10** en listas cortas: 11 categorías en 2 páginas, 25 productos en 3 y 23 pedidos en 3. Para una tienda de 25–150 productos, scroll y filtros alcanzan | `d-categorias-1.png`, `d-productos-1.png` |
| M4 | **El Total del pedido queda cortado** a 1440 px, justo la columna que más importa: scroll horizontal dentro de la tabla, con "Productos" truncado ("Ionic Whey…") | `d-pedidos-0.png` |
| M5 | **"Stock bajo · 139"** en Barra proteica: la suma dice que hay de sobra y la insignia dice "bajo" (una sola variante está baja). Confunde | `d-productos-0.png` |
| M6 | **Vista Excel con celdas corridas**: en las filas "Cookies & cream 2 lb y 5 lb", Marca y Lote se desplazan a la derecha | `d-productos_formato_excel-0.png` |
| M7 | **Inflación sin herramientas a la vista**:<br>• "Aumentar precios" sube el precio pero no muestra el **margen resultante** ni ofrece "actualizar costo y mantener margen";<br>• Costos no dice **de cuándo es cada costo**;<br>• Liquidar no muestra cuánto se gana o se pierde con el descuento | `s-aumentar.png`, `d-costos-0.png`, `s-liquidar.png` |
| M8 | **La compra sugerida usa mínimo y objetivo fijos**, no la rotación: no dice "te quedan 6 días de Ionic Whey chocolate al ritmo actual" | `d-proveedores-0.png` |
| M9 | **El WhatsApp es de segunda**:<br>• la ficha del pedido no tiene "Escribirle por WhatsApp";<br>• las 10 plantillas son solo email;<br>• Ajustes → Contacto dice "Sin número" | `d-pedidos_detalle*`, `d-emails-0.png`, `d-ajustes-0.png` |
| M10 | **Hubs intermedios** en Marketing, Cupones, Contenido y Ajustes: 1 clic más y tarjetas con "Abrir →" genérico. Marketing "Resumen" es una entrada de menú que repite el menú | `d-marketing-0.png`, `d-cupones-0.png` |
| M11 | **El volt rellena casi todos los botones**: en la lista de recompras hay 4 botones volt seguidos, 10 "Editar" volt en Emails y "Armando", "Liquidar" y "Aprobar" también. No hay jerarquía de acción y contradice "el voltio como luz de señal" | `d-home-0.png`, `d-emails-0.png` |
| M12 | **Insumos de embalaje como sección propia con contador**, al mismo nivel que Productos y stock: compite por atención con lo importante (badge "3") | `d-insumos-0.png`, `s-m-mas.png` |
| M13 | **Íconos de Inicio y Más casi iguales** en la cápsula del celular (`LayoutDashboard` vs `LayoutGrid`) | `AdminTabBar.tsx:46`, `nav.ts:24`, `admin-demo-390.png` |
| M14 | **El Estudio no tiene las piezas que más publica una tienda de suplementos**: "Llegó/Reingresó", "Liquidación · vence pronto" y "Precio por servicio vs. marca X". Los 25 productos se eligen en una nube de chips | `d-estudio-0.png`, `d-estudio-1.png` |
| M15 | **La ficha del pedido en el celular no deja actuar arriba**: "Próxima acción" en pedidos con comprobante es un link, no un Aprobar/Rechazar ahí mismo | `s-m-pedido-123.png` |
| M16 | **Calendario cargado**: leyenda de 9 estados y 4 KPI encima. El cupo por defecto de 2 por día hace que la semana se vea "Completo" (un cadete de MdP hace 8–15 entregas por vuelta) | `d-calendario-0.png`, `admin-demo_calendario-390.png` |

### Baja
| # | Problema | Evidencia |
|---|---|---|
| B1 | Dos plantillas numeradas "6" en Emails ("Listo para retirar" y "Listo para salir") | `d-emails-0.png` |
| B2 | Vocabulario interno:<br>• "Cómoda" (densidad), "Mover etapa", "Peso" (ruleta);<br>• "Sale · lote", "A pedido = sin límite";<br>• "Encadenada" (misiones), "Precio desde" | Varias |
| B3 | "Más pedidos (unidades, demo)" mide unidades, cuando el dueño quiere **pesos y margen**: la barra de $2.900 pesa igual que una whey de $116.900 | `d-home-1.png` |
| B4 | El "Carrusel" de Contenido edita un patrón que R1 elimina (hero sin carrusel): hay que rehacerlo en R1 o queda un editor de algo que no existe | `d-contenido-0.png`, `plan-rediseno.md` R1 |
| B5 | La ruleta no dice **cuánto cuesta**: costo esperado por giro según el ticket promedio | `d-cupones_ruleta-*.png` |
| B6 | En Chromium sin locale, las fechas nativas muestran `mm/dd/yyyy` (filtros de Pedidos y fecha comprometida). Revisar en un equipo es-AR real | `d-pedidos-0.png`, `d-pedidos_detalle*-1.png` |

### Lo que está bien y hay que conservar
- **Recompra calculada** con batería y aviso en un toque.
- **Lotes con FEFO**, liquidar, importar la lista con vista previa y deshacer, aumento masivo con vista previa por
  variante y deshacer.
- **Compra sugerida** con mensaje para WhatsApp y "faltan $X para el mínimo".
- **"Próxima acción"** en la ficha del pedido y el **doble estado** (pago / preparación y entrega).
- **⌘K** y el modo claro correcto.
- **Vista previa real** en descuento stack y premios del juego.

---

## 4. Oportunidades "wow"

Marcado: **[R]** rediseño de algo existente (mismo motor) · **[N]** funcionalidad nueva (necesita OK de Ignacio,
salvo el Modo mostrador, ya aprobado) · **[E]** cambio de engine o fixtures.

### 4.1 "Hoy en tu tienda" (el nuevo inicio) **[R]** + algunos ítems **[N]**

**La promesa:** "lo abrís con el mate y en 30 segundos sabés qué hacer". Una sola lista de acción del día, ordenada
por urgencia, con un botón de un toque por ítem. Los números quedan como un marcador arriba.

**Marcador (fila de 4–5 displays LED, mono, números grandes tipo cronómetro).** Cada display se toca y abre lo suyo:
| Display | Ejemplo | Fuente |
|---|---|---|
| Vendido hoy / semana | `$ 0` hoy · `$ 412.450` semana ▲114 % | `salesSummary` (+ ventas de mostrador, ver 4.2) |
| Por cobrar | `2` comprobantes · `$ 69.740` | pedidos en `PAYMENT_REVIEW` |
| Para armar | `4` (1 atrasado en rojo) | preparación |
| Salen hoy | cadete `2/2` · retiro `1` | `pendingDeliveries` |
| Stock en riesgo | `8` para reponer · `6` lotes por vencer | `levelRows` + `lots` |

**"Tu lista de hoy"**: cada ítem es un módulo de rack con su ícono de señal, un título con verbo, el contexto en una
línea, la acción primaria y "Ver". Al resolverlo se apaga y encastra abajo. Arriba, una batería con
"4 de 9 hechas".

| Orden | Ítem (texto real) | Acción de un toque | Fuente / estado |
|---|---|---|---|
| 1 | **Revisá 2 comprobantes · $ 69.740** — Sofía (QR) y Diego (transferencia) | **Revisar** abre un "modo revisión" a pantalla completa: comprobante grande, el monto esperado en LED y Aprobar/Rechazar; pasa al siguiente solo | [R] `pagos` |
| 2 | **VOL-000115 de Agustina está atrasado** (era el vie 2/10, cadete) | **Avisarle por WhatsApp** (disculpa con nueva fecha) · Reprogramar | [R] `isLate` + `reschedule` |
| 3 | **Armá 4 pedidos** · 3 salen con el cadete | **Armar** abre la lista de picking consolidada (4.4) | [R] preparación + FEFO |
| 4 | **Vuelta del cadete: 2 entregas** · Rivadavia 3200, … | **Copiar para el cadete** (texto de WhatsApp con direcciones, link a Maps, qué lleva y quién recibe) | [N] vista sobre datos existentes |
| 5 | **A 4 clientes se les termina esta semana** · Tomás: Overvolt mango, **hoy** | Los 2 primeros en línea con **WhatsApp**; "Ver los 4" | [R] `repurchase` |
| 6 | **Barra proteica maní VL-2604-B vence en 27 días** (3 u. · $ 4.200 al costo) | **Liquidar −30 %** y **Hacer historia** (abre el Estudio con ese lote y ese precio) | [R] liquidar + Estudio prellenado |
| 7 | **Martes pasa Laboratorio Costa** · pedido sugerido $ 787.000 (llega al mínimo) | **Copiar pedido** · Marcar como pedido | [R] `proveedores` |
| 8 | **La lista de Distribuidora Atlántica tiene 32 días** · 3 productos quedaron con margen bajo | **Importar lista nueva** · Ver márgenes | [N][E] fecha de costo por proveedor |
| 9 | **Valentina: pote con el precinto roto** (en curso hace 6 días) | **Responder** | [R] reclamos |
| 10 | **Hoy cumple Juan Ibarra** (ejemplo; VIP, masa muscular) | **Mandarle un regalo** (cupón + mensaje de WhatsApp) | [N] usa el cumpleaños que ya se guarda |
| 11 | **En 14 días arranca Halloween (19/10)** · cupón MONSTER20, 5 productos | **Preparar la campaña** (Estudio y temáticas) | [R] `themes` |

- **Debajo, plegado en el celular, "Cómo viene la semana"**:
  - ventas por día (7 barras tipo LED);
  - top 3 por **pesos y margen**, no por unidades;
  - ticket promedio;
  - mix de canales (web / mostrador / WhatsApp, si se aprueba 4.2).
- **Se van del inicio**: el Club en ceros, "Actividad reciente", "Reclamos de ejemplo" (pasa a la lista),
  "Últimos pedidos" (para eso está Pedidos) y el embudo de 7 cajas (lo reemplaza el marcador).
- **Layout escritorio:**
  - la lista ocupa 2/3;
  - a la derecha, una columna "Salen hoy" con los 2 lugares del cadete como placas (ocupado o libre), retiros y una
    mini agenda de mañana.
- **Celular:**
  - el marcador como franja deslizable de 72–88 px;
  - el primer pantallazo muestra el marcador y los primeros 3 ítems;
  - cada ítem tiene la acción al alcance del pulgar.
- **Vacío:** "Todo al día. Andá a entrenar." con la batería llena.
- **Saludo:** "Buen día, {nombre del dueño}" según la hora (el nombre sale de la ficha de marca o los ajustes, sin
  datos del cliente en la UI).
- **Fecha de demo [E], decisión de Ignacio:** hoy es **domingo 4/10**. Para que "Hoy" luzca, conviene **lunes 5/10**.
  Toca fixtures y e2e. La alternativa es, en domingo, mostrar "Mañana lunes" con lo que sale ese día.
- Esfuerzo: **M** el inicio con lo existente (ítems 1–3, 5–7, 9 y 11); **S** cada ítem nuevo (4, 8 y 10).

**Boceto (escritorio):**
```
┌ HOY EN TU TIENDA · LUN 5 OCT · MAR DEL PLATA ───────────────────────────────────────────────┐
│ [VENDIDO HOY $0 | SEM $412.450▲] [POR COBRAR 2·$69.740] [ARMAR 4 (1!)] [SALEN 2/2] [RIESGO 8] │
├──────────────────────────────────────────────────────┬──────────────────────────────────────┤
│ TU LISTA DE HOY      ▮▮▮▮▯▯▯▯▯ 4 de 9                 │ SALEN HOY                            │
│ ● Revisá 2 comprobantes · $69.740          [Revisar] │ CADETE  [VOL-121 Julián] [VOL-113 —] │
│ ● VOL-115 atrasado · Agustina     [WhatsApp][Reprog] │ RETIRO  VOL-109 Martín (vie)         │
│ ● Armá 4 pedidos · 3 con cadete              [Armar] │ MAÑANA  3 despachos · cupo 1 libre   │
│ ● Vuelta del cadete · 2 entregas   [Copiar p/cadete] │──────────────────────────────────────│
│ ● Se les termina: Tomás (hoy), Nicolás (mañana) [WA] │ CÓMO VIENE LA SEMANA                 │
│ ● Barra maní VL-2604-B vence en 27 d [Liquidar][Hist]│ ▂▅▅█▇▁▁   top: Whey · Creatina · Pre │
│ ● Martes pasa Lab. Costa · $787.000 [Copiar pedido]  │                                      │
└──────────────────────────────────────────────────────┴──────────────────────────────────────┘
```

### 4.2 "Modo mostrador" (aprobado) **[N][E]**

**La promesa:** vender en el local en 4 toques, con el stock y la recompra al día.

- **Ruta y entrada:**
  - `/admin-demo/mostrador/`, en pantalla completa (se esconde el riel y queda solo "Salir del mostrador" y la
    franja de demo);
  - entrada fija en el menú y **pestaña central destacada en la cápsula del celular**.
  - Pensado para la compu del local, una tablet apoyada o el celular.
- **Izquierda, "Estante":**
  - un buscador gigante con autofoco ("whey vai 2lb", marca, sabor o código; `/` lo enfoca y Enter agrega el primer
    resultado);
  - chips de categoría y "Más vendidos";
  - resultados **por variante**: el pote SVG, el sabor y tamaño, el **precio en LED**, el stock y el **lote que sale**
    (FEFO, "vence 11/2026"), con "Liquidación" marcada si corresponde.
  - Tocar agrega. Sin stock aparece en gris con "A pedido" o "Sin stock".
- **Derecha, "Ticket" (estética de etiqueta de laboratorio):**
  - líneas con cantidad +/–;
  - el **descuento stack se aplica solo**, con la barra que se carga;
  - campo de cupón;
  - **Cliente (opcional)**: buscar por nombre o teléfono. Si existe, muestra su nivel del club y "se le termina…";
    si no, "Consumidor final" o "Crear cliente" (nombre y WhatsApp);
  - **Medio de pago**: efectivo, transferencia, QR, débito o crédito (simulado; el descuento por transferencia sale
    de ajustes);
  - total en LED y el botón **Cobrar (simulado)**.
- **Cobro:**
  - con efectivo, "Recibí $ ___" con el vuelto calculado;
  - al confirmar: "**Venta registrada (simulada)**". Nunca "pago acreditado" (AGENTS).
  - El ticket se ve en formato 80 mm: logo, ítems, lote y vencimiento, ahorro del stack y QR a la tienda o al club.
  - Acciones: **Mandar ticket por WhatsApp**, Imprimir (simulado) y Nueva venta.
- **Efectos (engine):**
  - se descuenta stock del lote correcto (FEFO);
  - se crea un pedido con canal **Mostrador**, ya pagado y entregado (necesita una transición nueva en
    `engine/orders.ts`);
  - suma al "Vendido hoy" del inicio y a la recompra del cliente ("a Juan se le termina el 3/11");
  - alimenta la compra sugerida.
  - Motor puro y testeado: `src/demo/engine/counter.ts`, sobre `pricing.ts`, `lots.ts` y `coupons.ts`.
- **"Cerrar el día":** resumen por medio de pago, cantidad de ventas, ticket promedio y **efectivo esperado en
  caja** ("contá la caja: deberías tener $ 84.300").
- **Consulta rápida** (mantener apretado o "i" en un pote): ficha mínima con el stock por sabor y tamaño, el precio
  por servicio y **"Copiar respuesta para WhatsApp"**: "¡Sí! Ionic Whey vainilla 2 lb a $ 54.900 (30 servicios,
  $ 1.830 c/u). Vence 11/2026. Te lo mando hoy con el cadete". Es la pregunta que el dueño contesta 30 veces por día.
- **Extensión recomendada [N, necesita OK]:** selector de **canal** Mostrador / WhatsApp / Instagram.
  - Con WhatsApp o Instagram aparecen la entrega (cadete con su cupo del calendario, retiro o correo) y el pago
    "esperando transferencia".
  - Se convierte en un pedido normal que sigue el circuito de pagos y preparación.
  - Es lo que más tiempo le ahorra a una tienda que vende por chat: hoy esas ventas no existen en el sistema.
- **Celular:** una columna con el estante. El ticket es una barra fija abajo ("3 productos · $ 109.530 · Cobrar") que
  se abre como hoja.
- **Visual:** consola de mostrador. Placas rectas, el precio como marcador, el "encastre" al agregar y el sonido de la
  Fase 8 apagado en el panel (como hoy) o activable.
- **Esfuerzo:** **L** (engine + pantalla + ticket + cierre del día). La extensión de canal suma **M**.

### 4.3 Inflación: "Costos vivos" **[R]** + **[N]**
- **Aumentar precios** **[R]**:
  - columna de **margen nuevo** por variante y aviso de las que quedan por debajo del objetivo;
  - modo **"Subió la distribuidora X %"**, que actualiza el costo y propone el precio manteniendo el margen
    **[N][E]** (pequeño, sobre `bulk-price.ts`).
- **Costos con fecha** **[N][E]**:
  - cada costo guarda de qué lista viene y cuándo, con la chapa "costo de hace 47 días" en ámbar a partir de 30;
  - en el inicio aparece "lista vieja" (ítem 8).
- **Precio de reposición** **[N]**: en Costos, "si lo vendés hoy a $ 54.900 y lo reponés con la lista nueva, ganás
  $ X (Y %)". Es la cuenta que el dueño hace en la calculadora del celular.
- **Liquidar** **[R]**: el modal muestra **ganancia o pérdida** por unidad y total del lote ("con −30 % ganás $ 1.300
  por caja; con −50 % perdés $ 600").

### 4.4 Preparar y despachar como una tienda, no como un taller **[R]** + **[N]**
- **Dos pasos en lugar de cuatro columnas:** "Para armar" → "Listo".
  - "Armar" abre una **checklist por pedido** con la foto del pote, el lote que sale (FEFO) y un tilde por producto.
  - Al tildar todo, queda "Listo" sin pasos intermedios.
  - El control de lote se mantiene, pero dentro del armado.
- **Lista de picking consolidada [N]:** "Para los 4 pedidos de hoy, sacá del estante":
  - 2 × Barra maní · VL-2604-B;
  - 1 × Creatina 500 g · VL-2610-C;
  - …
  - Un recorrido por el depósito en vez de 4 idas y vueltas.
- **Hoja de ruta del cadete [N]:**
  - las entregas del día en orden, con dirección, teléfono, qué lleva y link a Maps;
  - "Copiar para WhatsApp" y "Marcar entregado" desde la misma lista.
- **Rótulo del pedido [N, opcional]:** imprimir nombre, dirección, código y lotes (A6 o 80 mm).

### 4.5 Clientes que vuelven **[R]** + **[N]**
- **Avisarle con link de recompra [N]:** el WhatsApp de "se te termina" lleva un link que abre la tienda con el
  carrito ya cargado (mismo sabor y tamaño, con el cupón si hay). Le resuelve la compra en un toque. Se reutiliza el
  patrón de URL del armador de stack.
- **Ficha "como en el mostrador" [R]:** arriba, lo que toma ("Whey chocolate 2 lb cada 30 días, creatina cada 60"),
  el objetivo y el nivel del club, con **Venderle ahora** (abre el mostrador con el cliente cargado).
- **Mensajes de WhatsApp listos por estado del pedido [R/N]:** las mismas 10 plantillas de email, con su versión de
  WhatsApp, y "Escribirle" en la ficha del pedido.

### 4.6 Compras con rotación **[N][E]**
- **Cobertura en días** por variante: con las ventas de las últimas 4–8 semanas, "te quedan 6 días". La compra
  sugerida pasa a ser "lo que necesitás para llegar a la próxima entrega de este proveedor" (ya se sabe qué días
  reparte).
- En "Recibir mercadería", que el dueño cargue el **lote y el vencimiento** de lo que llegó (hoy suma al lote más
  nuevo).

### 4.7 Marketing que vende suplementos **[R]**
- **Estudio:** plantillas nuevas, "Llegó / Reingresó" (desde Recibir mercadería), "Liquidación · vence pronto" (desde
  el lote) y "Precio por servicio" (comparativa entre marcas propias). Productos con buscador y no 25 chips.
- **Ruleta:** "Costo esperado: $ 2.140 por giro (con el ticket promedio)", para que el dueño confíe y la deje
  prendida.
- **Promos en un solo lugar:** cupones, descuento stack, ruleta, juego y misiones como pestañas de una sola pantalla
  **Promos**, sin hubs.

---

## 5. Recomendación priorizada (R1–R4)

### Navegación propuesta (R4): de 21 entradas a 9
| Menú | Absorbe | Celular |
|---|---|---|
| **Hoy** | Inicio | Pestaña |
| **Mostrador** | (nuevo) | **Pestaña central destacada** |
| **Pedidos** | Pedidos, Pagos (pestaña "Por cobrar"), Preparación ("Para armar"), Calendario ("Despachos" con hoja de ruta) y Reclamos ("Postventa") | Pestaña |
| **Stock** | Productos y stock, lotes y vencimientos, Importar, Aumento, Categorías y objetivos, vista Excel | Pestaña |
| **Compras** | Proveedores, Costos y margen, Embalaje (ex Insumos) | Más |
| **Clientes** | Clientes, recompra y segmentos | Más |
| **Promos** | Cupones, Descuento stack, Ruleta, Premios del juego y Misiones | Más |
| **Campañas** | Temáticas, Estudio y Contenido (R3 "Campañas") | Más |
| **Ajustes** | Ajustes y Mensajes (emails + WhatsApp) | Más |

Las rutas viejas redirigen, como ya pasa con `/stock/` y `/planilla/`. Los e2e se actualizan en el mismo PR.

### R1 · Sistema "BOX" (el panel hereda; casi sin trabajo propio)
| Qué | Esfuerzo |
|---|---|
| Los componentes base que rehace R1 (botón, chip, tarjeta, **DataTable**, input, `Sheet`, toasts y estados vacíos) traen su variante de panel: filas densas, placas rectas, el volt solo en la acción primaria y estados con color de señal. Verificar las 30 rutas del panel con capturas antes/después | M |
| `KpiTile` → **display de marcador LED** (se reutiliza en la tienda para precio por servicio) | S |
| Arreglos que se ven en la demo y no esperan a R4:<br>• celdas corridas en Excel (M6);<br>• el "6" duplicado (B1);<br>• ícono de "Más" (M13);<br>• el scroll oculto del menú (A3: indicador o grupos plegables);<br>• el riel que se abre solo (A4: abrir con retardo o solo con clic) | S |
| **Contenido → Carrusel** pasa a editar el **hero nuevo** (producto estrella y destacados), porque R1 elimina el carrusel (B4) | M |

### R2 · Comprar (el panel acompaña los datos nuevos de la tienda)
| Qué | Esfuerzo |
|---|---|
| **Editor de producto "hoja técnica"**:<br>• **precio propio por presentación** en lugar de base + recargo;<br>• servicios por presentación y precio por servicio calculado;<br>• tabla nutricional (porción, 100 g, %VD) y modo de uso editables;<br>• sellos;<br>• "Medidas de envío" plegado;<br>• la foto deja de ser el paso 1<br>Sin esto, el comparador y la hoja técnica de R2 muestran datos que el dueño no puede cargar (A5) | L |
| Productos: columna **Precio por servicio** y margen; la insignia de stock por la variante más baja ("1 variante baja") en lugar de "Stock bajo · 139" (M5) | S |

### R3 · Temáticas y regalos
| Qué | Esfuerzo |
|---|---|
| **Campañas** (ya en el plan): calendario anual, armar la fecha (rango, productos, cupón, titular y key visual), vista previa en celular y escritorio, y el kit de Instagram desde el Estudio | L |
| **Gift cards** (aprobado): montos habilitados, emitidas y canjeadas, saldo y vencimiento. Y en el regalo con sabor o tamaño abierto, ver qué eligió quien lo recibió | M |
| Estudio: plantillas "Liquidación", "Llegó" y "Precio por servicio", buscador de productos (M14) | M |

### R4 · Centro de mando (el "wow, lo necesitaba")
Orden sugerido dentro de R4, de mayor a menor impacto en la demo:

| # | Qué | Tipo | Esfuerzo |
|---|---|---|---|
| 1 | **Hoy en tu tienda** (4.1): marcador y lista de acción; se va el inicio de Velmar | R (+N chicos) | M |
| 2 | **Modo mostrador** (4.2) con consulta rápida y cierre del día | N aprobado + E | L |
| 3 | **Navegación de 9 entradas**, pestaña central Mostrador, sin hubs; encabezados compactos (H1 de una línea, ayuda en "?", sin "(demo)" por título); sin paginar listas de menos de 50 (M1–M3, M10) | R | M |
| 4 | **Pedidos unificado**: Por cobrar con "modo revisión", Para armar con checklist y **picking consolidado**, Despachos con **hoja de ruta del cadete**, Postventa; "Escribirle por WhatsApp" en la ficha; el Total siempre visible (A6, M4, M9, M15) | R + N (picking, hoja de ruta) | L |
| 5 | **Costos vivos**: margen en Aumentar precios, "subió la distribuidora %", fecha de costo, precio de reposición y ganancia al liquidar (4.3, M7) | R + N/E | M |
| 6 | **Compras con cobertura en días** y lote/vencimiento al recibir (4.6, M8) | N/E | M |
| 7 | **Clientes**: link de recompra con el carrito cargado y "Venderle ahora" (4.5) | N | M |
| 8 | **Mensajes**: emails + versión WhatsApp por estado; un número de WhatsApp ficticio cargado en la demo (M9) | R/N | M |
| 9 | **Promos** en una pantalla con pestañas; costo esperado de la ruleta (4.7, B5) | R | S–M |
| 10 | **Canal WhatsApp/Instagram** en el mostrador (extensión de 4.2) | N, necesita OK | M |
| 11 | Kit de venta: el guion arranca en **Hoy** ("en 30 segundos sabés qué hacer") y sigue con **Mostrador**; capturas y video | — | M |

### Qué sobra o se esconde
- Del inicio: Club en ceros, Actividad reciente, Reclamos de ejemplo, Últimos pedidos y el embudo de 7 cajas.
- **Insumos de embalaje** como sección propia: pasa a "Compras → Embalaje", sin contador en el menú.
- **Kanban de 4 columnas** y "Mover etapa": quedan 2 pasos.
- Hubs de Marketing, Cupones y ruleta, Contenido y Ajustes: pasan a pestañas.
- "(demo)" en cada H1 y los párrafos instructivos largos: queda la franja obligatoria y una ayuda "?".
- DataTable completa (filtros, Columnas, Cómoda y Excel) en listas cortas como Categorías: queda una lista
  ordenable.

### Decisiones abiertas para Ignacio
1. ¿La fecha de la demo pasa de **domingo 4/10 a lunes 5/10**, para que "Hoy" y "Salen hoy" tengan sentido?
2. ¿Se aprueba el **canal WhatsApp/Instagram** dentro del Modo mostrador (cargar pedidos cerrados por chat)?
3. ¿Se aprueban los [N] chicos del inicio y de Pedidos:
   - hoja de ruta del cadete;
   - picking consolidado;
   - fecha de costo;
   - cumpleaños con regalo;
   - link de recompra;
   - cobertura en días?
4. ¿Las 9 entradas de menú propuestas, con la pestaña central "Mostrador" en el celular?
