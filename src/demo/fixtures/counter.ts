/**
 * Mostrador (R4b): valores de MUESTRA para la venta en el local. Los recargos de las cuotas se editan en el panel
 * (Ajustes → Medios de pago) y el fondo de caja en "Cierre del día". Nada de esto toca una cuenta real.
 */
export interface InstallmentPlan {
  /** Cantidad de cuotas con tarjeta de crédito. */
  count: number;
  /** Recargo sobre el total del ticket, en %. */
  pct: number;
}

/** Cuotas con recargo que acepta el mostrador. Crédito en 1 pago va sin recargo. */
export const DEFAULT_COUNTER_PLANS: InstallmentPlan[] = [
  { count: 3, pct: 12 },
  { count: 6, pct: 24 },
];

/** Fondo de caja con el que abre el día (cambio en billetes chicos). */
export const DEFAULT_COUNTER_FLOAT = 20_000;

/** Cuántas ventas de mostrador guarda el panel (las más nuevas). */
export const COUNTER_SALES_LIMIT = 200;
