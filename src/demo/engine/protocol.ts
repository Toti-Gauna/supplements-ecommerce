import type { TrainingTime } from "../fixtures/stack-builder";
import type { Product, UsageMoment } from "../types";

/**
 * "El protocolo del día" de "Tu programa" (R2c): cuándo tomar cada producto (mañana, pre-entreno, post o noche),
 * sacado del "Cómo tomarlo" de cada producto (`usage`, que edita el panel) y del horario en que entrena. Puro y
 * ORIENTATIVO: no es una indicación médica.
 */
export type ProtocolMoment = "manana" | "pre" | "post" | "noche";

export const PROTOCOL_MOMENTS: ProtocolMoment[] = ["manana", "pre", "post", "noche"];

export const PROTOCOL_LABEL: Record<ProtocolMoment, string> = { manana: "Mañana", pre: "Pre-entreno", post: "Post-entreno", noche: "Noche" };

export interface ProtocolItem {
  slug: string;
  name: string;
  /** "1 scoop (30 g)". */
  dose?: string;
  /** El "Cómo tomarlo" del producto. */
  how: string;
  /** Se toma solo los días que entrena (pre-entreno, intra). */
  trainingOnly: boolean;
  /** Va durante el entrenamiento (geles, BCAA, electrolitos), dentro del bloque del pre. */
  during: boolean;
}

export interface ProtocolBlock {
  moment: ProtocolMoment;
  label: string;
  /** Hora orientativa, "HH:MM", según el horario de entrenamiento. */
  clock: string;
  /** Cuándo, en palabras ("30 minutos antes de entrenar"). */
  when: string;
  items: ProtocolItem[];
}

/** Hora de entrenamiento según la respuesta del quiz (en minutos desde las 0 h). */
const TRAINING_AT: Record<TrainingTime, number> = { manana: 7 * 60, tarde: 18 * 60, noche: 20 * 60 + 30 };

/** Sin datos de uso: por la categoría (las de equipamiento no están: no se toman). */
const BY_CATEGORY: Record<string, UsageMoment> = {
  proteinas: "post", ganadores: "post", creatinas: "manana", "pre-entrenos": "pre", aminoacidos: "intra",
  hidratacion: "intra", salud: "manana", definicion: "manana", snacks: "comida",
};

const toMoment = (m: UsageMoment): ProtocolMoment => (m === "intra" ? "pre" : m === "comida" ? "manana" : m);

/** El momento principal de un producto: el primero de su "Cómo tomarlo" (o el de su categoría). */
export function productMoment(p: Product): { moment: ProtocolMoment; during: boolean; trainingOnly: boolean } {
  const first = p.usage?.moments[0] ?? BY_CATEGORY[p.categorySlug] ?? "manana";
  return { moment: toMoment(first), during: first === "intra", trainingOnly: first === "pre" || first === "intra" };
}

const clockOf = (minutes: number) => `${String(Math.floor(minutes / 60) % 24).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;

/** Hora y "cuándo" de cada bloque: el pre media hora antes de entrenar, el post al terminar (~1 h 15 después). */
function timing(moment: ProtocolMoment, time: TrainingTime): { at: number; when: string } {
  const train = TRAINING_AT[time];
  if (moment === "pre") return { at: train - 30, when: "30 minutos antes de entrenar" };
  if (moment === "post") return { at: train + 75, when: "Al terminar de entrenar" };
  if (moment === "noche") return { at: 23 * 60, when: "Antes de dormir" };
  // Quien entrena temprano desayuna después.
  return time === "manana" ? { at: train + 105, when: "Con el desayuno, después de entrenar" } : { at: 8 * 60, when: "Con el desayuno" };
}

/**
 * Los bloques del día, en orden de reloj, con los productos de cada uno (sin equipamiento ni repetidos). Sin horario
 * de entrenamiento se toma la tarde, el más común.
 */
export function dayProtocol(products: Product[], time: TrainingTime = "tarde"): ProtocolBlock[] {
  const blocks = new Map<ProtocolMoment, ProtocolItem[]>();
  const seen = new Set<string>();
  for (const p of products) {
    if (seen.has(p.slug) || (!p.usage && !BY_CATEGORY[p.categorySlug])) continue;
    seen.add(p.slug);
    const { moment, during, trainingOnly } = productMoment(p);
    const item: ProtocolItem = { slug: p.slug, name: p.name, dose: p.usage?.dose, how: p.usage?.text ?? "", trainingOnly, during };
    blocks.set(moment, [...(blocks.get(moment) ?? []), item]);
  }
  return PROTOCOL_MOMENTS.filter((m) => blocks.has(m))
    .map((moment) => ({ moment, timing: timing(moment, time), items: blocks.get(moment)! }))
    .sort((a, b) => a.timing.at - b.timing.at)
    .map(({ moment, timing: t, items }) => ({ moment, label: PROTOCOL_LABEL[moment], clock: clockOf(t.at), when: t.when, items }));
}
