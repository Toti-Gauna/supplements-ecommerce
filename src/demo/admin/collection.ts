/** Validación de los datos de cobro de muestra (8.3.30): los mismos criterios que tenía Ajustes. */
export type CollectionKey = "alias" | "cbu" | "holder";

export function collectionErrors(d: Record<CollectionKey, string>): Partial<Record<CollectionKey, string>> {
  const e: Partial<Record<CollectionKey, string>> = {};
  if (!/^[A-Za-z0-9.-]{6,20}$/.test(d.alias)) e.alias = "De 6 a 20 caracteres: letras, números, punto o guion.";
  if (!/^\d{22}$/.test(d.cbu)) e.cbu = "Tiene que tener 22 dígitos.";
  if (d.holder.trim().length < 3) e.holder = "Escribí el titular.";
  return e;
}
