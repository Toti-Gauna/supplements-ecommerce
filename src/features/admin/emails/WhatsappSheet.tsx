"use client";
import { MessageCircle } from "lucide-react";
import { Sheet } from "@/components/motion/Sheet";
import type { AdminOrder } from "@/demo/admin/types";
import { waMessage } from "@/demo/admin/whatsapp";
import type { WaMessageId } from "@/demo/fixtures/whatsapp";
import { ChipEditorsProvider } from "./ChipEditor";
import { WhatsappEditor } from "./WhatsappEditor";

/** Editar el WhatsApp de un estado desde la lista de emails (R4b): el mismo editor que en la plantilla, en un panel. */
export function WhatsappSheet({ id, orders, onClose }: { id: WaMessageId | null; orders: AdminOrder[]; onClose: () => void }) {
  const msg = id ? waMessage(id) : null;
  return (
    <Sheet open={!!id} onClose={onClose} title={msg ? `WhatsApp: ${msg.label}` : "WhatsApp"} labelledBy="wa-sheet-t" side="right" className="max-w-xl bg-bg">
      {msg && (
        <ChipEditorsProvider>
          <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-5 pt-6 sm:p-6">
            <div className="pr-12">
              <p className="eyebrow flex items-center gap-1.5 text-volt-ink"><MessageCircle size={14} aria-hidden="true" /> Versión WhatsApp</p>
              <h2 id="wa-sheet-t" className="font-display mt-1 text-3xl">{msg.label}</h2>
              <p className="mt-1 text-sm text-muted">{msg.hint} Se manda a mano desde Pedidos con “Escribirle por WhatsApp”: tocá un dato para sumarlo como ficha.</p>
            </div>
            <WhatsappEditor key={msg.id} id={msg.id} orders={orders} />
          </div>
        </ChipEditorsProvider>
      )}
    </Sheet>
  );
}
