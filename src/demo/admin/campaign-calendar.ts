import type { SeasonalTheme, SeasonId } from "../types";

/**
 * Calendario anual de campañas (R3, Panel → Campañas). Las fechas se repiten cada año: solo cuentan mes y día, sobre un
 * año de 365 días (el 29 de febrero cuenta como el 28). Puro y testeado.
 */
const MONTH_DAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const MONTH_START = MONTH_DAYS.map((_, i) => MONTH_DAYS.slice(0, i).reduce((a, b) => a + b, 0));

/** Fechas del Hot Sale y el CyberMonday las organiza la CACE; Black Friday es la otra fecha fuerte del año. */
export const CACE_IDS: SeasonId[] = ["hot-sale", "cyber-monday"];
export type CampaignFlag = "cace" | "black-friday" | "sport" | null;

export function campaignFlag(t: Pick<SeasonalTheme, "id" | "sport">): CampaignFlag {
  if (CACE_IDS.includes(t.id)) return "cace";
  if (t.id === "black-friday") return "black-friday";
  return t.sport ? "sport" : null;
}

/** Día del año (1–365) de "AAAA-MM-DD". */
export function dayOfYear(day: string): number {
  const m = Number(day.slice(5, 7)) - 1, d = Math.min(Number(day.slice(8, 10)), MONTH_DAYS[m] ?? 31);
  return (MONTH_START[m] ?? 0) + d;
}

/** Tramos [desde, hasta] dentro del año; un rango que cruza el 31/12 se parte en dos. */
export function yearSpans(t: Pick<SeasonalTheme, "startsOn" | "endsOn">): [number, number][] {
  const a = dayOfYear(t.startsOn), b = dayOfYear(t.endsOn);
  return a <= b ? [[a, b]] : [[a, 365], [1, b]];
}

type Range = Pick<SeasonalTheme, "id" | "name" | "startsOn" | "endsOn">;

/** Campañas que comparten al menos un día con `t` (sin contarse a sí misma). */
export function overlapsWith<T extends Range>(t: Range, all: T[]): T[] {
  const mine = yearSpans(t);
  return all.filter((o) => o.id !== t.id && yearSpans(o).some(([c, d]) => mine.some(([a, b]) => a <= d && c <= b)));
}

/** Error claro de superposición para el editor, o null si las fechas están libres. */
export function overlapError(t: Range, all: Range[]): string | null {
  const hits = overlapsWith(t, all);
  if (!hits.length) return null;
  const names = hits.map((h) => h.name).join(" y ");
  return `Estas fechas se pisan con ${names}. Cada día puede tener una sola campaña: corré el inicio o el final.`;
}

export interface MonthBar {
  id: SeasonId;
  /** Día del mes en que arranca y termina dentro de este mes. */
  from: number;
  to: number;
  /** Posición en la pista del mes, en % (izquierda y ancho). */
  left: number;
  width: number;
  /** Este mes es el del inicio de la campaña. */
  starts: boolean;
}

export interface CalendarMonth {
  /** 0–11. */
  month: number;
  year: number;
  days: number;
  bars: MonthBar[];
}

/** Doce meses desde `first` ("AAAA-MM"), con la barra de cada campaña en los meses que toca. */
export function calendarMonths(themes: SeasonalTheme[], first: string): CalendarMonth[] {
  const y0 = Number(first.slice(0, 4)), m0 = Number(first.slice(5, 7)) - 1;
  return Array.from({ length: 12 }, (_, i) => {
    const month = (m0 + i) % 12, year = y0 + Math.floor((m0 + i) / 12);
    const days = MONTH_DAYS[month]!, start = MONTH_START[month]! + 1, end = start + days - 1;
    const bars = themes.flatMap((t) => yearSpans(t).flatMap(([a, b], span) => {
      if (b < start || a > end) return [];
      const from = Math.max(a, start) - start + 1, to = Math.min(b, end) - start + 1;
      return [{ id: t.id, from, to, left: ((from - 1) / days) * 100, width: ((to - from + 1) / days) * 100, starts: span === 0 && a >= start && a <= end }];
    }));
    return { month, year, days, bars: bars.sort((p, q) => p.from - q.from) };
  });
}

export interface NextCampaign {
  theme: SeasonalTheme;
  /** Días hasta el inicio (0 si arranca hoy). */
  daysLeft: number;
  /** Está en curso hoy: `daysLeft` es 0 y `endsIn` los días que le quedan. */
  live: boolean;
  endsIn: number;
}

/** La campaña en curso (si hay) o la próxima habilitada, con los días que faltan. `today` es "AAAA-MM-DD". */
export function nextCampaign(themes: SeasonalTheme[], today: string): NextCampaign | null {
  const t0 = dayOfYear(today);
  const ahead = (d: number) => (d - t0 + 365) % 365;
  const active = themes.filter((t) => t.active);
  const live = active.find((t) => yearSpans(t).some(([a, b]) => a <= t0 && t0 <= b));
  if (live) return { theme: live, daysLeft: 0, live: true, endsIn: ahead(dayOfYear(live.endsOn)) };
  const sorted = [...active].sort((a, b) => ahead(dayOfYear(a.startsOn)) - ahead(dayOfYear(b.startsOn)));
  const next = sorted[0];
  return next ? { theme: next, daysLeft: ahead(dayOfYear(next.startsOn)), live: false, endsIn: ahead(dayOfYear(next.endsOn)) } : null;
}

/** La próxima que todavía no empezó (para "Próxima campaña" cuando ya hay una en curso). */
export function upcomingCampaign(themes: SeasonalTheme[], today: string): NextCampaign | null {
  const t0 = dayOfYear(today);
  const ahead = (d: number) => (d - t0 + 365) % 365 || 365;
  const sorted = themes.filter((t) => t.active).sort((a, b) => ahead(dayOfYear(a.startsOn)) - ahead(dayOfYear(b.startsOn)));
  const next = sorted[0];
  return next ? { theme: next, daysLeft: ahead(dayOfYear(next.startsOn)), live: false, endsIn: ahead(dayOfYear(next.endsOn)) } : null;
}
