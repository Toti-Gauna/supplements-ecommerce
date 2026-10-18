import type { SceneSpec, TrailerSpec } from "./types";

/** Tolerancia de los chequeos de tiempo: menos de medio cuadro a 60 fps. */
const EPS = 0.005;

export const beatSec = (bpm: number) => 60 / bpm;
/** Segundos de `n` compases de 4 tiempos. */
export const bars = (n: number, bpm: number) => n * 4 * beatSec(bpm);

const onGrid = (t: number, step: number) => Math.abs(t / step - Math.round(t / step)) * step < EPS;

/**
 * Valida un trailer antes de armarlo: escenas en orden, sin huecos ni encimadas, cubriendo toda la duración, ids
 * únicos y cada corte en la grilla de medio tiempo. Devuelve la lista de problemas (vacía = válido).
 */
export function validateTrailer(spec: TrailerSpec): string[] {
  const errors: string[] = [];
  const half = beatSec(spec.bpm) / 2;
  const ids = new Set<string>();
  let cursor = 0;
  spec.scenes.forEach((s, i) => {
    if (ids.has(s.id)) errors.push(`escena repetida: ${s.id}`);
    ids.add(s.id);
    if (!(s.dur > 0)) errors.push(`${s.id}: duración inválida (${s.dur})`);
    if (Math.abs(s.start - cursor) > EPS) errors.push(`${s.id}: empieza en ${s.start} y la anterior termina en ${round(cursor)} (${s.start > cursor ? "hueco" : "encimada"})`);
    if (!onGrid(s.start, half)) errors.push(`${s.id}: el corte en ${s.start} s no cae en la grilla de ${round(half)} s`);
    cursor = s.start + s.dur;
    if (i === spec.scenes.length - 1 && Math.abs(cursor - spec.duration) > EPS) errors.push(`la última escena termina en ${round(cursor)} y el trailer dura ${spec.duration}`);
  });
  if (spec.scenes.length === 0) errors.push("el trailer no tiene escenas");
  return errors;
}

/** Escena que está en pantalla en el segundo `t` (la última si `t` es el final). */
export function sceneAt(spec: TrailerSpec, t: number): SceneSpec | undefined {
  return spec.scenes.find((s) => t >= s.start - EPS && t < s.start + s.dur - EPS) ?? (t >= spec.duration - EPS ? spec.scenes.at(-1) : undefined);
}

/** Arma escenas consecutivas a partir de duraciones: evita sumar tiempos a mano en el storyboard. */
export function sequence<P extends object>(items: Array<Omit<SceneSpec<P>, "start">>, from = 0): SceneSpec<P>[] {
  let t = from;
  return items.map((s) => { const scene = { ...s, start: round(t) }; t += s.dur; return scene; });
}

const round = (n: number) => Math.round(n * 1000) / 1000;
