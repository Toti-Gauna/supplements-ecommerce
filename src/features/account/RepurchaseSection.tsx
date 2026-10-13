"use client";
import Link from "next/link";
import { BellOff, RotateCcw } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { BatteryMeter } from "@/components/molecules/BatteryMeter";
import { LineThumb } from "@/components/organisms/LineThumb";
import { getProduct } from "@/demo/engine/catalog";
import { remainingPct } from "@/demo/engine/repurchase";
import { DEMO_TODAY } from "@/demo/fixtures/admin-orders";
import { formatDay } from "@/lib/date";
import { useCart } from "@/stores/cart";
import { useReminders } from "@/stores/reminders";
import { useUi } from "@/stores/ui";

/** "2 por día" o, si es menos de uno por día, "4 por semana". */
const rate = (perDay: number) => (perDay >= 1 ? `${perDay} por día` : `${Math.round(perDay * 7)} por semana`);

/** Avisos de recompra pedidos (desde la ficha o la confirmación): cuánto queda, cuándo avisamos y recompra en un toque. */
export function RepurchaseSection() {
  const items = useReminders((s) => s.items);
  const remove = useReminders((s) => s.remove);
  const add = useCart((s) => s.add);
  const openCart = useUi((s) => s.openCart);
  if (items.length === 0) {
    return (
      <div className="rounded-sm border border-dashed border-line p-5 text-sm text-muted">
        <p>Todavía no pediste avisos. Activalos al confirmar un pedido o desde la calculadora <strong className="text-ink">¿Cuánto te dura?</strong> de cada ficha: te avisamos 5 días antes de que se termine el pote.</p>
        <Link href="/p/ionic-whey/" className="mt-3 inline-block font-bold text-primary underline">Probalo con una proteína</Link>
      </div>
    );
  }
  return (
    <ul className="flex flex-col gap-3" aria-label="Avisos de recompra">
      {items.map((r) => {
        const product = getProduct(r.slug);
        const variant = product?.variants.find((v) => v.id === r.variantId);
        const pct = remainingPct(r, DEMO_TODAY);
        return (
          <li key={r.id} className="flex gap-3 rounded-sm border border-line bg-surface p-3 sm:gap-4 sm:p-4">
            {product && <div className="w-16 shrink-0 sm:w-20"><LineThumb art={product.art} pack={product.pack} tint={variant?.colorHex} name={product.name} /></div>}
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <p className="font-bold leading-snug">{r.name}</p>
              <p className="text-[13px] text-muted">{r.variant} · <span className="font-lab">{rate(r.perDay)}</span></p>
              <BatteryMeter pct={pct} label={`Queda cerca del ${Math.round(pct)} % de ${r.name}`} tone={pct <= 20 ? "danger" : "volt"} className="mt-1 max-w-56" />
              <p className="text-[13px]">Te avisamos el <strong>{formatDay(r.remindOn, "dayMonth")}</strong> · se termina el {formatDay(r.runsOutOn, "dayMonth")}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Button size="sm" disabled={!variant || variant.stock === 0} onClick={() => { add({ productSlug: r.slug, variantId: r.variantId, quantity: 1 }); openCart(r.slug); }}>
                  <RotateCcw size={16} aria-hidden="true" />Recomprar
                </Button>
                <Button size="sm" variant="ghost" onClick={() => remove(r.id)}><BellOff size={16} aria-hidden="true" />Quitar aviso</Button>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
