"use client";
import { createContext, useContext, type ReactNode } from "react";
import { brand as buildBrand, type BrandConfig } from "./brand";
import { logoPaths, type LogoPaths } from "./logo";

/**
 * Marca que se imprime sobre el arte (la bolsa del regalo, la maza de la ruleta): el nombre y el símbolo del logo. Por defecto
 * son los de la ficha del build; el trailer fija los de la tienda que muestra ("Tu tienda"), así las piezas reales nunca
 * llevan otra marca.
 */
interface BrandArt { mark: string; logo: LogoPaths }
const BrandArtContext = createContext<BrandArt>({ mark: buildBrand.mark, logo: logoPaths(buildBrand) });

export function BrandMarkProvider({ brand, children }: { brand: Pick<BrandConfig, "mark" | "logo">; children: ReactNode }) {
  return <BrandArtContext.Provider value={{ mark: brand.mark, logo: logoPaths(brand) }}>{children}</BrandArtContext.Provider>;
}

export const useBrandMark = () => useContext(BrandArtContext).mark;
export const useBrandLogo = () => useContext(BrandArtContext).logo;
