import type { CartLineView } from "@/components/organisms/CartLineItem";
import { getProduct, maxQuantity } from "@/demo/engine/catalog";
import type { QuotedLine } from "@/demo/engine/pricing";
import { lastingDays } from "@/demo/engine/repurchase";

/** Línea del carrito lista para dibujar, con "te dura N días" según el consumo de referencia de su categoría. */
export function toLineView(q: QuotedLine): CartLineView | null {
  const product = getProduct(q.line.productSlug);
  const variant = product?.variants.find((v) => v.id === q.line.variantId);
  if (!product || !variant) return null;
  return {
    id: q.line.id, slug: product.slug, name: product.name, variantLabel: variant.label, art: product.art, pack: product.pack, tint: variant.colorHex, servings: variant.servings,
    unitPrice: q.unitPrice, lineTotal: q.lineTotal, quantity: q.line.quantity, maxQuantity: maxQuantity(variant), gift: q.line.gift,
    lastsDays: lastingDays(product, variant, q.line.quantity),
  };
}
