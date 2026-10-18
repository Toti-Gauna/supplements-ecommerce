import { env, filter, gain, mtof, noiseSrc, osc, type VoiceFn } from "./kit";

/** Batería y voces tonales de la música (recetas de `.claude/skills/sound-design/references/recetas-sintesis.md`). */
export const kick: VoiceFn = (c, b, n) => {
  const g = gain(c, b.music); env(g.gain, n.t, 0.002, 0.42, n.vel);
  const o = osc(c, "sine", 160, n.t, 0.45, g); o.frequency.exponentialRampToValueAtTime(46, n.t + 0.13);
  const k = gain(c, b.music); env(k.gain, n.t, 0.001, 0.02, n.vel * 0.35); osc(c, "triangle", 1400, n.t, 0.03, k);
};
export const clap: VoiceFn = (c, b, n) => {
  const f = filter(c, "bandpass", 1100, gain(c, b.music, 0.9), 1.1);
  [0, 0.011, 0.022].forEach((d, i) => { const g = gain(c, f); env(g.gain, n.t + d, 0.001, i === 2 ? 0.18 : 0.012, n.vel); noiseSrc(c, n.t + d, 0.2, g, i * 0.31); });
  const send = gain(c, b.reverb, 0.25); env(send.gain, n.t, 0.001, 0.15, n.vel); noiseSrc(c, n.t, 0.16, filter(c, "bandpass", 1500, send));
};
export const hat: VoiceFn = (c, b, n) => {
  const g = gain(c, b.music); env(g.gain, n.t, 0.001, 0.05, n.vel * 0.5);
  noiseSrc(c, n.t, 0.06, filter(c, "highpass", 7500, g), n.t * 0.37);
};
export const sub: VoiceFn = (c, b, n) => {
  const g = gain(c, filter(c, "lowpass", 180, b.music)); env(g.gain, n.t, 0.01, n.dur, n.vel * 0.9);
  osc(c, "sine", mtof(n.midi), n.t, n.dur, g);
};
export const bass: VoiceFn = (c, b, n) => {
  const f = filter(c, "lowpass", 900, b.pad, 2); f.frequency.setValueAtTime(900, n.t); f.frequency.exponentialRampToValueAtTime(260, n.t + n.dur);
  const g = gain(c, f); env(g.gain, n.t, 0.004, n.dur, n.vel * 0.5);
  osc(c, "sawtooth", mtof(n.midi), n.t, n.dur, g); osc(c, "sine", mtof(n.midi), n.t, n.dur, g);
};
export const pluck: VoiceFn = (c, b, n) => {
  const out = gain(c, b.music); const send = gain(c, b.reverb, 0.28);
  const f = filter(c, "lowpass", 4200, out, 1.2); f.connect(send);
  f.frequency.setValueAtTime(4200, n.t); f.frequency.exponentialRampToValueAtTime(700, n.t + 0.28);
  const g = gain(c, f); env(g.gain, n.t, 0.004, Math.min(n.dur, 0.6), n.vel * 0.32);
  osc(c, "sawtooth", mtof(n.midi), n.t, n.dur, g, -7); osc(c, "sawtooth", mtof(n.midi), n.t, n.dur, g, 7);
};
export const bell: VoiceFn = (c, b, n) => {
  const out = gain(c, b.music, 0.8); out.connect(gain(c, b.reverb, 0.6));
  const g = gain(c, out); env(g.gain, n.t, 0.003, n.dur + 0.6, n.vel * 0.5);
  const carrier = osc(c, "sine", mtof(n.midi), n.t, n.dur + 0.6, g);
  const mg = gain(c, carrier.frequency, mtof(n.midi) * 2); env(mg.gain, n.t, 0.002, 0.5, mtof(n.midi) * 2);
  osc(c, "sine", mtof(n.midi) * 3.01, n.t, n.dur + 0.6, mg);
};
export const pad: VoiceFn = (c, b, n) => {
  const f = filter(c, "lowpass", 1400, b.pad); f.connect(gain(c, b.reverb, 0.5));
  const g = gain(c, f); g.gain.setValueAtTime(0.0001, n.t);
  g.gain.linearRampToValueAtTime(n.vel * 0.22, n.t + Math.min(0.6, n.dur / 3));
  g.gain.setValueAtTime(n.vel * 0.22, n.t + n.dur - 0.3); g.gain.linearRampToValueAtTime(0.0001, n.t + n.dur + 0.4);
  osc(c, "sawtooth", mtof(n.midi), n.t, n.dur + 0.4, g, -9); osc(c, "sawtooth", mtof(n.midi), n.t, n.dur + 0.4, g, 9);
};
export const keys: VoiceFn = (c, b, n) => {
  const out = gain(c, b.music); out.connect(gain(c, b.reverb, 0.45));
  const g = gain(c, filter(c, "lowpass", 2600, out)); env(g.gain, n.t, 0.005, 1.4, n.vel * 0.55);
  osc(c, "sine", mtof(n.midi), n.t, 1.4, g); osc(c, "triangle", mtof(n.midi) * 2, n.t, 1.4, gain(c, g, 0.25));
};
/** Dron cerrado (pasabajos a 400 Hz, sin bombeo): el sonido de "todas las tiendas suenan igual". */
export const drone: VoiceFn = (c, b, n) => {
  const g = gain(c, filter(c, "lowpass", 400, b.music)); g.gain.setValueAtTime(0.0001, n.t);
  g.gain.linearRampToValueAtTime(n.vel * 0.2, n.t + 0.4); g.gain.setValueAtTime(n.vel * 0.2, n.t + n.dur - 0.2); g.gain.linearRampToValueAtTime(0.0001, n.t + n.dur + 0.1);
  osc(c, "sawtooth", mtof(n.midi), n.t, n.dur + 0.1, g, -6); osc(c, "sawtooth", mtof(n.midi), n.t, n.dur + 0.1, g, 6);
};
/** Acorde picado (compuerta en semicorcheas): saltos de pad por el bus que bombea. */
export const stab: VoiceFn = (c, b, n) => {
  const g = gain(c, filter(c, "lowpass", 2200, b.pad)); g.gain.setValueAtTime(0.0001, n.t);
  g.gain.linearRampToValueAtTime(n.vel * 0.3, n.t + 0.004); g.gain.setValueAtTime(n.vel * 0.3, n.t + n.dur - 0.012); g.gain.linearRampToValueAtTime(0.0001, n.t + n.dur);
  osc(c, "sawtooth", mtof(n.midi), n.t, n.dur, g, -8); osc(c, "sawtooth", mtof(n.midi), n.t, n.dur, g, 8);
};
/** Seno puro y quieto (≈ −24 dBFS con vel 1): la línea plana de la relación que no existe. */
export const tone: VoiceFn = (c, b, n) => {
  const g = gain(c, b.music); g.gain.setValueAtTime(0.0001, n.t);
  g.gain.linearRampToValueAtTime(n.vel * 0.08, n.t + 0.03); g.gain.setValueAtTime(n.vel * 0.08, n.t + n.dur - 0.02); g.gain.linearRampToValueAtTime(0.0001, n.t + n.dur);
  osc(c, "sine", mtof(n.midi), n.t, n.dur, g);
};
