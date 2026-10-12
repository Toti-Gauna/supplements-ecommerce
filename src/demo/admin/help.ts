import { formatARS } from "@/lib/money";
import { CAPACITY_STATUSES } from "../engine/delivery";
import { STATUS_LABEL } from "../engine/orders";
import { VIP_FROM } from "./customers";
import { ORDER_TABS } from "./order-groups";
import { MATERIAL_STATE_LABEL } from "./workshop/materials";
import { MARGIN_LABEL } from "./workshop/costs";
import { PREP_COLUMNS } from "./workshop/preparation";
import { LEVEL_LABEL } from "./workshop/purchasing";

/**
 * Qué significa cada segmento o estado (8.3.10). Se arma con las mismas reglas y umbrales del engine
 * (`segmentOf`, `ORDER_TABS`, `materialState`, `marginState`): si cambia una regla, cambia la explicación.
 */
export interface HelpItem { term: string; text: string }
export interface Help { title: string; items: HelpItem[] }

export const SEGMENT_HELP: Help = {
  title: "Segmentos de clientes",
  items: [
    { term: "VIP", text: `Pagó ${formatARS(VIP_FROM)} o más sumando todos sus pedidos.` },
    { term: "Recurrente", text: `Más de un pedido pagado, por menos de ${formatARS(VIP_FROM)} en total.` },
    { term: "Nuevo", text: "Un solo pedido pagado." },
    { term: "Sin compras", text: "Tiene cuenta o dejó un pedido, pero todavía no pagó ninguno." },
    { term: "Invitado", text: "Compró sin crear una cuenta. Sus pedidos se agrupan por email." },
  ],
};

export const STAGE_HELP: Help = {
  title: "Etapas de los pedidos",
  items: ORDER_TABS.filter((t) => t.id !== "all").map((t) => ({ term: t.label, text: t.statuses.map((s) => STATUS_LABEL[s]).join(", ") + "." })),
};

export const PAYMENT_QUEUE_HELP: Help = {
  title: "Estados de los pagos manuales",
  items: [
    { term: "Por revisar", text: "El comprador subió un comprobante. Subirlo nunca marca el pedido como pagado: lo aprobás vos después de ver el ingreso." },
    { term: "Esperando comprobante", text: "Transferencia o QR sin comprobante vigente (todavía no lo subió, o se lo rechazaste)." },
    { term: "Resueltos", text: "Comprobantes que ya aprobaste o rechazaste a mano." },
  ],
};

export const MATERIAL_HELP: Help = {
  title: "Estados de los insumos",
  items: [
    { term: MATERIAL_STATE_LABEL.ok, text: "Después de preparar los pedidos pagados, queda más que el mínimo." },
    { term: MATERIAL_STATE_LABEL.low, text: "Después de esos pedidos queda el mínimo o menos." },
    { term: MATERIAL_STATE_LABEL.short, text: "Los pedidos pagados por preparar piden más de lo que hay en el depósito." },
  ],
};

export function marginHelp(target: number): Help {
  return {
    title: "Estados del margen",
    items: [
      { term: MARGIN_LABEL.ok, text: `El margen llega al objetivo (${target}%) o lo supera.` },
      { term: MARGIN_LABEL.low, text: `Gana plata, pero menos que el objetivo de ${target}%.` },
      { term: MARGIN_LABEL.loss, text: "El costo supera el precio de venta." },
      { term: MARGIN_LABEL.missing, text: "Todavía no tiene el costo del proveedor: no se puede calcular." },
    ],
  };
}

const statusList = (list: readonly (keyof typeof STATUS_LABEL)[]) => list.map((s) => STATUS_LABEL[s].toLowerCase()).join(", ");

/** Colores y marcas del calendario de despachos (8.3.10, Fase 7), con las reglas de cupo del cadete del engine. */
export const CALENDAR_HELP: Help = {
  title: "Qué marca el calendario",
  items: [
    { term: "Ocupa lugar del cadete", text: `Solo los pedidos con cadete en Mar del Plata, ${statusList(CAPACITY_STATUSES)}. Retiro y envío al país no tienen cupo; enviado y entregado ya no ocupan lugar.` },
    { term: "Completo", text: "El cadete llegó a su cupo ese día: la tienda ofrece el siguiente con lugar y arrastrar un pedido con cadete ahí no se acepta." },
    { term: "Sobrecargado", text: "El cadete tiene más pedidos que su cupo: se confirmó desde Reprogramar o se bajó el cupo después." },
    { term: "Atrasado", text: `Pagado o en preparación con la fecha de despacho ya pasada.` },
    { term: "Sin despachos", text: "Feriado, cierre del local o día de la semana sin despachos: no se puede comprometer un pedido." },
    { term: "Día cerrado: reprogramar", text: "El pedido estaba en un día que se cerró después. No se movió solo: elegí otra fecha." },
    { term: "Entrada propia", text: "Una tarea o nota de un pedido que anotaste. No ocupa lugar ni cambia fechas." },
  ],
};

const STAGE_STATUS: Record<(typeof PREP_COLUMNS)[number]["id"], keyof typeof STATUS_LABEL> = { queue: "PAID", picking: "IN_PRODUCTION", "lot-check": "IN_PRODUCTION", ready: "READY" };

/** Etapas del tablero de preparación y sus reglas (las mismas que valida `prepMove`). */
export const PREPARATION_HELP: Help = {
  title: "Etapas de preparación",
  items: [
    ...PREP_COLUMNS.map((c) => ({ term: c.label, text: `${c.hint}. Estado del pedido: ${STATUS_LABEL[STAGE_STATUS[c.id]].toLowerCase()}.` })),
    { term: "Reglas", text: "Al salir de Por preparar se descuenta el embalaje, una sola vez. Un pedido no vuelve a Por preparar y uno listo no vuelve a preparación; de Control de lote se puede volver a Armando. Solo pasa a Listo para despachar con el lote de cada producto confirmado." },
  ],
};

/** Estados de la lista de stock mínimo (los mismos de `levelRows`). */
export const LEVEL_HELP: Help = {
  title: "Stock mínimo y compras",
  items: [
    { term: LEVEL_LABEL.below, text: "Tiene el mínimo o menos: se sugiere comprar hasta el objetivo, descontando lo que ya pediste y no llegó." },
    { term: LEVEL_LABEL.ok, text: "Tiene más que el mínimo: no hace falta comprar." },
    { term: LEVEL_LABEL["made-to-order"], text: "Se encarga al proveedor con cada venta: no se compra por stock." },
  ],
};

