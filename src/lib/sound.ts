/**
 * Sonidos de la tienda sintetizados con WebAudio (pedido de Ignacio, fuera de la especificación): sin archivos,
 * nada se descarga. El audio se habilita con el primer toque (los navegadores lo exigen) y el silencio se recuerda
 * en este navegador. En el panel no suena nada.
 */

export type SoundName = "add" | "favorite" | "unfavorite" | "coupon" | "tick" | "spin" | "win" | "purchase" | "error" | "nav" | "hit" | "open";

const KEY = "volta-sound";
let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let muted: boolean | null = null;
const listeners = new Set<() => void>();

export function isMuted(): boolean {
  if (muted === null) {
    try { muted = window.localStorage.getItem(KEY) === "off"; } catch { muted = false; }
  }
  return muted;
}

export function setMuted(next: boolean): void {
  muted = next;
  try { window.localStorage.setItem(KEY, next ? "off" : "on"); } catch { /* modo privado: dura la sesión */ }
  listeners.forEach((l) => l());
  if (!next) playSound("nav");
}

export function subscribeMuted(cb: () => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

/** Crea o reanuda el contexto de audio; se llama en el primer toque o tecla de la página. */
export function unlockAudio(): void {
  if (typeof window === "undefined") return;
  // iOS deja el contexto "interrupted" (llamada, segundo plano): se reanuda con cualquier estado que no sea "running".
  if (ctx) { if (ctx.state !== "running" && ctx.state !== "closed") void ctx.resume(); return; }
  const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return;
  ctx = new AC();
  master = ctx.createGain();
  master.gain.value = 0.32;
  master.connect(ctx.destination);
}

interface ToneOpts { type?: OscillatorType; gain?: number; attack?: number; slideTo?: number }

function tone(freq: number, at: number, dur: number, { type = "sine", gain = 0.5, attack = 0.006, slideTo }: ToneOpts = {}): void {
  if (!ctx || !master) return;
  const osc = ctx.createOscillator();
  const env = ctx.createGain();
  const t = ctx.currentTime + at;
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t + dur * 0.8);
  env.gain.setValueAtTime(0.0001, t);
  env.gain.exponentialRampToValueAtTime(gain, t + attack);
  env.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(env).connect(master);
  osc.start(t);
  osc.stop(t + dur + 0.02);
}

function noise(at: number, dur: number, { gain = 0.3, from = 2500, to }: { gain?: number; from?: number; to?: number } = {}): void {
  if (!ctx || !master) return;
  const len = Math.max(1, Math.floor(ctx.sampleRate * dur));
  const buffer = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const src = ctx.createBufferSource();
  const filter = ctx.createBiquadFilter();
  const env = ctx.createGain();
  const t = ctx.currentTime + at;
  src.buffer = buffer;
  filter.type = "bandpass";
  filter.Q.value = 1.4;
  filter.frequency.setValueAtTime(from, t);
  if (to) filter.frequency.exponentialRampToValueAtTime(to, t + dur);
  env.gain.setValueAtTime(gain, t);
  env.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(filter).connect(env).connect(master);
  src.start(t);
}

const SOUNDS: Record<SoundName, () => void> = {
  // "Pop" con brillo: algo entró al carrito
  add: () => { tone(520, 0, 0.12, { type: "sine", gain: 0.55, slideTo: 980 }); tone(1320, 0.07, 0.18, { type: "triangle", gain: 0.22 }); },
  favorite: () => { tone(784, 0, 0.12, { gain: 0.35 }); tone(1175, 0.08, 0.2, { gain: 0.3 }); },
  unfavorite: () => { tone(784, 0, 0.1, { gain: 0.3 }); tone(523, 0.07, 0.16, { gain: 0.25 }); },
  // Destellos ascendentes: cupón aplicado
  coupon: () => [880, 1109, 1319, 1760].forEach((f, i) => tone(f, i * 0.055, 0.22, { type: "triangle", gain: 0.24 })),
  // Clic de cada casilla de la ruleta
  tick: () => noise(0, 0.018, { gain: 0.35, from: 3200 }),
  spin: () => noise(0, 0.5, { gain: 0.16, from: 500, to: 2600 }),
  win: () => {
    [523, 659, 784].forEach((f) => tone(f, 0, 0.5, { type: "triangle", gain: 0.2 }));
    tone(1047, 0.16, 0.7, { type: "triangle", gain: 0.28 });
    [1568, 2093, 2637].forEach((f, i) => tone(f, 0.3 + i * 0.06, 0.3, { gain: 0.12 }));
  },
  // Acorde cálido de cierre: compra confirmada
  purchase: () => {
    [392, 494, 587].forEach((f) => tone(f, 0, 0.35, { gain: 0.16 }));
    [523, 659, 784, 1047].forEach((f) => tone(f, 0.22, 0.9, { type: "triangle", gain: 0.17 }));
  },
  error: () => { tone(196, 0, 0.1, { type: "square", gain: 0.14 }); tone(165, 0.13, 0.14, { type: "square", gain: 0.14 }); },
  nav: () => tone(1200, 0, 0.04, { gain: 0.12 }),
  // Golpe al regalo: un "pum" grave con algo de cartón
  hit: () => { tone(150, 0, 0.16, { gain: 0.6, slideTo: 70 }); noise(0, 0.07, { gain: 0.32, from: 900, to: 300 }); },
  // El regalo se abre: soplido que sube y campanitas
  open: () => {
    noise(0, 0.45, { gain: 0.12, from: 400, to: 4200 });
    [784, 988, 1175, 1568, 1976].forEach((f, i) => tone(f, 0.12 + i * 0.07, 0.5, { type: "triangle", gain: 0.16 }));
  },
};

/** Registro para las pruebas automáticas (qué sonó y en qué orden). No afecta el audio. */
declare global { interface Window { __voltaSounds?: SoundName[] } }

export function playSound(name: SoundName): void {
  if (typeof window === "undefined" || window.location.pathname.includes("/admin-demo") || isMuted()) return;
  // Registro para los tests: solo si la página lo pidió (no crece en uso normal).
  window.__voltaSounds?.push(name);
  if (!ctx) return;
  if (ctx.state !== "running" && ctx.state !== "closed") void ctx.resume();
  try { SOUNDS[name](); } catch { /* audio no disponible: la tienda sigue igual */ }
}
