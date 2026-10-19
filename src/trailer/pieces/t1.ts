import { beatSec, sequence } from "../core/timeline";
import type { TrailerSpec } from "../core/types";
import { OPENINGS } from "@/demo/engine/gift-openings";
import { t1Sound } from "./t1-sonido";
import PLATES from "./t1-plates.json";
import { t1Summary } from "./t1-resumen";

const BPM = 128;
const beats = (n: number) => n * beatSec(BPM);
const SOFTWARE = ["No es", "solo", "software."];
/** Lo que vende Eclipse, en pantallas de solo texto con cambio de color (tanda 2 de la versión de ventas). */
const SISTEMA = [
  { lines: ["Vendés.", "¿Pero tu cliente vuelve?"], tone: "paper", beats: 3 },
  { lines: ["Eclipse no te hace", "solo una tienda."], tone: "night", beats: 2 },
  { lines: ["Te arma un sistema", "de crecimiento."], tone: "volt", beats: 3 },
  { lines: ["Ventas digitales."], tone: "night", beats: 1 },
  { lines: ["Clientes que vuelven."], tone: "paper", beats: 1 },
  { lines: ["Marketing y trends."], tone: "night", beats: 1 },
  { lines: ["Procesos más simples."], tone: "paper", beats: 1 },
] as const;
const PITCH = {
  label: "Probalo en vivo", title: "Eclipse potencia tus ventas,", italic: "crea tendencias y hace", italic2: "volver a tus clientes.",
  sub: "Mirá un ejemplo de cómo podría verse tu negocio potenciado.",
};

/**
 * Montaje de ventas (pedido de Ignacio, 19/10): apertura de 3 s, el bloque "Mismo…" a ritmo corto y cada escena de producto de 8 tiempos
 * (3,75 s) para que se lea todo. `speed` estira (< 1) o comprime (> 1) la coreografía de la receta dentro de su escena.
 */
const PRODUCT = 8;
const SCENES = sequence([
  { id: "apertura", recipe: "eclipse-intro", dur: beats(6), speed: 1.3 },
  { id: "calcadas", recipe: "clones", dur: beats(3), speed: 4 / 3, props: { variant: "tienda", text: "Mismo template." } },
  { id: "veinte", recipe: "ticker", dur: beats(3), speed: 4 / 3, props: { phrase: "20 % OFF", text: "Mismo 20 % OFF." } },
  { id: "potes", recipe: "clones", dur: beats(3), speed: 4 / 3, props: { variant: "catalogo", text: "Misma tienda." } },
  { id: "plano", recipe: "trace", dur: beats(4), props: { part: "plano", text: ["Y después de comprar, nada."] } },
  { id: "latido", recipe: "trace", dur: beats(2), props: { part: "latido", text: ["Tu negocio,", "no."] } },
  { id: "w1-carga", recipe: "splash-live", dur: beats(PRODUCT), speed: 0.8, props: { dates: ["crossfit-open", "black-friday", "navidad"], carry: ["Tu negocio,", "no."], chip: ["01", "Pantallas de carga por fecha"] } },
  { id: "w2-tema", recipe: "plate", dur: beats(PRODUCT), speed: 0.8, props: { mode: "tema", light: "ficha-light", dark: "ficha-dark", toggle: PLATES["ficha-light"].toggle, focus: PLATES["ficha-light"].hero, chip: ["02", "Modo claro y oscuro"],
      tall: { light: "ficha-light-t", dark: "ficha-dark-t", toggle: PLATES["ficha-light-t"].toggle, focus: PLATES["ficha-light-t"].hero } } },
  { id: "w3-regalo", recipe: "gift-live", dur: beats(PRODUCT), speed: 0.8, props: { occasion: "volta", title: "Juli, te llegó un regalo de Caro", prompts: OPENINGS.original.prompts, done: OPENINGS.original.done, chip: ["03", "Regalos que se abren a golpes"] } },
  { id: "w4-shaker", recipe: "shaker-replay", dur: beats(PRODUCT), speed: 0.8, props: { chip: ["04", "Un juego propio"] } },
  { id: "w5-ruleta", recipe: "wheel-live", dur: beats(PRODUCT), speed: 0.8, props: { eyebrow: "Disco olímpico", title: "Cargá la barra y girá", prize: 0, chip: ["05", "Ruleta de cupones"] } },
  { id: "w6-mostrador", recipe: "plate", dur: beats(PRODUCT), speed: 0.8, props: { mode: "cuotas", before: "cobrar", after: "cuotas", card: PLATES.cobrar.card, summary: PLATES.cuotas.summary, tall: { before: "cobrar-t", after: "cuotas-t", card: PLATES["cobrar-t"].card, summary: PLATES["cuotas-t"].summary }, lines: ["3 cuotas de", "$ 40.892"], note: "Total con recargo $ 122.676 · recargo 12 %", chip: ["06", "Mostrador en cuotas"] } },
  { id: "w7-proveedor", recipe: "plate", dur: beats(PRODUCT), speed: 0.8, props: { mode: "proveedor", before: "proveedor-pegar", after: "proveedor-resumen", load: PLATES["proveedor-pegar"].load, tall: { before: "proveedor-pegar-t", after: "proveedor-resumen-t", load: PLATES["proveedor-pegar-t"].load }, count: 48, word: "suben", rest: "3 bajan · 2 sin coincidencia",
      intro: "Tu proveedor te manda su lista de costos.", action: "La cruzás con tus productos y aplicás los precios con un toque.", chip: ["07", "Lista del proveedor"] } },
  { id: "software", recipe: "device", dur: beats(8), props: { lines: SOFTWARE, panel: "El panel, para vos", shop: "La tienda, para tus clientes" } },
  { id: "asesoria", recipe: "rules", dur: beats(4), props: { prev: SOFTWARE, lines: ["Asesoría de", "Growth marketing", "y fidelización."] } },
  { id: "sistema", recipe: "kinetic", dur: beats(12), props: { slides: SISTEMA } },
  { id: "promesa", recipe: "stack", dur: beats(4), props: { lines: ["Para que", "tu negocio", "venda más."] } },
  { id: "en-vivo", recipe: "eclipse-cta", dur: beats(12), props: { axis: true, pitch: PITCH } },
  { id: "oferta", recipe: "eclipse-offer", dur: beats(16), props: { n: "11" } },
  { id: "mantenimiento", recipe: "eclipse-prices", dur: beats(10), props: { book: "tu-tienda-ventas", section: "mantenimiento", n: "12" } },
  { id: "piezas", recipe: "eclipse-prices", dur: beats(10), props: { book: "tu-tienda-ventas", section: "piezas", n: "13" } },
  { id: "cierre", recipe: "eclipse-outro", dur: beats(8) },
]);

/**
 * T1 · "El problema y la diferencia" (teaser de ventas; la duración sale de la suma de sus escenas): una escena por fila de docs/trailer/t1/storyboard.md §3.
 * Las 19 escenas tienen su receta (T1.3, lotes 1 a 3); la pieza se publica en /trailer/t1/ en 16:9 (el 9:16 es de T1.5).
 */
const SOUND = t1Sound(SCENES);

export const t1: TrailerSpec = {
  id: "t1",
  title: "El problema y la diferencia",
  bpm: BPM,
  duration: SCENES.reduce((t, x) => t + x.dur, 0),
  music: SOUND.music,
  effects: SOUND.effects,
  scenes: SCENES,
  summary: t1Summary(SCENES),
};
