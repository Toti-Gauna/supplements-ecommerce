import { COUNTER_METHODS, type CounterMethod } from "./counter-pay";
import type { CounterSale } from "./counter-sale";
import { formatARS } from "@/lib/money";

/**
 * "Cerrar el día" del mostrador (R4b): lo cobrado por medio de pago, los recargos de las cuotas, los tickets y la caja
 * que tiene que haber en efectivo (fondo con el que abrió + efectivo cobrado; el vuelto ya salió de lo recibido).
 * Cerrar marca las ventas incluidas: las que vengan después van al próximo cierre. Puro y testeado.
 */
export type MethodTotals = Record<CounterMethod, number>;

export interface DaySummary {
  day: string;
  /** Ventas del día que todavía no entraron en un cierre, la más nueva primero. */
  sales: CounterSale[];
  tickets: number;
  units: number;
  /** Total cobrado, con recargos. */
  total: number;
  byMethod: MethodTotals;
  /** Recargos de las cuotas cobrados. */
  surcharges: number;
  /** Ventas en cuotas. */
  installmentSales: number;
  float: number;
  /** Lo que tiene que haber en la caja: fondo + efectivo. */
  cashExpected: number;
}

const zero = (): MethodTotals => Object.fromEntries(COUNTER_METHODS.map((m) => [m, 0])) as MethodTotals;

export function openSales(sales: readonly CounterSale[], day: string): CounterSale[] {
  return sales.filter((s) => s.day === day && !s.closedAt).sort((a, b) => b.at.localeCompare(a.at));
}

export function daySummary(sales: readonly CounterSale[], day: string, float: number): DaySummary {
  const open = openSales(sales, day);
  const byMethod = zero();
  for (const s of open) byMethod[s.method] += s.total;
  const safeFloat = Math.max(0, Math.round(float));
  return {
    day, sales: open, tickets: open.length,
    units: open.reduce((n, s) => n + s.lines.reduce((u, l) => u + l.qty, 0), 0),
    total: open.reduce((n, s) => n + s.total, 0),
    byMethod,
    surcharges: open.reduce((n, s) => n + s.surcharge, 0),
    installmentSales: open.filter((s) => s.installments > 1).length,
    float: safeFloat,
    cashExpected: safeFloat + byMethod.CASH,
  };
}

export interface CounterClosure {
  id: string;
  day: string;
  at: string;
  tickets: number;
  units: number;
  total: number;
  byMethod: MethodTotals;
  surcharges: number;
  float: number;
  cashExpected: number;
  /** Efectivo contado al cerrar (si se contó). */
  counted: number | null;
  /** Contado − esperado: positivo sobra, negativo falta. */
  difference: number | null;
  saleIds: string[];
}

export type CloseResult = { ok: true; closure: CounterClosure; sales: CounterSale[] } | { ok: false; error: string };

export function closeDay(sales: readonly CounterSale[], day: string, float: number, counted: number | null, at: string): CloseResult {
  const sum = daySummary(sales, day, float);
  if (!sum.tickets) return { ok: false, error: "No hay ventas abiertas para cerrar." };
  const cash = counted === null || !Number.isFinite(counted) ? null : Math.max(0, Math.round(counted));
  const ids = new Set(sum.sales.map((s) => s.id));
  const closure: CounterClosure = {
    id: `C-${day}-${at}`, day, at, tickets: sum.tickets, units: sum.units, total: sum.total, byMethod: sum.byMethod, surcharges: sum.surcharges,
    float: sum.float, cashExpected: sum.cashExpected, counted: cash, difference: cash === null ? null : cash - sum.cashExpected, saleIds: [...ids],
  };
  return { ok: true, closure, sales: sales.map((s) => (ids.has(s.id) ? { ...s, closedAt: at } : s)) };
}

/** "La caja da justo", "Sobran $500" o "Faltan $1.200". */
export function differenceText(difference: number): string {
  if (difference === 0) return "La caja da justo";
  return `${difference > 0 ? "Sobran" : "Faltan"} ${formatARS(Math.abs(difference))}`;
}
