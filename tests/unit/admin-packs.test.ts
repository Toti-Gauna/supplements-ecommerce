import { beforeEach, describe, expect, it } from "vitest";
import { addItem, cleanPack, copyName, duplicatePackIn, moveItem, newPackDraft, patchItem, productChoices, removeItem, upsertPack } from "@/demo/admin/packs";
import { activeSubscriptions, discountLabel, packRows, packsHubMeta } from "@/demo/admin/pack-rows";
import { quotePack, validatePack } from "@/demo/engine/packs";
import { demoData } from "@/demo/engine/source";
import { packs as samplePacks } from "@/demo/fixtures/packs";
import { seedSubscriptions } from "@/demo/fixtures/subscriptions";
import { useAdmin } from "@/stores/admin";

const hip = () => samplePacks.find((p) => p.id === "hipertrofia")!;
const store = () => useAdmin.getState();
const packsInStore = () => demoData().packs;

beforeEach(() => store().resetAdmin());

/** Un pack válido y nuevo: dos productos, uno suplemento. */
const draft = (name = "Pack Prueba") => ({ ...newPackDraft(), name, focus: "Fuerza", items: [{ productSlug: "ionic-whey", qty: 1 }, { productSlug: "creatina-monohidrato", qty: 2 }] });

describe("packs del panel: armado del borrador", () => {
  it("el borrador nuevo arranca sin productos, visible y con el descuento de muestra", () => {
    expect(newPackDraft()).toMatchObject({ id: "", items: [], discountPct: 10, monthlyPct: 5, active: true, featured: false });
  });

  it("agregar no repite un producto; quitar y reordenar mantienen el resto", () => {
    let items = addItem([], "ionic-whey");
    items = addItem(addItem(items, "creatina-monohidrato"), "ionic-whey");
    expect(items.map((i) => i.productSlug)).toEqual(["ionic-whey", "creatina-monohidrato"]);
    expect(moveItem(items, "creatina-monohidrato", -1).map((i) => i.productSlug)).toEqual(["creatina-monohidrato", "ionic-whey"]);
    expect(moveItem(items, "ionic-whey", -1)).toBe(items);
    expect(moveItem(items, "creatina-monohidrato", 1)).toBe(items);
    expect(removeItem(items, "ionic-whey").map((i) => i.productSlug)).toEqual(["creatina-monohidrato"]);
  });

  it("cantidad y variante fija se cambian por producto; sin variante se borra la clave", () => {
    const items = patchItem(patchItem(addItem([], "ionic-whey"), "ionic-whey", { qty: 3 }), "ionic-whey", { variantId: "x" });
    expect(items[0]).toEqual({ productSlug: "ionic-whey", qty: 3, variantId: "x" });
    expect(patchItem(items, "ionic-whey", { variantId: undefined })[0]).toEqual({ productSlug: "ionic-whey", qty: 3 });
  });

  it("el selector ofrece solo productos activos que faltan, agrupados por categoría", () => {
    const { products, categories } = demoData();
    const paused = products[0]!;
    const groups = productChoices(products.map((p) => (p.slug === paused.slug ? { ...p, active: false } : p)), categories, ["ionic-whey"]);
    const slugs = groups.flatMap((g) => g.products.map((p) => p.slug));
    expect(slugs).not.toContain(paused.slug);
    expect(slugs).not.toContain("ionic-whey");
    expect(groups.every((g) => g.products.every((p) => p.categorySlug === g.category.slug))).toBe(true);
    expect(groups.some((g) => g.category.kind === "gear")).toBe(true);
    expect(groups.map((g) => g.category.sortOrder)).toEqual([...groups.map((g) => g.category.sortOrder)].sort((a, b) => a - b));
  });

  it("limpiar el pack recorta textos y deja números enteros", () => {
    const clean = cleanPack({ ...draft("  Pack  "), tagline: " hola ", discountPct: 10.4, monthlyPct: 4.6 });
    expect(clean).toMatchObject({ name: "Pack", tagline: "hola", discountPct: 10, monthlyPct: 5 });
  });
});

describe("packs del panel: operaciones sobre la lista", () => {
  it("un pack nuevo recibe un id a partir del nombre, sin repetir los existentes", () => {
    const first = upsertPack(samplePacks, draft("Pack Hipertrofia"));
    expect(first.created).toBe(true);
    expect(first.pack.id).toBe("pack-hipertrofia");
    expect(first.packs).toHaveLength(samplePacks.length + 1);
    const again = upsertPack(first.packs, draft("Pack Hipertrofia"));
    expect(again.pack.id).toBe("pack-hipertrofia-2");
  });

  it("guardar uno existente lo reemplaza en su lugar", () => {
    const result = upsertPack(samplePacks, { ...hip(), discountPct: 20 });
    expect(result.created).toBe(false);
    expect(result.packs).toHaveLength(samplePacks.length);
    expect(result.packs[samplePacks.indexOf(hip())]!.discountPct).toBe(20);
  });

  it("duplicar deja una copia oculta y sin destacar, junto al original, con nombre e id propios", () => {
    const { packs, copy } = duplicatePackIn(samplePacks, "hipertrofia")!;
    expect(packs.findIndex((p) => p.id === copy.id)).toBe(1);
    expect(copy).toMatchObject({ name: "Pack Hipertrofia (copia)", id: "pack-hipertrofia-copia", active: false, featured: false, items: hip().items });
    expect(copy.items).not.toBe(hip().items);
    expect(copyName("Pack Hipertrofia", packs)).toBe("Pack Hipertrofia (copia 2)");
    expect(duplicatePackIn(samplePacks, "no-existe")).toBeNull();
  });
});

