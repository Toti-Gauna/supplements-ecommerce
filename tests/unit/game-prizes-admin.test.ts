import { describe, expect, it } from "vitest";
import { checkGamePrizes, gamePrizeLabel, hasGamePrizeErrors, newGameTier, normalizeGamePrizes, scorePreview, tierSentence } from "@/demo/admin/game-prizes";
import { resolveGamePrize } from "@/demo/engine/game-prize";
import { defaultDemoData } from "@/demo/engine/source";
import { gamePrizes, gameRules as rules, type GamePrizeConfig, type GamePrizeTier } from "@/demo/fixtures/game";

const tier = (p: Partial<GamePrizeTier>): GamePrizeTier => ({ id: "t", minScore: 300, label: "", kind: "PERCENT", value: 5, validDays: 7, ...p });
const config = (tiers: GamePrizeTier[], active = true): GamePrizeConfig => ({ active, tiers });
const now = new Date("2026-10-12T18:00:00Z");

describe("premios del juego en el panel", () => {
  it("arranca con los premios de muestra guardados en los datos del panel", () => {
    expect(defaultDemoData().game).toEqual(gamePrizes);
    expect(hasGamePrizeErrors(checkGamePrizes(gamePrizes, rules))).toBe(false);
  });

  it("arma el nombre del premio con el tipo y el valor, sin cortes de línea", () => {
    expect(gamePrizeLabel("PERCENT", 10)).toBe("10 % OFF");
    expect(gamePrizeLabel("FIXED", 3000)).toBe("$3.000 OFF");
    expect(gamePrizeLabel("FREE_SHIPPING", 99)).toBe("Envío gratis");
  });

  it("valida puntaje, valor y vencimiento de cada nivel", () => {
    const bad = config([
      tier({ id: "a", minScore: 10, value: 0, validDays: 0 }),
      tier({ id: "b", minScore: 800, kind: "FIXED", value: 300.5, validDays: 120 }),
      tier({ id: "c", minScore: 800, kind: "FREE_SHIPPING", value: 0 }),
    ]);
    const e = checkGamePrizes(bad, rules);
    expect(e.tiers.a).toEqual({ minScore: "Entre 50 y 20.000 puntos.", value: "El porcentaje va de 1 a 50.", validDays: "De 1 a 90 días." });
    expect(e.tiers.b).toMatchObject({ minScore: "Otro nivel ya empieza en ese puntaje.", value: expect.stringContaining("pesos enteros"), validDays: "De 1 a 90 días." });
    expect(e.tiers.c).toEqual({ minScore: "Otro nivel ya empieza en ese puntaje." });
  });

  it("pide entre 1 y 5 niveles y avisa si nadie puede llegar al puntaje", () => {
    expect(checkGamePrizes(config([]), rules).general).toEqual(["Dejá al menos un nivel de premio (o pausá los premios)."]);
    const six = Array.from({ length: 6 }, (_, i) => tier({ id: `t${i}`, minScore: 100 * (i + 1) }));
    expect(checkGamePrizes(config(six), rules).general[0]).toMatch(/Hasta 5 niveles/);
    const short = { ...rules, durationSec: 2 };
    expect(checkGamePrizes(config([tier({ minScore: 15_000 })]), short).tiers.t?.minScore).toMatch(/Nadie puede hacer 15\.000 puntos/);
  });

  it("al guardar ordena por puntaje, rearma los nombres y el envío gratis no lleva valor", () => {
    const out = normalizeGamePrizes(config([tier({ id: "b", minScore: 900, kind: "FREE_SHIPPING", value: 12 }), tier({ id: "a", minScore: 200, value: 15, label: "viejo" })]));
    expect(out.tiers.map((t) => [t.id, t.label, t.value])).toEqual([["a", "15 % OFF", 15], ["b", "Envío gratis", 0]]);
  });

  it("un nivel nuevo va arriba del último con un premio un poco mejor", () => {
    expect(newGameTier(gamePrizes.tiers, "n")).toMatchObject({ id: "n", minScore: 2000, kind: "PERCENT", value: 15, validDays: 7 });
    expect(newGameTier([tier({ minScore: 800, value: 10, validDays: 3 })], "n")).toMatchObject({ minScore: 1300, value: 15, validDays: 3 });
  });

  it("la vista previa dice qué se gana con un puntaje y cuánto falta para el próximo", () => {
    expect(tierSentence(gamePrizes.tiers[1]!)).toBe("Con 800 puntos ganás 10 % OFF (vence a los 7 días).");
    expect(scorePreview(950, gamePrizes)).toBe("Con 950 puntos ganás 10 % OFF. Con 550 más llega a envío gratis.");
    expect(scorePreview(120, gamePrizes)).toBe("Con 120 puntos todavía no hay premio. Con 180 más llega a 5 % OFF.");
    expect(scorePreview(1600, gamePrizes)).toBe("Con 1.600 puntos ganás envío gratis. Es el premio más alto.");
    expect(scorePreview(1600, { ...gamePrizes, active: false })).toMatch(/pausados/);
  });

  it("el juego usa lo guardado: el cupón vence según el nivel ganado", () => {
    const edited = normalizeGamePrizes(config([tier({ id: "x", minScore: 500, value: 20, validDays: 3 })]));
    const out = resolveGamePrize({ score: 620, durationSec: 45, now, prizes: [], config: edited, rules, seed: "abcde" });
    expect(out.kind).toBe("won");
    if (out.kind !== "won") return;
    expect(out.coupon).toMatchObject({ type: "PERCENT", value: 20, endsAt: "2026-10-15", description: "Shaker Rush: 20 % OFF" });
  });
});
