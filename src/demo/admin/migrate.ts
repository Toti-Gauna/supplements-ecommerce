import { defaultAdminData, type AdminData } from "./defaults";
import { withSportCampaigns } from "./migrate-campaigns";

/**
 * v10–v12 ya usan el catálogo de suplementos: el carrusel agrega un campo opcional sin borrar ediciones. v14 suma el
 * equipamiento y v15 las campañas de R3a (días del deporte); cada paso corre una sola vez y en orden.
 */
export function migrateAdminData(persisted: unknown, version: number): Partial<AdminData> {
  const saved = persisted as Partial<AdminData> | null;
  const products = saved?.data?.products;
  const compatible = Array.isArray(products) && products.every((p) => p && typeof p.art === "string" && Array.isArray(p.variants));
  if (!(version >= 10 && saved && compatible)) return defaultAdminData();
  const gear = version < 14 ? withGearCatalog(saved) : saved;
  return version < 15 ? withSportCampaigns(gear) : gear;
}

/**
 * v14 (L2, tienda deportiva multimarca): suma las categorías y los productos de equipamiento que no estén, y marca como
 * equipamiento las categorías que ya existían con ese nombre. No toca nada que el dueño ya haya editado.
 */
export function withGearCatalog(saved: Partial<AdminData>): Partial<AdminData> {
  const defaults = defaultAdminData().data;
  const data = saved.data!;
  const bySlug = new Map(defaults.categories.map((c) => [c.slug, c]));
  const categories = data.categories.map((c) => (bySlug.get(c.slug)?.kind && !c.kind ? { ...c, kind: bySlug.get(c.slug)!.kind } : c));
  for (const c of defaults.categories) if (!categories.some((x) => x.slug === c.slug)) categories.push(c);
  const products = [...data.products];
  for (const p of defaults.products) if (!products.some((x) => x.slug === p.slug)) products.push(p);
  return { ...saved, data: { ...data, categories, products } };
}
