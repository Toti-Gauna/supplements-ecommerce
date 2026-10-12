# Estado por fase

## Fase 0 · Base técnica ✅
- Código de Velmar copiado (tienda, panel, ruleta, regalos, temáticas, tests y workflow de Pages) y renombrado a Volta:
  claves `volta-demo:*`, `volta-ui:*`, `volta-theme`, token de seguimiento `demo-volta`, códigos `VOL-000123`.
- Temáticas apagadas (`themeSettings.mode = "off"`, sin botón "Probar temáticas") hasta la Fase 5 (ya encendidas).
- Documentación original en `docs/referencia-velmar/`.

## Fase 1 · Identidad eléctrica y catálogo ✅
- Marca VOLTA en `src/config/brand.ts`: paleta oscura por defecto y clara "Tiza", Archivo + JetBrains Mono, logo con
  rayo, favicon e imagen para compartir. Ver `docs/tono-visual.md`.
- Librería SVG de envases (14 tipos, 3 vistas, 5 estilos de marca) y defs globales.
- Catálogo de 25 productos de muestra en 10 categorías (+1 vacía), 5 marcas inventadas, sabores × tamaños con servicios,
  objetivos, sellos, tabla nutricional, uso, lote y vencimiento (los datos ricos se muestran en la Fase 2).
- Inicio: carrusel con envases sobre pedestal, beneficios (cadete en el día, originales con lote), categorías,
  **¿Cuál es tu objetivo?**, recomendados, más vendidos, **Ciencia simple**, novedades, club y valores.
- `/crear/` pasa a ser "Entrená por objetivo" y `/buscar/?objetivo=` filtra por objetivo (chips).
- Pantalla de carga "Cargando energía".
- Textos de tienda, carrito, checkout, seguimiento, FAQ, términos y privacidad pasados a suplementos.
- Panel: misma estructura con la piel eléctrica; pedidos, clientes, reclamos, costos (con costo de proveedor) e
  insumos (embalaje y regalos) con datos de suplementos.

## Fase 2 · Ficha de suplemento y stack ✅ (publicada)
- Fuera la personalización de Velmar (texto, foto, collar, plantillas, `/crear/[slug]`, Konva): dominio, tienda, panel
  y tests. El panel "Categorías y personalización" queda como **Categorías**.
- Ficha nueva: galería (estudio, detalle con scoop/cápsulas/gomitas y gimnasio), sellos (vegano, sin TACC…), precio por
  servicio, una tarjeta para sabor (muestras) y tamaño (servicios y precio por servicio, con **Mejor precio por
  servicio** marcado), lote y vencimiento.
- Debajo: **Armá tu stack** (2 sugerencias de otras categorías + "Agregar 3 al carrito"), **Tu día con este
  suplemento** (momentos de toma), **¿Cuánto te dura?** (días, fecha en que se termina, proteína del día por peso y
  objetivo, dosis de creatina de referencia, siempre orientativo), **Información nutricional** con formato de rótulo
  argentino (porción / 100 g / %VD; leyenda "No aporta cantidades significativas…" cuando corresponde) y entrega
  ("Lo despachamos el…").
- **Descuento stack** en el motor de precios: con suplementos de 3 categorías distintas, 10 % sobre esas líneas
  (regla en `settings.stack`; su editor en el panel llega con la Fase 3). Se ve en carrito, carrito lateral (con
  batería de categorías) y checkout; las recomendaciones del carrito priorizan las categorías que faltan.
- **Avisos de recompra**: desde la calculadora ("Avisame antes de que se termine") a **Mi cuenta → Recompras**, con
  batería de lo que queda y "Recomprar" en un toque (`volta-demo:reminders`, se borra con Reiniciar demo).
- Barra de envío gratis con forma de batería. Textos de temáticas, footer, seguimiento ("Armando tu pedido") y WhatsApp
  sin restos de Velmar.
- Arreglos que aparecieron al adaptar los e2e: doble clic en la vista Excel del panel editaba otra fila si la grilla no
  entraba en pantalla; el ancla al cambiar de página podía dejar el título debajo del header en equipos lentos; con
  temática, la pantalla de carga muestra el logo compacto (las escenas de Velmar lo pisaban).
- Tests: 236 unitarios y 297 e2e adaptados a VOLTA (se borraron solo los del configurador de collar), más los nuevos
  de descuento stack y aviso de recompra.

## Fase 3 · Armá tu stack + Quiz ✅
- Hecha después de la 4, a pedido de Ignacio.
- **Motor** (`src/demo/engine/stack-builder.ts`, `quiz.ts`, `src/demo/fixtures/stack-builder.ts`): cuatro lugares del
  estante (base de proteína, creatina, pre-entreno, extra), qué arma cada objetivo, opciones por objetivo y
  restricciones (vegano, sin TACC, sin azúcar, sin cafeína), resumen con la misma regla que el carrito y **costo por
  día**, y el estante en la URL (`?objetivo=…&stack=…`) para compartirlo.
- **`/crear/` → "Armá tu stack"**: elegís objetivo, se carga el stack sugerido y lo ajustás lugar por lugar (sabor,
  tamaño, cambiar o vaciar). **Estante iluminado en SVG**: los potes caen con rebote, cada lugar prende su luz y al
  llegar al descuento se enciende el neón con el sello "Stack −10 %". Agregar todo al carrito y copiar el link.
