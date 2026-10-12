"use client";
import type { CartLine } from "@/demo/engine/cart-types";
import { promiseFor } from "@/demo/engine/delivery";
import { DEMO_TODAY } from "@/demo/fixtures/admin-orders";
import { DEMO_ORDER_CODE } from "@/demo/fixtures/commerce";
import type { FulfillmentType } from "@/demo/types";
import { useAdmin } from "@/stores/admin";
import { arrivalText } from "../order/arrival";

/**
 * Día de despacho y texto de llegada del carrito para cada forma de entrega, con el calendario y el cupo del panel:
 * la misma cuenta que la ficha ("Lo despachamos…") y que la fecha que queda guardada en el pedido.
 */
export function useOrderPromise(lines: CartLine[]) {
  const orders = useAdmin((s) => s.orders);
  const settings = useAdmin((s) => s.workshop.settings);
  return (fulfillment: FulfillmentType, current: CartLine[] = lines) => {
    const day = promiseFor(current, DEMO_TODAY, orders, settings, { fulfillment, exceptCode: DEMO_ORDER_CODE }).day;
    return { day, text: arrivalText(fulfillment, day, DEMO_TODAY, settings) };
  };
}
