import { Timer } from "lucide-react";
import { BadgeGlyph } from "@/components/illustrations/BadgeGlyph";
import { formatExpiry, type Clearance } from "@/demo/engine/lots";
import type { ProductBadge } from "@/demo/types";
import { formatARS } from "@/lib/money";

const BADGE_LABEL: Record<ProductBadge, string> = {
  "sin-tacc": "Sin TACC", vegano: "Vegano", "sin-azucar": "Sin azúcar", keto: "Keto", "marca-propia": "Marca propia", "sin-cafeina": "Sin cafeína",
};

/** Sellos del rótulo (sin TACC, vegano, sin azúcar…), cada uno con su ícono. */
export function ProductBadges({ badges }: { badges: ProductBadge[] }) {
  if (badges.length === 0) return null;
  return (
    <ul aria-label="Sellos" className="flex flex-wrap gap-1.5 sm:gap-2">
      {badges.map((b) => (
        <li key={b} className="inline-flex items-center gap-1.5 rounded-sm border border-line bg-surface px-2 py-1 text-[11px] font-bold sm:px-3 sm:py-1.5 sm:text-xs">
          <BadgeGlyph badge={b} className="h-3.5 w-3.5 text-volt-ink sm:h-4 sm:w-4" />{BADGE_LABEL[b]}
        </li>
      ))}
    </ul>
  );
}

/** Liquidación por vencimiento: precio de lista tachado y el sello con el vencimiento del lote. */
export function ClearanceTag({ clearance }: { clearance: Clearance }) {
  return (
    <span className="flex w-full flex-wrap items-center gap-x-3 gap-y-1">
      <span className="font-lab inline-flex items-center gap-1.5 rounded-sm bg-warning-soft px-3 py-1 text-xs font-extrabold text-warning ring-1 ring-warning/30">
        <Timer size={14} aria-hidden="true" />Liquidación · vence {formatExpiry(clearance.lot.expires)}
      </span>
      <span className="text-sm text-muted"><span className="sr-only">Precio de lista: </span><s className="font-semibold tabular-nums">{formatARS(clearance.listPrice)}</s> <strong className="text-ink">−{clearance.pct} %</strong> · quedan {clearance.lot.units} a este precio</span>
    </span>
  );
}
