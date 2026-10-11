import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { StatusBadge } from "@/components/molecules/StatusBadge";
import type { AdminOrder } from "@/demo/admin/types";
import { formatDateTime } from "@/lib/date";
import { formatARS } from "@/lib/money";

const PAY = { CHECKOUT_PRO: "Mercado Pago", BANK_TRANSFER: "Transferencia", QR_MANUAL: "QR" };
const SHIP = { PICKUP: "Retiro", LOCAL_DELIVERY: "Cadete", SHIPPING: "Envío nacional" };

export const paymentLabel = (m: AdminOrder["paymentMethod"]) => PAY[m];
export const fulfillmentLabel = (f: AdminOrder["fulfillment"]) => SHIP[f];

/**
 * Pedido como fila a todo el ancho (8.3.3): código, cliente con fecha y medio, estado, importe y acceso a la ficha.
 * En el celular el estado sube junto al código y el resto se apila; nada se corta a la mitad.
 */
export function OrderCard({ order }: { order: AdminOrder }) {
  const meta = `${formatDateTime(order.createdAt)} · ${PAY[order.paymentMethod]} · ${SHIP[order.fulfillment]}${order.fromShop ? " · desde la tienda demo" : ""}`;
  return (
    <Link href={`/admin-demo/pedidos/detalle/?codigo=${order.code}`} className="flex items-center gap-3 rounded-2xl bg-surface p-4 shadow-[var(--shadow-card)] transition-colors hover:bg-accent/40 sm:gap-4">
      <div className="flex min-w-0 flex-1 flex-col gap-1 sm:flex-row sm:items-center sm:gap-4">
        <span className="flex flex-wrap items-center gap-2 sm:w-32 sm:shrink-0">
          <span className="whitespace-nowrap font-extrabold">{order.code}</span>
          <span className="sm:hidden"><StatusBadge status={order.status} /></span>
        </span>
        <span className="min-w-0 sm:flex-1">
          <span className="block truncate font-semibold">{order.customer.name}</span>
          <span className="block text-xs text-muted sm:truncate">{meta}</span>
        </span>
        <span className="hidden shrink-0 sm:block"><StatusBadge status={order.status} /></span>
      </div>
      <span className="shrink-0 whitespace-nowrap text-right font-extrabold tabular-nums sm:w-28">{formatARS(order.total)}</span>
      <ChevronRight size={18} aria-hidden="true" className="shrink-0 text-muted" />
    </Link>
  );
}
