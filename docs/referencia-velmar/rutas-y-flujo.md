# Rutas y flujo de la demo

| Ruta | Qué muestra |
|---|---|
| `/` | Inicio de tienda: carrusel de banners (editable, avanza cada 4 s con pausa), beneficios, categorías en círculos, recomendados, probador en vivo con "Quiero mi producto personalizado", más vendidos, "Productos que cuentan historias", novedades, banda del club |
| `/buscar/?q=` | Resultados completos. El ícono de búsqueda abre un **buscador superpuesto** con búsquedas recientes, lo más buscado, recomendados y resultados en vivo (tolerante a acentos y errores: "comedro" → comederos) |
| `/categorias/` | Categorías con productos (las vacías no aparecen: "Tablas de madera") |
| `/c/[slug]/` | Grilla con orden (relevancia, precio, nuevos), recordado en localStorage |
| `/p/[slug]/` | **Ficha todo en uno**: galería con "Tu diseño" (vista previa en vivo) y el **stock debajo de la imagen**; una sola tarjeta para elegir opción/color, personalizar (texto, foto o referencia) y la **cantidad** (desplegable "Cantidad: 1 unidad ⌄ (N disponibles)"). Sin casilla: **agregar al carrito equivale a "Así lo quiero"** (queda explicado en la tarjeta y se guarda `approvedAt`). **¿Cuándo llega?** con el calendario del taller: plazo en días hábiles (sin feriados), y si los primeros días están completos en el panel, la primera fecha con lugar. Favoritos (corazón). En el celular, barra fija con corazón + "Agregar al carrito · total"; en escritorio también "Comprar ahora" |
| `/vista-previa/?borrador=` | **Vista previa del panel (Polish 8.3.21).** La ficha de la tienda con el borrador del editor de producto, sin guardar ni publicar: no se puede comprar, regalar ni marcar favorito, no hay recomendaciones ni botones flotantes, y una franja fija lleva de vuelta ("Volver al editor" o "Volver a la creación"). No se indexa |
| `/crear/` | Productos personalizables por tipo; cada uno abre su ficha. `/crear/[slug]/` se mantiene (enlaces viejos) y muestra la misma ficha todo en uno |
| `/carrito/` | Envío gratis → productos → cupón ("Elegir de mis cupones" o código) → resumen y pago; abajo, misión y recomendaciones. En el celular, barra fija con total e "Ir a pagar". Al ir a pagar aparece la **ruleta** si todavía no se giró. Al agregar desde una ficha se abre el **drawer** |
| `/checkout/` | Datos (invitado o cuenta demo) → entrega (retiro, cadete MdP por CP, nacional) → pago (Mercado Pago, transferencia, QR) → términos |
| `/checkout/confirmacion/` | "Pedido de demostración", instrucciones de pago de muestra, comprobante local |
| `/pedido/demo-velmar/` | Seguimiento con token fijo: **el pedido arriba** (en el celular 3 productos y "Ver N más" en un modal), "Falta el comprobante" debajo de los productos, estado actual con recorrido animado, estados de muestra, etapas y ayuda por WhatsApp |
| `/club/` | Club Velmar: ruleta de cupones (un giro por navegador), camino de misiones y billetera de premios |
| Barra inferior (celular) | Cápsula flotante de vidrio con Inicio, Categorías, Favoritos, Cupones y Mi cuenta. No aparece en ficha, carrito ni checkout (tienen su propia barra) |
| `/cupones/` | Mis cupones: el ganado en la ruleta y los vigentes de la tienda como tickets, con "Aplicar"; estado vencido / mínimo / solo con cuenta; cómo ganar más |
| `/favoritos/` | Pantalla de favoritos (guardados con el corazón de cada ficha, en este navegador); vacía invita a explorar la tienda. Pedido de Ignacio, fuera de la spec |
| `/cuenta/` | Cuenta demo: pedidos, **mis regalos** (recibidos sin abrir y los que regalé), misiones, premios (un uso), direcciones |
| `/regalo/` | **Regalos**: con `?g=` (link) o `?c=` (código) abre el regalo a golpes en pantalla oscura; sin parámetros pide el código. `&vista=previa` es la vista de quien regala (no guarda nada) |
| `/preguntas/`, `/terminos/`, `/privacidad/`, `/arrepentimiento/` | Ayuda y legales (textos de muestra) |

## Fase 4 · Tienda (pedido de Ignacio, 09/10/2026, fuera de la spec)
- **Configurador del collar** (`/p/collar-con-nombre/`): nombre, fuente y color de las letras; letras sueltas que cuelgan,
  nombre de corrido o chapita hueso; color del cordón; material (paracord trenzado, biothane, nylon); dije (patita, hueso,
  corazón, chapita con teléfono o ninguno) y **talle por contorno de cuello** (elige la variante; fuera de rango, a medida
  por WhatsApp). Vista previa SVG en vivo con las letras balanceándose; recargos en el engine (`src/demo/engine/collar.ts`);
  la configuración viaja al carrito, al pedido, a la cola de producción y a los emails. **Combinaciones listas** debajo del
  configurador: un toque carga la combinación.
