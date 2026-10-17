import type { DecorKind } from "@/components/illustrations/seasonal/Decor";
import type { SeasonId } from "@/demo/types";

/**
 * Lo visual de cada temática (fijo en el código; el panel edita textos, fechas y ofertas).
 * Fondos oscuros o saturados con texto blanco: contraste AA en modo claro y oscuro por igual (tests/unit/palettes).
 */
export interface ThemeSkin {
  /** Fondo del banner y de la cinta. */
  from: string;
  to: string;
  /** Color de acento (cupón, botón) y su texto. */
  accent: string;
  accentInk: string;
  /** Adorno que se apoya sobre el logo (gorro, cuernitos, chip…). */
  topper: DecorKind;
  /** Decoraciones del banner (la primera es la protagonista). */
  decor: [DecorKind, DecorKind, DecorKind, DecorKind, DecorKind];
}

export const SKINS: Record<SeasonId, ThemeSkin> = {
  "dia-de-la-madre": { from: "#5e2440", to: "#a9496d", accent: "#ffd6e7", accentInk: "#4a1830", topper: "flower", decor: ["flower", "pulse-heart", "gift", "battery", "spark"] },
  halloween: { from: "#160d22", to: "#3d2255", accent: "#ff8a1f", accentInk: "#1a1124", topper: "horns", decor: ["muscle-pumpkin", "bat", "horns", "kettlebell", "bat"] },
  "cyber-monday": { from: "#03101a", to: "#0c3a58", accent: "#3ff0e0", accentInk: "#03101a", topper: "chip", decor: ["chip", "battery", "bolt", "tag", "spark"] },
  "black-friday": { from: "#050506", to: "#26282e", accent: "#c8ff2e", accentInk: "#0a0b0d", topper: "tag", decor: ["bag", "tag", "bolt", "plate", "spark"] },
  navidad: { from: "#0e3526", to: "#1f6243", accent: "#f3c84c", accentInk: "#0e3526", topper: "santa-hat", decor: ["plate-tree", "gift", "ornament", "santa-hat", "snowflake"] },
  "ano-nuevo": { from: "#0d1330", to: "#3a2a8f", accent: "#c8ff2e", accentInk: "#0d1330", topper: "party-hat", decor: ["update", "firework", "spark", "party-hat", "firework"] },
  "san-valentin": { from: "#5c1028", to: "#a8274a", accent: "#ffd1dc", accentInk: "#5c1028", topper: "heart", decor: ["pulse-heart", "heart", "dumbbell", "shaker", "heart"] },
  "vuelta-al-gym": { from: "#1b1240", to: "#5a3fe6", accent: "#c8ff2e", accentInk: "#1b1240", topper: "kettlebell", decor: ["kettlebell", "calendar", "sneaker", "stopwatch", "bolt"] },
  "hot-sale": { from: "#5e1508", to: "#b8391a", accent: "#ffd34d", accentInk: "#5e1508", topper: "flame", decor: ["flame", "tag", "bag", "scoop", "spark"] },
  "dia-del-padre": { from: "#13202e", to: "#2e4c6e", accent: "#ffcf5c", accentInk: "#13202e", topper: "medal", decor: ["trophy", "dumbbell", "medal", "shaker", "spark"] },
  "dia-del-amigo": { from: "#06302c", to: "#0f766e", accent: "#e3ff8f", accentInk: "#06302c", topper: "shaker", decor: ["gloves", "shaker", "medal", "dumbbell", "spark"] },
  "operacion-verano": { from: "#053246", to: "#0b6f96", accent: "#ffd34d", accentInk: "#053246", topper: "sun", decor: ["sun", "bottle", "wave", "sunglasses", "spark"] },
  // Días del deporte (R3a).
  "crossfit-open": { from: "#1a0f0a", to: "#5a2a12", accent: "#ff7a1a", accentInk: "#1a0f0a", topper: "kettlebell", decor: ["kettlebell", "stopwatch", "plate", "bolt", "spark"] },
  "dia-actividad-fisica": { from: "#062a1f", to: "#0f6b4a", accent: "#c8ff2e", accentInk: "#062a1f", topper: "sneaker", decor: ["sneaker", "pulse-heart", "bottle", "stopwatch", "spark"] },
  "dia-del-futbolista": { from: "#0a2a14", to: "#16703a", accent: "#ffffff", accentInk: "#0a2a14", topper: "medal", decor: ["trophy", "sneaker", "medal", "bottle", "spark"] },
  "dia-del-running": { from: "#0b1d3a", to: "#1f4fa8", accent: "#ffd34d", accentInk: "#0b1d3a", topper: "sneaker", decor: ["sneaker", "stopwatch", "bottle", "pulse-heart", "spark"] },
  "dia-del-boxeador": { from: "#1a0608", to: "#6e1218", accent: "#ffd34d", accentInk: "#1a0608", topper: "gloves", decor: ["gloves", "medal", "stopwatch", "bolt", "spark"] },
};

export function skinOf(id: SeasonId): ThemeSkin {
  return SKINS[id];
}
