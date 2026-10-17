import type { WorkshopSettings } from "../fixtures/workshop";
import type { CartLine } from "./cart-types";
import { promiseFor, type ScheduledOrder } from "./delivery";
import { addDays } from "./workdays";

/**
 * Cuenta regresiva del cadete (R2): hasta cuándo vale la fecha que el calendario de despachos le promete hoy al carrito.
 * La promesa cuenta días hábiles desde el día del pedido, así que cambia a la medianoche (hora de Buenos Aires): si
 * mañana el mismo carrito llegaría más tarde, quedan las horas que faltan para que termine el día. Si la fecha no
 * cambia (un sábado que ya promete el martes), no hay apuro y no se muestra reloj.
 */
export interface CadeteClock {
  /** Día en que el cadete lo lleva si se pide hoy (AAAA-MM-DD). */
  day: string;
  /** Minutos que quedan para que ese día deje de valer; null si pedir mañana da la misma fecha. */
  minutesLeft: number | null;
}

/** Fin del día `today` en Buenos Aires (UTC−3, sin horario de verano), en ms. */
const endOfDay = (today: string) => Date.parse(`${addDays(today, 1)}T00:00:00-03:00`);

export function cadeteClock(lines: CartLine[], now: string, today: string, orders: ScheduledOrder[], settings: WorkshopSettings, exceptCode?: string): CadeteClock {
  const opts = { fulfillment: "LOCAL_DELIVERY" as const, exceptCode };
  const day = promiseFor(lines, today, orders, settings, opts).day;
  const tomorrow = promiseFor(lines, addDays(today, 1), orders, settings, opts).day;
  if (tomorrow <= day) return { day, minutesLeft: null };
  const left = Math.floor((endOfDay(today) - Date.parse(now)) / 60_000);
  return { day, minutesLeft: Math.max(0, left) };
}

/** "2 h 10 min", "45 min" o "menos de 1 min". */
export function countdownText(minutes: number): string {
  if (minutes < 1) return "menos de 1 min";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h ? `${h} h${m ? ` ${m} min` : ""}` : `${m} min`;
}
