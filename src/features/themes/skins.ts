import type { CastId, PupOutfit, PupPose } from "@/components/illustrations/characters";
import type { DecorKind } from "@/components/illustrations/seasonal/Decor";
import type { SeasonId } from "@/demo/types";

/**
 * Lo visual de cada temática (fijo en el código; el panel edita textos, fechas y ofertas).
 * Fondos oscuros o saturados con texto claro: contraste AA en modo claro y oscuro por igual.
 */
export interface ThemeSkin {
  /** Fondo del banner y de la cinta. */
  from: string;
  to: string;
  /** Color de acento (cupón, botón) y su texto. */
  accent: string;
  accentInk: string;
  /** Sombrero o adorno que se apoya sobre el logo. */
  topper: DecorKind;
  /** Decoraciones del banner (la primera es la protagonista). */
  decor: DecorKind[];
  /** Personajes de Volta que protagonizan el banner en lugar de la primera decoración. */
  cast?: { who: CastId; pose: PupPose; outfit?: PupOutfit; pup?: boolean; flip?: boolean }[];
}

export const SKINS: Record<SeasonId, ThemeSkin> = {
  "dia-de-la-madre": { from: "#5e2440", to: "#a9496d", accent: "#ffe0a8", accentInk: "#4a1830", topper: "tulip", decor: ["tulip", "heart", "gift", "love-letter", "star"] },
  halloween: { from: "#1a1124", to: "#3d2255", accent: "#ff8a1f", accentInk: "#1a1124", topper: "witch-hat", decor: ["pumpkin", "witch-hat", "bat", "ghost", "bat"] },
  "black-friday": { from: "#0b0b0d", to: "#2a2a30", accent: "#e3ff8f", accentInk: "#0b0b0d", topper: "price-tag", decor: ["bag", "price-tag", "star", "flame", "star"] },
  navidad: { from: "#0e3526", to: "#1f6243", accent: "#f3c84c", accentInk: "#0e3526", topper: "santa-hat", decor: ["tree", "gift", "ornament", "snowflake", "santa-hat"] },
  "ano-nuevo": { from: "#0d1330", to: "#2a3670", accent: "#e3ff8f", accentInk: "#0d1330", topper: "party-hat", decor: ["champagne", "firework", "star", "party-hat", "firework"] },
  "san-valentin": { from: "#5c1028", to: "#a8274a", accent: "#ffd1dc", accentInk: "#5c1028", topper: "heart", decor: ["love-letter", "heart", "tulip", "heart", "star"] },
  orgullo: { from: "#140c2a", to: "#4a1f6e", accent: "#ff9fd0", accentInk: "#2b0d22", topper: "pride-heart", decor: ["pride-heart", "rainbow", "pride-flag", "heart", "star"] },
  "revolucion-de-mayo": { from: "#123a5c", to: "#2f6f9f", accent: "#f6c54c", accentInk: "#123a5c", topper: "escarapela", decor: ["cabildo", "empanada", "escarapela", "paraguas", "sol-de-mayo"] },
  "dia-de-la-bandera": { from: "#0f3f6b", to: "#2f74ad", accent: "#f6cf5a", accentInk: "#0f3f6b", topper: "escarapela", decor: ["bandera", "sol-de-mayo", "escarapela", "star", "heart"] },
  "dia-de-la-independencia": { from: "#0a1830", to: "#24508a", accent: "#f3d27a", accentInk: "#0a1830", topper: "escarapela", decor: ["casa-tucuman", "bandera", "firework", "escarapela", "star"] },
  pascuas: { from: "#3f2a66", to: "#7556a8", accent: "#ffe28a", accentInk: "#3f2a66", topper: "bunny-ears", decor: ["easter-egg", "bunny-ears", "tulip", "easter-egg", "star"] },
  "dia-del-animal": { from: "#283019", to: "#4f5d33", accent: "#e3ff8f", accentInk: "#283019", topper: "paw", decor: ["paw", "bone", "heart", "paw", "bone"] },
  "hot-sale": { from: "#5e1508", to: "#b8391a", accent: "#ffd34d", accentInk: "#5e1508", topper: "flame", decor: ["flame", "price-tag", "bag", "flame", "star"] },
  "dia-del-padre": {
    from: "#16222f", to: "#2e4862", accent: "#e9c27a", accentInk: "#16222f", topper: "fedora", decor: ["fedora", "tie", "gift", "mate", "star"],
    cast: [{ who: "pancho", pose: "stand", outfit: { hat: "fedora", tie: "#7a2434" } }, { who: "pancho", pose: "hop", pup: true }],
  },
  "dia-del-amigo": {
    from: "#22381f", to: "#4a6a2c", accent: "#e3ff8f", accentInk: "#22381f", topper: "mate", decor: ["mate", "heart", "paw", "star", "mate"],
    cast: [{ who: "pancho", pose: "wave", outfit: { bandana: "#b7d68f" } }, { who: "lola", pose: "wave", outfit: { bandana: "#ef9b6a" }, flip: true }],
  },
  "dia-del-nino": { from: "#0b4468", to: "#1b74a6", accent: "#ffd34d", accentInk: "#0b4468", topper: "party-hat", decor: ["balloon", "kite", "star", "balloon", "party-hat"] },
};

export function skinOf(id: SeasonId): ThemeSkin {
  return SKINS[id];
}
