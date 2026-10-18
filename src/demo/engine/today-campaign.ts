import { upcomingCampaign } from "../admin/campaign-calendar";
import { plural } from "@/lib/plural";
import { fakeDiscounts } from "./price-history";
import type { TodayAction, TodaySnapshot } from "./today";
import { addDays } from "./workdays";

/**
 * La próxima campaña en la lista de hoy (R4a), con su checklist: cupón activo, productos en oferta con stock,
 * descuento real (el precio con cupón baja del más bajo de 30 días) y las piezas para Instagram (no se registran:
 * quedan como paso con su enlace). Regla: "Esta semana" si empieza en 7 días o menos; si no, "Más adelante".
 */
export const CAMPAIGN_SOON_DAYS = 7;
const editorHref = (id: string) => `/admin-demo/campanas/editar/?id=${id}`;
const piecesHref = (id: string) => `/admin-demo/campanas/piezas/?id=${id}`;

export function campaignAction(snap: TodaySnapshot, today: string): TodayAction | null {
  const next = upcomingCampaign(snap.data.themes, today);
  if (!next) return null;
  const t = next.theme;
  const coupon = snap.data.coupons.find((c) => c.code === t.couponCode && c.active !== false) ?? null;
  const products = snap.data.products.filter((p) => t.productSlugs.includes(p.slug) && p.active !== false);
  const withStock = products.filter((p) => p.variants.some((v) => v.stock !== 0)).length;
  const fake = coupon ? fakeDiscounts(products, coupon, snap.data.priceChanges ?? [], today).length : 0;
  const checklist = [
    { label: coupon ? `Cupón ${coupon.code} activo` : "Falta el cupón de la campaña", done: !!coupon, href: editorHref(t.id) },
    { label: products.length ? `${plural(withStock, "producto", "productos")} en oferta con stock` : "Faltan los productos en oferta", done: products.length > 0 && withStock === products.length, href: editorHref(t.id) },
    { label: fake ? `Descuento no real en ${plural(fake, "producto", "productos")}` : "Descuento real", done: !!coupon && fake === 0, href: editorHref(t.id) },
    { label: "Piezas para Instagram", done: false, href: piecesHref(t.id) },
  ];
  const left = next.daysLeft;
  return {
    id: `campaign:${t.id}`, kind: "campaign", tier: left <= CAMPAIGN_SOON_DAYS ? "semana" : "despues", due: addDays(today, left),
    title: `Prepará ${t.name}: ${left === 0 ? "empieza hoy" : `empieza en ${plural(left, "día", "días")}`}`,
    detail: `${checklist.filter((c) => c.done).length} de ${checklist.length} listos. ${t.headline}.`,
    metric: { value: left, unit: left === 1 ? "día" : "días" }, href: editorHref(t.id), checklist,
    cta: { type: "link", label: `Preparar ${t.name}`, href: editorHref(t.id) },
  };
}
