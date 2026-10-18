import { CHANNEL_LABEL } from "../engine/counter-chat";
import { METHOD_LABEL } from "../engine/counter-pay";
import type { AdminOrder } from "./types";

/**
 * De dónde vino un pedido y cómo se cobró en mano (R4b). Los pedidos de muestra no dicen nada; los del checkout de este
 * navegador, "desde la tienda demo"; los cargados en el mostrador, su chat.
 */
export function orderOrigin(o: Pick<AdminOrder, "channel" | "fromShop">): string | null {
  if (o.channel) return `por ${CHANNEL_LABEL[o.channel]}`;
  return o.fromShop ? "desde la tienda demo" : null;
}

/** "Efectivo en mano" para un pedido cobrado en el local; null si se cobra por los medios de la tienda. */
export function inHandLabel(o: Pick<AdminOrder, "inHand">): string | null {
  return o.inHand ? `${METHOD_LABEL[o.inHand]} en mano` : null;
}
