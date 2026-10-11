"use client";
import { Landmark } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/atoms/Button";
import { EmptyState } from "@/components/molecules/EmptyState";
import { HelpButton, HelpPanel } from "@/components/molecules/Help";
import { Pagination } from "@/components/molecules/Pagination";
import { PAYMENT_QUEUE_HELP } from "@/demo/admin/help";
import { paginate } from "@/demo/admin/table";
import { useAdmin } from "@/stores/admin";
import { AdminPageHeader } from "../AdminPageHeader";
import { TabFilter } from "../table/TabFilter";
import { useTableState } from "../table/useTableState";
import { CollectionDialog } from "./CollectionDialog";
import { PaymentCard } from "./PaymentCard";

type Tab = "review" | "waiting" | "done";
const TABS: [Tab, string][] = [["review", "Por revisar"], ["waiting", "Esperando comprobante"], ["done", "Resueltos"]];

/**
 * Pagos manuales (8.3.7, 8.3.8, 8.3.30): cola de transferencias y QR con filtro por estado en la URL, diez por página,
 * comprobante a la izquierda y datos a la derecha. Sin "Auditoría de muestra" (los registros siguen en el store).
 */
export function PaymentsQueue() {
  const orders = useAdmin((s) => s.orders);
  const state = useTableState("payments", { filterIds: ["estado"] });
  const [help, setHelp] = useState(false);
  const [collecting, setCollecting] = useState(false);
  const tab = (state.filters.estado || "review") as Tab;
  const manual = orders.filter((o) => o.paymentMethod !== "CHECKOUT_PRO");
  const groups: Record<Tab, typeof orders> = {
    review: manual.filter((o) => o.status === "PAYMENT_REVIEW"),
    waiting: manual.filter((o) => o.status === "PENDING_PAYMENT"),
    done: manual.filter((o) => o.proof && o.proof.status !== "IN_REVIEW"),
  };
  const page = paginate(groups[tab], state.page, 10);
  return (
    <>
      <AdminPageHeader title="Pagos manuales" actions={<Button variant="secondary" onClick={() => setCollecting(true)}><Landmark size={17} aria-hidden="true" /> Configurar datos de cobro</Button>}>
        Transferencias y QR estático. Aprobar o rechazar es manual y simulado: subir un comprobante nunca marca el pedido como pagado.
      </AdminPageHeader>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <TabFilter label="Estado de los pagos" value={tab} onChange={(t) => state.setFilter("estado", t === "review" ? "" : t)} tabs={TABS.map(([id, label]) => ({ id, label, count: groups[id].length }))} />
        <HelpButton label="estados de los pagos" open={help} controls="pay-help" onToggle={() => setHelp(!help)} />
      </div>
      {help && <HelpPanel id="pay-help" help={PAYMENT_QUEUE_HELP} onClose={() => setHelp(false)} className="mb-4" />}
      <div aria-live="polite" className="flex flex-col gap-3">
        {page.items.length === 0 && <EmptyState title="Nada en esta lista">Cuando un comprador sube un comprobante, aparece en “Por revisar”.</EmptyState>}
        {page.items.map((o) => <PaymentCard key={o.code} order={o} />)}
      </div>
      <Pagination {...page} noun="pagos" onPage={state.setPage} />
      <CollectionDialog open={collecting} onClose={() => setCollecting(false)} />
    </>
  );
}
