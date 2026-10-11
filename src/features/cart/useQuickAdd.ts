"use client";
import type { Product } from "@/demo/types";
import { useCart } from "@/stores/cart";
import { useUi } from "@/stores/ui";

/** Agregado rápido: suma la primera variante con stock y abre el carrito. */
export function useQuickAdd() {
  const add = useCart((s) => s.add);
  const { openCart } = useUi();
  return (product: Product) => {
    const variant = product.variants.find((v) => v.stock !== 0);
    if (!variant) return;
    add({ productSlug: product.slug, variantId: variant.id, quantity: 1 });
    openCart(product.slug);
  };
}
