import type { Voice } from "./score";

type Add = (beats: number, voice: Voice, midi: number, durBeats: number, vel: number) => void;

/**
 * El gancho publicitario (4 compases de corcheas, Do mayor pentatónica): "sol-sol-la-do · do / re-do-la-do" y su respuesta que sube al mi
 * y vuelve a casa. Los compases 1 y 3 arrancan igual para que se recuerde a la segunda vez.
 */
export const AD_HOOK: (number | null)[] = [
  67, null, 67, 69, 72, null, 72, null, // G G A C · C
  74, null, 72, 69, 72, null, null, null, // D C A C
  67, null, 67, 69, 72, null, 76, null, // G G A C · E
  76, null, 74, 72, 72, null, null, null, // E D C C
];
/** Do – Sol – Lam – Fa (I–V–vi–IV), el giro pop que entra en cualquier cabeza. */
export const AD_CHORDS = [[48, 52, 55], [55, 59, 62], [57, 60, 64], [53, 57, 60]];

function adHook(at: number, bar: number, add: Add, vel: number) {
  const start = (bar * 8) % AD_HOOK.length;
  for (let i = 0; i < 8; i++) {
    const m = AD_HOOK[start + i];
    if (m == null) continue;
    add(at + i * 0.5, "mallet", m, 0.8, vel);
    add(at + i * 0.5, "bell", m + 12, 0.6, vel * 0.16); // brillo arriba de la marimba
  }
}
/** Rasguido de ukelele: las tres notas del acorde una octava arriba, apenas desfasadas. */
const strum = (at: number, chord: number[], add: Add, vel: number) => chord.forEach((m, i) => add(at + i * 0.03, "uke", m + 12, 0.4, vel));

export const AD_STYLES: Record<"ad-intro" | "ad-verse" | "ad-chorus" | "ad-break" | "ad-end", (at: number, bar: number, add: Add, len: number) => void> = {
  /** Presentación: marimba sola con el gancho sobre un colchón suave. */
  "ad-intro"(at, bar, add) {
    AD_CHORDS[bar % 4]!.forEach((m) => add(at, "pad", m + 12, 4, 0.16));
    adHook(at, bar, add, 0.5);
  },
  /** Estrofa liviana: bombo en 1 y 3, chasquidos en 2 y 4, ukelele a contratiempo y el gancho más bajo. */
  "ad-verse"(at, bar, add) {
    const ch = AD_CHORDS[bar % 4]!;
    add(at, "kick", 36, 0.5, 0.75); add(at + 2, "kick", 36, 0.5, 0.7);
    add(at + 1, "snap", 72, 0.1, 0.6); add(at + 3, "snap", 72, 0.1, 0.6);
    [0.5, 1.5, 2.5, 3.5].forEach((o) => strum(at + o, ch, add, 0.4));
    add(at, "ebass", ch[0]! - 12, 1.4, 0.7); add(at + 2.5, "ebass", ch[0]! - 5, 1, 0.55);
    adHook(at, bar, add, 0.42);
  },
  /** Estribillo: bombo pop (1, 1½ y 3), palmas con chasquido en 2 y 4, shaker en corcheas, ukelele, bajo que rebota y el gancho arriba. */
  "ad-chorus"(at, bar, add) {
    const ch = AD_CHORDS[bar % 4]!;
    [0, 1.5, 2].forEach((o) => add(at + o, "kick", 36, 0.5, 0.95));
    [1, 3].forEach((o) => { add(at + o, "clap", 60, 0.3, 0.75); add(at + o, "snap", 72, 0.1, 0.5); });
    for (let i = 0; i < 8; i++) add(at + i * 0.5, "hat", 92, 0.1, i % 2 ? 0.34 : 0.2);
    [0.5, 1.5, 2.5, 3.5].forEach((o) => strum(at + o, ch, add, 0.5));
    [[0, 0], [1.5, 0], [2, 7], [3, 12]].forEach(([o, iv]) => add(at + o!, "ebass", ch[0]! - 12 + iv!, 0.9, 0.8));
    ch.forEach((m) => add(at, "pad", m + 12, 4, 0.14));
    adHook(at, bar, add, 0.85);
  },
  /** Corte para las pantallas de texto: palmas que marcan cada tiempo, bombo en 1 y 3 y el gancho; sin acordes. */
  "ad-break"(at, bar, add) {
    [0, 2].forEach((o) => add(at + o, "kick", 36, 0.5, 0.9));
    [0, 1, 2, 3].forEach((o) => add(at + o, "clap", 60, 0.3, o % 2 ? 0.8 : 0.55));
    add(at, "ebass", AD_CHORDS[bar % 4]![0]! - 12, 3.5, 0.55);
    adHook(at, bar, add, 0.7);
  },
  /** Cierre: Do mayor abierto que se apaga y la cola del gancho en marimba (termina en casa). */
  "ad-end"(at, bar, add) {
    if (bar !== 0) return;
    [48, 55, 60, 64, 67].forEach((m) => add(at, "pad", m, 8, 0.3));
    strum(at, [60, 64, 67], add, 0.55);
    add(at, "ebass", 36, 4, 0.6);
    [67, 69, 72, 76, 72].forEach((m, i) => add(at + 1 + i * 0.5, "mallet", m, 1.2, 0.6 - i * 0.04));
  },
};
