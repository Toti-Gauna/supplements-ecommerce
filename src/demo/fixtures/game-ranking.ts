/**
 * Ranking semanal de Shaker Rush (R2c): alias INVENTADOS con sus mejores puntajes de la semana (MUESTRA). Tu puntaje
 * de este navegador se suma aparte. En producción el ranking sale de las partidas validadas en el servidor.
 */
export interface RankingSeed {
  alias: string;
  score: number;
}

export const WEEKLY_RANKING: RankingSeed[] = [
  { alias: "TORO_MDP", score: 2380 },
  { alias: "LAROCA", score: 2140 },
  { alias: "MANOS.DE.PIEDRA", score: 1975 },
  { alias: "SOFI_WOD", score: 1820 },
  { alias: "EL.TANQUE", score: 1610 },
  { alias: "PLAYA.GRANDE", score: 1490 },
  { alias: "KETTLE.KID", score: 1320 },
  { alias: "LOBO_MARINO", score: 1180 },
  { alias: "CRIS_DEADLIFT", score: 990 },
  { alias: "JAB.CRUZADO", score: 860 },
  { alias: "BURPEE.MAN", score: 720 },
  { alias: "MATE_Y_PESAS", score: 540 },
];
