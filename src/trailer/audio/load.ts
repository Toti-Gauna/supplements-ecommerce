import { withBase } from "@/lib/base-path";
import { renderAudio } from "./render";
import type { Note } from "./score";

/** Tolerancia entre la duración del archivo y la del trailer: más que eso, el archivo es de otra versión y se descarta. */
const TOLERANCE = 0.25;

/**
 * Pista del trailer: primero el archivo pre-renderizado (`public/trailer/<pieza>.m4a`, lo deja el exportador), que
 * arranca al instante; si no existe, no llega o no coincide, se sintetiza con la partitura (síntesis de respaldo).
 * Next no agrega el basePath a `fetch`: se usa `withBase`.
 */
export async function loadTrack(pieza: string, duration: number, notes: Note[]): Promise<AudioBuffer> {
  try {
    const res = await fetch(withBase(`/trailer/${pieza}.m4a`));
    if (res.ok) {
      const buffer = await new OfflineAudioContext(2, 1, 48000).decodeAudioData(await res.arrayBuffer());
      if (Math.abs(buffer.duration - duration) <= TOLERANCE) return buffer;
    }
  } catch { /* sin archivo o sin red: se sintetiza */ }
  return renderAudio(notes, duration);
}
