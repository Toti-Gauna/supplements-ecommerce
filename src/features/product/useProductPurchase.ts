"use client";
import { scrollBehavior } from "@/lib/scroll";
import { useRouter } from "next/navigation";
import type { LineGift } from "@/demo/engine/cart-types";
import type { Product, Variant } from "@/demo/types";
import { useCart } from "@/stores/cart";
import { useUi } from "@/stores/ui";
import type { PersonalizationDraft } from "../personalize/usePersonalizationDraft";
import { playSound } from "@/lib/sound";

/**
 * "Agregar al carrito" y "Comprar ahora" desde la ficha. Si el producto es personalizable, primero
 * exige el diseño completo (si falta algo, lleva el foco ahí); agregar equivale a "Así lo quiero".
 * Con `gift`, la línea se compra para regalar. Devuelve false si faltaba algo del diseño.
 */
export function useProductPurchase(product: Product, variant: Variant, quantity: number, canBuy: boolean, draft: PersonalizationDraft) {
  const router = useRouter();
  const add = useCart((s) => s.add);
  const openCart = useUi((s) => s.openCart);

  const focus = (id: string) => {
    const el = document.getElementById(id);
    el?.scrollIntoView({ behavior: scrollBehavior(), block: "center" });
    window.setTimeout(() => el?.focus({ preventScroll: true }), 350);
  };

  /** ¿Se puede comprar ya? Si falta algo del diseño, avisa y lleva el foco ahí. */
  const ready = (): boolean => {
    if (!canBuy) return false;
    if (draft.tmpl) {
      draft.touch();
      if (draft.problem) { playSound("error"); focus(draft.tmpl.kind === "TEXT" ? "p-text" : "personalizar"); return false; }
    }
    return true;
  };

  const purchase = (mode: "cart" | "buy", gift?: LineGift): boolean => {
    if (!ready()) return false;
    add({ productSlug: product.slug, variantId: variant.id, quantity, personalization: draft.build(), ...(gift ? { gift } : {}) });
    if (mode === "buy") router.push("/checkout/");
    else openCart(product.slug);
    return true;
  };

  return { purchase, ready };
}
