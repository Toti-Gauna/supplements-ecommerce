"use client";
import { useRouter } from "next/navigation";
import { productHref } from "@/demo/engine/catalog";
import type { Product } from "@/demo/types";
import { useCart } from "@/stores/cart";
import { useUi } from "@/stores/ui";

/** Agregado rápido: los personalizables van a su ficha (ahí se personalizan); el resto suma la primera variante con stock. */
export function useQuickAdd() {
  const router = useRouter();
  const add = useCart((s) => s.add);
  const { openCart, closeCart } = useUi();
  return (product: Product) => {
    if (product.personalization) {
      closeCart();
      return router.push(productHref(product.slug));
    }
    const variant = product.variants.find((v) => v.stock !== 0);
    if (!variant) return;
    add({ productSlug: product.slug, variantId: variant.id, quantity: 1 });
    openCart(product.slug);
  };
}
