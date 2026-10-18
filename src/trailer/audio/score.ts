/**
 * Partitura del trailer (pura, con tests): el plan musical por tramos se convierte en notas con tiempo en segundos.
 * Firma sonora de "Tu tienda" (docs/trailer/biblia/musica.md): 128 BPM, La menor (Am–F–C–G) en los drops y Do mayor
 * (C–G–Am–F) en la parte tranquila del cierre, con el mismo estribillo de 4 compases. Todo cae en la grilla de corcheas.
 */
export type Voice = "kick" | "clap" | "hat" | "sub" | "bass" | "pluck" | "bell" | "pad" | "keys" | "riser" | "impact" | "boom" | "shimmer" | "whoosh" | "tick" | "click";
export interface Note { t: number; voice: Voice; midi: number; dur: number; vel: number }
export type Style = "tension" | "drop" | "calm" | "final" | "silence";
/** Tramo musical en tiempos (negras) desde el inicio del trailer. */
export interface MusicPart { from: number; to: number; style: Style }
export interface MusicPlan { bpm: number; parts: MusicPart[] }

/** El estribillo: 4 compases de corcheas (32 pasos, null = silencio). Los compases 1 y 3 arrancan igual (se recuerda);
 * el 2 pregunta y el 4 responde y vuelve a La. Pentatónica: entra igual en La menor y en Do mayor. */
export const HOOK: (number | null)[] = [
  76, null, 76, 79, 81, null, 79, 76, //  E E G A · G E
  84, null, 81, null, 79, null, 76, null, // C · A · G · E ·
  76, null, 76, 79, 81, null, 84, 86, //  E E G A · C D
  86, null, 83, null, 79, null, 81, null, // D · B · G · A ·
];
/** Acordes por compás (graves en la 3.ª octava). */
export const MINOR = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]]; // Am F C G
export const MAJOR = [[48, 52, 55], [55, 59, 62], [57, 60, 64], [53, 57, 60]]; // C G Am F

export function buildScore(plan: MusicPlan): Note[] {
  const beat = 60 / plan.bpm;
  const notes: Note[] = [];
  const add = (beats: number, voice: Voice, midi: number, durBeats: number, vel: number) =>
    notes.push({ t: round(beats * beat), voice, midi, dur: round(durBeats * beat), vel });
  for (const part of plan.parts) {
    const bars = Math.floor((part.to - part.from) / 4);
    for (let b = 0; b < bars; b++) STYLES[part.style](part.from + b * 4, b, add);
    if (part.style === "tension") add(part.to - 6, "riser", 69, 5.5, 0.8); // sube y corta seco medio tiempo antes del golpe
    if (part.style === "drop" || part.style === "final") add(part.from, "impact", 33, 4, 1);
  }
  return notes.sort((a, z) => a.t - z.t);
}

type Add = (beats: number, voice: Voice, midi: number, durBeats: number, vel: number) => void;
const STYLES: Record<Style, (at: number, bar: number, add: Add) => void> = {
  silence: () => {},
  tension(at, bar, add) {
    add(at, "pad", 45, 4, 0.5); add(at, "pad", 52, 4, 0.35); // La + Mi graves: dron
    add(at, "sub", 33, 0.5, 0.7); add(at + 0.5, "sub", 33, 0.4, 0.45); // latido
    if (bar % 2 === 1) add(at + 2, "bell", 88, 2, 0.18);
  },
  drop(at, bar, add) {
    const chord = MINOR[bar % 4]!;
    for (let i = 0; i < 4; i++) {
      add(at + i, "kick", 36, 0.5, 1);
      add(at + i + 0.5, "hat", 92, 0.12, 0.42);
      add(at + i + 0.5, "bass", chord[0]! - 12, 0.45, 0.8);
    }
    add(at + 1, "clap", 60, 0.3, 0.8); add(at + 3, "clap", 60, 0.3, 0.8);
    chord.forEach((m) => add(at, "pad", m, 4, 0.32));
    hook(at, bar, 0.5, add, 0.85);
  },
  calm(at, bar, add) {
    // Medio tiempo y mayor: el mismo estribillo, al doble de largo, en campanas suaves sobre un pad cálido y teclas.
    const chord = MAJOR[Math.floor(bar / 2) % 4]!;
    if (bar % 2 === 0) chord.forEach((m) => add(at, "pad", m, 8, 0.3));
    add(at, "sub", chord[0]! - 12, 3.5, 0.4);
    [0, 1, 2, 3].forEach((i) => add(at + i, "keys", chord[i % 3]! + 12, 1.5, 0.22 + (i === 0 ? 0.08 : 0)));
    hook(at, bar, 1, add, 0.32, "bell");
  },
  final(at, bar, add) {
    if (bar === 0) { [45, 52, 57, 59, 64].forEach((m) => add(at, "pad", m, 8, 0.4)); add(at, "boom", 33, 4, 1); } // Am(add9) que se apaga
    if (bar === 1) [81, 76, 72, 69].forEach((m, i) => add(at + i * 0.5, "bell", m, 2, 0.3 - i * 0.04));
  },
};

/** Coloca el compás `bar` del estribillo; `step` = tiempos por paso (0,5 = corcheas, 1 = negras en la parte lenta). */
function hook(at: number, bar: number, step: number, add: Add, vel: number, voice: Voice = "pluck") {
  const perBar = Math.round(4 / step); // pasos del estribillo que entran en un compás
  const start = (bar * perBar) % HOOK.length;
  for (let i = 0; i < perBar; i++) {
    const m = HOOK[(start + i) % HOOK.length];
    if (m == null) continue;
    add(at + i * step, voice, m, step * 1.6, vel);
    if (voice === "pluck") add(at + i * step, "bell", m + 12, step * 2, vel * 0.22); // brillo arriba del pluck
  }
}

const round = (n: number) => Math.round(n * 10000) / 10000;
