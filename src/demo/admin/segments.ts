import { formatARS } from "@/lib/money";
import { goals } from "../fixtures/goals";
import { VIP_FROM, type CustomerSegment, type CustomerView } from "./customers";
import type { Help } from "./help";
import { OVERDUE_DAYS, WEEK_DAYS } from "./repurchase";
import { consumptionRule } from "./repurchase-text";

/**
 * Segmentos de clientes (Fase 6): listas para escribirles, no categorías excluyentes (alguien puede ser VIP y estar
 * atrasado con la recompra). La ayuda se arma con las mismas reglas y umbrales: si cambia una regla, cambia la explicación.
 */
export type SegmentId = "semana" | "atrasada" | "nuevos" | "frecuentes" | "vip" | "sin-compras";

export interface Segment {
  id: SegmentId;
  label: string;
  /** Qué tiene que cumplir el cliente, en palabras del dueño del local. */
  rule: string;
  test: (c: CustomerView) => boolean;
}

const tier = (t: CustomerSegment) => (c: CustomerView) => c.segment === t;

export const SEGMENTS: Segment[] = [
  { id: "semana", label: "Se le termina esta semana", rule: `Algo que compró se le termina en los próximos ${WEEK_DAYS} días, hoy incluido. Se calcula con los servicios del envase: ${consumptionRule()}.`, test: (c) => c.repurchases.some((i) => i.state === "week") },
  { id: "atrasada", label: "Recompra atrasada", rule: `Algo que compró se le terminó hace entre 1 y ${OVERDUE_DAYS} días y no lo volvió a comprar.`, test: (c) => c.repurchases.some((i) => i.state === "overdue") },
  { id: "nuevos", label: "Nuevos", rule: "Un solo pedido pagado.", test: tier("Nuevo") },
  { id: "frecuentes", label: "Frecuentes", rule: `Dos pedidos pagados o más, por menos de ${formatARS(VIP_FROM)} en total.`, test: tier("Frecuente") },
  { id: "vip", label: "VIP", rule: `Pagó ${formatARS(VIP_FROM)} o más sumando todos sus pedidos.`, test: tier("VIP") },
  { id: "sin-compras", label: "Sin compras", rule: "Tiene cuenta o dejó un pedido, pero todavía no pagó ninguno.", test: tier("Sin compras") },
];

export function inSegment(c: CustomerView, id: string): boolean {
  return SEGMENTS.find((s) => s.id === id)?.test(c) ?? false;
}

export function segmentCount(customers: CustomerView[], id: SegmentId): number {
  return customers.filter((c) => !c.blocked && inSegment(c, id)).length;
}

export const SEGMENT_HELP: Help = {
  title: "Segmentos de clientes",
  items: [
    ...SEGMENTS.map((s) => ({ term: s.label, text: s.rule })),
    { term: "Objetivo", text: "El que eligió el cliente o cargaste en su ficha. Si no tiene, el que más se repite en lo que compró." },
    { term: "Invitado", text: "Compró sin crear una cuenta. Sus pedidos se agrupan por email." },
  ],
};

export const GOAL_OPTIONS = goals.map((g) => ({ value: g.id, label: g.name }));

export const goalName = (id: string | null | undefined) => goals.find((g) => g.id === id)?.name ?? "Sin definir";
