# Estado por fase

## Fase 0 · Base técnica ✅
- Código de Velmar copiado (tienda, panel, ruleta, regalos, temáticas, tests y workflow de Pages) y renombrado a Volta:
  claves `volta-demo:*`, `volta-ui:*`, `volta-theme`, token de seguimiento `demo-volta`, códigos `VOL-000123`.
- Temáticas apagadas (`themeSettings.mode = "off"`, sin botón "Probar temáticas") hasta la Fase 5.
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

## Fase 2 · Ficha de suplemento y stack ✅ (en revisión)
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

## Pendiente de Velmar (se resuelve en su fase)
| Qué queda | Dónde se ve | Fase |
|---|---|---|
| Escenas de regalo y temáticas con los personajes de Velmar | `/regalo/`, temáticas (apagadas) | 5 |
| Ruleta con estética dorada de Velmar y premios "Grabado gratis" y "Llavero de regalo" | Club, al ir a pagar | 4 |
| Emails, recordatorios y email de cumpleaños de mascotas, cola de producción, insumos y calendario "del taller" | Panel | 6 y 7 |
| Editor de producto: si se llega con Tab a "Ver en tienda", al volver abre en el último paso (con mouse no pasa) | Panel → Productos | 6 |
| Estudio de contenido con decoraciones de Velmar | Panel → Estudio | 7 |
