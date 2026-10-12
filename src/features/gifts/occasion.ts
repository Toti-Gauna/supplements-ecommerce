import type { GiftOccasion } from "@/demo/types";
import { SKINS } from "../themes/skins";

/** Sin temática: noche de VOLTA que va a plasma profundo, con el voltio de acento. */
const VOLTA = { from: "#0a0c10", to: "#3b2a8f", accent: "#c8ff2e", ink: "#0a0c10" };

/**
 * Colores del escenario según la ocasión: los de la temática, o los de VOLTA. Una ocasión que ya no existe (un regalo
 * guardado con una fecha de Velmar) cae en los de VOLTA en lugar de romper la página.
 */
export function occasionColors(occasion: GiftOccasion): { from: string; to: string; accent: string; ink: string } {
  const s = occasion === "volta" ? undefined : SKINS[occasion];
  return s ? { from: s.from, to: s.to, accent: s.accent, ink: s.accentInk } : VOLTA;
}
