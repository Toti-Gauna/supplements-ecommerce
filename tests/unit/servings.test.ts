import { describe, expect, it } from "vitest";
import { bestValueSize, daysLasting, pricePerServing, reminderOn, runsOutOn, servingSavingsPct, variantPrice } from "@/demo/engine/servings";
import { creatineGrams, proteinFromLabel, proteinPlan } from "@/demo/engine/dose";
import { products } from "@/demo/fixtures/products";

const whey = products.find((p) => p.slug === "ionic-whey")!;
const omega = products.find((p) => p.slug === "omega-3")!;
const isolate = products.find((p) => p.slug === "isolate-zero")!;

describe("servicios y duración", () => {
  it("precio por servicio en pesos enteros; sin servicios no hay precio", () => {
    expect(pricePerServing(54900, 30)).toBe(1830);
    expect(pricePerServing(116900, 75)).toBe(1559);
    expect(pricePerServing(1000, undefined)).toBeNull();
    expect(pricePerServing(1000, 0)).toBeNull();
  });

  it("la presentación grande gana por servicio y se calcula por sabor", () => {
    const choco5 = whey.variants.find((v) => v.id === "iw-chocolate-5lb")!;
    expect(variantPrice(whey, choco5)).toBe(116900);
    expect(bestValueSize(whey, "Chocolate")).toBe("5 lb (2,27 kg)");
    expect(bestValueSize(omega)).toBe("120 cápsulas");
    // Un solo tamaño: no hay "mejor precio" que destacar.
    expect(bestValueSize(isolate, "Chocolate")).toBeNull();
    expect(servingSavingsPct(whey, "Chocolate")).toBe(15);
  });

  it("cuánto dura el envase y cuándo avisar", () => {
    expect(daysLasting(30, 1)).toBe(30);
    expect(daysLasting(30, 2)).toBe(15);
    expect(daysLasting(1, 3)).toBe(1);
    expect(daysLasting(0, 1)).toBe(0);
    expect(runsOutOn("2026-10-04", 30)).toBe("2026-11-03");
    expect(reminderOn("2026-10-04", 30)).toBe("2026-10-29");
    expect(reminderOn("2026-10-04", 3)).toBe("2026-10-04");
  });
});

describe("calculadoras orientativas", () => {
  it("creatina: 0,05 g/kg redondeado a medio gramo, entre 3 y 5 g", () => {
    expect(creatineGrams(50)).toBe(3);
    expect(creatineGrams(70)).toBe(3.5);
    expect(creatineGrams(80)).toBe(4);
    expect(creatineGrams(200)).toBe(5);
  });

  it("proteína del día por objetivo y lo que suma un scoop", () => {
    expect(proteinPlan(75, "masa-muscular", 24)).toEqual({ dayMin: 120, dayMax: 165, servingShare: 20 });
    expect(proteinPlan(10, "salud", 24).dayMin).toBe(40);
    expect(proteinFromLabel(whey.nutrition?.rows)).toBe(24);
    expect(proteinFromLabel(omega.nutrition?.rows)).toBeNull();
  });
});
