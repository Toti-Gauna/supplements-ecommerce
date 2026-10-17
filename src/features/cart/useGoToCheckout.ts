"use client";
import { useRouter } from "next/navigation";
import { useUi } from "@/stores/ui";

/** Ir a pagar: directo al checkout. La ruleta se ofrece antes, en el bolso (`WheelOffer`), sin cortar el pago. */
export function useGoToCheckout() {
  const router = useRouter();
  const closeCart = useUi((s) => s.closeCart);
  return () => {
    closeCart();
    router.push("/checkout/");
  };
}
