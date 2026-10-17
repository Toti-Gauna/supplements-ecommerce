"use client";
import type { Product, Variant } from "@/demo/types";
import { useCart } from "@/stores/cart";
import { useUi } from "@/stores/ui";

/** Agregado rápido: suma la variante elegida (o la primera con stock) y abre el carrito. */
export function useQuickAdd() {
  const add = useCart((s) => s.add);
  const { openCart } = useUi();
  return (product: Product, chosen?: Variant) => {
    const variant = chosen ?? product.variants.find((v) => v.stock !== 0);
    if (!variant || variant.stock === 0) return;
    add({ productSlug: product.slug, variantId: variant.id, quantity: 1 });
    openCart(product.slug);
  };
}
