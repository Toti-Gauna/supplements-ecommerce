"use client";
import { useSearchParams } from "next/navigation";
import { Landmark } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/atoms/Button";
import { EmptyState } from "@/components/molecules/EmptyState";
import { HelpList } from "@/components/molecules/Help";
import { Pagination } from "@/components/molecules/Pagination";
import { PAYMENT_QUEUE_HELP } from "@/demo/admin/help";
import { amountToCollect, collectGroups, collectQueue, type CollectFilter } from "@/demo/admin/order-work";
import { paginate } from "@/demo/admin/table";
import { formatARS } from "@/lib/money";
import { plural } from "@/lib/plural";
import { useAdmin } from "@/stores/admin";
import { AdminPageHeader } from "../AdminPageHeader";
import { CollectionDialog } from "../payments/CollectionDialog";
import { PaymentCard } from "../payments/PaymentCard";
import { TabFilter } from "../table/TabFilter";
import { useTableState } from "../table/useTableState";
import { CollectReview } from "./CollectReview";

const FILTERS: { id: CollectFilter; label: string }[] = [
  { id: "todo", label: "Todo por cobrar" }, { id: "review", label: "Comprobantes por revisar" }, { id: "waiting", label: "Sin pagar" }, { id: "done", label: "Resueltos" },
];

/**
 * Pedidos → Por cobrar (R4b), en la ruta de los viejos Pagos manuales: comprobantes por revisar y pedidos sin pagar en
 * modo revisión, de a uno. El filtro va en la URL (`?estado=review|waiting|done`, los mismos de antes) y `?codigo=`
 * arranca en un pedido. Aprobar siempre pide confirmar el ingreso: un comprobante nunca marca el pago solo.
 */
export function CollectQueue() {
  const orders = useAdmin((s) => s.orders);
  const initial = useSearchParams().get("codigo");
  const state = useTableState("payments", { filterIds: ["estado"] });
  const [collecting, setCollecting] = useState(false);
  const filter = FILTERS.find((f) => f.id === state.filters.estado)?.id ?? "todo";
  const groups = collectGroups(orders);
  const items = collectQueue(groups, filter);
  const counts: Record<CollectFilter, number> = { todo: groups.review.length + groups.waiting.length, review: groups.review.length, waiting: groups.waiting.length, done: groups.done.length };
  const page = paginate(groups.done, state.page, 10);
  return (
    <>
      <AdminPageHeader title="Por cobrar" actions={<Button variant="secondary" onClick={() => setCollecting(true)}><Landmark size={17} aria-hidden="true" /> Configurar datos de cobro</Button>}>
        <p className="mb-3">Primero los comprobantes que subieron tus clientes y después los pedidos sin pagar. Aprobá recién cuando veas la plata en tu cuenta; si no coincide, rechazalo con el motivo.</p>
        <HelpList help={PAYMENT_QUEUE_HELP} stacked />
      </AdminPageHeader>
      <p className="mb-4 text-sm text-muted">
        Falta cobrar <strong className="tabular-nums text-ink">{formatARS(amountToCollect(orders))}</strong> · {plural(counts.review, "comprobante por revisar", "comprobantes por revisar")} · {counts.waiting} sin pagar
      </p>
      <div className="mb-4">
        <TabFilter label="Qué cobrar" value={filter} onChange={(id) => state.setFilter("estado", id === "todo" ? "" : id)} tabs={FILTERS.map((f) => ({ ...f, count: counts[f.id] }))} />
      </div>
      {filter === "done" ? (
        <div aria-live="polite" className="flex flex-col gap-3">
          {page.items.length === 0 && <EmptyState title="Todavía no resolviste comprobantes">Cuando apruebes o rechaces uno, queda acá con su motivo.</EmptyState>}
          {page.items.map((o) => <PaymentCard key={o.code} order={o} />)}
          <Pagination {...page} noun="pagos" onPage={state.setPage} />
        </div>
      ) : items.length ? (
        <CollectReview key={filter} items={items} initial={initial} />
      ) : (
        <EmptyState title="Nada por cobrar acá">Cuando un cliente sube un comprobante o hace un pedido sin pagar, aparece en esta fila.</EmptyState>
      )}
      <CollectionDialog open={collecting} onClose={() => setCollecting(false)} />
    </>
  );
}
