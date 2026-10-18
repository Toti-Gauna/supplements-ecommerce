import { pieceNotes } from "../audio/piece";
import type { Note } from "../audio/score";
import type { TrailerSpec } from "../core/types";
import { RECIPES } from "../recipes";

/** Pista completa del trailer: música y cue sheet de la pieza más los efectos que declara cada escena, en su tiempo. */
export function trackFor(spec: TrailerSpec): Note[] {
  const notes = pieceNotes(spec);
  for (const scene of spec.scenes) {
    for (const cue of RECIPES[scene.recipe]?.cues?.(scene.props ?? {}, scene.dur) ?? []) {
      if (cue.t < 0 || cue.t > scene.dur) continue;
      notes.push({ midi: 69, dur: 0.4, vel: 0.7, ...cue, t: Math.round((scene.start + cue.t) * 10000) / 10000 });
    }
  }
  return notes.sort((a, z) => a.t - z.t);
}
