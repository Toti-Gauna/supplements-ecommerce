import { beatSec } from "../core/timeline";
import type { TrailerSpec } from "../core/types";
import { buildScore, type Note } from "./score";

/** Notas de la pieza sin recetas (puro): la música por tramos más el cue sheet de la pieza, con el tiempo en segundos. */
export function pieceNotes(spec: TrailerSpec): Note[] {
  const beat = beatSec(spec.bpm), sec = (n: number) => Math.round(n * beat * 10000) / 10000;
  const notes = spec.music ? buildScore(spec.music) : [];
  for (const e of spec.effects ?? []) notes.push({ midi: 69, ...e, t: sec(e.t), dur: sec(e.dur ?? 1) });
  return notes.sort((a, z) => a.t - z.t);
}
