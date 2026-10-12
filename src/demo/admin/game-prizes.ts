import { maxPlausibleScore, nextTier, sortedTiers, tierForScore } from "../engine/game-prize";
import type { GamePrizeConfig, GamePrizeTier, GameRules } from "../fixtures/game";
import type { PrizeKind } from "../fixtures/wheel";

/**
 * Premios de Shaker Rush en el panel (Marketing → Cupones y ruleta → Premios del juego): límites, validación, nombre
 * de cada premio y la vista previa en palabras. El premio lo sigue resolviendo `resolveGamePrize` (engine).
 */
export const GAME_PRIZE_LIMITS = {
  tiers: { min: 1, max: 5 },
  minScore: { min: 50, max: 20_000 },
  percent: { min: 1, max: 50 },
  fixed: { min: 500, max: 50_000 },
  validDays: { min: 1, max: 90 },
} as const;

export const GAME_PRIZE_KINDS: { id: PrizeKind; label: string }[] = [
  { id: "PERCENT", label: "Porcentaje" },
  { id: "FIXED", label: "Monto fijo" },
  { id: "FREE_SHIPPING", label: "Envío gratis" },
];

const NB = " ";
const pesos = (n: number) => `$${n.toLocaleString("es-AR")}`;
const pts = (n: number) => n.toLocaleString("es-AR");

/** Nombre del premio armado con el tipo y el valor ("10 % OFF", "$3.000 OFF", "Envío gratis"), sin cortes de línea. */
export function gamePrizeLabel(kind: PrizeKind, value: number): string {
  if (kind === "PERCENT") return `${value}${NB}%${NB}OFF`;
  if (kind === "FIXED") return `${pesos(value)}${NB}OFF`;
  return "Envío gratis";
}

export interface TierErrors { minScore?: string; value?: string; validDays?: string }
export interface GamePrizeErrors { tiers: Record<string, TierErrors>; general: string[] }

const inRange = (n: number, { min, max }: { min: number; max: number }) => Number.isInteger(n) && n >= min && n <= max;

/** Errores por nivel y generales (vacío = se puede guardar). `rules` da el tope de puntos posible en una partida. */
export function checkGamePrizes(config: GamePrizeConfig, rules: GameRules): GamePrizeErrors {
  const L = GAME_PRIZE_LIMITS;
  const errors: GamePrizeErrors = { tiers: {}, general: [] };
  if (config.tiers.length < L.tiers.min) errors.general.push("Dejá al menos un nivel de premio (o pausá los premios).");
  if (config.tiers.length > L.tiers.max) errors.general.push(`Hasta ${L.tiers.max} niveles: más escalones se vuelven difíciles de leer en el juego.`);
  const top = maxPlausibleScore(rules);
  for (const t of config.tiers) {
    const e: TierErrors = {};
    if (!inRange(t.minScore, L.minScore)) e.minScore = `Entre ${pts(L.minScore.min)} y ${pts(L.minScore.max)} puntos.`;
    else if (t.minScore > top) e.minScore = `Nadie puede hacer ${pts(t.minScore)} puntos en una partida.`;
    else if (config.tiers.some((o) => o !== t && o.minScore === t.minScore)) e.minScore = "Otro nivel ya empieza en ese puntaje.";
    if (t.kind === "PERCENT" && !inRange(t.value, L.percent)) e.value = `El porcentaje va de ${L.percent.min} a ${L.percent.max}.`;
    if (t.kind === "FIXED" && !inRange(t.value, L.fixed)) e.value = `Un monto entre ${pesos(L.fixed.min)} y ${pesos(L.fixed.max)}, en pesos enteros.`;
    if (!inRange(t.validDays, L.validDays)) e.validDays = `De ${L.validDays.min} a ${L.validDays.max} días.`;
    if (Object.keys(e).length) errors.tiers[t.id] = e;
  }
  return errors;
}

export const hasGamePrizeErrors = (e: GamePrizeErrors) => e.general.length > 0 || Object.keys(e.tiers).length > 0;

/** Lo que se guarda: niveles de menor a mayor, con su nombre y sin valor en el envío gratis. */
export function normalizeGamePrizes(config: GamePrizeConfig): GamePrizeConfig {
  const tiers = sortedTiers(config.tiers).map((t): GamePrizeTier => {
    const value = t.kind === "FREE_SHIPPING" ? 0 : t.value;
    return { ...t, value, label: gamePrizeLabel(t.kind, value) };
  });
  return { active: config.active, tiers };
}

/** Nivel nuevo: arriba del último, con un premio un poco mejor y la misma vigencia. */
export function newGameTier(tiers: GamePrizeTier[], id: string): GamePrizeTier {
  const last = sortedTiers(tiers).at(-1);
  const minScore = Math.min(GAME_PRIZE_LIMITS.minScore.max, (last?.minScore ?? 0) + 500);
  const value = last?.kind === "PERCENT" ? Math.min(GAME_PRIZE_LIMITS.percent.max, last.value + 5) : 15;
  return { id, minScore, kind: "PERCENT", value, label: gamePrizeLabel("PERCENT", value), validDays: last?.validDays ?? 7 };
}

/** El premio dentro de una frase ("ganás envío gratis"). */
const inline = (t: Pick<GamePrizeTier, "kind" | "value">) => gamePrizeLabel(t.kind, t.value).replace(/^Envío/, "envío");
const vence = (days: number) => `vence a los ${days} ${days === 1 ? "día" : "días"}`;

/** "Con 800 puntos ganás 10 % OFF (vence a los 7 días)." — una línea por nivel en la vista previa. */
export function tierSentence(t: GamePrizeTier): string {
  return `Con ${pts(t.minScore)} puntos ganás ${inline(t)} (${vence(t.validDays)}).`;
}

/** Qué gana una partida con ese puntaje, con lo que falta para el próximo nivel. */
export function scorePreview(score: number, config: GamePrizeConfig): string {
  if (!config.active || !config.tiers.length) return "Los premios están pausados: se juega igual, pero no se entregan cupones.";
  const tier = tierForScore(score, config.tiers);
  const next = nextTier(score, config.tiers);
  const won = tier ? `Con ${pts(score)} puntos ganás ${inline(tier)}.` : `Con ${pts(score)} puntos todavía no hay premio.`;
  return next ? `${won} Con ${pts(next.missing)} más llega a ${inline(next.tier)}.` : `${won} Es el premio más alto.`;
}
