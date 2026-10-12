import type { WorkshopSettings } from "../fixtures/workshop";
import type { OrderStatus } from "./orders";
import { addWorkdays, closureFor } from "./workdays";
import { calendarOf, loadByDay, orderLeadDays, takesCadeteSlot, type ScheduledOrder } from "./delivery";

/* Reprogramar un despacho (Fase 7): qué días acepta un pedido y qué avisos da (cadete sobrecargado, antes del plazo). */

/** Resultado de validar una fecha nueva. */
export interface RescheduleCheck {
  ok: boolean;
  error?: string;
  warnings: string[];
  /** El cadete ya estaba completo ese día: mover el pedido lo sobrecarga. */
  overload?: boolean;
  /** Por qué no se puede: para marcar el día mientras se arrastra. */
  blocked?: "fixed" | "past" | "closed" | "full";
}

/** Lo que ya salió o se cerró no se reprograma. */
export const FIXED_DATE_STATUSES: OrderStatus[] = ["SHIPPED", "DELIVERED", "CANCELLED", "RETURNED", "IN_CLAIM"];

export function canReschedule(status: OrderStatus): boolean {
  return !FIXED_DATE_STATUSES.includes(status);
}

/** Motivo para no despachar un día cerrado: un feriado o cierre lo dice; un día de la semana sin despachos pide otro. */
const closedError = (c: { reason: string; closure?: unknown }) => (c.closure ? `${c.reason}: no se despacha ese día.` : `${c.reason}: elegí otro día.`);

/** Valida mover un pedido a otro día: nunca a un día pasado ni cerrado; avisa si el cadete queda sobrecargado o si es antes del plazo. */
export function checkReschedule(order: ScheduledOrder, day: string, today: string, orders: ScheduledOrder[], settings: WorkshopSettings): RescheduleCheck {
  if (!canReschedule(order.status)) return { ok: false, error: "Este pedido ya salió o está cerrado: su fecha no se reprograma.", warnings: [], blocked: "fixed" };
  if (day < today) return { ok: false, error: "No se puede comprometer una fecha que ya pasó.", warnings: [], blocked: "past" };
  const closed = closureFor(day, calendarOf(settings));
  if (closed) return { ok: false, error: closedError(closed), warnings: [], blocked: "closed" };
  const warnings: string[] = [];
  const taken = loadByDay(orders, order.code).get(day) ?? 0;
  const overload = takesCadeteSlot(order) && taken >= settings.dailyCapacity && order.promisedDate !== day;
  if (overload) warnings.push(`El cadete ya tenía ${taken} de ${settings.dailyCapacity} pedidos ese día: queda sobrecargado.`);
  if (["PENDING_PAYMENT", "PAYMENT_REVIEW", "PAID"].includes(order.status)) {
    const lead = orderLeadDays(order.lines);
    if (day < addWorkdays(today, lead, calendarOf(settings))) warnings.push(`Queda antes del plazo de preparación (${lead} ${lead === 1 ? "día hábil" : "días hábiles"}).`);
  }
  return { ok: true, warnings, overload };
}

/**
 * Soltar un pedido arrastrado: además de las reglas de `checkReschedule`, un día con el cadete completo lo rechaza con
 * el motivo. Sobrecargar un día queda para "Reprogramar", donde se confirma a propósito.
 */
export function checkDrop(order: ScheduledOrder, day: string, today: string, orders: ScheduledOrder[], settings: WorkshopSettings): RescheduleCheck {
  const r = checkReschedule(order, day, today, orders, settings);
  if (!r.ok || !r.overload) return r;
  const taken = loadByDay(orders, order.code).get(day) ?? 0;
  return { ok: false, error: `El cadete ya tiene ese día completo (${taken} de ${settings.dailyCapacity} pedidos). Para sobrecargarlo, usá Reprogramar.`, warnings: [], blocked: "full" };
}
