import * as fx from "./fx";
import { gain, reverb, type Buses, type VoiceFn } from "./kit";
import type { Note, Voice } from "./score";
import * as voices from "./voices";

const VOICES: Record<Voice, VoiceFn> = { ...voices, ...fx };
/** Ganancia final (medida con ffmpeg sobre la firma: ≈ −14 LUFS integrado, pico ≤ −1 dBTP; docs/trailer/biblia/musica.md). */
export const MASTER = 0.94;
export const SAMPLE_RATE = 48000;

/**
 * Renderiza la pista completa sin conexión (no necesita el gesto del usuario): música + efectos → reverb, compresor de
 * pegamento, ganancia final y limitador. El pad y el bajo "bombean" con cada bombo. Mismas notas = mismas muestras.
 */
export async function renderAudio(notes: Note[], duration: number, sampleRate = SAMPLE_RATE): Promise<AudioBuffer> {
  const c = new OfflineAudioContext(2, Math.ceil((duration + 0.3) * sampleRate), sampleRate);
  const limiter = c.createDynamicsCompressor();
  limiter.threshold.value = -1.5; limiter.knee.value = 0; limiter.ratio.value = 20; limiter.attack.value = 0.002; limiter.release.value = 0.12;
  limiter.connect(c.destination);
  const glue = c.createDynamicsCompressor();
  glue.threshold.value = -16; glue.knee.value = 8; glue.ratio.value = 2.5; glue.attack.value = 0.01; glue.release.value = 0.2;
  glue.connect(gain(c, limiter, MASTER));
  const music = gain(c, glue, 0.85);
  const buses: Buses = { music, pad: gain(c, music, 1), sfx: gain(c, glue, 0.8), reverb: reverb(c, gain(c, glue, 0.32)) };
  for (const n of notes) {
    if (n.voice === "kick") { buses.pad.gain.setValueAtTime(0.42, n.t); buses.pad.gain.linearRampToValueAtTime(1, n.t + 0.24); }
    VOICES[n.voice](c, buses, n);
  }
  return ceiling(await c.startRendering());
}

/** Techo de pico: el limitador de WebAudio no es de pared, así que al final se baja todo si algún pico pasa de −2 dBFS. */
function ceiling(buffer: AudioBuffer, peak = 0.79): AudioBuffer {
  let max = 0;
  for (let ch = 0; ch < buffer.numberOfChannels; ch++) for (const s of buffer.getChannelData(ch)) max = Math.max(max, Math.abs(s));
  if (max <= peak) return buffer;
  const k = peak / max;
  for (let ch = 0; ch < buffer.numberOfChannels; ch++) { const d = buffer.getChannelData(ch); for (let i = 0; i < d.length; i++) d[i]! *= k; }
  return buffer;
}
