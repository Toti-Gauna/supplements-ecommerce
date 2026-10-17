import { normalizeGoals } from "../engine/goals";
import type { GoalInfo } from "../fixtures/goals";
import type { SportInfo } from "../fixtures/sports";
import { normalizeSports } from "../engine/sports";
import type { Category, Product } from "../types";
import { applyPriceChange, undoPriceChange, type PriceScope, type Rounding } from "./bulk-price";
import { slugify } from "./import/cells";
import { setClearance, withStock } from "./lots";
import { applyStockOp, type StockOp } from "./stock";
import type { ImportPlan } from "./import/plan";
import { auditEntry, type AdminData } from "./defaults";

type Set = (fn: (s: AdminData) => Partial<AdminData>) => void;

/** Estado del catálogo antes de una importación, para poder deshacerla (también después de recargar). */
export interface ImportSnapshot {
  at: string;
  fileName: string;
  summary: string;
  products: Product[];
  categories: Category[];
}

export interface CatalogActions {
  applyImport: (plan: ImportPlan, fileName: string) => void;
  undoImport: () => void;
  /** Reemplaza el catálogo de una vez (planilla, acciones en lote) con una sola línea de auditoría. */
  updateProducts: (products: Product[], action: string, entity: string) => void;
  setVariantStock: (slug: string, variantId: string, stock: number) => void;
  /** Cambia el stock de varias variantes a la vez (claves "producto::variante"). */
  bulkStock: (keys: string[], op: StockOp, label: string) => void;
  setProductsActive: (slugs: string[], active: boolean) => void;
  setProductsCategory: (slugs: string[], categorySlug: string) => void;
  saveCategory: (category: Category) => void;
  createCategory: (name: string, extra?: { description?: string; featured?: boolean }) => string;
  /** Liquida un lote con un % (o la quita con null). */
  setLotClearance: (slug: string, variantId: string, code: string, pct: number | null) => void;
  /** Aumento o rebaja masiva por %; guarda los precios de antes para deshacer. */
  applyBulkPrice: (scope: PriceScope, pct: number, step: Rounding, label: string) => void;
  undoBulkPrice: () => void;
  /** Nombre, bajada y color de los objetivos que usa la tienda. */
  saveGoals: (goals: GoalInfo[]) => void;
  saveSports: (sports: SportInfo[]) => void;
}

function withoutPhoto(p: Product): Product {
  const copy = { ...p };
  delete copy.photoDataUrl;
  return copy;
}

export function createCatalogActions(set: Set): CatalogActions {
  const log = (s: AdminData, action: string, entity: string) => [auditEntry(action, entity), ...s.audit].slice(0, 80);
  const products = (action: string, entity: string, fn: (list: Product[]) => Product[]) =>
    set((s) => ({ data: { ...s.data, products: fn(s.data.products) }, audit: log(s, action, entity) }));
  return {
    applyImport: (plan, fileName) =>
      set((s) => {
        const summary = plan.summary;
        return {
          // Sin las fotos cargadas (data URL): no se duplican en localStorage; al deshacer se vuelven a tomar del catálogo actual.
          lastImport: { at: new Date().toISOString(), fileName, summary, products: s.data.products.map(withoutPhoto), categories: s.data.categories },
          data: { ...s.data, products: plan.next.products, categories: plan.next.categories },
          audit: log(s, `${plan.kind === "supplier" ? "Lista de proveedor" : "Importación desde Excel"}: ${summary}`, fileName),
        };
      }),
    undoImport: () =>
      set((s) => (s.lastImport
        ? {
          data: { ...s.data, products: s.lastImport.products.map((p) => ({ ...p, photoDataUrl: s.data.products.find((x) => x.slug === p.slug)?.photoDataUrl })), categories: s.lastImport.categories },
          lastImport: null, audit: log(s, "Importación deshecha", s.lastImport.fileName),
        }
        : {})),
    updateProducts: (next, action, entity) => products(action, entity, () => next),
    setVariantStock: (slug, variantId, stock) =>
      products(`Stock → ${stock < 0 ? "a pedido" : stock}`, slug, (list) =>
        list.map((p) => (p.slug === slug ? { ...p, variants: p.variants.map((v) => (v.id === variantId ? withStock(v, stock) : v)) } : p))),
    bulkStock: (keys, op, label) => products(label, `${keys.length} variantes`, (list) => applyStockOp(list, keys, op)),
    setProductsActive: (slugs, active) =>
      products(active ? "Productos activados en lote" : "Productos pausados en lote", `${slugs.length} productos`, (list) =>
        list.map((p) => (slugs.includes(p.slug) ? { ...p, active } : p))),
    setProductsCategory: (slugs, categorySlug) =>
      products("Categoría cambiada en lote", `${slugs.length} productos`, (list) => list.map((p) => (slugs.includes(p.slug) ? { ...p, categorySlug } : p))),
    saveCategory: (category) =>
      set((s) => ({ data: { ...s.data, categories: s.data.categories.map((c) => (c.slug === category.slug ? category : c)) }, audit: log(s, "Categoría guardada", category.name) })),
    createCategory: (name, extra = {}) => {
      let slug = "";
      set((s) => {
        const base = slugify(name);
        slug = base;
        for (let n = 2; s.data.categories.some((c) => c.slug === slug); n++) slug = `${base}-${n}`;
        const category: Category = { slug, name: name.trim(), description: extra.description?.trim() ?? "", art: "tub", featured: !!extra.featured, sortOrder: Math.max(0, ...s.data.categories.map((c) => c.sortOrder)) + 1 };
        return { data: { ...s.data, categories: [...s.data.categories, category] }, audit: log(s, "Categoría creada", category.name) };
      });
      return slug;
    },
    setLotClearance: (slug, variantId, code, pct) =>
      products(pct ? `Lote ${code} en liquidación (−${pct} %)` : `Liquidación del lote ${code} quitada`, slug, (list) => setClearance(list, slug, variantId, code, pct)),
    applyBulkPrice: (scope, pct, step, label) =>
      set((s) => {
        const { products: next, undo } = applyPriceChange(s.data.products, scope, pct, step, label);
        return { data: { ...s.data, products: next }, lastPriceChange: undo, audit: log(s, `Precios ${label}`, `${undo.count} variantes`) };
      }),
    undoBulkPrice: () =>
      set((s) => (s.lastPriceChange
        ? { data: { ...s.data, products: undoPriceChange(s.data.products, s.lastPriceChange) }, lastPriceChange: null, audit: log(s, `Aumento deshecho (${s.lastPriceChange.label})`, `${s.lastPriceChange.count} variantes`) }
        : {})),
    saveGoals: (goals) => set((s) => ({ data: { ...s.data, goals: normalizeGoals(goals) }, audit: log(s, "Objetivos guardados", "Categorías y objetivos") })),
    saveSports: (sports) => set((s) => ({ data: { ...s.data, sports: normalizeSports(sports, s.data.packs ?? []) }, audit: log(s, "Deportes guardados", "Categorías y objetivos") })),
  };
}
