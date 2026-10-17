import { describe, expect, it } from "vitest";
import {
  compareCategory, compareHref, otherTypeNotice, parseCompareParam, pickerCategory, replaceCompare, sameTypeOnly, toggleCompare,
} from "@/demo/engine/compare-tray";
import { products } from "@/demo/fixtures/products";

/** Categorías de la bandeja: los fixtures reales y unos de mentira (a–d: proteínas; x: creatina). */
const FAKE: Record<string, string> = { a: "proteinas", b: "proteinas", c: "proteinas", d: "proteinas", x: "creatinas" };
const of = (slug: string) => FAKE[slug] ?? products.find((p) => p.slug === slug)?.categorySlug;

describe("bandeja: hasta 3", () => {
  it("máximo 3: el cuarto no entra; tocar de nuevo saca", () => {
    let s = toggleCompare([], "a", of);
    s = toggleCompare(s.slugs, "b", of);
    s = toggleCompare(s.slugs, "c", of);
    expect(toggleCompare(s.slugs, "d", of)).toEqual({ slugs: ["a", "b", "c"], result: "full" });
    expect(toggleCompare(s.slugs, "b", of)).toEqual({ slugs: ["a", "c"], result: "removed" });
  });
  it("cambiar un producto (y si ya estaba, intercambian lugar)", () => {
    expect(replaceCompare(["a", "b", "c"], 1, "x")).toEqual(["a", "x", "c"]);
    expect(replaceCompare(["a", "b", "c"], 0, "c")).toEqual(["c", "b", "a"]);
  });
});

describe("solo productos del mismo tipo", () => {
  it("uno de otro tipo no entra (aunque haya lugar) y devuelve las dos categorías", () => {
    expect(toggleCompare(["ionic-whey"], "creatina-monohidrato", of)).toEqual({
      slugs: ["ionic-whey"], result: "other-type", current: "proteinas", incoming: "creatinas",
    });
    // Suplementos y equipamiento nunca se mezclan.
    expect(toggleCompare(["ionic-whey", "night-casein"], "shaker-volta", of).result).toBe("other-type");
    expect(toggleCompare(["guantes-boxeo"], "vendas-boxeo", of).result).toBe("added");
  });
  it("el tipo se avisa antes que el máximo; con la bandeja vacía entra cualquiera", () => {
    expect(toggleCompare(["a", "b", "c"], "x", of).result).toBe("other-type");
    expect(toggleCompare([], "x", of)).toEqual({ slugs: ["x"], result: "added" });
  });
  it("el aviso dice qué se compara y ofrece empezar con el otro tipo", () => {
    expect(otherTypeNotice("Proteínas", "Creatinas")).toEqual({
      title: "Solo se comparan productos del mismo tipo",
      description: "Estás comparando Proteínas.",
      action: "Empezar una comparación de Creatinas",
    });
  });
  it("una bandeja vieja que mezclaba tipos se limpia: queda el tipo del primero", () => {
    expect(sameTypeOnly(["ionic-whey", "shaker-volta", "night-casein", "creatina-brava"], of)).toEqual(["ionic-whey", "night-casein"]);
    expect(sameTypeOnly(["nada", "shaker-volta", "ionic-whey", "shaker-volta"], of)).toEqual(["shaker-volta"]);
    expect(sameTypeOnly([], of)).toEqual([]);
    expect(compareCategory(["nada", "creatina-brava"], of)).toBe("creatinas");
  });
  it("el selector de /comparar/ se limita al tipo de los demás (cambiar el único: cualquiera)", () => {
    expect(pickerCategory(["ionic-whey", "night-casein"], of)).toBe("proteinas");
    expect(pickerCategory(["ionic-whey", "night-casein"], of, 0)).toBe("proteinas");
    expect(pickerCategory(["ionic-whey"], of, 0)).toBeNull();
  });
});

describe("link ?p=", () => {
  it("solo productos que existen, sin repetir, hasta 3", () => {
    const p = parseCompareParam("ionic-whey,nada,ionic-whey,night-casein,isolate-zero,proteina-vegana", of);
    expect(p).toEqual({ slugs: ["ionic-whey", "night-casein", "isolate-zero"], mixed: false });
    expect(parseCompareParam(null, of)).toEqual({ slugs: [], mixed: false });
    expect(compareHref(["a", "b"])).toBe("/comparar/?p=a,b");
  });
  it("un link que mezcla tipos queda con el tipo del primero y lo marca", () => {
    expect(parseCompareParam("ionic-whey,shaker-volta", of)).toEqual({ slugs: ["ionic-whey"], mixed: true });
    expect(parseCompareParam("omega-3,glutamina,colageno", of).mixed).toBe(true);
  });
});
