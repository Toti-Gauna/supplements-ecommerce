import { calendarOf, canReschedule, CAPACITY_STATUSES, loadByDay, type ScheduledOrder } from "../../engine/delivery";
import { closureFor } from "../../engine/workdays";
import { AR_HOLIDAYS, type CalendarEvent, type CalendarEventKind, type Closure, type WorkshopSettings } from "../../fixtures/workshop";

/**
 * Días del taller (Polish 8.3.14 y 8.3.15): qué entregas toca un cambio de capacidad o de días cerrados, los feriados
 * cargados separados de los cierres propios, y la validación de las entradas del calendario. Ningún cambio mueve
 * pedidos: los que quedan en un día cerrado o sobrecargado se avisan para reprogramarlos.
 */

export interface ScheduleImpact {
  /** Pedidos por entregar que quedarían en un día cerrado. */
  closed: { code: string; day: string; reason: string }[];
  /** Días que quedarían con más pedidos que la capacidad. */
  overloaded: { day: string; used: number; capacity: number }[];
}

/** Lo que cambia para las entregas ya comprometidas (desde hoy) al pasar de `prev` a `next`. */
export function scheduleImpact(orders: ScheduledOrder[], prev: WorkshopSettings, next: WorkshopSettings, today: string): ScheduleImpact {
  const before = calendarOf(prev), after = calendarOf(next);
  const closed = orders
    .filter((o) => o.promisedDate && o.promisedDate >= today && canReschedule(o.status) && (CAPACITY_STATUSES.includes(o.status) || o.status === "READY"))
    .flatMap((o) => {
      const now = closureFor(o.promisedDate!, after);
      return now && !closureFor(o.promisedDate!, before) ? [{ code: o.code, day: o.promisedDate!, reason: now.reason }] : [];
    });
  const overloaded = [...loadByDay(orders)]
    .filter(([day, used]) => day >= today && used > next.dailyCapacity && used <= prev.dailyCapacity && !closureFor(day, after))
    .map(([day, used]) => ({ day, used, capacity: next.dailyCapacity }))
    .sort((a, b) => a.day.localeCompare(b.day));
  return { closed, overloaded };
}

export const hasImpact = (i: ScheduleImpact) => i.closed.length + i.overloaded.length > 0;

/** Un feriado cargado de fábrica, cerrado o con el taller trabajando (se quitó de los días cerrados). */
export interface HolidayRow extends Closure { closed: boolean; past: boolean }

const HOLIDAY_DATES = new Set(AR_HOLIDAYS.map((h) => h.date));

export function holidayRows(settings: WorkshopSettings, today: string): HolidayRow[] {
  const closedDates = new Set(settings.closures.map((c) => c.date));
  return [...AR_HOLIDAYS].sort((a, b) => a.date.localeCompare(b.date)).map((h) => ({ ...h, closed: closedDates.has(h.date), past: h.date < today }));
}

/** Cierres que agregó el taller (vacaciones, ferias, días no laborables nuevos): todo lo que no es un feriado cargado. */
export function ownClosures(settings: WorkshopSettings): Closure[] {
  return settings.closures.filter((c) => !HOLIDAY_DATES.has(c.date)).sort((a, b) => a.date.localeCompare(b.date));
}

export const isPresetHolidayDate = (date: string) => HOLIDAY_DATES.has(date);

/** Filtro de año de la lista de días cerrados: "proximos" (desde hoy), "todos" o un año. */
export function byYear<T extends { date: string }>(rows: T[], year: string, today: string): T[] {
  if (year === "proximos") return rows.filter((r) => r.date >= today);
  if (year === "todos") return rows;
  return rows.filter((r) => r.date.startsWith(year));
}

export const EVENT_KIND_LABEL: Record<CalendarEventKind, string> = { tarea: "Tarea o recordatorio", pedido: "Nota de un pedido" };

export interface EventDraft { title: string; kind: CalendarEventKind | "cierre"; date: string; notes: string; orderCode: string }

export const eventDraft = (day: string, e?: CalendarEvent): EventDraft =>
  ({ title: e?.title ?? "", kind: e?.kind ?? "tarea", date: e?.date ?? day, notes: e?.notes ?? "", orderCode: e?.orderCode ?? "" });

/** Valida una entrada del día. Un cierre no puede quedar en el pasado; una nota de pedido necesita su pedido. */
export function checkEvent(d: EventDraft, today: string, orderCodes: string[]): Record<string, string> {
  const errors: Record<string, string> = {};
  const title = d.title.trim();
  if (title.length < 2) errors.title = d.kind === "cierre" ? "Escribí el motivo del cierre." : "Escribí un título (2 letras o más).";
  else if (title.length > 80) errors.title = "Máximo 80 caracteres.";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d.date)) errors.date = "Elegí una fecha.";
  else if (d.kind === "cierre" && d.date < today) errors.date = "Un cierre no puede quedar en una fecha que ya pasó.";
  if (d.kind === "pedido" && !orderCodes.includes(d.orderCode)) errors.orderCode = "Elegí el pedido.";
  if (d.notes.length > 500) errors.notes = "Máximo 500 caracteres.";
  return errors;
}
