/**
 * Música sintetizada para los videos (WebAudio, sin archivos ni licencias): base electrónica de gimnasio que cierra
 * con la duración del video. Dos climas: "pulso" (124 bpm, bombo en negras y arpegio) y "potencia" (96 bpm, más
 * pesado, con golpe en el 2 y el 4).
 */
export type StudioMusic = "none" | "pulso" | "potencia";

export const MUSIC_LABEL: Record<StudioMusic, string> = { none: "Sin música", pulso: "Pulso", potencia: "Potencia" };

const NOTE = (n: number) => 440 * 2 ** ((n - 69) / 12);
// La menor: i – VI – III – VII (notas MIDI del bajo) y un arpegio por compás.
const BASS = [45, 41, 48, 43];
const ARP = [[69, 72, 76, 72], [65, 69, 72, 69], [72, 76, 79, 76], [67, 71, 74, 71]];

function tone(ac: BaseAudioContext, out: AudioNode, freq: number, at: number, len: number, type: OscillatorType, gain: number, slideTo?: number) {
  const osc = ac.createOscillator(), g = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, at);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, at + len);
  g.gain.setValueAtTime(0.0001, at);
  g.gain.exponentialRampToValueAtTime(gain, at + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, at + len);
  osc.connect(g).connect(out);
  osc.start(at);
  osc.stop(at + len + 0.05);
}

/** Ruido corto filtrado (platillo o golpe), con un búfer reusado. */
function noise(ac: BaseAudioContext, out: AudioNode, at: number, len: number, gain: number, high: boolean) {
  const buffer = ac.createBuffer(1, Math.ceil(ac.sampleRate * len), ac.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const src = ac.createBufferSource(), filter = ac.createBiquadFilter(), g = ac.createGain();
  src.buffer = buffer;
  filter.type = high ? "highpass" : "bandpass";
  filter.frequency.value = high ? 7000 : 1800;
  g.gain.setValueAtTime(gain, at);
  g.gain.exponentialRampToValueAtTime(0.0001, at + len);
  src.connect(filter).connect(g).connect(out);
  src.start(at);
}

/** Programa la música desde ahora hasta `duration` segundos (con un final que baja). Devuelve cómo cortarla. */
export function playJingle(ac: AudioContext, out: AudioNode, mood: Exclude<StudioMusic, "none">, duration: number): () => void {
  const master = ac.createGain();
  master.gain.value = 0.55;
  master.connect(out);
  const t0 = ac.currentTime + 0.05;
  const heavy = mood === "potencia";
  const beat = 60 / (heavy ? 96 : 124);
  const end = t0 + duration;
  for (let bar = 0; t0 + bar * beat * 4 < end; bar++) {
    const at = t0 + bar * beat * 4;
    for (let k = 0; k < 4; k++) {
      const b = at + k * beat;
      if (b > end - 0.15) break;
      // Bombo: en negras ("pulso") o en el 1 y el 3 ("potencia"), con golpe en el 2 y el 4.
      if (!heavy || k % 2 === 0) tone(ac, master, 130, b, 0.22, "sine", 0.6, 42);
      if (heavy && k % 2 === 1) noise(ac, master, b, 0.16, 0.22, false);
      if (!heavy) noise(ac, master, b + beat / 2, 0.05, 0.08, true);
      tone(ac, master, NOTE(BASS[bar % 4]!), b, beat * 0.9, heavy ? "sawtooth" : "triangle", heavy ? 0.06 : 0.1);
      if (!heavy) tone(ac, master, NOTE(ARP[bar % 4]![k]!), b + beat / 2, beat * 0.4, "square", 0.025);
    }
    if (heavy) for (const n of [BASS[bar % 4]! + 24, BASS[bar % 4]! + 31]) tone(ac, master, NOTE(n), at, beat * 3.8, "sawtooth", 0.018);
  }
  master.gain.setValueAtTime(0.55, Math.max(t0, end - 1.2));
  master.gain.linearRampToValueAtTime(0.0001, end);
  return () => { master.gain.cancelScheduledValues(ac.currentTime); master.gain.setValueAtTime(0.0001, ac.currentTime); master.disconnect(); };
}
