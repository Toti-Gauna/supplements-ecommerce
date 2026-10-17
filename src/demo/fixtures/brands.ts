import type { PackStyle } from "../types";
import { brand } from "@/config/brand";
import { HOUSE_BRAND, HOUSE_BRAND_ID } from "./house";

/**
 * Marcas de MUESTRA (inventadas): la primera es la marca propia de la tienda (sale de `brand`, ver house.ts); Krono, Brava Sport, Ozono y Forja
 * imitan a las distribuidoras de suplementos, y Hierro, Doce Rounds y Pulso a las de equipamiento (L2: la tienda es un
 * comercio deportivo multimarca), sin usar ninguna marca existente.
 */
export interface BrandInfo {
  id: string;
  name: string;
  /** Una línea para el panel y los filtros. */
  note: string;
}

export const brands: BrandInfo[] = [
  { id: HOUSE_BRAND_ID, name: HOUSE_BRAND, note: "Marca propia de la tienda" },
  { id: "krono", name: "Krono Nutrition", note: "Marca de muestra · línea premium" },
  { id: "brava", name: "Brava Sport", note: "Marca de muestra · deportes" },
  { id: "ozono", name: "Ozono", note: "Marca de muestra · salud y veganos" },
  { id: "forja", name: "Forja", note: "Marca de muestra · pre-entrenos y volumen" },
  { id: "hierro", name: "Hierro", note: "Marca de muestra · equipamiento de levantamiento" },
  { id: "doce-rounds", name: "Doce Rounds", note: "Marca de muestra · boxeo y combate" },
  { id: "pulso", name: "Pulso", note: "Marca de muestra · funcional, cardio y bolsos" },
];

type Line = { line: string; sub?: string };

/** Envase de cada marca: noche y color firma (propia), blanco y rojo, azul y amarillo, menta y verde agua, tostado y naranja. */
export const pack = {
  house: ({ line, sub }: Line): PackStyle => ({ body: brand.colors.surface, band: brand.colors.surface, ink: brand.signature.onNight, accent: brand.signature.volt, mark: brand.houseMark, line, sub, pattern: "bolt" }),
  houseWhite: ({ line, sub }: Line): PackStyle => ({ body: "#e9edf2", lid: brand.colors.surface, band: "#ffffff", ink: brand.light.text, accent: brand.signature.plasma, mark: brand.houseMark, line, sub, pattern: "bolt" }),
  krono: ({ line, sub }: Line): PackStyle => ({ body: "#f1f2ee", lid: "#c9ccd2", band: "#ffffff", ink: "#111318", accent: "#ff4d2e", mark: "KRONO", line, sub, pattern: "stripes" }),
  brava: ({ line, sub }: Line): PackStyle => ({ body: "#1b2a6b", band: "#1b2a6b", ink: "#f4f6ff", accent: "#ffd23f", mark: "BRAVA SPORT", line, sub, pattern: "wave" }),
  ozono: ({ line, sub }: Line): PackStyle => ({ body: "#e7f2f0", lid: "#0d2b29", band: "#ffffff", ink: "#0d2b29", accent: "#0fa89b", mark: "OZONO", line, sub, pattern: "grid" }),
  forja: ({ line, sub }: Line): PackStyle => ({ body: "#24130d", lid: "#120905", band: "#24130d", ink: "#fff1e6", accent: "#ff7a1a", mark: "FORJA", line, sub, pattern: "stripes" }),
  /** Equipamiento: acero y negro con naranja seguridad; cuero rojo y oro de ring; grafito con verde agua. */
  hierro: ({ line, sub }: Line): PackStyle => ({ body: "#1a1c1f", lid: "#2c3036", band: "#2c3036", ink: "#eef0f2", accent: "#ff6a13", mark: "HIERRO", line, sub, pattern: "stripes" }),
  doceRounds: ({ line, sub }: Line): PackStyle => ({ body: "#1d0e10", lid: "#3a1418", band: "#f3e9d8", ink: "#1d0e10", accent: "#d9a441", mark: "DOCE ROUNDS", line, sub, pattern: "wave" }),
  pulso: ({ line, sub }: Line): PackStyle => ({ body: "#22262b", lid: "#121417", band: "#22262b", ink: "#f2fbfa", accent: "#22d3c5", mark: "PULSO", line, sub, pattern: "grid" }),
};

/** Colores de sabor (franja del rótulo, polvo, gomitas). */
export const FLAVOR = {
  chocolate: "#5a3220",
  vainilla: "#f1dfae",
  frutilla: "#e5576f",
  cookies: "#cfc6b6",
  dulceDeLeche: "#c27a3a",
  banana: "#f3d34a",
  limon: "#d8f05a",
  frutosRojos: "#b8234a",
  mango: "#ffa630",
  uva: "#7a3fa0",
  sandia: "#ff5f6d",
  natural: "#e8e4d8",
  mani: "#c9874a",
  naranja: "#ff8a2a",
  blueRazz: "#2f8cff",
  pomelo: "#ff7f6e",
  anana: "#f7c948",
  tropical: "#ffb547",
  chocolateBlanco: "#efe3c8",
} as const;
