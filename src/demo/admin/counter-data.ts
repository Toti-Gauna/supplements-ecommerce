import type { CounterClosure } from "../engine/counter-close";
import type { CounterSale } from "../engine/counter-sale";
import { DEFAULT_COUNTER_FLOAT, DEFAULT_COUNTER_PLANS } from "../fixtures/counter";
import type { AdminData } from "./defaults";

/** Mostrador (R4b): ventas en el local, cierres del día y fondo de caja. Solo en este navegador. */
export interface CounterData {
  /** Ventas registradas (simuladas), la más nueva primero. */
  sales: CounterSale[];
  /** Cierres del día, el más nuevo primero. */
  closures: CounterClosure[];
  /** Fondo de caja con el que abre el día. */
  float: number;
}

export const defaultCounterData = (): CounterData => ({ sales: [], closures: [], float: DEFAULT_COUNTER_FLOAT });

/** Lo guardado (o roto) con los campos que falten. */
export function normalizeCounter(saved: Partial<CounterData> | null | undefined): CounterData {
  const base = defaultCounterData();
  return {
    sales: Array.isArray(saved?.sales) ? saved.sales : base.sales,
    closures: Array.isArray(saved?.closures) ? saved.closures : base.closures,
    float: typeof saved?.float === "number" && saved.float >= 0 ? saved.float : base.float,
  };
}

/**
 * v19 (R4b): suma el mostrador vacío y los planes de cuotas de muestra en los ajustes, sin tocar nada de lo que el
 * dueño ya editó (si ya tiene planes, quedan los suyos).
 */
export function withCounterData(saved: Partial<AdminData>): Partial<AdminData> {
  const data = saved.data;
  const settings = data?.settings && !data.settings.counterPlans ? { ...data.settings, counterPlans: structuredClone(DEFAULT_COUNTER_PLANS) } : data?.settings;
  return { ...saved, counter: normalizeCounter(saved.counter), ...(data && settings ? { data: { ...data, settings } } : {}) };
}
