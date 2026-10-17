"use client";
import { useRouter } from "next/navigation";
import type { LineGift } from "@/demo/engine/cart-types";
import { useCart } from "@/stores/cart";
import { useUi } from "@/stores/ui";

/** Suma una gift card al carrito (R3b) y abre el carrito, o va directo a pagar con "Regalar y pagar ahora". */
export function useGiftCardPurchase() {
  const router = useRouter();
  const addGiftCard = useCart((s) => s.addGiftCard);
  const openCart = useUi((s) => s.openCart);
  return ({ gift, amount }: { gift: LineGift; amount: number }, mode: "cart" | "buy") => {
    addGiftCard({ amount, gift: { ...gift, openChoice: undefined } });
    if (mode === "buy") router.push("/checkout/");
    else openCart();
  };
}
