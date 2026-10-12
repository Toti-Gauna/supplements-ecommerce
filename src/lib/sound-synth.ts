/**
 * Voces de la tienda (Fase 8): síntesis WebAudio corta y sutil con el tono del "laboratorio eléctrico". Todo pasa por
 * un filtro suave y un compresor (nada pica ni satura aunque suenen dos a la vez) y el ruido sale de un único buffer
 * reutilizado (la ruleta dispara un clic cada 32 ms: no se crea un buffer por clic).
 */

export interface Synth { ctx: AudioContext; out: AudioNode; noise: AudioBuffer }

/** Cadena de salida: volumen general → paso bajo (saca el filo digital) → compresor → parlantes. */
export function createSynth(ctx: AudioContext): Synth {
  const master = ctx.createGain();
  master.gain.value = 0.34;
  const soft = ctx.createBiquadFilter();
  soft.type = "lowpass";
  soft.frequency.value = 9000;
  const comp = ctx.createDynamicsCompressor();
  comp.threshold.value = -16;
  comp.knee.value = 12;
  comp.ratio.value = 4;
  comp.attack.value = 0.003;
  comp.release.value = 0.15;
  master.connect(soft).connect(comp).connect(ctx.destination);
  const noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
  const data = noise.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  return { ctx, out: master, noise };
}

interface ToneOpts { type?: OscillatorType; gain?: number; attack?: number; slideTo?: number; sweep?: [number, number] }

/** Nota con envolvente exponencial; `sweep` le pone un paso bajo que se abre (la "carga"). */
function tone(s: Synth, freq: number, at: number, dur: number, { type = "sine", gain = 0.5, attack = 0.006, slideTo, sweep }: ToneOpts = {}): void {
  const { ctx } = s;
  const osc = ctx.createOscillator();
  const env = ctx.createGain();
  const t = ctx.currentTime + at;
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t + dur * 0.8);
  env.gain.setValueAtTime(0.0001, t);
  env.gain.exponentialRampToValueAtTime(gain, t + attack);
  env.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  let head: AudioNode = osc;
  if (sweep) {
    const f = ctx.createBiquadFilter();
    f.type = "lowpass";
    f.Q.value = 6;
    f.frequency.setValueAtTime(sweep[0], t);
    f.frequency.exponentialRampToValueAtTime(sweep[1], t + dur * 0.9);
    head = osc.connect(f);
  }
  head.connect(env).connect(s.out);
  osc.start(t);
  osc.stop(t + dur + 0.02);
}

interface NoiseOpts { gain?: number; from?: number; to?: number; q?: number; kind?: BiquadFilterType }

/** Ráfaga de ruido filtrado: chispa (agudo), cuero (grave) o soplido (barrido). */
function noise(s: Synth, at: number, dur: number, { gain = 0.3, from = 2500, to, q = 1.4, kind = "bandpass" }: NoiseOpts = {}): void {
  const { ctx } = s;
  const src = ctx.createBufferSource();
  const filter = ctx.createBiquadFilter();
  const env = ctx.createGain();
  const t = ctx.currentTime + at;
  src.buffer = s.noise;
  filter.type = kind;
  filter.Q.value = q;
  filter.frequency.setValueAtTime(from, t);
  if (to) filter.frequency.exponentialRampToValueAtTime(to, t + dur);
  env.gain.setValueAtTime(gain, t);
  env.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(filter).connect(env).connect(s.out);
  // Cada ráfaga arranca en otro punto del buffer: dos clics seguidos no suenan idénticos.
  src.start(t, Math.random() * Math.max(0, s.noise.duration - dur - 0.05), dur + 0.02);
}

export type SoundName = "add" | "favorite" | "unfavorite" | "coupon" | "tick" | "spin" | "win" | "purchase" | "error" | "nav" | "hit" | "open"
  | "catch" | "powerup" | "junk" | "gameover";

