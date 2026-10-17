import { toDayKey } from "@/lib/date";

/**
 * Calendario del Club: días AAAA-MM-DD en hora argentina, semanas de lunes a domingo y meses. Puro (sin reloj): quien
 * llama pasa el día de hoy, así los tests y la demo son deterministas.
 */
const DAY_MS = 86_400_000;
const at = (day: string) => Date.parse(`${day}T12:00:00Z`);
const key = (ms: number) => new Date(ms).toISOString().slice(0, 10);

/** Hoy en hora argentina. */
export const clubToday = (now: Date) => toDayKey(now.toISOString());

/** Lunes de la semana del día (las semanas del Club arrancan el lunes). */
export function weekStart(day: string): string {
  const ms = at(day);
  const weekday = (new Date(ms).getUTCDay() + 6) % 7; // 0 = lunes
  return key(ms - weekday * DAY_MS);
}

/** Clave de la semana: el lunes en que arranca ("sem-2026-10-12"). */
export const weekKey = (day: string) => `sem-${weekStart(day)}`;

/** Clave del mes ("2026-10"). */
export const monthKey = (day: string) => day.slice(0, 7);

/** Los 7 días de la semana del día, de lunes a domingo. */
export function weekDays(day: string): string[] {
  const start = at(weekStart(day));
  return Array.from({ length: 7 }, (_, i) => key(start + i * DAY_MS));
}

/** Si un momento ISO cae en la misma semana (o el mismo mes) que el día de hoy. */
export const sameWeek = (iso: string, today: string) => weekStart(toDayKey(iso)) === weekStart(today);
export const sameMonth = (iso: string, today: string) => monthKey(toDayKey(iso)) === monthKey(today);
