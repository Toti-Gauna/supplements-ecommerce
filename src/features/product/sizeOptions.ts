import { findVariant } from "@/demo/engine/catalog";
import { bestValueSize, pricePerServing, variantPrice } from "@/demo/engine/servings";
import type { Product } from "@/demo/types";
import { formatARS } from "@/lib/money";
import type { useVariantSelection } from "./useVariantSelection";

/**
 * Tamaños como tarjetas: servicios y precio por servicio de cada uno, con la de mejor precio marcada. Lo usan la ficha
 * y la hoja rápida de la tarjeta, así las dos dicen lo mismo.
 */
export function sizeOptionsWithServings(product: Product, sel: ReturnType<typeof useVariantSelection>) {
  const best = bestValueSize(product, sel.color);
  return sel.sizeOptions.map((o) => {
    const v = findVariant(product, sel.color, o.value) ?? findVariant(product, undefined, o.value);
    const pps = v ? pricePerServing(variantPrice(product, v), v.servings) : null;
    return { ...o, detail: v?.servings && v.servings > 1 && pps ? `${v.servings} servicios\n${formatARS(pps)} c/u` : undefined, badge: o.value === best ? "Mejor precio por servicio" : undefined };
  });
}