- **Quiz "¿Qué necesitás?"** (`/crear/quiz/`): objetivo, días, horario y restricciones → stack con el porqué de cada
  producto, total con descuento y costo por día; al carrito o "Ajustarlo en el armador". Recuerda las últimas respuestas.
- **Inicio**: bloque en vivo "Tu estante, según tu objetivo" con mini estante y "Armalo a tu medida".
- **Panel → Marketing → Descuento stack**: porcentaje (0–30 %) y categorías mínimas (2–5) con vista previa real; la
  ficha, el armador, el quiz, el carrito y el checkout usan la regla nueva.
- Menú: "Por objetivo" pasa a "Armá tu stack". "Reiniciar demo" borra también los borradores del panel.

## Fase 4 · Gamificación ✅ (publicada)
- **Niveles del Club**: Novato → Atleta → Élite → Bestia por gasto acumulado (`src/demo/fixtures/club.ts`, motor en
  `src/demo/engine/club-levels.ts`). Sección "Cargá tu batería" en el Club y el nivel junto al nombre en Mi cuenta.
- **Ruleta "Disco olímpico"**: disco de pesas SVG (rojo, azul, amarillo y verde con sus kilos), aro con 24 LED, maza de
  acero con "Girar" y traba de barra como puntero; se gira tocando, arrastrando con fuerza o con Enter. Pausa de 1,3 s
  con el gajo ganador marcado antes del cupón. Premios de suplementos: la plantilla `sample` ("Muestra de regalo")
  reemplaza al grabado y el shaker VOLTA al llavero (`ADMIN_STORE_VERSION` 8).
- **Juego "Shaker Rush"** en `/club/juego/`: canvas 2D a 60 fps, shaker con dedo, mouse o flechas; scoops, cápsulas y
  rayos suman, la chatarra saca vidas; rayo ×2, scoop dorado, combo hasta ×4, 3 vidas y 45 s. Premios por puntaje
  (300 → 5 %, 800 → 10 %, 1500 → envío gratis), **un cupón por día por navegador** (hora argentina), código
  `SHAKER…` que se aplica al carrito y aparece en Mis cupones, la billetera del Club y Mi cuenta. Motor y premios en
  funciones puras con semilla (`src/demo/engine/game*.ts`). Sonidos sintetizados y vibración en Android.
- Integración: Shaker Rush en el inicio, el Club, el menú (escritorio, celular y pie) y el panel (insignia y conteo).
- Confeti y escenario inmersivo con los colores de VOLTA.
- Falta probar en un teléfono real (Safari de iPhone: audio después del primer toque y arrastre sin rebote).

## Fase 5 · Regalos y temáticas fitness ✅ (en revisión)
- **Regalo a golpes contra una bolsa de boxeo** (`src/features/gifts/scenes/`): una sola escena SVG con la bolsa VOLTA
  colgando; cada golpe la balancea, suelta tiza y abre una costura con luz; en el quinto el frente se rompe y sale el
  pote "Edición regalo" antes del producto real. Variante por fecha (moño navideño, "Versión 2027", guantes del Día del
  Padre, calabaza musculosa, "precio secreto" de Black Friday…). Quien recibe nunca ve el precio.
- Regalos de prueba (código para `/regalo/`): VOLTA `REGALO-VE1M-AR7X`, Madre `REGALO-MADR-E26B`, Halloween
  `REGALO-HA11-0WEP`, CyberMonday `REGALO-CYB3-R725`, Black Friday `REGALO-B1AC-KFRW`, Navidad `REGALO-NAV1-DADP`,
  Año Nuevo `REGALO-AN02-027S`, San Valentín `REGALO-AM0R-014M`, Vuelta al gym `REGALO-GYM0-D1AN`, Hot Sale
  `REGALO-H0TS-A1EX`, Padre `REGALO-PADR-E26D`, Amigo `REGALO-AM1G-0S2S`, Verano `REGALO-VERA-N0SZ`.
- **12 temáticas fitness** (fuera las de Velmar): Día de la Madre, Halloween "Monster pump", CyberMonday, Black Friday,
  Navidad, Año Nuevo "Versión 2027", Vuelta al gym, San Valentín, Hot Sale, Día del Padre, Día del Amigo "compañero de
  gym" y Operación verano. Cada una con paleta clara y oscura, banner, cinta, adorno del logo, guirnalda, fondo con FX,
  cupón, cinco productos en oferta y **pantalla de carga propia** (que no pisa el logo; e2e en tres tamaños).
- 36 decoraciones SVG fitness nuevas; fuera Lola y Pancho: en el seguimiento va un cadete VOLTA en bici vestido según
  la fecha.
- Temáticas **encendidas**: modo automático por fecha (octubre → Día de la Madre) y "Probar temáticas" visible.
  `ADMIN_STORE_VERSION` 9.

## Pendiente de Velmar (se resuelve en su fase)
| Qué queda | Dónde se ve | Fase |
|---|---|---|
| Emails, recordatorios y email de cumpleaños de mascotas, cola de producción, insumos y calendario "del taller" | Panel | 6 y 7 |
| Editor de producto: si se llega con Tab a "Ver en tienda", al volver abre en el último paso (con mouse no pasa) | Panel → Productos | 6 |
| Estudio de contenido con decoraciones de Velmar | Panel → Estudio | 7 |
