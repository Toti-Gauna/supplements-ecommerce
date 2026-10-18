# Storyboard de <PIEZA> (copiar a `docs/trailer/<pieza>/storyboard.md`)

> Plantilla de Tn.1. Cada escena queda atada a una receta, a un componente o captura del inventario (`biblia/ui.md`) y a un
> compás. Con esto completo, Tn.3 se escribe sin decidir nada. Borrá las líneas de ayuda al llenarla.

## 1. Ficha
| Campo | Valor |
|---|---|
| Pieza | `t1` · `t2` · `t3` · `t4` |
| Nombre | |
| Duración | ___ s = ___ compases (a ___ BPM: 1 compás = 4 tiempos = 1,875 s a 128) |
| Para quién | dueño de una tienda de suplementos |
| Una frase | lo que tiene que quedarle a quien lo vea |
| Formatos | 16:9 primero; 9:16 después sobre la misma línea de tiempo |
| Cierre | `eclipse-cta` → `eclipse-prices` (las secciones que correspondan) → `eclipse-outro` |

## 2. Dirección elegida
Panel de 3 direcciones (cinematográfica, lúdica, de precisión), el juez y la rúbrica con puntaje; qué se toma de cada una.
Máximo 15 líneas.

## 3. Escenas (una fila por escena; sin huecos ni encimadas)
| # | id | Compases | Inicio → fin (s) | Receta | Props | Imagen (id de `ui.md` · real o captura) | Super (texto en pantalla) | Cámara / transición | Notas 9:16 |
|---|---|---|---|---|---|---|---|---|---|
| 1 | `apertura` | 0–6 | 0,0 → 11,3 | `eclipse-intro` | — | — | "Eclipse · Presenta…" | — | igual |
| 2 | | | | | | | | | |

Reglas:
- Los inicios caen en medio tiempo; `validateTrailer` lo comprueba (compases enteros = siempre).
- **Super:** frase corta en español rioplatense, sin la marca "Volta"; la tienda se llama "Tu tienda".
- **Imagen:** solo piezas que existen en `ui.md`. Real = componente montado con fixtures; captura = id de `trailer-capture`.
- **Wow del prompt (§7):** marcá en qué escena cae cada una (pantallas de carga, regalo, Shaker Rush, ruleta, claro/oscuro,
  Mostrador en cuotas, lista del proveedor, WhatsApp automático, envío).

## 4. Música (plan por tramos, en tiempos desde el inicio)
| Desde | Hasta | Estilo | Qué pasa en imagen |
|---|---|---|---|
| 0 | 12 | `tension` | apertura |
| 12 | | `drop` | |
Estilos: `tension` · `drop` · `calm` · `final` · `silence` (`biblia/musica.md`). El silencio antes de cada drop es medio tiempo.

## 5. Efectos (cue sheet)
| Escena | t (s, relativo) | Voz | Atado a |
|---|---|---|---|
| | | `tick` `click` `whoosh` `impact` `shimmer` `riser` `boom` | qué se ve en ese instante |
Contrato: ningún toque sin sonido ni sonido sin toque. Las recetas existentes ya traen sus `cues`.

## 6. Capturas que usa
Lista de ids (`tienda/ficha-galeria`, `panel/mostrador-cuotas`…) con tamaño (1440 · 390) y modo (light · dark). Se publican con
`node scripts/trailer-shots-publish.mjs <pieza>` (ver `plantillas/README.md`).

## 7. Datos reales que se muestran
Cada cifra con su origen (fixture, cálculo de la app, tarifario). **Solo cifras reales**; nada que la app no haga.

## 8. Aprobación
- [ ] Ignacio aprobó el storyboard (fecha, cambios pedidos).
