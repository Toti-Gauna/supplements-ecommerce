import type { TrainingMission } from "../fixtures/club";
import type { Coupon } from "../types";
import { clubToday, weekKey } from "./club-calendar";

/**
 * Reclamar premios del Club sin duplicar (R2c). Cada premio tiene una clave por misión y período (la semana o "única"):
 * si ya está reclamada, reclamar otra vez no da otro cupón ni otros puntos. El código del cupón sale de esa clave, así
 * que tampoco puede haber dos cupones para el mismo premio. En producción esto lo valida el servidor con la cuenta.
 */
export interface ClubClaim {
  key: string;
  missionId: string;
  period: string;
  points: number;
  /** Cupón emitido (null si el premio son solo puntos). */
  code: string | null;
  at: string;
}

export type ClaimOutcome =
  | { kind: "claimed"; claim: ClubClaim; coupon: Coupon | null; claims: ClubClaim[] }
  | { kind: "already"; claim: ClubClaim }
  | { kind: "incomplete"; missing: number }
  | { kind: "guest" };

export const CLUB_COUPON_PREFIX = "CLUB";

export const claimPeriod = (mission: Pick<TrainingMission, "period">, today: string) => (mission.period === "week" ? weekKey(today) : "unica");
export const claimKey = (missionId: string, period: string) => `${missionId}@${period}`;

/** El premio de esa misión ya reclamado en el período de hoy, si lo hay. */
export function findClaim(claims: ClubClaim[], mission: Pick<TrainingMission, "id" | "period">, today: string): ClubClaim | null {
  const key = claimKey(mission.id, claimPeriod(mission, today));
  return claims.find((c) => c.key === key) ?? null;
}

/** Código estable de 5 caracteres para una clave (FNV-1a): la misma clave da siempre el mismo código. */
export function clubCouponCode(key: string): string {
  let h = 0x811c9dc5;
  for (const ch of key) h = Math.imul(h ^ ch.charCodeAt(0), 0x01000193) >>> 0;
  return `${CLUB_COUPON_PREFIX}${h.toString(36).toUpperCase().padStart(5, "0").slice(-5)}`;
}

/** Cupón de un uso para el premio de una misión de entrenamiento. */
export function clubPrizeCoupon(mission: TrainingMission, code: string, now: Date): Coupon | null {
  const prize = mission.prize;
  if (!prize) return null;
  const endsAt = clubToday(new Date(now.getTime() + prize.validDays * 86_400_000));
  return {
    code, type: prize.kind, value: prize.value, minSubtotal: prize.minSubtotal, endsAt,
    description: `Club: ${mission.reward}`, active: true, maxUses: 1, usedCount: 0,
  };
}

/** Reclamar el premio: solo con cuenta, con la misión completa y una vez por período. */
export function claimTraining(input: { mission: TrainingMission; progress: number; claims: ClubClaim[]; now: Date; signedIn: boolean }): ClaimOutcome {
  const { mission, progress, claims, now } = input;
  if (!input.signedIn) return { kind: "guest" };
  const today = clubToday(now);
  const existing = findClaim(claims, mission, today);
  if (existing) return { kind: "already", claim: existing };
  if (progress < mission.threshold) return { kind: "incomplete", missing: mission.threshold - progress };
  const period = claimPeriod(mission, today);
  const key = claimKey(mission.id, period);
  const coupon = clubPrizeCoupon(mission, clubCouponCode(key), now);
  const claim: ClubClaim = { key, missionId: mission.id, period, points: mission.points, code: coupon?.code ?? null, at: now.toISOString() };
  return { kind: "claimed", claim, coupon, claims: [...claims, claim] };
}

/** Suma un cupón solo si su código no existe: un premio nunca pisa (ni reinicia los usos de) un cupón emitido. */
export function addCouponOnce(coupons: Coupon[], coupon: Coupon): { coupons: Coupon[]; added: boolean } {
  if (coupons.some((c) => c.code === coupon.code)) return { coupons, added: false };
  return { coupons: [...coupons, coupon], added: true };
}
