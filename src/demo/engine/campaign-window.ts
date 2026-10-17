import type { SeasonalTheme } from "../types";

/**
 * Ventana de una campaña (R3a): en qué momento está (por venir, sala de espera, en vivo o terminada) y hacia dónde
 * cuenta la cuenta regresiva. Las fechas se repiten cada año (solo cuentan mes y día, como en `inSeason`) y van en
 * hora de Buenos Aires (UTC−3, sin horario de verano): una campaña arranca a las 00:00 de su primer día y cierra a las
 * 00:00 del día siguiente al último. Puro: el "ahora" llega de afuera (src/demo/clock.ts).
 */
const DAY = 86_400_000;
const AR_OFFSET = 3 * 3_600_000;
/** Días antes del inicio en que abre la sala de espera (solo campañas con `waitingRoom`). */
export const WAITING_DAYS = 7;
/** Días después del cierre en que la página de la campaña dice "terminó" antes de anunciar la próxima edición. */
export const ENDED_DAYS = 14;
/** En la vista previa de la sala de espera, cuántos días antes del inicio se simula estar. */
export const PREVIEW_WAITING_LEAD = 3;

export type CampaignState = "upcoming" | "waiting" | "live" | "ended";
export type CampaignRange = Pick<SeasonalTheme, "startsOn" | "endsOn" | "waitingRoom">;

export interface CampaignWindow {
  state: CampaignState;
  /** Edición que cuenta (la en vivo, la que viene o la que terminó): inicio y cierre en ms. */
  startsAt: number;
  endsAt: number;
  /** Hacia dónde cuenta la cuenta regresiva: el inicio (por venir o sala de espera), el cierre (en vivo) o nada. */
  target: number | null;
  /** Inicio de la próxima edición ("vuelve el…"). */
  nextStartsAt: number;
}

const midnight = (year: number, monthDay: string) => Date.parse(`${year}-${monthDay}T00:00:00-03:00`);
/** Año y número de día en Buenos Aires. */
const arYear = (ms: number) => new Date(ms - AR_OFFSET).getUTCFullYear();
const arDay = (ms: number) => Math.floor((ms - AR_OFFSET) / DAY);

function edition(range: CampaignRange, year: number) {
  const from = range.startsOn.slice(5), to = range.endsOn.slice(5);
  return { startsAt: midnight(year, from), endsAt: midnight(to < from ? year + 1 : year, to) + DAY };
}

export function campaignWindow(range: CampaignRange, now: number): CampaignWindow {
  const year = arYear(now);
  const editions = [year - 1, year, year + 1, year + 2].map((y) => edition(range, y));
  const next = editions.find((e) => e.startsAt > now)!;
  const live = editions.find((e) => now >= e.startsAt && now < e.endsAt);
  if (live) return { state: "live", ...live, target: live.endsAt, nextStartsAt: next.startsAt };
  if (range.waitingRoom && next.startsAt - now <= WAITING_DAYS * DAY) return { state: "waiting", ...next, target: next.startsAt, nextStartsAt: next.startsAt };
  const last = editions.filter((e) => e.endsAt <= now).at(-1);
  if (last && now - last.endsAt < ENDED_DAYS * DAY) return { state: "ended", ...last, target: null, nextStartsAt: next.startsAt };
  return { state: "upcoming", ...next, target: next.startsAt, nextStartsAt: next.startsAt };
}

export interface CountdownParts { days: number; hours: number; minutes: number; seconds: number }

/** Lo que falta hasta `target`, en días, horas, minutos y segundos (nunca negativo). */
export function countdownParts(target: number, now: number): CountdownParts {
  const left = Math.max(0, Math.floor((target - now) / 1000));
  return { days: Math.floor(left / 86_400), hours: Math.floor(left / 3600) % 24, minutes: Math.floor(left / 60) % 60, seconds: left % 60 };
}

/** Días de calendario (Buenos Aires) entre hoy y `target`: del 11 al 23 de noviembre faltan 12. */
export function daysUntil(target: number, now: number): number {
  return arDay(target) - arDay(now);
}

/** Día AAAA-MM-DD (Buenos Aires) de un instante: para escribir "abre el lunes 23 de noviembre". */
export function dayKeyOf(ms: number): string {
  return new Date(ms - AR_OFFSET).toISOString().slice(0, 10);
}

/** "faltan 12 días", "falta 1 día" o "es mañana"/"es hoy" para la franja y la sala de espera. */
export function daysLeftText(days: number): string {
  if (days <= 0) return "es hoy";
  if (days === 1) return "es mañana";
  return `faltan ${days} días`;
}

/** Día (AAAA-MM-DD) que simula la vista previa: el primero de la campaña o, para la sala de espera, unos días antes. */
export function previewDay(range: CampaignRange, phase: "live" | "waiting"): string {
  if (phase === "live") return range.startsOn;
  return dayKeyOf(midnight(Number(range.startsOn.slice(0, 4)), range.startsOn.slice(5)) - PREVIEW_WAITING_LEAD * DAY);
}

export interface CampaignAgenda<T extends SeasonalTheme> {
  /** La primera habilitada en vivo hoy. */
  live: T | null;
  /** La próxima (por venir o en sala de espera), con su ventana. */
  next: { theme: T; window: CampaignWindow } | null;
}

/** Qué pasa hoy en el calendario de campañas: la que está en vivo y la que viene después. */
export function campaignAgenda<T extends SeasonalTheme>(themes: T[], now: number): CampaignAgenda<T> {
  const active = themes.filter((t) => t.active).map((theme) => ({ theme, window: campaignWindow(theme, now) }));
  const live = active.find((a) => a.window.state === "live")?.theme ?? null;
  const ahead = active.filter((a) => a.window.state === "upcoming" || a.window.state === "waiting")
    .sort((a, b) => a.window.startsAt - b.window.startsAt);
  return { live, next: ahead[0] ?? null };
}

/** Las campañas en el orden del calendario de la demo (de octubre a septiembre), para la vitrina y el calendario. */
export function calendarOrder<T extends Pick<SeasonalTheme, "startsOn">>(themes: T[]): T[] {
  return [...themes].sort((a, b) => a.startsOn.localeCompare(b.startsOn));
}
