import { withStock } from "../admin/lots";
import type { InstallmentPlan } from "../fixtures/counter";
import type { Product } from "../types";
import type { CounterLine, LotTake } from "./counter";
import { buildTicket } from "./counter-ticket";
import { chargeFor, type Charge, type PayChoice } from "./counter-pay";
import type { StackRule } from "./stack";

/**
 * Venta del mostrador (simulada, R4b): valida el stock, cobra con el medio elegido y descuenta cada pote del lote que
 * vence primero (FEFO, con la misma regla que el resto del panel: `withStock`). Puro: devuelve el catálogo nuevo y la
 * venta para el historial del día; el store solo los guarda.
 */
export interface SaleLine {
  productSlug: string;
  variantId: string;
  productName: string;
  variantLabel: string;
  qty: number;
  unitPrice: number;
  total: number;
  /** Lotes de los que salió (FEFO). */
  lots: LotTake[];
}

export interface CounterSale extends Charge {
  id: string;
  /** Número de ticket del día ("0003"). */
  number: string;
  /** Día de la demo (AAAA-MM-DD). */
  day: string;
  at: string;
  lines: SaleLine[];
  subtotal: number;
  stackDiscount: number;
  /** Cuándo entró en un cierre del día. Sin dato: sigue abierta. */
  closedAt?: string;
}

export function nextTicketNumber(sales: readonly CounterSale[], day: string): string {
  const last = Math.max(0, ...sales.filter((s) => s.day === day).map((s) => Number(s.number) || 0));
  return String(last + 1).padStart(4, "0");
}

export interface SaleInput {
  products: readonly Product[];
  lines: readonly CounterLine[];
  rule: StackRule;
  pay: PayChoice;
  plans: readonly InstallmentPlan[];
  /** Ventas ya registradas (para el número de ticket). */
  sales: readonly CounterSale[];
  day: string;
  at: string;
}

export type SaleResult = { ok: true; sale: CounterSale; products: Product[] } | { ok: false; error: string };

export function registerSale(input: SaleInput): SaleResult {
  const ticket = buildTicket(input.lines, input.products, input.rule);
  if (!ticket.rows.length) return { ok: false, error: "El ticket está vacío." };
  const short = ticket.rows.find((r) => r.short > 0);
  if (short) return { ok: false, error: `De ${short.productName} (${short.variantLabel}) quedan ${short.line.qty - short.short}: bajá la cantidad del ticket.` };
  const charge = chargeFor(ticket.total, input.pay, input.plans);
  if ("error" in charge) return { ok: false, error: charge.error };
  const sold = new Map<string, number>();
  for (const r of ticket.rows) sold.set(r.key, (sold.get(r.key) ?? 0) + r.line.qty);
  const products = input.products.map((p) => (!ticket.rows.some((r) => r.line.productSlug === p.slug) ? p : {
    ...p,
    variants: p.variants.map((v) => {
      const qty = sold.get(`${p.slug}::${v.id}`) ?? 0;
      return qty > 0 && v.stock >= 0 ? withStock(v, v.stock - qty) : v;
    }),
  }));
  const number = nextTicketNumber(input.sales, input.day);
  const sale: CounterSale = {
    ...charge, id: `M-${input.day}-${number}`, number, day: input.day, at: input.at, subtotal: ticket.subtotal, stackDiscount: ticket.stack.discount,
    lines: ticket.rows.map((r) => ({ productSlug: r.line.productSlug, variantId: r.line.variantId, productName: r.productName, variantLabel: r.variantLabel, qty: r.line.qty, unitPrice: r.unitPrice, total: r.total, lots: r.lots })),
  };
  return { ok: true, sale, products };
}
