# Kit de venta

Todo lo que hace falta para mostrarle la tienda al dueño de un local de suplementos y para dejarla probada en celulares
reales antes de la reunión. VOLTA es una marca inventada; con la demo armada para el prospecto
([marca-blanca.md](../marca-blanca.md)) cambian el nombre y los colores, no los botones.

| Pieza | Para qué |
|---|---|
| [guion-90s.md](guion-90s.md) | El recorrido corto: arranca en **Hoy**, sigue con el **Mostrador** y los "wow", con tiempos por bloque, qué tocar y qué decir |
| [../guion-demo.md](../guion-demo.md) | La reunión completa de 10 minutos (preparación, tienda en el celular, panel, cierre comercial, plan B y preguntas) |
| [../manual-del-dueno.md](../manual-del-dueno.md) | El manual del panel, tarea por tarea, para dejarle al dueño y a su equipo |
| [qa-celulares.md](qa-celulares.md) | Checklist para probar la demo en un iPhone y en un Android de gama media antes de mandarla |
| [img/](img/) | Capturas del guion de 90 s en celular (390) y compu (1440), modo oscuro |
| [video/recorrido-kit.webm](video/recorrido-kit.webm) | El guion grabado (60–90 s, compu, sin sonido) para mandar por WhatsApp o dejar corriendo en una pantalla |

## Cuándo usar cada cosa

- **Primer contacto o "mandame algo"**: el video y dos capturas (Hoy y Mostrador). Que vea en un minuto qué se lleva.
- **Reunión de 2 minutos** (en el mostrador, con gente esperando): [guion-90s.md](guion-90s.md) en la compu o en la tablet.
- **Reunión sentada**: [guion-demo.md](../guion-demo.md) entero. Los 90 s son el bloque del panel.
- **Antes de cualquier reunión con una demo nueva**: [qa-celulares.md](qa-celulares.md).

## Capturas y video: cómo regenerarlos

Salen de la build estática con los datos de muestra y la fecha fija de la demo (lunes 5 de octubre de 2026), así que
siempre muestran lo mismo.

```bash
PAGES_BASE_PATH=/supplements-ecommerce npm run build
node scripts/capture-kit.mjs        # → docs/kit-de-venta/img/ (1440 y 390)
node scripts/record-kit-video.mjs   # → docs/kit-de-venta/video/recorrido-kit.webm
```

- Los dos levantan su propio servidor (puertos 4397 y 4398; se cambian con `CAPTURE_PORT`) y lo cierran al terminar.
- El recorrido está en `scripts/kit-lib.mjs`, un paso por bloque del guion, con la duración de cada bloque en el video.
- Los dos recorren lo mismo, en el mismo orden del guion: Hoy, Mostrador, Pedidos, Lista del proveedor, el lote que
  vence, A quién escribirle hoy, Campañas y regalos, y el modo dueño. Si se agrega un bloque nuevo que todavía no está
  en la build, marcarlo `r4c: true` en `kit-lib.mjs`: se saltea con un aviso en lugar de cortar el recorrido.
- Si el video pasa de 15 MB, el script lo regraba solo en 960 × 540.

## Estado de las salidas

Con todo R4c en la build: 30 capturas (15 por tamaño, incluidas `04-proveedor-diferencias`,
`04-proveedor-margen-marca` y `05-lote-accion`) y el video de 88 s (9,0 MB, 1280 × 720). Los `ms` de cada bloque en
`scripts/kit-lib.mjs` son el piso: con la máquina cargada cada paso tarda un poco más, así que si el video pasa de
90 s, bajarlos.
