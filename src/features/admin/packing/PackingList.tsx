"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { TriangleAlert } from "lucide-react";
import { useEffect } from "react";
import { EmptyState } from "@/components/molecules/EmptyState";
import { HelpList } from "@/components/molecules/Help";
import { PREPARATION_HELP } from "@/demo/admin/help";
import { isLate } from "@/demo/admin/order-groups";
import { packQueue, type PackFilter } from "@/demo/admin/order-work";
import { materialRows } from "@/demo/admin/workshop/materials";
import { DEMO_TODAY } from "@/demo/fixtures/admin-orders";
import { plural } from "@/lib/plural";
import { useAdmin } from "@/stores/admin";
import { AdminPageHeader } from "../AdminPageHeader";
import { TabFilter } from "../table/TabFilter";
import { useTableState } from "../table/useTableState";
import { PackCard } from "./PackCard";

const FILTERS: { id: PackFilter; label: string }[] = [{ id: "todo", label: "Todos" }, { id: "juntar", label: "1 · Juntar" }, { id: "controlar", label: "2 · Controlar lote" }];

/**
 * Pedidos → Para armar (R4b), en la ruta de la vieja Preparación: los pedidos pagados en orden de despacho, cada uno con
 * su checklist de dos pasos. Reemplaza el tablero de cuatro columnas. `?codigo=` lleva a un pedido (enlaces de Hoy).
 */
export function PackingList() {
  const orders = useAdmin((s) => s.orders);
  const workshop = useAdmin((s) => s.workshop);
  const focus = useSearchParams().get("codigo");
  const state = useTableState("packing", { filterIds: ["paso"] });
  const filter = FILTERS.find((f) => f.id === state.filters.paso)?.id ?? "todo";
  const all = packQueue(orders);
  const list = packQueue(orders, filter);
  const counts: Record<PackFilter, number> = { todo: all.length, juntar: packQueue(orders, "juntar").length, controlar: packQueue(orders, "controlar").length };
  const late = all.filter((o) => isLate(o, DEMO_TODAY)).length;
  const ready = orders.filter((o) => o.status === "READY").length;
  const short = materialRows(workshop.materials, orders, workshop.recipes).filter((m) => m.state === "short");
  useEffect(() => {
    const card = focus ? document.getElementById(`armar-${focus}`) : null;
    if (!card) return;
    card.scrollIntoView({ block: "start", behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
    card.focus({ preventScroll: true });
  }, [focus]);
  return (
    <>
      <AdminPageHeader title="Para armar"><HelpList help={PREPARATION_HELP} stacked /></AdminPageHeader>
      <p className="mb-4 text-sm text-muted">
        {plural(all.length, "pedido pagado", "pedidos pagados")} para armar{late ? <> · <strong className="text-danger">{plural(late, "atrasado", "atrasados")}</strong></> : ""} · {plural(ready, "listo", "listos")} en <Link href="/admin-demo/despachos/" className="font-bold text-primary underline">Despachos</Link>
      </p>
      {short.length > 0 && (
        <p role="status" className="mb-4 flex flex-wrap items-center gap-2 rounded-sm bg-danger-soft p-3 text-sm font-bold text-danger">
          <TriangleAlert size={17} aria-hidden="true" /> No alcanzan {short.map((m) => m.name.toLowerCase()).join(", ")} para los pedidos por preparar.
          <Link href="/admin-demo/insumos/" className="underline">Ver insumos</Link>
        </p>
      )}
      <div className="mb-4">
        <TabFilter label="Paso" value={filter} onChange={(id) => state.setFilter("paso", id === "todo" ? "" : id)} tabs={FILTERS.map((f) => ({ ...f, count: counts[f.id] }))} />
      </div>
      {list.length ? (
        <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-3 lg:grid-cols-2 2xl:grid-cols-3">
          {list.map((o) => <PackCard key={o.code} order={o} today={DEMO_TODAY} highlight={o.code === focus} />)}
        </div>
      ) : (
        <EmptyState title="Nada para armar acá">Cuando apruebes un pago, el pedido aparece en el paso 1. Los listos están en Despachos.</EmptyState>
      )}
    </>
  );
}
