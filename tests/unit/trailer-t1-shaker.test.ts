import { describe, expect, it } from "vitest";
import { frameAt, playShaker, shakerClock } from "@/trailer/recipes/shaker-sim";

describe("T1 · Shaker Rush jugado por el piloto automático", () => {
  const r = playShaker();
  const clock = shakerClock(r);

  it("la partida termina por tiempo y es la misma en cada corrida", () => {
    expect(r.end).toBeCloseTo(45, 6);
    expect(frameAt(r, r.end).phase).toBe("over");
    expect(playShaker().frames.at(-1)!.score).toBe(r.frames.at(-1)!.score);
  });

  it("las tres últimas atrapadas caen en 0, ½ y 1 tiempo, y el final en 2", () => {
    const [c1, c2, c3] = r.catches.slice(-3);
    expect([clock(0), clock(0.5), clock(1), clock(2)]).toEqual([c1, c2, c3, r.end]);
  });

  it("el reloj se re-cronometra apenas: entre 0,8× y 1,2× de la velocidad real, sin retroceder", () => {
    const beat = 60 / 128;
    for (const [a, b] of [[0, 0.5], [0.5, 1], [1, 2]] as const) {
      const speed = (clock(b) - clock(a)) / ((b - a) * beat);
      expect(speed).toBeGreaterThan(0.8);
      expect(speed).toBeLessThan(1.2);
    }
    let prev = -Infinity;
    for (let u = -0.5; u <= 3; u += 0.01) { const t = clock(u); expect(t).toBeGreaterThanOrEqual(prev); prev = t; }
  });

  it("la atrapada se ve en su cuadro: el puntaje sube justo ahí", () => {
    const c3 = r.catches.at(-1)!;
    expect(frameAt(r, c3).score).toBeGreaterThan(frameAt(r, c3 - 0.05).score);
  });
});
