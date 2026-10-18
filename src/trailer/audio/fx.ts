import { env, filter, gain, mtof, noiseSrc, osc, type VoiceFn } from "./kit";

/** Efectos del trailer: subidas, golpes, brillos y toques de interfaz (siempre atados a algo que pasa en pantalla). */
export const riser: VoiceFn = (c, b, n) => {
  const g = gain(c, b.sfx); g.gain.setValueAtTime(0.0001, n.t); g.gain.exponentialRampToValueAtTime(n.vel * 0.5, n.t + n.dur); g.gain.setValueAtTime(0.0001, n.t + n.dur + 0.005);
  const f = filter(c, "bandpass", 400, g, 2.5); f.frequency.setValueAtTime(400, n.t); f.frequency.exponentialRampToValueAtTime(8000, n.t + n.dur);
  noiseSrc(c, n.t, n.dur, f);
  const s = osc(c, "sawtooth", 110, n.t, n.dur, gain(c, filter(c, "lowpass", 1800, g), 0.25)); s.frequency.exponentialRampToValueAtTime(440, n.t + n.dur);
};
export const impact: VoiceFn = (c, b, n) => {
  const g = gain(c, b.sfx); env(g.gain, n.t, 0.002, 1.2, n.vel * 0.9);
  const o = osc(c, "sine", 80, n.t, 1.2, g); o.frequency.exponentialRampToValueAtTime(42, n.t + 0.5);
  const air = gain(c, filter(c, "highpass", 3000, b.reverb)); env(air.gain, n.t, 0.002, 0.5, n.vel * 0.35); noiseSrc(c, n.t, 0.5, air, 0.4);
};
export const boom: VoiceFn = (c, b, n) => {
  const g = gain(c, b.sfx); g.connect(gain(c, b.reverb, 0.5)); env(g.gain, n.t, 0.01, 3, n.vel * 0.8);
  const o = osc(c, "sine", 55, n.t, 3, g); o.frequency.exponentialRampToValueAtTime(34, n.t + 2.4);
};
export const shimmer: VoiceFn = (c, b, n) => {
  const g = gain(c, b.reverb, 1); g.gain.setValueAtTime(0.0001, n.t); g.gain.exponentialRampToValueAtTime(n.vel * 0.25, n.t + 0.25); g.gain.exponentialRampToValueAtTime(0.0001, n.t + 1.2);
  noiseSrc(c, n.t, 1.2, filter(c, "highpass", 7000, g), 0.9);
  [0, 7, 12].forEach((iv, i) => { const t = gain(c, b.sfx); env(t.gain, n.t + i * 0.06, 0.003, 1.6, n.vel * 0.12); osc(c, "sine", mtof(n.midi + iv), n.t + i * 0.06, 1.6, t); });
};
export const whoosh: VoiceFn = (c, b, n) => {
  const g = gain(c, b.sfx); g.gain.setValueAtTime(0.0001, n.t); g.gain.exponentialRampToValueAtTime(n.vel * 0.4, n.t + n.dur * 0.55); g.gain.exponentialRampToValueAtTime(0.0001, n.t + n.dur);
  const f = filter(c, "bandpass", 600, g, 1.4); f.frequency.setValueAtTime(600, n.t); f.frequency.exponentialRampToValueAtTime(4000, n.t + n.dur);
  noiseSrc(c, n.t, n.dur, f, n.t * 0.13);
};
export const tick: VoiceFn = (c, b, n) => { const g = gain(c, b.sfx); env(g.gain, n.t, 0.001, 0.02, n.vel * 0.18); osc(c, "sine", 2400 + (n.midi % 5) * 40, n.t, 0.03, g); };
export const click: VoiceFn = (c, b, n) => {
  const g = gain(c, b.sfx); env(g.gain, n.t, 0.001, 0.025, n.vel * 0.4); osc(c, "sine", 1200, n.t, 0.03, g);
  const k = gain(c, b.sfx); env(k.gain, n.t, 0.0005, 0.004, n.vel * 0.5); noiseSrc(c, n.t, 0.005, k);
};
/** Silencio real: el máster se cierra en 15 ms desde `n.t` hasta `n.t + n.dur` y se abre de golpe (corta también las colas de reverb). */
export const gate: VoiceFn = (c, b, n) => {
  const p = b.gate.gain;
  p.setValueAtTime(1, n.t); p.linearRampToValueAtTime(0, n.t + 0.015); p.setValueAtTime(0, n.t + n.dur); p.setValueAtTime(1, n.t + n.dur + 0.0001);
};
