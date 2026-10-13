"use client";
import { Tag, Undo2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Field";
import { Sheet } from "@/components/motion/Sheet";
import type { LotRow } from "@/demo/admin/lots";
import { stockMargin } from "@/demo/admin/stock";
import { productHref } from "@/demo/engine/catalog";
import { CLEARANCE_LIMITS, clearancePrice, formatExpiry } from "@/demo/engine/lots";
import { cn } from "@/lib/cn";
import { formatARS } from "@/lib/money";
import { useAdmin } from "@/stores/admin";
import { useToasts } from "@/stores/toast";
import { expiryText } from "./LotBadge";

const PRESETS = [10, 20, 30, 40, 50];
const chip = "inline-flex h-11 min-w-14 cursor-pointer items-center justify-center rounded-sm border px-4 text-sm font-bold has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary/50";

/**
 * "Liquidar con descuento" (Fase 6): elegís el % y ves el precio de liquidación antes de confirmar. La lista no cambia,
 * así que "Quitar liquidación" vuelve exactamente al precio de antes. Se usa desde Productos y stock y desde el inicio.
 */
export function ClearanceSheet({ lot, onClose }: { lot: LotRow | null; onClose: () => void }) {
  return (
    <Sheet open={!!lot} onClose={onClose} title={lot ? `Liquidar el lote ${lot.lot.code}` : "Liquidar lote"} side="dialog" className="bg-bg sm:max-w-xl">
      {lot && <ClearanceForm key={lot.key} lot={lot} onClose={onClose} />}
    </Sheet>
  );
}

function ClearanceForm({ lot, onClose }: { lot: LotRow; onClose: () => void }) {
  const setLotClearance = useAdmin((s) => s.setLotClearance);
  const push = useToasts((s) => s.push);
  const current = lot.lot.clearancePct ?? null;
  const [pct, setPct] = useState(current ?? 30);
  const valid = Number.isInteger(pct) && pct >= CLEARANCE_LIMITS.min && pct <= CLEARANCE_LIMITS.max;
  const price = clearancePrice(lot.listPrice, valid ? pct : CLEARANCE_LIMITS.min);
  const margin = stockMargin({ price, cost: lot.cost });
  const name = `${lot.productName} · ${lot.variantLabel}`;
  const apply = (next: number | null) => {
    setLotClearance(lot.productSlug, lot.variantId, lot.lot.code, next);
    push(next
      ? { tone: "success", title: `Lote ${lot.lot.code} en liquidación`, description: `${name} a ${formatARS(clearancePrice(lot.listPrice, next))} (−${next} %). Solo en esta demo.`, action: { label: "Ver en la tienda", href: productHref(lot.productSlug) } }
      : { tone: "info", title: "Liquidación quitada", description: `${name} vuelve a ${formatARS(lot.listPrice)}. Solo en esta demo.` });
    onClose();
  };
  return (
    <form noValidate onSubmit={(e) => { e.preventDefault(); if (valid) apply(pct); }} className="flex max-h-[94dvh] flex-col sm:max-h-[90dvh]">
      <div className="flex flex-col gap-5 overflow-y-auto p-5 pt-7 sm:p-7">
        <div className="pr-12">
          <p className="eyebrow text-warning">{expiryText(lot.days)}</p>
          <h2 className="font-display mt-1 text-3xl">Liquidar con descuento</h2>
          <p className="mt-1 text-sm text-muted">{name}. <span className="font-lab">Lote {lot.lot.code} · vence {formatExpiry(lot.lot.expires)}</span> · {lot.lot.units} {lot.lot.units === 1 ? "unidad" : "unidades"}.</p>
        </div>
        <fieldset className="flex flex-col gap-3">
          <legend className="mb-2 text-sm font-bold">Descuento</legend>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((n) => (
              <label key={n} className={cn(chip, pct === n ? "border-primary bg-primary text-on-primary" : "border-line bg-surface")}>
                <input type="radio" name="clearance-pct" value={n} checked={pct === n} onChange={() => setPct(n)} className="sr-only" />−{n} %
              </label>
            ))}
          </div>
          <label className="flex max-w-48 flex-col gap-1 text-sm font-bold">Otro porcentaje
            <Input type="number" inputMode="numeric" min={CLEARANCE_LIMITS.min} max={CLEARANCE_LIMITS.max} step={1} value={pct} aria-invalid={!valid} aria-describedby="clearance-pct-h"
              onChange={(e) => setPct(e.target.value === "" ? 0 : Number(e.target.value))} />
          </label>
          <p id="clearance-pct-h" className={cn("text-xs", valid ? "text-muted" : "font-bold text-danger")} role={valid ? undefined : "alert"}>
            Entre {CLEARANCE_LIMITS.min} % y {CLEARANCE_LIMITS.max} %, en números enteros.
          </p>
        </fieldset>
        <div role="status" aria-label="Vista previa del precio" className="flex flex-col gap-1 rounded-sm bg-night p-4 text-on-night">
          <p className="text-sm text-night-muted">En la tienda se va a ver</p>
          <p className="flex flex-wrap items-baseline gap-x-3"><s className="text-night-muted tabular-nums"><span className="sr-only">Precio de lista </span>{formatARS(lot.listPrice)}</s><span className="text-3xl font-extrabold tabular-nums text-volt">{formatARS(price)}</span></p>
          <p className="font-lab text-xs">Liquidación · vence {formatExpiry(lot.lot.expires)} · redondeado a $100</p>
          {margin !== null && <p className={cn("text-xs font-bold", margin < 0 ? "text-danger" : "text-night-muted")}>{margin < 0 ? `Queda por debajo del costo (${formatARS(lot.cost!)})` : `Margen con el costo del proveedor: ${margin} %`}</p>}
        </div>
        {!lot.firstOut && <p className="rounded-sm bg-warning-soft px-4 py-3 text-sm font-semibold text-warning">Este lote no es el que sale primero: el precio de liquidación se ve en la tienda cuando se terminen los lotes que vencen antes.</p>}
      </div>
      <div className="flex flex-wrap justify-end gap-2 border-t border-line bg-surface px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-7">
        {current && <Button variant="ghost" onClick={() => apply(null)} className="mr-auto"><Undo2 size={16} aria-hidden="true" /> Quitar liquidación</Button>}
        <Button variant="ghost" onClick={onClose}>Cancelar</Button>
        <Button type="submit" disabled={!valid || pct === current}><Tag size={16} aria-hidden="true" /> Liquidar a {formatARS(price)}</Button>
      </div>
    </form>
  );
}
