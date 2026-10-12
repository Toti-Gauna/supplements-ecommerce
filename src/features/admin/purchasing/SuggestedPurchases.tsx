"use client";
import { EmptyState } from "@/components/molecules/EmptyState";
import type { PurchaseGroup } from "@/demo/admin/workshop/purchasing";
import { formatARS } from "@/lib/money";
import { useAdmin } from "@/stores/admin";
import { PurchaseGroupCard } from "./PurchaseGroupCard";
import { PurchaseOrders } from "./PurchaseOrders";

/** Compra sugerida: una tarjeta por proveedor con su total al costo, y debajo los pedidos hechos que faltan recibir. */
export function SuggestedPurchases({ groups }: { groups: PurchaseGroup[] }) {
  const purchases = useAdmin((s) => s.workshop.purchases);
  const total = groups.reduce((s, g) => s + g.total, 0);
  return (
    <div className="flex flex-col gap-6">
      {groups.length ? (
        <section aria-labelledby="buy-title" className="flex flex-col gap-3">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <h2 id="buy-title" className="font-display text-2xl">Para pedir</h2>
            <p className="text-sm text-muted">Total al costo: <strong className="tabular-nums text-ink">{formatARS(total)}</strong></p>
          </div>
          <ul className="grid grid-cols-[minmax(0,1fr)] gap-4 xl:grid-cols-2">
            {groups.map((g) => <li key={g.supplier?.id ?? "sin-proveedor"} className="flex"><PurchaseGroupCard group={g} /></li>)}
          </ul>
        </section>
      ) : (
        <EmptyState title="Nada para comprar">
          Todas las variantes están sobre su stock mínimo o ya las pediste. Ajustá los mínimos en la pestaña “Stock mínimo”.
        </EmptyState>
      )}
      {purchases.length > 0 && <PurchaseOrders />}
    </div>
  );
}
