import { brand } from "@/config/brand";
import { LOCKER, selectOpening, type OpeningKind } from "@/demo/engine/gift-opening";
/**
 * La bolsa de boxeo vestida según la ocasión del regalo. Los colores salen de la temática (`occasionColors`) y cada
 * fecha suma un detalle propio. Mapa abierto a propósito (no exhaustivo sobre `SeasonId`): un id de temática sin
 * variante, o uno nuevo, abre la bolsa VOLTA de siempre sin romper nada.
 */

/** Detalle que se dibuja sobre la bolsa (ver `details-*.tsx`). */
export type BagDetail =
  | "volta" | "navidad" | "ano-nuevo" | "san-valentin" | "dia-de-la-madre" | "dia-del-padre" | "dia-del-amigo"
  | "halloween" | "black-friday" | "cyber-monday" | "hot-sale" | "vuelta-al-gym" | "operacion-verano";

export interface BagVariant {
  detail: BagDetail;
  /** Cómo se ve, para la vista previa, Mis regalos y el lector de pantalla ("Bolsa navideña con moño y gorrito"). */
  name: string;
}

const DEFAULT_VARIANT: BagVariant = { detail: "volta", name: `Bolsa de boxeo ${brand.mark}` };

const VARIANTS: Readonly<Record<string, BagVariant | undefined>> = {
  volta: DEFAULT_VARIANT,
  navidad: { detail: "navidad", name: "Bolsa navideña con moño y gorrito" },
  "ano-nuevo": { detail: "ano-nuevo", name: "Bolsa versión 2027" },
  "san-valentin": { detail: "san-valentin", name: "Bolsa con corazones bordados" },
  "dia-de-la-madre": { detail: "dia-de-la-madre", name: "Bolsa con flores bordadas" },
  "dia-del-padre": { detail: "dia-del-padre", name: "Bolsa con guantes y cinta azul" },
  "dia-del-amigo": { detail: "dia-del-amigo", name: "Bolsa del compañero de gym" },
  halloween: { detail: "halloween", name: "Bolsa con calabaza musculosa" },
  "black-friday": { detail: "black-friday", name: "Bolsa negra de Black Friday" },
  "cyber-monday": { detail: "cyber-monday", name: "Bolsa con glitch de CyberMonday" },
  "hot-sale": { detail: "hot-sale", name: "Bolsa prendida fuego" },
  "vuelta-al-gym": { detail: "vuelta-al-gym", name: "Bolsa con toalla y «Día 1»" },
  "operacion-verano": { detail: "operacion-verano", name: "Bolsa con sol y anteojos" },
};

/** Ocasiones con variante propia (para tests y para el panel). */
export const BAG_VARIANT_IDS = Object.keys(VARIANTS);

export function bagVariant(occasion: string): BagVariant {
  return VARIANTS[occasion] ?? DEFAULT_VARIANT;
}

/** Nombre de la bolsa como título ("Bolsa con flores bordadas"). */
export function bagName(occasion: string): string {
  return bagVariant(occasion).name;
}

/**
 * Nombre de la apertura que va a ver quien recibe (R3b): la de su fecha ("Árbol de discos"), la bolsa de boxeo de la
 * marca si no tiene fecha, o el locker si quien regala lo eligió. Para la vista previa y Mis regalos; la frase
 * completa ("Lo abre sacando los discos del árbol.") es `openingLine` del motor.
 */
export function openingName(occasion: string, opening?: OpeningKind): string {
  const { kind, scene, meta } = selectOpening({ occasion, opening });
  if (kind === "locker") return LOCKER.name;
  return scene === "original" ? `${meta.name} ${brand.mark}` : meta.name;
}

/** La bolsa dentro de una frase ("contra una bolsa con flores bordadas"), sin pasar a minúscula "VOLTA". */
export function bagPhrase(occasion: string): string {
  const name = bagName(occasion);
  return `una ${name.charAt(0).toLowerCase()}${name.slice(1)}`;
}
