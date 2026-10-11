import type { GiftOccasion } from "@/demo/types";
import { SKINS } from "../themes/skins";

/** Colores del escenario según la ocasión (los de la temática; Volta: oliva y bronce). */
export function occasionColors(occasion: GiftOccasion): { from: string; to: string; accent: string; ink: string } {
  if (occasion === "volta") return { from: "#1c2016", to: "#4a5a32", accent: "#e3ff8f", ink: "#1c2016" };
  const s = SKINS[occasion];
  return { from: s.from, to: s.to, accent: s.accent, ink: s.accentInk };
}
