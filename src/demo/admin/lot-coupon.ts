import { expiryDate } from "../engine/lots";
import { addDays } from "../engine/workdays";
import { isPaidOrLater } from "../engine/orders";
import { LOT_COUPON_DAYS, LOT_COUPON_PCT } from "../fixtures/lot-combos";
import type { Coupon } from "../types";
import { customerRows } from "./customers";
import type { LotRow } from "./lots";
import { customerWhatsappLink, dayText } from "./repurchase-text";
import type { AdminOrder, AdminUser } from "./types";
import { formatARS } from "@/lib/money";

/**
 * Cupón para quienes ya compraron el producto de un lote por vencer (R4c). Es un cupón real de Promos (código, % y
 * vigencia) y cada cliente recibe su mensaje de WhatsApp. El cupón vale por todo el carrito desde el precio de lista
 * del producto: no se puede limitar a un producto, así que se acota con el mínimo, los usos y la fecha.
 */
export const lotCouponCode = (lotCode: string) => `LOTE${lotCode.replace(/[^A-Za-z0-9]/g, "").toUpperCase()}`;

export function lotCoupon(lot: LotRow, today: string, pct = LOT_COUPON_PCT): Coupon {
  const endsAt = [addDays(today, LOT_COUPON_DAYS), expiryDate(lot.lot.expires)].sort()[0]!;
  return {
    code: lotCouponCode(lot.lot.code), type: "PERCENT", value: pct, minSubtotal: lot.listPrice, endsAt, active: true, maxUses: Math.max(1, lot.lot.units),
    description: `${pct} % para quienes ya compraron ${lot.productName} (lote que vence pronto)`,
  };
}

export interface LotBuyer { email: string; name: string; phone?: string; units: number }

/** Clientes con un pedido pagado de ese producto (cualquier presentación), sin los bloqueados, el que más compró primero. */
export function lotBuyers(users: AdminUser[], orders: AdminOrder[], productSlug: string): LotBuyer[] {
  return customerRows(users, orders).filter((c) => !c.blocked).flatMap((c) => {
    const units = c.orders.filter((o) => isPaidOrLater(o.status)).flatMap((o) => o.lines).filter((l) => l.productSlug === productSlug).reduce((n, l) => n + l.quantity, 0);
    return units > 0 ? [{ email: c.email, name: c.name, phone: c.phone, units }] : [];
  }).sort((a, b) => b.units - a.units || a.name.localeCompare(b.name, "es"));
}

const firstName = (name: string) => name.trim().split(/\s+/)[0] ?? name;

/** El mensaje: dice por qué hay descuento (unidades que vencen pronto), con el código, la vigencia y desde cuánto aplica. */
export function couponMessage(buyer: Pick<LotBuyer, "name">, coupon: Coupon, productName: string, store: string): string {
  return `¡Hola ${firstName(buyer.name)}! Te escribimos de ${store}. Tenemos unidades de ${productName} que vencen pronto y, como ya lo compraste, te dejamos ${coupon.value} % off con el código ${coupon.code}, hasta el ${dayText(coupon.endsAt!)}. Aplica desde ${formatARS(coupon.minSubtotal ?? 0)} de compra.`;
}

export const couponLink = (buyer: LotBuyer, coupon: Coupon, productName: string, store: string) => customerWhatsappLink(buyer.phone, couponMessage(buyer, coupon, productName, store));
