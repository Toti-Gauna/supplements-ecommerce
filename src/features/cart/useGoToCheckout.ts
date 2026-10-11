"use client";
import { useRouter } from "next/navigation";
import { useAccount } from "@/stores/account";
import { useDemoData } from "@/stores/admin";
import { useUi } from "@/stores/ui";

/** Ir a pagar: si la ruleta está activa y todavía no se giró, primero aparece la ruleta. */
export function useGoToCheckout() {
  const router = useRouter();
  const wheelActive = useDemoData((d) => d.wheel.active);
  const hasPrize = useAccount((s) => s.wheelPrize !== null);
  const { setWheel, closeCart } = useUi();
  return () => {
    closeCart();
    if (wheelActive && !hasPrize) return setWheel(true, "checkout");
    router.push("/checkout/");
  };
}
