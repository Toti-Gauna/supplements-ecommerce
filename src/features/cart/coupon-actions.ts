"use client";
import { choiceAfterCouponChange } from "@/demo/engine/wheel-prize";
import { useAccount } from "@/stores/account";
import { useCart } from "@/stores/cart";

/**
 * Único lugar donde cambia el cupón del carrito: deja registrado qué pasó con el premio de la ruleta (guardado o
 * quitado desde el checkout). Devuelve false si no cambió nada, para no repetir avisos ni sonidos.
 */
export function changeCoupon(to: string | null, where: "checkout" | "tienda" = "tienda"): boolean {
  const { couponCode, setCoupon } = useCart.getState();
  if (couponCode === to) return false;
  const { wheelPrize, setWheelPrizeChoice } = useAccount.getState();
  if (wheelPrize) setWheelPrizeChoice(choiceAfterCouponChange(wheelPrize, couponCode, to, where));
  setCoupon(to);
  return true;
}
