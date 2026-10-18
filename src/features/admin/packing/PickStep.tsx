"use client";
import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/atoms/Button";
import { LineThumb } from "@/components/organisms/LineThumb";
import type { AdminOrder } from "@/demo/admin/types";
import { getProduct } from "@/demo/engine/catalog";
import { cn } from "@/lib/cn";
import { useAdmin } from "@/stores/admin";
import { useToasts } from "@/stores/toast";
import { usePicks } from "./usePicks";

/**
 * Paso 1 de Para armar: tildar cada producto a medida que se saca del estante. Con todo junto, "Ya junté todo" pasa el
 * pedido al control de lote (en preparación) y descuenta su embalaje la primera vez.
 */
export function PickStep({ order }: { order: AdminOrder }) {
  const picks = usePicks(order.code);
  const movePreparation = useAdmin((s) => s.movePreparation);
  const push = useToasts((s) => s.push);
  const [error, setError] = useState(false);
  const count = order.lines.filter((l) => picks.picked.has(l.id)).length;
  const toggle = (id: string, on: boolean) => { picks.toggle(id, on); setError(false); };
  const finish = () => {
    if (count < order.lines.length) { setError(true); return; }
    const wasPaid = order.status === "PAID";
    const failed = movePreparation(order.code, "lot-check");
    if (failed) { push({ tone: "error", title: "No se pudo pasar al paso 2", description: failed }); return; }
    picks.clear();
    push({ tone: "success", title: `${order.code}: potes juntos`, description: `${wasPaid ? "Se descontó su embalaje. " : ""}Ahora controlá el lote y el vencimiento de cada uno. Cambio guardado solo en esta demo.` });
  };
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-2 text-sm font-bold">Paso 1 · Juntá los potes</legend>
      {order.lines.map((l) => {
        const p = getProduct(l.productSlug);
        const v = p?.variants.find((x) => x.id === l.variantId);
        const on = picks.picked.has(l.id);
        return (
          <label key={l.id} className={cn("flex cursor-pointer items-center gap-3 rounded-sm bg-bg p-2.5 ring-1 transition-colors", on ? "ring-success" : "ring-ink/[0.06] hover:ring-ink/20")}>
            <input type="checkbox" checked={on} onChange={(e) => toggle(l.id, e.target.checked)} className="h-5 w-5 shrink-0 accent-primary" />
            {p && <span className="w-11 shrink-0"><LineThumb art={p.art} pack={p.pack} tint={v?.colorHex} name={p.name} /></span>}
            <span className="min-w-0 flex-1 text-sm">
              <span className="block font-bold">{l.quantity} × {p?.name ?? l.productSlug}</span>
              {v && <span className="block text-muted">{v.label}</span>}
            </span>
          </label>
        );
      })}
      {error && <p role="alert" className="text-sm font-bold text-danger">Tildá cada producto a medida que lo juntás.</p>}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <p aria-live="polite" className="mr-auto text-sm font-bold"><span className="tabular-nums">{count} de {order.lines.length}</span> juntos</p>
        <Button size="sm" onClick={finish}>Ya junté todo <ArrowRight size={15} aria-hidden="true" /></Button>
      </div>
    </fieldset>
  );
}
