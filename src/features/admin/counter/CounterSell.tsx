"use client";
import { useState } from "react";
import { Sheet } from "@/components/motion/Sheet";
import type { CounterPot } from "@/demo/engine/counter";
import type { PayChoice } from "@/demo/engine/counter-pay";
import { useAdmin } from "@/stores/admin";
import { AdminPageHeader } from "../AdminPageHeader";
import { ChargeSheet } from "./ChargeSheet";
import { PotSearch } from "./PotSearch";
import { TicketBar } from "./TicketBar";
import { TicketPanel } from "./TicketPanel";
import { useCounterTicket } from "./useCounter";

/**
 * Mostrador · Vender (R4b): buscador grande, tarjetas de potes con precio, stock y el lote que sale, y el ticket siempre
 * a la vista (columna en pantallas anchas, barra fija en el celular). Cobrar registra la venta simulada y descuenta
 * cada pote de su lote FEFO. El motor es `engine/counter*.ts`.
 */
export function CounterSell() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<null | "ticket" | "charge">(null);
  const counter = useCounterTicket("volta-ui:counter-draft:ticket", query);
  const sell = useAdmin((s) => s.sellAtCounter);
  const { ticket } = counter;
  const onAdd = (pot: CounterPot) => counter.add(pot.productSlug, pot.variantId);
  const onSell = (choice: PayChoice) => {
    const r = sell(counter.lines, choice);
    if (r.ok) counter.clear();
    return r;
  };
  const panel = (titleId: string, className?: string, lines?: string) => (
    <TicketPanel ticket={ticket} onQty={counter.setQty} onClear={counter.clear} onCharge={() => setOpen("charge")} titleId={titleId} className={className} classNames={{ lines }} />
  );
  return (
    <div className="pb-24 lg:pb-0">
      <AdminPageHeader title="Mostrador">
        <p>Para vender en el local: buscá el producto, tocá el pote y cobrá. Cada tarjeta dice el precio, lo que queda y el lote que sale: siempre el que vence primero.</p>
        <p className="mt-3">El ticket aplica el mismo descuento stack que la tienda. Al cobrar elegís efectivo (con vuelto), transferencia, débito, crédito en un pago o en cuotas con recargo.</p>
        <p className="mt-3">Es una venta simulada: baja el stock de este navegador y queda en el cierre del día. No se cobra nada ni se emite factura.</p>
      </AdminPageHeader>
      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] xl:grid-cols-[minmax(0,1fr)_25rem]">
        <PotSearch id="mostrador-buscar" label="Buscar para vender" query={query} onQuery={setQuery} pots={counter.pots} lines={counter.lines} onAdd={onAdd} />
        <aside aria-label="Ticket" className="hidden lg:block">
          <div className="sticky top-24">{panel("ticket-titulo", "max-h-[calc(100dvh-7.5rem)]", "-mx-1 min-h-0 flex-1 overflow-y-auto px-1")}</div>
        </aside>
      </div>
      <TicketBar ticket={ticket} onOpen={() => setOpen("ticket")} onCharge={() => setOpen("charge")} />
      <Sheet open={open === "ticket"} onClose={() => setOpen(null)} title="Ticket" labelledBy="ticket-hoja" side="bottom" className="bg-bg">
        <div className="min-h-0 flex-1 overflow-y-auto p-3 pt-16">{panel("ticket-hoja")}</div>
      </Sheet>
      <ChargeSheet open={open === "charge"} onClose={() => setOpen(null)} ticket={ticket} plans={counter.catalog.plans} onSell={onSell} />
    </div>
  );
}
