import { describe, expect, it } from "vitest";
import { availability, getProduct, isPurchasable, visibleCategories } from "@/demo/engine/catalog";
import { previewMission } from "@/demo/engine/missions";
import { validatePhoto, validateText } from "@/demo/engine/personalization";
import { missions } from "@/demo/fixtures/commerce";

describe("catálogo", () => {
  it("oculta categorías vacías", () => {
    expect(visibleCategories().map((c) => c.slug)).not.toContain("indumentaria");
  });
  it("distingue a pedido, en stock y sin stock", () => {
    const iso = getProduct("isolate-zero")!;
    const [chocolate, vainilla] = iso.variants;
    expect(chocolate!.id).toBe("iz-chocolate-2lb");
    expect(availability(iso, chocolate!)).toEqual({ kind: "in-stock", units: 9 });
    expect(vainilla!.id).toBe("iz-vainilla-2lb");
    expect(availability(iso, vainilla!)).toEqual({ kind: "out-of-stock" });
    // Hoy ningún producto del catálogo es a pedido, pero el motor lo sigue soportando (stock -1).
    const aPedido = { ...chocolate!, stock: -1 };
    expect(availability({ ...iso, madeToOrderDays: 5 }, aPedido)).toEqual({ kind: "made-to-order", days: 5 });
    expect(isPurchasable(chocolate!, 10)).toBe(false);
    expect(isPurchasable(aPedido, 9)).toBe(true);
  });
});

describe("misiones (ilustrativo)", () => {
  const twoUnits = missions.find((m) => m.id === "m-dos-productos")!;
  it("completa cuando el pedido alcanza el umbral", () => {
    const p = previewMission(twoUnits, 1, { units: 1, total: 10000 });
    expect(p.completesNow).toBe(true);
    expect(p.pctAfter).toBe(100);
  });
  it("muestra lo que falta", () => {
    const p = previewMission(twoUnits, 0, { units: 1, total: 10000 });
    expect(p.completesNow).toBe(false);
    expect(p.remaining).toBe(1);
  });
});

describe("personalización", () => {
  it("acepta acentos y ñ, rechaza emoji y exceso", () => {
    expect(validateText("Ñandú", 10)).toBeNull();
    expect(validateText("Toby 🐶", 10)).toMatch(/emoji/);
    expect(validateText("Bartolomeo Max", 10)).toMatch(/Máximo/);
  });
  it("rechaza fotos pesadas o con tipo inválido", () => {
    expect(validatePhoto({ type: "image/jpeg", size: 20 * 1024 * 1024 })).toMatch(/10 MB/);
    expect(validatePhoto({ type: "application/pdf", size: 1000 })).toMatch(/JPG/);
    expect(validatePhoto({ type: "image/png", size: 1000 })).toBeNull();
  });
});
