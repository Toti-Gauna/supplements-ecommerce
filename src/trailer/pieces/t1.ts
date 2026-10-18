import { beatSec, sequence } from "../core/timeline";
import type { TrailerSpec } from "../core/types";
import { T1_EFFECTS, T1_MUSIC } from "./t1-sonido";

const BPM = 128;
const beats = (n: number) => n * beatSec(BPM);

/**
 * T1 · "El problema y la diferencia" (teaser, 45 s = 96 tiempos): una escena por fila de docs/trailer/t1/storyboard.md §3.
 * Las recetas marcadas (clones, ticker, trace, splash-live…) se construyen en T1.3; hasta entonces la pieza no se publica
 * (no está en `ids.ts`) y solo existe para fijar los tiempos y el sonido.
 */
export const t1: TrailerSpec = {
  id: "t1",
  title: "El problema y la diferencia",
  bpm: BPM,
  duration: beats(96),
  music: T1_MUSIC,
  effects: T1_EFFECTS,
  scenes: sequence([
    { id: "apertura", recipe: "eclipse-intro", dur: beats(12) },
    { id: "calcadas", recipe: "clones", dur: beats(4), props: { variant: "tienda", text: "Mismo template." } },
    { id: "veinte", recipe: "ticker", dur: beats(4), props: { phrase: "20 % OFF", text: "Mismo 20 % OFF." } },
    { id: "potes", recipe: "clones", dur: beats(4), props: { variant: "catalogo", text: "Misma grilla de potes." } },
    { id: "plano", recipe: "trace", dur: beats(4), props: { part: "plano", text: ["Y después de comprar, nada."] } },
    { id: "latido", recipe: "trace", dur: beats(2), props: { part: "latido", text: ["La tuya,", "no."] } },
    { id: "w1-carga", recipe: "splash-live", dur: beats(4) },
    { id: "w2-tema", recipe: "themeflip", dur: beats(3) },
    { id: "w3-regalo", recipe: "gift-live", dur: beats(4) },
    { id: "w4-shaker", recipe: "shaker-replay", dur: beats(3) },
    { id: "w5-ruleta", recipe: "wheel-live", dur: beats(4) },
    { id: "w6-mostrador", recipe: "plate", dur: beats(4) },
    { id: "w7-proveedor", recipe: "plate", dur: beats(4) },
    { id: "software", recipe: "device", dur: beats(4) },
    { id: "asesoria", recipe: "rules", dur: beats(4) },
    { id: "promesa", recipe: "stack", dur: beats(4) },
    { id: "en-vivo", recipe: "eclipse-cta", dur: beats(12) },
    { id: "guino", recipe: "eclipse-guino", dur: beats(6) },
    { id: "cierre", recipe: "eclipse-outro", dur: beats(10) },
  ]),
};
