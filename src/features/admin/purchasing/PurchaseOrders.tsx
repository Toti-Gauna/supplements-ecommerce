"use client";
import { Badge } from "@/components/atoms/Badge";
import { Button } from "@/components/atoms/Button";
import { ConfirmButton } from "@/components/molecules/ConfirmButton";
import type { PurchaseOrder } from "@/demo/admin/workshop/purchasing";
import { formatDateTime, formatDay } from "@/lib/date";
import { formatARS } from "@/lib/money";
import { useAdmin } from "@/stores/admin";
import { useDemoSave } from "../useDemoSave";

const RECEIVED_SHOWN = 5;

/** Pedidos hechos a proveedores: los que faltan recibir (recibir o anular) y los últimos recibidos. */
export function PurchaseOrders() {
  const { purchases, suppliers } = useAdmin((s) => s.workshop);
  const { receivePurchase, cancelPurchase } = useAdmin();
  const save = useDemoSave();
  const supplierName = (id: string) => suppliers.find((s) => s.id === id)?.name ?? id;
  const units = (p: PurchaseOrder) => p.lines.reduce((n, l) => n + l.qty, 0);
  const list = [...purchases.filter((p) => p.status === "ordered"), ...purchases.filter((p) => p.status === "received").slice(0, RECEIVED_SHOWN)];
  return (
    <section aria-labelledby="po-title" className="flex flex-col gap-3">
      <h2 id="po-title" className="font-display text-2xl">Pedidos hechos</h2>
      <ul className="flex flex-col gap-2">
        {list.map((p) => (
          <li key={p.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-sm bg-surface p-4 text-sm shadow-[var(--shadow-card)]">
            <span className="min-w-0 flex-1 basis-56">
              <span className="flex flex-wrap items-center gap-2 font-bold">{supplierName(p.supplierId)}
                {p.status === "ordered" ? <Badge tone="warning">Pedido, sin recibir</Badge> : <Badge tone="success">Recibido</Badge>}
              </span>
              <span className="block text-muted">
                {p.lines.length} {p.lines.length === 1 ? "producto" : "productos"} · {units(p)} unidades · {formatARS(p.total)} al costo · pedido el {formatDateTime(p.createdAt)}
                {p.status === "ordered" && p.expectedOn ? ` · llega el ${formatDay(p.expectedOn)}` : ""}
              </span>
            </span>
            {p.status === "ordered" && (
              <span className="flex flex-wrap gap-2">
                <Button variant="ghost" size="sm" onClick={() => save("Pedido anulado: vuelve a la compra sugerida", () => cancelPurchase(p.id))}>Anular<span className="sr-only"> el pedido a {supplierName(p.supplierId)}</span></Button>
                <ConfirmButton size="sm" title={`Recibir el pedido de ${supplierName(p.supplierId)}`} confirmLabel="Sumar al stock"
                  description={`Suma ${units(p)} unidades al stock de cada presentación pedida. Si el producto maneja lotes, cargá el lote nuevo desde Productos y stock.`}
                  onConfirm={() => save("Mercadería recibida: stock actualizado", () => receivePurchase(p.id))}>
                  Recibir mercadería<span className="sr-only"> de {supplierName(p.supplierId)}</span>
                </ConfirmButton>
              </span>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
