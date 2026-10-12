import { describe, expect, it } from "vitest";
import { recommendStack } from "@/demo/engine/quiz";
import { products } from "@/demo/fixtures/products";

describe("quiz ¿Qué necesitás?", () => {
  it("fuerza, 3-4 días a la tarde: base, creatina y pre, cada uno con su porqué", () => {
    const r = recommendStack({ goal: "fuerza", days: "3-4", time: "tarde", restrictions: [] }, products);
    expect(r.picks.map((p) => p.slug)).toEqual(["ionic-whey", "creatina-monohidrato", "overvolt-pre"]);
    expect(r.picks.every((p) => p.reasons.length > 0)).toBe(true);
    expect(r.notes).toEqual([]);
  });

  it("de noche el pre va sin cafeína y lo avisa", () => {
    const r = recommendStack({ goal: "fuerza", days: "3-4", time: "noche", restrictions: [] }, products);
    expect(r.picks.find((p) => p.slot === "energia")!.slug).toBe("pump-flow");
    expect(r.notes.join(" ")).toMatch(/noche/);
  });

  it("con 5 o más días suma un extra de recuperación", () => {
    const r = recommendStack({ goal: "fuerza", days: "5+", time: "manana", restrictions: [] }, products);
    expect(r.picks).toHaveLength(4);
    expect(r.picks.at(-1)!.slot).toBe("extra");
  });

  it("vegano: todo lo recomendado tiene el sello", () => {
    const r = recommendStack({ goal: "masa-muscular", days: "3-4", time: "tarde", restrictions: ["vegano"] }, products);
    const bySlug = (s: string) => products.find((p) => p.slug === s)!;
    expect(r.picks.length).toBeGreaterThanOrEqual(3);
    expect(r.picks.every((p) => bySlug(p.slug).badges?.includes("vegano"))).toBe(true);
    expect(r.picks.find((p) => p.slot === "base")!.slug).toBe("proteina-vegana");
  });

  it("si una restricción deja un lugar vacío, lo dice", () => {
    const r = recommendStack({ goal: "fuerza", days: "3-4", time: "tarde", restrictions: ["vegano", "sin-azucar"] }, products);
    expect(r.notes.join(" ")).toMatch(/completar el estante/);
  });
});