/** `step` (opcional) varía el sonido: el combo de Shaker Rush sube el tono; cada golpe a la bolsa suena más abierto. */
export const VOICES: Record<SoundName, (s: Synth, step: number) => void> = {
  // Carga eléctrica: chispa, zumbido que se abre y un "ping" limpio de confirmación (≈ 0,3 s).
  add: (s) => {
    noise(s, 0, 0.045, { gain: 0.1, from: 4200, kind: "highpass", q: 0.7 });
    tone(s, 110, 0, 0.16, { type: "sawtooth", gain: 0.09, slideTo: 220, sweep: [380, 3600] });
    tone(s, 1318, 0.13, 0.2, { gain: 0.16 });
    tone(s, 2637, 0.13, 0.12, { gain: 0.035 });
  },
  favorite: (s) => { tone(s, 784, 0, 0.12, { gain: 0.26 }); tone(s, 1175, 0.07, 0.2, { gain: 0.2 }); },
  unfavorite: (s) => { tone(s, 784, 0, 0.1, { gain: 0.2 }); tone(s, 587, 0.06, 0.16, { gain: 0.16 }); },
  // Cupón aplicado: la misma carga, más corta, y dos notas que suben.
  coupon: (s) => {
    tone(s, 220, 0, 0.12, { type: "sawtooth", gain: 0.06, slideTo: 440, sweep: [500, 4000] });
    tone(s, 1047, 0.1, 0.2, { gain: 0.16 });
    tone(s, 1568, 0.18, 0.28, { gain: 0.14 });
  },
  // Clic metálico del disco al pasar cada gajo: transitorio agudo y un brillo de acero cortísimo.
  tick: (s) => { noise(s, 0, 0.014, { gain: 0.24, from: 3800, kind: "highpass", q: 0.8 }); tone(s, 2300, 0, 0.035, { gain: 0.035 }); },
  // Arranque del disco: un "whoosh" grave de algo pesado que empieza a girar.
  spin: (s) => { noise(s, 0, 0.5, { gain: 0.12, from: 260, to: 1300, q: 0.9 }); tone(s, 92, 0, 0.45, { gain: 0.14, slideTo: 64 }); },
  win: (s) => {
    [523, 659, 784].forEach((f) => tone(s, f, 0, 0.5, { type: "triangle", gain: 0.13 }));
    tone(s, 1047, 0.14, 0.7, { gain: 0.2 });
    [1568, 2093].forEach((f, i) => tone(s, f, 0.28 + i * 0.07, 0.32, { gain: 0.06 }));
  },
  // Acorde cálido de cierre: compra confirmada
  purchase: (s) => {
    [392, 494, 587].forEach((f) => tone(s, f, 0, 0.35, { gain: 0.12 }));
    [523, 659, 784, 1047].forEach((f) => tone(s, f, 0.2, 0.9, { type: "triangle", gain: 0.12 }));
  },
  // Error: dos notas graves y redondas (sin onda cuadrada: avisa sin retar).
  error: (s) => { tone(s, 233, 0, 0.12, { type: "triangle", gain: 0.2 }); tone(s, 185, 0.11, 0.18, { type: "triangle", gain: 0.2 }); },
  nav: (s) => tone(s, 1500, 0, 0.035, { gain: 0.08 }),
  // Golpe a la bolsa de boxeo: cuerpo grave, cuero y el chasquido del guante; cada golpe la deja más floja.
  hit: (s, step) => {
    const f = Math.max(70, 124 - step * 6);
    tone(s, f, 0, 0.24, { gain: 0.62, slideTo: f * 0.42 });
    noise(s, 0, 0.13, { gain: 0.3, from: 650, to: 140, kind: "lowpass", q: 0.7 });
    noise(s, 0, 0.022, { gain: 0.12 + Math.min(step, 5) * 0.012, from: 2200, kind: "highpass", q: 0.7 });
  },
  // El regalo se abre: soplido que sube y un brillo
  open: (s) => {
    noise(s, 0, 0.45, { gain: 0.09, from: 400, to: 4200 });
    [784, 988, 1175, 1568].forEach((f, i) => tone(s, f, 0.12 + i * 0.07, 0.45, { gain: 0.11 }));
  },
  // Shaker Rush: "bloop" que sube un semitono por cada paso del combo (hasta una octava)
  catch: (s, step) => {
    const f = 620 * 2 ** (Math.min(step, 12) / 12);
    tone(s, f, 0, 0.1, { type: "triangle", gain: 0.26, slideTo: f * 1.5 });
    tone(s, f * 2, 0.04, 0.08, { gain: 0.08 });
  },
  // Rayo ×2 o scoop dorado: soplido eléctrico y arpegio
  powerup: (s) => {
    noise(s, 0, 0.3, { gain: 0.08, from: 700, to: 5200 });
    [660, 880, 1320, 1760].forEach((f, i) => tone(s, f, i * 0.05, 0.22, { type: "triangle", gain: 0.16 }));
  },
  // Chatarra: golpe grave con zumbido
  junk: (s) => { tone(s, 190, 0, 0.2, { type: "triangle", gain: 0.24, slideTo: 85 }); noise(s, 0, 0.12, { gain: 0.22, from: 700, to: 220 }); },
  // Fin de la partida: tres notas que bajan y cierran
  gameover: (s) => {
    [784, 659, 523].forEach((f, i) => tone(s, f, i * 0.12, 0.28, { type: "triangle", gain: 0.16 }));
    tone(s, 392, 0.36, 0.6, { gain: 0.16 });
  },
};
