import type { Coupon } from "../types";
import { validateCoupon } from "./coupons";
import { GAME_COUPON_PREFIX } from "./game-prize";
import { demoData } from "./source";

export type WalletOrigin = "ruleta" | "juego" | "tienda";

export type WalletStatus = "available" | "min-subtotal" | "needs-account" | "expired" | "used" | "paused";

export interface WalletCoupon {
  coupon: Coupon;
  /** "ruleta" y "juego" = ganado por esta persona (ruleta o Shaker Rush); "tienda" = vigente para todos. */
  origin: WalletOrigin;
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

const RANK: Record<WalletOrigin, number> = { ruleta: 0, juego: 1, tienda: 2 };

/**
 * "Mis cupones": el cupón propio de la ruleta, los ganados en Shaker Rush y los cupones de la tienda. Los RULETA… y
 * SHAKER… de otras personas nunca se listan; los de una temática, solo mientras está puesta. Ordena primero lo que se
 * puede usar ahora y, a igual estado, los premios propios.
 */
export function walletCoupons(ctx: { subtotal: number; isRegistered: boolean; now: Date; wheelCode: string | null; gameCodes?: string[]; themeId?: string | null }): WalletCoupon[] {
  const list = demoData().coupons.flatMap((coupon): WalletCoupon[] => {
    const origin: WalletOrigin = coupon.code === ctx.wheelCode ? "ruleta" : ctx.gameCodes?.includes(coupon.code) ? "juego" : "tienda";
    const own = origin !== "tienda";
    if ((coupon.code.startsWith("RULETA") || coupon.code.startsWith(GAME_COUPON_PREFIX)) && !own) return [];
    if (!own && coupon.active === false) return [];
    if (coupon.themeId && coupon.themeId !== ctx.themeId) return [];
    return [{ coupon, origin, ...statusOf(coupon, ctx) }];
  });
  return list.sort((a, b) => ORDER[a.status] - ORDER[b.status] || RANK[a.origin] - RANK[b.origin]);
}
