"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Landmark } from "lucide-react";
import { useState } from "react";
import { Button, ButtonLink } from "@/components/atoms/Button";
import { EmptyState } from "@/components/molecules/EmptyState";
import { SampleProof } from "@/components/molecules/SampleProof";
import { paymentTrack } from "@/demo/admin/order-tracks";
import { STATUS_LABEL } from "@/demo/engine/orders";
import { formatDateTime } from "@/lib/date";
import { formatARS } from "@/lib/money";
import { useAdmin } from "@/stores/admin";
import { profileHref } from "../customers/Reminders";
import { DetailHeader, TrackChip } from "../detail/DetailHeader";
import { Facts, Panel } from "../detail/Panel";
import { paymentLabel } from "../OrderCard";
import { CollectionDialog } from "./CollectionDialog";
import { PROOF_STATE, ProofActions } from "./ProofActions";

const PAYMENT_STEPS = ["PENDING_PAYMENT", "PAYMENT_REVIEW", "PAID"];

/**
 * Ficha de un pago manual (8.3.5, 8.3.7): el comprobante a la izquierda y todos sus datos, observaciones y acciones a
 * la derecha; en angosto se apilan. Aprobar o rechazar sigue siendo manual y simulado.
 */
export function PaymentDetail() {
  const code = useSearchParams().get("codigo") ?? "";
  const order = useAdmin((s) => s.orders.find((o) => o.code === code));
  const [collecting, setCollecting] = useState(false);
  if (!order) return <EmptyState title="No encontramos ese pago" action={<ButtonLink href="/admin-demo/pagos/">Ver pagos</ButtonLink>}>Revisá el código o reiniciá la demo.</EmptyState>;
  const proof = order.proof;
  const pay = paymentTrack(order);
  const history = order.log.filter((l) => PAYMENT_STEPS.includes(l.to) || (l.from && PAYMENT_STEPS.slice(0, 2).includes(l.from))).reverse();
  return (
    <div className="@container flex flex-col gap-6">
      <DetailHeader list={{ href: "/admin-demo/pagos/", label: "Pagos manuales" }} title={order.code} eyebrow={`Pago · ${paymentLabel(order.paymentMethod)}`}
        status={<><TrackChip label="Pago" value={pay.label} tone={pay.tone} />{proof && <TrackChip label="Comprobante" value={PROOF_STATE[proof.status].label} tone={PROOF_STATE[proof.status].tone} />}</>}
        aside={<><p className="text-xs font-bold text-muted">Monto esperado</p><p className="text-3xl font-extrabold tabular-nums">{formatARS(order.total)}</p></>}
        actions={<Button variant="secondary" size="sm" className="self-start" onClick={() => setCollecting(true)}><Landmark size={16} aria-hidden="true" /> Configurar datos de cobro</Button>} />
      <CollectionDialog open={collecting} onClose={() => setCollecting(false)} />
      {order.paymentMethod === "CHECKOUT_PRO" ? (
        <Panel title="Sin comprobante">
          <p className="text-sm text-muted">Este pedido se cobra con Mercado Pago: no lleva comprobante. En producción se confirma por webhook verificado, nunca a mano.</p>
          <Link href={`/admin-demo/pedidos/detalle/?codigo=${order.code}`} className="mt-3 inline-block text-sm font-bold text-primary underline">Ver el pedido</Link>
        </Panel>
      ) : (
        <div className="grid gap-6 @min-[48rem]:grid-cols-[minmax(0,20rem)_minmax(0,1fr)]">
          <figure aria-label="Comprobante" className="self-start rounded-[1.75rem] bg-surface p-4 shadow-[var(--shadow-card)]">
            {proof ? <SampleProof fileName={proof.fileName} amount={formatARS(order.total)} /> : (
              <span className="grid aspect-[200/260] w-full max-w-56 place-items-center rounded-xl border border-dashed border-ink/20 bg-bg p-4 text-center text-sm font-bold text-muted">El comprador todavía no subió un comprobante.</span>
            )}
          </figure>
          <div className="flex min-w-0 flex-col gap-6">
            <Panel title="Datos del pago">
              <Facts items={[
                ["Cliente", <span key="c">{order.customer.name} · <Link href={profileHref(order.customer.email)} className="text-primary underline">{order.customer.email}</Link></span>],
                ["Pedido", <span key="o"><Link href={`/admin-demo/pedidos/detalle/?codigo=${order.code}`} className="text-primary underline">{order.code}</Link> · {STATUS_LABEL[order.status]}</span>],
                ["Monto esperado", formatARS(order.total)],
                ["Medio", paymentLabel(order.paymentMethod)],
                ["Recibido", proof ? formatDateTime(proof.receivedAt) : "Sin comprobante"],
                ["Referencia", order.code],
                ["Observaciones", proof?.rejectReason ? `Motivo del rechazo: ${proof.rejectReason}` : proof?.status === "APPROVED" ? "Aprobado a mano después de verificar el ingreso (simulado)." : "Verificá el ingreso en la cuenta antes de aprobar."],
              ]} />
            </Panel>
            <Panel title="Revisión">
              {proof?.status === "IN_REVIEW" || order.status === "PENDING_PAYMENT" ? <ProofActions order={order} /> : <p className="text-sm text-muted">Este comprobante ya se resolvió. Si el comprador sube otro, vuelve a “Por revisar”.</p>}
            </Panel>
            <Panel title="Historial del cobro">
              <ol className="flex flex-col gap-3 border-l-2 border-line pl-4 text-sm">
                {history.map((l, i) => <li key={`${l.at}-${i}`}><p className="font-bold">{STATUS_LABEL[l.to]}</p><p className="text-xs text-muted">{formatDateTime(l.at)}{l.note ? ` · ${l.note}` : ""}</p></li>)}
              </ol>
            </Panel>
          </div>
        </div>
      )}
    </div>
  );
}
