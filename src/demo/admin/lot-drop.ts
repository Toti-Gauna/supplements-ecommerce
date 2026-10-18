import type { Coupon, Pack, SeasonalTheme } from "../types";
import { upcomingCampaign } from "./campaign-calendar";
import { comboId } from "./lot-combo";
import { lotCouponCode } from "./lot-coupon";
import type { LotRow } from "./lots";

/**
 * "Drop de la semana" (R4c): la próxima campaña con su cupón (ver `engine/campaign-drop.ts`). Meter el producto del lote
 * ahí lo suma a los productos en oferta de esa campaña, así sale con el cupón y el ticket del drop. Puro y testeado.
 */
export interface DropPlan { theme: SeasonalTheme; daysLeft: number; already: boolean; coupon: Coupon | null }

export function dropPlan(themes: SeasonalTheme[], coupons: Coupon[], productSlug: string, today: string): DropPlan | null {
  const next = upcomingCampaign(themes, today);
  if (!next) return null;
  return { theme: next.theme, daysLeft: next.daysLeft, already: next.theme.productSlugs.includes(productSlug), coupon: coupons.find((c) => c.code === next.theme.couponCode) ?? null };
}

/** La campaña con el producto sumado al final de sus productos en oferta (sin repetirlo). */
export function withDropProduct(theme: SeasonalTheme, productSlug: string): SeasonalTheme {
  return theme.productSlugs.includes(productSlug) ? theme : { ...theme, productSlugs: [...theme.productSlugs, productSlug] };
}

/** Qué se armó ya para el lote: combo, cupón o drop. */
export interface LotDone { combo: boolean; coupon: boolean; drop: boolean }

export function lotDone(lot: Pick<LotRow, "lot" | "productSlug">, data: { packs: Pack[]; coupons: Coupon[]; themes: SeasonalTheme[] }, today: string): LotDone {
  const plan = dropPlan(data.themes, data.coupons, lot.productSlug, today);
  return {
    combo: data.packs.some((p) => p.id === comboId(lot.lot.code)),
    coupon: data.coupons.some((c) => c.code === lotCouponCode(lot.lot.code)),
    drop: !!plan?.already,
  };
}
