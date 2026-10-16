import { afterEach, describe, expect, it } from "vitest";
import { goalErrors, goalInfo, goalList, normalizeGoals } from "@/demo/engine/goals";
import { recommendStack } from "@/demo/engine/quiz";
import { defaultDemoData, setDemoData } from "@/demo/engine/source";
import { goals } from "@/demo/fixtures/goals";

afterEach(() => setDemoData(defaultDemoData()));

describe("objetivos editables desde el panel", () => {
  it("por defecto son los de muestra", () => {
    expect(goalList().map((g) => g.id)).toEqual(goals.map((g) => g.id));
  });
  it("nombre, bajada y color cambian; ids y arte no; vacíos o colores rotos vuelven al de muestra", () => {
    const edited = normalizeGoals([{ ...goals[0]!, name: "  Volumen  ", pitch: "", hue: "#FF0000", art: "bar" }, { ...goals[1]!, hue: "rojo" }]);
    expect(edited).toHaveLength(goals.length);
    expect(edited[0]).toMatchObject({ id: "masa-muscular", name: "Volumen", pitch: goals[0]!.pitch, hue: "#ff0000", art: goals[0]!.art });
    expect(edited[1]!.hue).toBe(goals[1]!.hue);
  });
  it("la tienda (quiz incluido) usa el nombre nuevo", () => {
    const data = defaultDemoData();
    setDemoData({ ...data, goals: normalizeGoals([{ ...goals[1]!, name: "Fuerza bruta" }]) });
    expect(goalInfo("fuerza")?.name).toBe("Fuerza bruta");
    const result = recommendStack({ goals: ["fuerza"], sport: null, days: "3-4", time: "tarde", restrictions: [] }, data.products);
    expect(result.picks.some((p) => p.reasons.some((r) => r.includes("fuerza bruta")))).toBe(true);
  });
  it("valida nombre, largo de la bajada y color", () => {
    expect(goalErrors(goals[0]!)).toEqual([]);
    expect(goalErrors({ ...goals[0]!, name: " " })).toContain("Escribí el nombre del objetivo.");
    expect(goalErrors({ ...goals[0]!, pitch: "x".repeat(71) })).toHaveLength(1);
    expect(goalErrors({ ...goals[0]!, hue: "verde" })).toContain("Elegí un color.");
  });
});
