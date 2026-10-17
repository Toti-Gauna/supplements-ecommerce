import { describe, expect, it } from "vitest";
import { isGear } from "@/demo/engine/catalog";
import { defaultStack } from "@/demo/engine/stack-builder";
import { quizGoals } from "@/demo/engine/quiz";
import { builderHref, chooseSport, EMPTY_SELECTION, selectionFromUrl, sportCards, sportGear, stackHeadline, toggleGoal } from "@/demo/engine/stack-goals";
import { products } from "@/demo/fixtures/products";
import { sports } from "@/demo/fixtures/sports";

/** L4 · armador con varios objetivos y deporte. */
describe("objetivos del armador", () => {
  it("suma y saca objetivos, hasta 3; el cuarto no entra y avisa", () => {
    let sel = toggleGoal(EMPTY_SELECTION, "fuerza").selection;
    sel = toggleGoal(sel, "salud").selection;
    expect(sel.goals).toEqual(["fuerza", "salud"]);
    sel = toggleGoal(sel, "energia").selection;
    const fourth = toggleGoal(sel, "definicion");
    expect(fourth.capped).toBe(true);
    expect(fourth.selection.goals).toEqual(["fuerza", "salud", "energia"]);
    const off = toggleGoal(sel, "salud");
    expect(off.capped).toBe(false);
    expect(off.selection.goals).toEqual(["fuerza", "energia"]);
  });

  it("el deporte suma sus objetivos después de los elegidos, y al cambiarlo o sacarlo se van con él", () => {
    const base = toggleGoal(EMPTY_SELECTION, "fuerza").selection;
    const futbol = chooseSport(base, "futbol");
    expect(futbol).toEqual({ goals: ["fuerza", "resistencia", "recuperacion"], added: ["resistencia", "recuperacion"], sport: "futbol" });
    const tenis = chooseSport(futbol, "tenis");
    expect(tenis.goals).toEqual(["fuerza", "resistencia", "energia"]);
    expect(chooseSport(tenis, null)).toEqual({ goals: ["fuerza"], added: [], sport: null });
    // Si el objetivo ya estaba elegido, no se cuenta como sumado.
    const boxeo = chooseSport(base, "boxeo");
    expect(boxeo.added).toEqual(["resistencia"]);
    expect(chooseSport(boxeo, null).goals).toEqual(["fuerza"]);
  });

  it("el tope es de los elegidos: con 3 objetivos el deporte igual suma los suyos (como en el quiz)", () => {
    let sel = EMPTY_SELECTION;
    for (const g of ["fuerza", "salud", "definicion"] as const) sel = toggleGoal(sel, g).selection;
    const futbol = chooseSport(sel, "futbol");
    expect(futbol.goals).toEqual(["fuerza", "salud", "definicion", "resistencia", "recuperacion"]);
    expect(futbol.goals).toEqual(quizGoals({ goals: ["fuerza", "salud", "definicion"], sport: "futbol" }));
    expect(toggleGoal(futbol, "energia").capped).toBe(true);
    // Con un deporte que sumó dos, todavía se pueden elegir tres propios.
    let one = chooseSport(toggleGoal(EMPTY_SELECTION, "fuerza").selection, "futbol");
    one = toggleGoal(one, "salud").selection;
    expect(one.goals).toEqual(["fuerza", "salud", "resistencia", "recuperacion"]);
    expect(toggleGoal(one, "energia").selection.goals).toEqual(["fuerza", "salud", "energia", "resistencia", "recuperacion"]);
  });

  it("lee la URL: el link del inicio por deporte y un link viejo con un solo objetivo", () => {
    expect(selectionFromUrl(["resistencia", "recuperacion"], "futbol")).toEqual({ goals: ["resistencia", "recuperacion"], added: ["resistencia", "recuperacion"], sport: "futbol" });
    expect(selectionFromUrl([], "boxeo").goals).toEqual(["resistencia", "fuerza"]);
    expect(selectionFromUrl(["fuerza"], null)).toEqual({ goals: ["fuerza"], added: [], sport: null });
    expect(selectionFromUrl(["salud"], "padel")).toEqual({ goals: ["salud", "energia", "recuperacion"], added: ["energia", "recuperacion"], sport: "padel" });
  });

  it("titular y link al armador", () => {
    expect(stackHeadline(["Fuerza", "Salud"])).toBe("Tu stack para fuerza + salud");
    expect(stackHeadline(["Resistencia"], "Fútbol")).toBe("Tu stack para fútbol: resistencia");
    expect(stackHeadline([])).toBe("Tu stack");
    expect(builderHref(["fuerza", "salud"])).toBe("/crear/?objetivo=fuerza%2Csalud");
    expect(builderHref(["resistencia", "recuperacion"], "futbol")).toBe("/crear/?objetivo=resistencia%2Crecuperacion&deporte=futbol");
    expect(builderHref([])).toBe("/crear/");
  });
});

describe("deportes en el armador y en el inicio", () => {
  it("el equipamiento del deporte es del catálogo y tiene stock", () => {
    const gear = sportGear("boxeo", products);
    expect(gear.map((g) => g.product.slug)).toEqual(["vendas-boxeo", "guantes-boxeo"]);
    for (const g of gear) {
      expect(isGear(g.product)).toBe(true);
      expect(g.variant.stock).not.toBe(0);
    }
    expect(sportGear(null, products)).toEqual([]);
    const noStock = products.map((p) => (p.slug === "vendas-boxeo" ? { ...p, variants: p.variants.map((v) => ({ ...v, stock: 0 })) } : p));
    expect(sportGear("boxeo", noStock).map((g) => g.product.slug)).toEqual(["guantes-boxeo"]);
  });

  it("cada deporte tiene su tarjeta con el stack sugerido, sin repetir productos", () => {
    const cards = sportCards(products);
    expect(cards).toHaveLength(sports.length);
    for (const c of cards) {
      expect(c.summary.lines.length).toBe(defaultStack(c.goals, products).length);
      expect(c.summary.total).toBeGreaterThan(0);
      expect(new Set(c.summary.lines.map((l) => l.product.slug)).size).toBe(c.summary.lines.length);
      expect(c.href).toContain(`deporte=${c.id}`);
    }
  });
});
