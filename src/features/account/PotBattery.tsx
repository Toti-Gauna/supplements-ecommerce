"use client";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { BatteryMeter } from "@/components/molecules/BatteryMeter";
import { LineThumb } from "@/components/organisms/LineThumb";
import { getProduct } from "@/demo/engine/catalog";
import { remainingPct, type Pot } from "@/demo/engine/repurchase";
import { runOutLineForBuyer } from "@/demo/admin/repurchase-text";
import { DEMO_TODAY } from "@/demo/fixtures/admin-orders";
import { cn } from "@/lib/cn";

const STATE_TEXT: Record<Pot["state"], string> = { overdue: "Se terminó", week: "Se termina esta semana", later: "En uso" };

/** Un pote en uso como batería que se descarga sola desde que llegó, con "Recomprar" en un toque. */
export function PotBattery({ pot, onRebuy }: { pot: Pot; onRebuy: () => void }) {
  const product = getProduct(pot.slug);
  const variant = product?.variants.find((v) => v.id === pot.variantId);
  const pct = remainingPct(pot, DEMO_TODAY);
  const low = pot.state !== "later";
  return (
    <li className={cn("flex gap-3 rounded-sm border bg-surface p-3 sm:gap-4 sm:p-4", low ? "border-warning/50" : "border-line")}>
      {product && <div className="w-16 shrink-0 sm:w-20"><LineThumb art={product.art} pack={product.pack} tint={variant?.colorHex} name={product.name} /></div>}
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className={cn("font-mono text-[11px] font-bold uppercase tracking-[0.08em]", low ? "text-warning" : "text-volt-ink")}>{STATE_TEXT[pot.state]}</p>
        <p className="font-bold leading-snug">{pot.product}</p>
        <p className="text-[13px] text-muted">{pot.variant} · del pedido {pot.orderCode}</p>
        <div className="mt-1 flex items-center gap-2">
          <BatteryMeter pct={pct} label={`Queda cerca del ${pct} % de ${pot.product}`} tone={pct <= 20 ? "danger" : "volt"} className="max-w-56 flex-1" />
          <span className="font-mono text-[12px] font-bold tabular-nums">{pct} %</span>
        </div>
        <p className="text-[13px]">{runOutLineForBuyer(pot)}</p>
        <Button size="sm" variant={low ? "primary" : "secondary"} className="mt-1 self-start" disabled={!variant || variant.stock === 0} onClick={onRebuy}>
          <RotateCcw size={16} aria-hidden="true" />Recomprar
        </Button>
      </div>
    </li>
  );
}
