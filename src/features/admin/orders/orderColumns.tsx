"use client";
import { CalendarClock } from "lucide-react";
import type { Column } from "@/components/organisms/data-table/types";
import { StatusBadge } from "@/components/molecules/StatusBadge";
import { isLate } from "@/demo/admin/order-groups";
import type { AdminOrder } from "@/demo/admin/types";
import { getProduct } from "@/demo/engine/catalog";
import { STATUS_LABEL } from "@/demo/engine/orders";
import { DEMO_TODAY } from "@/demo/fixtures/admin-orders";
import { formatDate, formatDateTime } from "@/lib/date";
import { formatARS } from "@/lib/money";
import { fulfillmentLabel, paymentLabel } from "../OrderCard";

export const units = (o: AdminOrder) => o.lines.reduce((s, l) => s + l.quantity, 0);
export const itemsText = (o: AdminOrder) => o.lines.map((l) => `${getProduct(l.productSlug)?.name ?? l.productSlug} ×${l.quantity}`).join(", ");

export function PromisedCell({ order }: { order: AdminOrder }) {
  if (!order.promisedDate) return <span className="text-muted">—</span>;
  const late = isLate(order, DEMO_TODAY);
  return (
    <span className={late ? "inline-flex items-center gap-1 font-bold text-danger" : "inline-flex items-center gap-1"}>
      <CalendarClock size={14} aria-hidden="true" />{formatDate(order.promisedDate)}{late && <span className="sr-only"> (atrasado)</span>}
    </span>
  );
}

export const orderColumns: Column<AdminOrder>[] = [
  { id: "code", header: "Código", pinned: true, primary: true, cell: (o) => o.code, sortValue: (o) => o.code, exportValue: (o) => o.code, className: "whitespace-nowrap" },
  {
    id: "customer", header: "Cliente", cell: (o) => <span className="flex flex-col"><span className="font-semibold">{o.customer.name}</span><span className="text-xs text-muted">{o.customer.email}</span></span>,
    sortValue: (o) => o.customer.name, exportValue: (o) => o.customer.name,
  },
  { id: "email", header: "Email", defaultHidden: true, cell: (o) => o.customer.email, exportValue: (o) => o.customer.email },
  { id: "phone", header: "Teléfono", defaultHidden: true, cell: (o) => o.customer.phone, exportValue: (o) => o.customer.phone },
  { id: "date", header: "Fecha", cell: (o) => <span className="whitespace-nowrap">{formatDateTime(o.createdAt)}</span>, sortValue: (o) => o.createdAt, exportValue: (o) => formatDateTime(o.createdAt) },
  { id: "status", header: "Estado", className: "whitespace-nowrap", cell: (o) => <StatusBadge status={o.status} />, sortValue: (o) => STATUS_LABEL[o.status], exportValue: (o) => STATUS_LABEL[o.status] },
  { id: "items", header: "Productos", cell: (o) => <span className="line-clamp-1 max-w-56 text-muted" title={itemsText(o)}>{itemsText(o)}</span>, sortValue: units, exportValue: itemsText },
  { id: "payment", header: "Pago", className: "whitespace-nowrap", cell: (o) => paymentLabel(o.paymentMethod), sortValue: (o) => paymentLabel(o.paymentMethod), exportValue: (o) => paymentLabel(o.paymentMethod) },
  { id: "fulfillment", header: "Entrega", className: "whitespace-nowrap", cell: (o) => fulfillmentLabel(o.fulfillment), sortValue: (o) => fulfillmentLabel(o.fulfillment), exportValue: (o) => fulfillmentLabel(o.fulfillment) },
  { id: "promised", header: "Comprometido", className: "whitespace-nowrap", cell: (o) => <PromisedCell order={o} />, sortValue: (o) => o.promisedDate, exportValue: (o) => o.promisedDate ?? "" },
  { id: "total", header: "Total", align: "right", money: true, cell: (o) => <strong>{formatARS(o.total)}</strong>, sortValue: (o) => o.total, exportValue: (o) => o.total },
];
