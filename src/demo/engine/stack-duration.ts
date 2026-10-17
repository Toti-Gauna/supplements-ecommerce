import type { StackSlotId } from "../fixtures/stack-builder";
import type { Product, Variant } from "../types";
import { isPurchasable, unitPrice } from "./catalog";
import { daysLasting } from "./servings";
import type { StackPick } from "./stack-builder";
import { MAX_QTY } from "./stack-link";

/**
 * "Igualar duración" del stack (R2c, sección 10 del plan): elige tamaño y cantidad de cada producto para que todo se
 * termine más o menos el mismo día y se recompre junto. Pura y en pesos enteros; el sabor elegido se respeta.
 */

/** Una forma de llevar un producto: presentación, unidades, cuánto dura y cuánto sale. */
export interface DurationOption {
  variantId: string;
  qty: number;
  days: number;
  cost: number;
}

export interface Equalized {
  picks: StackPick[];
  /** Lo que dura lo más corto después de igualar (null si no hay al menos dos productos con servicios). */
  days: number | null;
  /** Diferencia en días entre lo que más y lo que menos dura, después de igualar. */
  spread: number;
  /** Lugares que cambiaron de tamaño o de cantidad. */
  changed: StackSlotId[];
}

/** Hasta cuántos días de diferencia cuenta como "lo mismo": 10 % de la duración, mínimo 3 días. */
export const durationTolerance = (days: number) => Math.max(3, Math.round(days * 0.1));

/** Diferencia entre lo que más y lo que menos dura (0 con uno o ninguno). */
export function durationSpread(days: number[]): number {
  return days.length < 2 ? 0 : Math.max(...days) - Math.min(...days);
}

/** Presentaciones del mismo sabor (o todas, si el producto no tiene sabores) con servicios y stock para cada cantidad. */
export function durationOptions(product: Product, current: Variant, perDay = 1): DurationOption[] {
  const sameFlavor = (v: Variant) => current.color === undefined || v.color === current.color;
  return product.variants
    .filter((v) => sameFlavor(v) && v.servings && v.stock !== 0)
    .flatMap((v) => Array.from({ length: MAX_QTY }, (_, i) => i + 1)
      .filter((qty) => isPurchasable(v, qty))
      .map((qty) => ({ variantId: v.id, qty, days: daysLasting(v.servings! * qty, perDay), cost: unitPrice(product, v) * qty })));
}

interface Measured {
  index: number;
  pick: StackPick;
  options: DurationOption[];
}

/** Para un objetivo de días, la opción más cercana de cada producto (a igual distancia, la más barata y con menos unidades). */
function closest(options: DurationOption[], target: number): DurationOption {
  return [...options].sort((a, b) => Math.abs(a.days - target) - Math.abs(b.days - target) || a.cost - b.cost || a.qty - b.qty)[0]!;
}

/**
 * Si ya dura parejo, no cambia nada. Si no, prueba como objetivo cada duración posible y se queda con la de menor diferencia (dentro de la tolerancia, todas
 * empatan); a igualdad, la que sale menos por día y, después, la más corta (menos plata de una vez).
 */
export function equalizeDuration(picks: StackPick[], catalog: Product[], perDay = 1): Equalized {
  const measured = picks.flatMap((pick, index): Measured[] => {
    const product = catalog.find((p) => p.slug === pick.slug);
    const variant = product?.variants.find((v) => v.id === pick.variantId);
    const options = product && variant?.servings ? durationOptions(product, variant, perDay) : [];
    return options.length ? [{ index, pick, options }] : [];
  });
  if (measured.length < 2) return { picks, days: null, spread: 0, changed: [] };
  // Ya dura parejo: no se toca (aunque otra combinación saliera un poco menos por día).
  const now = measured.flatMap((m) => m.options.filter((o) => o.variantId === m.pick.variantId && o.qty === (m.pick.qty ?? 1)).map((o) => o.days));
  if (now.length === measured.length && durationSpread(now) <= durationTolerance(Math.min(...now))) {
    return { picks, days: Math.min(...now), spread: durationSpread(now), changed: [] };
  }

  const targets = [...new Set(measured.flatMap((m) => m.options.map((o) => o.days)))].sort((a, b) => a - b);
  const plans = targets.map((target) => {
    const chosen = measured.map((m) => closest(m.options, target));
    const days = chosen.map((c) => c.days);
    const spread = durationSpread(days);
    const shortest = Math.min(...days);
    const cost = chosen.reduce((s, c) => s + c.cost, 0);
    return { chosen, spread, shortest, score: spread <= durationTolerance(shortest) ? 0 : spread, perDayCost: Math.round(cost / shortest) };
  });
  const best = plans.sort((a, b) => a.score - b.score || a.perDayCost - b.perDayCost || a.shortest - b.shortest)[0]!;

  const next = [...picks];
  const changed: StackSlotId[] = [];
  measured.forEach((m, i) => {
    const option = best.chosen[i]!;
    if (option.variantId === m.pick.variantId && option.qty === (m.pick.qty ?? 1)) return;
    changed.push(m.pick.slot);
    const base = { slot: m.pick.slot, slug: m.pick.slug, variantId: option.variantId };
    next[m.index] = option.qty > 1 ? { ...base, qty: option.qty } : base;
  });
  return { picks: changed.length ? next : picks, days: best.shortest, spread: best.spread, changed };
}
