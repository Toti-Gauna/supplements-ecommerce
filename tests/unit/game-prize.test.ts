import { beforeEach, describe, expect, it } from "vitest";
import { couponDiscount, validateCoupon } from "@/demo/engine/coupons";
import { claimedOn, dayKey, gamePrizeCoupon, maxPlausibleScore, nextTier, resolveGamePrize, tierForScore, type GamePrizeRecord } from "@/demo/engine/game-prize";
import { defaultDemoData, demoData, setDemoData } from "@/demo/engine/source";
import { walletCoupons } from "@/demo/engine/wallet";
import { gamePrizes as config, gameRules as rules } from "@/demo/fixtures/game";

// 12 oct 2026, 15 h en Argentina (UTC−3).
const now = new Date("2026-10-12T18:00:00Z");
const base = { durationSec: 45, now, prizes: [] as GamePrizeRecord[], config, rules, seed: "ab12c" };
const tier = (id: string) => config.tiers.find((t) => t.id === id)!;

describe("niveles por puntaje", () => {
  it("da el nivel más alto alcanzado", () => {
    expect(tierForScore(0, config.tiers)).toBeNull();
    expect(tierForScore(299, config.tiers)).toBeNull();
    expect(tierForScore(300, config.tiers)?.id).toBe("g-5");
    expect(tierForScore(1499, config.tiers)?.id).toBe("g-10");
    expect(tierForScore(5000, config.tiers)?.id).toBe("g-envio");
  });

  it("dice cuánto falta para el próximo", () => {
    expect(nextTier(120, config.tiers)).toEqual({ tier: tier("g-5"), missing: 180 });
    expect(nextTier(800, config.tiers)).toEqual({ tier: tier("g-envio"), missing: 700 });
    expect(nextTier(1500, config.tiers)).toBeNull();
  });
});

describe("cupón del juego", () => {
  it("el día se cuenta en hora argentina", () => {
    expect(dayKey(new Date("2026-10-12T02:30:00Z"))).toBe("2026-10-11");
    expect(dayKey(now)).toBe("2026-10-12");
  });

  it("arma un cupón SHAKER de un uso con su vencimiento", () => {
    const c = gamePrizeCoupon(tier("g-10"), "a-b!9", now, 7);
    expect(c.code).toMatch(/^SHAKER[A-Z0-9]{5}$/);
    expect(c.code).toBe("SHAKERAB9XX");
    expect(c).toMatchObject({ type: "PERCENT", value: 10, maxUses: 1, usedCount: 0, active: true, endsAt: "2026-10-19", description: `Shaker Rush: ${tier("g-10").label}` });
    expect(gamePrizeCoupon(tier("g-envio"), "zz", now, 7).type).toBe("FREE_SHIPPING");
  });

  it("se gana con la primera partida del día que llega a un nivel", () => {
    const out = resolveGamePrize({ ...base, score: 920 });
    expect(out.kind).toBe("won");
    if (out.kind !== "won") return;
    expect(out.tier.id).toBe("g-10");
    expect(out.record).toMatchObject({ code: out.coupon.code, tierId: "g-10", score: 920, day: "2026-10-12" });
  });

  it("el mismo día no da otro, aunque el puntaje sea mejor; al día siguiente sí", () => {
    const claimed: GamePrizeRecord = { code: "SHAKERAAAAA", tierId: "g-5", label: tier("g-5").label, score: 310, day: "2026-10-12", at: now.toISOString() };
    expect(claimedOn([claimed], "2026-10-12")).toBe(claimed);
    const again = resolveGamePrize({ ...base, score: 1600, prizes: [claimed] });
    expect(again).toMatchObject({ kind: "already", claimed, tier: { id: "g-envio" } });
    const tomorrow = resolveGamePrize({ ...base, score: 1600, prizes: [claimed], now: new Date("2026-10-13T12:00:00Z") });
    expect(tomorrow.kind).toBe("won");
  });

  it("sin llegar al primer nivel no consume el premio del día", () => {
    expect(resolveGamePrize({ ...base, score: 250 })).toEqual({ kind: "below", next: { tier: tier("g-5"), missing: 50 } });
  });

  it("rechaza puntajes imposibles y respeta la pausa de premios", () => {
    for (const score of [-5, 10.5, maxPlausibleScore(rules) + 1]) expect(resolveGamePrize({ ...base, score }).kind).toBe("invalid");
    expect(resolveGamePrize({ ...base, score: 500, durationSec: 300 }).kind).toBe("invalid");
    expect(resolveGamePrize({ ...base, score: 500, config: { ...config, active: false } }).kind).toBe("inactive");
  });
});

describe("el cupón en la tienda", () => {
  beforeEach(() => setDemoData(defaultDemoData()));

  it("se valida y descuenta en el carrito como cualquier cupón", () => {
    const coupon = gamePrizeCoupon(tier("g-10"), "qwert", now, 7);
    setDemoData({ ...demoData(), coupons: [...demoData().coupons, coupon] });
    const check = validateCoupon(coupon.code.toLowerCase(), { subtotal: 40000, isRegistered: false, now });
    expect(check.ok).toBe(true);
    expect(couponDiscount(coupon, 40000)).toBe(4000);
    expect(validateCoupon(coupon.code, { subtotal: 40000, isRegistered: false, now: new Date("2026-10-21T12:00:00Z") }).ok).toBe(false);
  });

  it("Mis cupones muestra los del juego propios (con su origen) y nunca los de otra persona", () => {
    const mine = gamePrizeCoupon(tier("g-5"), "mine1", now, 7);
    const other = gamePrizeCoupon(tier("g-5"), "other", now, 7);
    setDemoData({ ...demoData(), coupons: [...demoData().coupons, mine, other] });
    const list = walletCoupons({ subtotal: 30000, isRegistered: false, now, wheelCode: null, gameCodes: [mine.code] });
    expect(list.find((w) => w.coupon.code === mine.code)).toMatchObject({ origin: "juego", status: "available" });
    expect(list.some((w) => w.coupon.code === other.code)).toBe(false);
    expect(list[0]!.origin).toBe("juego");
  });
});
