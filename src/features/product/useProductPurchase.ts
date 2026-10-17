"use client";
import { useRouter } from "next/navigation";
import type { LineGift } from "@/demo/engine/cart-types";
import type { Product, Variant } from "@/demo/types";
import { useCart } from "@/stores/cart";
import { useUi } from "@/stores/ui";

/**
 * "Agregar al carrito" y "Comprar ahora" desde la ficha. Con `gift`, la línea se compra para regalar.
 * Devuelve false si no se puede comprar (sin stock o pausado).
 */
export function useProductPurchase(product: Product, variant: Variant, quantity: number, canBuy: boolean) {
  const router = useRouter();
  const add = useCart((s) => s.add);
  const openCart = useUi((s) => s.openCart);

  const ready = (): boolean => canBuy;

  /** `variantId`: con sabor o tamaño abiertos (R3b), la variante que fija el precio del regalo. */
  const purchase = (mode: "cart" | "buy", gift?: LineGift, variantId = variant.id): boolean => {
    if (!ready()) return false;
    add({ productSlug: product.slug, variantId, quantity, ...(gift ? { gift } : {}) });
    if (mode === "buy") router.push("/checkout/");
    else openCart(product.slug);
    return true;
  };

  return { purchase, ready };
}
