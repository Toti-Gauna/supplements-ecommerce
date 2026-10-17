import type { Coupon } from "../types";
import { CLUB_COUPON_PREFIX } from "./club-claims";
import { validateCoupon } from "./coupons";
import { GAME_COUPON_PREFIX } from "./game-prize";
import { demoData } from "./source";

export type WalletOrigin = "ruleta" | "juego" | "club" | "tienda";

export type WalletStatus = "available" | "min-subtotal" | "needs-account" | "expired" | "used" | "paused";

export interface WalletCoupon {
  coupon: Coupon;
  /** "ruleta", "juego" y "club" = ganado por esta persona (ruleta, Shaker Rush o una misión); "tienda" = para todos. */
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

const RANK: Record<WalletOrigin, number> = { ruleta: 0, juego: 1, club: 2, tienda: 3 };
const PRIZE_PREFIXES = ["RULETA", GAME_COUPON_PREFIX, CLUB_COUPON_PREFIX];

/**
 * "Mis cupones": el cupón propio de la ruleta, los ganados en Shaker Rush o en misiones del Club y los de la tienda. Los
 * RULETA…, SHAKER… y CLUB… de otras personas nunca se listan; los de una temática, solo mientras está puesta, y los de la tienda, solo si
 * están vigentes. Ordena primero lo que se puede usar ahora y, a igual estado, los premios propios.
 */
export function walletCoupons(ctx: { subtotal: number; isRegistered: boolean; now: Date; wheelCode: string | null; gameCodes?: string[]; clubCodes?: string[]; themeId?: string | null }): WalletCoupon[] {
  const list = demoData().coupons.flatMap((coupon): WalletCoupon[] => {
    const origin: WalletOrigin = coupon.code === ctx.wheelCode ? "ruleta" : ctx.gameCodes?.includes(coupon.code) ? "juego" : ctx.clubCodes?.includes(coupon.code) ? "club" : "tienda";
    const own = origin !== "tienda";
    if (PRIZE_PREFIXES.some((p) => coupon.code.startsWith(p)) && !own) return [];
    if (!own && coupon.active === false) return [];
    if (coupon.themeId && coupon.themeId !== ctx.themeId) return [];
    const state = statusOf(coupon, ctx);
    // De la tienda, solo los vigentes: un cupón vencido o agotado es ruido (los premios propios sí se ven vencidos).
    if (!own && (state.status === "expired" || state.status === "used")) return [];
    return [{ coupon, origin, ...state }];
  });
  return list.sort((a, b) => ORDER[a.status] - ORDER[b.status] || RANK[a.origin] - RANK[b.origin]);
}
