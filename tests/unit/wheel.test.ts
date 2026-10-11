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
