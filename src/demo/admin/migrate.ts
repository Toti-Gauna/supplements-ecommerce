import { defaultAdminData, type AdminData } from "./defaults";

/** v10–v12 ya usan el catálogo de suplementos: el carrusel agrega un campo opcional sin borrar ediciones. */
export function migrateAdminData(persisted: unknown, version: number): Partial<AdminData> {
  const saved = persisted as Partial<AdminData> | null;
  const products = saved?.data?.products;
  const compatible = Array.isArray(products) && products.every((p) => p && typeof p.art === "string" && Array.isArray(p.variants));
  return version >= 10 && saved && compatible ? saved : defaultAdminData();
}
