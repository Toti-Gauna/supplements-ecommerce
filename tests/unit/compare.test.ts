import { describe, expect, it } from "vitest";
import { comparabilityNote, compareSuggestions, compareTable } from "@/demo/engine/compare";
import { DEMO_TODAY } from "@/demo/fixtures/admin-orders";
import { products } from "@/demo/fixtures/products";

const get = (slug: string) => products.find((p) => p.slug === slug)!;
const row = (t: ReturnType<typeof compareTable>, key: string) => t.rows.find((r) => r.key === key)!;
const best = (t: ReturnType<typeof compareTable>, key: string) => row(t, key).cells.map((c) => c.best);

describe("tabla del comparador", () => {
  const t = compareTable([get("ionic-whey"), get("proteina-vegana"), get("isolate-zero")], DEMO_TODAY);
  it("compara la presentación de la tarjeta y marca el mejor de cada renglón", () => {
    expect(t.comparability).toBe("full");
    expect(t.columns[0]!.presentation).toBe("Chocolate · 5 lb (2,27 kg)");
    expect(row(t, "price").cells.map((c) => c.value)).toEqual([116900, 48900, 72500]);
    expect(best(t, "price")).toEqual([false, true, false]);
    // Por servicio la vegana ($ 1.482) le gana al whey de 5 lb ($ 1.559).
    expect(best(t, "perServing")).toEqual([false, true, false]);
    expect(best(t, "protein")).toEqual([false, false, true]);
    expect(best(t, "servings")).toEqual([true, false, false]);
    expect(row(t, "days").cells[0]!.text).toBe("75 días");
  });
  it("vencimiento del lote que sale primero (FEFO): gana el que vence más lejos", () => {
    const v = compareTable([get("ionic-whey"), get("night-casein")], DEMO_TODAY);
    const expiry = row(v, "expiry");
    expect(expiry.cells.every((c) => /^\d{2}\/\d{4}$/.test(c.text))).toBe(true);
    expect(expiry.cells.some((c) => c.best) || new Set(expiry.cells.map((c) => c.value)).size === 1).toBe(true);
  });
  it("sellos y marca no se marcan", () => {
    expect(best(t, "badges")).toEqual([false, false, false]);
    expect(row(t, "brand").cells.map((c) => c.text)).toEqual(["VOLTA Lab", "Ozono", "Krono Nutrition"]);
  });
  it("con empate no marca a nadie; con dos iguales mejores, marca a los dos", () => {
    const same = compareTable([get("bcaa-211"), get("pump-flow")], DEMO_TODAY);
    expect(best(same, "servings")).toEqual([false, false]);
  });
  it("solo equipamiento: precio, sellos y marca", () => {
    const gear = compareTable([get("guantes-boxeo"), get("vendas-boxeo")], DEMO_TODAY);
    expect(gear.comparability).toBe("price");
    expect(gear.rows.map((r) => r.key)).toEqual(["price", "badges", "brand"]);
    expect(best(gear, "price")).toEqual([false, true]);
    expect(comparabilityNote("full")).toBeNull();
  });
});

describe("parecidos para comparar", () => {
  it("de la misma categoría, con stock primero y del que más rinde al que menos", () => {
    const list = compareSuggestions(get("ionic-whey"), 3, products);
    expect(list.map((p) => p.slug)).toEqual(["proteina-vegana", "night-casein", "isolate-zero"]);
    expect(list.every((p) => p.categorySlug === "proteinas")).toBe(true);
  });
  it("equipamiento: por precio, dentro de su categoría", () => {
    const list = compareSuggestions(get("guantes-boxeo"), 2, products);
    expect(list.map((p) => p.slug)).toEqual(["vendas-boxeo"]);
  });
});
