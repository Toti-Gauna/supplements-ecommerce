import { describe, expect, it } from "vitest";
import { daysLeftInMonth, monthKey, weekDays, weekKey, weekStart } from "@/demo/engine/club-calendar";
import { addCouponOnce, claimTraining, clubCouponCode, findClaim, type ClubClaim } from "@/demo/engine/club-claims";
import { clubRing } from "@/demo/engine/club-ring";
import { checkIn, monthCheckins, trainingProgress, weekCheckins } from "@/demo/engine/club-training";
import { TRAINING_MISSIONS } from "@/demo/fixtures/club";
import { missions } from "@/demo/fixtures/commerce";

const [entrenos, deporte, shaker] = TRAINING_MISSIONS as [typeof TRAINING_MISSIONS[0], typeof TRAINING_MISSIONS[0], typeof TRAINING_MISSIONS[0]];
// Jueves 15/10/2026 al mediodía en Mar del Plata.
const NOW = new Date("2026-10-15T12:00:00-03:00");
const TODAY = "2026-10-15";
const ctx = { today: TODAY, checkins: [] as string[], seededWeek: 0, sportTried: null as string | null, gameWeekPlays: 0 };

describe("calendario del club", () => {
  it("la semana va de lunes a domingo y tiene su clave", () => {
    expect(weekStart(TODAY)).toBe("2026-10-12");
    expect(weekStart("2026-10-18")).toBe("2026-10-12");
    expect(weekStart("2026-10-19")).toBe("2026-10-19");
    expect(weekDays(TODAY)).toEqual(["2026-10-12", "2026-10-13", "2026-10-14", "2026-10-15", "2026-10-16", "2026-10-17", "2026-10-18"]);
    expect(weekKey(TODAY)).toBe("sem-2026-10-12");
    expect(monthKey(TODAY)).toBe("2026-10");
    expect(daysLeftInMonth(TODAY)).toBe(17);
    expect(daysLeftInMonth("2026-02-28")).toBe(1);
  });
});

describe("misiones de entrenamiento", () => {
  it("marcar el entreno es uno por día: dos veces el mismo día no suma", () => {
    const first = checkIn([], TODAY);
    expect(first).toEqual({ checkins: [TODAY], added: true });
    const again = checkIn(first.checkins, TODAY);
    expect(again.added).toBe(false);
    expect(again.checkins).toBe(first.checkins);
  });

  it("la semana suma los entrenos de la cuenta y los propios, sin los de otra semana", () => {
    const checkins = ["2026-10-09", "2026-10-13", TODAY];
    expect(weekCheckins({ today: TODAY, checkins, seededWeek: 0 })).toBe(2);
    expect(weekCheckins({ today: TODAY, checkins, seededWeek: 2 })).toBe(4);
    expect(weekCheckins({ today: TODAY, checkins: [], seededWeek: 9 })).toBe(7);
    expect(monthCheckins({ today: TODAY, checkins, seededWeek: 2 })).toBe(5);
  });

  it("cada tipo mide lo suyo", () => {
    expect(trainingProgress(entrenos, { ...ctx, seededWeek: 2, checkins: [TODAY] })).toBe(3);
    expect(trainingProgress(deporte, ctx)).toBe(0);
    expect(trainingProgress(deporte, { ...ctx, sportTried: "boxeo" })).toBe(1);
    expect(trainingProgress(shaker, { ...ctx, gameWeekPlays: 2 })).toBe(2);
  });
});

