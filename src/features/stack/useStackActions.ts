"use client";
import type { StackSummary } from "@/demo/engine/stack-builder";
import { useCart } from "@/stores/cart";
import { useToasts } from "@/stores/toast";
import { useUi } from "@/stores/ui";

/**
 * Acciones del estante: sumar cada variante al carrito (una unidad de cada una) y abrir el carrito lateral, donde el
 * motor de precios aplica el mismo descuento stack; y copiar el link para compartirlo.
 */
export function useStackActions(summary: StackSummary, link: () => string) {
  const add = useCart((s) => s.add);
  const openCart = useUi((s) => s.openCart);
  const toast = useToasts((s) => s.push);

  const addToCart = () => {
    summary.lines.forEach((l) => add({ productSlug: l.product.slug, variantId: l.variant.id, quantity: 1 }));
    openCart();
  };

  const copyLink = async () => {
    const url = link();
    try {
      await navigator.clipboard.writeText(url);
      toast({ tone: "success", title: "Link copiado", description: "Mandalo por WhatsApp: abre este mismo stack." });
    } catch {
      toast({ tone: "error", title: "No se pudo copiar", description: `Copialo a mano: ${url}` });
    }
  };

  return { addToCart, copyLink };
}