- **Ruleta** (`/club/` y al ir a pagar): se gira tocándola, arrastrándola con el dedo (con la dirección y la fuerza del gesto)
  o con Enter; frena de a poco, cada gajo hace clic y mueve el puntero, el aro tiene luces en cadena y al ganar hay confeti.
  El premio lo sigue decidiendo el sorteo ponderado del engine.
- **Sonidos** sintetizados con WebAudio (sin archivos): agregar al carrito, favoritos, cupón, ruleta, compra, error y barra
  inferior. Se habilitan con el primer toque; botón de silencio en el header (se recuerda en `velmar-sound`). En el panel no
  suenan.

## Fase 8 · Regalos, ruleta a pantalla completa y rendimiento (pedido de Ignacio, 10/2026, fuera de la spec)
- **Regalar** (la spec lo tenía como "regalá uno", fuera de alcance): en la ficha, "Regalar ahora" (y "¿Es para regalo?"
  en el último paso del checkout) abre un modal que pide para quién, de parte de quién, email (opcional), mensaje y
  ocasión, con vista previa. La línea del carrito dice "Regalo para…". Al confirmar el pedido
  cada regalo recibe un código `REGALO-XXXX-XXXX` (con dígito verificador) y un link; la confirmación los muestra con
  WhatsApp, Compartir (celular) o Copiar link, y "Ver cómo lo recibe". Quien lo recibe **nunca ve el precio**.
- **Abrir el regalo**: todo se oscurece y aparece el objeto de la ocasión con "Golpeá el regalo para abrirlo"; cinco
  golpes (toque, clic o tecla) con sacudón, sonido y vibración (Android) y una escena única por festividad (flor que se
  abre pétalo a pétalo, huevo de Pascua, regalo de Papá Noel, calabaza, prisma, caja fuerte, sidra, carta, cucha de
  Pancho, caja con mecha, paraguas de 1810, bandera, Casa de Tucumán, caja de herramientas, Pancho y Lola, piñata y la caja
  de Velmar). Después: el producto, el mensaje escrito a mano, cuándo está listo, "Guardar en mis regalos" y "Conocer Velmar" (a la tienda, no a la ficha: ahí se ve el precio).
- **En la cuenta**: si el email del regalo es el de la cuenta, aparece en Mis regalos sin abrir el link (la cuenta demo
  trae uno de muestra, de Lucía para Sofía).
- **Demo vs. producción**: el link lleva el regalo adentro (base64url, versionado y validado: un link cortado o editado no
  abre nada) y el código se resuelve en el navegador donde se compró. En producción el link y el código son una clave al
  azar y el servidor guarda el regalo, manda el email y valida que no se abra dos veces de más.
- **Ruleta**: ya no es una ventana; ocupa la pantalla entera con fondo oscuro y solo la ruleta (se gira con el centro
  "Girar", tocándola o arrastrándola). Al ganar aparece el **cupón de la festividad** (colores y decoraciones de la temática
  vigente) con "Aplicar ahora", "Guardar para después" y "Salir". En el club, la ruleta se muestra quieta y la abre su botón.
- **Rendimiento**: escenas de la pantalla de carga, ruleta, carrito, cupones y buscador se descargan cuando hacen falta;
  la segunda vista de cada tarjeta se dibuja recién al pasar el mouse; las secciones de más abajo del inicio, las
  recomendaciones de la ficha y el pie no se dibujan hasta acercarse; las letras del collar se balancean tres veces y
  quedan quietas. Ver `docs/qa.md`.

## Fase 6 · Estudio de contenido (pedido de Ignacio, 10/2026, fuera de la spec)
- `/admin-demo/estudio/` (Marketing → Estudio de contenido): piezas para Instagram por fecha, exportables a imagen y video.
- `/admin-demo/marketing/` (Marketing → Resumen, Polish 8.3.24): tarjetas a cada herramienta. Subpáginas con migas y
  "Volver": `/admin-demo/cupones/lista/`, `/admin-demo/cupones/ruleta/`, `/admin-demo/cupones/premios/`,
  `/admin-demo/misiones/simular/` y `/admin-demo/emails/enviados/` (antes `?vista=enviados`, que sigue llevando ahí).
- `/admin-demo/ajustes/` (Polish 8.3.29): tarjetas a `/admin-demo/ajustes/contacto/`, `/admin-demo/ajustes/pagos/`,
  `/admin-demo/ajustes/cobro/` y `/admin-demo/ajustes/envios/`, cada una con "Volver a Ajustes".
