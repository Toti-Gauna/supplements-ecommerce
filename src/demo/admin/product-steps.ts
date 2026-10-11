import type { Category, Product } from "../types";

/**
 * Pasos del editor de producto (8.3.20) y su validación. "Completo" sale de validar los datos, no de haber pasado por
 * el paso. Los errores bloquean el guardado; las advertencias (medidas sin cargar) no.
 */
export const PRODUCT_STEPS = [
  { id: "foto", label: "Foto y texto alternativo", short: "Foto" },
  { id: "datos", label: "Datos generales", short: "Datos" },
  { id: "venta", label: "Categoría, precio, plazo y visibilidad", short: "Venta" },
  { id: "variantes", label: "Variantes, precio y stock", short: "Variantes" },
  { id: "envio", label: "Medidas de envío", short: "Envío" },
  { id: "personalizacion", label: "Personalización", short: "Personalización" },
  { id: "revision", label: "Revisión y guardado", short: "Revisión" },
] as const;

export type StepId = (typeof PRODUCT_STEPS)[number]["id"];
export interface StepCheck { errors: string[]; warnings: string[]; complete: boolean }

export function checkSteps(p: Product, categories: Category[]): Record<StepId, StepCheck> {
  const dims = p.dims;
  const steps: Record<Exclude<StepId, "revision">, { errors: string[]; warnings: string[] }> = {
    foto: { errors: (p.imageAlt ?? "").trim().length < 3 ? ["Escribí el texto alternativo: describí la foto en pocas palabras."] : [], warnings: [] },
    datos: { errors: p.name.trim().length < 2 ? ["El nombre es obligatorio (2 letras o más)."] : [], warnings: p.short.trim() ? [] : ["Sumá una descripción corta: se ve debajo del nombre."] },
    venta: {
      errors: [...(p.basePrice > 0 ? [] : ["El precio base tiene que ser mayor a 0."]), ...(categories.some((c) => c.slug === p.categorySlug) ? [] : ["Elegí una categoría."])],
      warnings: [],
    },
    variantes: {
      errors: p.variants.length === 0 ? ["Tiene que haber al menos una variante."] : p.variants.some((v) => !v.label.trim()) ? ["Cada variante necesita un nombre visible."] : [],
      warnings: [],
    },
    envio: { errors: [], warnings: dims && dims.lengthCm > 0 && dims.widthCm > 0 && dims.heightCm > 0 && dims.weightG > 0 ? [] : ["Cargá largo, ancho, alto y peso para cotizar envíos."] },
    personalizacion: { errors: [], warnings: [] },
  };
  const out = Object.fromEntries(Object.entries(steps).map(([id, s]) => [id, { ...s, complete: s.errors.length === 0 && s.warnings.length === 0 }])) as Record<StepId, StepCheck>;
  const blocking = Object.values(steps).flatMap((s) => s.errors);
  out.revision = { errors: blocking, warnings: [], complete: blocking.length === 0 };
  return out;
}

export function blockingErrors(p: Product, categories: Category[]): string[] {
  return checkSteps(p, categories).revision.errors;
}

/** Producto nuevo en borrador: no existe en el catálogo hasta "Guardar" (8.3.21). Arranca pausado, como antes. */
export function newProductDraft(slug: string, categories: Category[]): Product {
  return {
    slug, name: "", short: "", description: "", categorySlug: [...categories].sort((a, b) => a.sortOrder - b.sortOrder)[0]?.slug ?? "",
    basePrice: 0, art: "dachshund", gallery: ["front"], variants: [{ id: `${slug}-v1`, label: "Único", priceDelta: 0, stock: -1 }],
    faqs: [], featured: false, isNew: true, soldCount: 0, tags: [], active: false, imageAlt: "",
  };
}
