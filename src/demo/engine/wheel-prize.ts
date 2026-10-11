import type { Coupon } from "../types";

/** Lo que eligió la persona con su premio. "Aplicado" y "utilizado" no se guardan: salen del carrito y del cupón. */
export type WheelPrizeChoice = "won" | "saved" | "removed";

export interface WheelPrize {
  code: string;
  label: string;
  at: string;
  /** Sin dato (premios guardados antes de Polish 8.2) cuenta como guardado: ya estaba en Mis cupones. */
  choice?: WheelPrizeChoice;
}

export type WheelPrizeStatus = "ganado" | "guardado" | "aplicado" | "desactivado" | "utilizado";

export const PRIZE_STATUS_LABEL: Record<WheelPrizeStatus, string> = {
  ganado: "Ganado: aplicalo o guardalo",
  guardado: "Guardado en Mis cupones",
  aplicado: "Aplicado a tu carrito",
  desactivado: "Quitado del pedido: podés volver a aplicarlo",
  utilizado: "Ya lo usaste en un pedido",
};

/**
 * Estado del premio de la ruleta (8.2.14). Uno solo a la vez y en este orden: usado (el cupón llegó a su límite),
 * aplicado (es el cupón del carrito), quitado desde el checkout, guardado o recién ganado.
 */
export function prizeStatus(prize: WheelPrize, ctx: { appliedCode: string | null; coupon?: Coupon }): WheelPrizeStatus {
  const { coupon } = ctx;
  if (coupon?.maxUses !== undefined && (coupon.usedCount ?? 0) >= coupon.maxUses) return "utilizado";
  if (ctx.appliedCode === prize.code) return "aplicado";
  if (prize.choice === "removed") return "desactivado";
  if (prize.choice === "won") return "ganado";
  return "guardado";
}

/** Al cambiar el cupón del carrito: si el premio deja de estar aplicado, qué queda registrado de él. */
export function choiceAfterCouponChange(prize: WheelPrize, from: string | null, to: string | null, where: "checkout" | "tienda"): WheelPrizeChoice | undefined {
  if (from !== prize.code || to === prize.code) return prize.choice;
  // Quitarlo en el checkout queda como "desactivado"; reemplazarlo por otro cupón lo devuelve a Mis cupones.
  return to === null && where === "checkout" ? "removed" : "saved";
}
