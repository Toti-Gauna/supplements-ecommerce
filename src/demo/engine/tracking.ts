import type { OrderStatus } from "./orders";

/**
 * Seguimiento que ve el comprador (spec 5.2): las etapas en orden y cuándo llegó el pedido a cada una, desde su
 * historial de estados. Puro; en producción lo arma el servidor con el historial real.
 */
export const TRACKING_STAGES: OrderStatus[] = ["PENDING_PAYMENT", "PAYMENT_REVIEW", "PAID", "IN_PRODUCTION", "READY", "SHIPPED", "DELIVERED"];

/** Estado que se muestra: un reclamo sigue mostrando dónde estaba el pedido; cancelado o devuelto, el inicio. */
export function trackedStatus(status: OrderStatus, prevStatus?: OrderStatus | null): OrderStatus {
  const shown = status === "IN_CLAIM" && prevStatus ? prevStatus : status;
  return TRACKING_STAGES.includes(shown) ? shown : "PENDING_PAYMENT";
}

/**
 * Fecha (ISO) en que el pedido entró a cada etapa, en el orden de `TRACKING_STAGES`. Cuenta la última entrada a cada
 * estado y solo hasta la etapa actual: si un comprobante se rechazó y volvió a "pendiente", la revisión vieja no queda.
 */
export function stageDates(log: { at: string; to: OrderStatus }[], status: OrderStatus): (string | undefined)[] {
  const current = TRACKING_STAGES.indexOf(status);
  return TRACKING_STAGES.map((stage, i) => (i <= current ? log.filter((l) => l.to === stage).at(-1)?.at : undefined));
}

export interface CheckedLot {
  /** Código impreso en el envase ("VL-2609-W"); null si en el control se anotó sin lote cargado. */
  code: string | null;
  /** Vencimiento impreso ("11/2027"), si se anotó. */
  expires: string | null;
}

/**
 * Lote que el panel registró en el control de lote ("VL-2609-W · vence 11/2027", ver `admin/workshop/lots.ts`), listo
 * para mostrarle al comprador como etiqueta. El cliente lo ve recién cuando el pedido pasó por ese control.
 */
export function checkedLot(text: string | undefined): CheckedLot | null {
  if (!text?.trim()) return null;
  const [code, rest] = text.split(" · vence ");
  const clean = code!.trim();
  if (!/^[A-Z0-9][A-Z0-9-]{2,}$/i.test(clean)) return { code: null, expires: null };
  return { code: clean, expires: rest?.trim() || null };
}
