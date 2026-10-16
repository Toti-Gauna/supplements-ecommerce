import type { Goal, SportId } from "../types";

/**
 * Deportes (L4): "Entrená por objetivo", el armador y el quiz también arman por deporte. Cada deporte se traduce en los
 * objetivos que pide (en orden de importancia), el equipamiento que suele usar y el pack de la tienda que más se le
 * parece. Textos de MUESTRA: orientan, no reemplazan a un profesional.
 */
export interface SportInfo {
  id: SportId;
  name: string;
  /** Una línea para la tarjeta. */
  pitch: string;
  /** Color del deporte (como el de los objetivos). */
  hue: string;
  goals: Goal[];
  /** Equipamiento sugerido (slugs del catálogo), el primero con stock va al programa del quiz. */
  gear: string[];
  /** Pack de la tienda para este deporte, si hay uno. */
  packId?: string;
}

export const sports: SportInfo[] = [
  { id: "futbol", name: "Fútbol", pitch: "Piernas para los 90 minutos y recuperación para el domingo.", hue: "#2ee6a0", goals: ["resistencia", "recuperacion"], gear: ["botella-1l", "bandas-elasticas"], packId: "futbol" },
  { id: "tenis", name: "Tenis", pitch: "Sales para los sets largos y energía para el tercero.", hue: "#d7ff3a", goals: ["resistencia", "energia"], gear: ["munequeras-abrojo", "botella-1l"], packId: "padel-tenis" },
  { id: "padel", name: "Pádel", pitch: "Explosión en la red y hombros que aguantan el torneo.", hue: "#3ad0ff", goals: ["energia", "recuperacion"], gear: ["munequeras-abrojo", "botella-1l"], packId: "padel-tenis" },
  { id: "running", name: "Running", pitch: "Hidratación y geles para sumar kilómetros.", hue: "#2f8cff", goals: ["resistencia", "recuperacion"], gear: ["botella-1l"], packId: "running" },
  { id: "ciclismo", name: "Ciclismo", pitch: "Carbohidratos y sales para las salidas largas.", hue: "#ffb02e", goals: ["resistencia", "energia"], gear: ["botella-1l"], packId: "running" },
  { id: "natacion", name: "Natación", pitch: "Hombros fuertes y recuperación entre series.", hue: "#2ec5e6", goals: ["resistencia", "recuperacion"], gear: ["bolso-40l"] },
  { id: "boxeo", name: "Boxeo", pitch: "Rounds con aire y manos protegidas.", hue: "#ff4d4d", goals: ["resistencia", "fuerza"], gear: ["vendas-boxeo", "guantes-boxeo"], packId: "boxeo" },
  { id: "crossfit", name: "CrossFit", pitch: "Fuerza y motor para el WOD de cada día.", hue: "#ff7a1a", goals: ["fuerza", "resistencia"], gear: ["munequeras-abrojo", "soga-rulemanes"], packId: "fuerza" },
  { id: "basquet", name: "Básquet", pitch: "Saltos, piques y rodillas que llegan al último cuarto.", hue: "#ff8f3a", goals: ["energia", "recuperacion"], gear: ["rodilleras-neoprene", "botella-1l"] },
  { id: "rugby", name: "Rugby", pitch: "Masa para el contacto y fuerza para el scrum.", hue: "#c8ff2e", goals: ["masa-muscular", "fuerza"], gear: ["bolso-40l"], packId: "hipertrofia" },
  { id: "hockey", name: "Hockey", pitch: "Piques cortos durante todo el partido.", hue: "#ff5fa2", goals: ["resistencia", "energia"], gear: ["botella-1l"] },
  { id: "voley", name: "Vóley", pitch: "Saltos explosivos y recuperación entre partidos.", hue: "#ffd23f", goals: ["energia", "recuperacion"], gear: ["rodilleras-neoprene"] },
];

export const sportById = (id: SportId) => sports.find((s) => s.id === id);
export const isSportId = (x: unknown): x is SportId => sports.some((s) => s.id === x);
