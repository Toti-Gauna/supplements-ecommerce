import { sameMonth } from "./club-calendar";
import type { ClubClaim } from "./club-claims";

/**
 * Puntos del Club en el mes (R2c): el marcador del Club. Suman las compras, los entrenos marcados, los
 * premios de misiones reclamados y tu mejor partida de Shaker Rush de la semana. Ilustrativo: en producción solo
 * cuentan pedidos pagados y partidas validadas en el servidor. El nivel Bestia duplica el total.
 */
export const CLUB_POINTS = {
  /** Puntos por cada $1.000 de compra. */
  perThousand: 1,
  perCheckin: 20,
  /** Puntos de Shaker Rush: el récord de la semana dividido por esto, con tope. */
  gameDivisor: 20,
  gameCap: 100,
} as const;

export interface PointsInput {
  today: string;
  spendMonth: number;
  checkinsMonth: number;
  claims: ClubClaim[];
  gameBestWeek: number;
  double?: boolean;
}

export interface PointsPart { id: "compras" | "entrenos" | "misiones" | "juego"; label: string; points: number }

export function clubPoints(input: PointsInput): { total: number; parts: PointsPart[] } {
  const missions = input.claims.filter((c) => sameMonth(c.at, input.today)).reduce((s, c) => s + c.points, 0);
  const parts: PointsPart[] = [
    { id: "compras", label: "Compras del mes", points: Math.floor(Math.max(0, input.spendMonth) / 1000) * CLUB_POINTS.perThousand },
    { id: "entrenos", label: "Entrenos marcados", points: Math.max(0, input.checkinsMonth) * CLUB_POINTS.perCheckin },
    { id: "misiones", label: "Misiones reclamadas", points: missions },
    { id: "juego", label: "Shaker Rush", points: Math.min(CLUB_POINTS.gameCap, Math.floor(Math.max(0, input.gameBestWeek) / CLUB_POINTS.gameDivisor)) },
  ];
  const sum = parts.reduce((s, p) => s + p.points, 0);
  return { total: input.double ? sum * 2 : sum, parts };
}
