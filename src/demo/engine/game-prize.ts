import type { GamePrizeConfig, GamePrizeTier, GameRules } from "../fixtures/game";
import type { Coupon } from "../types";
import { toDayKey } from "@/lib/date";
import { MIN_GAP } from "./game-spawn";

/**
 * Premios de Shaker Rush: se juega todas las veces que quieras y el cupón se gana una vez por día (en la demo, por
 * navegador y con el reloj del dispositivo). En producción esto corre en el servidor: emite la semilla al empezar,
 * valida el puntaje contra la duración (o repite la partida) y lleva el límite diario por cuenta con su propio reloj.
 */
export const GAME_COUPON_PREFIX = "SHAKER";

/** Premio cobrado: queda en el navegador para no dar otro el mismo día y para mostrarlo en Mis cupones. */
export interface GamePrizeRecord {
  code: string;
  tierId: string;
  label: string;
  score: number;
  /** AAAA-MM-DD en hora argentina. */
  day: string;
  at: string;
}

export type GamePrizeOutcome =
  | { kind: "won"; tier: GamePrizeTier; coupon: Coupon; record: GamePrizeRecord }
  | { kind: "already"; tier: GamePrizeTier | null; claimed: GamePrizeRecord }
  | { kind: "below"; next: { tier: GamePrizeTier; missing: number } | null }
  | { kind: "inactive" }
  | { kind: "invalid" };

export const dayKey = (now: Date) => toDayKey(now.toISOString());

/** Niveles de menor a mayor puntaje (la escalera del juego, la tabla de premios y el panel). */
export function sortedTiers(tiers: GamePrizeTier[]): GamePrizeTier[] {
  return [...tiers].sort((a, b) => a.minScore - b.minScore);
}

/** El nivel más alto alcanzado con ese puntaje (o ninguno). */
export function tierForScore(score: number, tiers: GamePrizeTier[]): GamePrizeTier | null {
  return [...tiers].sort((a, b) => b.minScore - a.minScore).find((t) => score >= t.minScore) ?? null;
}

/** El próximo nivel y cuántos puntos faltan (null si ya se llegó al último). */
export function nextTier(score: number, tiers: GamePrizeTier[]): { tier: GamePrizeTier; missing: number } | null {
  const tier = sortedTiers(tiers).find((t) => score < t.minScore);
  return tier ? { tier, missing: tier.minScore - score } : null;
}

/** El premio ya cobrado en ese día, si lo hay. */
export function claimedOn(prizes: GamePrizeRecord[], day: string): GamePrizeRecord | null {
  return prizes.find((p) => p.day === day) ?? null;
}

/** Tope de puntaje posible en una partida: todo lo que puede aparecer, al mejor valor, con combo máximo y ×2. */
export function maxPlausibleScore(rules: GameRules, durationSec = rules.durationSec): number {
  const spawns = Math.ceil(durationSec / MIN_GAP) + 1;
  const best = Math.max(...Object.values(rules.items).map((i) => i.points));
  return spawns * best * rules.maxComboMult * 2;
}

/** Cupón de un uso que funciona en el carrito de la demo. `seed` da el sufijo del código; vence según el nivel. */
export function gamePrizeCoupon(tier: GamePrizeTier, seed: string, now: Date, validDays = tier.validDays): Coupon {
  const endsAt = dayKey(new Date(now.getTime() + validDays * 86_400_000));
  const suffix = seed.toUpperCase().replace(/[^A-Z0-9]/g, "").padEnd(5, "X").slice(0, 5);
  const min = tier.minSubtotal ? ` desde $${tier.minSubtotal.toLocaleString("es-AR")}` : "";
  return {
    code: `${GAME_COUPON_PREFIX}${suffix}`,
    type: tier.kind, value: tier.value, minSubtotal: tier.minSubtotal, endsAt,
    description: `Shaker Rush: ${tier.label}${min}`, active: true, maxUses: 1, usedCount: 0,
  };
}

/**
 * Qué pasa con el premio al terminar una partida: se gana (primer nivel alcanzado del día), ya se cobró hoy, faltaron
 * puntos o el resultado no es posible (puntaje negativo, con decimales o por encima del tope para esa duración).
 */
export function resolveGamePrize(input: { score: number; durationSec: number; now: Date; prizes: GamePrizeRecord[]; config: GamePrizeConfig; rules: GameRules; seed: string }): GamePrizeOutcome {
  const { score, durationSec, now, prizes, config, rules } = input;
  const validDuration = durationSec >= 0 && durationSec <= rules.durationSec + 1;
  if (!Number.isInteger(score) || score < 0 || !validDuration || score > maxPlausibleScore(rules, durationSec)) return { kind: "invalid" };
  if (!config.active || config.tiers.length === 0) return { kind: "inactive" };
  const tier = tierForScore(score, config.tiers);
  const day = dayKey(now);
  const claimed = claimedOn(prizes, day);
  if (claimed) return { kind: "already", tier, claimed };
  if (!tier) return { kind: "below", next: nextTier(score, config.tiers) };
  const coupon = gamePrizeCoupon(tier, input.seed, now);
  return { kind: "won", tier, coupon, record: { code: coupon.code, tierId: tier.id, label: tier.label, score, day, at: now.toISOString() } };
}
