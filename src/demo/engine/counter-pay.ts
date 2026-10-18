import { DEFAULT_COUNTER_PLANS, type InstallmentPlan } from "../fixtures/counter";
import { formatARS } from "@/lib/money";

/**
 * Cobro del mostrador (R4b): efectivo con vuelto, transferencia, débito, crédito en 1 pago y crédito en cuotas con
 * recargo. Todo en pesos enteros. Las cuotas son iguales: la cuota se redondea hacia arriba al peso y el total es
 * cuota × cantidad (a lo sumo unos pesos más que el % exacto, nunca menos). Puro y testeado.
 */
export type CounterMethod = "CASH" | "TRANSFER" | "DEBIT" | "CREDIT";

export const COUNTER_METHODS: CounterMethod[] = ["CASH", "TRANSFER", "DEBIT", "CREDIT"];
export const METHOD_LABEL: Record<CounterMethod, string> = { CASH: "Efectivo", TRANSFER: "Transferencia", DEBIT: "Débito", CREDIT: "Crédito" };

export interface PayChoice {
  method: CounterMethod;
  /** Cuotas con crédito (1 = un pago). */
  installments?: number;
  /** Efectivo: con cuánto paga el cliente. Sin dato, pagó justo. */
  received?: number;
}

export interface Charge {
  method: CounterMethod;
  installments: number;
  /** Recargo de la financiación en % (0 sin cuotas). */
  pct: number;
  /** Total del ticket antes del recargo. */
  base: number;
  surcharge: number;
  /** Lo que se cobra. */
  total: number;
  /** Valor de cada cuota (igual al total en un pago). */
  installment: number;
  received?: number;
  change?: number;
}

/** Cuotas iguales en pesos enteros con su recargo. Cuenta en enteros (el % con hasta dos decimales). */
export function installmentCharge(base: number, plan: InstallmentPlan): { installment: number; total: number; surcharge: number } {
  const count = Math.max(1, Math.floor(plan.count));
  const pct100 = Math.round(Math.max(0, plan.pct) * 100);
  const installment = Math.ceil((base * (10_000 + pct100)) / (10_000 * count));
  const total = installment * count;
  return { installment, total, surcharge: total - base };
}

/** Planes vigentes: los de los ajustes que sean válidos (de 2 a 24 cuotas, recargo de 0 a 100 %) o los de muestra. */
export function counterPlans(saved?: readonly InstallmentPlan[] | null): InstallmentPlan[] {
  const valid = (saved ?? []).filter((p) => Number.isInteger(p.count) && p.count >= 2 && p.count <= 24 && p.pct >= 0 && p.pct <= 100);
  return [...(valid.length ? valid : DEFAULT_COUNTER_PLANS)].sort((a, b) => a.count - b.count);
}

/** Vuelto: lo recibido menos el total; si no alcanza, cuánto falta. */
export function cashChange(total: number, received: number): { change: number; missing: number } {
  const r = Math.round(received);
  return r >= total ? { change: r - total, missing: 0 } : { change: 0, missing: total - r };
}

/** Con qué suele pagar el cliente: justo y redondeado a $1.000, $10.000, $20.000 o $50.000 (los primeros cuatro distintos). */
export function cashSuggestions(total: number): number[] {
  if (total <= 0) return [];
  const up = (step: number) => Math.ceil(total / step) * step;
  return [...new Set([total, up(1_000), up(10_000), up(20_000), up(50_000), up(100_000)])].slice(0, 4);
}

/** Lo que se cobra con el medio elegido, o el motivo por el que no se puede. */
export function chargeFor(base: number, choice: PayChoice, plans: readonly InstallmentPlan[]): Charge | { error: string } {
  if (base <= 0) return { error: "El ticket está vacío." };
  const count = choice.method === "CREDIT" ? Math.max(1, Math.floor(choice.installments ?? 1)) : 1;
  let charge: Charge = { method: choice.method, installments: count, pct: 0, base, surcharge: 0, total: base, installment: base };
  if (count > 1) {
    const plan = plans.find((p) => p.count === count);
    if (!plan) return { error: `El mostrador no tiene un plan de ${count} cuotas.` };
    charge = { ...charge, ...installmentCharge(base, plan), pct: plan.pct };
  }
  if (choice.method !== "CASH") return charge;
  const received = Math.round(choice.received ?? charge.total);
  const { change, missing } = cashChange(charge.total, received);
  if (missing > 0) return { error: `Con ${formatARS(received)} no alcanza: faltan ${formatARS(missing)}.` };
  return { ...charge, received, change };
}

/** Un botón por forma de cobro: efectivo, transferencia, débito, crédito en 1 pago y cada plan de cuotas. */
export interface PayOption {
  id: string;
  method: CounterMethod;
  installments: number;
  label: string;
  hint: string;
}

export function payOptions(plans: readonly InstallmentPlan[]): PayOption[] {
  return [
    { id: "cash", method: "CASH", installments: 1, label: "Efectivo", hint: "Con vuelto" },
    { id: "transfer", method: "TRANSFER", installments: 1, label: "Transferencia", hint: "Al ver el ingreso" },
    { id: "debit", method: "DEBIT", installments: 1, label: "Débito", hint: "Sin recargo" },
    { id: "credit-1", method: "CREDIT", installments: 1, label: "Crédito 1 pago", hint: "Sin recargo" },
    ...plans.map((p): PayOption => ({ id: `credit-${p.count}`, method: "CREDIT", installments: p.count, label: `${p.count} cuotas`, hint: `Recargo ${p.pct} %` })),
  ];
}

/** "Efectivo", "Crédito 1 pago" o "Crédito 3 cuotas". */
export function chargeLabel(c: Pick<Charge, "method" | "installments">): string {
  if (c.method !== "CREDIT") return METHOD_LABEL[c.method];
  return c.installments > 1 ? `Crédito ${c.installments} cuotas` : "Crédito 1 pago";
}
