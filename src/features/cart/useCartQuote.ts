"use client";
import { useMemo } from "react";
import { validateCoupon, type CouponCheck } from "@/demo/engine/coupons";
import { quoteCart, type Quote } from "@/demo/engine/pricing";
import { useAccount } from "@/stores/account";
import { useCart } from "@/stores/cart";
import { useCheckout } from "@/stores/checkout";

export interface CartQuote {
  quote: Quote;
  couponCheck: CouponCheck | null;
  isRegistered: boolean;
}

/** Une carrito + cuenta + selección de checkout con el motor de precios de la demo. */
export function useCartQuote(): CartQuote {
  const lines = useCart((s) => s.lines);
  const couponCode = useCart((s) => s.couponCode);
  const isRegistered = useAccount((s) => s.user !== null);
  const paymentMethod = useCheckout((s) => s.paymentMethod);
  const fulfillment = useCheckout((s) => s.fulfillment);
  return useMemo(() => {
    const base = quoteCart(lines);
    const couponCheck = couponCode ? validateCoupon(couponCode, { subtotal: base.subtotal, isRegistered, now: new Date() }) : null;
    const quote = quoteCart(lines, { coupon: couponCheck?.ok ? couponCheck.coupon : null, paymentMethod, fulfillment });
    return { quote, couponCheck, isRegistered };
  }, [lines, couponCode, isRegistered, paymentMethod, fulfillment]);
}
