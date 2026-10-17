"use client";
import { useMemo } from "react";
import { validateCoupon, type CouponCheck } from "@/demo/engine/coupons";
import { checkGiftCard, type GiftCardCheck } from "@/demo/engine/gift-cards";
import { quoteCart, type Quote } from "@/demo/engine/pricing";
import { DEMO_TODAY } from "@/demo/fixtures/admin-orders";
import { useAccount } from "@/stores/account";
import { useDemoData } from "@/stores/admin";
import { useCart } from "@/stores/cart";
import { useCheckout } from "@/stores/checkout";

export interface CartQuote {
  quote: Quote;
  couponCheck: CouponCheck | null;
  /** La gift card aplicada en el paso Pago (R3b), validada contra el saldo del panel. */
  giftCardCheck: GiftCardCheck | null;
  isRegistered: boolean;
}

/** Une carrito + cuenta + selección de checkout con el motor de precios de la demo. */
export function useCartQuote(): CartQuote {
  const lines = useCart((s) => s.lines);
  const packs = useCart((s) => s.customPacks);
  const cards = useCart((s) => s.giftCards);
  const couponCode = useCart((s) => s.couponCode);
  const isRegistered = useAccount((s) => s.user !== null);
  const paymentMethod = useCheckout((s) => s.paymentMethod);
  const fulfillment = useCheckout((s) => s.fulfillment);
  const giftCardCode = useCheckout((s) => s.giftCardCode);
  const issued = useDemoData((d) => d.giftCards);
  return useMemo(() => {
    const base = quoteCart(lines, { packs });
    const couponCheck = couponCode ? validateCoupon(couponCode, { subtotal: base.subtotal, isRegistered, now: new Date() }) : null;
    const giftCardCheck = giftCardCode ? checkGiftCard(issued ?? [], giftCardCode, DEMO_TODAY) : null;
    const quote = quoteCart(lines, {
      coupon: couponCheck?.ok ? couponCheck.coupon : null, paymentMethod, fulfillment, packs,
      giftCards: (cards ?? []).map((c) => c.amount), giftCardBalance: giftCardCheck?.ok ? giftCardCheck.card.balance : 0,
    });
    return { quote, couponCheck, giftCardCheck, isRegistered };
  }, [lines, packs, cards, couponCode, isRegistered, paymentMethod, fulfillment, giftCardCode, issued]);
}
