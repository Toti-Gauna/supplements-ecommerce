import { beatSec, sequence } from "../core/timeline";
import type { TrailerSpec } from "../core/types";
import { OPENINGS } from "@/demo/engine/gift-openings";
import { T1_EFFECTS, T1_MUSIC } from "./t1-sonido";
import PLATES from "./t1-plates.json";
import { t1Summary } from "./t1-resumen";

const BPM = 128;
const beats = (n: number) => n * beatSec(BPM);
const SOFTWARE = ["No es", "solo", "software."];

const SCENES = sequence([
  { id: "apertura", recipe: "eclipse-intro", dur: beats(12) },
  { id: "calcadas", recipe: "clones", dur: beats(4), props: { variant: "tienda", text: "Mismo template." } },
  { id: "veinte", recipe: "ticker", dur: beats(4), props: { phrase: "20 % OFF", text: "Mismo 20 % OFF." } },
  { id: "potes", recipe: "clones", dur: beats(4), props: { variant: "catalogo", text: "Misma grilla de potes." } },
  { id: "plano", recipe: "trace", dur: beats(4), props: { part: "plano", text: ["Y después de comprar, nada."] } },
  { id: "latido", recipe: "trace", dur: beats(2), props: { part: "latido", text: ["La tuya,", "no."] } },
  { id: "w1-carga", recipe: "splash-live", dur: beats(4), props: { dates: ["crossfit-open", "black-friday", "navidad"], carry: ["La tuya,", "no."], chip: ["01", "Pantallas de carga por fecha"] } },
  { id: "w2-tema", recipe: "plate", dur: beats(3), props: { mode: "tema", light: "ficha-light", dark: "ficha-dark", toggle: PLATES["ficha-light"].toggle, focus: PLATES["ficha-light"].hero, chip: ["02", "Modo claro y oscuro"] } },
  { id: "w3-regalo", recipe: "gift-live", dur: beats(4), props: { occasion: "volta", title: "Juli, te llegó un regalo de Caro", prompts: OPENINGS.original.prompts, done: OPENINGS.original.done, chip: ["03", "Regalos que se abren a golpes"] } },
  { id: "w4-shaker", recipe: "shaker-replay", dur: beats(3), props: { chip: ["04", "Un juego propio"] } },
  { id: "w5-ruleta", recipe: "wheel-live", dur: beats(4), props: { eyebrow: "Disco olímpico", title: "Cargá la barra y girá", prize: 0, chip: ["05", "Ruleta de cupones"] } },
  { id: "w6-mostrador", recipe: "plate", dur: beats(4), props: { mode: "cuotas", before: "cobrar", after: "cuotas", card: PLATES.cobrar.card, summary: PLATES.cuotas.summary, lines: ["3 cuotas de", "$ 40.892"], note: "Total con recargo $ 122.676 · recargo 12 %", chip: ["06", "Mostrador en cuotas"] } },
  { id: "w7-proveedor", recipe: "plate", dur: beats(4), props: { mode: "proveedor", before: "proveedor-pegar", after: "proveedor-resumen", load: PLATES["proveedor-pegar"].load, count: 48, word: "suben", rest: "3 bajan · 2 sin coincidencia", chip: ["07", "Lista del proveedor"] } },
  { id: "software", recipe: "device", dur: beats(4), props: { lines: SOFTWARE } },
  { id: "asesoria", recipe: "rules", dur: beats(4), props: { prev: SOFTWARE, lines: ["Asesoría de", "Growth marketing", "y fidelización."] } },
  { id: "promesa", recipe: "stack", dur: beats(4), props: { lines: ["Para que", "la tuya", "venda más."] } },
  { id: "en-vivo", recipe: "eclipse-cta", dur: beats(12), props: { axis: true } },
  { id: "guino", recipe: "eclipse-guino", dur: beats(6), props: { book: "tu-tienda", section: "base-campaign", n: "11" } },
  { id: "cierre", recipe: "eclipse-outro", dur: beats(10) },
]);

/**
 * T1 · "El problema y la diferencia" (teaser, 45 s = 96 tiempos): una escena por fila de docs/trailer/t1/storyboard.md §3.
 * Las 19 escenas tienen su receta (T1.3, lotes 1 a 3); la pieza se publica en /trailer/t1/ en 16:9 (el 9:16 es de T1.5).
 */
export const t1: TrailerSpec = {
  id: "t1",
  title: "El problema y la diferencia",
  bpm: BPM,
  duration: beats(96),
  music: T1_MUSIC,
  effects: T1_EFFECTS,
  scenes: SCENES,
  summary: t1Summary(SCENES),
};
