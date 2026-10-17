"use client";
import type { CartLine } from "@/demo/engine/cart-types";
import { getProduct } from "@/demo/engine/catalog";
import { useCart } from "@/stores/cart";
import { useUi } from "@/stores/ui";

/**
 * Recomprar en un toque: suma al carrito lo de un pedido (o un pote) y abre el bolso. Solo lo que sigue a la venta y
 * con stock; los regalos vuelven como compra común. Devuelve cuántas líneas se sumaron.
 */
export function useRepeatOrder() {
  const add = useCart((s) => s.add);
  const openCart = useUi((s) => s.openCart);
  return (lines: Pick<CartLine, "productSlug" | "variantId" | "quantity">[]): number => {
    const ok = lines.filter((l) => {
      const product = getProduct(l.productSlug);
      const variant = product?.variants.find((v) => v.id === l.variantId);
      return product && product.active !== false && variant && variant.stock !== 0;
    });
    ok.forEach((l) => add({ productSlug: l.productSlug, variantId: l.variantId, quantity: l.quantity }));
    if (ok.length) openCart(ok[0]!.productSlug);
    return ok.length;
  };
}
