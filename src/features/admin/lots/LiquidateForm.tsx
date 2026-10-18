"use client";
import { Tag, Undo2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Field";
import { liquidationProfit } from "@/demo/admin/live-costs";
import type { LotRow } from "@/demo/admin/lots";
import { landedCost } from "@/demo/admin/supplier-list/costs";
import { productHref } from "@/demo/engine/catalog";
import { CLEARANCE_LIMITS, clearancePrice, formatExpiry } from "@/demo/engine/lots";
import { cn } from "@/lib/cn";
import { formatARS } from "@/lib/money";
import { useAdmin } from "@/stores/admin";
import { useToasts } from "@/stores/toast";
import { useCostBook } from "../supplier-list/useCostBook";

const PRESETS = [10, 20, 30, 40, 50];
const chip = "inline-flex h-11 min-w-14 cursor-pointer items-center justify-center rounded-sm border px-4 text-sm font-bold has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary/50";

/**
 * "Liquidar con descuento" (Fase 6): elegís el % y ves el precio de liquidación y lo que se gana (o se pierde) antes de
 * confirmar. La lista no cambia, así que "Quitar liquidación" vuelve exactamente al precio de antes.
 */
export function LiquidateForm({ lot, suggestedPct, onClose }: { lot: LotRow; suggestedPct?: number; onClose: () => void }) {
  const setLotClearance = useAdmin((s) => s.setLotClearance);
  const product = useAdmin((s) => s.data.products.find((p) => p.slug === lot.productSlug));
  const push = useToasts((s) => s.push);
  const book = useCostBook();
  const current = lot.lot.clearancePct ?? null;
  const [pct, setPct] = useState(current ?? suggestedPct ?? 30);
  const valid = Number.isInteger(pct) && pct >= CLEARANCE_LIMITS.min && pct <= CLEARANCE_LIMITS.max;
  const price = clearancePrice(lot.listPrice, valid ? pct : CLEARANCE_LIMITS.min);
  const variant = product?.variants.find((v) => v.id === lot.variantId);
  const landed = product && variant ? landedCost(product, variant, book) : null;
  const result = liquidationProfit(lot.lot.units, lot.listPrice, landed, valid ? pct : CLEARANCE_LIMITS.min);
  const name = `${lot.productName} · ${lot.variantLabel}`;
  const apply = (next: number | null) => {
    setLotClearance(lot.productSlug, lot.variantId, lot.lot.code, next);
    push(next
      ? { tone: "success", title: `Lote ${lot.lot.code} en liquidación`, description: `${name} a ${formatARS(clearancePrice(lot.listPrice, next))} (−${next} %). Solo en esta demo.`, action: { label: "Ver en la tienda", href: productHref(lot.productSlug) } }
      : { tone: "info", title: "Liquidación quitada", description: `${name} vuelve a ${formatARS(lot.listPrice)}. Solo en esta demo.` });
    onClose();
  };
  return (
    <form noValidate onSubmit={(e) => { e.preventDefault(); if (valid) apply(pct); }} className="flex min-h-0 flex-1 flex-col">
      <div className="flex flex-col gap-5 overflow-y-auto px-5 pb-5 sm:px-7">
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
          {result.profit !== null && landed !== null && (
            <p data-liquidation-profit className={cn("mt-1 text-sm font-bold", result.profit < 0 ? "text-danger" : "text-volt")}>
              {result.profit < 0 ? "Si se vende todo, perdés " : "Si se vende todo, ganás "}{formatARS(Math.abs(result.profit))} ({result.units} u. × {formatARS(price)}, costo {formatARS(landed)}).
            </p>
          )}
          {result.ifExpires !== null && <p className="text-xs text-night-muted">Si el lote vence sin venderse, perdés {formatARS(Math.abs(result.ifExpires))}.</p>}
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
