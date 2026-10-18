"use client";
import { createContext, useContext, type ReactNode } from "react";
import { brand as buildBrand, type BrandConfig } from "./brand";
import { logoPaths, type LogoPaths } from "./logo";

/**
 * Marca que se imprime sobre el arte (la bolsa del regalo, la maza de la ruleta, el pote que sale): el nombre, la marca de la casa y el símbolo del logo. Por defecto
 * son los de la ficha del build; el trailer fija los de la tienda que muestra ("Tu tienda"), así las piezas reales nunca
 * llevan otra marca.
 */
interface BrandArt { mark: string; houseMark: string; logo: LogoPaths }
const BrandArtContext = createContext<BrandArt>({ mark: buildBrand.mark, houseMark: buildBrand.houseMark, logo: logoPaths(buildBrand) });

export function BrandMarkProvider({ brand, children }: { brand: Pick<BrandConfig, "mark" | "houseMark" | "logo">; children: ReactNode }) {
  return <BrandArtContext.Provider value={{ mark: brand.mark, houseMark: brand.houseMark, logo: logoPaths(brand) }}>{children}</BrandArtContext.Provider>;
}

export const useBrandMark = () => useContext(BrandArtContext).mark;
export const useBrandLogo = () => useContext(BrandArtContext).logo;
/** Marca corta de los potes de la casa ("TU TIENDA LAB"). */
export const useHouseMark = () => useContext(BrandArtContext).houseMark;
