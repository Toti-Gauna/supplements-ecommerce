import type { ArtKey, Goal } from "../types";

/** Objetivos de entrenamiento: círculos del inicio, filtros y armado de stacks. Textos de MUESTRA. */
export interface GoalInfo {
  id: Goal;
  name: string;
  /** Una línea para la tarjeta. */
  pitch: string;
  art: ArtKey;
  /** Color del objetivo (anillo del círculo). */
  hue: string;
  /** Producto que representa al objetivo en el inicio (se elige en el panel; sin esto, el más vendido). */
  productSlug?: string;
}

export const goals: GoalInfo[] = [
  { id: "masa-muscular", name: "Masa muscular", pitch: "Proteína, calorías y creatina para crecer.", art: "tub", hue: "#c8ff2e", productSlug: "mass-gainer" },
  { id: "fuerza", name: "Fuerza", pitch: "Creatina y pre para mover más kilos.", art: "jar", hue: "#ff7a1a", productSlug: "creatina-monohidrato" },
  { id: "energia", name: "Energía", pitch: "Entrená con foco aunque vengas del laburo.", art: "jar", hue: "#ffd23f", productSlug: "overvolt-pre" },
  { id: "recuperacion", name: "Recuperación", pitch: "Volvé al gym mañana como nuevo.", art: "pouch", hue: "#2ee6d6", productSlug: "night-casein" },
  { id: "definicion", name: "Definición", pitch: "Proteína magra y aliados para el cardio.", art: "bottle", hue: "#ff4d6d", productSlug: "isolate-zero" },
  { id: "resistencia", name: "Resistencia", pitch: "Hidratación y geles para ir más lejos.", art: "sachet", hue: "#2f8cff", productSlug: "electrolitos" },
  { id: "salud", name: "Salud", pitch: "Vitaminas, omega 3 y magnesio de base.", art: "caps", hue: "#8b72ff", productSlug: "omega-3" },
];

export const goalById = (id: Goal) => goals.find((g) => g.id === id);
