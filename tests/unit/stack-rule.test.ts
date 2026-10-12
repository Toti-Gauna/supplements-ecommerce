import { describe, expect, it } from "vitest";
import { checkStackRule, hasStackRuleErrors, stackRuleExample, stackRuleLabel } from "@/demo/admin/stack-rule";
import { DEFAULT_STACK_RULE } from "@/demo/engine/stack";
import { products } from "@/demo/fixtures/products";

/** Fase 3 · editor de la regla del descuento stack (Marketing → Descuento stack). */
describe("regla del descuento stack", () => {
  it("valida porcentaje de 0 a 30 y de 2 a 5 categorías, enteros", () => {
    expect(checkStackRule(DEFAULT_STACK_RULE)).toEqual({});
    expect(checkStackRule({ pct: 0, minCategories: 2 })).toEqual({});
    expect(checkStackRule({ pct: 30, minCategories: 5 })).toEqual({});
    expect(checkStackRule({ pct: 31, minCategories: 3 }).pct).toMatch(/0 a 30 %/);
    expect(checkStackRule({ pct: -1, minCategories: 3 }).pct).toMatch(/0 a 30 %/);
    expect(checkStackRule({ pct: 12.5, minCategories: 3 }).pct).toMatch(/enteros/);
    expect(checkStackRule({ pct: 10, minCategories: 1 }).minCategories).toMatch(/2 a 5/);
    expect(checkStackRule({ pct: 10, minCategories: 6 }).minCategories).toMatch(/2 a 5/);
    expect(hasStackRuleErrors(checkStackRule({ pct: 40, minCategories: 9 }))).toBe(true);
    expect(hasStackRuleErrors({})).toBe(false);
  });

  it("se lee en una línea; con 0 % queda apagada", () => {
    expect(stackRuleLabel(DEFAULT_STACK_RULE)).toBe("10 % desde 3 categorías");
    expect(stackRuleLabel({ pct: 15, minCategories: 2 })).toBe("15 % desde 2 categorías");
    expect(stackRuleLabel({ pct: 0, minCategories: 3 })).toBe("Apagado (0 %)");
  });

  it("ejemplo real: whey + creatina + pre con la regla de fábrica, igual que el carrito", () => {
    const ex = stackRuleExample(DEFAULT_STACK_RULE, products);
    expect(ex.products.map((p) => p.slug)).toEqual(["ionic-whey", "creatina-monohidrato", "overvolt-pre"]);
    expect(ex.subtotal).toBe(121700);
    expect(ex.discount).toBe(12170);
    expect(ex.total).toBe(109530);
    expect(ex.complete).toBe(true);
  });

  it("el ejemplo sigue a la regla: 15 % desde 2 categorías y 5 categorías con extras", () => {
    const two = stackRuleExample({ pct: 15, minCategories: 2 }, products);
    expect(two.products).toHaveLength(2);
    expect(two.discount).toBe(Math.round(two.subtotal * 0.15));
    const five = stackRuleExample({ pct: 10, minCategories: 5 }, products);
    expect(new Set(five.products.map((p) => p.categorySlug)).size).toBe(5);
    expect(five.discount).toBeGreaterThan(0);
  });

  it("sin productos activos de suficientes categorías no inventa un ejemplo", () => {
    const onlyProtein = products.filter((p) => p.categorySlug === "proteinas");
    const ex = stackRuleExample(DEFAULT_STACK_RULE, onlyProtein);
    expect(ex.complete).toBe(false);
    expect(ex.discount).toBe(0);
  });
});
