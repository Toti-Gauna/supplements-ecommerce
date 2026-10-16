import Link from "next/link";
import { Pause, Play } from "lucide-react";
import { Badge } from "@/components/atoms/Badge";
import { Button } from "@/components/atoms/Button";
import { ConfirmButton } from "@/components/molecules/ConfirmButton";
import type { Column, RowCardProps } from "@/components/organisms/data-table/types";
import type { SubscriptionRow } from "@/demo/admin/subscription-view";
import { SUBSCRIPTION_LABEL, type SubscriptionStatus } from "@/demo/engine/subscriptions";
import { formatDay } from "@/lib/date";
import { formatARS } from "@/lib/money";
import { editHref } from "./packColumns";

export interface SubscriptionHandlers {
  onPause: (row: SubscriptionRow) => void;
  onResume: (row: SubscriptionRow) => void;
  onCancel: (row: SubscriptionRow) => void;
  /** Códigos de pedido que existen en el panel (los de muestra no tienen pedido). */
  orderCodes: Set<string>;
}

const TONE: Record<SubscriptionStatus, "success" | "warning" | "neutral"> = { active: "success", paused: "warning", cancelled: "neutral" };

function Status({ row }: { row: SubscriptionRow }) {
  return (
    <span className="flex flex-col items-start gap-1">
      <Badge tone={TONE[row.sub.status]}>{SUBSCRIPTION_LABEL[row.sub.status]}</Badge>
      {row.sub.skipNext && row.sub.status === "active" && <span className="text-xs text-muted">Saltea la próxima</span>}
    </span>
  );
}

const nextText = (row: SubscriptionRow) => (row.next ? formatDay(row.next) : "—");
const amountText = (row: SubscriptionRow) => (row.amount === null ? "—" : formatARS(row.amount));

function PackName({ row }: { row: SubscriptionRow }) {
  return row.packFound ? <Link href={editHref(row.sub.packId)} className="font-bold underline-offset-4 hover:underline">{row.packName}</Link> : <span className="text-muted">{row.packName}</span>;
}

function Order({ row, h }: { row: SubscriptionRow; h: SubscriptionHandlers }) {
  const code = row.sub.orderCode;
  return (
    <span className="flex flex-col items-start gap-1">
      {h.orderCodes.has(code) ? <Link href={`/admin-demo/pedidos/detalle/?codigo=${code}`} className="font-mono text-[13px] font-bold underline">{code}</Link> : <span className="font-mono text-[13px]">{code}</span>}
      {row.fromShop ? <Badge tone="brand">Viene de la tienda</Badge> : <Badge>Muestra</Badge>}
    </span>
  );
}

/** Pausar o reanudar según el estado, y cancelar con confirmación. Una cancelada ya no tiene acciones. */
function Actions({ row, h }: { row: SubscriptionRow; h: SubscriptionHandlers }) {
  const { status } = row.sub;
  if (status === "cancelled") return <span className="text-sm text-muted">Sin acciones</span>;
  const who = `${row.customer} · ${row.packName}`;
  return (
    <span data-row-ignore className="flex flex-wrap items-center gap-1">
      {status === "active"
        ? <Button variant="secondary" size="sm" onClick={() => h.onPause(row)} aria-label={`Pausar la suscripción de ${who}`}><Pause size={15} aria-hidden="true" /> Pausar</Button>
        : <Button variant="secondary" size="sm" onClick={() => h.onResume(row)} aria-label={`Reanudar la suscripción de ${who}`}><Play size={15} aria-hidden="true" /> Reanudar</Button>}
      <ConfirmButton variant="danger" size="sm" title={`¿Cancelar la suscripción de ${row.customer}?`} confirmLabel="Cancelar suscripción" onConfirm={() => h.onCancel(row)}
        description={`${row.packName}: no se arma ninguna entrega más. No se puede reactivar; para volver a empezar hace falta un pedido nuevo. Solo en esta demo.`}>Cancelar</ConfirmButton>
    </span>
  );
}

export function subscriptionColumns(h: SubscriptionHandlers): Column<SubscriptionRow>[] {
  return [
    { id: "customer", header: "Cliente", pinned: true, primary: true, cell: (r) => r.customer, sortValue: (r) => r.customer, exportValue: (r) => r.customer },
    { id: "pack", header: "Pack", cell: (r) => <PackName row={r} />, sortValue: (r) => r.packName, exportValue: (r) => r.packName },
    { id: "status", header: "Estado", cell: (r) => <Status row={r} />, sortValue: (r) => SUBSCRIPTION_LABEL[r.sub.status], exportValue: (r) => SUBSCRIPTION_LABEL[r.sub.status] },
    { id: "next", header: "Próxima entrega", cell: nextText, sortValue: (r) => r.next, exportValue: (r) => r.next ?? "" },
    { id: "amount", header: "Importe mensual", align: "right", cell: amountText, sortValue: (r) => r.amount, exportValue: (r) => r.amount ?? "" },
    { id: "order", header: "Pedido de origen", cell: (r) => <Order row={r} h={h} />, sortValue: (r) => r.sub.orderCode, exportValue: (r) => r.sub.orderCode },
    { id: "actions", header: "Acciones", pinned: true, stickyEnd: true, cell: (r) => <Actions row={r} h={h} /> },
  ];
}

export function SubscriptionCard({ row, h }: RowCardProps<SubscriptionRow> & { h: SubscriptionHandlers }) {
  return (
    <div className="flex flex-col gap-3 rounded-sm bg-bg p-3 ring-1 ring-ink/[0.06]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0"><p className="font-bold">{row.customer}</p><p className="text-sm"><PackName row={row} /></p></div>
        <Status row={row} />
      </div>
      <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
        <div><dt className="text-xs text-muted">Próxima entrega</dt><dd className="font-bold">{nextText(row)}</dd></div>
        <div><dt className="text-xs text-muted">Importe mensual</dt><dd className="font-extrabold tabular-nums">{amountText(row)}</dd></div>
        <div className="col-span-2"><dt className="mb-1 text-xs text-muted">Pedido de origen</dt><dd><Order row={row} h={h} /></dd></div>
      </dl>
      <div className="border-t border-line pt-2"><Actions row={row} h={h} /></div>
    </div>
  );
}
