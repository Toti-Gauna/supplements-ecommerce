# Plantillas del trailer (P0.7)

Cómo se pasa de storyboard a trailer sin decidir nada por el camino. Orden de trabajo de cada pieza (Tn):

| Paso | Qué se hace | Plantilla / herramienta |
|---|---|---|
| Tn.1 | Dirección y guion cuadro por cuadro | [`storyboard.md`](storyboard.md) → `docs/trailer/<pieza>/storyboard.md` |
| Tn.2 | Música de la pieza | plan por tramos en `music` de la pieza + `biblia/musica.md` |
| Tn.3 | Construcción 16:9 | [`pieza.ts.tpl`](pieza.ts.tpl) (la pieza como datos) y [`escena.tsx.tpl`](escena.tsx.tpl) (una escena nueva) |
| Tn.4 | Revisión de calidad | skill `trailer-qa` |
| Tn.5 | Versión 9:16 | cada receta ya recibe `ratio`: se ajusta el layout vertical |
| Tn.6 | Exportación y PR | `node scripts/trailer-export.mjs <pieza>` |

## Reglas que no se discuten (de `biblia/motor.md`)
1. Una escena = una receta (`defineRecipe`): DOM estático + `build` determinista + `cues`. Nada fuera del timeline.
2. Todos los tiempos en **compases/tiempos** (`beats(n)`); los cortes caen en medio tiempo (lo valida `validateTrailer`).
3. Colores solo de la ficha de marca (`TONES`/`TR`) o de Eclipse (`EC`): nunca un hex suelto.
4. Textos en español rioplatense; la tienda se llama "Tu tienda"; nunca "Volta" en pantalla (`check:marca`).
5. Cifras reales: salen de fixtures, de un cálculo de la app o del tarifario aprobado. Los precios, de `eclipse/book.ts`.
6. Cada escena nueva suma una prueba: el cuadro congelado en 3 tiempos (`seek`) coincide con el storyboard.

## Escenas con la interfaz real
1. **Qué es real y qué es captura:** se decide en el storyboard §3 con `biblia/ui.md`. Lo que no usa azar ni reloj propio se
   monta como componente real; el resto va como captura.
2. **Capturas:** `NEXT_PUBLIC_BRAND=tutienda … npm run build` y `node scripts/trailer-capture.mjs "" <filtro>` las generan
   en `docs/trailer/capturas/` (PNG a 2×, no versionadas).
3. **Publicar las que usa la pieza:** listar los ids en `docs/trailer/<pieza>/capturas.json`
   (`["tienda/ficha-galeria-1440-dark", …]`) y correr `node scripts/trailer-shots-publish.mjs <pieza>`: las convierte a JPEG
   calidad 88 en `public/trailer/shots/` (a 2880 px de ancho como máximo). En la receta: `withBase("/trailer/shots/<id>.jpg")`.
4. **Azar o reloj propio** (ruleta, Shaker Rush, códigos de regalo): se fija con una semilla o con el tiempo del timeline;
   Shaker Rush usa el piloto automático (`src/demo/engine/game-autopilot.ts`).

## Lista de control antes de pedir la aprobación del PR
- [ ] `npx vitest run` y `npm run lint` sin errores; `npm run check:marca` pasa.
- [ ] Mismo segundo = mismos píxeles (`tests/e2e/trailer-engine.spec.ts`, agregar la pieza).
- [ ] 16:9 y 9:16 revisados en cuadros de cada escena; sin texto cortado.
- [ ] Exportada: `<pieza>-16x9.mp4`, `-9x16.mp4`, `-email.mp4` (< 10 MB), póster y `.m4a`.
- [ ] El storyboard aprobado y el informe de QA están en `docs/trailer/<pieza>/`.
