"use client";
import type { ReactNode } from "react";
import { describedBy, Field, Input } from "@/components/atoms/Field";
import { OptionCard } from "@/components/atoms/OptionCard";
import { Select } from "@/components/atoms/Select";
import { brand } from "@/config/brand";
import type { ChatErrors, ChatOrderDraft, ChatPay, OrderChannel } from "@/demo/engine/counter-chat";
import { METHOD_LABEL, type CounterMethod } from "@/demo/engine/counter-pay";
import type { FulfillmentType } from "@/demo/types";

/** Lo que se edita del pedido por chat (las líneas van aparte, con el buscador de potes). */
export type ChatForm = Omit<ChatOrderDraft, "lines">;

const CHANNELS: [OrderChannel, string][] = [["WHATSAPP", "WhatsApp"], ["INSTAGRAM", "Instagram"]];
const DELIVERY: [FulfillmentType, string, string][] = [
  ["PICKUP", "Retira en el local", "Sin costo de envío"], ["LOCAL_DELIVERY", `Cadete en ${brand.city}`, "Con la fecha del cupo del cadete"], ["SHIPPING", "Envío nacional", "Por correo"],
];
const PAYS: [ChatPay, string, string][] = [
  ["BANK_TRANSFER", "Transferencia", "Queda pendiente hasta que apruebes el comprobante"], ["QR_MANUAL", "QR", "Igual que la transferencia"],
  ["CHECKOUT_PRO", "Link de Mercado Pago", "Queda esperando la confirmación"], ["IN_HAND", "Cobrado en mano", "Efectivo o tarjeta en el local: solo si ya lo cobraste"],
];
const IN_HAND: CounterMethod[] = ["CASH", "DEBIT", "CREDIT"];

function Group({ legend, children }: { legend: string; children: ReactNode }) {
  return <fieldset className="flex flex-col gap-2"><legend className="eyebrow mb-2 text-muted">{legend}</legend>{children}</fieldset>;
}

interface Props { form: ChatForm; errors: ChatErrors; onEdit: (patch: Partial<ChatForm>) => void }

/** Canal y datos del cliente. */
export function ChatCustomerFields({ form, errors, onEdit }: Props) {
  return (
    <>
      <Group legend="Por dónde llegó">
        <div className="grid grid-cols-2 gap-2">
          {CHANNELS.map(([id, label]) => <OptionCard key={id} name="chat-canal" value={id} checked={form.channel === id} onChange={() => onEdit({ channel: id })} title={label} />)}
        </div>
      </Group>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="chat-nombre" label="Nombre del cliente" error={errors.name}>
          <Input id="chat-nombre" value={form.name} onChange={(e) => onEdit({ name: e.target.value })} autoComplete="off" aria-invalid={!!errors.name} aria-describedby={describedBy("chat-nombre", errors.name)} />
        </Field>
        <Field id="chat-telefono" label={form.channel === "WHATSAPP" ? "Teléfono" : "Usuario o teléfono"} error={errors.phone}>
          <Input id="chat-telefono" value={form.phone} onChange={(e) => onEdit({ phone: e.target.value })} autoComplete="off" aria-invalid={!!errors.phone} aria-describedby={describedBy("chat-telefono", errors.phone)} />
        </Field>
        <Field id="chat-email" label="Email (opcional)" hint="Si lo dejás, le llegan los emails del pedido (simulados)." error={errors.email} className="sm:col-span-2">
          <Input id="chat-email" type="email" value={form.email} onChange={(e) => onEdit({ email: e.target.value })} autoComplete="off" aria-invalid={!!errors.email} aria-describedby={describedBy("chat-email", errors.email, true)} />
        </Field>
      </div>
    </>
  );
}

/** Entrega (con dirección si no retira) y cobro, con sus reglas: nada queda pagado sin el dueño. */
export function ChatDeliveryPayFields({ form, errors, onEdit }: Props) {
  const proofable = form.pay === "BANK_TRANSFER" || form.pay === "QR_MANUAL";
  return (
    <>
      <Group legend="Entrega">
        {DELIVERY.map(([id, label, hint]) => <OptionCard key={id} name="chat-entrega" value={id} checked={form.fulfillment === id} onChange={() => onEdit({ fulfillment: id })} title={label} description={hint} />)}
      </Group>
      {form.fulfillment !== "PICKUP" && (
        <Field id="chat-direccion" label="Dirección de entrega" error={errors.address}>
          <Input id="chat-direccion" value={form.address} onChange={(e) => onEdit({ address: e.target.value })} autoComplete="off" aria-invalid={!!errors.address} aria-describedby={describedBy("chat-direccion", errors.address)} />
        </Field>
      )}
      <Group legend="Cómo paga">
        {PAYS.map(([id, label, hint]) => <OptionCard key={id} name="chat-pago" value={id} checked={form.pay === id} onChange={() => onEdit({ pay: id, collected: false, proofSent: false })} title={label} description={hint} />)}
      </Group>
      {proofable && (
        <label className="flex min-h-11 items-start gap-3 text-sm">
          <input type="checkbox" checked={form.proofSent} onChange={(e) => onEdit({ proofSent: e.target.checked })} className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--color-primary)]" />
          <span><span className="block font-bold">Ya mandó el comprobante por el chat</span><span className="block text-muted">Queda en revisión: lo aprobás en Pagos cuando veas el ingreso. Un comprobante nunca lo marca pagado.</span></span>
        </label>
      )}
      {form.pay === "IN_HAND" && (
        <div className="flex flex-col gap-3 rounded-sm border border-line bg-surface p-4">
          <Field id="chat-en-mano" label="Con qué pagó">
            <Select id="chat-en-mano" value={form.inHandMethod} onChange={(e) => onEdit({ inHandMethod: e.target.value as CounterMethod })}>
              {IN_HAND.map((m) => <option key={m} value={m}>{METHOD_LABEL[m]}</option>)}
            </Select>
          </Field>
          <label className="flex min-h-11 items-start gap-3 text-sm">
            <input type="checkbox" checked={form.collected} onChange={(e) => onEdit({ collected: e.target.checked })} aria-invalid={!!errors.collected} aria-describedby={errors.collected ? "chat-cobro-error" : undefined} className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--color-primary)]" />
            <span className="font-bold">Confirmo que ya lo cobré en mano</span>
          </label>
          {errors.collected && <p id="chat-cobro-error" role="alert" className="text-sm font-semibold text-danger">{errors.collected}</p>}
        </div>
      )}
    </>
  );
}
