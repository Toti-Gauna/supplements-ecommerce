import { ShieldCheck, Timer } from "lucide-react";
import { BadgeGlyph } from "@/components/illustrations/BadgeGlyph";
import { firstOutLot, formatExpiry, type Clearance } from "@/demo/engine/lots";
import { pricePerServing } from "@/demo/engine/servings";
import type { ProductBadge, Product, Variant } from "@/demo/types";
import { formatARS } from "@/lib/money";

const BADGE_LABEL: Record<ProductBadge, string> = {
  "sin-tacc": "Sin TACC", vegano: "Vegano", "sin-azucar": "Sin azúcar", keto: "Keto", "marca-propia": "Marca propia", "sin-cafeina": "Sin cafeína",
};

/** Sellos del rótulo (sin TACC, vegano, sin azúcar…), cada uno con su ícono. */
export function ProductBadges({ badges }: { badges: ProductBadge[] }) {
  if (badges.length === 0) return null;
  return (
    <ul aria-label="Sellos" className="flex flex-wrap gap-2">
      {badges.map((b) => (
        <li key={b} className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1.5 text-xs font-bold">
          <BadgeGlyph badge={b} className="h-4 w-4 text-volt-ink" />{BADGE_LABEL[b]}
        </li>
      ))}
    </ul>
  );
}

/** "$ 1.830 por servicio · 30 servicios": el dato que más se compara entre suplementos. */
export function ServingPrice({ price, servings }: { price: number; servings?: number }) {
  const pps = pricePerServing(price, servings);
  if (pps === null || !servings || servings < 2) return null;
  return (
    <p className="font-lab inline-flex items-center gap-2 rounded-full bg-night px-3 py-1 text-xs font-bold text-on-night ring-1 ring-volt/30">
      <span className="text-volt">{formatARS(pps)}</span> por servicio <span className="text-night-muted">· {servings} servicios</span>
    </p>
  );
}

/** Lote y vencimiento del envase que te llevás: el lote de la variante que sale primero (FEFO). */
export function LotNote({ product, variant }: { product: Product; variant: Variant }) {
  const lot = firstOutLot(variant) ?? product.lot;
  if (!lot) return null;
  return (
    <p className="font-lab flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
      <ShieldCheck size={15} aria-hidden="true" className="text-success" />
      <span>Lote <strong className="text-ink">{lot.code}</strong></span>
      <span aria-hidden="true">·</span>
      <span>Vence <strong className="text-ink">{formatExpiry(lot.expires)}</strong></span>
      <span aria-hidden="true">·</span>
      <span>{product.brand}</span>
    </p>
  );
}

/** Liquidación por vencimiento: precio de lista tachado y el sello con el vencimiento del lote. */
export function ClearanceTag({ clearance }: { clearance: Clearance }) {
  return (
    <span className="flex w-full flex-wrap items-center gap-x-3 gap-y-1">
      <span className="font-lab inline-flex items-center gap-1.5 rounded-full bg-warning-soft px-3 py-1 text-xs font-extrabold text-warning ring-1 ring-warning/30">
        <Timer size={14} aria-hidden="true" />Liquidación · vence {formatExpiry(clearance.lot.expires)}
      </span>
      <span className="text-sm text-muted"><span className="sr-only">Precio de lista: </span><s className="font-semibold tabular-nums">{formatARS(clearance.listPrice)}</s> <strong className="text-ink">−{clearance.pct} %</strong> · quedan {clearance.lot.units} a este precio</span>
    </span>
  );
}
