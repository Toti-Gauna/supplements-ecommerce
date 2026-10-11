import { collarSpec } from "../fixtures/collar";
import { baseTemplates } from "../fixtures/templates";
import type { PersonalizationTemplate, Product } from "../types";

/** Plantillas vigentes: las editadas viven dentro de los productos que las usan. */
export function templatesFrom(products: Product[]): PersonalizationTemplate[] {
  const byId = new Map(baseTemplates.map((t) => [t.id, t]));
  for (const p of products) if (p.personalization) byId.set(p.personalization.id, p.personalization);
  return [...byId.values()];
}

/**
 * La configuración del collar (estilos, patrones, adornos, talles) es código, no un dato del panel: al cargar lo
 * guardado en el navegador se reemplaza por la vigente, así un visitante que ya había entrado ve las opciones nuevas.
 */
export function withCurrentCollarSpec<T extends { products: Product[] }>(data: T): T {
  return { ...data, products: data.products.map((p) => (p.personalization?.collar ? { ...p, personalization: { ...p.personalization, collar: collarSpec } } : p)) };
}
