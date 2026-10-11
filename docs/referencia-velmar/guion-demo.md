# Guion de la reunión con el cliente (10 minutos)

Pedido de Ignacio, Fase 7 (VEL-70), fuera de la especificación. Va de **lo que más le duele al dueño** (chats, Excel,
entregas) a **lo que lo enamora** (la tienda en el celular y el contenido para Instagram). Todo lo que se muestra
funciona en la demo, con datos y envíos simulados.

## Antes de entrar (5 minutos antes)
1. Abrir la demo en **el celular del dueño** y en la **compu**, con la batería cargada y el brillo alto.
2. Tocar **"Reiniciar demo"** (banner de arriba): vuelve la tienda y el panel a los datos de muestra.
3. Dejar abiertas dos pestañas: el panel `/admin-demo/` y la tienda `/`. En el celular, solo la tienda.
4. Sonido del celular encendido (los sonidos de la tienda arrancan recién con el primer toque).
5. Anotar qué temática muestra hoy la tienda (se elige sola por fecha): si no sirve para la charla, "Probar
   temáticas" la cambia y "Original" la apaga.

## Recorrido

| Min | Dolor / deseo | Qué mostrar | Dónde |
|---|---|---|---|
| 0:00 | Apertura | "Hoy cada pedido nace en un chat, se anota en un Excel y se agenda en el calendario del celular. Les muestro cómo queda todo en un solo lugar." | Panel `/admin-demo/` |
| 0:30 | **Chats**: no sé cuánto vendí ni qué me falta cobrar | Inicio: ventas de la semana, embudo de pedidos por estado (tocar una etapa abre la lista), "comprobantes por revisar", resumen del taller | Inicio |
| 1:30 | **Chats**: pasar comprobantes y avisar a cada cliente | Pagos manuales: abrir un comprobante, **aprobar** (pide confirmación) y mostrar que **rechazar exige un motivo**. Luego Emails automáticos: un email por momento del pedido, con el editor de fichas | Pagos manuales → Emails |
| 3:00 | **Excel**: stock y precios a mano | Importar desde Excel: tocar **"Probar con una planilla de ejemplo"** (columnas con otros nombres, montos con $ y una fila con error), ver la vista previa que marca el error, importar y **deshacer**. Planilla: editar y pegar celdas como en Excel | Importar → Planilla |
| 4:30 | **Entregas**: ¿cuándo puedo prometer? | Calendario de entregas: pedidos en su fecha, capacidad por día, feriados cerrados. **Arrastrar** un pedido a un feriado (no lo deja) y a un día libre. Exportar a Google Calendar | Calendario |
| 5:30 | **Costos**: ¿gano plata con esto? | Cola de producción (pasar a máquina descuenta insumos) y Costos y margen: "Usar precio sugerido" cambia el precio en la tienda | Producción → Costos |
| 6:30 | **Lo que enamora**: la tienda | Pasar al **celular**. Inicio con la temática, barra inferior de vidrio. Abrir el **collar con nombre**: letras sueltas, cordón, material y talle; la vista previa cambia el precio. Abrir el **velador con foto**: subir una foto y ver "Tu diseño". Mostrar **¿Cuándo llega?** (usa el calendario del taller) | Tienda `/` |
| 8:00 | **Lo que enamora**: comprar, ganar y regalar | Agregar al carrito (suena), ir a pagar y **girar la ruleta** (pantalla completa; al ganar, el cupón de la fecha). Elegir transferencia, aceptar términos y llegar a la pantalla de confirmación (demo). Volver al panel: **el pedido y el email ya están ahí**. Si hay tiempo: en "Mi cuenta" → Mis regalos, **abrir a golpes el regalo de muestra** (en el Día de la Madre, una flor que se abre pétalo a pétalo) | Carrito → Checkout → Panel → Cuenta |
| 9:00 | **Instagram**: qué publico hoy | Estudio de contenido: elegir **Día de la Madre**, mostrar post, historia y carrusel con fondo animado, y el texto sugerido. Exportar la historia y compartirla desde el celular | Estudio |
| 9:45 | Cierre | "Esto es la demo: los datos son de muestra. Lo que sigue es conectar su catálogo real, sus fotos y sus medios de pago." | — |

## Frases que ayudan
- **No vendas funciones, vendé horas**: "esto reemplaza anotar el comprobante, buscar el chat y escribir el aviso".
- Cuando algo sale solo, decirlo: "no escribí ningún email; salió porque cambié el estado".
- Si el dueño toca algo, dejarlo. Todo lo que cambie queda solo en su navegador y "Reiniciar demo" lo vuelve atrás.

## Preguntas que van a aparecer
| Pregunta | Respuesta honesta |
|---|---|
| ¿Esto ya cobra? | No. La demo no pide tarjetas ni redirige a Mercado Pago; los datos de pago son de muestra. En producción: Mercado Pago, transferencia y QR con aprobación manual. |
| ¿Mis clientes ven esto? | No. La demo es de este navegador; nada se guarda en un servidor. |
| ¿Los emails salen de verdad? | En la demo van a una bandeja simulada. En producción salen con el correo del negocio. |
| ¿Y mis productos y fotos? | Las ilustraciones son de muestra. Se cargan los productos reales y las fotos propias; las fotos reales rinden más en Instagram. |
| ¿Cuánto tarda y cuánto cuesta lo que falta? | Ver `docs/fuera-de-especificacion.md`: lista de lo agregado, para decidir qué entra y a qué precio. |
| ¿Puedo cambiar un texto o un precio yo? | Sí: Contenido, Productos, Cupones y Ajustes. Se ve al instante en la tienda de la demo. |

## Si algo falla
- **No carga o se ve raro**: recargar. Si sigue, "Reiniciar demo" y volver a entrar.
- **El video del estudio no se graba**: no cambiar de pestaña mientras graba; si pasa, repetir. La imagen PNG siempre sale.
- **No suena nada**: tocar la pantalla una vez y revisar el silencio del celular y el botón de sonido del header.
- **Sin buena señal**: llegar con la demo ya abierta y probada en el mismo lugar; no depender de la red del cliente.

## Después de la reunión
Anotar qué le gustó, qué preguntó y qué pidió que no está. Eso alimenta la lista de `docs/fuera-de-especificacion.md`.