- `/admin-demo/contenido/` (Polish 8.3.28): tarjetas a `/admin-demo/contenido/carrusel/` (vista previa e imagen propia),
  `/admin-demo/contenido/textos/` y `/admin-demo/contenido/preguntas/`, cada una con "Volver a Contenido".
  Ver `docs/panel-demo.md`. Engine en `src/demo/admin/studio/`, dibujo en canvas en `src/features/admin/studio/render/`.

## Fase 5 · Temáticas y motion (pedido de Ignacio, 10/2026, fuera de la spec)
- Temáticas nuevas en "Probar temáticas" y en el panel: **Orgullo** (reemplaza a San Patricio), **25 de Mayo**,
  **Día de la Bandera** y **9 de Julio**, cada una con pantalla de carga, paleta, fondo, banner, cinta, cupón y ofertas.
- **Día del Amigo** y **Día del Padre** rehechos con los personajes de Velmar (Pancho y Lola) en la pantalla de carga y en el
  banner del inicio.
- Navegar entre páginas tiene transición; al tocar una tarjeta, la imagen vuela hasta la galería de la ficha.
- Ver `docs/tono-visual.md` (Fase 5) para el detalle visual y `docs/qa.md` para las mediciones.

## Agregados a pedido de Ignacio (04-05/10/2026, fuera de la spec original)
Ruleta de cupones, página y selector de "Mis cupones", buscador superpuesto con búsquedas recientes, "Comprar ahora",
historias de producto en el inicio (ilustrativas, `src/demo/fixtures/stories.ts`), paginado del panel, favoritos,
barra inferior, autoplay del carrusel, pantalla de carga de 5 s y confeti de compra (la guía del panel se retiró en Polish 8.3.11). **Cambio a revisar en la
spec:** la aprobación "Así lo quiero" ya no es una casilla; se confirma al agregar al carrito. Antes de llevarlos a
producción hay que sumarlos a la especificación de Notion.

## Ruleta de cupones
- Fuera de la especificación original: se sumó como pedido explícito para la demo. Antes de llevarla a producción hay que
  incorporarla a la spec (límite por cliente, probabilidades, vigencia).
- 8 segmentos configurables en el panel (Cupones → Ruleta): premio, tipo, valor, mínimo y peso. Cada gajo se dibuja con un ícono SVG (porcentaje, camión, regalo, grabado, moneda) y el valor corto. El sorteo es una función
  pura (`src/demo/engine/wheel.ts`); el premio crea un cupón `RULETA…` de **un uso** con vencimiento (7 días por defecto)
  que aparece en el panel y se aplica en el carrito. En producción el sorteo y el cupón se generan en el servidor.

## Recomendaciones
`src/demo/engine/recommend.ts`: en la ficha prioriza misma categoría y complementos; en el carrito excluye lo ya agregado.
Reglas simples y deterministas, sin tracking del usuario.

## Datos de muestra
- Cupones: `BIENVENIDA10` (10%), `FERIA2000` (desde $20.000), `ENVIOGRATIS` (solo con cuenta), `INVIERNO` (vencido).
- Códigos postales con cadete: 7600–7612. Envío gratis desde $120.000. 10% off con transferencia/QR.
- Productos sin stock para demostrar el bloqueo: Comedero elevado "Nogal", Placa NFC Instagram "Madera".
- Catálogo basado en las líneas vistas en el Instagram de Velmar, **sin productos con licencia**. Precios orientativos.

## Pagos (decisión confirmada 03/10/2026)
Checkout Pro para crédito/débito/dinero en cuenta (confirmación automática por webhook en producción);
transferencia y **QR estático** con comprobante y aprobación manual de Velmar. En la demo todo es pantalla de muestra:
no se pide tarjeta, no se redirige a Mercado Pago, el QR no es escaneable, el CBU/alias son ficticios y nunca se
afirma que un pago fue acreditado.

## Qué se guarda y dónde
Solo `localStorage` del navegador (`velmar-demo:cart`, `:checkout`, `:account`, `:admin`, `:search`, `:favorites`, `:gifts`; y
`velmar-ui:admin-sidebar` para recordar la barra lateral fija; `velmar-ui:sheet:*` en `sessionStorage` para el borrador de una vista Excel sin guardar; `velmar-ui:list:*` en `sessionStorage` para que "Volver" de una ficha lleve a la lista con sus filtros y página; `velmar-ui:product-draft:*` y `velmar-ui:preview-return` en `sessionStorage` para el borrador del editor de producto y su vista previa; `velmar-ui:mission-draft:*`, `velmar-ui:email-draft:*` y `velmar-ui:wheel-draft` en `sessionStorage` para los borradores de misión, plantilla de email y ruleta; `velmar-demo:tables` para el orden y las columnas de las tablas del panel) y `sessionStorage` para no repetir el confeti de un pedido. Las fotos se procesan con `URL.createObjectURL`/canvas; al carrito llega una miniatura JPEG generada en el
navegador. "Reiniciar demo" (banner y pie) borra todo.
