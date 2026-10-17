import { afterEach, describe, expect, it } from "vitest";
import { recommendStack } from "@/demo/engine/quiz";
import { defaultDemoData, setDemoData } from "@/demo/engine/source";
import { normalizeSports, sportErrors, sportInfo, sportList } from "@/demo/engine/sports";
import { decodeStack } from "@/demo/engine/stack-builder";
import { goalCards, goalStack, sportCards } from "@/demo/engine/stack-goals";
import { goals } from "@/demo/fixtures/goals";
import { packs } from "@/demo/fixtures/packs";
import { products } from "@/demo/fixtures/products";
import { sports } from "@/demo/fixtures/sports";

afterEach(() => setDemoData(defaultDemoData()));
const futbol = sports.find((s) => s.id === "futbol")!;

/** L5 · deportes editables desde el panel y el mismo criterio de precio en las tarjetas del inicio. */
describe("deportes editables desde el panel", () => {
  it("por defecto son los de muestra; una demo guardada sin deportes también", () => {
    expect(sportList().map((s) => s.id)).toEqual(sports.map((s) => s.id));
    setDemoData({ ...defaultDemoData(), sports: undefined as never });
    expect(sportList()).toHaveLength(12);
  });

  it("nombre, bajada, color y pack cambian; objetivos y equipamiento no; lo roto vuelve al de muestra", () => {
    const out = normalizeSports([{ ...futbol, name: "  Fútbol 5 ", pitch: "", hue: "#00FF88", packId: "boxeo", goals: ["salud"], gear: [] }, { ...sports[1]!, hue: "verde", packId: "no-existe" }], packs);
    expect(out).toHaveLength(12);
    expect(out[0]).toMatchObject({ name: "Fútbol 5", pitch: futbol.pitch, hue: "#00ff88", packId: "boxeo", goals: futbol.goals, gear: futbol.gear });
    expect(out[1]).toMatchObject({ hue: sports[1]!.hue, packId: undefined });
  });

  it("valida como los objetivos y avisa si el pack ya no existe", () => {
    expect(sportErrors(futbol, packs)).toEqual([]);
    expect(sportErrors({ ...futbol, name: "" }, packs)).toContain("Escribí el nombre del deporte.");
    expect(sportErrors({ ...futbol, pitch: "x".repeat(71) }, packs)).toHaveLength(1);
    expect(sportErrors({ ...futbol, packId: "x" }, packs)).toContain("Ese pack ya no existe: elegí otro o ninguno.");
  });

  it("la tienda (quiz e inicio incluidos) usa el nombre y el pack nuevos", () => {
    const data = defaultDemoData();
    setDemoData({ ...data, sports: normalizeSports([{ ...futbol, name: "Fútbol 11", packId: "salud" }], packs) });
    expect(sportInfo("futbol")?.name).toBe("Fútbol 11");
    const r = recommendStack({ goals: ["fuerza"], sport: "futbol", days: "3-4", time: "tarde", restrictions: [] }, data.products);
    expect(r.notes[0]).toMatch(/^Para fútbol 11 sumamos/);
    expect(sportCards(data.products).find((s) => s.id === "futbol")).toMatchObject({ name: "Fútbol 11", packId: "salud" });
  });
});

describe("tarjetas del inicio: objetivos con el mismo criterio que los deportes", () => {
  it("el stack del objetivo lleva el producto destacado en su lugar, y el link abre ese mismo estante", () => {
    const picks = goalStack("fuerza", "isolate-zero", products);
    expect(picks.find((p) => p.slot === "base")!.slug).toBe("isolate-zero");
    const card = goalCards(goals, products).find((c) => c.id === "fuerza")!;
    expect(card.summary.lines.length).toBeGreaterThanOrEqual(3);
    const stack = new URLSearchParams(card.href.split("?")[1]).get("stack");
    expect(decodeStack(stack, products).map((p) => p.slug)).toEqual(card.summary.lines.map((l) => l.product.slug));
  });

  it("si el objetivo no usa el lugar del destacado, lo suma; sin destacado, el stack sugerido", () => {
    const masa = goalStack("masa-muscular", "overvolt-pre", products);
    expect(masa.at(-1)).toMatchObject({ slot: "energia", slug: "overvolt-pre" });
    expect(goalStack("fuerza", undefined, products).length).toBe(3);
    expect(goalCards(goals, products).every((c) => c.summary.total > 0)).toBe(true);
  });
});
