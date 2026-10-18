"use client";
import { ShieldCheck, Undo2 } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import type { AdminOrder } from "@/demo/admin/types";
import { useAdmin } from "@/stores/admin";
import { useToasts } from "@/stores/toast";
import { LotCheckRow } from "../preparation/LotCheckRow";
import { useLotCheck } from "../preparation/useLotCheck";

/**
 * Paso 2 de Para armar: el lote y el vencimiento de cada pote, contra la etiqueta (el mismo control de lote de la
 * ficha). Con todo controlado el pedido queda Listo y pasa a Despachos; si falta un pote, se vuelve al paso 1.
 */
export function LotStep({ order }: { order: AdminOrder }) {
  const lots = useLotCheck(order);
  const movePreparation = useAdmin((s) => s.movePreparation);
  const push = useToasts((s) => s.push);
  const back = () => {
    const failed = movePreparation(order.code, "picking");
    push(failed ? { tone: "error", title: "No se pudo volver", description: failed } : { tone: "info", title: `${order.code} volvió al paso 1`, description: "Juntá de nuevo los potes. El embalaje no se descuenta otra vez." });
  };
  return (
    <form noValidate onSubmit={(e) => { e.preventDefault(); lots.submit(); }} className="flex flex-col gap-2">
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-sm font-bold">Paso 2 · Controlá lote y vencimiento</legend>
        {lots.items.map((item) => (
          <LotCheckRow key={item.line.id} idBase={order.code} item={item} checked={lots.checked.has(item.line.id)} onChange={(on) => lots.toggle(item.line.id, on)} />
        ))}
      </fieldset>
      {lots.error && <p role="alert" className="text-sm font-bold text-danger">Marcá el lote de cada producto para pasarlo a Listo para despachar.</p>}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <p aria-live="polite" className="mr-auto flex items-center gap-1.5 text-sm font-bold">
          <ShieldCheck size={16} aria-hidden="true" className={lots.done === lots.items.length ? "text-success" : "text-muted"} />
          <span className="tabular-nums">{lots.done} de {lots.items.length}</span> controlados
        </p>
        <Button variant="ghost" size="sm" onClick={back}><Undo2 size={15} aria-hidden="true" /> Volver a juntar</Button>
        <Button type="submit" size="sm">Listo para despachar</Button>
      </div>
    </form>
  );
}
