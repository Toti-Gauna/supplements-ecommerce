import { withBase } from "@/lib/base-path";
import { renderAudio } from "./render";
import type { Note } from "./score";
import "../engine/audio-prime";

/** Tolerancia entre la duración del archivo y la del trailer: más que eso, el archivo es de otra versión y se descarta.
 * El render deja 0,3 s de cola y el AAC suma su relleno: con 0,25 s se descartaba el archivo de la firma (50,0 s contra 49,69 s). */
const TOLERANCE = 0.4;

/**
 * Pista del trailer: primero el archivo pre-renderizado (`public/trailer/<pieza>.m4a`, lo deja el exportador), que
 * arranca al instante; si no existe, no llega o no coincide, se sintetiza con la partitura (síntesis de respaldo).
 * Next no agrega el basePath a `fetch`: se usa `withBase`.
 */
export async function loadTrack(pieza: string, duration: number, notes: Note[]): Promise<AudioBuffer> {
  try {
    const res = await fetch(withBase(`/trailer/${pieza}.m4a`));
    if (res.ok) {
      const data = await res.arrayBuffer();
      const buffer = await decode(data);
      if (buffer && Math.abs(buffer.duration - duration) <= TOLERANCE) return buffer;
    }
  } catch { /* sin archivo o sin red: se sintetiza */ }
  return renderAudio(notes, duration);
}

/**
 * Decodifica el AAC. En Safari de iPhone el contexto offline de una muestra no siempre decodifica: se prueba con uno de un segundo y, si
 * falla, con el contexto de audio que dejó el toque de "Ver trailer" (o uno nuevo, suspendido), que decodifica en todos los navegadores.
 */
async function decode(data: ArrayBuffer): Promise<AudioBuffer | null> {
  const attempts: Array<() => BaseAudioContext> = [
    () => new OfflineAudioContext(2, 48000, 48000),
    () => window.__trailerAudio ?? new AudioContext(),
  ];
  for (const make of attempts) {
    try {
      const ctx = make();
      return await withTimeout(ctx.decodeAudioData(data.slice(0)), 8000);
    } catch { /* siguiente intento */ }
  }
  return null;
}

const withTimeout = <T,>(p: Promise<T>, ms: number) => Promise.race([p, new Promise<T>((_, reject) => setTimeout(() => reject(new Error("tiempo")), ms))]);
