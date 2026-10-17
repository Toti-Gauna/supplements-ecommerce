import { quoteCart } from "../engine/pricing";
import type { Coupon, SeasonalTheme, SeasonId } from "../types";
import type { AdminOrder } from "./types";

/**
 * Resultados del cupón de cada campaña (Panel → Campañas): usos, descuento dado, pedidos y lo vendido con el cupón.
 * Los usos salen del contador del cupón (incluye los que se cargan a mano); el descuento y los pedidos, de los pedidos
 * del panel que lo usaron (los cancelados no cuentan). Puro y testeado.
 */
export interface CampaignResult {
  id: SeasonId;
  name: string;
  code: string;
  /** El cupón existe y está activo. */
  couponActive: boolean;
  uses: number;
  orders: number;
  /** Pesos descontados en esos pedidos. */
  discount: number;
  /** Total cobrado en esos pedidos. */
  revenue: number;
  /** Ticket promedio de los pedidos con el cupón (0 sin pedidos). */
  avgTicket: number;
}

export function couponOrders(orders: AdminOrder[], code: string): AdminOrder[] {
  return orders.filter((o) => o.coupon?.code === code && o.status !== "CANCELLED");
}

export function campaignResult(theme: SeasonalTheme, coupons: Coupon[], orders: AdminOrder[]): CampaignResult {
  const coupon = coupons.find((c) => c.code === theme.couponCode);
  const list = couponOrders(orders, theme.couponCode);
  const discount = list.reduce((s, o) => s + (o.coupon?.discount ?? 0), 0);
  const revenue = list.reduce((s, o) => s + o.total, 0);
  return {
    id: theme.id, name: theme.name, code: theme.couponCode, couponActive: Boolean(coupon && coupon.active !== false),
    uses: Math.max(coupon?.usedCount ?? 0, list.length), orders: list.length, discount, revenue,
    avgTicket: list.length ? Math.round(revenue / list.length) : 0,
  };
}

export function campaignResults(themes: SeasonalTheme[], coupons: Coupon[], orders: AdminOrder[]): CampaignResult[] {
  return themes.map((t) => campaignResult(t, coupons, orders));
}

/** Totales de la tabla (pie): usos, pedidos, descuento y ventas. */
export function resultsTotals(rows: CampaignResult[]): Pick<CampaignResult, "uses" | "orders" | "discount" | "revenue"> {
  return rows.reduce((t, r) => ({ uses: t.uses + r.uses, orders: t.orders + r.orders, discount: t.discount + r.discount, revenue: t.revenue + r.revenue }), { uses: 0, orders: 0, discount: 0, revenue: 0 });
}

/**
 * El checkout de la demo confirma el pedido y después suma el uso del cupón: el último pedido de la tienda queda con
 * el cupón y el descuento que le hizo (calculado con los precios del momento, como en el carrito).
 */
export function withShopOrderCoupon(orders: AdminOrder[], coupon: Coupon | undefined): AdminOrder[] {
  const last = orders.find((o) => o.fromShop);
  if (!coupon || !last || last.coupon) return orders;
  const discount = quoteCart(last.lines, { coupon, fulfillment: last.fulfillment, paymentMethod: last.paymentMethod }).couponDiscount;
  return orders.map((o) => (o === last ? { ...o, coupon: { code: coupon.code, discount } } : o));
}
