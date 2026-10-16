import { describe, expect, it } from "vitest";
import { isGear } from "@/demo/engine/catalog";
import { quotePack } from "@/demo/engine/packs";
import { quoteCart } from "@/demo/engine/pricing";
import { PROGRAM_PACK_ID, programFocus, programPack } from "@/demo/engine/program";
import { quizGoals, recommendStack } from "@/demo/engine/quiz";
import { decodeGoals, decodeSport, defaultStack, encodeStack, goalSlots, slotOptions } from "@/demo/engine/stack-builder";
import { createSubscription, monthlyAmount, subscriptionsFromLines } from "@/demo/engine/subscriptions";
import { goals } from "@/demo/fixtures/goals";
import { packs } from "@/demo/fixtures/packs";
import { products } from "@/demo/fixtures/products";
import { sports } from "@/demo/fixtures/sports";

/** L4: deportes, stacks con varios objetivos y el programa del quiz como pack mensual. */
const base = { days: "3-4" as const, time: "tarde" as const, restrictions: [] };

describe("deportes", () => {
  it("son 12, cada uno con objetivos reales, equipamiento del catálogo y, si tiene, un pack que existe", () => {
    expect(sports).toHaveLength(12);
    expect(new Set(sports.map((s) => s.id)).size).toBe(12);
    for (const s of sports) {
      expect(s.goals.length).toBeGreaterThan(0);
      for (const g of s.goals) expect(goals.some((x) => x.id === g)).toBe(true);
      for (const slug of s.gear) expect(isGear(products.find((p) => p.slug === slug)!)).toBe(true);
      if (s.packId) expect(packs.some((p) => p.id === s.packId)).toBe(true);
      expect(s.hue).toMatch(/^#[0-9a-f]{6}$/);
    }
  });
});

describe("stack con varios objetivos", () => {
  it("une los lugares de cada objetivo por importancia, sin repetir", () => {
    expect(goalSlots("fuerza")).toEqual(["base", "creatina", "energia"]);
    expect(goalSlots(["fuerza", "salud"])).toEqual(["base", "extra", "creatina", "energia"]);
    expect(goalSlots(["definicion", "resistencia"])).toEqual(["base", "extra", "energia"]);
  });

  it("fuerza + salud: un producto por lugar, ninguno repetido, y el extra es de salud", () => {
    const picks = defaultStack(["fuerza", "salud"], products);
    expect(picks.map((p) => p.slot)).toEqual(["base", "extra", "creatina", "energia"]);
    expect(new Set(picks.map((p) => p.slug)).size).toBe(picks.length);
    expect(products.find((p) => p.slug === picks.find((x) => x.slot === "extra")!.slug)!.categorySlug).toBe("salud");
  });

  it("en el extra gana lo que cubre más objetivos; a igualdad, el del primero", () => {
    const both = slotOptions("extra", ["resistencia", "definicion"], products)[0]!;
    expect(both.goals).toEqual(expect.arrayContaining(["resistencia", "definicion"]));
    expect(slotOptions("extra", ["resistencia", "salud"], products)[0]!.goals).toEqual(expect.arrayContaining(["resistencia", "salud"]));
    expect(slotOptions("extra", ["recuperacion", "energia"], products)[0]!.goals).toContain("recuperacion");
  });

  it("la URL lleva varios objetivos y el deporte, y descarta lo que no existe", () => {
    const q = new URLSearchParams(encodeStack(["fuerza", "salud"], [], "futbol"));
    expect(q.get("objetivo")).toBe("fuerza,salud");
    expect(q.get("deporte")).toBe("futbol");
    expect(decodeGoals("fuerza,volar,salud,fuerza")).toEqual(["fuerza", "salud"]);
    expect(decodeGoals("fuerza,salud,energia,definicion")).toHaveLength(3);
    expect(decodeSport("ajedrez")).toBeNull();
    expect(decodeSport("tenis")).toBe("tenis");
  });
});

describe("quiz con deporte", () => {
  it("suma los objetivos del deporte después de los elegidos y lo avisa", () => {
    expect(quizGoals({ goals: ["fuerza"], sport: "futbol" })).toEqual(["fuerza", "resistencia", "recuperacion"]);
    const r = recommendStack({ ...base, goals: ["fuerza"], sport: "futbol" }, products);
    expect(r.notes[0]).toBe("Para fútbol sumamos resistencia y recuperación.");
    expect(new Set(r.picks.map((p) => p.slug)).size).toBe(r.picks.length);
    expect(r.picks.some((p) => p.reasons.includes("Te sirve para fútbol"))).toBe(true);
  });

  it("propone el equipamiento del deporte aparte del stack", () => {
    const r = recommendStack({ ...base, goals: ["resistencia"], sport: "boxeo" }, products);
    expect(r.gear.map((g) => g.product.slug)).toEqual(["vendas-boxeo", "guantes-boxeo"]);
    expect(r.picks.every((p) => !isGear(products.find((x) => x.slug === p.slug)!))).toBe(true);
  });

  it("solo gimnasio: sin equipamiento ni avisos de deporte", () => {
    const r = recommendStack({ ...base, goals: ["fuerza", "salud"], sport: null }, products);
    expect(r.gear).toEqual([]);
    expect(r.sport).toBeNull();
    expect(r.picks).toHaveLength(4);
  });
});

describe("Tu programa (pack a medida del quiz)", () => {
  const result = recommendStack({ ...base, goals: ["fuerza", "salud"], sport: "boxeo" }, products);
  const pack = programPack(result)!;

  it("lleva el stack y el primer equipamiento del deporte, con los descuentos de un pack", () => {
    expect(pack.id).toBe(PROGRAM_PACK_ID);
    expect(pack.custom).toBe(true);
    expect(pack.focus).toBe("Fuerza + Salud · Boxeo");
    expect(pack.items.map((i) => i.productSlug)).toEqual([...result.picks.map((p) => p.slug), "vendas-boxeo"]);
    const q = quotePack(pack);
    expect(q.available).toBe(true);
    expect(q.lines.filter((l) => !l.recurring).map((l) => l.product.slug)).toEqual(["vendas-boxeo"]);
    expect(q.price).toBe(q.subtotal - Math.round(q.subtotal * 0.1));
  });

  it("sin deporte ni objetivos alcanza con el foco genérico; con menos de dos suplementos no hay programa", () => {
    expect(programFocus({ chosen: [], sport: null })).toBe("Tu entrenamiento");
    expect(programPack({ ...result, picks: result.picks.slice(0, 1) })).toBeNull();
  });

  it("en el carrito da el descuento del pack solo si se le pasa el pack a medida", () => {
    const lines = pack.items.map((i, n) => ({ id: `l${n}`, productSlug: i.productSlug, variantId: i.variantId!, quantity: 1, packId: pack.id, monthlyDay: 10 }));
    expect(quoteCart(lines).pack.discount).toBe(0);
    const q = quoteCart(lines, { packs: [pack] });
    expect(q.pack.entries).toEqual([expect.objectContaining({ packId: PROGRAM_PACK_ID, pct: 15, monthly: true })]);
    expect(q.stack.discount).toBe(0);
  });

  it("la suscripción guarda una copia del pack: el monto mensual sale aunque no esté en el catálogo", () => {
    const lines = pack.items.map((i, n) => ({ id: `l${n}`, productSlug: i.productSlug, variantId: i.variantId!, quantity: 1, packId: pack.id, monthlyDay: 10 }));
    const [sub] = subscriptionsFromLines(lines, [...packs, pack], { today: "2026-10-05", orderCode: "X", newId: () => "s1" });
    expect(sub!.pack?.name).toBe("Tu programa");
    expect(monthlyAmount(sub!, packs)).toBe(quotePack(pack).monthlyPrice);
    const listed = createSubscription({ pack: packs[0]!, choices: {}, day: 3, today: "2026-10-05", orderCode: "Y", id: "s2" });
    expect(listed.pack).toBeUndefined();
  });
});
