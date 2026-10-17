import type { Category, Nutrition, Product } from "../types";

/**
 * Validación del rótulo y de los servicios en el editor de producto (R2). Un suplemento no se publica sin RNPA, sin
 * la porción y las proteínas de la tabla nutricional ni sin los servicios de cada presentación (de ahí sale el
 * precio por servicio). El equipamiento (categoría "gear") no lleva rótulo, RNPA, servicios ni lotes. Puro y testeado.
 */

/** Formato del RNPA en el rótulo argentino: jurisdicción (2 números), guion y número de registro (6 números). */
export const RNPA_FORMAT = /^\d{2}-\d{6}$/;
export const RNPA_EXAMPLE = "00-000000";

export function isGearProduct(p: Pick<Product, "categorySlug">, categories: readonly Category[]): boolean {
  return categories.find((c) => c.slug === p.categorySlug)?.kind === "gear";
}

/**
 * Lo que se suele copiar del envase ("RNPA N° 04 071204", "04071204") queda como 04-071204. Lo que no se puede
 * acomodar vuelve tal cual (recortado) para que la validación lo marque.
 */
export function normalizeRnpa(input: string | undefined): string {
  const raw = (input ?? "").trim();
  const compact = raw.replace(/r\.?\s*n\.?\s*p\.?\s*a\.?|n[°ºo]\.?|[\s.:]/gi, "");
  if (/^\d{8}$/.test(compact)) return `${compact.slice(0, 2)}-${compact.slice(2)}`;
  return RNPA_FORMAT.test(compact) ? compact : raw;
}

const PROTEIN = /prote[ií]na/i;

/** La tabla informa proteínas: un renglón con valor o la leyenda "No aporta cantidades significativas de… proteínas". */
export function declaresProtein(n: Nutrition): boolean {
  return n.rows.some((r) => PROTEIN.test(r.label) && r.serving.trim() !== "") || PROTEIN.test(n.note ?? "");
}

/** Errores del paso "Rótulo" para un suplemento (el equipamiento no tiene). */
export function labelErrors(p: Product): string[] {
  const out: string[] = [];
  const rnpa = normalizeRnpa(p.rnpa);
  if (!rnpa) out.push(`Cargá el RNPA como figura en el rótulo (formato ${RNPA_EXAMPLE}).`);
  else if (!RNPA_FORMAT.test(rnpa)) out.push(`El RNPA tiene que tener el formato ${RNPA_EXAMPLE}: dos números, guion y seis números.`);
  const n = p.nutrition;
  if (!n) out.push("Cargá la tabla nutricional: como mínimo la porción y las proteínas.");
  else {
    if (!n.serving.trim()) out.push("La tabla nutricional necesita la porción (por ejemplo, 1 scoop (30 g)).");
    if (!declaresProtein(n)) out.push("Falta el renglón de proteínas en la tabla nutricional (si no aporta, escribí 0 g).");
  }
  return out;
}

/** Avisos del rótulo que no bloquean el guardado. */
export function labelWarnings(p: Product): string[] {
  return p.usage?.text.trim() ? [] : ["Sumá el modo de uso: se ve en \"Cómo tomarlo\"."];
}

/** Presentaciones de un suplemento sin servicios por envase. */
export function variantsWithoutServings(p: Product): number {
  return p.variants.filter((v) => !v.servings || v.servings < 1).length;
}
