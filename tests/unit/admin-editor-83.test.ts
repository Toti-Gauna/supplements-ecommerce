import { beforeEach, describe, expect, it } from "vitest";
import { defaultDemoData } from "@/demo/engine/source";
import { blockingErrors, checkSteps, newProductDraft, PRODUCT_STEPS } from "@/demo/admin/product-steps";
import { clearSnapshot, draftKey, editedSlug, editorHref, loadSnapshot, previewHref, saveSnapshot } from "@/features/admin/products/editorDrafts";

/** Polish 8.3 · Lote 4: pasos del editor de producto y borrador para la vista previa. */
const { products, categories } = defaultDemoData();
const whey = products.find((p) => p.slug === "ionic-whey")!;

describe("pasos del editor (8.3.20)", () => {
  it("la foto va primero y la revisión al final", () => {
    expect(PRODUCT_STEPS.map((s) => s.id)).toEqual(["foto", "datos", "venta", "variantes", "envio", "personalizacion", "revision"]);
  });
  it("completo sale de validar, no de visitar: un producto del catálogo no tiene errores", () => {
    const c = checkSteps(whey, categories);
    expect(blockingErrors(whey, categories)).toEqual([]);
    expect(c.foto.complete && c.datos.complete && c.variantes.complete && c.revision.complete).toBe(true);
  });
  it("las medidas faltantes avisan pero no bloquean", () => {
    const c = checkSteps({ ...whey, dims: undefined }, categories);
    expect(c.envio.errors).toEqual([]);
    expect(c.envio.warnings[0]).toMatch(/largo, ancho, alto y peso/);
    expect(c.envio.complete).toBe(false);
    expect(c.revision.complete).toBe(true);
  });
  it("cada error cae en su paso y la revisión los junta", () => {
    const broken = { ...whey, imageAlt: " ", name: "a", basePrice: 0, categorySlug: "no-existe", variants: [{ ...whey.variants[0]!, label: "" }] };
    const c = checkSteps(broken, categories);
    expect(c.foto.errors).toHaveLength(1);
    expect(c.datos.errors).toHaveLength(1);
    expect(c.venta.errors).toHaveLength(2);
    expect(c.variantes.errors).toEqual(["Cada variante necesita un nombre visible."]);
    expect(c.revision.errors).toHaveLength(5);
    expect(checkSteps({ ...whey, variants: [] }, categories).variantes.errors).toEqual(["Tiene que haber al menos una variante."]);
  });
  it("el alta arranca vacía, pausada, a pedido y fuera del catálogo", () => {
    const d = newProductDraft("producto-nuevo-x", categories);
    expect(d).toMatchObject({ slug: "producto-nuevo-x", name: "", imageAlt: "", basePrice: 0, active: false, isNew: true });
    expect(d.variants).toEqual([{ id: "producto-nuevo-x-v1", label: "Único", priceDelta: 0, stock: -1 }]);
    expect(products.some((p) => p.slug === d.slug)).toBe(false);
    expect(blockingErrors(d, categories)).toHaveLength(3);
  });
});

describe("borrador y vista previa (8.3.21)", () => {
  const store = new Map<string, string>();
  beforeEach(() => {
    store.clear();
    Object.assign(globalThis, { sessionStorage: { getItem: (k: string) => store.get(k) ?? null, setItem: (k: string, v: string) => void store.set(k, v), removeItem: (k: string) => void store.delete(k) } });
  });
  it("claves y rutas: edición por slug, alta con una sola clave", () => {
    expect(draftKey("ionic-whey")).toBe("editar:ionic-whey");
    expect(draftKey(null)).toBe("nuevo");
    expect(editedSlug("editar:ionic-whey")).toBe("ionic-whey");
    expect(editedSlug("nuevo")).toBeNull();
    expect(editorHref("editar:ionic-whey")).toBe("/admin-demo/productos/editar/?id=ionic-whey");
    expect(editorHref("nuevo")).toBe("/admin-demo/productos/editar/?nuevo=1");
    expect(previewHref("editar:ionic-whey")).toBe("/vista-previa/?borrador=editar%3Aionic-whey");
  });
  it("guarda y recupera campos, paso y scroll; descartar lo borra", () => {
    saveSnapshot({ key: "nuevo", origin: "new", product: { ...whey, slug: "producto-nuevo-y" }, step: "variantes", scrollY: 640 });
    expect(JSON.parse(store.get("volta-ui:product-draft:nuevo")!).step).toBe("variantes");
    expect(loadSnapshot("nuevo")).toMatchObject({ step: "variantes", scrollY: 640, product: { slug: "producto-nuevo-y" } });
    clearSnapshot("nuevo");
    expect(loadSnapshot("nuevo")).toBeNull();
  });
  it("un borrador guardado roto o de otra versión se ignora sin romper", () => {
    store.set("volta-ui:product-draft:editar:ionic-whey", "{no es json");
    expect(loadSnapshot("editar:ionic-whey")).toBeNull();
    store.set("volta-ui:product-draft:editar:ionic-whey", JSON.stringify({ key: "editar:ionic-whey", origin: "edit", product: { slug: "ionic-whey" } }));
    expect(loadSnapshot("editar:ionic-whey")).toBeNull();
    store.set("volta-ui:product-draft:editar:ionic-whey", JSON.stringify({ key: "editar:ionic-whey", origin: "edit", product: whey, step: "otro", scrollY: "x" }));
    expect(loadSnapshot("editar:ionic-whey")).toMatchObject({ step: "foto", scrollY: 0 });
  });
});
