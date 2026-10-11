import type { Closure } from "../fixtures/workshop";

/**
 * Días hábiles del taller sobre fechas AAAA-MM-DD (sin horas ni zona horaria: un día es un día).
 * Cerrado = día de la semana sin trabajo, feriado, día no laborable o cierre propio.
 */
export interface WorkCalendar {
  closedWeekdays: number[];
  closures: Closure[];
}

const WEEKDAY = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];

const toUtc = (day: string) => new Date(`${day}T00:00:00Z`);
const fromUtc = (d: Date) => d.toISOString().slice(0, 10);

export function addDays(day: string, n: number): string {
  const d = toUtc(day);
  d.setUTCDate(d.getUTCDate() + n);
  return fromUtc(d);
}

export function weekday(day: string): number {
  return toUtc(day).getUTCDay();
}

export function daysBetween(from: string, to: string): number {
  return Math.round((toUtc(to).getTime() - toUtc(from).getTime()) / 86_400_000);
}

/** Motivo por el que el taller no trabaja ese día, o null si es hábil. */
export function closureFor(day: string, cal: WorkCalendar): { reason: string; closure?: Closure } | null {
  const closure = cal.closures.find((c) => c.date === day);
  if (closure) return { reason: closure.name, closure };
  const wd = weekday(day);
  return cal.closedWeekdays.includes(wd) ? { reason: `${WEEKDAY[wd]![0]!.toUpperCase()}${WEEKDAY[wd]!.slice(1)} sin taller` } : null;
}

export function isWorkday(day: string, cal: WorkCalendar): boolean {
  return closureFor(day, cal) === null;
}

/** Un calendario que no deja ningún día hábil se corta a los dos años para no colgarse. */
const MAX_SCAN = 730;

export function nextWorkday(day: string, cal: WorkCalendar, includeSelf = false): string {
  let d = includeSelf ? day : addDays(day, 1);
  for (let i = 0; i < MAX_SCAN && !isWorkday(d, cal); i++) d = addDays(d, 1);
  return d;
}

export function prevWorkday(day: string, cal: WorkCalendar): string {
  let d = addDays(day, -1);
  for (let i = 0; i < MAX_SCAN && !isWorkday(d, cal); i++) d = addDays(d, -1);
  return d;
}

/** Suma días hábiles: 0 = ese mismo día si es hábil (si no, el próximo hábil). */
export function addWorkdays(day: string, n: number, cal: WorkCalendar): string {
  let d = nextWorkday(day, cal, n === 0);
  for (let i = 1; i < n; i++) d = nextWorkday(d, cal);
  return d;
}

/** Días hábiles desde `from` (excluido) hasta `to` (incluido). Negativo si `to` es anterior. */
export function workdaysBetween(from: string, to: string, cal: WorkCalendar): number {
  if (to === from) return 0;
  const sign = to > from ? 1 : -1;
  let count = 0;
  for (let d = from; d !== to && Math.abs(count) < MAX_SCAN;) {
    d = addDays(d, sign);
    if (isWorkday(d, cal)) count += sign;
  }
  return count;
}

/** Lunes de la semana del día. */
export function startOfWeek(day: string): string {
  return addDays(day, -((weekday(day) + 6) % 7));
}

export function weekOf(day: string): string[] {
  const monday = startOfWeek(day);
  return Array.from({ length: 7 }, (_, i) => addDays(monday, i));
}

/** Semanas (lunes a domingo) que cubren el mes de `day`, para la vista mensual. */
export function monthGrid(day: string): string[][] {
  const first = `${day.slice(0, 7)}-01`;
  const last = addDays(addMonths(first, 1), -1);
  const weeks: string[][] = [];
  for (let monday = startOfWeek(first); monday <= last; monday = addDays(monday, 7)) weeks.push(weekOf(monday));
  return weeks;
}

export function addMonths(day: string, n: number): string {
  const [y, m] = day.split("-").map(Number) as [number, number];
  const total = y * 12 + (m - 1) + n;
  return `${Math.floor(total / 12)}-${String((total % 12) + 1).padStart(2, "0")}-01`;
}
