"use client";
import { ChevronRight } from "lucide-react";
import { EmptyState } from "@/components/molecules/EmptyState";
import { StatusBadge } from "@/components/molecules/StatusBadge";
import { DataTable, toSheet } from "@/components/organisms/data-table/DataTable";
import type { RowCardProps } from "@/components/organisms/data-table/types";
import { BULK_TARGETS, inTab, ORDER_TABS, tabForStatus, type OrderTabId } from "@/demo/admin/order-groups";
import { STAGE_HELP } from "@/demo/admin/help";
import type { FilterSpec } from "@/demo/admin/table";
import type { AdminOrder } from "@/demo/admin/types";
import { canTransition, STATUS_LABEL } from "@/demo/engine/orders";
import { formatDateTime, toDayKey } from "@/lib/date";
import { formatARS } from "@/lib/money";
import { useAdmin } from "@/stores/admin";
import { useToasts } from "@/stores/toast";
import { AdminPageHeader } from "../AdminPageHeader";
import { fulfillmentLabel, paymentLabel } from "../OrderCard";
import { BulkButton } from "../table/TabFilter";
import { specFromColumns, TableExcel } from "../table/TableExcel";
import { useExport } from "../table/useExport";
import { useTableState } from "../table/useTableState";
import { orderColumns, PromisedCell } from "./orderColumns";

function OrderRowCard({ row: o, selected, onToggle, onOpen }: RowCardProps<AdminOrder>) {
  return (
    <div className={`flex items-center gap-3 rounded-3xl bg-bg p-3 ring-1 ${selected ? "ring-primary" : "ring-ink/[0.06]"}`}>
      <input type="checkbox" checked={selected} onChange={onToggle} aria-label={`Seleccionar ${o.code}`} className="h-5 w-5 shrink-0 accent-primary" />
      <button type="button" onClick={onOpen} className="flex min-w-0 flex-1 items-center gap-3 text-left">
        <span className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="flex flex-wrap items-center gap-2"><span className="font-extrabold">{o.code}</span><StatusBadge status={o.status} /></span>
          <span className="truncate text-sm">{o.customer.name}</span>
          <span className="flex flex-wrap gap-x-2 text-xs text-muted">{formatDateTime(o.createdAt)}{o.promisedDate && <PromisedCell order={o} />}</span>
        </span>
        <span className="font-extrabold tabular-nums">{formatARS(o.total)}</span>
        <ChevronRight size={18} aria-hidden="true" className="text-muted" />
      </button>
    </div>
  );
}

const PAYMENTS = ["BANK_TRANSFER", "QR_MANUAL", "CHECKOUT_PRO"] as const;
const FULFILLMENTS = ["PICKUP", "LOCAL_DELIVERY", "SHIPPING"] as const;
/** Etapa (los estados agrupados por lo que hay que hacer), fechas, medio de pago y entrega. */
const FILTERS: FilterSpec<AdminOrder>[] = [
  { id: "etapa", label: "Etapa", allLabel: "Todas", help: STAGE_HELP, options: ORDER_TABS.filter((t) => t.id !== "all").map((t) => ({ value: t.id, label: t.label })), test: (o, v) => inTab(o, v as OrderTabId) },
  { id: "desde", label: "Desde", kind: "date", test: (o, v) => toDayKey(o.createdAt) >= v },
  { id: "hasta", label: "Hasta", kind: "date", test: (o, v) => toDayKey(o.createdAt) <= v },
  { id: "pago", label: "Medio de pago", options: PAYMENTS.map((m) => ({ value: m, label: paymentLabel(m) })), test: (o, v) => o.paymentMethod === v },
  { id: "entrega", label: "Entrega", allLabel: "Todas", options: FULFILLMENTS.map((f) => ({ value: f, label: fulfillmentLabel(f) })), test: (o, v) => o.fulfillment === v },
];
const search = (o: AdminOrder) => `${o.code} ${o.customer.name} ${o.customer.email}`;
const detail = (o: AdminOrder) => `/admin-demo/pedidos/detalle/?codigo=${o.code}`;

/** Pedidos como en un CRM: filtros por etapa y fechas, búsqueda, orden, acciones en lote, ficha completa y Excel. */
export function OrdersTable() {
  const orders = useAdmin((s) => s.orders);
  const transition = useAdmin((s) => s.transition);
  const push = useToasts((s) => s.push);
  const onExport = useExport("pedidos");
  const state = useTableState("orders", {
    sort: { id: "date", dir: "desc" }, hidden: orderColumns.filter((c) => c.defaultHidden).map((c) => c.id), filterIds: FILTERS.map((f) => f.id),
    // Enlaces del inicio y del menú que todavía llegan con ?estado=PAID.
    legacy: { params: ["estado"], read: (p): Record<string, string> => { const t = tabForStatus(p.get("estado")); return t === "all" ? {} : { etapa: t }; } },
  });
  const bulkMove = (list: AdminOrder[], to: (typeof BULK_TARGETS)[number], clear: () => void) => {
    const ok = list.filter((o) => canTransition(o.status, to, { fulfillment: o.fulfillment, trigger: "admin", prevStatus: o.prevStatus }));
    for (const o of ok) transition(o.code, to, `Cambio en lote a ${STATUS_LABEL[to]}`);
    const skipped = list.length - ok.length;
    push({ tone: ok.length ? "success" : "error", title: ok.length ? `${ok.length} ${ok.length === 1 ? "pedido pasó" : "pedidos pasaron"} a “${STATUS_LABEL[to]}”` : "Ningún pedido podía pasar a ese estado",
      description: skipped ? `${skipped} quedaron igual porque su estado actual no lo permite.` : "Cambio guardado solo en esta demo." });
    clear();
  };
  const table = { searchLabel: "Código o cliente", searchPlaceholder: "VEL-000123, nombre o email", searchText: search, filters: FILTERS };
  if (state.view === "excel") {
    return <TableExcel id="orders" title="Pedidos" noun="pedidos" state={state} rows={orders} {...table} spec={specFromColumns(orderColumns, (o) => o.code)}
      onExport={(rows) => onExport(toSheet(orderColumns, rows), "filtered")} />;
  }
  return (
    <>
      <AdminPageHeader title="Pedidos">Pedidos ficticios. Filtrá por etapa o fecha, buscá, ordená por cualquier columna, cambiá estados en lote o abrí la ficha tocando la fila.</AdminPageHeader>
      <DataTable caption="Pedidos" noun="pedidos" rows={orders} columns={orderColumns} state={state} {...table}
        rowKey={(o) => o.code} rowLabel={(o) => `Seleccionar ${o.code}`}
        bulkActions={(list, clear) => BULK_TARGETS.map((to) => <BulkButton key={to} onClick={() => bulkMove(list, to, clear)}>Pasar a {STATUS_LABEL[to]}</BulkButton>)}
        rowHref={detail} onExport={onExport} onExcel={() => state.setView("excel")} renderCard={(p) => <OrderRowCard {...p} />}
        empty={<EmptyState title="Ningún pedido coincide">Probá con otra etapa, código o rango de fechas, o tocá “Reiniciar”.</EmptyState>} />
    </>
  );
}
