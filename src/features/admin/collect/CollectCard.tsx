"use client";
import Link from "next/link";
import { SampleProof } from "@/components/molecules/SampleProof";
import { StatusBadge } from "@/components/molecules/StatusBadge";
import { paymentTrack } from "@/demo/admin/order-tracks";
import type { AdminOrder } from "@/demo/admin/types";
import { formatDateTime, formatDay } from "@/lib/date";
import { formatARS } from "@/lib/money";
import { Facts } from "../detail/Panel";
import { fulfillmentLabel, paymentLabel } from "../OrderCard";
import { paymentHref } from "../payments/ProofActions";
import { CollectActions } from "./CollectActions";

const orderHref = (code: string) => `/admin-demo/pedidos/detalle/?codigo=${code}`;

/**
 * El pedido que se está revisando en Por cobrar (R4b): el comprobante a la izquierda (o el aviso de que no hay), el
 * total grande, los datos del cobro y las acciones. En el celular se apila.
 */
export function CollectCard({ order: o }: { order: AdminOrder }) {
  const proof = o.proof;
  const pay = paymentTrack(o);
  return (
    <article aria-label={`Cobro de ${o.code}`}
      className="animate-fade-up grid grid-cols-[5.5rem_minmax(0,1fr)] gap-x-4 gap-y-4 rounded-sm bg-surface p-4 shadow-[var(--shadow-card)] ring-1 ring-ink/[0.04] sm:grid-cols-[9.5rem_minmax(0,1fr)] sm:gap-x-5 sm:p-5">
      <Link href={paymentHref(o.code)} aria-label={`Abrir el comprobante de ${o.code}`} className="block self-start rounded-sm focus-visible:outline-2 focus-visible:outline-primary sm:row-span-2">
        {proof ? <SampleProof fileName={proof.fileName} amount={formatARS(o.total)} /> : (
          <span className="grid aspect-[200/260] w-full place-items-center rounded-sm border border-dashed border-ink/20 bg-bg p-2 text-center text-[11px] font-bold text-muted sm:p-3 sm:text-xs">
            {o.paymentMethod === "CHECKOUT_PRO" ? "Mercado Pago: sin comprobante" : "Sin comprobante todavía"}
          </span>
        )}
      </Link>
      <div className="flex min-w-0 flex-wrap items-start justify-between gap-x-4 gap-y-2">
        <div className="min-w-0">
          <p className="flex flex-wrap items-center gap-2">
            <Link href={orderHref(o.code)} className="font-extrabold tabular-nums text-primary underline">{o.code}</Link>
            <StatusBadge status={o.status} />
          </p>
          <p className="mt-1 text-lg font-extrabold leading-snug">{o.customer.name}</p>
          <p className="text-sm font-semibold text-muted">{pay.label}</p>
        </div>
        <div className="sm:text-right">
          <p className="text-xs font-bold text-muted">Total del pedido</p>
          <p className="text-2xl font-extrabold tabular-nums sm:text-3xl">{formatARS(o.total)}</p>
        </div>
      </div>
      <div className="col-span-2 flex min-w-0 flex-col gap-4 sm:col-span-1 sm:col-start-2">
        <Facts items={[
          ["Medio", paymentLabel(o.paymentMethod)],
          [proof ? "Comprobante" : "Pedido del", proof ? `${proof.fileName} · ${formatDateTime(proof.receivedAt)}` : formatDateTime(o.createdAt)],
          ["Entrega", `${fulfillmentLabel(o.fulfillment)}${o.promisedDate ? ` · sale el ${formatDay(o.promisedDate).replace(",", "")}` : ""}`],
          ...(proof?.rejectReason ? [["Observaciones", `Motivo del rechazo: ${proof.rejectReason}`] as [string, string]] : []),
        ]} />
        <CollectActions order={o} />
      </div>
    </article>
  );
}
