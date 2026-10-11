import { brand } from "./brand";

/**
 * La demo NO se indexa por defecto: tiene precios y stock de muestra de un negocio real.
 * Activar con DEMO_INDEXABLE=true solo si Volta lo aprueba.
 */
export const site = {
  title: `${brand.name} · Tienda (demo)`,
  description: `${brand.tagline}. Personalizá tu pieza, mirá la vista previa y aprobala antes de pagar. ${brand.city}.`,
  indexable: process.env.DEMO_INDEXABLE === "true",
};
