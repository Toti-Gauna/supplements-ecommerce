import { expiringLots, type LotRow } from "../admin/lots";
import { levelRows, nextDelivery, suggestedPurchases } from "../admin/workshop/purchasing";
import { formatDay } from "@/lib/date";
import { formatARS } from "@/lib/money";
import { plural } from "@/lib/plural";
import { clearancePrice, formatExpiry } from "./lots";
import type { TodayAction, TodaySnapshot } from "./today";
import { addDays } from "./workdays";

/**
 * Lotes y compras en la lista de hoy (R4a). Reglas:
 * - Lote vencido con unidades (y sin liquidar) → "Atrasado": sacarlo de la venta.
 * - Lote que vence en 30 días o menos, sin liquidar → "Esta semana", uno por lote, con el descuento propuesto
 *   (`suggestedClearance`) y el botón que abre la liquidación. Liquidarlo lo saca de la lista.
 * - Los demás lotes que vencen en 60 días → una fila "Más adelante" que lleva al filtro de vencimientos.
 * - Compra sugerida a proveedores → una fila: "Para hoy" si alguna variante está sin stock (se pierden ventas);
 *   si no, "Esta semana". Mercadería pedida que llega hoy (o ya debía llegar) → "Para hoy", para recibirla.
 */
export const EXPIRING_HREF = "/admin-demo/productos/?ver=variantes&vence=pronto";
export const PURCHASING_HREF = "/admin-demo/proveedores/";
export const LOT_ROW_DAYS = 30;
const short = (day: string) => formatDay(day).replace(",", "");

/** Descuento propuesto según lo que falta para vencer: más cerca, más fuerte. */
export function suggestedClearance(days: number): number {
  if (days <= 15) return 40;
  return days <= LOT_ROW_DAYS ? 30 : 20;
}

const lotName = (r: LotRow) => `${r.productName} · ${r.variantLabel}`;

export function lotActions(snap: TodaySnapshot, today: string): TodayAction[] {
  const rows = expiringLots(snap.data.products, today).filter((r) => !r.lot.clearancePct);
  const near = rows.filter((r) => r.days <= LOT_ROW_DAYS);
  const rest = rows.filter((r) => r.days > LOT_ROW_DAYS);
  const out: TodayAction[] = near.map((r) => {
    if (r.days < 0) {
      return {
        id: `lot:${r.key}`, kind: "lot", tier: "atrasado", due: today, title: `Sacá de la venta el lote ${r.lot.code}`,
        detail: `${lotName(r)} · venció en ${formatExpiry(r.lot.expires)} · ${r.lot.units} u. No se puede vender vencido.`,
        metric: { value: r.lot.units, unit: "u." }, href: EXPIRING_HREF, cta: { type: "link", label: "Ver el lote", href: EXPIRING_HREF },
      };
    }
    const pct = suggestedClearance(r.days);
    return {
      id: `lot:${r.key}`, kind: "lot", tier: "semana", due: addDays(today, r.days), title: `Liquidá el lote ${r.lot.code}`,
      detail: `${lotName(r)} · vence en ${plural(r.days, "día", "días")} · ${r.lot.units} u. Propuesta: −${pct} % (${formatARS(clearancePrice(r.listPrice, pct))}) para que salga antes.`,
      metric: { value: r.days, unit: r.days === 1 ? "día" : "días" }, href: EXPIRING_HREF,
      cta: { type: "clearance", label: `Liquidar −${pct} %`, lotKey: r.key, pct },
    };
  });
  if (rest.length) {
    const first = rest[0]!;
    out.push({
      id: "lots:rest", kind: "lots", tier: "despues", due: addDays(today, first.days),
      title: `${plural(rest.length, "lote vence", "lotes vencen")} en menos de 60 días`,
      detail: `El primero: ${lotName(first)} (${first.lot.code}, en ${first.days} días). Sumalos a un combo o liquidalos a tiempo.`,
      metric: { value: rest.length }, href: EXPIRING_HREF, cta: { type: "link", label: "Ver los lotes", href: EXPIRING_HREF },
    });
  }
  return out;
}

export function purchaseActions(snap: TodaySnapshot, today: string): TodayAction[] {
  const { suppliers, stockLevels, purchases, recipes, settings } = snap.workshop;
  const products = snap.data.products;
  const out: TodayAction[] = purchases.filter((p) => p.status === "ordered" && p.expectedOn && p.expectedOn <= today).map((p) => ({
    id: `receive:${p.id}`, kind: "purchase", tier: "hoy", due: p.expectedOn!,
    title: `Recibí la mercadería de ${suppliers.find((s) => s.id === p.supplierId)?.name ?? "tu proveedor"}`,
    detail: `${plural(p.lines.length, "producto", "productos")} · ${formatARS(p.total)} al costo. Al marcarla recibida suma al stock.`,
    metric: { value: p.lines.length }, href: PURCHASING_HREF, cta: { type: "link", label: "Recibir", href: PURCHASING_HREF },
  }));
  const groups = suggestedPurchases(levelRows(products, suppliers, stockLevels, purchases), products, recipes).filter((g) => g.supplier);
  if (!groups.length) return out;
  const soldOut = groups.reduce((n, g) => n + g.lines.filter((l) => l.stock === 0).length, 0);
  const next = groups.map((g) => ({ g, day: nextDelivery(g.supplier!, today, settings.closures) ?? addDays(today, 30) })).sort((a, b) => a.day.localeCompare(b.day))[0]!;
  const total = groups.reduce((s, g) => s + g.total, 0);
  out.push({
    id: "purchase:suggested", kind: "purchase", tier: soldOut ? "hoy" : "semana", due: next.day,
    title: `Pedí a ${plural(groups.length, "proveedor", "proveedores")}`,
    detail: `${soldOut ? `${plural(soldOut, "variante sin stock", "variantes sin stock")} · ` : ""}${formatARS(total)} al costo. ${next.g.supplier!.name} reparte el ${short(next.day)}: pedile hoy.`,
    metric: { value: groups.length }, href: PURCHASING_HREF, cta: { type: "link", label: "Armar los pedidos", href: PURCHASING_HREF },
  });
  return out;
}
