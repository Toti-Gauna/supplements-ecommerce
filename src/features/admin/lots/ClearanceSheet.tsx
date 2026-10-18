"use client";
import { Check } from "lucide-react";
import { useId, useState } from "react";
import { Sheet } from "@/components/motion/Sheet";
import type { LotRow } from "@/demo/admin/lots";
import { lotDone, type LotDone } from "@/demo/admin/lot-drop";
import { formatExpiry } from "@/demo/engine/lots";
import { DEMO_TODAY } from "@/demo/fixtures/admin-orders";
import { cn } from "@/lib/cn";
import { useAdmin } from "@/stores/admin";
import { ComboTab } from "./ComboTab";
import { CouponTab } from "./CouponTab";
import { DropTab } from "./DropTab";
import { expiryText } from "./LotBadge";
import { LiquidateForm } from "./LiquidateForm";

export type LotTab = "liquidar" | "combo" | "cupon" | "drop";
const TABS: { id: LotTab; label: string; done?: keyof LotDone }[] = [
  { id: "liquidar", label: "Liquidar" }, { id: "combo", label: "Combo", done: "combo" }, { id: "cupon", label: "Cupón", done: "coupon" }, { id: "drop", label: "Drop", done: "drop" },
];

/**
 * Qué hacer con un lote que vence (Fase 6 + R4c): liquidarlo con descuento, armar un combo con otro producto, mandar un
 * cupón a quienes ya lo compraron o meterlo en el drop de la semana. Cada salida viene preparada: se revisa y se
 * confirma. Se usa desde Productos y stock y desde "Hoy en tu tienda", con el descuento propuesto.
 */
export function ClearanceSheet({ lot, suggestedPct, onClose }: { lot: LotRow | null; /** Descuento propuesto (Hoy en tu tienda). */ suggestedPct?: number; onClose: () => void }) {
  return (
    <Sheet open={!!lot} onClose={onClose} title={lot ? `Liquidar el lote ${lot.lot.code}` : "Liquidar lote"} side="dialog" className="bg-bg sm:max-w-xl">
      {lot && <LotActions key={lot.key} lot={lot} suggestedPct={suggestedPct} onClose={onClose} />}
    </Sheet>
  );
}

function LotActions({ lot, suggestedPct, onClose }: { lot: LotRow; suggestedPct?: number; onClose: () => void }) {
  const [tab, setTab] = useState<LotTab>("liquidar");
  const id = useId();
  const packs = useAdmin((s) => s.data.packs);
  const coupons = useAdmin((s) => s.data.coupons);
  const themes = useAdmin((s) => s.data.themes);
  const done = lotDone(lot, { packs, coupons, themes }, DEMO_TODAY);
  const name = `${lot.productName} · ${lot.variantLabel}`;
  return (
    <div className="flex max-h-[94dvh] flex-col sm:max-h-[90dvh]">
      <div className="flex flex-col gap-4 p-5 pb-4 pt-7 sm:px-7">
        <div className="pr-12">
          <p className="eyebrow text-warning">{expiryText(lot.days)}</p>
          <h2 className="font-display mt-1 text-3xl">Qué hacer con el lote</h2>
          <p className="mt-1 text-sm text-muted">{name}. <span className="font-lab">Lote {lot.lot.code} · vence {formatExpiry(lot.lot.expires)}</span> · {lot.lot.units} {lot.lot.units === 1 ? "unidad" : "unidades"}.</p>
        </div>
        <div role="tablist" aria-label="Qué hacer con el lote" className="flex flex-wrap gap-2">
          {TABS.map((t) => (
            <button key={t.id} type="button" role="tab" id={`${id}-${t.id}`} aria-selected={tab === t.id} aria-controls={`${id}-panel`} tabIndex={tab === t.id ? 0 : -1} onClick={() => setTab(t.id)}
              onKeyDown={(e) => { const i = TABS.findIndex((x) => x.id === tab); const n = e.key === "ArrowRight" ? i + 1 : e.key === "ArrowLeft" ? i - 1 : null; if (n !== null) { e.preventDefault(); const next = TABS[(n + TABS.length) % TABS.length]!; setTab(next.id); document.getElementById(`${id}-${next.id}`)?.focus(); } }}
              className={cn("inline-flex min-h-11 items-center gap-1.5 rounded-sm border px-4 text-sm font-bold focus-visible:outline-2 focus-visible:outline-primary", tab === t.id ? "border-primary bg-primary text-on-primary" : "border-line bg-surface")}>
              {t.label}{t.done && done[t.done] && <><Check size={14} aria-hidden="true" /><span className="sr-only"> (armado)</span></>}
            </button>
          ))}
        </div>
      </div>
      <div role="tabpanel" id={`${id}-panel`} aria-labelledby={`${id}-${tab}`} className="flex min-h-0 flex-1 flex-col">
        {tab === "liquidar" && <LiquidateForm lot={lot} suggestedPct={suggestedPct} onClose={onClose} />}
        {tab === "combo" && <ComboTab lot={lot} onClose={onClose} />}
        {tab === "cupon" && <CouponTab lot={lot} onClose={onClose} />}
        {tab === "drop" && <DropTab lot={lot} onClose={onClose} />}
      </div>
    </div>
  );
}
