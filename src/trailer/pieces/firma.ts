import { beatSec, sequence } from "../core/timeline";
import type { TrailerSpec } from "../core/types";

const BPM = 128;
const beats = (n: number) => n * beatSec(BPM);

/**
 * Firma de Eclipse (P0.4): la apertura "Presenta…", un adelanto con escenas de prueba (donde irá cada trailer), el
 * cierre con "Probalo en vivo", el contacto, el libro de precios y el eclipse que se cierra. Es lo que comparten T1–T4.
 */
export const firma: TrailerSpec = {
  id: "firma",
  title: "Firma de Eclipse",
  bpm: BPM,
  duration: beats(106),
  scenes: sequence([
    { id: "apertura", recipe: "eclipse-intro", dur: beats(12) },
    { id: "pregunta", recipe: "typewriter", dur: beats(8), props: { text: "¿Tu tienda se parece a todas?" } },
    { id: "verbos", recipe: "slam", dur: beats(8), props: { beat: beats(2), words: [{ text: "Comprá", tone: "volt" }, { text: "Jugá", tone: "night" }, { text: "Volvé", tone: "paper" }, { text: "Regalá", tone: "volt" }] } },
    { id: "proveedor", recipe: "statpunch", dur: beats(6), props: { value: 48, suffix: " suben", label: "Lista del proveedor", note: "y cada marca con su margen" } },
    { id: "tema", recipe: "themeflip", dur: beats(6), props: { title: "Día y noche", body: "La misma tienda, en claro y en oscuro, con un toque." } },
    { id: "en-vivo", recipe: "eclipse-cta", dur: beats(14) },
    { id: "precio-campana", recipe: "eclipse-prices", dur: beats(10), props: { book: "tu-tienda", section: "base-campaign", n: "11" } },
    { id: "precio-pack", recipe: "eclipse-prices", dur: beats(10), props: { book: "tu-tienda", section: "launch-pack-draft", n: "12" } },
    { id: "precio-planes", recipe: "eclipse-prices", dur: beats(10), props: { book: "tu-tienda", section: "planes", n: "13" } },
    { id: "precio-extras", recipe: "eclipse-prices", dur: beats(12), props: { book: "tu-tienda", section: "extras", n: "14" } },
    { id: "cierre", recipe: "eclipse-outro", dur: beats(10) },
  ]),
};
