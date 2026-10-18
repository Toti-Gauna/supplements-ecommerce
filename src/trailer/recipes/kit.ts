import { brand } from "@/config/brand";
import { SplitText } from "../engine/gsap";

/** Paleta del trailer: sale de la ficha de marca (nunca colores sueltos), así "Tu tienda" o cualquier cliente se ve con sus colores. */
export const TR = {
  night: brand.colors.night,
  night2: brand.colors.night2,
  volt: brand.signature.volt,
  ion: brand.signature.ion,
  plasma: brand.signature.plasma,
  onNight: brand.signature.onNight,
  muted: brand.signature.nightMuted,
  paper: brand.light.background,
  surface: brand.light.surface,
  ink: brand.light.text,
} as const;

export type Tone = "night" | "volt" | "paper";
/** Fondo y tinta de cada tono de escena. */
export const TONES: Record<Tone, { bg: string; fg: string; accent: string }> = {
  night: { bg: TR.night, fg: TR.onNight, accent: TR.volt },
  volt: { bg: TR.volt, fg: TR.night, accent: TR.night },
  paper: { bg: TR.paper, fg: TR.ink, accent: TR.ink },
};

/** Parte en letras con máscara (cada letra sube desde atrás de su línea). Se revierte solo al cerrar el contexto del trailer. */
export const splitChars = (els: HTMLElement[]) => els.flatMap((el) => SplitText.create(el, { type: "chars", mask: "chars" }).chars as HTMLElement[]);

/** Formato de cifras en pesos argentinos, sin decimales. */
export const ars = (n: number) => Math.round(n).toLocaleString("es-AR");

/** Tamaño de la tipografía display según el escenario: el vertical es más angosto. */
export const displaySize = (ratio: "16x9" | "9x16", wide: number, tall = wide * 0.72) => (ratio === "16x9" ? wide : tall);
