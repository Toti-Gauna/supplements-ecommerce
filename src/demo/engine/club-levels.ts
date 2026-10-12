import { CLUB_LEVELS, type ClubLevel } from "../fixtures/club";

export interface LevelProgress {
  level: ClubLevel;
  /** Siguiente nivel, o null en el último. */
  next: ClubLevel | null;
  /** Avance de 0 a 100 entre el nivel actual y el siguiente (100 en el último). */
  pct: number;
  /** Pesos que faltan para el siguiente nivel (0 en el último). */
  missing: number;
}

/** Nivel del club para un gasto acumulado (pesos enteros). Los niveles se leen ordenados por `minSpend`. */
export function levelFor(spend: number, levels: ClubLevel[] = CLUB_LEVELS): ClubLevel {
  const sorted = [...levels].sort((a, b) => a.minSpend - b.minSpend);
  return sorted.reduce((acc, l) => (spend >= l.minSpend ? l : acc), sorted[0]!);
}

/** Nivel actual, el siguiente y cuánto falta: lo que muestra la batería del club. */
export function levelProgress(spend: number, levels: ClubLevel[] = CLUB_LEVELS): LevelProgress {
  const sorted = [...levels].sort((a, b) => a.minSpend - b.minSpend);
  const level = levelFor(spend, sorted);
  const next = sorted[sorted.indexOf(level) + 1] ?? null;
  if (!next) return { level, next: null, pct: 100, missing: 0 };
  const span = next.minSpend - level.minSpend;
  const done = Math.max(0, spend - level.minSpend);
  return { level, next, pct: Math.min(100, Math.floor((done / span) * 100)), missing: Math.max(0, next.minSpend - spend) };
}
