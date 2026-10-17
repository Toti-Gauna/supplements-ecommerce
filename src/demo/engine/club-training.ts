import type { TrainingMission } from "../fixtures/club";
import { monthKey, weekDays, weekStart } from "./club-calendar";

/**
 * Misiones de entrenamiento (R2c). El registro es SIMULADO: el socio marca sus entrenos (uno por día) y el deporte que
 * probó; nadie lo verifica. Por eso los premios son chicos y se reclaman una vez por período (ver club-claims).
 */
export interface TrainingContext {
  today: string;
  /** Días AAAA-MM-DD en que se marcó un entreno en este navegador. */
  checkins: string[];
  /** Entrenos de la semana que ya traía la cuenta demo (0 sin cuenta). */
  seededWeek: number;
  sportTried: string | null;
  /** Partidas de Shaker Rush jugadas esta semana. */
  gameWeekPlays: number;
}

/** Se guardan los últimos 90 días: alcanza para la semana y el mes. */
const KEEP = 90;

/** Marcar el entreno de hoy: uno por día. Marcar dos veces el mismo día no suma otro. */
export function checkIn(checkins: string[], today: string): { checkins: string[]; added: boolean } {
  if (checkins.includes(today)) return { checkins, added: false };
  return { checkins: [...checkins, today].sort().slice(-KEEP), added: true };
}

/** Entrenos marcados en la semana del día (propios, sin repetir). */
export function ownWeekCheckins(checkins: string[], today: string): string[] {
  const days = new Set(weekDays(today));
  return [...new Set(checkins)].filter((d) => days.has(d));
}

/** Entrenos de la semana contando los que traía la cuenta (como mucho uno por día de la semana). */
export function weekCheckins(ctx: Pick<TrainingContext, "today" | "checkins" | "seededWeek">): number {
  return Math.min(7, ctx.seededWeek + ownWeekCheckins(ctx.checkins, ctx.today).length);
}

/** Entrenos del mes (propios + los de la cuenta, que se cuentan en la semana actual). */
export function monthCheckins(ctx: Pick<TrainingContext, "today" | "checkins" | "seededWeek">): number {
  const own = new Set(ctx.checkins.filter((d) => monthKey(d) === monthKey(ctx.today)));
  const seededInMonth = monthKey(weekStart(ctx.today)) === monthKey(ctx.today) ? ctx.seededWeek : 0;
  return own.size + seededInMonth;
}

/** Avance de una misión de entrenamiento (sin tope: el tope lo pone la vista). */
export function trainingProgress(mission: TrainingMission, ctx: TrainingContext): number {
  switch (mission.kind) {
    case "CHECKINS_WEEK": return weekCheckins(ctx);
    case "SPORT_DAY": return ctx.sportTried ? 1 : 0;
    case "GAME_WEEK": return ctx.gameWeekPlays;
  }
}

export const trainingPct = (mission: TrainingMission, progress: number) => Math.min(100, Math.round((progress / mission.threshold) * 100));
