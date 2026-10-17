import type { RankingSeed } from "../fixtures/game-ranking";
import { sameWeek } from "./club-calendar";

/**
 * Ranking semanal de Shaker Rush (R2c): los alias de muestra más tu mejor partida de la semana en este navegador. La
 * semana arranca el lunes. Si empatás con alguien, queda arriba quien llegó primero (el de muestra).
 */
export interface ScoreRecord { score: number; at: string }

export interface RankRow {
  alias: string;
  score: number;
  gymId?: string;
  position: number;
  mine: boolean;
}

/** Partidas de la semana del día. */
export const weekScores = (scores: ScoreRecord[], today: string) => scores.filter((s) => sameWeek(s.at, today));

/** Tu mejor puntaje de la semana (0 si no jugaste). */
export const weekBest = (scores: ScoreRecord[], today: string) => weekScores(scores, today).reduce((m, s) => Math.max(m, s.score), 0);

export function weeklyRanking(seed: RankingSeed[], own: { alias: string; score: number; gymId?: string } | null): RankRow[] {
  const rows: Omit<RankRow, "position">[] = seed.map((s) => ({ alias: s.alias, score: s.score, gymId: s.gymId, mine: false }));
  if (own && own.score > 0) rows.push({ alias: own.alias, score: own.score, gymId: own.gymId, mine: true });
  return rows
    .map((r, i) => ({ r, i }))
    .sort((a, b) => b.r.score - a.r.score || a.i - b.i)
    .map(({ r }, i) => ({ ...r, position: i + 1 }));
}

/** El rival de la semana: quien está justo arriba tuyo, o el primero si todavía no jugaste. */
export function rivalOf(rows: RankRow[]): { row: RankRow; gap: number } | null {
  const i = rows.findIndex((r) => r.mine);
  if (i === 0) return null;
  const row = i > 0 ? rows[i - 1]! : rows[0];
  if (!row) return null;
  return { row, gap: row.score - (i > 0 ? rows[i]!.score : 0) + 1 };
}

/** Las filas que se muestran: el top y, si quedaste más abajo, tu fila al final. */
export function visibleRows(rows: RankRow[], top = 8): RankRow[] {
  const head = rows.slice(0, top);
  const mine = rows.find((r) => r.mine);
  return mine && mine.position > top ? [...head, mine] : head;
}
