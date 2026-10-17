/**
 * Opciones de quien regala (R3b, "Regalá energía"): la apertura (bolsa de boxeo o locker con combinación), el diseño
 * de la tarjeta que se manda por WhatsApp y qué queda abierto para quien recibe. Funciones puras.
 */
export type GiftOpening = "bolsa" | "locker";
export const GIFT_OPENINGS: readonly GiftOpening[] = ["bolsa", "locker"];

/** Sabor y tamaño que elige quien recibe (solo los que el producto tiene). */
export interface OpenChoice { flavor?: boolean; size?: boolean }

export interface GiftDesign {
  id: string;
  name: string;
  note: string;
}

/** Diseños de la tarjeta. "fecha" usa los colores de la ocasión (sin fecha especial, cae en "box"). */
export const GIFT_DESIGNS: readonly GiftDesign[] = [
  { id: "box", name: "Box de noche", note: "Carbono, acero y luz voltio" },
  { id: "tiza", name: "Tiza", note: "Hoja de laboratorio y grafito" },
  { id: "ring", name: "Ring", note: "Lona, cuerdas y reflector" },
  { id: "podio", name: "Podio", note: "Oro de medalla y luz de estadio" },
  { id: "fecha", name: "La fecha", note: "Con los colores de la ocasión" },
];
export const DEFAULT_GIFT_DESIGN = "box";

export const isGiftDesign = (id: unknown): id is string => typeof id === "string" && GIFT_DESIGNS.some((d) => d.id === id);
export const isGiftOpening = (value: unknown): value is GiftOpening => value === "bolsa" || value === "locker";

/** La combinación del locker son 4 números. */
export const isLockerCode = (value: unknown): value is string => typeof value === "string" && /^\d{4}$/.test(value);

/** Combinación por defecto: el día y el mes del regalo (DDMM) de una fecha AAAA-MM-DD o ISO. */
export function defaultLockerCode(dayOrIso: string): string {
  const [, , month = "01", day = "01"] = /^(\d{4})-(\d{2})-(\d{2})/.exec(dayOrIso) ?? [];
  return `${day}${month}`;
}

/** Deja solo dígitos (hasta 4): lo que se ve en el campo mientras se escribe. */
export const lockerDigits = (value: string) => value.replace(/\D/g, "").slice(0, 4);

/** Opciones limpias para guardar: la apertura (bolsa por defecto), su combinación y el diseño. */
export function cleanGiftOptions(draft: { opening?: unknown; lockerCode?: unknown; cardDesign?: unknown }): { opening?: GiftOpening; lockerCode?: string; cardDesign?: string } {
  const opening = isGiftOpening(draft.opening) ? draft.opening : undefined;
  return {
    ...(opening ? { opening } : {}),
    ...(opening === "locker" && isLockerCode(draft.lockerCode) ? { lockerCode: draft.lockerCode } : {}),
    ...(isGiftDesign(draft.cardDesign) ? { cardDesign: draft.cardDesign } : {}),
  };
}

/** Problema de las opciones, o null. */
export function giftOptionsProblem(draft: { opening?: unknown; lockerCode?: unknown }): string | null {
  if (draft.opening === "locker" && !isLockerCode(draft.lockerCode)) return "La combinación del locker son 4 números.";
  return null;
}
