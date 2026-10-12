"use client";
import { ScanBarcode, ShieldCheck } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/atoms/Button";
import { Sheet } from "@/components/motion/Sheet";
import { LineThumb } from "@/components/organisms/LineThumb";
import { lotFor } from "@/demo/admin/workshop/lots";
import type { AdminOrder } from "@/demo/admin/types";
import { getProduct } from "@/demo/engine/catalog";
import { cn } from "@/lib/cn";
import { useAdmin } from "@/stores/admin";
import { useToasts } from "@/stores/toast";

interface Props { order: AdminOrder | null; onClose: () => void }

/**
 * Control de lote (Fase 7): una casilla por producto con el lote que tiene que salir (el que vence primero). Con todas
 * marcadas, el pedido queda listo para despachar y el lote de cada línea queda registrado en el pedido.
 */
export function LotCheckSheet({ order, onClose }: Props) {
  return (
    <Sheet open={!!order} onClose={onClose} title={order ? `Control de lote de ${order.code}` : "Control de lote"} side="dialog" className="bg-bg sm:w-[min(94vw,620px)]">
      {order && <LotCheckForm key={order.code} order={order} onClose={onClose} />}
    </Sheet>
  );
}

function LotCheckForm({ order, onClose }: { order: AdminOrder; onClose: () => void }) {
  const confirmLots = useAdmin((s) => s.confirmLots);
  const push = useToasts((s) => s.push);
  const items = order.lines.map((line) => {
    const product = getProduct(line.productSlug);
    const variant = product?.variants.find((v) => v.id === line.variantId);
    return { line, product, variant, lot: lotFor(product, variant) };
  });
  const [checked, setChecked] = useState<Set<string>>(() => new Set(Object.keys(order.lotCheck ?? {})));
  const [error, setError] = useState(false);
  const done = items.filter((i) => checked.has(i.line.id)).length;
  const toggle = (id: string, on: boolean) => { const next = new Set(checked); if (on) next.add(id); else next.delete(id); setChecked(next); setError(false); };
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (done < items.length) { setError(true); return; }
    const failed = confirmLots(order.code, Object.fromEntries(items.map((i) => [i.line.id, i.lot.text])));
    if (failed) push({ tone: "error", title: "No se pudo despachar", description: failed });
    else push({ tone: "success", title: `${order.code} está listo para despachar`, description: "Lotes registrados en el pedido. Cambio guardado solo en esta demo (este navegador)." });
    if (!failed) onClose();
  };
  return (
    <form noValidate onSubmit={submit} className="flex max-h-[94dvh] flex-col sm:max-h-[90dvh]">
      <div className="flex flex-col gap-4 overflow-y-auto p-5 pt-7 sm:p-7">
        <header className="pr-12">
          <p className="eyebrow flex items-center gap-1.5 text-volt-ink"><ScanBarcode size={14} aria-hidden="true" /> Control de lote</p>
          <h2 className="font-display mt-1 text-3xl">{order.code} · {order.customer.name}</h2>
          <p className="mt-1 text-sm text-muted">Sacá el pote que vence primero y confirmá que el lote coincide con la etiqueta. Queda anotado en el pedido.</p>
        </header>
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-2 text-sm font-bold">Productos del pedido</legend>
          {items.map(({ line, product, variant, lot }, i) => (
            <label key={line.id} className={cn("flex cursor-pointer items-center gap-3 rounded-2xl bg-surface p-3 shadow-[var(--shadow-card)] ring-1 transition-colors", checked.has(line.id) ? "ring-success" : "ring-ink/[0.06] hover:ring-ink/20")}>
              <input type="checkbox" checked={checked.has(line.id)} onChange={(e) => toggle(line.id, e.target.checked)} data-autofocus={i === 0 ? true : undefined}
                aria-describedby={`lot-${line.id}`} className="h-5 w-5 shrink-0 accent-primary" />
              {product && <span className="w-12 shrink-0"><LineThumb art={product.art} pack={product.pack} tint={variant?.colorHex} name={product.name} /></span>}
              <span className="min-w-0 flex-1 text-sm">
                <span className="block font-bold">{line.quantity} × {product?.name ?? line.productSlug}</span>
                {variant && <span className="block text-muted">{variant.label}</span>}
                <span id={`lot-${line.id}`} className={cn("font-lab mt-1 inline-block rounded-md px-2 py-0.5 text-xs font-bold", lot.code ? "bg-night text-volt" : "bg-warning-soft text-warning")}>
                  {lot.code ? `Lote ${lot.text}` : `${lot.text}: anotá el del pote que vence primero`}
                </span>
              </span>
            </label>
          ))}
        </fieldset>
        {error && <p role="alert" className="text-sm font-bold text-danger">Marcá el lote de cada producto para pasarlo a Listo para despachar.</p>}
      </div>
      <div className="flex flex-wrap items-center gap-2 border-t border-line bg-surface px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-7">
        <p aria-live="polite" className="mr-auto flex items-center gap-1.5 text-sm font-bold"><ShieldCheck size={16} aria-hidden="true" className={done === items.length ? "text-success" : "text-muted"} />{done} de {items.length} controlados</p>
        <Button variant="ghost" onClick={onClose}>Cancelar</Button>
        <Button type="submit">Listo para despachar</Button>
      </div>
    </form>
  );
}
