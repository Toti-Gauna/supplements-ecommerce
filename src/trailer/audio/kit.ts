import type { Note } from "./score";

/** Buses de la mezcla: música, pad (con bombeo en cada bombo), efectos y envío a la reverb. */
export interface Buses { music: AudioNode; pad: GainNode; sfx: AudioNode; reverb: AudioNode }
export type VoiceFn = (c: BaseAudioContext, b: Buses, n: Note) => void;

export const mtof = (m: number) => 440 * 2 ** ((m - 69) / 12);

/** Azar con semilla (mulberry32): el ruido y la reverb salen siempre iguales, como pide el seek determinista. */
export function seeded(seed: number) {
  let a = seed >>> 0;
  return () => { a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

const noiseCache = new WeakMap<BaseAudioContext, AudioBuffer>();
/** Dos segundos de ruido blanco con semilla, compartidos por todas las voces del contexto. */
export function noise(c: BaseAudioContext): AudioBuffer {
  let buf = noiseCache.get(c);
  if (!buf) {
    buf = c.createBuffer(1, c.sampleRate * 2, c.sampleRate);
    const d = buf.getChannelData(0), r = seeded(7);
    for (let i = 0; i < d.length; i++) d[i] = r() * 2 - 1;
    noiseCache.set(c, buf);
  }
  return buf;
}

/** Envolvente: sube en `a` hasta `peak` y cae exponencial hasta casi cero al final de `len`. */
export function env(p: AudioParam, t: number, a: number, len: number, peak: number) {
  p.setValueAtTime(0.0001, t);
  p.exponentialRampToValueAtTime(Math.max(peak, 0.0002), t + Math.max(a, 0.002));
  p.exponentialRampToValueAtTime(0.0001, t + Math.max(len, a + 0.01));
}

export function gain(c: BaseAudioContext, to: AudioNode | AudioParam, value = 1): GainNode {
  const g = c.createGain(); g.gain.value = value;
  if (to instanceof AudioParam) g.connect(to); else g.connect(to);
  return g;
}

export function osc(c: BaseAudioContext, type: OscillatorType, freq: number, t: number, len: number, to: AudioNode, detune = 0): OscillatorNode {
  const o = c.createOscillator(); o.type = type; o.frequency.setValueAtTime(freq, t); o.detune.value = detune;
  o.connect(to); o.start(t); o.stop(t + len + 0.05); return o;
}

export function noiseSrc(c: BaseAudioContext, t: number, len: number, to: AudioNode, offset = 0): AudioBufferSourceNode {
  const s = c.createBufferSource(); s.buffer = noise(c); s.loop = true; s.connect(to);
  s.start(t, offset % 1.9); s.stop(t + len + 0.05); return s;
}

export function filter(c: BaseAudioContext, type: BiquadFilterType, freq: number, to: AudioNode, q = 0.7): BiquadFilterNode {
  const f = c.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q; f.connect(to); return f;
}

/** Reverb de sala con respuesta al impulso sintética (ruido estéreo con caída exponencial, 2,5 s, con semilla). */
export function reverb(c: BaseAudioContext, to: AudioNode): ConvolverNode {
  const len = Math.floor(c.sampleRate * 2.5), ir = c.createBuffer(2, len, c.sampleRate), r = seeded(11);
  for (let ch = 0; ch < 2; ch++) { const d = ir.getChannelData(ch); for (let i = 0; i < len; i++) d[i] = (r() * 2 - 1) * Math.exp(-i / c.sampleRate / 0.7); }
  const v = c.createConvolver(); v.buffer = ir; v.connect(to); return v;
}
