import { deliveryWindows } from "@/demo/engine/delivery";
import type { WorkshopSettings } from "@/demo/fixtures/workshop";
import type { FulfillmentType } from "@/demo/types";
import { formatDay, whenDay } from "@/lib/date";

/**
 * Cuándo lo recibe el comprador a partir del día de despacho del calendario (`promisedDate` o `promiseFor`). Es el
 * mismo texto en el checkout, la confirmación y el seguimiento: "Llega mañana, mar 6 oct", "Retiralo desde el jue, 8
 * oct" o, por correo, "Llega entre el vie, 9 oct y el mié, 14 oct".
 */
export function arrivalText(fulfillment: FulfillmentType, day: string, today: string, settings: WorkshopSettings): string {
  if (fulfillment === "PICKUP") return `Retiralo desde ${whenDay(day, today)}`;
  if (fulfillment === "LOCAL_DELIVERY") return `Llega ${whenDay(day, today)}`;
  const w = deliveryWindows(day, settings).find((x) => x.id === "shipping")!;
  return `Llega entre el ${formatDay(w.from)} y el ${formatDay(w.to)}`;
}
