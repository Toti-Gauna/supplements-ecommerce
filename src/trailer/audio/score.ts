/**
 * Partitura del trailer (pura, con tests): el plan musical por tramos se convierte en notas con tiempo en segundos.
 * Firma sonora de "Tu tienda" (docs/trailer/biblia/musica.md): 128 BPM, La menor (Am–F–C–G) en los drops y Do mayor
 * (C–G–Am–F) en la parte tranquila del cierre, con el mismo estribillo de 4 compases. Todo cae en la grilla de corcheas.
 */
export type Voice = "kick" | "clap" | "hat" | "sub" | "bass" | "pluck" | "bell" | "pad" | "keys" | "drone" | "stab" | "tone" | "riser" | "impact" | "boom" | "shimmer" | "whoosh" | "tick" | "click" | "gate";
export interface Note { t: number; voice: Voice; midi: number; dur: number; vel: number }
export type Style = "tension" | "drop" | "calm" | "final" | "silence" | "clon" | "plano" | "stutter" | "half";
/** Tramo musical en tiempos (negras) desde el inicio del trailer. */
export interface MusicPart { from: number; to: number; style: Style }
/** Corte de voces: en [from, to) las voces nombradas se callan (el resto del tramo sigue). */
export interface MusicBreak { from: number; to: number; voices: Voice[] }
/** `silences`: medio tiempo de silencio real (cierra el máster, también las colas); `breaks`: voces que se caen un rato. */
export interface MusicPlan { bpm: number; parts: MusicPart[]; silences?: Array<[number, number]>; breaks?: MusicBreak[] }

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
    const len = part.to - part.from, bars = Math.ceil(len / 4);
    for (let b = 0; b < bars; b++) {
      // El último compás de un tramo que no es múltiplo de 4 se corta donde termina el tramo (no se mete en el siguiente).
      const partial = len % 4 !== 0 && b === bars - 1;
      const put: Add = (at, voice, midi, dur, vel) => { if (!partial || at < part.to - 1e-9) add(at, voice, midi, partial ? Math.min(dur, part.to - at) : dur, vel); };
      STYLES[part.style](part.from + b * 4, b, put, len);
    }
    if (part.style === "tension") { const from = Math.max(part.from + 0.5, part.to - 6); add(from, "riser", 69, part.to - 0.5 - from, 0.8); } // sube y corta seco medio tiempo antes del golpe
    if (part.style === "drop" || part.style === "final") add(part.from, "impact", 33, 4, 1);
    if (part.style === "half") add(part.from, "boom", 33, 4, 0.9);
  }
  for (const [from, to] of plan.silences ?? []) add(from, "gate", 0, to - from, 1);
  const inside = (n: Note, from: number, to: number) => n.t >= from * beat - 1e-4 && n.t < to * beat - 1e-4; // las notas se redondean a 0,1 ms
  const cut = (n: Note) => (plan.breaks ?? []).some((k) => k.voices.includes(n.voice) && inside(n, k.from, k.to));
  const silent = (n: Note) => n.voice !== "gate" && (plan.silences ?? []).some(([from, to]) => inside(n, from, to)); // nada empieza en un silencio
  return notes.filter((n) => !cut(n) && !silent(n)).sort((a, z) => a.t - z.t);
}

type Add = (beats: number, voice: Voice, midi: number, durBeats: number, vel: number) => void;
const HALF = [MINOR[0]!, MINOR[1]!, MINOR[3]!]; // Am – F – G (la parte de la cuenta queda suspendida en Sol)
const HALF_HOOK = [0, 1, 3]; // compases del estribillo que canta cada uno
const STYLES: Record<Style, (at: number, bar: number, add: Add, len: number) => void> = {
  silence: () => {},
  tension(at, bar, add) {
    add(at, "pad", 45, 4, 0.5); add(at, "pad", 52, 4, 0.35); // La + Mi graves: dron
    add(at, "sub", 33, 0.5, 0.7); add(at + 0.5, "sub", 33, 0.4, 0.45); // latido
    if (bar % 2 === 1) add(at + 2, "bell", 88, 2, 0.18);
  },
  drop(at, bar, add) {
    const chord = MINOR[bar % 4]!;
    groove(at, chord, add, 0.8);
    chord.forEach((m) => add(at, "pad", m, 4, 0.32));
    hook(at, bar, 0.5, add, 0.85);
  },
  // Pieza T1 · el problema: todas las tiendas suenan igual (dron cerrado, sin pulso ni melodía).
  clon(at, bar, add, len) {
    if (bar === 0) { add(at, "drone", 33, len, 0.22); add(at, "drone", 40, len, 0.15); }
  },
  plano: (at, _bar, add) => add(at, "tone", 81, 1.5, 1), // la línea plana: un seno solo, que corta en 27,5
  // Compuerta en semicorcheas: el pad se vuelve picado y el bajo baja al 80 %.
  stutter(at, bar, add) {
    const chord = MINOR[bar % 4]!;
    groove(at, chord, add, 0.64);
    for (let s = 0; s < 16; s++) chord.forEach((m) => add(at + s * 0.25, "stab", m, 0.2, 0.26));
    hook(at, bar, 0.5, add, 0.85);
  },
  // Medio tiempo: bombo en 1 y 3, palmas en 3 y el estribillo en campana.
  half(at, bar, add) {
    const chord = HALF[bar % 3]!;
    add(at, "kick", 36, 0.5, 1); add(at + 2, "kick", 36, 0.5, 0.95); add(at + 2, "clap", 60, 0.3, 0.7);
    add(at, "sub", chord[0]! - 12, 3.5, 0.6);
    chord.forEach((m) => add(at, "pad", m, 4, 0.3));
    [0.5, 1.5, 2.5, 3.5].forEach((o) => add(at + o, "hat", 92, 0.12, 0.25));
    hook(at, HALF_HOOK[bar % 3]!, 0.5, add, 0.55, "bell");
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

/** Bombo en cada tiempo, hat y bajo a contratiempo y palmas en 2 y 4 (`bassVel` = fuerza del bajo). */
function groove(at: number, chord: number[], add: Add, bassVel: number) {
  for (let i = 0; i < 4; i++) {
    add(at + i, "kick", 36, 0.5, 1);
    add(at + i + 0.5, "hat", 92, 0.12, 0.42);
    add(at + i + 0.5, "bass", chord[0]! - 12, 0.45, bassVel);
  }
  add(at + 1, "clap", 60, 0.3, 0.8); add(at + 3, "clap", 60, 0.3, 0.8);
}

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
