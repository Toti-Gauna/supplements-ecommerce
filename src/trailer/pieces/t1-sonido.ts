import type { MusicPlan, Voice } from "../audio/score";
import type { PieceEffect } from "../core/types";

/**
 * Sonido de T1 · "El problema y la diferencia" (docs/trailer/t1/sonido.md): plan musical por tramos y cue sheet, todo en
 * tiempos desde el inicio (128 BPM). Lo que ya suena por estilo no se repite acá: el impacto del DROP 1 (32), el boom del
 * DROP 2 (56), el latido y la subida de 28 y la línea plana de 26 a 27,5. Los efectos de `eclipse-*` son de cada receta.
 */
export const T1_MUSIC: MusicPlan = {
  bpm: 128,
  parts: [
    { from: 0, to: 12, style: "tension" }, { from: 12, to: 26, style: "clon" }, { from: 26, to: 28, style: "plano" },
    { from: 28, to: 32, style: "tension" }, { from: 32, to: 48, style: "drop" }, { from: 48, to: 56, style: "stutter" },
    { from: 56, to: 68, style: "half" }, { from: 68, to: 86, style: "calm" }, { from: 86, to: 96, style: "final" },
  ],
  // Medio tiempo de silencio real antes de cada golpe: la subida de la apertura, la línea plana, el "1" congelado, "48 suben" y la promesa.
  silences: [[11.5, 12], [27.5, 28], [31.5, 32], [55.5, 56], [67.5, 68]],
  // De 37 a 39 los golpes a la bolsa son la batería: se caen el bombo y el bajo del groove.
  breaks: [{ from: 37, to: 39.5, voices: ["kick", "bass"] }],
};

type Row = [t: number, voice: Voice, vel: number, midi?: number, dur?: number];
const rows = (scene: string, list: Row[]): PieceEffect[] =>
  list.map(([t, voice, vel, midi, dur]) => ({ scene, t, voice, vel, ...(midi !== undefined && { midi }), ...(dur !== undefined && { dur }) }));

const PASTE = [12, 13, 14, 15].flatMap((t): Row[] => [[t, "click", 0.7], [t, "tick", 0.35, 69]]);
const BAG = [37, 37.5, 38, 38.5, 39];
const WHEEL: number[] = [...Array.from({ length: 8 }, (_, k) => 44.5 + k / 8), ...Array.from({ length: 4 }, (_, k) => 45.5 + k / 4), 46.5];

export const T1_EFFECTS: PieceEffect[] = [
  ...rows("calcadas", PASTE),
  ...rows("veinte", [[16, "click", 0.5], [18, "riser", 0.3, 69, 1.5], [19.5, "tick", 0.6, 74]]),
  ...rows("potes", [[20, "whoosh", 0.25, 69, 2.75], [23, "tick", 0.6, 74], [23.5, "tick", 0.3, 64]]),
  ...rows("plano", [[24.5, "click", 0.6], [25, "tick", 0.4, 62], [25.5, "whoosh", 0.4, 69, 1]]),
  ...rows("latido", [[28, "boom", 0.7, 33, 4]]),
  ...rows("w1-carga", [[30, "tick", 0.5, 81], [30.5, "tick", 0.5, 81], [31, "tick", 0.5, 81], [32, "boom", 0.8, 33, 4], [33, "tick", 0.3, 88], [33.5, "tick", 0.3, 88]]),
  ...rows("w2-tema", [[34, "tick", 0.3, 88], [34.5, "tick", 0.25, 93], [35, "click", 0.7], [35, "whoosh", 0.5, 69, 1], [36, "impact", 0.7, 33, 2]]),
  ...rows("w3-regalo", [
    ...BAG.flatMap((t, i): Row[] => [[t, "kick", 0.9, 36, 0.5], [t, "impact", 0.5, 33, 2], [t, "bass", 0.7, [41, 45, 48, 52, 53][i]!, 0.45]]),
    [39, "whoosh", 0.4, 69, 1], [40, "shimmer", 0.7, 88],
  ]),
  ...rows("w4-shaker", [[41, "tick", 0.3, 88], [43, "impact", 0.6, 33, 2]]),
  ...rows("w5-ruleta", [[44, "whoosh", 0.35, 69, 0.5], ...WHEEL.map((t, i): Row => [t, "tick", 0.5 - (0.2 * i) / 12, 93]), [47, "impact", 0.7, 33, 2]]),
  ...rows("w6-mostrador", [[48, "tick", 0.3, 88], [48.5, "click", 0.7], [48.5, "whoosh", 0.4, 69, 0.5], [49, "impact", 0.8, 33, 2], [49.5, "tick", 0.3, 81]]),
  ...rows("w7-proveedor", [[52, "click", 0.6], [52.125, "tick", 0.4, 74], [52.5, "tick", 0.45, 76], [52.75, "tick", 0.45, 79], [53, "tick", 0.45, 81], [53.25, "impact", 0.8, 33, 2], [53.5, "tick", 0.3, 69]]),
  ...rows("software", [[56, "whoosh", 0.4, 69, 1], [56.5, "impact", 0.6, 33, 2]]),
  ...rows("asesoria", [[60, "whoosh", 0.3, 69, 1], [60.5, "tick", 0.4, 81], [61, "tick", 0.4, 81], [61.5, "impact", 0.6, 33, 2], [61.5, "shimmer", 0.5, 84]]),
  ...rows("promesa", [[64, "impact", 0.7, 33, 2], [64.25, "impact", 0.6, 33, 2], [64.5, "impact", 0.8, 33, 2], [65, "shimmer", 0.35, 88]]),
  ...rows("guino", [[80, "whoosh", 0.25, 69, 1], [80.5, "tick", 0.2, 81], [81, "bell", 0.4, 81, 1], [82, "tick", 0.2, 76]]),
];
