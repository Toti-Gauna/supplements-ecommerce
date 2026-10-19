import { env, filter, gain, mtof, noiseSrc, osc, type VoiceFn } from "./kit";

/**
 * Voces de la música publicitaria (versión de ventas de T1, 19/10/2026): instrumentos de "comercial de YouTube" en vez del sintetizador
 * de pista. Marimba para el gancho, ukelele para los acordes a contratiempo, chasquidos y un bajo redondo, sin sierras ni filtros que barren.
 */
export const mallet: VoiceFn = (c, b, n) => {
  const out = gain(c, b.music, 0.9); out.connect(gain(c, b.reverb, 0.35));
  const g = gain(c, out); env(g.gain, n.t, 0.002, Math.min(0.9, n.dur + 0.4), n.vel * 0.55);
  osc(c, "sine", mtof(n.midi), n.t, 1, g);
  const h = gain(c, out); env(h.gain, n.t, 0.001, 0.12, n.vel * 0.22); osc(c, "sine", mtof(n.midi) * 4, n.t, 0.15, h); // el "toc" de la tecla
  const k = gain(c, out); env(k.gain, n.t, 0.001, 0.02, n.vel * 0.12); osc(c, "triangle", mtof(n.midi) * 8, n.t, 0.03, k);
};
export const uke: VoiceFn = (c, b, n) => {
  const out = gain(c, b.music, 0.8); out.connect(gain(c, b.reverb, 0.2));
  const g = gain(c, filter(c, "lowpass", 3200, out, 0.8)); env(g.gain, n.t, 0.002, Math.min(0.28, n.dur), n.vel * 0.3);
  osc(c, "triangle", mtof(n.midi), n.t, 0.3, g); osc(c, "square", mtof(n.midi), n.t, 0.3, gain(c, g, 0.15));
};
export const snap: VoiceFn = (c, b, n) => {
  const g = gain(c, filter(c, "bandpass", 2400, b.music, 2.5)); env(g.gain, n.t, 0.001, 0.06, n.vel * 0.9);
  noiseSrc(c, n.t, 0.08, g, n.t * 0.53);
};
export const ebass: VoiceFn = (c, b, n) => {
  const g = gain(c, filter(c, "lowpass", 520, b.pad, 0.9)); env(g.gain, n.t, 0.006, n.dur, n.vel * 0.55);
  osc(c, "sine", mtof(n.midi), n.t, n.dur, g); osc(c, "triangle", mtof(n.midi), n.t, n.dur, gain(c, g, 0.35));
};