describe("reclamar premios: una sola vez", () => {
  it("sin cuenta o sin completar no se reclama", () => {
    expect(claimTraining({ mission: entrenos, progress: 3, claims: [], now: NOW, signedIn: false })).toEqual({ kind: "guest" });
    expect(claimTraining({ mission: entrenos, progress: 2, claims: [], now: NOW, signedIn: true })).toEqual({ kind: "incomplete", missing: 1 });
  });

  it("el segundo reclamo de la semana no da otro cupón ni otros puntos", () => {
    const first = claimTraining({ mission: entrenos, progress: 3, claims: [], now: NOW, signedIn: true });
    if (first.kind !== "claimed") throw new Error(first.kind);
    expect(first.claim).toMatchObject({ missionId: "t-entrenos", period: "sem-2026-10-12", points: 150 });
    expect(first.coupon).toMatchObject({ type: "FIXED", value: 2500, maxUses: 1, usedCount: 0, endsAt: "2026-10-29" });
    expect(first.coupon!.code).toMatch(/^CLUB[0-9A-Z]{5}$/);
    const second = claimTraining({ mission: entrenos, progress: 5, claims: first.claims, now: new Date("2026-10-18T20:00:00-03:00"), signedIn: true });
    expect(second).toEqual({ kind: "already", claim: first.claim });
    // La semana siguiente es otro período: otro premio con otro código.
    const next = claimTraining({ mission: entrenos, progress: 3, claims: first.claims, now: new Date("2026-10-19T09:00:00-03:00"), signedIn: true });
    if (next.kind !== "claimed") throw new Error(next.kind);
    expect(next.coupon!.code).not.toBe(first.coupon!.code);
    expect(next.claims).toHaveLength(2);
  });

  it("una misión única queda reclamada para siempre; la de solo puntos no emite cupón", () => {
    const once = claimTraining({ mission: deporte, progress: 1, claims: [], now: NOW, signedIn: true });
    if (once.kind !== "claimed") throw new Error(once.kind);
    expect(once.coupon?.type).toBe("FREE_SHIPPING");
    expect(findClaim(once.claims, deporte, "2027-03-01")).toEqual(once.claim);
    const points = claimTraining({ mission: shaker, progress: 1, claims: once.claims, now: NOW, signedIn: true });
    if (points.kind !== "claimed") throw new Error(points.kind);
    expect(points.coupon).toBeNull();
    expect(points.claim.code).toBeNull();
  });

  it("el código sale de la clave: misma clave, mismo código; y un cupón emitido nunca se pisa", () => {
    expect(clubCouponCode("t-entrenos@sem-2026-10-12")).toBe(clubCouponCode("t-entrenos@sem-2026-10-12"));
    expect(clubCouponCode("t-entrenos@sem-2026-10-12")).not.toBe(clubCouponCode("t-entrenos@sem-2026-10-19"));
    const used = { code: "CLUBAAAAA", type: "FIXED" as const, value: 2500, description: "x", maxUses: 1, usedCount: 1 };
    const res = addCouponOnce([used], { ...used, usedCount: 0 });
    expect(res.added).toBe(false);
    expect(res.coupons[0]!.usedCount).toBe(1);
    expect(addCouponOnce([], used)).toEqual({ coupons: [used], added: true });
  });
});

describe("anillo del próximo premio", () => {
  const purchase = missions.map((m) => ({ mission: m, progress: 0 }));
  const training = TRAINING_MISSIONS.map((m) => ({ mission: m, progress: 0 }));

  it("al invitado no le promete nada", () => {
    expect(clubRing({ signedIn: false, today: TODAY, purchase, training: training.map((t) => ({ ...t, progress: 9 })), claims: [] })).toEqual({ kind: "guest" });
  });

  it("con cuenta: primero lo que se puede reclamar, después lo más avanzado", () => {
    const ready = training.map((t) => (t.mission.id === "t-entrenos" ? { ...t, progress: 3 } : t));
    expect(clubRing({ signedIn: true, today: TODAY, purchase, training: ready, claims: [] })).toMatchObject({ kind: "ready", missionId: "t-entrenos" });
    const claims: ClubClaim[] = [{ key: "t-entrenos@sem-2026-10-12", missionId: "t-entrenos", period: "sem-2026-10-12", points: 150, code: "CLUBX", at: NOW.toISOString() }];
    const after = clubRing({ signedIn: true, today: TODAY, purchase: [{ mission: missions[2]!, progress: 58000 }], training: ready, claims });
    expect(after).toMatchObject({ kind: "progress", missionId: "m-gasto", pct: 58 });
  });
});
