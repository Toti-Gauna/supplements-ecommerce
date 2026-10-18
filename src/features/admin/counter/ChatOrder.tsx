"use client";
import { useRef, useState, type FormEvent } from "react";
import { Button, ButtonLink } from "@/components/atoms/Button";
import type { CounterPot } from "@/demo/engine/counter";
import { chatCartLines, chatQuoteOptions, emptyChatDraft, type ChatErrors, type ChatOrderDraft } from "@/demo/engine/counter-chat";
import { STATUS_LABEL } from "@/demo/engine/orders";
import { quoteCart } from "@/demo/engine/pricing";
import { cn } from "@/lib/cn";
import { formatARS } from "@/lib/money";
import { useAdmin } from "@/stores/admin";
import { AdminPageHeader } from "../AdminPageHeader";
import { useSessionDraft } from "../useSessionDraft";
import { ChatCustomerFields, ChatDeliveryPayFields, type ChatForm } from "./ChatOrderFields";
import { ChatOrderList } from "./ChatOrderList";
import { PotSearch } from "./PotSearch";
import { TicketLines } from "./TicketLines";
import { useCounterTicket } from "./useCounter";

function emptyForm(): ChatForm {
  const d: Partial<ChatOrderDraft> = emptyChatDraft();
  delete d.lines;
  return d as ChatForm;
}
const EMPTY = emptyForm();
const isForm = (x: unknown): x is ChatForm => { const f = x as ChatForm | null; return !!f && typeof f.name === "string" && typeof f.phone === "string" && typeof f.pay === "string" && typeof f.fulfillment === "string"; };
function SummaryRow({ label, value, className }: { label: string; value: string; className?: string }) {
  return <div className={cn("flex justify-between gap-3", className)}><dt>{label}</dt><dd className="font-lab tabular-nums">{value}</dd></div>;
}

/**
 * Mostrador · Pedido por chat (R4b, canal WhatsApp/Instagram): el pedido que se cerró por mensaje entra como uno más
 * del panel, con su origen. El total sale de la misma cotización de la tienda (stack, descuento por transferencia y
 * envío). Nunca queda pagado solo: el cobro en mano lo confirma el dueño.
 */
export function ChatOrder() {
  const [query, setQuery] = useState("");
  const counter = useCounterTicket("volta-ui:counter-draft:chat", query);
  const session = useSessionDraft<ChatForm>("volta-ui:counter-draft:chat-form", EMPTY, isForm);
  const create = useAdmin((s) => s.createChatOrder);
  const created = useAdmin((s) => s.orders);
  const [errors, setErrors] = useState<ChatErrors>({});
  const [done, setDone] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const form = session.draft;
  const quote = quoteCart(chatCartLines(counter.lines), chatQuoteOptions(form));
  const edit = (patch: Partial<ChatForm>) => { session.setDraft((prev) => ({ ...prev, ...patch })); setErrors({}); };
  const onAddPot = (pot: CounterPot) => { counter.add(pot.productSlug, pot.variantId); setErrors({}); };
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const r = create({ ...form, lines: counter.lines });
    if (!r.ok) {
      setErrors(r.errors);
      requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>("[aria-invalid=true], [data-lines-error]")?.focus());
      return;
    }
    setDone(r.code); setErrors({}); counter.clear(); session.reset(EMPTY);
  };
  const order = done ? created.find((o) => o.code === done) : undefined;
  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader title="Pedido por chat">
        <p>Cuando un cliente te compra por WhatsApp o Instagram, cargalo acá: entra en Pedidos como cualquier otro, con el canal a la vista, y sigue el mismo camino (cobro, preparación y entrega).</p>
        <p className="mt-3">Con transferencia o QR queda pendiente hasta que apruebes el comprobante; si ya te lo mandó por el chat, queda en revisión. Solo queda pagado si confirmás que lo cobraste en mano.</p>
      </AdminPageHeader>
      {done && order ? (
        <div role="status" data-chat-done={done} className="flex flex-col gap-3 rounded-sm border border-success/40 bg-success-soft p-5 text-success">
          <p className="font-display text-3xl">Pedido {done} cargado</p>
          <p className="font-bold">Estado: {STATUS_LABEL[order.status]} · {formatARS(order.total)}</p>
          <div className="flex flex-wrap gap-2">
            <ButtonLink href={`/admin-demo/pedidos/detalle/?codigo=${done}`}>Ver el pedido</ButtonLink>
            <Button variant="secondary" onClick={() => setDone(null)}>Cargar otro pedido</Button>
          </div>
        </div>
      ) : (
        <form ref={formRef} onSubmit={submit} noValidate className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="flex min-w-0 flex-col gap-6">
            <ChatCustomerFields form={form} errors={errors} onEdit={edit} />
            <section aria-labelledby="chat-productos" className="flex flex-col gap-3">
              <h2 id="chat-productos" className="font-display text-3xl">Productos</h2>
              {counter.ticket.rows.length > 0 && <TicketLines rows={counter.ticket.rows} onQty={counter.setQty} noun="pedido" className="rounded-sm border border-line bg-surface p-4" />}
              {errors.lines && <p role="alert" tabIndex={-1} data-lines-error className="text-sm font-semibold text-danger">{errors.lines}</p>}
              <PotSearch id="chat-buscar" label="Sumar productos" query={query} onQuery={setQuery} pots={counter.pots.slice(0, 9)} lines={counter.lines}
                onAdd={onAddPot} classNames={{ grid: "xl:grid-cols-2" }} />
            </section>
            <ChatDeliveryPayFields form={form} errors={errors} onEdit={edit} />
          </div>
          <aside aria-label="Resumen del pedido" className="lg:sticky lg:top-24 lg:self-start">
            <div className="flex flex-col gap-3 rounded-sm border border-line bg-surface p-4 shadow-[var(--shadow-card)] sm:p-5">
              <h2 className="font-display text-3xl">Resumen</h2>
              <dl className="flex flex-col gap-1 text-sm">
                <SummaryRow label="Subtotal" value={formatARS(quote.subtotal)} />
                {quote.stack.discount > 0 && <SummaryRow label={`Descuento stack (−${quote.stack.pct} %)`} value={`−${formatARS(quote.stack.discount)}`} className="text-success" />}
                {quote.transferDiscount > 0 && <SummaryRow label="Descuento transferencia/QR" value={`−${formatARS(quote.transferDiscount)}`} className="text-success" />}
                <SummaryRow label="Envío" value={quote.shippingCost ? formatARS(quote.shippingCost) : "Sin costo"} />
                <div className="mt-1 flex items-end justify-between gap-3 border-t border-line pt-2"><dt className="eyebrow text-ink">Total</dt><dd data-chat-total className="font-lab text-3xl font-bold tabular-nums">{formatARS(quote.total)}</dd></div>
              </dl>
              <Button type="submit" size="lg" className="w-full">Cargar pedido</Button>
              <p className="text-xs text-muted">Entra en Pedidos de esta demo. Nada le llega de verdad al cliente.</p>
            </div>
          </aside>
        </form>
      )}
      <ChatOrderList />
    </div>
  );
}
