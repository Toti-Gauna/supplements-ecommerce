import { brand } from "@/config/brand";
import type { GiftOccasion } from "@/demo/types";
import { occasionColors } from "../occasion";

/**
 * Colores de cada diseño de la tarjeta de regalo (R3b). Es arte (la imagen que se manda por WhatsApp): usa colores
 * propios, iguales en modo claro y oscuro. "fecha" toma los de la ocasión; sin fecha especial, cae en "box".
 */
export type CardFloor = "rubber" | "grid" | "ring" | "rays";

export interface CardPalette {
  bg: [string, string];
  ink: string;
  muted: string;
  /** Luz de señal: titular, filos y el código. */
  accent: string;
  /** Texto sobre el acento (la franja en diagonal). */
  onAccent: string;
  /** Segundo brillo del escenario. */
  glow: string;
  /** Papel del mensaje y del ticket. */
  paper: string;
  paperInk: string;
  floor: CardFloor;
  /** Cuero de la bolsa y acero del locker. */
  leather: [string, string, string];
}

const NIGHT: [string, string, string] = ["#050608", "#20252f", "#0b0d11"];

const PALETTES: Record<string, CardPalette> = {
  box: { bg: ["#07090c", "#151a23"], ink: "#eef1f5", muted: "#a3acba", accent: brand.signature.volt, onAccent: "#0a0c10", glow: brand.signature.plasma, paper: "#f2f0ea", paperInk: "#0b0d10", floor: "rubber", leather: NIGHT },
  tiza: { bg: ["#f6f6f1", "#e4e7dc"], ink: "#0b0d10", muted: "#4b525d", accent: "#3f5a00", onAccent: "#f2f0ea", glow: "#0fa89b", paper: "#ffffff", paperInk: "#0b0d10", floor: "grid", leather: ["#1b1f27", "#4a515e", "#2a2f38"] },
  ring: { bg: ["#3a070c", "#0e0204"], ink: "#fff4ee", muted: "#f0bcb2", accent: "#ff4b3e", onAccent: "#1a0305", glow: "#ffb199", paper: "#fff8f2", paperInk: "#1a0305", floor: "ring", leather: ["#2b0306", "#8f141c", "#47060c"] },
  podio: { bg: ["#1d160a", "#060503"], ink: "#fff8e8", muted: "#d8c69e", accent: "#f0c04f", onAccent: "#1d160a", glow: "#fff1c1", paper: "#fffaf0", paperInk: "#1d160a", floor: "rays", leather: ["#1a1407", "#5e4a1c", "#2d230c"] },
};

/** Paleta de un diseño. Con "fecha", el escenario se tiñe con los colores de la ocasión. */
export function cardPalette(design: string | undefined, occasion: GiftOccasion): CardPalette {
  if (design === "fecha" && occasion !== "volta") {
    const c = occasionColors(occasion);
    return { ...PALETTES.box!, bg: [c.from, c.to], accent: c.accent, onAccent: c.ink, glow: c.accent };
  }
  return PALETTES[design ?? "box"] ?? PALETTES.box!;
}

/** Muestra chica de cada diseño para el selector (fondo y acento). */
export function designSwatch(design: string, occasion: GiftOccasion): { from: string; to: string; accent: string } {
  const p = cardPalette(design, occasion);
  return { from: p.bg[0], to: p.bg[1], accent: p.accent };
}
