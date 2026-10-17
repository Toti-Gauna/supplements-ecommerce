import type { Gym } from "../fixtures/gyms";

/**
 * Liga de gimnasios (R2c): ranking mensual por box con los puntos de muestra más tu aporte, sumado al gimnasio que
 * elegiste. Orden por puntos y, si empatan, por nombre (así la tabla no salta entre renders).
 */
export interface LeagueRow {
  gym: Gym;
  points: number;
  position: number;
  /** Es el gimnasio que elegiste. */
  mine: boolean;
  /** Tu aporte en este box (0 en los demás). */
  contribution: number;
}

export function leagueTable(gyms: Gym[], mine: { gymId: string; points: number } | null): LeagueRow[] {
  return gyms
    .map((gym) => {
      const own = mine?.gymId === gym.id;
      const contribution = own ? Math.max(0, Math.floor(mine!.points)) : 0;
      return { gym, points: gym.monthPoints + contribution, mine: own, contribution };
    })
    .sort((a, b) => b.points - a.points || a.gym.name.localeCompare(b.gym.name, "es"))
    .map((row, i) => ({ ...row, position: i + 1 }));
}

/** Puntos que le faltan a tu box para pasar al de arriba (null si ya es primero o no elegiste). */
export function overtakeGap(rows: LeagueRow[]): { gym: Gym; points: number } | null {
  const i = rows.findIndex((r) => r.mine);
  if (i <= 0) return null;
  const above = rows[i - 1]!;
  return { gym: above.gym, points: above.points - rows[i]!.points + 1 };
}

/** El gimnasio elegido, si existe en la liga (un id viejo o borrado no cuenta). */
export const validGym = (gyms: Gym[], id: string | null | undefined) => gyms.find((g) => g.id === id) ?? null;
