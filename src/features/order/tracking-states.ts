import type { TimelineStep } from "@/components/molecules/StatusTimeline";

/** Estados de MUESTRA para la línea de tiempo (spec 5.2). */
const FLOW = [
  { label: "Pedido recibido", description: "Reservamos tu pedido." },
  { label: "Pago en revisión", description: "Volta verifica el ingreso de la transferencia o QR." },
  { label: "Pagado", description: "Pago confirmado." },
  { label: "Armando tu pedido", description: "Controlamos lote y vencimiento de cada producto y lo embalamos." },
  { label: "Listo", description: "Embalado y precintado, listo para salir." },
  { label: "Enviado", description: "En camino con el cadete o el correo." },
  { label: "Entregado", description: "¡Que lo disfrutes!" },
];

/** Estados que se pueden probar en el seguimiento de demostración (solo cambian la vista, no el pedido). */
export const SAMPLE_STATES = [
  { id: "pending", label: "Esperando comprobante", current: 0 },
  { id: "production", label: "Armando tu pedido", current: 3 },
  { id: "ready", label: "Listo", current: 4 },
  { id: "shipped", label: "En camino", current: 5 },
  { id: "delivered", label: "Entregado", current: 7 },
] as const;

export type SampleStateId = (typeof SAMPLE_STATES)[number]["id"];

const DATES = ["2 oct, 10:14", "2 oct, 18:40", "3 oct, 09:02", "3 oct, 11:30", "", "", ""];

export function timelineFor(current: number): TimelineStep[] {
  return FLOW.map((s, i) => ({ ...s, state: i < current ? "done" : i === current ? "current" : "pending", date: i <= current ? DATES[i] || undefined : undefined }));
}
