import { describe, expect, it } from "vitest";
import { quotePack } from "@/demo/engine/packs";
import { programPack, programPerDay } from "@/demo/engine/program";
import { recommendStack } from "@/demo/engine/quiz";
import { products } from "@/demo/fixtures/products";
import { programTitle, toggleGoal } from "@/features/quiz/quiz-steps";

/** L4 · quiz con varios objetivos y deporte: el tope de objetivos, el título del resultado y el costo por día del programa. */
describe("objetivos del quiz (hasta 3)", () => {
  it("marca y desmarca en el orden en que se eligen", () => {
    expect(toggleGoal([], "fuerza", true)).toEqual({ goals: ["fuerza"], blocked: false });
    expect(toggleGoal(["fuerza"], "salud", true)).toEqual({ goals: ["fuerza", "salud"], blocked: false });
    expect(toggleGoal(["fuerza", "salud"], "fuerza", false)).toEqual({ goals: ["salud"], blocked: false });
    expect(toggleGoal(["fuerza"], "fuerza", true)).toEqual({ goals: ["fuerza"], blocked: false });
  });

  it("con 3 elegidos, un cuarto no se marca ni reemplaza a otro: avisa", () => {
    const three = ["fuerza", "salud", "energia"] as const;
    expect(toggleGoal([...three], "resistencia", true)).toEqual({ goals: [...three], blocked: true });
    // Desmarcar con el tope lleno sigue andando, y después entra otro.
    const two = toggleGoal([...three], "salud", false).goals;
    expect(toggleGoal(two, "resistencia", true)).toEqual({ goals: ["fuerza", "energia", "resistencia"], blocked: false });
  });
});

describe("título del resultado", () => {
  it("objetivos y deporte en una frase", () => {
    expect(programTitle(["Fuerza", "Salud"], "Fútbol")).toBe("Tu programa para fuerza, salud y fútbol");
    expect(programTitle(["Masa muscular"])).toBe("Tu programa para masa muscular");
    expect(programTitle(["Fuerza"], null)).toBe("Tu programa para fuerza");
    expect(programTitle(["Resistencia"], "CrossFit")).toBe("Tu programa para resistencia y CrossFit");
    expect(programTitle([])).toBe("Tu programa");
  });
});

describe("Tu programa: costo por día", () => {
  const result = recommendStack({ goals: ["fuerza", "salud"], sport: "boxeo", days: "3-4", time: "tarde", restrictions: [] }, products);
  const quote = quotePack(programPack(result)!);

  it("un servicio de cada suplemento al precio del pack (el equipamiento no cuenta)", () => {
    const daily = quote.lines.filter((l) => l.recurring);
    expect(daily.length).toBeGreaterThan(1);
    const full = daily.reduce((s, l) => s + l.unitPrice / l.variant.servings!, 0);
    expect(programPerDay(quote)).toBe(Math.round(full * 0.9));
    expect(Number.isInteger(programPerDay(quote))).toBe(true);
  });

  it("sin servicios informados no se puede estimar", () => {
    const [first, ...rest] = quote.lines;
    const blind = { ...quote, lines: [{ ...first!, recurring: true, variant: { ...first!.variant, servings: undefined } }, ...rest] };
    expect(programPerDay(blind)).toBeNull();
    expect(programPerDay({ ...quote, lines: quote.lines.filter((l) => !l.recurring) })).toBeNull();
  });
});
