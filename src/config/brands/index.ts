import { nitro } from "./nitro";
import type { BrandConfig } from "./types";
import { volta } from "./volta";

/**
 * Marcas disponibles. Para una demo nueva: copiar `volta.ts` (o `nitro.ts`) con el id del cliente, sumarla acá y
 * publicar con `NEXT_PUBLIC_BRAND=<id>`, o cambiar DEFAULT_BRAND si el repo es solo de ese cliente.
 */
export const BRAND_PRESETS: Record<string, BrandConfig> = { volta, nitro };

/** La que se usa si no se indica ninguna. */
export const DEFAULT_BRAND = "volta";

/** Marca elegida en el build. Un id desconocido corta el build: nunca se publica la marca equivocada sin avisar. */
export function pickBrand(id: string | undefined): BrandConfig {
  const key = id?.trim() || DEFAULT_BRAND;
  const found = BRAND_PRESETS[key];
  if (!found) throw new Error(`NEXT_PUBLIC_BRAND="${key}" no existe. Marcas disponibles: ${Object.keys(BRAND_PRESETS).join(", ")}.`);
  return found;
}
