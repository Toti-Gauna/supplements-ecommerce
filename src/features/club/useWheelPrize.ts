"use client";
import { prizeStatus } from "@/demo/engine/wheel-prize";
import { useAccount } from "@/stores/account";
import { useDemoData } from "@/stores/admin";
import { useCart } from "@/stores/cart";

/** El premio de la ruleta con su cupón y su estado (8.2.14). Mientras gira, todavía no se muestra. */
export function useWheelPrize() {
  const prize = useAccount((s) => (s.wheelSpinning ? null : s.wheelPrize));
  const coupon = useDemoData((d) => (prize ? d.coupons.find((c) => c.code === prize.code) : undefined));
  const appliedCode = useCart((s) => s.couponCode);
  return { prize, coupon, status: prize ? prizeStatus(prize, { appliedCode, coupon }) : null };
}
