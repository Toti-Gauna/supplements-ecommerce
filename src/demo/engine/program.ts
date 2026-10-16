import type { Pack } from "../types";
import { goalInfo } from "./goals";
import { isGear } from "./catalog";
import type { PackQuote } from "./packs";
import type { QuizResult } from "./quiz";

/**
 * "Tu programa" (L4): el resultado del quiz como un pack a medida, para comprarlo una vez o recibirlo todos los meses.
 * Lleva los suplementos del stack y, si eligió un deporte, el primer equipamiento sugerido (viaja solo en la primera
 * entrega, como en cualquier pack). Mismos descuentos que los packs de la tienda.
 */
export const PROGRAM_PACK_ID = "programa";
export const PROGRAM_DISCOUNT_PCT = 10;
export const PROGRAM_MONTHLY_PCT = 5;

/** Para qué es el programa: "Fuerza + Salud · Fútbol". */
export function programFocus(result: Pick<QuizResult, "chosen" | "sport">): string {
  const goals = result.chosen.map((g) => goalInfo(g)?.name ?? g);
  return [goals.join(" + "), result.sport?.name].filter(Boolean).join(" · ") || "Tu entrenamiento";
}

/** El pack del programa, o null si el quiz no llegó a armar al menos dos suplementos (no alcanza para un pack mensual). */
export function programPack(result: QuizResult): Pack | null {
  if (result.picks.length < 2) return null;
  const gear = result.gear.find((g) => isGear(g.product));
  const focus = programFocus(result);
  return {
    id: PROGRAM_PACK_ID,
    name: "Tu programa",
    tagline: focus,
    description: "Armado con tus respuestas del quiz. Los suplementos llegan todos los meses; el equipamiento, solo en la primera entrega.",
    focus,
    items: [
      ...result.picks.map((p) => ({ productSlug: p.slug, variantId: p.variantId, qty: 1 })),
      ...(gear ? [{ productSlug: gear.product.slug, variantId: gear.variant.id, qty: 1 }] : []),
    ],
    discountPct: PROGRAM_DISCOUNT_PCT,
    monthlyPct: PROGRAM_MONTHLY_PCT,
    featured: false,
    custom: true,
  };
}

/**
 * Cuánto sale por día lo que se repite (un servicio de cada suplemento) al precio del pack comprado una vez. null si
 * algún suplemento no informa servicios (no se puede estimar) o si no hay suplementos.
 */
export function programPerDay(quote: PackQuote): number | null {
  const daily = quote.lines.filter((l) => l.recurring);
  if (!daily.length || daily.some((l) => (l.variant.servings ?? 0) < 1)) return null;
  const full = daily.reduce((sum, l) => sum + l.unitPrice / l.variant.servings!, 0);
  return Math.round(full * (1 - quote.pack.discountPct / 100));
}
