import type { MusicPlan, Style, Voice } from "../audio/score";
import type { PieceEffect, SceneSpec } from "../core/types";

/**
 * Sonido de T1 · versión de ventas (19/10/2026): música publicitaria en Do mayor (marimba, ukelele, palmas y bajo redondo, con un gancho de
 * cuatro compases) en vez del sintetizador de pista. Todo se escribe relativo a las escenas, así un cambio de montaje no desarma la música:
 * cada tramo empieza y termina en una escena y cada efecto cae sobre algo que pasa en pantalla.
 */
type Row = [rel: number, voice: Voice, vel: number, midi?: number, dur?: number];
const SECTIONS: Array<[from: string, to: string | null, style: Style]> = [
  ["apertura", "calcadas", "ad-intro"],
  ["calcadas", "plano+2", "clon"], // el problema: todas las tiendas suenan igual
  ["plano+2", "latido", "plano"], // la línea plana: un seno solo
  ["latido", "w1-carga", "tension"], // el latido y la subida que corta medio tiempo antes del golpe
  ["w1-carga", "w3-regalo", "ad-chorus"], // DROP: arranca la tienda que se la juega
  ["w3-regalo", "w5-ruleta", "ad-verse"],
  ["w5-ruleta", "w7-proveedor", "ad-chorus"],
  ["w7-proveedor", "software", "ad-verse"],
  ["software", "asesoria", "ad-chorus"],
  ["asesoria", "sistema", "ad-verse"],
  ["sistema", "promesa", "ad-break"], // las pantallas de texto: palmas que marcan cada placa
  ["promesa", "en-vivo", "ad-chorus"],
  ["en-vivo", "oferta", "ad-intro"],
  ["oferta", "cierre", "ad-verse"], // precios con el groove liviano debajo
  ["cierre", null, "ad-end"],
];
/** Medio tiempo de silencio real justo antes de cada golpe: el drop, "No es solo software" y la promesa. */
const HITS_AFTER_SILENCE = ["w1-carga", "software", "promesa"];

const BAG = [0, 0.625, 1.25, 1.875, 2.5];
const WHEEL = [...Array.from({ length: 8 }, (_, k) => 0.5 + k / 8), ...Array.from({ length: 4 }, (_, k) => 1.5 + k / 4), 2.5].map((t) => t / 0.8);
const FX: Record<string, Row[]> = {
  calcadas: [0, 0.75, 1.5, 2.25].flatMap((t): Row[] => [[t, "click", 0.6], [t, "tick", 0.3, 69]]),
  veinte: [[0, "click", 0.5], [2.6, "tick", 0.5, 74]],
  potes: [[0, "whoosh", 0.25, 69, 2], [2.6, "tick", 0.5, 74]],
  plano: [[0.5, "click", 0.6], [1, "tick", 0.4, 62]],
  latido: [[0, "boom", 0.7, 33, 2]],
  "w1-carga": [[0.6, "tick", 0.45, 79], [1.25, "tick", 0.45, 79], [1.9, "tick", 0.5, 84]],
  "w2-tema": [[1.25, "click", 0.7], [1.25, "whoosh", 0.45, 69, 1], [2.5, "impact", 0.6, 33, 2]],
  "w3-regalo": [...BAG.flatMap((t, i): Row[] => [[t, "kick", 0.9, 36, 0.5], [t, "mallet", 0.5, [67, 69, 72, 74, 76][i]!, 0.5]]), [3.75, "shimmer", 0.7, 88]],
  "w4-shaker": [[0.6, "mallet", 0.45, 72, 0.5], [1.25, "mallet", 0.45, 76], [1.9, "mallet", 0.45, 79], [3.1, "impact", 0.55, 33, 2]],
  "w5-ruleta": [...WHEEL.map((t, i): Row => [t, "tick", 0.5 - (0.2 * i) / 12, 93]), [3.75, "impact", 0.65, 33, 2]],
  "w6-mostrador": [[0.6, "click", 0.7], [1.25, "impact", 0.7, 33, 2], [1.25, "mallet", 0.5, 72, 1]],
  "w7-proveedor": [[0, "click", 0.6], ...[0.6, 0.94, 1.25, 1.56].map((t, i): Row => [t, "tick", 0.45, [72, 74, 76, 79][i]!]), [3, "mallet", 0.45, 72, 1]],
  software: [[0, "whoosh", 0.4, 69, 1], [1, "mallet", 0.45, 76, 1], [3, "mallet", 0.45, 79, 1]],
  asesoria: [[0.5, "tick", 0.4, 81], [1, "tick", 0.4, 81], [1.5, "shimmer", 0.5, 84]],
  sistema: [[0, "impact", 0.5, 33, 2], [3, "impact", 0.5, 33, 2], [5, "impact", 0.6, 33, 2], ...[8, 9, 10, 11].map((t, i): Row => [t, "mallet", 0.55, [72, 74, 76, 79][i]!, 0.8])],
  promesa: [[0, "impact", 0.7, 33, 2], [0.25, "impact", 0.6, 33, 2], [0.5, "impact", 0.8, 33, 2], [1, "shimmer", 0.35, 88]],
};

/** Lleva escenas y tramos a tiempos absolutos (en tiempos musicales) con las escenas del montaje. */
export function t1Sound(scenes: SceneSpec[], bpm = 128): { music: MusicPlan; effects: PieceEffect[] } {
  const beat = 60 / bpm, r = (n: number) => Math.round(n * 1000) / 1000;
  const start = new Map(scenes.map((s) => [s.id, s.start / beat]));
  const total = scenes.reduce((t, s) => t + s.dur, 0) / beat;
  const at = (ref: string | null) => {
    if (ref === null) return total;
    const [id, plus] = ref.split("+");
    const s = start.get(id!);
    if (s === undefined) throw new Error(`Sonido de T1: no existe la escena ${id}`);
    return r(s + Number(plus ?? 0));
  };
  const parts = SECTIONS.map(([from, to, style]) => ({ from: at(from), to: at(to), style }));
  const silences = HITS_AFTER_SILENCE.map((id) => [at(id) - 0.5, at(id)] as [number, number]);
  const effects = Object.entries(FX).flatMap(([scene, rows]) =>
    rows.map(([rel, voice, vel, midi, dur]) => ({ scene, t: r(at(scene) + rel), voice, vel, ...(midi !== undefined && { midi }), ...(dur !== undefined && { dur }) })));
  return { music: { bpm, parts, silences }, effects };
}
