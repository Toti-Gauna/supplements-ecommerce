import { formatARS } from "@/lib/money";
import { CAPACITY_STATUSES } from "../engine/delivery";
import { STATUS_LABEL } from "../engine/orders";
import { VIP_FROM } from "./customers";
import { ORDER_TABS } from "./order-groups";
import { MATERIAL_STATE_LABEL } from "./workshop/materials";
import { MARGIN_LABEL } from "./workshop/costs";
import { PRODUCTION_COLUMNS } from "./workshop/production";

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
    { term: MATERIAL_STATE_LABEL.ok, text: "Después de fabricar los pedidos pagados en cola, queda más que el mínimo." },
    { term: MATERIAL_STATE_LABEL.low, text: "Después de esos pedidos queda el mínimo o menos." },
    { term: MATERIAL_STATE_LABEL.short, text: "Los pedidos pagados en cola piden más de lo que hay en el taller." },
  ],
};

export function marginHelp(target: number): Help {
  return {
    title: "Estados del margen",
    items: [
      { term: MARGIN_LABEL.ok, text: `El margen llega al objetivo (${target}%) o lo supera.` },
      { term: MARGIN_LABEL.low, text: `Gana plata, pero menos que el objetivo de ${target}%.` },
      { term: MARGIN_LABEL.loss, text: "El costo supera el precio de venta." },
      { term: MARGIN_LABEL.missing, text: "Todavía no tiene receta: no se puede calcular." },
    ],
  };
}

const statusList = (list: readonly (keyof typeof STATUS_LABEL)[]) => list.map((s) => STATUS_LABEL[s].toLowerCase()).join(", ");

/** Colores y marcas del calendario de entregas (8.3.10, se completa en el Lote 5), con las reglas de capacidad del engine. */
export const CALENDAR_HELP: Help = {
  title: "Qué marca el calendario",
  items: [
    { term: "Ocupa lugar", text: `Cuentan para la capacidad del día los pedidos ${statusList(CAPACITY_STATUSES)}. Listo, enviado y entregado ya no ocupan lugar.` },
    { term: "Completo", text: "El día llegó a la capacidad: la tienda ofrece el siguiente con lugar y arrastrar un pedido ahí no se acepta." },
    { term: "Sobrecargado", text: "Tiene más pedidos que la capacidad: se confirmó desde Reprogramar o se bajó la capacidad después." },
    { term: "Atrasado", text: `Pagado o en producción con la fecha comprometida ya pasada.` },
    { term: "Taller cerrado", text: "Feriado, cierre propio o día de la semana sin taller: no se puede comprometer una entrega." },
    { term: "Día cerrado: reprogramar", text: "El pedido estaba en un día que se cerró después. No se movió solo: elegí otra fecha." },
    { term: "Entrada propia", text: "Una tarea o nota de un pedido que anotaste. No ocupa lugar ni cambia fechas." },
  ],
};

const STAGE_STATUS: Record<(typeof PRODUCTION_COLUMNS)[number]["id"], keyof typeof STATUS_LABEL> = { queue: "PAID", machine: "IN_PRODUCTION", finishing: "IN_PRODUCTION", ready: "READY" };

/** Etapas del tablero de producción y sus reglas (las mismas que valida `productionMove`). */
export const PRODUCTION_HELP: Help = {
  title: "Etapas de producción",
  items: [
    ...PRODUCTION_COLUMNS.map((c) => ({ term: c.label, text: `${c.hint}. Estado del pedido: ${STATUS_LABEL[STAGE_STATUS[c.id]].toLowerCase()}.` })),
    { term: "Reglas", text: "Un pedido en producción no vuelve a la cola y uno listo no vuelve a producción; de Terminación se puede volver a En máquina. Al salir de A fabricar se descuentan sus insumos, una sola vez." },
  ],
};

