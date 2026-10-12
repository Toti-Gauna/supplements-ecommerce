import { brand } from "@/config/brand";

/**
 * Lo que lleva el nombre de la tienda dentro del catálogo de muestra: la marca propia ("VOLTA Lab") y el shaker de la
 * casa. Cambian solos con `brand` (ver docs/marca-blanca.md). Las otras marcas (Krono, Brava Sport, Ozono, Forja) son
 * distribuidoras inventadas y quedan iguales para cualquier tienda.
 */
export const HOUSE_BRAND = brand.houseBrand;
export const HOUSE_BRAND_ID = `${brand.id}-lab`;
export const HOUSE_SHAKER_SLUG = `shaker-${brand.id}`;
export const HOUSE_SHAKER = `Shaker ${brand.mark}`;
/** Prefijo de los códigos de pedido de muestra ("VOL-000123"). */
export const ORDER_PREFIX = brand.orderPrefix;
