/**
 * Bandeja del comparador (R2a, regla de R3): hasta 3 productos y **todos del mismo tipo** (la misma categoría):
 * proteínas con proteínas, guantes con guantes; suplementos y equipamiento nunca se mezclan. Sumar uno de otro tipo no
 * falla en silencio: devuelve "other-type" con las dos categorías para que la tienda lo avise y ofrezca empezar de
 * nuevo. Puro y testeado; en producción, src/server/services.
 */
export const COMPARE_MAX = 3;

/** Categoría de un producto (undefined si no existe). La resuelve quien llama: el catálogo del navegador o un fixture. */
export type CategoryOf = (slug: string) => string | undefined;

export type CompareToggle =
  | { slugs: string[]; result: "added" | "removed" | "full" }
  /** Es de otro tipo: la bandeja no cambia. `current`/`incoming`: slugs de categoría. */
  | { slugs: string[]; result: "other-type"; current: string; incoming: string };

/** La categoría de la comparación: la del primer producto que existe (null si no hay ninguno). */
export function compareCategory(slugs: string[], categoryOf: CategoryOf): string | null {
  for (const slug of slugs) {
    const category = categoryOf(slug);
    if (category) return category;
  }
  return null;
}

/**
 * Deja solo los productos que existen y son del tipo del primero, sin repetir y hasta 3. Limpia una bandeja vieja
 * (guardada antes de la regla) o un link que mezcla tipos.
 */
export function sameTypeOnly(slugs: string[], categoryOf: CategoryOf, max = COMPARE_MAX): string[] {
  const category = compareCategory(slugs, categoryOf);
  return [...new Set(slugs)].filter((s) => category !== null && categoryOf(s) === category).slice(0, max);
}

/** Suma o saca un producto. Primero el tipo (otro tipo no entra, aunque haya lugar), después el máximo de 3. */
export function toggleCompare(slugs: string[], slug: string, categoryOf: CategoryOf, max = COMPARE_MAX): CompareToggle {
  if (slugs.includes(slug)) return { slugs: slugs.filter((s) => s !== slug), result: "removed" };
  const current = compareCategory(slugs, categoryOf);
  const incoming = categoryOf(slug);
  if (current && incoming && incoming !== current) return { slugs, result: "other-type", current, incoming };
  if (slugs.length >= max) return { slugs, result: "full" };
  return { slugs: [...slugs, slug], result: "added" };
}

/** El aviso de "otro tipo", con los nombres de las categorías ("Proteínas", "Creatinas"). */
export function otherTypeNotice(currentName: string, incomingName: string): { title: string; description: string; action: string } {
  return {
    title: "Solo se comparan productos del mismo tipo",
    description: `Estás comparando ${currentName}.`,
    action: `Empezar una comparación de ${incomingName}`,
  };
}

/**
 * La categoría a la que se limita el selector de /comparar/: la de los demás productos de la comparación (sin contar
 * la columna que se cambia). Null: no hay otro producto y se puede elegir cualquiera.
 */
export function pickerCategory(slugs: string[], categoryOf: CategoryOf, replacing?: number): string | null {
  return compareCategory(slugs.filter((_, i) => i !== replacing), categoryOf);
}

/** Cambia el producto de una columna (si el nuevo ya estaba, intercambian lugar). */
export function replaceCompare(slugs: string[], index: number, slug: string): string[] {
  const next = [...slugs];
  const at = next.indexOf(slug);
  if (at >= 0) next[at] = next[index]!;
  next[index] = slug;
  return next;
}

/** `?p=` del comparador → slugs que existen, del mismo tipo que el primero, sin repetir, hasta 3. `mixed`: se sacó alguno de otro tipo. */
export function parseCompareParam(param: string | null, categoryOf: CategoryOf): { slugs: string[]; mixed: boolean } {
  const known = [...new Set((param ?? "").split(",").map((s) => s.trim()).filter((s) => s && categoryOf(s)))];
  const first = compareCategory(known, categoryOf);
  return { slugs: sameTypeOnly(known, categoryOf), mixed: known.some((s) => categoryOf(s) !== first) };
}

export function compareHref(slugs: string[]): string {
  return slugs.length ? `/comparar/?p=${slugs.join(",")}` : "/comparar/";
}
