"use client";
import { useAdmin } from "@/stores/admin";

/** El pedido de la tienda tal como lo tiene el panel demo: su estado, su historial y su fecha de despacho reales. */
export function useShopOrder(code: string | undefined) {
  return useAdmin((s) => (code ? s.orders.find((o) => o.code === code) : undefined));
}
