# Estado por fase

## Fase 0 · Base técnica ✅
- Código de Velmar copiado (tienda, panel, ruleta, regalos, temáticas, tests y workflow de Pages) y renombrado a Volta:
  claves `volta-demo:*`, `volta-ui:*`, `volta-theme`, token de seguimiento `demo-volta`, códigos `VOL-000123`.
- Temáticas apagadas (`themeSettings.mode = "off"`, sin botón "Probar temáticas") hasta la Fase 5.
- Documentación original en `docs/referencia-velmar/`.

## Fase 1 · Identidad eléctrica y catálogo ✅ (en revisión)
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

## Pendiente de Velmar (se resuelve en su fase)
| Qué queda | Dónde se ve | Fase |
|---|---|---|
| Código de personalización (texto, foto, collar) sin usar por ningún producto | Panel → Categorías y personalización, editor de producto | 2 |
| "¿Cuándo llega?" calcula con la capacidad del taller | Ficha | 2 |
| Escenas de regalo y temáticas con los personajes de Velmar | `/regalo/`, temáticas (apagadas) | 5 |
| Ruleta con estética dorada de Velmar | Club, al ir a pagar | 4 |
| Emails, recordatorios de cumpleaños de mascotas, cola de producción, insumos de taller | Panel | 6 y 7 |
| Estudio de contenido con decoraciones de Velmar | Panel → Estudio | 7 |
