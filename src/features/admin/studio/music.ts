/**
 * Música sintetizada para los videos (WebAudio, sin archivos ni licencias): acordes suaves y una melodía corta que
 * cierra con la duración del video. Dos climas: cálida (Día de la Madre, Navidad) y festiva (Hot Sale, Orgullo).
 */
export type StudioMusic = "none" | "calida" | "festiva";

const NOTE = (n: number) => 440 * 2 ** ((n - 69) / 12);
// I – vi – IV – V en Do mayor (notas MIDI de cada acorde) y la melodía por compás.
const CHORDS = [[60, 64, 67], [57, 60, 64], [53, 57, 60], [55, 59, 62]];
const MELODY = [72, 76, 79, 76, 74, 72, 69, 72, 77, 76, 74, 71, 74, 76, 79, 84];

function tone(ac: BaseAudioContext, out: AudioNode, freq: number, at: number, len: number, type: OscillatorType, gain: number) {
  const osc = ac.createOscillator(), g = ac.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  g.gain.setValueAtTime(0.0001, at);
  g.gain.exponentialRampToValueAtTime(gain, at + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, at + len);
  osc.connect(g).connect(out);
  osc.start(at);
  osc.stop(at + len + 0.05);
}

/** Programa la música desde ahora hasta `duration` segundos (con un final que baja). Devuelve cómo cortarla. */
export function playJingle(ac: AudioContext, out: AudioNode, mood: Exclude<StudioMusic, "none">, duration: number): () => void {
  const master = ac.createGain();
  master.gain.value = 0.5;
  master.connect(out);
  const t0 = ac.currentTime + 0.05;
  const beat = mood === "festiva" ? 60 / 118 : 60 / 88;
  const bars = Math.ceil(duration / (beat * 4));
  for (let bar = 0; bar < bars; bar++) {
    const at = t0 + bar * beat * 4;
    if (at > t0 + duration) break;
    for (const n of CHORDS[bar % 4]!) tone(ac, master, NOTE(n), at, beat * 4, "triangle", mood === "festiva" ? 0.05 : 0.07);
    for (let k = 0; k < 4; k++) {
      const nt = at + k * beat;
      if (nt > t0 + duration - 0.2) break;
      tone(ac, master, NOTE(MELODY[(bar * 4 + k) % MELODY.length]!), nt, beat * (mood === "festiva" ? 0.45 : 0.9), mood === "festiva" ? "square" : "sine", mood === "festiva" ? 0.035 : 0.09);
      if (mood === "festiva" && k % 2 === 1) tone(ac, master, 2200, nt, 0.05, "square", 0.02);
    }
  }
  master.gain.setValueAtTime(0.5, t0 + Math.max(0, duration - 1.2));
  master.gain.linearRampToValueAtTime(0.0001, t0 + duration);
  return () => { master.gain.cancelScheduledValues(ac.currentTime); master.gain.setValueAtTime(0.0001, ac.currentTime); master.disconnect(); };
}
