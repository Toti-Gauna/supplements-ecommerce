// src/trailer/pieces/<pieza>.ts — la pieza como DATOS. Copiar, renombrar y completar desde el storyboard aprobado.
// Registrar: sumar el id en `src/trailer/pieces/ids.ts` y la pieza en `src/trailer/pieces/index.ts`.
import { beatSec, sequence } from "../core/timeline";
import type { TrailerSpec } from "../core/types";

const BPM = 128;
const beats = (n: number) => n * beatSec(BPM);

export const PIEZA: TrailerSpec = {
  id: "PIEZA",
  title: "NOMBRE",
  bpm: BPM,
  duration: beats(0 /* compases del storyboard × 4 */),
  // Plan musical: los tramos del storyboard §4, en TIEMPOS desde el inicio.
  music: { bpm: BPM, parts: [{ from: 0, to: 12, style: "tension" }, { from: 12, to: 40, style: "drop" }] },
  // Una entrada por fila del storyboard §3, en el mismo orden. `dur` siempre en `beats(...)`; el inicio lo calcula `sequence`.
  scenes: sequence([
    { id: "apertura", recipe: "eclipse-intro", dur: beats(12) },
    // { id: "ID", recipe: "RECETA", dur: beats(N), props: { /* las del storyboard */ } },
    { id: "en-vivo", recipe: "eclipse-cta", dur: beats(14) },
    // Precios (misma forma que en firma.ts): { id: "precio-campana", recipe: "eclipse-prices", dur: beats(10), props: { book: "tu-tienda", section: "base-campaign", n: "11" } },
    { id: "cierre", recipe: "eclipse-outro", dur: beats(10) },
  ]),
};

// Al terminar: `npx vitest run tests/unit/trailer-core.test.ts` (el validador revisa huecos, encimadas, grilla y recetas).
