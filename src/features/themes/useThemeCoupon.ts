"use client";
import { useCart } from "@/stores/cart";
import { useToasts } from "@/stores/toast";
import { changeCoupon } from "../cart/coupon-actions";

/** Copiar el código o dejarlo aplicado en el carrito (se valida igual al pagar, en el engine). */
export function useThemeCoupon() {
  const applied = useCart((s) => s.couponCode);
  const toast = useToasts((s) => s.push);
  const copy = (code: string) => {
    void navigator.clipboard?.writeText(code).catch(() => undefined);
    toast({ tone: "success", title: "Código copiado", description: code });
  };
  const apply = (code: string) => {
    if (!changeCoupon(code)) return;
    toast({ tone: "success", title: "Cupón listo en tu carrito", description: `${code} se aplica al pagar si cumple las condiciones.` });
  };
  return { copy, apply, applied };
}
