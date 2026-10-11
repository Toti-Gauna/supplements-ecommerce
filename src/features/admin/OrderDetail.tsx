"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Badge } from "@/components/atoms/Badge";
import { Button, ButtonLink } from "@/components/atoms/Button";
import { Textarea } from "@/components/atoms/Field";
import { EmptyState } from "@/components/molecules/EmptyState";
import { fulfillmentTrack, nextStep, paymentTrack } from "@/demo/admin/order-tracks";
import { STATUS_LABEL } from "@/demo/engine/orders";
import { formatDate, formatDateTime } from "@/lib/date";
import { formatARS } from "@/lib/money";
import { useAdmin } from "@/stores/admin";
import { profileHref } from "./customers/Reminders";
import { DetailHeader, TrackChip } from "./detail/DetailHeader";
import { OrderEmails } from "./detail/OrderEmails";
import { Facts, Panel } from "./detail/Panel";
import { fulfillmentLabel, paymentLabel } from "./OrderCard";
import { OrderItems } from "./OrderItems";
import { OrderStatusActions, PromiseDate } from "./OrderStatusActions";
import { paymentHref, PROOF_STATE, ProofActions } from "./payments/ProofActions";
import { useDemoSave } from "./useDemoSave";

/**
 * Ficha completa del pedido (8.3.5, 8.3.6): ID, estado de pago y de producción por separado y la próxima acción
 * arriba; después cliente, productos, pago y entrega; historial, notas y emails. Dos columnas solo si el ancho real alcanza.
 */
export function OrderDetail() {
  const code = useSearchParams().get("codigo") ?? "";
  const order = useAdmin((s) => s.orders.find((o) => o.code === code));
  const addNote = useAdmin((s) => s.addNote);
  const save = useDemoSave();
  const [note, setNote] = useState("");
  if (!order) return <EmptyState title="Pedido no encontrado en la demo" action={<ButtonLink href="/admin-demo/pedidos/">Ver pedidos</ButtonLink>}>Revisá el código o reiniciá la demo.</EmptyState>;
  const pay = paymentTrack(order);
  const ful = fulfillmentTrack(order);
  const step = nextStep(order);
  const manual = order.paymentMethod !== "CHECKOUT_PRO";
  return (
    <div className="@container flex flex-col gap-6">
      <DetailHeader list={{ href: "/admin-demo/pedidos/", label: "Pedidos" }} title={order.code} eyebrow={`Pedido ficticio · ${formatDateTime(order.createdAt)}`}
        status={<><TrackChip label="Pago" value={pay.label} tone={pay.tone} /><TrackChip label="Producción y entrega" value={ful.label} tone={ful.tone} /></>}
        aside={<><p className="text-xs font-bold text-muted">Total</p><p className="text-3xl font-extrabold tabular-nums">{formatARS(order.total)}</p></>} />
      <section aria-labelledby="o-next" className="flex flex-col gap-3 rounded-[1.75rem] bg-surface p-5 shadow-[var(--shadow-card)] ring-2 ring-primary/15">
        <div>
          <h2 id="o-next" className="eyebrow text-muted">Próxima acción</h2>
          <p className="mt-1 text-lg font-extrabold">{step ?? "Nada pendiente con este pedido."}</p>
        </div>
        {order.status === "PAYMENT_REVIEW" && (
          <Link href={paymentHref(order.code)} className="inline-flex items-center gap-1.5 self-start text-sm font-bold text-primary underline">Abrir el comprobante para revisarlo <ArrowRight size={15} aria-hidden="true" /></Link>
        )}
        <OrderStatusActions order={order} />
      </section>
      <div className="grid gap-6 @min-[60rem]:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <div className="flex min-w-0 flex-col gap-6">
          <Panel title="Cliente" action={<Link href={profileHref(order.customer.email)} className="text-sm font-bold text-primary underline">Ver ficha del cliente</Link>}>
            <Facts items={[["Nombre", order.customer.name], ["Email", order.customer.email], ["Teléfono", order.customer.phone]]} />
          </Panel>
          <Panel title="Productos y personalización aprobada"><OrderItems lines={order.lines} /></Panel>
          <Panel title="Pago" action={manual && order.proof ? <Link href={paymentHref(order.code)} className="text-sm font-bold text-primary underline">Ver comprobante</Link> : undefined}>
            <Facts items={[
              ["Medio", paymentLabel(order.paymentMethod)],
              ["Estado", pay.label],
              ...(manual && order.proof ? [["Comprobante", <span key="p" className="inline-flex flex-wrap items-center gap-2">{order.proof.fileName}<Badge tone={PROOF_STATE[order.proof.status].tone}>{PROOF_STATE[order.proof.status].label}</Badge></span>] as [string, ReactNode]] : []),
              ...(order.proof?.rejectReason ? [["Motivo del rechazo", order.proof.rejectReason] as [string, ReactNode]] : []),
            ]} />
            {!manual && <p className="mt-3 text-sm text-muted">Mercado Pago no lleva comprobante. En producción el pago se confirma por webhook verificado, nunca a mano.</p>}
            <div className="mt-3"><ProofActions order={order} /></div>
          </Panel>
          <Panel title="Entrega">
            <Facts items={[["Forma", fulfillmentLabel(order.fulfillment)], ...(order.address ? [["Dirección", order.address] as [string, string]] : []), ["Comprometido", order.promisedDate ? formatDate(order.promisedDate) : "Sin fecha"]]} />
            <div className="mt-4"><PromiseDate order={order} /></div>
          </Panel>
        </div>
        <div className="flex min-w-0 flex-col gap-6">
          <Panel title="Historial">
            <ol className="flex flex-col gap-3 border-l-2 border-line pl-4 text-sm">
              {[...order.log].reverse().map((l, i) => (
                <li key={`${l.at}-${i}`}><p className="font-bold">{STATUS_LABEL[l.to]}</p><p className="text-xs text-muted">{formatDateTime(l.at)}{l.note ? ` · ${l.note}` : ""}</p></li>
              ))}
            </ol>
          </Panel>
          <Panel title="Notas internas (ficticias)">
            <ul className="mb-3 flex flex-col gap-1.5 text-sm">{order.notes.length ? order.notes.map((n, i) => <li key={i} className="rounded-xl bg-accent/50 p-2.5">{n}</li>) : <li className="text-muted">Sin notas.</li>}</ul>
            <form onSubmit={(e) => { e.preventDefault(); if (!note.trim()) return; save("Nota agregada", () => addNote(order.code, note.trim())); setNote(""); }} className="flex flex-col gap-2">
              <label htmlFor="note" className="text-sm font-bold">Nueva nota (no la ve el comprador)</label>
              <Textarea id="note" value={note} onChange={(e) => setNote(e.target.value)} className="min-h-20" />
              <Button type="submit" variant="secondary" size="sm" className="self-start">Agregar nota</Button>
            </form>
          </Panel>
          <OrderEmails code={order.code} createdAt={order.createdAt} />
        </div>
      </div>
    </div>
  );
}
