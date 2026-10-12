import { tone } from "@/components/illustrations/supplements/defs";
import type { GiftOccasion } from "@/demo/types";
import { occasionColors } from "../occasion";

/** Colores de la bolsa: el cuero y las costuras salen de la temática de la ocasión. */
export interface BagColors {
  /** Cuero: base, brillo (a un tercio, como un cilindro) y sombra de los costados. */
  leather: string;
  leatherHi: string;
  leatherLo: string;
  /** Refuerzos de arriba y de abajo, y la tapa. */
  band: string;
  cap: string;
  /** Hilo de las costuras, cintas y bordados (el acento de la temática). */
  accent: string;
  /** Texto claro sobre el cuero. */
  ink: string;
  /** Adentro de la bolsa, detrás de la luz. */
  inside: string;
}

export function bagColors(occasion: GiftOccasion): BagColors {
  const o = occasionColors(occasion);
  return {
    leather: o.from,
    leatherHi: tone(o.to, 0.08),
    leatherLo: tone(o.from, -0.6),
    band: tone(o.from, -0.32),
    cap: tone(o.from, -0.18),
    accent: o.accent,
    ink: "#eef1f5",
    inside: tone(o.from, -0.78),
  };
}

/** Props de los detalles de cada fecha: colores de la bolsa y prefijo único para los ids de los degradés. */
export interface DetailProps {
  c: BagColors;
  uid: string;
}

/** Detalle de una fecha: lo que va pintado o bordado en el cuero (`Body`, se rompe con el paño) y lo que cuelga o se
 *  apoya arriba (`Top`: gorrito, guantes, etiqueta, toalla). */
export interface BagDecor {
  Body?: (p: DetailProps) => React.JSX.Element;
  Top?: (p: DetailProps) => React.JSX.Element;
}
