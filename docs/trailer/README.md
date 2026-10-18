# Trailer comercial de "Tu tienda" (firma Eclipse)

Índice. La fuente de verdad del orden de trabajo es [`PLAN.md`](PLAN.md); el brief, [`PROMPT-trailer-volta.md`](PROMPT-trailer-volta.md).

| Qué | Dónde |
|---|---|
| Plan por pasos (P0.x y Tn.x) y modelo recomendado por paso | [`PLAN.md`](PLAN.md) |
| Recetas de kinetic-studio, tokens y precios de Eclipse, decisiones | [`biblia/referencias.md`](biblia/referencias.md) |
| Inventario de la interfaz y capturas | [`biblia/ui.md`](biblia/ui.md), `capturas/hojas/` |
| Motor, firma Eclipse y exportación | [`biblia/motor.md`](biblia/motor.md) |
| Partitura y mezcla | [`biblia/musica.md`](biblia/musica.md) |
| Plantillas de storyboard, pieza y escena | [`plantillas/`](plantillas/README.md) |
| **T1 · El problema y la diferencia** (teaser, 45 s): storyboard, escenas, sonido, veredicto y lámina | [`t1/storyboard.md`](t1/storyboard.md), [`t1/storyboard.jpg`](t1/storyboard.jpg) |
| Código | `src/trailer/` (`core`, `engine`, `recipes`, `eclipse`, `audio`, `pieces`), `app/trailer/[pieza]/` |
| Scripts | `scripts/trailer-capture.mjs`, `trailer-shots-publish.mjs`, `trailer-export.mjs` |
| Salidas publicadas | `public/trailer/` (`<pieza>.m4a`, `-16x9.mp4`, `-9x16.mp4`, `-email.mp4`, `-poster.jpg`) |

Ver una pieza: `/trailer/<pieza>/` (`?ratio=9x16`, `?t=12.5`, `?dev=1`). Exportar: `node scripts/trailer-export.mjs <pieza>`.
