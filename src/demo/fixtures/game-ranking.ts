/**
 * Ranking semanal de Shaker Rush (R2c): alias INVENTADOS con sus mejores puntajes de la semana (MUESTRA). Tu puntaje
 * de este navegador se suma aparte. En producción el ranking sale de las partidas validadas en el servidor.
 */
export interface RankingSeed {
  alias: string;
  score: number;
  /** Box de la liga de gimnasios (muestra). */
  gymId: string;
}

export const WEEKLY_RANKING: RankingSeed[] = [
  { alias: "TORO_MDP", score: 2380, gymId: "fragua" },
  { alias: "LAROCA", score: 2140, gymId: "puerto-fight" },
  { alias: "MANOS.DE.PIEDRA", score: 1975, gymId: "ring-chauvin" },
  { alias: "SOFI_WOD", score: 1820, gymId: "acantilado" },
  { alias: "EL.TANQUE", score: 1610, gymId: "hierro-norte" },
  { alias: "PLAYA.GRANDE", score: 1490, gymId: "rompeolas" },
  { alias: "KETTLE.KID", score: 1320, gymId: "constitucion" },
  { alias: "LOBO_MARINO", score: 1180, gymId: "faro" },
  { alias: "CRIS_DEADLIFT", score: 990, gymId: "hierro-norte" },
  { alias: "JAB.CRUZADO", score: 860, gymId: "puerto-fight" },
  { alias: "BURPEE.MAN", score: 720, gymId: "fragua" },
  { alias: "MATE_Y_PESAS", score: 540, gymId: "faro" },
];
