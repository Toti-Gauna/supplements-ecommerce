import { brand } from "./brand";

/**
 * La demo NO se indexa por defecto: tiene precios y stock de muestra de un negocio real.
 * Activar con DEMO_INDEXABLE=true solo si Volta lo aprueba.
 */
export const site = {
  title: `${brand.name} · Tienda (demo)`,
  description: `${brand.tagline}. Proteínas, creatinas, pre-entrenos y vitaminas originales, con lote y vencimiento a la vista. Cadete en el día en ${brand.city}.`,
  indexable: process.env.DEMO_INDEXABLE === "true",
};
