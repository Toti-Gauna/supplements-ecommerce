import { beatSec, sequence } from "../core/timeline";
import type { TrailerSpec } from "../core/types";

const BPM = 128;
const beats = (n: number) => n * beatSec(BPM);

/**
 * Pieza de prueba del motor (P0.3): una escena de cada receta, cortes en la grilla de 128 BPM. No es un trailer:
 * sirve para probar el seek determinista, los dos formatos y la exportación.
 */
export const demo: TrailerSpec = {
  id: "demo",
  title: "Prueba del motor",
  bpm: BPM,
  duration: beats(36),
  scenes: sequence([
    { id: "pregunta", recipe: "typewriter", dur: beats(8), props: { text: "¿Tu tienda se parece a todas?" } },
    { id: "verbos", recipe: "slam", dur: beats(8), props: { beat: beats(2), words: [{ text: "Comprá", tone: "volt" }, { text: "Jugá", tone: "night" }, { text: "Volvé", tone: "paper" }, { text: "Regalá", tone: "volt" }] } },
    { id: "proveedor", recipe: "statpunch", dur: beats(6), props: { value: 48, suffix: " suben", label: "Lista del proveedor", note: "y cada marca con su margen" } },
    { id: "tema", recipe: "themeflip", dur: beats(6), props: { title: "Día y noche", body: "La misma tienda, en claro y en oscuro, con un toque." } },
    { id: "cierre", recipe: "title", dur: beats(8), props: { eyebrow: "Eclipse presenta", lines: ["Tu tienda", "en otro nivel"], accentLine: 1 } },
  ]),
};
