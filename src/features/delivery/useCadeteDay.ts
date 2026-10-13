"use client";
import { nextCadeteDay } from "@/demo/engine/delivery";
import { DEMO_TODAY } from "@/demo/fixtures/admin-orders";
import { useAdmin } from "@/stores/admin";
import { useHydrated } from "@/stores/hydration";

/**
 * Día en que el cadete lleva un pedido en stock que entra hoy, con el calendario y el cupo del panel. Antes de
 * hidratar cuenta sin pedidos (lo mismo que la ficha), así el HTML estático y el primer render coinciden.
 */
export function useCadeteDay(): string {
  const hydrated = useHydrated();
  const orders = useAdmin((s) => s.orders);
  const settings = useAdmin((s) => s.workshop.settings);
  return nextCadeteDay(DEMO_TODAY, hydrated ? orders : [], settings);
}
