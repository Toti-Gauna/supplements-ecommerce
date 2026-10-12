/**
 * Sonidos de la tienda sintetizados con WebAudio (pedido de Ignacio): sin archivos, nada se descarga. Las voces están en
 * `sound-synth.ts`. El audio se habilita con el primer toque (los navegadores lo exigen) y el silencio se recuerda en
 * este navegador. En el panel no suena nada.
 */
import { createSynth, VOICES, type SoundName, type Synth } from "./sound-synth";

export type { SoundName };

const KEY = "volta-sound";
let synth: Synth | null = null;
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

/**
 * Crea o reanuda el contexto de audio; se llama en cada toque o tecla de la página (es barato si ya suena).
 * iOS deja el contexto "suspended" si se creó fuera del gesto e "interrupted" tras una llamada o el segundo plano:
 * se reanuda con cualquier estado que no sea "running", y un buffer mudo dentro del gesto termina de destrabarlo.
 */
export function unlockAudio(): void {
  if (typeof window === "undefined") return;
  if (!synth) {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    try { synth = createSynth(new AC()); } catch { return; }
  }
  const { ctx } = synth;
  if (ctx.state === "running" || ctx.state === "closed") return;
  void ctx.resume().catch(() => { /* sin gesto válido todavía: el próximo toque lo intenta */ });
  try {
    const silent = ctx.createBufferSource();
    silent.buffer = ctx.createBuffer(1, 1, ctx.sampleRate);
    silent.connect(ctx.destination);
    silent.start(0);
  } catch { /* nada que destrabar */ }
}

/** Registro para las pruebas automáticas (qué sonó y en qué orden). No afecta el audio. */
declare global { interface Window { __voltaSounds?: SoundName[] } }

export function playSound(name: SoundName, step = 0): void {
  if (typeof window === "undefined" || window.location.pathname.includes("/admin-demo") || isMuted()) return;
  // Registro para los tests: solo si la página lo pidió (no crece en uso normal).
  window.__voltaSounds?.push(name);
  if (!synth) return;
  const { ctx } = synth;
  if (ctx.state === "closed") return;
  // Recién destrabado (primer toque) el contexto puede seguir "suspended" unos milisegundos: se agenda igual y suena
  // al reanudarse, con su tiempo intacto (el reloj del contexto está quieto mientras tanto).
  if (ctx.state !== "running") void ctx.resume().catch(() => { /* sin gesto válido */ });
  try { VOICES[name](synth, step); } catch { /* audio no disponible: la tienda sigue igual */ }
}
