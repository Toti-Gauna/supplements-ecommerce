import { describe, expect, it } from "vitest";
import { addRow, blankNutrition, blankUsage, cleanNutrition, cleanUsage, patchRow, removeRow } from "@/demo/admin/nutrition-form";
import { servingActive } from "@/demo/engine/sheet";
import { products } from "@/demo/fixtures/products";

/** R2 · rótulo y modo de uso editables en el panel: lo guardado es lo que lee la ficha. */
const whey = products.find((p) => p.slug === "ionic-whey")!;

describe("tabla nutricional del editor", () => {
  it("una tabla nueva trae los renglones del rótulo argentino, vacíos", () => {
    const n = blankNutrition();
    expect(n.rows.map((r) => r.label)).toContain("Proteínas");
    expect(n.rows.every((r) => r.serving === "")).toBe(true);
  });

  it("editar la proteína por porción cambia el marcador de la ficha", () => {
    const i = whey.nutrition!.rows.findIndex((r) => r.label === "Proteínas");
    const n = patchRow(whey.nutrition!, i, { serving: "25 g" });
    expect(servingActive(n)).toEqual({ label: "Proteína", amount: "25", unit: "g" });
    expect(whey.nutrition!.rows[i]!.serving).toBe("24 g");
  });

  it("los campos opcionales vacíos se quitan; agregar y quitar renglones", () => {
    const n = patchRow(whey.nutrition!, 0, { per100: " ", dv: "", sub: false });
    expect(n.rows[0]).not.toHaveProperty("per100");
    expect(n.rows[0]).not.toHaveProperty("dv");
    expect(n.rows[0]).not.toHaveProperty("sub");
    const more = addRow(n);
    expect(more.rows).toHaveLength(n.rows.length + 1);
    expect(removeRow(more, more.rows.length - 1).rows).toHaveLength(n.rows.length);
  });

  it("al guardar: afuera los renglones incompletos; una tabla vacía no se guarda", () => {
    const n = addRow({ ...whey.nutrition!, allergens: " " });
    const clean = cleanNutrition(n)!;
    expect(clean.rows).toHaveLength(whey.nutrition!.rows.length);
    expect(clean).not.toHaveProperty("allergens");
    expect(cleanNutrition(blankNutrition())).toBeUndefined();
    expect(cleanNutrition(undefined)).toBeUndefined();
  });

  it("modo de uso: sin texto ni momentos no se guarda; la dosis vacía se quita", () => {
    expect(cleanUsage(blankUsage())).toBeUndefined();
    expect(cleanUsage({ moments: ["post"], text: " 1 scoop ", dose: "" })).toEqual({ moments: ["post"], text: "1 scoop" });
  });
});
