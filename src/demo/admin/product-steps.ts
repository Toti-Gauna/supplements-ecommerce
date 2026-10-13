import type { Category, Product } from "../types";
import { invalidLots } from "./lots";
import { unpricedVariants } from "./variant-prices";

/**
 * Pasos del editor de producto "hoja técnica" (R2, sobre 8.3.20) y su validación. Primero lo que vende (datos,
 * presentaciones con su precio y el rótulo); la foto y las medidas de envío van al final. "Completo" sale de validar
 * los datos, no de haber pasado por el paso. Los errores bloquean el guardado; las advertencias no.
 */
export const PRODUCT_STEPS = [
  { id: "datos", label: "Datos generales", short: "Datos" },
  { id: "venta", label: "Categoría, plazo y visibilidad", short: "Venta" },
  { id: "variantes", label: "Presentaciones: precio, servicios y stock", short: "Presentaciones" },
  { id: "rotulo", label: "Rótulo: tabla nutricional, modo de uso y RNPA", short: "Rótulo" },
  { id: "suplemento", label: "Marca, objetivos y sellos", short: "Sellos" },
  { id: "foto", label: "Foto y texto alternativo", short: "Foto" },
  { id: "envio", label: "Medidas de envío", short: "Envío" },
  { id: "revision", label: "Revisión y guardado", short: "Revisión" },
] as const;

export type StepId = (typeof PRODUCT_STEPS)[number]["id"];
export const FIRST_STEP: StepId = PRODUCT_STEPS[0].id;
export interface StepCheck { errors: string[]; warnings: string[]; complete: boolean }

function variantErrors(p: Product): string[] {
  if (p.variants.length === 0) return ["Tiene que haber al menos una presentación."];
  if (p.variants.some((v) => !v.label.trim())) return ["Cada presentación necesita un nombre visible."];
  if (unpricedVariants(p).length) return ["Cada presentación necesita su precio final (mayor a 0)."];
  return invalidLots(p).length ? ["Cada lote con unidades necesita código y mes de vencimiento."] : [];
}

function labelWarnings(p: Product): string[] {
  return [
    ...(p.nutrition?.rows.length ? [] : ["Cargá la tabla nutricional: es lo que más se mira antes de comprar."]),
    ...(p.usage?.text.trim() ? [] : ["Sumá el modo de uso: se ve en \"Cómo tomarlo\"."]),
    ...(p.rnpa?.trim() ? [] : ["Cargá el RNPA del rótulo: lo muestra la etiqueta del lote."]),
  ];
}

export function checkSteps(p: Product, categories: Category[]): Record<StepId, StepCheck> {
  const dims = p.dims;
  const steps: Record<Exclude<StepId, "revision">, { errors: string[]; warnings: string[] }> = {
    datos: { errors: p.name.trim().length < 2 ? ["El nombre es obligatorio (2 letras o más)."] : [], warnings: p.short.trim() ? [] : ["Sumá una descripción corta: se ve debajo del nombre."] },
    venta: { errors: categories.some((c) => c.slug === p.categorySlug) ? [] : ["Elegí una categoría."], warnings: [] },
    variantes: { errors: variantErrors(p), warnings: [] },
    rotulo: { errors: [], warnings: labelWarnings(p) },
    suplemento: { errors: [], warnings: p.brand?.trim() ? [] : ["Cargá la marca: se ve en la ficha y en los filtros."] },
    foto: { errors: (p.imageAlt ?? "").trim().length < 3 ? ["Escribí el texto alternativo: describí la foto en pocas palabras."] : [], warnings: [] },
    envio: { errors: [], warnings: dims && dims.lengthCm > 0 && dims.widthCm > 0 && dims.heightCm > 0 && dims.weightG > 0 ? [] : ["Cargá largo, ancho, alto y peso para cotizar envíos."] },
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
    slug, name: "", short: "", description: "", brand: "", categorySlug: [...categories].sort((a, b) => a.sortOrder - b.sortOrder)[0]?.slug ?? "",
    basePrice: 0, art: "tub", gallery: ["front"], variants: [{ id: `${slug}-v1`, label: "Único", priceDelta: 0, stock: -1 }],
    faqs: [], featured: false, isNew: true, soldCount: 0, tags: [], active: false, imageAlt: "",
  };
}
