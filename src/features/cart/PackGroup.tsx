"use client";
import { CalendarClock, PackageOpen } from "lucide-react";
import type { ReactNode } from "react";
import { Badge } from "@/components/atoms/Badge";
import { Button } from "@/components/atoms/Button";
import { completePackLines, monthlyDayOf } from "@/demo/engine/pack-cart";
import { packMissingItems, type PackDiscountEntry } from "@/demo/engine/packs";
import { useDemoData } from "@/stores/admin";
import { useCart } from "@/stores/cart";

/**
 * Un pack dentro del carrito: encabezado con su nombre ("todos los meses · día N" si es suscripción), "Quitar el pack"
 * y, si le sacaron un producto, el aviso de qué falta para el descuento con un botón para completarlo. Las líneas van adentro.
 */
export function PackGroup({ packId, entry, children }: { packId: string; entry?: PackDiscountEntry; children: ReactNode }) {
  const listed = useDemoData((d) => d.packs?.find((p) => p.id === packId));
  const custom = useCart((s) => s.customPacks?.find((p) => p.id === packId));
  const pack = listed ?? custom;
  const lines = useCart((s) => s.lines);
  const { addPack, removePack } = useCart();
  const group = lines.filter((l) => l.packId === packId);
  const day = monthlyDayOf(group);
  const missing = pack ? packMissingItems(lines, pack) : [];
  const name = pack?.name ?? "Pack";
  const complete = () => {
    if (!pack) return;
    const keep = group.map((l) => ({ productSlug: l.productSlug, variantId: l.variantId, quantity: l.quantity, packId, ...(l.monthlyDay !== undefined ? { monthlyDay: l.monthlyDay } : {}) }));
    addPack(packId, [...keep, ...completePackLines(lines, pack)], custom);
  };
  return (
    <li className="overflow-hidden border border-line bg-surface shadow-[var(--shadow-card)]" data-cart-pack={packId}>
      <div className="plate flex flex-wrap items-center justify-between gap-x-3 gap-y-2 px-4 py-3">
        <div className="min-w-0">
          <p className="eyebrow flex items-center gap-1.5 text-volt-ink"><PackageOpen size={14} aria-hidden="true" />Se lleva junto</p>
          <h3 className="font-display text-2xl leading-tight">{name}</h3>
          {day !== undefined && <p className="mt-0.5 flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.06em] text-muted"><CalendarClock size={13} aria-hidden="true" />Todos los meses · día {day}</p>}
        </div>
        <div className="flex items-center gap-2">
          {entry && <Badge tone="success">−{entry.pct} %</Badge>}
          <Button size="sm" variant="danger" onClick={() => removePack(packId)}>Quitar el pack<span className="sr-only"> {name}</span></Button>
        </div>
      </div>
      {missing.length > 0 && (
        <div role="status" className="flex flex-wrap items-center justify-between gap-2 border-t border-line bg-warning-soft px-4 py-2.5 text-sm font-bold text-warning">
          <span>Te falta {missing.join(", ")} para el descuento del pack.</span>
          <Button size="sm" variant="secondary" onClick={complete}>Completar el pack</Button>
        </div>
      )}
      <ul className="flex flex-col">{children}</ul>
    </li>
  );
}
