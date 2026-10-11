import { describe, expect, it } from "vitest";
import { landingRotation, pickSegment, prizeCoupon, probability, rotationFor, segmentAt } from "@/demo/engine/wheel";
import { defaultWheel } from "@/demo/fixtures/wheel";

describe("ruleta de cupones", () => {
  it("sorteo ponderado determinista con rng inyectado", () => {
    expect(pickSegment(defaultWheel, () => 0)?.segment.id).toBe("w5");
    expect(pickSegment(defaultWheel, () => 0.9999)?.segment.id).toBe("wship2");
  });
  it("ignora segmentos inactivos y la ruleta apagada", () => {
    const cfg = { ...defaultWheel, segments: defaultWheel.segments.map((s) => ({ ...s, active: s.id === "w10" })) };
    expect(pickSegment(cfg, () => 0.5)?.segment.id).toBe("w10");
    expect(pickSegment({ ...defaultWheel, active: false })).toBeNull();
  });
  it("el sorteo respeta los pesos: barrer el azar de 0 a 1 reparte los gajos según su peso", () => {
    const counts = new Map<string, number>();
    for (let i = 0; i < 100; i++) {
      const id = pickSegment(defaultWheel, () => (i + 0.5) / 100)!.segment.id;
      counts.set(id, (counts.get(id) ?? 0) + 1);
    }
    expect(Object.fromEntries(counts)).toEqual({ w5: 26, wship: 20, wmuestra: 16, w10: 12, w3000: 12, wshaker: 6, w15: 4, wship2: 4 });
    expect(probability(defaultWheel, defaultWheel.segments.find((s) => s.id === "wshaker")!)).toBeCloseTo(0.06);
  });
  it("un gajo con peso 0 nunca sale aunque esté activo", () => {
    const cfg = { ...defaultWheel, segments: defaultWheel.segments.map((s) => (s.id === "w5" ? { ...s, weight: 0 } : s)) };
    for (let i = 0; i < 50; i++) expect(pickSegment(cfg, () => i / 50)?.segment.id).not.toBe("w5");
    expect(probability(cfg, cfg.segments[0]!)).toBe(0);
  });
  it("las probabilidades suman 1", () => {
    const sum = defaultWheel.segments.reduce((s, x) => s + probability(defaultWheel, x), 0);
    expect(sum).toBeCloseTo(1);
  });
  it("la rotación deja el segmento bajo el puntero", () => {
    const deg = rotationFor(2, 8, 6, 0.5);
    const landed = ((360 - (deg % 360)) % 360) / 45;
    expect(Math.floor(landed)).toBe(2);
  });
  it("el premio es un cupón de un uso con vencimiento", () => {
    const c = prizeCoupon(defaultWheel.segments[4]!, "ab12z", new Date("2026-10-04T12:00:00Z"), 7);
    expect(c).toMatchObject({ code: "RULETAAB12Z", type: "FIXED", value: 3000, maxUses: 1, endsAt: "2026-10-11", minSubtotal: 25000 });
  });
  it("cada gajo de muestra da un cupón válido para el carrito, con código RULETA y vencimiento", () => {
    for (const seg of defaultWheel.segments) {
      const c = prizeCoupon(seg, "x9-z", new Date("2026-10-11T12:00:00Z"), defaultWheel.validDays);
      expect(c.code).toMatch(/^RULETA[A-Z0-9]{1,5}$/);
      expect(["PERCENT", "FIXED", "FREE_SHIPPING"]).toContain(c.type);
      expect(Number.isInteger(c.value)).toBe(true);
      expect(c).toMatchObject({ active: true, maxUses: 1, usedCount: 0, endsAt: "2026-10-18", description: expect.stringMatching(/^Ruleta: /) });
    }
  });
  it("segmentAt: el gajo bajo el puntero cambia justo en los bordes", () => {
    expect(segmentAt(0, 8)).toBe(0);
    expect(segmentAt(-1, 8)).toBe(0);
    expect(segmentAt(1, 8)).toBe(7);
    expect(segmentAt(-44.9, 8)).toBe(0);
    expect(segmentAt(-45.1, 8)).toBe(1);
    expect(segmentAt(360 * 5 - 90, 8)).toBe(2);
  });
  it("el frenado deja el gajo sorteado bajo el puntero, en los dos sentidos y desde cualquier posición", () => {
    for (const count of [6, 8]) {
      for (const current of [0, 37, -410, 1234.5]) {
        for (let index = 0; index < count; index++) {
          for (const dir of [1, -1] as const) {
            for (const jitter of [0, 0.5, 1]) {
              const target = landingRotation(current, index, count, dir, 4, jitter);
              expect(segmentAt(target, count)).toBe(index);
              // Gira hacia donde se tiró y al menos las vueltas pedidas.
              expect(dir * (target - current)).toBeGreaterThanOrEqual(4 * 360);
              expect(dir * (target - current)).toBeLessThan(5 * 360);
            }
          }
        }
      }
    }
  });
});
