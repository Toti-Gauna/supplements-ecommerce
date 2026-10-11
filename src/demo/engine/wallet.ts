import type { Coupon } from "../types";
import { validateCoupon } from "./coupons";
import { demoData } from "./source";

export type WalletStatus = "available" | "min-subtotal" | "needs-account" | "expired" | "used" | "paused";

export interface WalletCoupon {
  coupon: Coupon;
  /** "ruleta" = ganado por esta persona; "tienda" = vigente para todos. */
  origin: "ruleta" | "tienda";
  status: WalletStatus;
  message: string | null;
}

const ORDER: Record<WalletStatus, number> = { available: 0, "min-subtotal": 1, "needs-account": 2, used: 3, expired: 4, paused: 5 };

function statusOf(coupon: Coupon, ctx: { subtotal: number; isRegistered: boolean; now: Date }): { status: WalletStatus; message: string | null } {
  const check = validateCoupon(coupon.code, ctx);
  if (check.ok) return { status: "available", message: null };
  if (coupon.active === false) return { status: "paused", message: check.message };
  if (coupon.maxUses !== undefined && (coupon.usedCount ?? 0) >= coupon.maxUses) return { status: "used", message: check.message };
  if (coupon.endsAt && ctx.now > new Date(`${coupon.endsAt}T23:59:59`)) return { status: "expired", message: check.message };
  if (coupon.onlyRegistered && !ctx.isRegistered) return { status: "needs-account", message: check.message };
  return { status: "min-subtotal", message: check.message };
}

/**
 * "Mis cupones": el cupón propio de la ruleta + los cupones de la tienda. Los RULETA… de otras
 * personas nunca se listan; los de una temática, solo mientras está puesta. Ordena primero lo que se puede usar ahora.
 */
export function walletCoupons(ctx: { subtotal: number; isRegistered: boolean; now: Date; wheelCode: string | null; themeId?: string | null }): WalletCoupon[] {
  const list = demoData().coupons.flatMap((coupon): WalletCoupon[] => {
    const own = coupon.code === ctx.wheelCode;
    if (coupon.code.startsWith("RULETA") && !own) return [];
    if (!own && coupon.active === false) return [];
    if (coupon.themeId && coupon.themeId !== ctx.themeId) return [];
    return [{ coupon, origin: own ? "ruleta" : "tienda", ...statusOf(coupon, ctx) }];
  });
  return list.sort((a, b) => ORDER[a.status] - ORDER[b.status] || (a.origin === "ruleta" ? -1 : b.origin === "ruleta" ? 1 : 0));
}
