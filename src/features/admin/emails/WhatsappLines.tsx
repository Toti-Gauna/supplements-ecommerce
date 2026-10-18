"use client";
import { MessageCircle, PencilLine } from "lucide-react";
import type { AdminOrder } from "@/demo/admin/types";
import { waOnly, waSampleOrder, waTextFor } from "@/demo/admin/whatsapp";
import type { WaMessage, WaMessageId } from "@/demo/fixtures/whatsapp";
import { useWhatsappTexts } from "@/stores/whatsapp";

interface LineProps { message: WaMessage; orders: AdminOrder[]; onEdit: (id: WaMessageId) => void }

/** La versión WhatsApp de un estado, armada con un pedido real, y el botón para editarla (en la tarjeta del email). */
export function WhatsappLine({ message, orders, onEdit }: LineProps) {
  const texts = useWhatsappTexts((s) => s.texts);
  const sample = waSampleOrder(message.id, orders);
  return (
    <div data-wa-line={message.id} className="rounded-sm bg-bg p-3 text-sm ring-1 ring-success/30">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-xs font-bold text-success"><MessageCircle size={13} aria-hidden="true" />WhatsApp{texts[message.id] ? " · editado" : ""}</span>
        <button type="button" onClick={() => onEdit(message.id)} aria-label={`Editar el WhatsApp: ${message.label}`}
          className="inline-flex min-h-9 items-center gap-1 rounded-sm px-2 text-xs font-bold text-primary underline hover:bg-accent">
          <PencilLine size={13} aria-hidden="true" /> Editar WhatsApp
        </button>
      </div>
      <p className="mt-1 line-clamp-3">{sample ? waTextFor(sample, texts, message.id) : ""}</p>
    </div>
  );
}

/** Estados sin email automático (reclamo, cancelado, devuelto): solo tienen su WhatsApp. */
export function WhatsappOnlyList({ orders, onEdit }: { orders: AdminOrder[]; onEdit: (id: WaMessageId) => void }) {
  return (
    <section aria-labelledby="solo-whatsapp" className="mb-8">
      <h2 id="solo-whatsapp" className="font-display text-2xl">Solo por WhatsApp</h2>
      <p className="mb-3 text-sm text-muted">Estados que no mandan email. El mensaje se manda a mano desde Pedidos, con “Escribirle por WhatsApp”.</p>
      <ul className="grid grid-cols-[minmax(0,1fr)] gap-3 md:grid-cols-2 xl:grid-cols-3">
        {waOnly().map((m) => (
          <li key={m.id} className="flex flex-col gap-2 rounded-sm bg-surface p-4 shadow-[var(--shadow-card)] ring-1 ring-ink/[0.04]">
            <span className="eyebrow text-muted">Estado del pedido</span>
            <span className="text-lg font-extrabold leading-snug">{m.label}</span>
            <span className="text-sm text-muted">{m.hint}</span>
            <WhatsappLine message={m} orders={orders} onEdit={onEdit} />
          </li>
        ))}
      </ul>
    </section>
  );
}