describe("packs del panel: acciones del store", () => {
  it("los packs de muestra viven en data.packs y los lee el engine", () => {
    expect(store().data.packs).toHaveLength(9);
    expect(packsInStore()).toBe(store().data.packs);
  });

  it("guardar un pack nuevo lo suma a data.packs, devuelve su id y deja auditoría", () => {
    const id = store().savePack(draft());
    expect(id).toBe("pack-prueba");
    expect(packsInStore().at(-1)).toMatchObject({ id, name: "Pack Prueba", active: true });
    expect(store().audit[0]).toMatchObject({ action: "Pack creado", entity: "Pack Prueba" });
  });

  it("editar el descuento cambia el precio que cotiza la tienda", () => {
    const before = quotePack(packsInStore().find((p) => p.id === "hipertrofia")!);
    store().savePack({ ...hip(), discountPct: 20 });
    const saved = packsInStore().find((p) => p.id === "hipertrofia")!;
    const after = quotePack(saved);
    expect(after.price).toBeLessThan(before.price);
    expect(after.discount).toBe(Math.round((after.subtotal * 20) / 100));
    expect(store().audit[0]).toMatchObject({ action: "Pack guardado", entity: "Pack Hipertrofia" });
  });

  it("ocultar y mostrar cambian active y registran auditoría; repetir el mismo valor no registra nada", () => {
    store().setPackActive("fuerza", false);
    expect(packsInStore().find((p) => p.id === "fuerza")!.active).toBe(false);
    expect(store().audit[0]).toMatchObject({ action: "Pack oculto de la tienda", entity: "Pack Fuerza" });
    const lines = store().audit.length;
    store().setPackActive("fuerza", false);
    expect(store().audit).toHaveLength(lines);
    store().setPackActive("fuerza", true);
    expect(packsInStore().find((p) => p.id === "fuerza")!.active).toBe(true);
  });

  it("quitar saca el pack y deja auditoría; uno que no existe no hace nada", () => {
    store().removePack("salud");
    expect(packsInStore().some((p) => p.id === "salud")).toBe(false);
    expect(store().audit[0]).toMatchObject({ action: "Pack quitado", entity: "Pack Salud" });
    const lines = store().audit.length;
    store().removePack("salud");
    expect(store().audit).toHaveLength(lines);
  });

  it("duplicar devuelve el id de la copia (oculta) y null si el pack no existe", () => {
    const id = store().duplicatePack("running");
    expect(packsInStore().find((p) => p.id === id)).toMatchObject({ name: "Pack Running (copia)", active: false });
    expect(store().audit[0]).toMatchObject({ action: "Pack duplicado" });
    expect(store().duplicatePack("no-existe")).toBeNull();
  });

  it("Reiniciar demo devuelve los 9 packs de muestra", () => {
    store().removePack("salud");
    store().savePack(draft());
    store().resetAdmin();
    expect(packsInStore()).toHaveLength(9);
  });
});

describe("packs del panel: validación antes de guardar", () => {
  it("con un solo producto no se guarda y el error está en español", () => {
    const one = { ...draft(), items: [{ productSlug: "ionic-whey", qty: 1 }] };
    expect(validatePack(cleanPack(one), samplePacks)).toEqual(["Un pack lleva al menos dos productos."]);
  });

  it("nombre vacío o repetido, descuento fuera de rango y solo equipamiento", () => {
    expect(validatePack(cleanPack({ ...draft(""), name: "  " }), samplePacks)).toContain("El pack necesita un nombre.");
    expect(validatePack(cleanPack(draft("pack hipertrofia")), samplePacks)).toContain("Ya hay un pack con ese nombre.");
    expect(validatePack(cleanPack({ ...draft(), discountPct: 41 }), samplePacks)).toContain("El descuento del pack va de 0 a 40 %.");
    expect(validatePack(cleanPack({ ...draft(), monthlyPct: 21 }), samplePacks)).toContain("El extra mensual va de 0 a 20 %.");
    const gear = { ...draft(), items: [{ productSlug: "straps-algodon", qty: 1 }, { productSlug: "botella-1l", qty: 1 }] };
    expect(validatePack(cleanPack(gear), samplePacks).join(" ")).toContain("al menos un suplemento");
  });

  it("un pack completo y los de muestra validan sin errores (editar uno no choca con su propio nombre)", () => {
    expect(validatePack(cleanPack(draft()), samplePacks)).toEqual([]);
    for (const p of samplePacks) expect(validatePack(cleanPack(p), samplePacks)).toEqual([]);
  });
});

describe("packs del panel: lista", () => {
  it("cada fila trae los precios de la primera entrega y del mes, y cuántas suscripciones activas tiene", () => {
    const rows = packRows(samplePacks, seedSubscriptions);
    const row = rows.find((r) => r.pack.id === "hipertrofia")!;
    expect(row.quote.price).toBe(quotePack(hip()).price);
    expect(row.quote.monthlyPrice).toBeLessThan(row.quote.price);
    expect(row.products).toBe(4);
    expect(row.activeSubs).toBe(1);
    expect(rows.find((r) => r.pack.id === "running")!.activeSubs).toBe(0);
    expect(discountLabel(hip())).toBe("10 % + 5 % por mes");
    expect(discountLabel({ discountPct: 15, monthlyPct: 0 })).toBe("15 %");
  });

  it("el dato de la tarjeta de Marketing sale de los packs y las suscripciones activas", () => {
    expect(activeSubscriptions(seedSubscriptions)).toBe(3);
    expect(packsHubMeta(samplePacks, seedSubscriptions)).toBe("9 packs · 3 suscripciones activas");
    expect(packsHubMeta(samplePacks.slice(0, 1), seedSubscriptions.slice(0, 1))).toBe("1 pack · 1 suscripción activa");
  });
});
