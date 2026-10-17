import type { Product, Variant } from "../types";
import { isPurchasable, unitPrice } from "./catalog";
import type { OpenChoice } from "./gift-options";

/**
 * Sabor y tamaño abiertos para quien recibe (R3b). Regla de precio, clara y sin sorpresas:
 *
 * - Quien regala fija lo que no deja abierto (por ejemplo el tamaño) y deja abierto el resto (el sabor).
 * - Se paga la opción **más cara** entre las que quien recibe puede elegir y hay en stock (`openChoiceAnchor`). Si el
 *   sabor queda abierto con el tamaño fijo, casi siempre es el mismo precio; si el tamaño queda abierto, se paga el
 *   tamaño más grande. Quien recibe nunca paga una diferencia ni ve el precio.
 * - Al elegir, el motor valida que la opción esté entre las posibles, que tenga stock para la cantidad y que no cueste
 *   más que la de referencia (`validateGiftChoice`). En producción lo valida el servidor con el precio pagado.
 */

/** Qué se puede dejar abierto en un producto: sabor si tiene más de un sabor, tamaño si tiene más de un tamaño. */
export function choiceOptions(product: Product): { flavor: boolean; size: boolean } {
  const distinct = (key: "color" | "size") => new Set(product.variants.map((v) => v[key]).filter(Boolean)).size > 1;
  return { flavor: distinct("color"), size: distinct("size") };
}

/** Lo abierto que el producto realmente tiene; undefined si no queda nada abierto. */
export function cleanOpenChoice(product: Product, choice: OpenChoice | undefined): OpenChoice | undefined {
  const can = choiceOptions(product);
  const flavor = Boolean(choice?.flavor && can.flavor), size = Boolean(choice?.size && can.size);
  return flavor || size ? { ...(flavor ? { flavor: true } : {}), ...(size ? { size: true } : {}) } : undefined;
}

/** Variantes que quien recibe puede elegir: las que coinciden con `base` en lo que quedó fijo (con o sin stock). */
export function choiceCandidates(product: Product, base: Variant, choice: OpenChoice | undefined): Variant[] {
  const open = cleanOpenChoice(product, choice);
  if (!open) return [base];
  return product.variants.filter((v) => (open.flavor || v.color === base.color) && (open.size || v.size === base.size));
}

/**
 * Variante que se carga en el carrito y fija el precio: la más cara de las posibles con stock para `quantity`. A igual
 * precio queda `base` (lo que eligió quien regala). Sin nada abierto, es `base`.
 */
export function openChoiceAnchor(product: Product, base: Variant, choice: OpenChoice | undefined, quantity = 1): Variant {
  const pool = choiceCandidates(product, base, choice).filter((v) => isPurchasable(v, quantity));
  return pool.reduce((best, v) => (unitPrice(product, v) > unitPrice(product, best) ? v : best), pool.includes(base) ? base : pool[0] ?? base);
}

export type ChoiceCheck = { ok: true; variant: Variant } | { ok: false; message: string };

/** Valida lo que eligió quien recibe contra la variante pagada (`anchor`), lo abierto y el stock. */
export function validateGiftChoice(product: Product, anchor: Variant, choice: OpenChoice | undefined, chosenId: string, quantity = 1): ChoiceCheck {
  const open = cleanOpenChoice(product, choice);
  if (!open) return { ok: false, message: "Este regalo no tiene nada para elegir." };
  const variant = choiceCandidates(product, anchor, open).find((v) => v.id === chosenId);
  if (!variant) return { ok: false, message: "Esa opción no está incluida en este regalo." };
  if (unitPrice(product, variant) > unitPrice(product, anchor)) return { ok: false, message: "Esa opción no está incluida en este regalo." };
  if (!isPurchasable(variant, quantity)) return { ok: false, message: `${variant.label} se quedó sin stock. Elegí otra opción.` };
  return { ok: true, variant };
}

/** Lo que dice el regalo sobre la variante antes de elegir: "2 lb · sabor a elección", "Tamaño a elección". */
export function openChoiceLabel(base: Variant, choice: OpenChoice | undefined): string {
  if (!choice?.flavor && !choice?.size) return base.label;
  if (choice.flavor && choice.size) return "Sabor y tamaño a elección";
  if (choice.flavor) return [base.size, "sabor a elección"].filter(Boolean).join(" · ");
  return [base.color, "tamaño a elección"].filter(Boolean).join(" · ");
}

/** Qué se elige, en palabras: "sabor", "tamaño" o "sabor y tamaño". */
export function openChoiceNoun(choice: OpenChoice | undefined): string {
  return choice?.flavor && choice?.size ? "sabor y tamaño" : choice?.size ? "tamaño" : "sabor";
}
