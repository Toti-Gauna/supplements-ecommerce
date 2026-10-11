"use client";
import Link from "next/link";
import { Badge } from "@/components/atoms/Badge";
import { SampleProof } from "@/components/molecules/SampleProof";
import { StatusBadge } from "@/components/molecules/StatusBadge";
import type { AdminOrder } from "@/demo/admin/types";
import { formatDateTime } from "@/lib/date";
import { formatARS } from "@/lib/money";
import { Facts } from "../detail/Panel";
import { paymentLabel } from "../OrderCard";
import { paymentHref, PROOF_STATE, ProofActions } from "./ProofActions";

/** Un pago de la cola (8.3.7): comprobante a la izquierda, todos los datos y las acciones a la derecha; en el celular se apilan. */
export function PaymentCard({ order: o }: { order: AdminOrder }) {
  const proof = o.proof;
  return (
    <article aria-label={`Pago de ${o.code}`} className="animate-fade-up grid gap-4 rounded-3xl bg-surface p-4 shadow-[var(--shadow-card)] sm:grid-cols-[8.5rem_minmax(0,1fr)]">
      <Link href={paymentHref(o.code)} aria-label={`Abrir el pago de ${o.code}`} className="block max-w-40 rounded-xl focus-visible:outline-2 focus-visible:outline-primary">
        {proof ? <SampleProof fileName={proof.fileName} amount={formatARS(o.total)} /> : (
          <span className="grid aspect-[200/260] w-full place-items-center rounded-xl border border-dashed border-ink/20 bg-bg p-3 text-center text-xs font-bold text-muted">Sin comprobante todavía</span>
        )}
      </Link>
      <div className="flex min-w-0 flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Link href={paymentHref(o.code)} className="font-extrabold text-primary underline">{o.code}</Link>
          <StatusBadge status={o.status} />
          {proof && proof.status !== "IN_REVIEW" && <Badge tone={PROOF_STATE[proof.status].tone}>Comprobante: {PROOF_STATE[proof.status].label}</Badge>}
        </div>
        <Facts items={[
          ["Cliente", o.customer.name],
          ["Monto esperado", <span key="m" className="tabular-nums">{formatARS(o.total)}</span>],
          ["Medio", paymentLabel(o.paymentMethod)],
          [proof ? "Recibido" : "Pedido del", formatDateTime(proof?.receivedAt ?? o.createdAt)],
          ...(proof?.rejectReason ? [["Observaciones", `Motivo: ${proof.rejectReason}`] as [string, string]] : []),
        ]} />
        <ProofActions order={o} />
      </div>
    </article>
  );
}
