"use client";
import { ScanBarcode, ShieldCheck } from "lucide-react";
import type { FormEvent } from "react";
import { Button } from "@/components/atoms/Button";
import { Sheet } from "@/components/motion/Sheet";
import type { AdminOrder } from "@/demo/admin/types";
import { LotCheckRow } from "./LotCheckRow";
import { useLotCheck } from "./useLotCheck";

interface Props { order: AdminOrder | null; onClose: () => void }

/**
 * Control de lote (Fase 7) en un panel, desde la ficha del pedido: una casilla por producto con el lote que tiene que
 * salir (el que vence primero). Con todas marcadas, el pedido queda listo para despachar. En Para armar el mismo
 * control va dentro de la tarjeta (paso 2).
 */
export function LotCheckSheet({ order, onClose }: Props) {
  return (
    <Sheet open={!!order} onClose={onClose} title={order ? `Control de lote de ${order.code}` : "Control de lote"} side="dialog" className="bg-bg sm:w-[min(94vw,620px)]">
      {order && <LotCheckForm key={order.code} order={order} onClose={onClose} />}
    </Sheet>
  );
}

function LotCheckForm({ order, onClose }: { order: AdminOrder; onClose: () => void }) {
  const lots = useLotCheck(order, onClose);
  const submit = (e: FormEvent) => { e.preventDefault(); lots.submit(); };
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
          {lots.items.map((item, i) => (
            <LotCheckRow key={item.line.id} idBase={`hoja-${order.code}`} item={item} checked={lots.checked.has(item.line.id)} onChange={(on) => lots.toggle(item.line.id, on)} autoFocus={i === 0} />
          ))}
        </fieldset>
        {lots.error && <p role="alert" className="text-sm font-bold text-danger">Marcá el lote de cada producto para pasarlo a Listo para despachar.</p>}
      </div>
      <div className="flex flex-wrap items-center gap-2 border-t border-line bg-surface px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-7">
        <p aria-live="polite" className="mr-auto flex items-center gap-1.5 text-sm font-bold"><ShieldCheck size={16} aria-hidden="true" className={lots.done === lots.items.length ? "text-success" : "text-muted"} />{lots.done} de {lots.items.length} controlados</p>
        <Button variant="ghost" onClick={onClose}>Cancelar</Button>
        <Button type="submit">Listo para despachar</Button>
      </div>
    </form>
  );
}
