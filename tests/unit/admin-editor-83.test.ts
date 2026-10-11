import { beforeEach, describe, expect, it } from "vitest";
import { defaultDemoData } from "@/demo/engine/source";
import { blockingErrors, checkSteps, newProductDraft, PRODUCT_STEPS } from "@/demo/admin/product-steps";
import { clearSnapshot, draftKey, editedSlug, editorHref, loadSnapshot, previewHref, saveSnapshot } from "@/features/admin/products/editorDrafts";

/** Polish 8.3 · Lote 4: pasos del editor de producto y borrador para la vista previa. */
const { products, categories } = defaultDemoData();
const vela = products.find((p) => p.slug === "vela-caniche")!;

describe("pasos del editor (8.3.20)", () => {
  it("la foto va primero y la revisión al final", () => {
    expect(PRODUCT_STEPS.map((s) => s.id)).toEqual(["foto", "datos", "venta", "variantes", "envio", "personalizacion", "revision"]);
  });
  it("completo sale de validar, no de visitar: un producto del catálogo no tiene errores", () => {
    const c = checkSteps(vela, categories);
    expect(blockingErrors(vela, categories)).toEqual([]);
    expect(c.foto.complete && c.datos.complete && c.variantes.complete && c.revision.complete).toBe(true);
  });
  it("las medidas faltantes avisan pero no bloquean", () => {
    const c = checkSteps({ ...vela, dims: undefined }, categories);
    expect(c.envio.errors).toEqual([]);
    expect(c.envio.warnings[0]).toMatch(/largo, ancho, alto y peso/);
    expect(c.envio.complete).toBe(false);
    expect(c.revision.complete).toBe(true);
  });
  it("cada error cae en su paso y la revisión los junta", () => {
    const broken = { ...vela, imageAlt: " ", name: "a", basePrice: 0, categorySlug: "no-existe", variants: [{ ...vela.variants[0]!, label: "" }] };
    const c = checkSteps(broken, categories);
    expect(c.foto.errors).toHaveLength(1);
    expect(c.datos.errors).toHaveLength(1);
    expect(c.venta.errors).toHaveLength(2);
    expect(c.variantes.errors).toEqual(["Cada variante necesita un nombre visible."]);
    expect(c.revision.errors).toHaveLength(5);
    expect(checkSteps({ ...vela, variants: [] }, categories).variantes.errors).toEqual(["Tiene que haber al menos una variante."]);
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
    expect(draftKey("vela-caniche")).toBe("editar:vela-caniche");
    expect(draftKey(null)).toBe("nuevo");
    expect(editedSlug("editar:vela-caniche")).toBe("vela-caniche");
    expect(editedSlug("nuevo")).toBeNull();
    expect(editorHref("editar:vela-caniche")).toBe("/admin-demo/productos/editar/?id=vela-caniche");
    expect(editorHref("nuevo")).toBe("/admin-demo/productos/editar/?nuevo=1");
    expect(previewHref("editar:vela-caniche")).toBe("/vista-previa/?borrador=editar%3Avela-caniche");
  });
  it("guarda y recupera campos, paso y scroll; descartar lo borra", () => {
    saveSnapshot({ key: "nuevo", origin: "new", product: { ...vela, slug: "producto-nuevo-y" }, step: "variantes", scrollY: 640 });
    expect(JSON.parse(store.get("volta-ui:product-draft:nuevo")!).step).toBe("variantes");
    expect(loadSnapshot("nuevo")).toMatchObject({ step: "variantes", scrollY: 640, product: { slug: "producto-nuevo-y" } });
    clearSnapshot("nuevo");
    expect(loadSnapshot("nuevo")).toBeNull();
  });
  it("un borrador guardado roto o de otra versión se ignora sin romper", () => {
    store.set("volta-ui:product-draft:editar:vela-caniche", "{no es json");
    expect(loadSnapshot("editar:vela-caniche")).toBeNull();
    store.set("volta-ui:product-draft:editar:vela-caniche", JSON.stringify({ key: "editar:vela-caniche", origin: "edit", product: { slug: "vela-caniche" } }));
    expect(loadSnapshot("editar:vela-caniche")).toBeNull();
    store.set("volta-ui:product-draft:editar:vela-caniche", JSON.stringify({ key: "editar:vela-caniche", origin: "edit", product: vela, step: "otro", scrollY: "x" }));
    expect(loadSnapshot("editar:vela-caniche")).toMatchObject({ step: "foto", scrollY: 0 });
  });
});
